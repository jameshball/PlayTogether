from index import db
from sqlalchemy.sql import func


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
    name = db.Column(db.String(), nullable=True)
    bars = db.Column(db.Text, nullable=True)

    tracks = db.relationship('Track', backref='score', cascade="all, delete")

    def __repr__(self):
        return f"<Score {self.name}>"


class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String())
    score_id = db.Column(db.Integer, db.ForeignKey('score.id'), nullable=False)

    samples = db.relationship('Sample', backref='track', cascade="all, delete")


class Sample(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    file = db.Column(db.LargeBinary)
    created_at = db.Column(db.DateTime, server_default=func.now())

    track_id = db.Column(db.Integer, db.ForeignKey('track.id'), nullable=False)
