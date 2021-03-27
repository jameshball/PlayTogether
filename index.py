import os
from flask import Flask, render_template, send_file
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


@app.route('/new_score')
def new_score():
    return render_template('new_score.html')


@app.route('/hello/<first_name>/<last_name>')
def create(first_name=None, last_name=None):
    return 'Hello ' + first_name + ',' + last_name


@app.route('/audio/')
def audio():
    hello = AudioSegment.from_mp3("audio/hello.mp3")
    world = AudioSegment.from_mp3("audio/world.mp3")
    output = hello.overlay(world)
    output.export("audio/merged.mp3", format="mp3")
    return send_file('audio/merged.mp3')


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
