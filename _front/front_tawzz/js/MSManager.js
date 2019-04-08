const troopInfo = {
  Infantry: ["Infantry", "|", 2],
  Tank: ["Tank", "3", 1],
  AirForce: ["AirForce", "x", 2],
  Submarine: ["Submarine", "m", 1],
  Fleet: ["Fleet", "p", 1],
  Carrier: ["Carrier", "o", 1],
  Fortress: ["Fortress", ",", 2] //oder '0'
};
const troopColors = {
  Germany: [174, 174, 176],
  Britain: [86, 182, 222],
  France: [121, 200, 205],
  USSR: [233, 138, 134],
  USA: [145, 186, 130],
  Italy: [174, 172, 131],
  Neutral: [255, 255, 102],
  Axis: [174, 174, 176],
  West: [86, 182, 222]
};
const SZ = {
  region: 180,
  cadrePrototype: 60,
  cadre: 40
};
const SEPARATOR = "_";
const fs = {
  Infantry: {fz: 0.5, x: 0.5, y: 4 / 6},
  Fleet: {fz: 0.35, x: 0.45, y: 5 / 6},
  Convoy: {fz: 0.35, x: 0.5, y: 5 / 6},
  Tank: {fz: 0.25, x: 0.54, y: 4 / 6},
  AirForce: {fz: 0.6, x: 0.5, y: 4 / 6},
  Carrier: {fz: 0.25, x: 0.5, y: 2.1 / 3},
  Submarine: {fz: 0.25, x: 0.5, y: 4.2 / 6},
  Fortress: {fz: 0.6, x: 0.5, y: 4 / 6}
};

