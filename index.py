from flask import Flask, send_file
from pydub import AudioSegment

app = Flask(__name__)


@app.route('/')
def index():
    return 'Hello World!'


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
