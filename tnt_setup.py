from tnt_util import tdict, tset, adict, tlist, idict, load, save, collate, uncollate, xset, seq_iterate
import tnt_util as util
from tnt_cards import load_card_decks, draw_cards
from tnt_errors import ActionError
from tnt_units import load_unit_rules, add_unit
import random

def load_map(G, tiles='config/tiles.yml', borders='config/borders.yml'):
	
	tiles = load(tiles)
	borders = load(borders)
	
	for b in borders:
		n1, n2 = b.tile1, b.tile2
		t = b.type
		
		if 'borders' not in tiles[n1]:
			tiles[n1].borders = tdict()
		tiles[n1].borders[n2] = t
		
		if 'borders' not in tiles[n2]:
			tiles[n2].borders = tdict()
		tiles[n2].borders[n1] = t
	
	G.tiles = tiles
	
	for name, tile in G.tiles.items():
		tile.name = name
		tile.units = tset()
		if tile.type != 'Sea' and tile.type != 'Ocean':
			for neighbor in tile.borders.keys():
				if G.tiles[neighbor].type == 'Sea' or G.tiles[neighbor].type == 'Ocean':
					tile.type = 'Coast'
					break
		
		# add tile to game objects
		tile.obj_type = 'tile'
		tile.visible = tset({'Axis', 'West', 'USSR'})
		G.objects.table[name] = tile



def load_players_and_minors(G):
	player_setup = load('config/faction_setup.yml')
	
	nations = tdict()
	minor_designation = 'Minor'
	
	for tile in G.tiles.values():
		if 'alligence' in tile:
			nations[tile.alligence] = minor_designation
	G.nations = nations # map nationality to faction/minor
	
	# load factions/players
	players = tdict()
	
	groups = tset(player_setup.keys())
	rivals = tdict()
	for g in groups:
		gps = groups.copy()
		gps.remove(g)
		rivals[g] = list(gps)
	
	for name, config in player_setup.items():
		
		faction = tdict()
		
		faction.stats = tdict()
		faction.stats.handlimit = config.Handlimit
		faction.stats.factory_all_costs = config.FactoryCost
		faction.stats.factory_idx = 0
		faction.stats.factory_cost = faction.stats.factory_all_costs[faction.stats.factory_idx]
		faction.stats.emergency_command = config.EmergencyCommand
		
		faction.stats.DoW = tdict()
		faction.stats.DoW[rivals[name][0]] = False
		faction.stats.DoW[rivals[name][1]] = False
		
		faction.stats.at_war_with = tdict()
		faction.stats.at_war_with[rivals[name][0]] = False
		faction.stats.at_war_with[rivals[name][1]] = False
		faction.stats.at_war = False
		
		faction.stats.aggressed = False
		faction.stats.peace_dividends = tlist()
		
		faction.stats.enable_USA = 'enable_USA' in config
		faction.stats.enable_Winter = 'enable_Winter' in config
		
		faction.cities = tdict()
		faction.cities.MainCapital = config.MainCapital
		faction.cities.SubCapitals = config.SubCapitals
		
		faction.members = tdict()
		for nation, info in config.members.items():
			nations[nation] = name
			faction.members[nation] = tset([nation])
			if 'Colonies' in info:
				faction.members[nation].update(info.Colonies)
		
		faction.homeland = tdict({member:tset() for member in faction.members.keys()})
		faction.territory = tset()
		
		full_cast = tset()
		for members in faction.members.values():
			full_cast.update(members)
		
		for tile_name, tile in G.tiles.items():
			if 'alligence' not in tile:
				continue
			if tile.alligence in faction.members: # homeland
				faction.homeland[tile.alligence].add(tile_name)
			if tile.alligence in full_cast:
				faction.territory.add(tile_name)
		
		faction.tracks = tdict()
		pop, res = util.compute_tracks(faction.territory, G.tiles)
		faction.tracks.POP = pop
		faction.tracks.RES = res
		faction.tracks.IND = config.initial_ind
		
		faction.units = tset()
		faction.hand = tset() # for cards
		faction.technologies = tset()
		faction.influence = tdict()
		
		players[name] = faction
	G.players = players
	
	# load minors/diplomacy
	minors = tdict()
	for name, team in nations.items():
		if team == minor_designation:
			minor = tdict()
			
			minor.units = tset()
			minor.is_armed = False
			minor.influence_faction = None
			minor.influence_value = 0
			
			minors[name] = minor
	G.minors = minors
	

def load_game_info(G, path='config/game_info.yml'):
	info = load(path)
	
	game = tdict()
	
	game.year = info.first_year - 1 # zero based
	game.last_year = info.last_year
	num_rounds = game.last_year - game.year
	
	game.turn_order_options = info.turn_order_options
	
	game.sequence = ['Setup'] + num_rounds*info.year_order + ['Scoring']
	game.index = -1 # start below 0, so after increment in next_phase() it starts at 0
	#game.action_phases = tset(x for x in info.phases if info.phases[x]) # no need for action phases anymore (all action phases have a pre phase)
	
	game.peace_dividends = tlist(sum([[v]*n for v,n in info.peace_dividends.items()], []))
	random.shuffle(game.peace_dividends)
	
	game.victory = info.victory
	
	G.game = game
	
	G.objects = tdict()
	G.objects.table = tdict()

def init_gamestate():
	
	G = tdict()
	
	load_game_info(G)
	
	load_map(G)
	
	load_players_and_minors(G)
	load_card_decks(G)
	
	load_unit_rules(G)
	
	return G