class MSManager {
  constructor(board, troopDisplay, cardDisplay) {
    this.board = board;
    this.troopDisplay = troopDisplay;
    this.cardDisplay = cardDisplay;
    this.byId = {}; // {id:{ms:msObject,type:'region'|'power'|'unit'|'proto'|'cadre'|'hand'|'deck'|...}}
  }
  get(id) {
    //returns MS with this id
    if (!(id in this.byId)) {
      //console.log("ERROR object[" + id + "] not created!");
    }

    ////console.log(id, this.byId[id])
    return this.byId[id].ms;
  }
  getType(id) {
    return id in this.byId ? this.byId[id].type : "unknown";
  }
  getIdParts(id) {
    return id.split(SEPARATOR);
  }
  getCombinedId(...args) {
    ////console.log(args.join(SEPARATOR))
    return args.join(SEPARATOR);
  }
  getPowerFromCadrePrototypeId(id) {
    return stringBefore(id, SEPARATOR);
  }
  getUnitFromCadrePrototypeId(id) {
    return stringAfter(id, SEPARATOR);
  }
  clickHandler(ev) {
    let id = evToId(ev);
    let ms = this.get(id);
    if (!ms.isEnabled) return;
    ms.toggleSelection();
  }
  createCadrePrototype(power, unit, cv = 1) {
    let id = this.getCombinedId(power, unit);
    let elem = this.createCadreSvg(power, unit, cv, SZ.cadrePrototype);
    let cadre = new MS(id);
    cadre.setElement(elem, 100, 100);
    cadre.interactiveChild = cadre.elem.getElementsByClassName("overlay")[0];
    //console.log("creating cadre proto ", id);
    //console.log(cadre.interactiveChild);
    cadre.elem.addEventListener("click", this.clickHandler.bind(this));
    this.byId[id] = {ms: cadre, type: "proto"};
  }
  createRegion(id, pos) {
    let msRegion = new MS(id, this.board)
      .circle({className: "ms", sz: SZ.region})
      .setPos(pos.x, pos.y)
      .draw();
    this.byId[id] = {ms: msRegion, type: "region"};
    msRegion.elem.addEventListener("click", this.clickHandler.bind(this));
    // region.elem.addEventListener("click", defaultClickHandler);
  }
  createCadreSvg(power = "Britain", unitType = "Fortress", cv = 1, sz = 100) {
    // get type symbol
    let info = troopInfo[unitType];
    let letter = info[1];
    let scaleFactor = info[2];
    let name = info[0];

    // calculate color
    let rgb = troopColors[power];
    let color = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;

    // calculate value (1)
    let val = cv;

    // create svg element
    const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg1.setAttribute("width", sz);
    svg1.setAttribute("height", sz);
    svg1.id = this.getCombinedId(power, unitType);

    // create symbol
    // <text x="13%" y="80%" fill="rgba(255,255,255,.3)" class="milgiant">0</text>
    const txtSymbol = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const fs = {
      Infantry: {fz: 0.5, x: 0.5, y: 5 / 6},
      Fleet: {fz: 0.35, x: 0.45, y: 4 / 5.2},
      Convoy: {fz: 0.35, x: 0.5, y: 5 / 6},
      Tank: {fz: 0.25, x: 0.5, y: 5 / 6.4},
      AirForce: {fz: 0.6, x: 0.5, y: 5.2 / 6},
      Carrier: {fz: 0.25, x: 0.5, y: 5 / 6.4},
      Submarine: {fz: 0.25, x: 0.5, y: 5 / 6.4},
      Fortress: {fz: 0.6, x: 0.5, y: 5.2 / 6}
    };
    let f = fs[unitType];
    txtSymbol.setAttribute("font-family", "Military RPG");
    txtSymbol.setAttribute("font-size", "" + sz * f.fz + "px"); //(scaleFactor*1.5)+"rem");
    txtSymbol.setAttribute("x", sz * f.x);
    txtSymbol.setAttribute("y", sz * f.y);
    txtSymbol.setAttribute("text-anchor", "middle");
    txtSymbol.textContent = letter;
    txtSymbol.setAttribute("fill", "rgba(255,255,255,.3)");

    // create value
    // <text x="35%" y="66%" fill="white" font-size="40px">1</text>
    const txtVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txtVal.setAttribute("font-size", "" + sz / 2 + "px");
    txtVal.setAttribute("x", sz / 2);
    txtVal.setAttribute("y", "70%");
    txtVal.setAttribute("text-anchor", "middle");
    txtVal.textContent = val;
    txtVal.setAttribute("fill", "white");

    // create name
    // <text x="40" y="10%" text-anchor="middle" fill="orange" font-size="12px">Fortress</text>
    const txtName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txtName.setAttribute("font-size", "" + sz / 6 + "px");
    txtName.setAttribute("x", sz / 2);
    txtName.setAttribute("y", "28%");
    txtName.setAttribute("text-anchor", "middle");
    txtName.textContent = name;
    txtName.setAttribute("fill", "orange");

    // create a shape
    // <rect x="15%" y="15%" width="70%" height="70%" style="fill:rgba(0,0,0,.5);stroke-width:1;stroke:rgb(0,0,0)" />
    const outerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    outerRect.setAttribute("x", "0%");
    outerRect.setAttribute("y", "0%");
    outerRect.setAttribute("rx", "10%");
    outerRect.setAttribute("ry", "10%");
    outerRect.setAttribute("width", "100%");
    outerRect.setAttribute("height", "100%");
    outerRect.style = `fill:${color};stroke-width:1;stroke:rgb(0,0,0)`;

    const overlayRect = outerRect.cloneNode();
    overlayRect.setAttribute("class", "overlay");
    overlayRect.setAttribute("style", `fill:rgba(128,128,128,.1);`);
    ////console.log(overlayRect);
    //overlayRect.style = `fill:transparent;stroke-width:0;`;
    //overlayRect.classList.add('region');

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let percentage = 6.25;
    rect.setAttribute("x", percentage + "%");
    rect.setAttribute("y", percentage + "%");
    rect.setAttribute("rx", "5%");
    rect.setAttribute("ry", "5%");
    rect.setAttribute("width", 100 - 2 * percentage + "%");
    rect.setAttribute("height", 100 - 2 * percentage + "%");
    rect.style = "fill:rgba(0,0,0,.5);stroke-width:1;stroke:rgb(0,0,0)";

    // create a shape
    const cir1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cir1.setAttribute("cx", sz / 2);
    cir1.setAttribute("cy", sz / 2);
    cir1.setAttribute("r", sz / 2);
    cir1.setAttribute("fill", color);

    // attach the shape to svg
    //svg1.appendChild(cir1);
    svg1.appendChild(outerRect);
    svg1.appendChild(rect);
    svg1.appendChild(txtName);
    svg1.appendChild(txtSymbol);
    svg1.appendChild(txtVal);
    svg1.appendChild(overlayRect);

    return svg1;
  }
  createType(id, type) {
    this.byId[id] = {type: type};
  }

