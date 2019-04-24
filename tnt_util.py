
from util import adict, tdict, tset, tlist, xset, idict
from tnt_cards import draw_cards
from tnt_units import add_unit

######################
# Game Processing
######################

diplvl = {
	1: 'associates',
	2: 'protectorates',
	3: 'satellites',
}
dipname = {
	1: 'an Associate',
	2: 'a Protectorate',
	3: 'a Satellite',
}

def compute_tracks(territory, tiles):
	pop, res = 0, 0
	for name in territory:
		tile = tiles[name]
		if 'blockaded' not in tile:
			pop += tile['pop']
			res += tile['res']
			if 'res_afr' in tile and 'blockaded_afr' not in tile:
				res += tile.res_afr
	return pop, res

def compute_production_level(faction):
	at_war = sum(faction.stats.at_war_with.values())
	
	if at_war:
		return min(faction.tracks.POP, faction.tracks.RES, faction.tracks.IND)
	return min(faction.tracks.POP, faction.tracks.IND)


def count_victory_points(G):
	points = adict({p: 0 for p in G.players})
	
	for name, faction in G.players.items():
		
		# current production level
		prod_level = compute_production_level(faction)
		points[name] += prod_level
		
		# control of enemy capitals
		enemy_cities = 0
		for rival, rival_faction in G.players.items():
			if rival != name:
				if rival_faction.cities.MainCapital in faction.territory:
					enemy_cities += 1
				for subcapital in rival_faction.cities.SubCapitals:
					if subcapital in faction.territory:
						enemy_cities += 1
		
		points[name] += 2 * enemy_cities
		
		# count atomic research
		atomics = 0
		for tech in faction.technologies:
			if 'Atomic' in tech:
				atomics += 1
		points[name] += 1 * atomics
		
		# peace dividends
		points[name] += sum(faction.stats.peace_dividends)
		
		# subtract DoW
		DoWs = sum(faction.stats.DoW.values())
		points[name] -= DoWs
	
	return points

def contains_fortress(G, tile):
	for uid in tile.units:
		if G.objects.table[uid].type == 'Fortress':
			return True
	return False


######################
# Diplomacy
######################

def increment_influence(G, player, nation):
	if nation not in G.diplomacy.influence:
		inf = idict()
		inf.value = 1
		inf.nation = nation
		inf.faction = player
		inf.obj_type = 'influence'
		inf.visible = xset(G.players.keys())
		
		G.players[player].influence.add(inf._id)
		G.diplomacy.influence[nation] = inf
		G.objects.table[inf._id] = inf
		G.objects.created[inf._id] = inf
		return
	
	inf = G.diplomacy.influence[nation]
	
	if player != inf.faction and inf.value == 1:
		del G.diplomacy.influence[nation]
		G.players[inf.faction].influence.remove(inf._id)
		del G.objects.table[inf._id]
		G.objects.removed[inf._id] = inf
		return
	
	delta = (-1) ** (player != inf.faction)
	
	inf.value += delta
	G.objects.updated[inf._id] = inf


def decrement_influence(G, nation, val=1):
	if nation not in G.diplomacy.influence:
		return
	
	inf = G.diplomacy.influence[nation]
	
	future = inf.value - val
	
	if future <= 0:
		del G.diplomacy.influence[nation]
		G.players[inf.faction].influence.remove(inf._id)
		del G.objects.table[inf._id]
		G.objects.removed[inf._id] = inf
		return
	
	inf.value = future
	G.objects.updated[inf._id] = inf

def declaration_of_war(G, declarer, victim):
	
	G.players[declarer].stats.DoW[victim] = True
	
	G.players[declarer].stats.at_war_with[victim] = True
	G.players[victim].stats.at_war_with[declarer] = True
	
	G.players[declarer].stats.at_war = True
	G.players[victim].stats.at_war = True
	
	G.players[victim].stats.factory_idx += 1
	G.players[victim].stats.factory_cost = G.players[victim].stats.factory_all_costs[G.players[victim].stats.factory_idx]
	
	G.logger.write('The {} delares war on the {}'.format(declarer, victim))
	G.logger.write('{} loses 1 victory point'.format(declarer))
	G.logger.write('{} decreases their factory cost to {}'.format())


