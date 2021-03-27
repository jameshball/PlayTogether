from index import db
from sqlalchemy.sql import func


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(80), nullable=True)

    tracks = db.relationship('Track', backref='score')
    bars = db.relationship('Bar', backref='score')

    def __repr__(self):
        return f"<Score {self.name}>"


class Bar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tempo = db.Column(db.Integer, nullable=False)
    timesig_top = db.Column(db.Integer, nullable=True)
    score_id = db.Column(db.Integer, db.ForeignKey('score.id'), nullable=False)


class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    score_id = db.Column(db.Integer, db.ForeignKey('score.id'), nullable=False)

    samples = db.relationship('Sample', backref='track')


class Sample(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.LargeBinary)
    created_at = db.Column(db.DateTime, server_default=func.now())

    track_id = db.Column(db.Integer, db.ForeignKey('track.id'), nullable=False)
