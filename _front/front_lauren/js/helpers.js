//#region array helpers
function addAll(akku, other) {
  for (const el of other) {
    akku.push(el);
  }
  return akku;
}
function cartesian(s1, s2, sep = "_") {
  let res = [];
  for (const el1 of s1) {
    for (const el2 of s2) {
      res.push(el1 + "_" + el2);
    }
  }
  return res;
}
function cartesianOf(ll) {
  // like a branchlist in MTree
  let cart = ll[0];
  for (let i = 1; i < ll.length; i++) {
    cart = cartesian(cart, ll[i]);
  }
  return cart;
}
function contains(arr,el){return arr.includes(el);}
function choose(arr, n) {
  var result = new Array(n),
    len = arr.length,
    taken = new Array(len);
  if (n > len) throw new RangeError("getRandom: more elements taken than available");
  while (n--) {
    var x = Math.floor(Math.random() * len);
    result[n] = arr[x in taken ? taken[x] : x];
    taken[x] = --len in taken ? taken[len] : len;
  }
  return result;
}
function empty(arr) {
  return arr===undefined||arr===null||!Array.isArray(arr)?true : arr.length == 0;
}
function first(arr){return arr.length>0? arr[0]:null;}
function keepOnlyElements(func, lst) {
  return lst.filter(func);
}
function last(arr){return arr.length>0? arr[arr.length-1]:null;}
function sameList(l1, l2) {
  // compares 2 lists of strings if have same strings in it
  if (l1.length != l2.length) return false;
  for (const s of l1) {
    if (!l2.includes(s)) return false;
  }
  return true;
}
function without(arr, elementToRemove) {
  return arr.filter(function(el) {
    return el !== elementToRemove;
  });
}

//#endregion array helpers

//#region dictionary helpers
function isType(sType, val) {
  // uses existing (global) config data to infer type from val
  ////console.log("isType called!",sType, val, regions, units);
  switch (sType) {
    case "region":
      return val in regions;
    case "power":
      return val in unitsPerPower;
    case "unit":
      return val in units;
    case "faction":
      return val in ["Axis", "West", "USSR"];
  }
  return false;
}
function inferType(val) {
  for (const t of ["region", "power", "unit", "faction"]) {
    if (isType(t, val)) {
      return t;
    }
  }
  return "unknown";
}
//#endregion dictionary helpers

//#region color helpers
function blackOrWhite(cssHSLA, maxLumForWhite = 88) {
  //returns 'black' or 'white' depending on hue and luminosity
  let l = getLuminosity(cssHSLA);
  let hue = getHue(cssHSLA);
  if (hue > 40 && hue < 90) maxLumForWhite = 60;
  let result = l <= maxLumForWhite ? "white" : "black";
  ////console.log('lum('+l+'), hue('+hue+') : '+result);
  return result;
}

function colorNameToHexString(str) {
  //str is color name
  var ctx = document.createElement("canvas").getContext("2d");
  ctx.fillStyle = str;
  return ctx.fillStyle;
}

function colorNameToHslaString(str) {
  let hex = colorNameToHexString(str);
  //hex string to rgb
  let rgb = hexToRgb(hex);
  //rgb to hsv
  let hsv = rgbToHsv(rgb.r, rgb.g, rgb.b);
  //hsv to hsl
  let hsl = hsvToHsl(hsv.h, hsv.s, hsv.v);
  //hsl to hsla string
  hsla = hslToHslaString(hsl.h, hsl.s, hsl.l, 1);
  return hsla;
}

