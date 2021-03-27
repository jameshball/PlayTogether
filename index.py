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

    for bar in bars:
        # TODO: Update score with id score_id on database (delete and add)
        pass

    return ''


@app.route('/api/upload_track/<int:score_id>/<int:track_id>', methods=['POST'])
def api_upload_track(score_id, track_id):
    hello = AudioSegment.from_mp3("audio/hello.mp3")
    world = AudioSegment.from_mp3("audio/world.mp3")
    output = hello.overlay(world)
    output.export("audio/merged.mp3", format="mp3")
    return send_file('audio/merged.mp3')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