  //not yet implemented
  createCadre(id, power, unit, region, cv, showDataToFactionList) {
    // let elem = this.createCadreG(power, unit, 1, 50);
    // let cadre = new MS(id, board);
    // cadre.setElement(elem, 50, 50);
    // this.byId[id] = cadre;
    console.log('*** Manager.createCadre)',id,power,unit,region,cv);

    //power provides color
    let color = troopColors[power];
    //unit provides text and symbol
    let name = troopInfo[unit][0];
    let letter = troopInfo[unit][1];
    let scaleFactor = troopInfo[unit][2];

    // cv provides number
    //region provides pos
    let posx = this.get(region).x+-20;
    let posy = this.get(region).y+40;

    console.log(posx,posy)

    let val = cv;

    let percentage = 6.25;
    let sz = 60; //SZ.cadrePrototype;

    const fs1 = {
      Infantry: {fz: 0.5, x: 0.5, y: 1/6},
      Fleet: {fz: 0.25, x: 0.45, y: 1/4},
      Convoy: {fz: 0.35, x: 0.5, y: 1/6},
      Tank: {fz: 0.25, x: 0.54, y: 1/5.5},
      AirForce: {fz: 0.6, x: 0.5, y: 1/5},
      Carrier: {fz: 0.25, x: 0.5, y: 1/6},
      Submarine: {fz: 0.25, x: 0.5, y: 1/5},
      Fortress: {fz: 0.6, x: 0.5, y: 1/5.5}
    };
    let f = fs1[unit];
    
    

    let cadre = new MS(id,board)
      .roundedRect({w: sz, h: sz, fill: color, rounding: sz*.1})
      .roundedRect({className: "ms",w: sz*.9, h: sz*.9, fill: "rgba(0,0,0,.5)", rounding: sz*.08})
      .text({fz: sz / 6, y:(-.3*sz), txt: name, fill: "orange"})
      .text({
        family: "Military RPG",
        fz: sz * f.fz,
        y:sz*f.y,
         txt: letter,
        fill: "rgba(255,255,255,.3)"
      })
      .text({fz: sz / 2, y:sz*.1, txt: val, fill: "black"})
      .setPos(posx,posy).draw();

    // let cadre = new MS(id,board)
    //   .roundedRect({w: 100, h: 100, x: 50, y: 50, fill: color, rounding: 10})
    //   .roundedRect({className: "ms",w: 90, h: 90, x: 50, y: 50, fill: "rgba(0,0,0,.5)", rounding: 8})
    //   .text({fz: sz / 6, x: sz / 2, y: 30, txt: name, fill: "orange"})
    //   .text({
    //     family: "Military RPG",
    //     fz: sz * f.fz,
    //     x: sz * f.x,
    //     y: sz * f.y,
    //     txt: letter,
    //     fill: "rgba(255,255,255,.3)"
    //   })
    //   .text({fz: sz / 2, x: sz / 2, y: 70, txt: val, fill: "black"})
    //   .setPos(posx,posy).draw();

    //console.log(cadre);
    return cadre;
  }
  create(id, typelist, parent, sz) {}
  createCadreG(power = "Britain", unitType = "Fortress", cv = 1, sz = 100) {
    // get type symbol
    let info = troopInfo[unitType];
    let letter = info[1];
    let scaleFactor = info[2];
    let name = info[0];

    // calculate color
    let rgb = troopColors[power];
    let color = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;

    // calculate value (1)
    let val = cv;

    // create svg element
    const svg1 = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg1.setAttribute("width", sz);
    svg1.setAttribute("height", sz);
    svg1.id = this.getCombinedId(power, unitType);

    // create symbol
    // <text x="13%" y="80%" fill="rgba(255,255,255,.3)" class="milgiant">0</text>
    const txtSymbol = document.createElementNS("http://www.w3.org/2000/svg", "text");
    const fs = {
      Infantry: {fz: 0.5, x: 0.5, y: 5 / 6},
      Fleet: {fz: 0.35, x: 0.45, y: 4 / 5.2},
      Convoy: {fz: 0.35, x: 0.5, y: 5 / 6},
      Tank: {fz: 0.25, x: 0.5, y: 5 / 6.4},
      AirForce: {fz: 0.6, x: 0.5, y: 5.2 / 6},
      Carrier: {fz: 0.25, x: 0.5, y: 5 / 6.4},
      Submarine: {fz: 0.25, x: 0.5, y: 5 / 6.4},
      Fortress: {fz: 0.6, x: 0.5, y: 5.2 / 6}
    };
    let f = fs[unitType];
    txtSymbol.setAttribute("font-family", "Military RPG");
    txtSymbol.setAttribute("font-size", "" + sz * f.fz + "px"); //(scaleFactor*1.5)+"rem");
    txtSymbol.setAttribute("x", sz * f.x);
    txtSymbol.setAttribute("y", sz * f.y);
    txtSymbol.setAttribute("text-anchor", "middle");
    txtSymbol.textContent = letter;
    txtSymbol.setAttribute("fill", "rgba(255,255,255,.3)");

    // create value
    // <text x="35%" y="66%" fill="white" font-size="40px">1</text>
    const txtVal = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txtVal.setAttribute("font-size", "" + sz / 2 + "px");
    txtVal.setAttribute("x", sz / 2);
    txtVal.setAttribute("y", "70%");
    txtVal.setAttribute("text-anchor", "middle");
    txtVal.textContent = val;
    txtVal.setAttribute("fill", "white");

    // create name
    // <text x="40" y="10%" text-anchor="middle" fill="orange" font-size="12px">Fortress</text>
    const txtName = document.createElementNS("http://www.w3.org/2000/svg", "text");
    txtName.setAttribute("font-size", "" + sz / 6 + "px");
    txtName.setAttribute("x", sz / 2);
    txtName.setAttribute("y", "28%");
    txtName.setAttribute("text-anchor", "middle");
    txtName.textContent = name;
    txtName.setAttribute("fill", "orange");

    // create a shape
    // <rect x="15%" y="15%" width="70%" height="70%" style="fill:rgba(0,0,0,.5);stroke-width:1;stroke:rgb(0,0,0)" />
    const outerRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    outerRect.setAttribute("x", "0%");
    outerRect.setAttribute("y", "0%");
    outerRect.setAttribute("rx", "10%");
    outerRect.setAttribute("ry", "10%");
    outerRect.setAttribute("width", "100%");
    outerRect.setAttribute("height", "100%");
    outerRect.style = `fill:${color};stroke-width:1;stroke:rgb(0,0,0)`;

    const overlayRect = outerRect.cloneNode();
    overlayRect.setAttribute("class", "overlay");
    overlayRect.setAttribute("style", `fill:white;`);
    ////console.log(overlayRect);
    //overlayRect.style = `fill:transparent;stroke-width:0;`;
    //overlayRect.classList.add('region');

    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let percentage = 6.25;
    rect.setAttribute("x", percentage + "%");
    rect.setAttribute("y", percentage + "%");
    rect.setAttribute("rx", "5%");
    rect.setAttribute("ry", "5%");
    rect.setAttribute("width", 100 - 2 * percentage + "%");
    rect.setAttribute("height", 100 - 2 * percentage + "%");
    rect.style = "fill:rgba(0,0,0,.5);stroke-width:1;stroke:rgb(0,0,0)";

    // create a shape
    const cir1 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    cir1.setAttribute("cx", sz / 2);
    cir1.setAttribute("cy", sz / 2);
    cir1.setAttribute("r", sz / 2);
    cir1.setAttribute("fill", color);

    // attach the shape to svg
    //svg1.appendChild(cir1);
    svg1.appendChild(outerRect);
    svg1.appendChild(rect);
    svg1.appendChild(txtName);
    svg1.appendChild(txtSymbol);
    svg1.appendChild(txtVal);
    svg1.appendChild(overlayRect);

    return svg1;
  }

