from index import db


class Score(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    tracks = db.relationship('Track', backref='score')

    def __repr__(self):
        return f"<Score {self.name}>"


class Track(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80))
    score_id = db.Column(db.Integer, db.ForeignKey('score.id'), nullable=False)
    bars = db.relationship('Bar', backref='track')


class Bar(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    tempo = db.Column(db.Integer, nullable=False)
    timesig_top = db.Column(db.Integer, nullable=True)
    track_id = db.Column(db.Integer, db.ForeignKey('track.id'), nullable=False)

