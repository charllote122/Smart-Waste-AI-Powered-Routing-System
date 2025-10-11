from app import db
import sqlalchemy as sa
import sqlalchemy.orm as so
from flask_login import UserMixin
from app import login
from sqlalchemy.sql import func
from app import login
class User(UserMixin,db.Model):
    id:so.Mapped[int] = so.mapped_column(primary_key=True)
    username: so.Mapped[str] = so.mapped_column(sa.String(64),unique=True)
    email: so.Mapped[str] =so.mapped_column(sa.String(128))
    pwd: so.Mapped[str] =so.mapped_column(sa.String(256))
    admin: so.Mapped[str] = so.mapped_column(sa.String(64),default='user')
    datejoined = db.Column(sa.DateTime(timezone=True), server_default=func.now())
    @login.user_loader
    def load_user(id):
        return db.session.get(User,int(id))
    def __repr__(self) -> str:
        return '<User {}>'.format(self.username)
class Cameras(db.Model):
    id:so.Mapped[int] = so.mapped_column(primary_key=True)
    name: so.Mapped[str]=so.mapped_column(sa.String(128))
    location: so.Mapped[int] = so.mapped_column()
    status:so.Mapped[int]=so.mapped_column()
    ipaddress: so.Mapped[str]=so.mapped_column(sa.String(128))
    def __repr__(self) -> str:
        return '<Cameras {}>'.format(self.name)
class Statistics(db.Model):
    id:so.Mapped[int] = so.mapped_column(primary_key=True)
    imganalyzed: so.Mapped[int]=so.mapped_column()
    wastedected: so.Mapped[int]=so.mapped_column()
    avgconfidence: so.Mapped[int]=so.mapped_column()
    detectionrate: so.Mapped[int]=so.mapped_column()
    def __repr__(self) -> str:
        return '<Statistics {}>'.format(self.id)



class Reports(db.Model):
    id:so.Mapped[int] = so.mapped_column(primary_key=True)
    location: so.Mapped[str]=so.mapped_column(sa.String(128))
    priority: so.Mapped[str]=so.mapped_column(sa.String(256))
    status: so.Mapped[str]=so.mapped_column(sa.String(256))
    ai_confidence: so.Mapped[int]=so.mapped_column()
    reportedAt = db.Column(sa.DateTime(timezone=True), server_default=func.now())
    image_data = db.Column(db.LargeBinary)
    image_name = db.Column(db.String(255))
    def __repr__(self) -> str:
        return '<Reports {}>'.format(self.id)
    
 