function getColorNames() {
  return [
    "AliceBlue",
    "AntiqueWhite",
    "Aqua",
    "Aquamarine",
    "Azure",
    "Beige",
    "Bisque",
    "Black",
    "BlanchedAlmond",
    "Blue",
    "BlueViolet",
    "Brown",
    "BurlyWood",
    "CadetBlue",
    "Chartreuse",
    "Chocolate",
    "Coral",
    "CornflowerBlue",
    "Cornsilk",
    "Crimson",
    "Cyan",
    "DarkBlue",
    "DarkCyan",
    "DarkGoldenRod",
    "DarkGray",
    "DarkGrey",
    "DarkGreen",
    "DarkKhaki",
    "DarkMagenta",
    "DarkOliveGreen",
    "DarkOrange",
    "DarkOrchid",
    "DarkRed",
    "DarkSalmon",
    "DarkSeaGreen",
    "DarkSlateBlue",
    "DarkSlateGray",
    "DarkSlateGrey",
    "DarkTurquoise",
    "DarkViolet",
    "DeepPink",
    "DeepSkyBlue",
    "DimGray",
    "DimGrey",
    "DodgerBlue",
    "FireBrick",
    "FloralWhite",
    "ForestGreen",
    "Fuchsia",
    "Gainsboro",
    "GhostWhite",
    "Gold",
    "GoldenRod",
    "Gray",
    "Grey",
    "Green",
    "GreenYellow",
    "HoneyDew",
    "HotPink",
    "IndianRed",
    "Indigo",
    "Ivory",
    "Khaki",
    "Lavender",
    "LavenderBlush",
    "LawnGreen",
    "LemonChiffon",
    "LightBlue",
    "LightCoral",
    "LightCyan",
    "LightGoldenRodYellow",
    "LightGray",
    "LightGrey",
    "LightGreen",
    "LightPink",
    "LightSalmon",
    "LightSeaGreen",
    "LightSkyBlue",
    "LightSlateGray",
    "LightSlateGrey",
    "LightSteelBlue",
    "LightYellow",
    "Lime",
    "LimeGreen",
    "Linen",
    "Magenta",
    "Maroon",
    "MediumAquaMarine",
    "MediumBlue",
    "MediumOrchid",
    "MediumPurple",
    "MediumSeaGreen",
    "MediumSlateBlue",
    "MediumSpringGreen",
    "MediumTurquoise",
    "MediumVioletRed",
    "MidnightBlue",
    "MintCream",
    "MistyRose",
    "Moccasin",
    "NavajoWhite",
    "Navy",
    "OldLace",
    "Olive",
    "OliveDrab",
    "Orange",
    "OrangeRed",
    "Orchid",
    "PaleGoldenRod",
    "PaleGreen",
    "PaleTurquoise",
    "PaleVioletRed",
    "PapayaWhip",
    "PeachPuff",
    "Peru",
    "Pink",
    "Plum",
    "PowderBlue",
    "Purple",
    "RebeccaPurple",
    "Red",
    "RosyBrown",
    "RoyalBlue",
    "SaddleBrown",
    "Salmon",
    "SandyBrown",
    "SeaGreen",
    "SeaShell",
    "Sienna",
    "Silver",
    "SkyBlue",
    "SlateBlue",
    "SlateGray",
    "SlateGrey",
    "Snow",
    "SpringGreen",
    "SteelBlue",
    "Tan",
    "Teal",
    "Thistle",
    "Tomato",
    "Turquoise",
    "Violet",
    "Wheat",
    "White",
    "WhiteSmoke",
    "Yellow",
    "YellowGreen"
  ];
}

function getColorHexes(x) {
  return [
    "f0f8ff",
    "faebd7",
    "00ffff",
    "7fffd4",
    "f0ffff",
    "f5f5dc",
    "ffe4c4",
    "000000",
    "ffebcd",
    "0000ff",
    "8a2be2",
    "a52a2a",
    "deb887",
    "5f9ea0",
    "7fff00",
    "d2691e",
    "ff7f50",
    "6495ed",
    "fff8dc",
    "dc143c",
    "00ffff",
    "00008b",
    "008b8b",
    "b8860b",
    "a9a9a9",
    "a9a9a9",
    "006400",
    "bdb76b",
    "8b008b",
    "556b2f",
    "ff8c00",
    "9932cc",
    "8b0000",
    "e9967a",
    "8fbc8f",
    "483d8b",
    "2f4f4f",
    "2f4f4f",
    "00ced1",
    "9400d3",
    "ff1493",
    "00bfff",
    "696969",
    "696969",
    "1e90ff",
    "b22222",
    "fffaf0",
    "228b22",
    "ff00ff",
    "dcdcdc",
    "f8f8ff",
    "ffd700",
    "daa520",
    "808080",
    "808080",
    "008000",
    "adff2f",
    "f0fff0",
    "ff69b4",
    "cd5c5c",
    "4b0082",
    "fffff0",
    "f0e68c",
    "e6e6fa",
    "fff0f5",
    "7cfc00",
    "fffacd",
    "add8e6",
    "f08080",
    "e0ffff",
    "fafad2",
    "d3d3d3",
    "d3d3d3",
    "90ee90",
    "ffb6c1",
    "ffa07a",
    "20b2aa",
    "87cefa",
    "778899",
    "778899",
    "b0c4de",
    "ffffe0",
    "00ff00",
    "32cd32",
    "faf0e6",
    "ff00ff",
    "800000",
    "66cdaa",
    "0000cd",
    "ba55d3",
    "9370db",
    "3cb371",
    "7b68ee",
    "00fa9a",
    "48d1cc",
    "c71585",
    "191970",
    "f5fffa",
    "ffe4e1",
    "ffe4b5",
    "ffdead",
    "000080",
    "fdf5e6",
    "808000",
    "6b8e23",
    "ffa500",
    "ff4500",
    "da70d6",
    "eee8aa",
    "98fb98",
    "afeeee",
    "db7093",
    "ffefd5",
    "ffdab9",
    "cd853f",
    "ffc0cb",
    "dda0dd",
    "b0e0e6",
    "800080",
    "663399",
    "ff0000",
    "bc8f8f",
    "4169e1",
    "8b4513",
    "fa8072",
    "f4a460",
    "2e8b57",
    "fff5ee",
    "a0522d",
    "c0c0c0",
    "87ceeb",
    "6a5acd",
    "708090",
    "708090",
    "fffafa",
    "00ff7f",
    "4682b4",
    "d2b48c",
    "008080",
    "d8bfd8",
    "ff6347",
    "40e0d0",
    "ee82ee",
    "f5deb3",
    "ffffff",
    "f5f5f5",
    "ffff00",
    "9acd32"
  ];
}

