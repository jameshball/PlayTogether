import json
import os
from flask import Flask, render_template, send_file, request, redirect
from flask_sqlalchemy import SQLAlchemy
from pydub import AudioSegment

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

if 'DATABASE_URL' in os.environ:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)
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


@app.route('/record_track/<int:score_id>')
def record_track(score_id):
    score = Score.query.get_or_404(score_id)
    return render_template('record_track.html', score_id=score_id, bars=score.bars)


@app.route('/api/list_samples/<int:track_id>')
def api_list_samples(track_id):
    samples = Sample.query.filter(Sample.track_id == track_id).all()
    return json.dumps([{"score_id": sample.id, "created_at": sample.created_at} for sample in samples])


@app.route('/api/list_scores')
def api_list_scores():
    scores = Score.query.with_entities(Score.id, Score.name).all()
    return json.dumps([{"score_id": score.id, "name": score.name} for score in scores])


@app.route('/api/list_tracks/<int:score_id>')
def api_list_tracks(score_id):
    tracks = Track.query.filter(Track.score_id == score_id).all()
    return json.dumps([{"track_id": track.id, "name": track.name} for track in tracks])


@app.route('/api/get_score/<int:score_id>')
def api_get_score(score_id):
    score = Score.query.get_or_404(score_id)
    return {"score_id": score.id, "name": score.name, "bars": json.loads(score.bars)}


@app.route('/api/upload_track/<int:score_id>/<int:track_id>', methods=['POST'])
def api_upload_track(score_id, track_id):
    if request.content_type != "audio/mpeg-3":
        return "bad mime type", 415

    track = Track.query.join(Score).filter(Score.id == score_id and Track.id == track_id).first_or_404()
    Sample(file=request.data, track=track)

    db.session.commit()

    return ''
    # hello = AudioSegment.from_mp3("audio/hello.mp3")
    # world = AudioSegment.from_mp3("audio/world.mp3")
    # output = hello.overlay(world)
    # output.export("audio/merged.mp3", format="mp3")
    # return send_file('audio/merged.mp3')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
