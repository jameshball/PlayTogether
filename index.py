import os
from flask import Flask, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)


# app.config['SQLALCHEMY_DATABASE_URI'] = os.environ['DATABASE_URL']
# db = SQLAlchemy(app)


@app.route('/')
def index():
    return render_template('index.html')


@app.route('/new_score')
def new_score():
    return render_template('new_score.html')


@app.route('/hello/<first_name>/<last_name>')
def create(first_name=None, last_name=None):
    return 'Hello ' + first_name + ',' + last_name


if __name__ == '__main__':
    app.run(debug=False, host='0.0.0.0', port=8080)
