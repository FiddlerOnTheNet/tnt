from flask import Flask, render_template
from flask_cors import CORS #needed for cross origin access

app = Flask(__name__)
CORS(app) #needed for cross origin access

@app.route("/")
def hello():
  return "congratulations, you reached the backend!"

@app.route('/login/username/<username>')
def login(username="tawzz"):
    return username + ' has logged in ' 

#this route can fetch any static file
@app.route("/templ/fname/<fname>")
def templ(fname='test'):
  return render_template(fname+'.yml')

@app.route('/playerInit/username/<username>')
def playerInit(username="tawzz"):
  return 'West'  #example


if __name__ == "__main__":
  app.run()