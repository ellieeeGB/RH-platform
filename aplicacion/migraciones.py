"""Migraciones aditivas e idempotentes. v2 agrega planificación sin modificar hechos."""
from sqlalchemy import MetaData,Table,Column,Integer,select,insert,update

def migrar(engine,base):
    meta=MetaData()
    version=Table('version_esquema',meta,Column('version',Integer,primary_key=True))
    meta.create_all(engine)
    with engine.begin() as db:
        actual=db.scalar(select(version.c.version))
        if actual not in (None,1,2):
            raise RuntimeError('Versión de base no compatible. Aplique la migración correspondiente antes de iniciar.')
        base.metadata.create_all(db)
        if actual is None:db.execute(insert(version).values(version=2))
        elif actual==1:db.execute(update(version).values(version=2))
