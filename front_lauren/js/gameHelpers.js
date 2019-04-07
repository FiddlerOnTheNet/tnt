//#region loading helpers
function loadRegions(objectManager) {
  loadYML("assets/config/map_pos.yml", data => {
    for (const regionName in data) {
      let position = data[regionName];
      objectManager.createRegion(regionName, position);
    }
  });
}
function loadCadrePrototypes(objectManager,callback) {
  loadYML("assets/config/unit_count.yml", data => {
    for (const power in data) {
      for (const unit in data[power]) {
        objectManager.createCadrePrototype(power,unit);
      }
    }
    callback(data);
  });
}

//#endregion local asset loading
