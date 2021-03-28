import json
import os
from functools import reduce
from tempfile import NamedTemporaryFile

from flask import Flask, render_template, send_file, request, redirect, make_response
from flask_sqlalchemy import SQLAlchemy
from pydub import AudioSegment


class ReverseProxied(object):
    def __init__(self, app):
        self.app = app

    def __call__(self, environ, start_response):
        scheme = environ.get('HTTP_X_FORWARDED_PROTO')
        if scheme:
            environ['wsgi.url_scheme'] = scheme
        return self.app(environ, start_response)


app = Flask(__name__)
app.wsgi_app = ReverseProxied(app.wsgi_app)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

if 'DATABASE_URL' in os.environ:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL'].replace("postgres://", "postgresql://", 1)
db = SQLAlchemy(app, engine_options={"max_overflow": -1})
from model import *

db.create_all()


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/new_score', methods=['GET'])
def new_score():
    score = Score()
    db.session.add(score)
    db.session.commit()

    return redirect(f'/edit_score/{score.id}')


@app.route('/edit_score/<int:score_id>')
def edit_score(score_id):
    return render_template('edit_score.html', score_id=score_id)


@app.route('/api/edit_score/<int:score_id>', methods=['POST'])
def api_edit_score(score_id):
    content = request.json
    bars = content['bars']

    score = Score.query.get_or_404(score_id)
    score.bars = json.dumps(bars)
    db.session.commit()

    return ''


@app.route('/record_track')
def record_track():
    score_id = request.args.get('id', default=0, type=int)
    score = Score.query.get_or_404(score_id)
    return render_template('record_track.html', score_id=score_id, bars=score.bars)


@app.route('/api/get_sample/<int:sample_id>')
def api_get_sample(sample_id):
    sample = Sample.query.get_or_404(sample_id)
    response = make_response(sample.file)
    response.headers.set('Content-Type', 'audio/mpeg')
    return response


@app.route('/api/list_samples/<int:track_id>')
def api_list_samples(track_id):
    samples = Sample.query.filter(Sample.track_id == track_id).all()
    return json.dumps([{"sample_id": sample.id, "recording_number": idx + 1,
                        "created_at": sample.created_at.strftime("%d/%m/%Y, %H:%M:%S")} for idx, sample in
                       enumerate(samples)])


@app.route('/api/list_scores')
def api_list_scores():
    scores = Score.query.with_entities(Score.id, Score.name).all()
    return json.dumps([{"score_id": score.id, "name": score.name} for score in scores])


@app.route('/api/list_tracks/<int:score_id>')
def api_list_tracks(score_id):
    tracks = Track.query.filter(Track.score_id == score_id).all()
    return json.dumps([{"track_id": track.id, "name": track.name} for track in tracks])


@app.route('/api/delete_track/<int:score_id>/<int:track_id>', methods=['DELETE'])
def api_delete_track(score_id, track_id):
    track = Track.query.filter(Track.id == track_id and Track.score_id == score_id).first_or_404()
    db.session.delete(track)
    db.session.commit()
    return ''


@app.route('/api/add_track/<int:score_id>', methods=['POST'])
def api_add_track(score_id):
    track = Track(name=request.json["name"], score_id=score_id)
    db.session.add(track)
    db.session.commit()
    return ''


@app.route('/api/get_score/<int:score_id>')
def api_get_score(score_id):
    score = Score.query.get_or_404(score_id)
    return {"score_id": score.id, "name": score.name, "bars": json.loads(score.bars)}


@app.route('/api/upload_track/<int:score_id>/<int:track_id>', methods=['POST'])
def api_upload_track(score_id, track_id):
    if request.content_type != "audio/mpeg":
        return "bad mime type", 415

    track = Track.query.join(Score).filter(Score.id == score_id, Track.id == track_id).first_or_404()
    Sample(file=request.data, track=track)

    db.session.commit()

    return ''


@app.route('/api/merge_tracks/<int:score_id>', methods=['POST'])
def api_merge_tracks(score_id):
    req = request.get_json(force=True)

    segments = []
    for sample_id in req:
        sample = Sample.query.get_or_404(sample_id)
        temp = NamedTemporaryFile(suffix=".mp3", delete=False)
        temp.write(sample.file)
        segments.append(AudioSegment.from_file(temp.name))
        temp.close()
        os.unlink(temp.name)

    overlaid = reduce(lambda a, b: a.overlay(b), segments)

    merged = NamedTemporaryFile(suffix=".mp3", delete=False)
    # TODO: might leak file handles
    overlaid.export(merged.name, format="mp3")
    return send_file(merged.name)


if __name__ == '__main__':
    app.run(debug=True, host='127.0.0.1', port=8080)
