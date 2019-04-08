from flask import Flask, render_template, send_from_directory
from flask_cors import CORS
from flask_util import ActionConverter
import json
app = Flask(__name__, static_folder='_front')
CORS(app)

app.url_map.converters['action'] = ActionConverter

from passive_backend import *

def convert_jsonable(msg):
	
	if isinstance(msg, dict):
		return {convert_jsonable(k):convert_jsonable(v) for k,v in msg.items()}
	if isinstance(msg, (list, tuple)):
		return [convert_jsonable(el) for el in msg]
	if isinstance(msg, set):
		return {'set':[convert_jsonable(el) for el in msg]}
	# if not isinstance(msg, str):
	# 	return str(msg)
	return msg

# def deepcopy_message(msg):
# 	if isinstance(msg, (tdict, adict)):
# 		return adict({deepcopy_message(k):deepcopy_message(v) for k,v in msg.items()})
# 	if isinstance(msg, idict):
# 		copy = msg.copy()
# 		copy._id = msg._id
# 		return copy
# 	if isinstance(msg, (list, tuple)):
# 		return type(msg)(deepcopy_message(el) for el in msg)
# 	if isinstance(msg, set):
# 		return xset(deepcopy_message(el) for el in msg)
# 	# if not isinstance(msg, str):
# 	# 	return str(msg)
# 	return msg

_visible_attrs = { # attributes seen by all players even if obj isn't visible to the player
	'unit': {'nationality', 'tile', }
}

def hide_objects(objects, player=None, cond=None):
	if cond is None:
		cond = lambda obj, player: player not in obj.visible
	if player is None:
		return
	for obj in objects.values():
		if cond(obj, player):
			for k in list(obj.keys()):
				if k in obj and k not in {'visible', 'obj_type'} and \
						(obj['obj_type'] not in _visible_attrs or k not in _visible_attrs[obj['obj_type']]):
					del obj[k]

def format_msg_for_frontend(msg, player=None):
	
	msg = convert_jsonable(msg)
	
	cond = lambda obj, player: player not in obj['visible']['set']
	
	if 'created' in msg:
		hide_objects(msg['created'], player=player, cond=cond)
	if 'updated' in msg:
		hide_objects(msg['updated'], player=player, cond=cond)
	if 'removed' in msg:
		hide_objects(msg['removed'], player=player, cond=cond)
	
	msg = json.dumps(msg)
	
	return msg


def unjsonify(msg):
	if isinstance(msg, dict):
		if len(msg) == 1 and 'set' in msg:
			return xset(unjsonify(el) for el in msg['set'])
		return adict({unjsonify(k):unjsonify(v) for k,v in msg.items()})
	if isinstance(msg, list):
		return tuple(unjsonify(el) for el in msg)
	# if not isinstance(msg, str):
	# 	return str(msg)
	return msg

def format_msg_to_python(msg):
	msg = unjsonify(json.loads(msg))
	return msg

FORMAT_MSG = format_msg_for_frontend

@app.route('/lauren/')
def defaultRouteStaticFiles():
    return send_from_directory(app.static_folder, "front_lauren/index.html") 

@app.route('/lauren/<fname>')
def staticFilesMainDir(fname):
    filename = fname 
    return send_from_directory(app.static_folder, "front_lauren/"+fname) 

@app.route('/lauren/css/<fname>')
def staticFilesCSSDir(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_lauren/css/'+fname) 

@app.route('/lauren/js/<fname>')
def staticFilesJSDir(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_lauren/js/'+fname) 

@app.route('/lauren/assets/<fname>')
def staticFilesAssetsDir(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_lauren/assets/'+fname) 

@app.route('/lauren/assets/markers/<fname>')
def staticFilesAssetsMarkersDir(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_lauren/assets/markers/'+fname) 

@app.route('/lauren/assets/config/<fname>')
def staticFilesAssetsConfigDir(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_lauren/assets/config/'+fname) 

@app.route('/felix/')
def defaultRouteStaticFilesFelix():
    return send_from_directory(app.static_folder, "front_felix/index.html") 

@app.route('/felix/<fname>')
def staticFilesMainDirFelix(fname):
    filename = fname 
    return send_from_directory(app.static_folder, "front_felix/"+fname) 

@app.route('/felix/css/<fname>')
def staticFilesCSSDirFelix(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_felix/css/'+fname) 

@app.route('/felix/js/<fname>')
def staticFilesJSDirFelix(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_felix/js/'+fname) 

@app.route('/felix/assets/<fname>')
def staticFilesAssetsDirFelix(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_felix/assets/'+fname) 

@app.route('/tawzz/')
def defaultRouteStaticFilesTawzz():
    return send_from_directory(app.static_folder, "front_tawzz/index.html") 

@app.route('/tawzz/<fname>')
def staticFilesMainDirTawzz(fname):
    filename = fname 
    return send_from_directory(app.static_folder, "front_tawzz/"+fname) 

@app.route('/tawzz/css/<fname>')
def staticFilesCSSDirTawzz(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_tawzz/css/'+fname) 

@app.route('/tawzz/js/<fname>')
def staticFilesJSDirTawzz(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_tawzz/js/'+fname) 

@app.route('/tawzz/assets/<fname>')
def staticFilesAssetsDirTawzz(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_tawzz/assets/'+fname) 

@app.route('/tawzz/assets/markers/<fname>')
def staticFilesAssetsMarkersDirTawzz(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_tawzz/assets/markers/'+fname) 

@app.route('/tawzz/assets/config/<fname>')
def staticFilesAssetsConfigDirTawzz(fname):
    filename = fname 
    return send_from_directory(app.static_folder, 'front_tawzz/assets/config/'+fname) 

@app.route("/")
def ping():
   return 'Backend active: use "init" to init game'

@app.route('/save/<filename>')
def save(filename=None):
	return save_gamestate(filename)

@app.route('/load/<data>')
def load(data):
	return load_gamestate(data)

@app.route('/init/<game_type>/<player>')
def init_game(game_type='hotseat', player='Axis', debug=False):
	
	# if debug:
	# 	global FORMAT_MSG
	# 	FORMAT_MSG = format_debug_msg
	
	if not game_type == 'hotseat':
		return 'Error: Game type must be hotseat'
	return FORMAT_MSG(start_new_game(player, debug=debug), player)

@app.route('/info/<faction>')
def get_info(faction):
	return 'Error: NOT IMPLEMENTED: Will send info about {}'.format(faction)

@app.route('/status/<faction>')
def get_status(faction):
	return FORMAT_MSG(get_waiting(faction), faction)

@app.route('/action/<faction>/<action:vals>') # action values are delimited by "+"
def take_action(faction, vals):
	
	return FORMAT_MSG(step(faction, vals), faction)
	
	return 'Received action from {}: {}'.format(faction, str(vals))

if __name__ == "__main__":
	app.run()