def violation_of_neutrality(G, declarer, nation): # including world reaction and placing armed minor units
	
	assert nation in G.diplomacy.neutrals, '{} is no longer neutral'.format(nation)
	
	G.players[declarer].stats.aggressed = True
	
	G.logger.write('{} has violated the neutrality of {}'.format(declarer, nation))
	
	# world reaction
	
	reaction = G.tiles[G.nations.capitals[nation]].muster
	rivals = G.players[declarer].stats.rivals
	
	G.logger.write('{} draw {} cards for world reaction'.format(' and '.join(rivals, reaction)))
	
	for rival in rivals:
		draw_cards(G, 'action', rival, reaction)
	
	# remove influence
	if nation == 'USA':
		assert declarer not in  {'West', 'USSR'}, 'West/USSR cannot violate the neutrality of the USA'
		
		if 'USA' in G.diplomacy.influence:
			inf = G.diplomacy.influence['USA']
			del G.diplomacy.influence['USA']
			del G.objects.table[inf._id]
			G.objects.removed[inf._id] = inf
			
			G.logger.write('{} loses {} influence in the USA'.format(inf.faction, inf.value))
			
		# USA becomes a West satellite
		USA_becomes_satellite(G, 'West')
		
		if not G.players[declarer].stats.at_war_with['West']:
			declaration_of_war(G, declarer, 'West')
			
		return
	
	if nation in G.diplomacy.influence:
		
		inf = G.diplomacy.influence[nation]
		
		if inf.faction != declarer and inf.value == 2 and not G.players[declarer].stats.at_war_with[inf.faction]:
			G.logger.write('Since {} was a protectorate of {}, {} hereby declares war on {}'.format(nation, inf.faction, declarer, inf.faction))
			
			declaration_of_war(G, declarer, inf.faction)
			
			# nation should now become a satellite of inf.faction - including placing units
			raise NotImplementedError
		
		
		lvl = diplvl[inf.value]
		
		G.players[inf.faction].diplomacy[lvl].remove(nation)
		decrement_influence(G, nation, inf.value)
		
		G.logger.write('{} loses {} influence in {}'.format(inf.faction, inf.value, nation))
		
	
	# arming the minor
	for tilename in G.nations.territories[nation]:
		tile = G.tiles[tilename]
		
		if tile.muster > 0:
			unit = adict()
			unit.nationality = nation
			unit.type = 'Fortress'
			unit.tile = tilename
			unit.cv = tile.muster
			add_unit(G, unit)
			G.logger.write('A Fortress of {} appears in {} with cv={}'.format(nation, unit.tile, unit.cv))
			


def becomes_satellite(G, nation):
	del G.diplomacy.neutrals[nation]  # no longer neutral
	
	inf = G.diplomacy.influence[nation]
	
	faction = G.players[inf.faction]
	
	faction.influence.remove(inf._id)
	G.objects.removed[inf._id] = inf
	del G.objects.table[inf._id]
	
	faction.territory.update(G.nations.territories[nation])
	
	G.logger.write('{} takes control of {}'.format(inf.faction, nation))

def USA_becomes_satellite(G, player='West'):
	
	assert player == 'West', 'The USA can only become a satellite of West'
	
	becomes_satellite(G, 'USA')
	
	# USA specific stuff
	faction = G.players[player]
	
	faction.members['USA'] = tset('USA')
	faction.homeland['USA'] = G.nations.territories['USA'].copy()
	
	G.nations.designations['USA'] = player
	
	unit = adict()
	unit.nationality = 'USA'
	unit.type = 'Fortress'
	unit.tile = 'Washington'
	unit.cv = 4
	add_unit(G, unit)
	
	unit = adict()
	unit.nationality = 'USA'
	unit.type = 'Fortress'
	unit.tile = 'New_York'
	unit.cv = 2
	add_unit(G, unit)
	
	faction.stats.factory_idx += 1
	faction.stats.factory_cost = faction.stats.factory_all_costs[faction.stats.factory_idx]
	
	G.logger.write('{} factory cost decreases to {}'.format())
	
	

######################
# Game Actions
######################

def placeable_units(G, player, nationality, tile_options):
	
	# Groups: in land, no fortress, not supplied,
	
	reserves = xset(ut for ut in G.units.placeable
	                if ut in G.units.reserves[nationality]
	                and G.units.reserves[nationality][ut ] >0)
	
	base = adict({
		'unsupplied': xset('Fortress'),
		(False, False): reserves,
		(True, False): xset(ut for ut in reserves if ut != 'Fortress'),
		(False, True): xset(ut for ut in reserves if G.units.rules[ut].type not in {'N', 'S'}),
		# in_land_no_fort = xset(ut for ut in in_land if ut in no_fortress),
	})
	base[True, True] = base[True, False].intersection(base[False, True])
	
	# make sure territory is undisputed
	
	options = adict()
	
	for tilename in tile_options:
		tile = G.tiles[tilename]
		
		if 'disputed' in tile:
			continue
		
		has_fortress = contains_fortress(G, tile)
		
		in_land = tile.type == 'Land'  # not including coast
		
		unsupplied = 'unsupplied' in tile and player in tile.unsupplied
		
		cond = has_fortress, in_land
		if unsupplied:
			cond = 'unsupplied'
		
		if unsupplied and has_fortress:
			continue
		
		# add new options based on cond
		if cond not in options:
			options[cond] = xset(), base[cond]
		options[cond][0].add(tilename)
	
	return xset(options.values())