  //unused
  createCadrePrototypeFromScatch(power, unit, cv = 1) {
    // cadre prototypes are free floating objects that can be appended to or removed from an svg/g container

    // get type symbol
    let name = troopInfo[unit][0];
    let letter = troopInfo[unit][1];
    let scaleFactor = troopInfo[unit][2];

    // calculate color
    let rgb = troopColors[power];
    let color = `rgba(${rgb[0]},${rgb[1]},${rgb[2]},1)`;

    // calculate value (default 1)
    let val = cv;

    let id = this.getCombinedId(power, unit);
    ////console.log('creating: ',id)

    let percentage = 6.25;
    let sz = 100; //SZ.cadrePrototype;
    let f = fs[unit];

    let cadre = new MS(id)
      .roundedRect({w: 100, h: 100, x: 50, y: 50, fill: color, rounding: "10%"})
      .roundedRect({w: 90, h: 90, x: 50, y: 50, fill: "rgba(0,0,0,.5)", rounding: "6%"})
      .text({fz: sz / 6, x: sz / 2, y: "28%", txt: name, fill: "orange"})
      .text({
        family: "Military RPG",
        fz: sz * f.fz,
        x: sz * f.x,
        y: sz * f.y,
        txt: letter,
        fill: "rgba(255,255,255,.3)"
      })
      .text({fz: sz / 2, x: sz / 2, y: "70%", txt: val, fill: "white"})
      .roundedRect({className: "overlay", w: 100, h: 100, x: 50, y: 50, fill: "white", rounding: "10%"});
    // .roundedRect({w: "100", h: "100", fill: 'red', rounding: "10%"})//, unit: "%"})
    // .roundedRect({
    //   x: percentage + "%",
    //   y: percentage + "%",
    //   rounding: "5%",
    //   w: 100 - 2 * percentage + "%",
    //   h: 100 - 2 * percentage + "%",
    //   fill: "rgba(0,0,0,.5)",
    //   unit: "%"
    // })
    // .text({fz: sz / 6, x: sz / 2, y: "28%", txt: name, fill: "orange"})
    // .text({family: "Military RPG", fz: sz * f.fz, x: sz * f.x, y: sz * f.y, txt: letter, fill: "rgba(255,255,255,.3)"})
    // .text({fz: sz / 2, x: sz / 2, y: "70%", txt: val, fill: "white"});

    this.byId[id] = cadre;

    //if (id == "Germany_Infantry"){//console.log(this.byId[id])}
    ////console.log(cadre,cadre.elem)
  }