function getLuminosity(cssHSLA) {
  //return luminosity in percent
  ////console.log('css: ',cssHSLA);
  let ints = allNumbers(cssHSLA);
  return ints[2];
}

function getHue(cssHSLA) {
  //return luminosity in percent
  ////console.log('css: ',cssHSLA);
  let h = firstNumber(cssHSLA);
  return h;
}

function hexToRgb(hex) {
  var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}

function hslToHsv(h, s, l) {
  //h in [0,360], s,l in percent, a in [0,1]
  let newh = h;
  l /= 100.0;
  s /= 100.0;
  //console.log(h, s, l);
  let newv = (2 * l + s * (1 - Math.abs(2 * l - 1))) / 2;
  let news = (2 * (newv - l)) / newv;
  //console.log(newh, news, newv);
  let rgb = hsvToRgb(newh, news, newv);
  let result = [h, s, l, newh, news, newv];
  result.push(rgbToHex(rgb[0], rgb[1], rgb[2]));
  return result;
}

function hslToHslaString(h, s, l, a = 1) {
  // hsl is object
  return "hsla(" + h + ", " + s + "%, " + l + "%, " + a + ")";
}

function hsvToHsl(h, s, v) {
  //h in [0,360], s,l in percent, a in [0,1]
  let newh = h;
  l /= 100.0;
  v /= 100.0;
  //console.log(h, s, v);
  let newl = 0.5 * v * (2 - s);
  let news = (v * s) / (1 - Math.abs(2 * l - 1));
  //console.log(newh, news, newl);
  return {
    h: newh,
    s: news,
    l: newl
  };
  // let rgb = hsvToRgb(newh,news,newv);
  // let result = [h,s,l,newh,news,newv];
  // result.push(rgbToHex(rgb[0],rgb[1],rgb[2]));
  // return result;
}

function hsvToRgb(h, s, v) {
  //expects input: h in [0,360] and s,v in [0,1] - output: [r,g,b] in [0,1]
  let f = (n, k = (n + h / 60) % 6) => v - v * s * Math.max(Math.min(k, 4 - k, 1), 0);
  //return [f(5),f(3),f(1)]; // this returns r,g,b in [0,1]
  return [Math.floor(f(5) * 255), Math.floor(f(3) * 255), Math.floor(f(1) * 255)];
}

function hue(h) {
  var r = Math.abs(h * 6 - 3) - 1;
  var g = 2 - Math.abs(h * 6 - 2);
  var b = 2 - Math.abs(h * 6 - 4);
  return [Math.floor(r * 255), Math.floor(g * 255), Math.floor(b * 255)];
}

