from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
app = Flask(__name__, static_folder='static')
CORS(app)

@app.route("/")
def hello():
  return "congratulations, you reached the backend!"

@app.route('/login/username/<username>')
def login(username="tawzz"):
    return username + ' has logged in '

@app.route('/please/<fname>')
def pleaseWork(fname):
    return send_from_directory(app.static_folder, fname)

@app.route('/playerInit/username/<username>')
def playerFaction(username="tawzz"):
    return 'USSR'

#das brauch ich um es local laufen zu lassen
if __name__ == "__main__":
  app.run()