  convertActionTree(t) {
    //analyse types (region,decks,hand,unit(prototype for cadre),power,cadre(instance of cadre on board))
    //types can be stored in Manager when creating objects
    //from object,the type can be found
    let typelist = this.detectTreeTypes(t); // eg. ["power", "unknown", "region", "unit"]

    //from list of types to select, infer selection sequence and howManyLevelsPerSelection
    // (eg., for cadre prototype selection: power & unit levels are combined to type proto
    let res = this.typelistTranslator(typelist);
    ////console.log('res',res)
    let levelTypes = res.levelTypes;
    let levelsPerChoice = res.levelsPerChoice;
    let choiceTypes = res.choiceTypes;
    let orderIndices = levelTypes.map(x => typelist.indexOf(x));
    //console.log(levelTypes, orderIndices, levelsPerChoice, choiceTypes);

    //from selection sequence, serverTree is transformed into selectionTree

    let selectionTree = fromResortedLevelsNew(t, orderIndices);
    selectionTree.print();
    return {tree: selectionTree, levelTypes: levelTypes, levelsPerChoice: levelsPerChoice, choiceTypes: choiceTypes};
  }
  detectTreeTypes(t) {
    // assumes t has 1 type by level and all branches have same length

    let branch = t.branchlist(-1, false)[0];
    ////console.log('branch:')
    ////console.log(branch)
    let types = [];
    for (const arr of branch) {
      types.push(this.getType(arr[0]));
    }
    //console.log(types); // eg. ["power", "unknown", "region", "unit"]
    return types;
  }
  displayChoices(idlists, handler) {
    //depending on ids,types and objects, manager knows how selection is facilitated
    //assumes that all objects are of same type
    //console.log("*********manager");
    let idlist = idlists.map(l => this.getCombinedId(...l));
    //console.log(idlist);
    let objects = idlist.map(id => this.get(id));

    // if objects
    let type = this.getType(idlist[0]);
    //console.log("objects[0] is.............", objects[0]);
    //console.log("the type is.............", type);
    //console.log("the type is.............", type);
    if (type == "proto") {
      // need to display cadres
      //console.log("sollte eigentlich prototypes displayen!!!");
      clearElement(troopDisplay);
      this.displayCadrePrototypes(idlist);
    }
    objects.map(o => o.makeSelectable());
    objects.map(o => o.elem.addEventListener("click", handler));
  }
  displayCadrePrototypes(ids) {
    var d = troopDisplay;
    troopDisplay.style.display = "grid";
    // d.classList.remove('hidden'); //TODO: why does this not work?!?!?
    var n = ids.length;
    //console.log(ids.toString());
    var sz = SZ.cadrePrototype;
    for (var i = 0; i < n; i++) {
      let cadre = this.get(ids[i]);
      let szString = "" + sz + "px";
      d.appendChild(cadre.elem);
    }
    let dims = calculateDims(n, sz);
    var sGridColumn = `${sz}px `.repeat(dims.cols);
    d.classList.add("gridContainer");
    d.style.gridTemplateColumns = `repeat(auto-fill,${sGridColumn})`;
    d.style.width = dims.width + "px";
    d.style.padding = dims.padding + "px";
    d.style.gridGap = dims.gap + "px";
  }

