"""Esquema v2: estudio agregado por empresa; no simula empleados inexistentes."""
from sqlalchemy import create_engine, String, Text, Integer, Float, Boolean, ForeignKey, JSON, Index, UniqueConstraint
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker
from pathlib import Path
import os

class Base(DeclarativeBase): pass

class Empresa(Base):
    __tablename__='empresas'
    codigo:Mapped[str]=mapped_column(String(40),primary_key=True)

class Periodo(Base):
    __tablename__='periodos'
    codigo:Mapped[str]=mapped_column(String(7),primary_key=True)

class Importacion(Base):
    __tablename__='importaciones'
    id:Mapped[int]=mapped_column(primary_key=True)
    huella:Mapped[str]=mapped_column(String(64),unique=True)
    activa:Mapped[bool]=mapped_column(Boolean,default=True)
    perfil:Mapped[list]=mapped_column(JSON)
    diccionario:Mapped[dict]=mapped_column(JSON)
    incidencias_fuente:Mapped[list]=mapped_column(JSON)
    revision:Mapped[int]=mapped_column(default=1)

class Hecho(Base):
    __tablename__='hechos'
    id:Mapped[int]=mapped_column(primary_key=True)
    importacion_id:Mapped[int]=mapped_column(ForeignKey('importaciones.id'),index=True)
    empresa:Mapped[str]=mapped_column(ForeignKey('empresas.codigo'))
    bimestre:Mapped[str]=mapped_column(ForeignKey('periodos.codigo'))
    metrica:Mapped[str]=mapped_column(String(100))
    dimension:Mapped[str]=mapped_column(Text)
    valor:Mapped[float|None]=mapped_column(Float,nullable=True)
    texto:Mapped[str|None]=mapped_column(Text,nullable=True)
    estado:Mapped[str]=mapped_column(String(60))
    clave:Mapped[str]=mapped_column(String(20))
    unidad:Mapped[str]=mapped_column(String(40))
    categoria:Mapped[str]=mapped_column(String(40))
    grupo_100:Mapped[str]=mapped_column(String(80))
    hoja:Mapped[str]=mapped_column(String(30))
    fila:Mapped[int]=mapped_column(Integer)
    columna:Mapped[int]=mapped_column(Integer)
    excluido:Mapped[bool]=mapped_column(Boolean,default=False)
    __table_args__=(Index('ix_hecho_empresa_periodo_metrica','empresa','bimestre','metrica'),UniqueConstraint('importacion_id','hoja','fila','columna'))

class Usuario(Base):
    __tablename__='usuarios'
    id:Mapped[int]=mapped_column(primary_key=True)
    nombre:Mapped[str]=mapped_column(String(100),unique=True)
    hash:Mapped[str]=mapped_column(Text)
    rol:Mapped[str]=mapped_column(String(20))
    empresa:Mapped[str|None]=mapped_column(String(40),nullable=True)
    fallos:Mapped[int]=mapped_column(default=0)
    bloqueado_hasta:Mapped[float]=mapped_column(Float,default=0)

class Sesion(Base):
    __tablename__='sesiones'
    id:Mapped[str]=mapped_column(String(64),primary_key=True)
    usuario_id:Mapped[int]=mapped_column(ForeignKey('usuarios.id'))
    refresh_hash:Mapped[str]=mapped_column(String(64))
    csrf:Mapped[str]=mapped_column(String(64))
    vence:Mapped[float]=mapped_column(Float)

class Auditoria(Base):
    __tablename__='auditoria'
    id:Mapped[int]=mapped_column(primary_key=True)
    fecha:Mapped[str]=mapped_column(String(40))
    actor:Mapped[str]=mapped_column(String(100))
    accion:Mapped[str]=mapped_column(String(80))
    detalle:Mapped[dict]=mapped_column(JSON)

class PlanVacante(Base):
    __tablename__='planes_vacantes'
    id:Mapped[int]=mapped_column(primary_key=True)
    importacion_id:Mapped[int]=mapped_column(ForeignKey('importaciones.id'),index=True)
    empresa:Mapped[str]=mapped_column(ForeignKey('empresas.codigo'),index=True)
    bimestre:Mapped[str]=mapped_column(ForeignKey('periodos.codigo'))
    puesto:Mapped[str]=mapped_column(String(160))
    nivel:Mapped[str]=mapped_column(String(30))
    plazas:Mapped[int]=mapped_column(Integer)
    cubiertas:Mapped[int]=mapped_column(Integer,default=0)
    prioridad:Mapped[str]=mapped_column(String(20))
    estado:Mapped[str]=mapped_column(String(30))
    fecha_objetivo:Mapped[str|None]=mapped_column(String(10),nullable=True)
    notas:Mapped[str]=mapped_column(Text,default='')
    acciones:Mapped[list]=mapped_column(JSON,default=list)
    revision:Mapped[int]=mapped_column(Integer,default=1)
    creado:Mapped[str]=mapped_column(String(40))
    actualizado:Mapped[str]=mapped_column(String(40))

class EventoPlan(Base):
    __tablename__='eventos_planes'
    id:Mapped[int]=mapped_column(primary_key=True)
    plan_id:Mapped[int]=mapped_column(ForeignKey('planes_vacantes.id'),index=True)
    revision:Mapped[int]=mapped_column(Integer)
    fecha:Mapped[str]=mapped_column(String(40))
    actor:Mapped[str]=mapped_column(String(100))
    datos:Mapped[dict]=mapped_column(JSON)
    __table_args__=(UniqueConstraint('plan_id','revision'),)

def conectar(url=None):
    Path('privado').mkdir(exist_ok=True,mode=0o700)
    url=url or os.environ.get('RH_DATABASE_URL','sqlite:///privado/rh.db')
    engine=create_engine(url,connect_args={'check_same_thread':False} if url.startswith('sqlite') else {})
    from .migraciones import migrar
    migrar(engine,Base)
    return engine,sessionmaker(engine,expire_on_commit=False)

def como_dict(obj):return {c.name:getattr(obj,c.name) for c in obj.__table__.columns}
