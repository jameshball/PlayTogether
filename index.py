import os
from flask import Flask, render_template, send_file, request
from flask_sqlalchemy import SQLAlchemy
from pydub import AudioSegment

# from model import *

app = Flask(__name__)

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

if 'DATABASE_URL' in os.environ:
    app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
db = SQLAlchemy(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/edit_score/<int:score_id>')
def edit_score(score_id):
    return render_template('edit_score.html')


@app.route('/api/edit_score/<int:score_id>', methods=['POST'])
def api_edit_score(score_id):
    content = request.json
    bars = content['bars']

    for bar in bars:
        # TODO: Update score with id score_id on database (delete and add)
        pass

    return ''


@app.route('/audio/')
def audio():
    hello = AudioSegment.from_mp3("audio/hello.mp3")
    world = AudioSegment.from_mp3("audio/world.mp3")
    output = hello.overlay(world)
    output.export("audio/merged.mp3", format="mp3")
    return send_file('audio/merged.mp3')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
