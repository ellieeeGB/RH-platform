"""Planes manuales separados de la encuesta, con control de acceso y versiones."""
from datetime import date,datetime,timezone
from typing import Literal
from pydantic import BaseModel,Field,ConfigDict,model_validator
from sqlalchemy import select,update
from fastapi import HTTPException
from .modelos import PlanVacante,EventoPlan,Hecho,como_dict
from .servicio import activa,seudonimo,auditar

class AccionPlan(BaseModel):
    model_config=ConfigDict(extra='forbid',str_strip_whitespace=True)
    tarea:str=Field(min_length=1,max_length=300)
    area:str=Field(default='',max_length=100)
    fecha:date|None=None
    hecha:bool=False

class EntradaPlan(BaseModel):
    model_config=ConfigDict(extra='forbid',str_strip_whitespace=True)
    importacion:int=Field(gt=0,strict=True)
    empresa:str=Field(min_length=1,max_length=40)
    bimestre:str=Field(pattern=r'^\d{4}-(01|03|05|07|09|11)$')
    puesto:str=Field(min_length=2,max_length=160)
    nivel:Literal['operativo','tecnico','administrativo','gerencial','otro']='operativo'
    plazas:int=Field(ge=1,le=100000,strict=True)
    cubiertas:int=Field(default=0,ge=0,le=100000,strict=True)
    prioridad:Literal['alta','media','baja']='media'
    estado:Literal['por_iniciar','en_curso','bloqueada','cubierta','archivada']='por_iniciar'
    fecha_objetivo:date|None=None
    notas:str=Field(default='',max_length=5000)
    acciones:list[AccionPlan]=Field(default_factory=list,max_length=30)
    revision:int|None=Field(default=None,ge=1,strict=True)

    @model_validator(mode='after')
    def coherencia(self):
        if self.cubiertas>self.plazas:raise ValueError('Las plazas cubiertas no pueden superar el total.')
        if self.estado=='cubierta' and self.cubiertas!=self.plazas:raise ValueError('Para cerrar la vacante deben estar cubiertas todas las plazas.')
        if self.cubiertas==self.plazas and self.estado!='archivada':self.estado='cubierta'
        return self

def alcance(db,u):
    imp=activa(db)
    if not imp:raise HTTPException(409,'Carga un estudio antes de crear un plan.')
    q=select(PlanVacante).where(PlanVacante.importacion_id==imp.id)
    if u.rol=='cliente':q=q.where(PlanVacante.empresa==u.empresa)
    return imp,q

def buscar(db,u,id):
    imp,q=alcance(db,u)
    p=db.scalar(q.where(PlanVacante.id==id))
    if not p:raise HTTPException(404,'Plan no disponible en este estudio.')
    return imp,p

def salida(p,u):
    r=como_dict(p);r['pendientes']=p.plazas-p.cubiertas
    if u.rol=='cliente':r['empresa']=seudonimo(p.empresa);r['empresa_id']='propia'
    else:r['empresa_id']=p.empresa
    return r

def listar(db,u,empresas=None,periodos=None,archivadas=False):
    if not activa(db):return {'planes':[],'importacion':None}
    imp,q=alcance(db,u)
    if u.rol!='cliente' and empresas:q=q.where(PlanVacante.empresa.in_(empresas))
    if periodos:q=q.where(PlanVacante.bimestre.in_(periodos))
    if not archivadas:q=q.where(PlanVacante.estado!='archivada')
    return {'planes':[salida(p,u) for p in db.scalars(q.order_by(PlanVacante.actualizado.desc()))],
            'importacion':imp.id}

def guardar(db,u,body,id=None):
    imp=activa(db)
    if not imp or body.importacion!=imp.id:raise HTTPException(409,'El estudio cambió. Recarga antes de guardar.')
    company=body.empresa
    if u.rol=='cliente':
        if company!='propia':raise HTTPException(403,'Solo puedes planificar vacantes de tu empresa.')
        company=u.empresa
    exists=db.scalar(select(Hecho.id).where(Hecho.importacion_id==imp.id,Hecho.empresa==company,Hecho.bimestre==body.bimestre).limit(1))
    if not exists:raise HTTPException(422,'La empresa y el bimestre deben pertenecer al estudio activo.')
    values=body.model_dump(mode='json',exclude={'importacion','revision'})
    values['empresa']=company
    now=datetime.now(timezone.utc).isoformat()
    if id is None:
        p=PlanVacante(**values,importacion_id=imp.id,revision=1,creado=now,actualizado=now)
        db.add(p);db.flush()
    else:
        _,p=buscar(db,u,id)
        if body.revision is None:raise HTTPException(422,'Falta la versión del plan.')
        if company!=p.empresa or body.bimestre!=p.bimestre:raise HTTPException(422,'La empresa y el bimestre de origen no se pueden cambiar al editar.')
        changed=db.execute(update(PlanVacante).where(PlanVacante.id==p.id,PlanVacante.revision==body.revision).values(**values,revision=body.revision+1,actualizado=now))
        if changed.rowcount!=1:raise HTTPException(409,'Otra persona actualizó el plan. Recarga para conservar sus cambios.')
        db.refresh(p)
    db.add(EventoPlan(plan_id=p.id,revision=p.revision,fecha=now,actor=u.nombre,datos=como_dict(p)))
    auditar(db,u.nombre,'crear_plan' if id is None else 'actualizar_plan',{'plan':p.id,'empresa':company,'importacion':imp.id,'revision':p.revision})
    db.commit();return salida(p,u)

def historial(db,u,id):
    buscar(db,u,id)
    result=[]
    for e in db.scalars(select(EventoPlan).where(EventoPlan.plan_id==id).order_by(EventoPlan.revision.desc())):
        data=dict(e.datos)
        if u.rol=='cliente':data['empresa']=seudonimo(u.empresa)
        result.append({'revision':e.revision,'fecha':e.fecha,'actor':e.actor if u.rol!='cliente' else ('Tu usuario' if e.actor==u.nombre else 'Equipo autorizado'),'datos':data})
    return result
