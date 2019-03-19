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

@app.route("/templ/fname/<fname>")
def templ(fname='test'):
  return render_template(fname+'.yml')




#************* testing ******************
#testing multiple params
@app.route('/login2/choice1/<choice1>/choice2/<choice2>')
def login2(choice1="das",choice2="U"):
    return choice1 + ' has logged in as ' + choice2

#testing static file response
@app.route("/gameSetup")
def gameSetup():
  #return render_template('index.html') #geht
  return render_template('map_pos.yml') #geht

if __name__ == "__main__":
  app.run()