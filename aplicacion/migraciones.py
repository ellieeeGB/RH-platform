"""Migración inicial idempotente. Futuras versiones deben migrar, nunca recrear datos."""
from sqlalchemy import MetaData,Table,Column,Integer,select,insert

def migrar(engine,base):
    meta=MetaData()
    version=Table('version_esquema',meta,Column('version',Integer,primary_key=True))
    meta.create_all(engine)
    with engine.begin() as db:
        actual=db.scalar(select(version.c.version))
        if actual is not None and actual!=1:raise RuntimeError('Versión de base no compatible. Aplique la migración correspondiente antes de iniciar.')
        base.metadata.create_all(db)
        if actual is None:db.execute(insert(version).values(version=1))