function idealTextColor(bg, grayPreferred = false) {
  //bg color name or hex string!
  const nThreshold = 40; //105;
  if (bg.substring(0, 1) != "#") bg = colorNameToHexString(bg);
  rgb = hexToRgb(bg);
  r = rgb.r;
  g = rgb.g;
  b = rgb.b;
  var bgDelta = r * 0.299 + g * 0.587 + b * 0.114;
  var foreColor = 255 - bgDelta < nThreshold ? "black" : "white";
  if (grayPreferred) foreColor = 255 - bgDelta < nThreshold ? "dimgray" : "snow";
  return foreColor;
}

function randomColor(s = 100, l = 70, a = 1) {
  //s,l in percent, a in [0,1], returns hsla string
  var hue = Math.random() * 360;
  return hslToHslaString(hue, s, l, a);
}

function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
}

function rgbToHsv(r, g, b) {
  let v = Math.max(r, g, b);
  let n = v - Math.min(r, g, b);
  let h = n && (v == r ? (g - b) / n : v == g ? 2 + (b - r) / n : 4 + (r - g) / n);
  h = 60 * (h < 0 ? h + 6 : h);
  s = v && n / v;
  return {
    h: h,
    s: s,
    v: v
  };
}
//#endregion

//#region file helpers
function loadJSON(path, callback) {
  //console.log(path);
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", path, true); //path example: '../news_data.json'
  xobj.onreadystatechange = function() {
    if (xobj.readyState == 4 && xobj.status == "200") {
      callback(JSON.parse(xobj.responseText));
    }
  };
  xobj.send(null);
}
function loadYML(path, callback) {
  ////console.log(path);
  res = undefined;
  $.get(path) // eg. '/common/resources/LessonContentsLv01Ln01.yml'
    .done(function(data) {
      ////console.log("File load complete");
      var yml = jsyaml.load(data);
      ////console.log(yml);
      var jsonString = JSON.stringify(data);
      var json = $.parseJSON(jsonString);
      ////console.log(jsonString);
      ////console.log(json);
      callback(yml);
    });
}
//usage: https://stackoverflow.com/questions/48073151/read-local-json-file-into-variable
// loadJSON(function(json) {
//   //console.log(json); // this will log out the json object
// });
//#endregion file helpers

//#region DOM helpers:
function clearElement(elem, eventHandlerDictByEvent = {}) {
  while (elem.firstChild) {
    for (key in eventHandlerDictByEvent) {
      elem.removeEventListener(key, eventHandlerDictByEvent[key]);
    }
    elem.removeChild(elem.firstChild);
  }
}
function closestParent(elem, selector) {
  for (; elem && elem !== document; elem = elem.parentNode) {
    if (elem.matches(selector)) return elem;
  }
  return null;
}
function findParentWithId(elem) {
  ////console.log(elem);
  while (elem && !elem.id) {
    elem = elem.parentNode;
  }
  ////console.log("parent with id: ", elem);
  return elem;
}
function evToId(ev){
  let elem = findParentWithId(ev.target);
  return elem.id;
}
function getParentOfScript() {
  // finds script in which this function is called
  var thisScript = document.scripts[document.scripts.length - 1];
  var parent = thisScript.parentElement;
  return parent;
}
function getTextWidth(text, font) {
  // re-use canvas object for better performance
  var canvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement("canvas"));
  var context = canvas.getContext("2d");
  context.font = font;
  var metrics = context.measureText(text);
  return metrics.width;
}
function insertHere() {
  var thisScript = document.scripts[document.scripts.length - 1];
  var parent = thisScript.parentElement;
  for (let i = 0; i < arguments.length; i++) {
    const el = arguments[i];
    if (typeof el == "string") {
      thisScript.nextSibling.insertAdjacentHTML("beforebegin", el);
    } else {
      parent.insertBefore(el, thisScript.nextSibling);
    }
  }
}
//tableCreate();
function makeTable(tableName, rowHeaders, colHeaders) {
  let cols = colHeaders.length + 1;
  let rows = rowHeaders.length + 1;
  let sh = `<table id='${tableName}'><tr><th></th>`;
  for (const ch of colHeaders) {
    sh += `<th id='${ch}Header'>${ch}</th>`;
  }
  sh += `</tr>`;
  for (const rh of rowHeaders) {
    sh += `<tr id='${rh}${tableName}'><th>${rh}</th>`;
    for (const ch of colHeaders) {
      sh += `<td id='${rh}${ch}'>0</td>`;
    }
    sh += `</tr>`;
  }
  sh += `</table>`;
  let res = (elem = new DOMParser().parseFromString(sh, "text/html").body.firstChild);
  return res;
}
function makeCadreTable(powers) {
  let cadreTypes = ["Infantry", "Fortress", "Tank", "AirForce", "Fleet", "Carrier", "Submarine"];
  //let powers = ['Germany','Italy','Britain','France','USA','USSR'];
  let table = makeTable("AvailableCadres", cadreTypes, powers);
  addTableTo(table);
}
function addTableTo(table) {
  let div = document.getElementById("slideInAvailableCadres");
  div.appendChild(table);
}