def encode_setup_actions(G, player=None):
	
	code = adict() # nationality, tile, unit_type
	
	available_units = adict()
	
	# cond = has_fortress, in_land
	
	# base groups
	base = adict({
		(False, False) : G.units.placeable.copy(),
		(True, False) : xset(ut for ut in G.units.placeable if ut != 'Fortress'),
		(False, True) : xset(ut for ut in G.units.placeable if G.units.rules[ut].type not in {'N', 'S'}),
		#in_land_no_fort = xset(ut for ut in in_land if ut in no_fortress),
	})
	base[True, True] = base[True, False].intersection(base[False, True])
	
	for faction, nationality, tilename in seq_iterate(G.temp.setup, None, 'cadres', None):
		
		if player is not None and player != faction:
			continue
		
		# add necessary option containers
		if faction not in code:
			code[faction] = adict()
		if nationality not in code[faction]:
			code[faction][nationality] = adict()
		if nationality not in available_units:
			available_units[nationality] = xset(ut for ut in G.units.placeable
			                                if ut in G.units.reserves[nationality] and G.units.reserves[nationality][ut]>0)
			
		# identify cond
		tile = G.tiles[tilename]
		
		has_fortress = False
		for uid in tile.units:
			if G.objects.table[uid].type == 'Fortress':
				has_fortress = True
				break
				
		in_land = tile.type == 'Land' # not including coast
		
		cond = has_fortress, in_land
		options = code[faction][nationality]
		
		# add new options based on cond
		if cond not in options:
			options[cond] = xset(), available_units[nationality].intersection(base[cond])
		options[cond][0].add(tilename)
		
	# transform options to encoding
	for faction, options in code.items():
		if len(options) > 1:
			code[faction] = xset((k,xset(v.values())) for k,v in options.items())
		else:
			k,v = next(iter(options.items()))
			code[faction] = (k,xset(v.values()))
	
	if player is None:
		return code
	elif player in code:
		return code[player]

def setup_pre_phase(G, player_setup_path='config/faction_setup.yml'):
	
	player_setup = load(player_setup_path)
	
	# prep temp info - phase specific data
	
	temp = tdict()
	temp.setup = tdict()
	
	for name, faction in player_setup.items():
		
		if 'units' in faction.setup:
		
			for unit in faction.setup.units:
				add_unit(G, unit)
	
			del faction.setup.units
	
		temp.setup[name] = faction.setup
	
	G.temp = temp
	
	# return action adict(faction: (action_keys, action_options))
	return encode_setup_actions(G)
	

def setup_phase(G, player, options, action): # player, nationality, tilename, unit_type
	# place user chosen units
	
	options = util.decode_actions(options)
	
	assert action in options, 'Invalid action: {}'.format(action)
	
	nationality, tilename, unit_type = action
	
	unit = adict()
	unit.nationality = nationality
	unit.tile = tilename
	unit.type = unit_type
	
	#print(unit)
	
	add_unit(G, unit)
	
	G.temp.setup[player].cadres[nationality][tilename] -= 1
	if G.temp.setup[player].cadres[nationality][tilename] == 0:
		del G.temp.setup[player].cadres[nationality][tilename]
		
	if len(G.temp.setup[player].cadres[nationality]) == 0:
		del G.temp.setup[player].cadres[nationality]
	
	if len(G.temp.setup[player].cadres) == 0: # all cadres are placed
		del G.temp.setup[player].cadres
		
		if 'action_cards' in G.temp.setup[player]:
			draw_cards(G, 'action', player, N=G.temp.setup[player].action_cards)
			del G.temp.setup[player].action_cards
			
		if 'investment_cards' in G.temp.setup[player]:
			draw_cards(G, 'action', player, N=G.temp.setup[player].action_cards)
			del G.temp.setup[player].investment_cards
		
	return encode_setup_actions(G, player=player)
	

# def encode_setup_actions(G, player=None):
# 	#keys = ('nationality', 'tile', 'unit_type')
# 	code = adict()
#
# 	for faction, setups in G.temp.setup.items():
# 		nationalities = xset()
# 		if 'cadres' not in setups:
# 			continue
# 		for nationality, tiles in setups.cadres.items():
#
# 			available_units = {ut:rules for ut, rules in G.units.rules.items() if ut in  G.units.reserves[nationality] and G.units.reserves[nationality][ut]>0}
#
# 			groups = [
# 				xset({ut for ut, rules in available_units.items() if 'not_placeable' not in rules}),
# 				xset({ut for ut, rules in available_units.items() if 'not_placeable' not in rules and ut != 'Fortress'}),
# 				xset({ut for ut, rules in available_units.items() if
# 				      'not_placeable' not in rules and rules.type not in {'N', 'S'}}),
# 				xset({ut for ut, rules in available_units.items() if
# 				      'not_placeable' not in rules and rules.type not in {'N', 'S'} and ut != 'Fortress'}),
# 			]
#
#
# 			group_names = [xset() for _ in groups]
# 			for tilename in tiles:
# 				tile = G.tiles[tilename]
# 				has_fortress = False
# 				if 'units' in tile:
# 					for ID in tile.units:
# 						if G.objects.table[ID].type == 'Fortress':
# 							has_fortress = True
# 							break
#
# 				if tile.type == 'Land': # no coast
# 					group_names[2].add(tilename)
# 				elif has_fortress:
# 					group_names[1].add(tilename)
# 				elif has_fortress and tile.type == 'Land':
# 					group_names[3].add(tilename)
# 				else:
# 					group_names[0].add(tilename)
#
# 			options = xset((gn, g) for gn, g in zip(group_names, groups) if len(gn) > 0 and len(g) > 0)
# 			nationalities.add((nationality, options))
# 		code[faction] = nationalities
#
# 	if player is not None and player in code:
# 		return code[player]
# 	elif player is not None:
# 		return None
#
# 	return code