  transformToIds(idlists) {
    return idlists.map(l => this.getCombinedId(...l));
  }
  typelistTranslator(typelist) {
    // game specific: translates a list of required types (from server action data) into result:
    // {order:typelist reflecting order of selection,
    //  levels:number of tree levels per selection}
    // eg. for cadre prototype placement selection:
    // will return {order:['region','power','unit'],levels:[1,2]}
    let skey = typelist.join("_");
    let transDict = {
      power_unknown_region_unit: {
        levelTypes: ["region", "power", "unit"],
        levelsPerChoice: [1, 2],
        choiceTypes: ["region", "proto"]
      }
    };
    return transDict[skey];
  }
  getByType(ids, type) {
    //console.log(ids);
    let res = ids.filter(id => this.byId[id].type == type)[0];
    //console.log("!!!!!!!!!!!!!!!!!!!! ", res);
    return res;
  }
  placeCadre(msCadre, msRegion) {

    //msCadre.setPos(msRegion.x,msRegion.y).draw();
    msCadre.tag("region", msRegion.id);
  }
  // action(command, newId, ids) {
  //   let objects = ids.map(x => this.get(x));
  //   switch (command) {
  //     case "placeCadre":
  //       //look for region
  //       let msRegion = this.get(this.getByType(ids, "region"));
  //       //console.log(msRegion);
  //       //look for proto
  //       let primitiveIds = ids.map(id => this.getIdParts(id)).flat();
  //       let power = this.getByType(primitiveIds, "power");
  //       let unit = this.getByType(primitiveIds, "unit");
  //       //create board cadre from proto
  //       //let msCadre = this.createCadre(newId, power, unit);
  //       // place cadre on region
  //       //this.placeCadre(msCadre, msRegion);
  //   }
  // }
}