//#endregion

//#region string helpers:
function allNumbers(s) {
  //returns array of all numbers within string s
  return s.match(/\d+\.\d+|\d+\b|\d+(?=\w)/g).map(v => {
    return +v;
  });
}

function eraseSpaces(s) {
  let i = 0;
  while (s.includes("  ")) {
    ////console.log(i++ + ": ", s);
    s = s.replace("  ", " ");
    s = s.replace(" {", "{");
    s = s.replace(" (", "(");
    s = s.replace("\n ", " ");
    s = s.replace("\n{", "{");
    s = s.replace("\n}", "}");
  }
  return s;
}

function getLines(s) {
  // returns array of lines in s
  var str = s;
  var res = str.split("\n");
  return res;
}

function firstNumber(s) {
  // returns first number in string s
  return s ? Number(s.match(/-?\d+/).shift()) : -1;
}

function firstPositiveNumber(s) {
  // returns first number in string s
  return s ? Number(s.match(/\d+/).shift()) : -1;
}

function padSep(sep, n, args) {
  //sep..separator string, n..length of result, args are arbitrary numbers
  s = "";
  for (var i = 2; i < arguments.length; i++) {
    s += arguments[i].toString().padStart(n, "0") + sep;
  }
  return s.substring(0, s.length - 1);
}
function startsWith(s, sSub) {
  ////console.log('startWith: s='+s+', sSub='+sSub,typeof(s),typeof(sSub));
  return s.substring(0, sSub.length) == sSub;
}
function stringAfter(sFull, sSub) {
  ////console.log('s='+sFull,'sub='+sSub)
  let idx = sFull.indexOf(sSub);
  ////console.log('idx='+idx)
  if (idx < 0) return "";
  return sFull.substring(idx + sSub.length);
}
function stringBefore(sFull, sSub) {
  let idx = sFull.indexOf(sSub);
  if (idx < 0) return sFull;
  return sFull.substring(0, idx);
}
//#endregion

//#region type and conversion helpers
function getTypeOf(param) {
  let type = typeof param;
  ////console.log("typeof says:" + type);
  if (typeof param == "object") {
    type = param.constructor.name;
  }
  let lType = type.toLowerCase();
  if (lType.includes("event")) type = "event";
  ////console.log("this param is of type: " + type);
  ////console.log(param);
  return type;
}
function isEvent(param) {
  return getTypeOf(param) == "event";
}
function isString(param) {
  return getTypeOf(param) == "string";
}
function isMS(param) {
  return getTypeOf(param) == "MS";
}
function convertToMS(p) {
  let res = undefined;
  if (isMS(p)) {
    ////console.log("convertToMS: isMS ", p);
    res = p;
  } else if (isEvent(p)) {
    ////console.log("convertToMS: isEvent ", p);
    p = p.target;
    res = findParentWithId(p);
    res = MS.byId[res.id];
  } else if (isString(p)) {
    //assume that this is the id
    ////console.log("convertToMS: isString ", p);
    res = MS.byId[p];
  } else {
    //assume some ui element
    ////console.log("convertToMS: else ", res);
  }
  ////console.log("convertToMS: RESULT=", res);
  return res;
}
//#endregion

function calculateDims(n, sz = 60, minRows = 1) {
  var rows = minRows;
  var cols = Math.ceil(n / rows);
  var gap = 10;
  var padding = 20;
  let w = 9999999;
  while (true) {
    for (var i = Math.max(2, minRows); i < n / 2; i++) {
      if (n % i == 0) {
        rows = i;
        cols = n / i;
        break;
      }
    }
    w = padding * 2 - gap + (sz + gap) * cols;
    if (w > window.innerWidth) {
      if (gap > 1) gap -= 1;
      else if (padding > 1) padding -= 2;
      else {
        minRows += 1;
        gap = 6;
        padding = 10;
      }
    } else break;
  }
  return {rows: rows, cols: cols, gap: gap, padding: padding, width: w};
}

