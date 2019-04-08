class MS {
  constructor(id, parent = null) {
    // id must be unique (TODO: check for uniqueness, wahrscheinlich im MSManager)
    // parent should be g or svg element
    // ms is a g element with stuff inside
    // if parent is null, this is a floating ms element that can be appended or removed to/from parent.
    // otherwise this is an element that lives on a parent and is hidden if not visible
    this.isFloating = parent == null;
    this.isDrawn = false;
    this.parent = parent;
    this.id = id;
    this.elem = document.createElementNS("http://www.w3.org/2000/svg", "g");
    this.elem.id = id;
    this.x=0;
    this.y=0;
    this.bounds = {
      cx: 0,
      cy: 0,
      w: 0,
      h: 0,
      l: 0,
      t: 0,
      r: 0,
      b: 0
    }; //dimensions of first child (supposedly largest)
    this.data = {}; // key value list that can be stored in an element
    this.unit = undefined;
    this.interactiveChild = undefined;
  }
  //#region UI: elem,parent,position,draw...
  getUI() {
    return this.elem;
  }
  clone(newId, parent = null, drawit = false) {
    //the clone is only drawn if drawit==true
    let cl = new MS(newId, parent ? parent : this.parent);
    cl.bounds = this.bounds.slice(); //shallow copy
    cl.data = this.data.slice(); // the following 3 not used right now!
    cl.elem = this.elem.cloneNode(true);
    if (drawit) {
      cl.draw();
    }
    return cl;
  }
  draw() {
    if (this.isFloating) {
      //console.log(id, "cannot be drawn since does not have a parent!");
    } else if (!this.isDrawn) {
      this.isDrawn = true;
      this.parent.appendChild(this.elem);
    }
    return this;
  }
  setPos(x, y) {
    this.elem.setAttribute("transform", `translate(${x},${y})`);
    this.x=x;
    this.y=y;
    this.bounds.cx = x;
    this.bounds.cy = y;
    this.bounds.l = x - this.bounds.w / 2;
    this.bounds.t = y - this.bounds.h / 2;
    this.bounds.r = x + this.bounds.w / 2;
    this.bounds.b = y + this.bounds.h / 2;
    return this;
  }
  setElement(elem, w, h) {
    if (!this.isFloating){this.removeFromUI();}
    this.elem = elem;
    this.elem.id = this.id;
    this.bounds.w = w;
    this.bounds.h = h;
    if (elem.childNodes.length > 0) {
      this.interactiveChild = elem.childNodes[0];
      this.interactiveChild.setAttribute('class','ms');
    }
    return this;
  }
  removeFromUI(){
    if (this.isDrawn && this.parent){
      this.parent.removeChild(this.elem);
      this.isDrawn = false;
    }
  }
  //#endregion UI: elem,parent,position,draw...

  //#region css class management
  addClass(className) {
    let ch = this.interactiveChild;//elem.childNodes[0];
    let clNow = ch.getAttribute("class");
    if (!clNow.includes(className)) {
      ch.setAttribute("class", clNow + " " + className);
    }
    ////console.log(ch);
  }
  removeClass(className) {
    let ch = this.interactiveChild; //elem.childNodes[0];
    let clNow = ch.getAttribute("class");
    if (clNow.includes(className)) {
      var ret = clNow.replace(className, "");
      ch.setAttribute("class", ret);
    }
    ////console.log(ch);
  }
  hasClass(className) {
    let ch = this.interactiveChild; //elem.childNodes[0];
    let clNow = ch.getAttribute("class");
    return clNow.includes(className);
  }
  //#endregion

  //#region visibility
  isVisible() {
    return !this.hasClass("hidden");
  }
  toggleVisible() {
    if (this.isVisible()) hide();
    else show();
  }
  hide() {
    this.addClass("hidden");
  }
  show() {
    this.removeClass("hidden");
  }
  //#endregion

  //#region highlight and select
  enable() {
    this.isEnabled = true;
    this.addClass("enabled");
  }
  disable() {
    this.isEnabled = false;
    this.removeClass("enabled");
  }
  isEnabled() {
    return hasClass("enabled");
  }
  isHighlighted() {
    return hasClass("highlighted");
  }
  isSelected() {
    return this.hasClass("selected");
  }
  highlight() {
    this.addClass("highlighted");
  }
  unhighlight() {
    this.removeClass("highlighted");
  }
  toggleSelection() {
    if (this.isSelected()) this.unselect();
    else this.select();
  }
  select() {
    this.addClass("selected");
    this.removeClass("highlighted");
    ////console.log(this.id, " selected");
  }
  unselect() {
    this.removeClass("selected");
    this.addClass("highlighted");
    //console.log(this.id, " unselected");
  }
  makeSelectable() {
    this.highlight();
    this.isEnabled = true;
  }
  makeUnselectable() {
    this.unhighlight();
    this.unselect();
    this.isEnabled = false;
  }
  //#endregion

  //#region color
  saveFill(indexOfChild) {
    ////console.log(this.elem.childNodes)
    indexOfChild = Math.min(this.elem.childNodes.length - 1, indexOfChild);
    let child = this.elem.childNodes[indexOfChild];
    if (child.tagName == "circle" || child.tagName == "text") {
      this.basicFill = child.getAttribute("fill");
    } else {
      this.basicFill = child.getAttribute("style");
    }
    ////console.log(child.tagName,this.basicFill);
  }
  restoreFill(indexOfChild) {
    ////console.log(this.elem.childNodes)
    indexOfChild = Math.min(this.elem.childNodes.length - 1, indexOfChild);
    let child = this.elem.childNodes[indexOfChild];
    if (child.tagName == "circle" || child.tagName == "text") {
      child.setAttribute("fill", this.basicFill);
    } else {
      child.setAttribute("style", this.basicFill);
    }
    ////console.log(child.tagName,this.basicFill);
  }
  setBackgroundColor(color, alpha = 1) {
    //das ist fill of childNode[0]
    //this.saveFill(0);
    this.setFill(0, color, alpha);
  }
  setOverlayColor(color, alpha = 1) {
    //das ist fill of childNode[childNodes.length-1]
    //this.saveFill(0);
    this.setFill(this.elem.childNodes.length - 1, color, alpha);
  }
  setFill(indexOfChild, color, alpha = 1) {
    color = this.getColor(color, alpha);
    let ch = this.elem.childNodes;
    if (ch.length <= indexOfChild) indexOfChild = 0;
    let child = ch[indexOfChild];
    if (child.tagName == "circle" || child.tagName == "text") {
      child.setAttribute("fill", color);
    } else if (child.tagName == "rect" || child.tagName == "polygon") {
      child.setAttribute("style", `fill:${color};`);
    } else if (child.tagName == "line") {
      let strokeWidth = child.style.strokeWidth;
      child.setAttribute("style", `stroke:${color};stroke-width:${strokeWidth}`);
    }
  }
  getColor(fill, alpha = 1) {
    ////console.log(fill);
    if (Array.isArray(fill)) {
      return `rgba(${fill[0]},${fill[1]},${fill[2]},${alpha})`;
    } else if (fill[0] != "#" && alpha != 1) {
      return `${fill};opacity:${alpha}`;
    } else return fill;
  }

  //#endregion

  //#region shapes
  line({x1 = 0, y1 = 0, x2 = 100, y2 = 100, fill = "red", width = 4, unit = "px"}) {
    // lines und polys nur mit px units! und numbers!!!
    // <line x1="0" y1="0" x2="200" y2="200"
    // style="stroke:rgb(255,0,0);stroke-width:2" />
    let ell = document.createElementNS("http://www.w3.org/2000/svg", "line");
    fill = this.getColor(fill, alpha);
    ell.setAttribute("x1", -(x2 - x1) / 2);
    ell.setAttribute("y1", -(y2 - y1) / 2);
    ell.setAttribute("x2", (x2 - x1) / 2);
    ell.setAttribute("y2", (y2 - y1) / 2);
    ell.setAttribute("style", `stroke:${fill};stroke-width:${width}`);
    if (this.elem.childNodes.length == 0) {
      this.bounds.w = Math.abs(x2 - x1);
      this.bounds.h = Math.abs(y2 - y1);
      this.unit = unit;
      this.interactiveChild = ell;
    }
    this.elem.appendChild(ell);
    return this;
  }
  ellipse({className = "", w = 50, h = 25, fill = "yellow", alpha = 1, x = 0, y = 0, unit = "px"}) {
    let ell = document.createElementNS("http://www.w3.org/2000/svg", "ellipse");
    fill = this.getColor(fill, alpha);
    ell.setAttribute("fill", fill);

    let nw = isString(w) ? firstNumber(w) : w;
    let nh = isString(h) ? firstNumber(h) : h;

    if (this.elem.childNodes.length == 0) {
      this.interactiveChild = ell;
      this.unit = unit;
      this.bounds.w = nw;
      this.bounds.h = nh;
    }

    ell.setAttribute("rx", nw / 2 + unit);
    ell.setAttribute("ry", nh / 2 + unit);
    ell.setAttribute("cx", x); //kann ruhig in unit % sein!!!
    ell.setAttribute("cy", y);
    if (className !== "") {
      ell.setAttribute("class", className);
    }
    this.elem.appendChild(ell);
    return this;
  }
  circle({className = "", sz = 50, fill = "yellow", alpha = 1, x = 0, y = 0, unit = "px"}) {
    return this.ellipse({
      className: className,
      w: sz,
      h: sz,
      fill: fill,
      alpha: alpha,
      x: x,
      y: y,
      unit: unit
    });
  }
  hex({className = "", w = 50, fill = "red", alpha = 1, x = 0, y = 0, unit = "px"}) {}
  poly({className = "", points, fill = "pink", alpha = 1, x = 0, y = 0, unit = "px"}) {
    // points: [{x:1,y:2},...] <polygon points="200,10 250,190 160,210"
    // style="fill:lime;stroke:purple;stroke-width:1" /> x,y should be the center of
    // the polygon
    let xmin = Math.min.apply(
      Math,
      points.map(function(o) {
        return o.x;
      })
    );
    let xmax = Math.max.apply(
      Math,
      points.map(function(o) {
        return o.x;
      })
    );
    let ymin = Math.min.apply(
      Math,
      points.map(function(o) {
        return o.y;
      })
    );
    let ymax = Math.min.apply(
      Math,
      points.map(function(o) {
        return o.y;
      })
    );
    let pts = points.map(o => {
      return {
        x: o.x - (xmax - xmin) / 2,
        y: o.y - (ymax - ymin) / 2
      };
    });
    let pts1 = points.map(o => {
      return {x: o.x, y: o.y};
    });
    let r = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    fill = this.getColor(fill, alpha);
    //todo: simplify the following
    let spts = ""; //"50,50 145,100 65,150";
    for (var p of pts) {
      spts += "" + p.x + "," + p.y + " ";
    }
    let spts1 = ""; //"50,50 145,100 65,150";
    for (var p of pts1) {
      spts += "" + p.x + "," + p.y + " ";
    }

    r.setAttribute("points", spts);
    //console.log("set points");
    //console.log(spts1, "\r\n"); //points.map(p=>{return(p.x+','+y+' ')}).join());
    //console.log(spts);
    r.setAttribute("stroke", "black");
    r.setAttribute("stroke-width", 5);
    r.setAttribute("style", `fill:${fill};`);
    if (className !== "") {
      r.setAttribute("class", className);
    }
    if (this.elem.childNodes.length == 0) {
      this.bounds.w = xmax - xmin;
      this.bounds.h = ymax - ymin;
      this.bounds.cx = xmin + this.bounds.w / 2;
      bounds.cy = ymin + this.bounds.h / 2;
      this.unit = unit;
      this.interactiveChild = r;
    }
    this.elem.appendChild(r);
    return this;
  }
  roundedRect({className = "", w = 150, h = 125, fill = "darkviolet", rounding = 10, alpha = 1, x = 0, y = 0, unit = "px"}) {
    this.rect({
      className: className,
      w: w,
      h: h,
      fill: fill,
      alpha: alpha,
      x: x,
      y: y,
      unit: unit
    });
    let r = this.elem.lastChild;
    r.setAttribute("rx", rounding); // rounding kann ruhig in % sein!
    r.setAttribute("ry", rounding);
    return this;
  }
  rect({className = "", w = 50, h = 25, fill = "yellow", alpha = 1, x = 0, y = 0, unit = "px"}) {
    let r = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    let nw = isString(w) ? firstNumber(w) : w;
    let nh = isString(h) ? firstNumber(h) : h;
    let nx = isString(x) ? firstNumber(x) : x;
    let ny = isString(y) ? firstNumber(y) : y;
    r.setAttribute("width", nw + unit);
    r.setAttribute("height", nh + unit);
    r.setAttribute("x", -nw / 2 + nx + unit);
    r.setAttribute("y", -nh / 2 + ny + unit);

    if (this.elem.childNodes.length == 0) {
      this.interactiveChild = r;
      this.unit = unit;
      this.bounds.w = nw;
      this.bounds.h = nh;
    }
    fill = this.getColor(fill, alpha);

    r.setAttribute("style", `fill:${fill};`);
    if (className !== "") {
      r.setAttribute("class", className);
    }
    this.elem.appendChild(r);
    return this;
  }
  square({className = "", sz = 50, fill = "yellow", alpha = 1, x = 0, y = 0, unit = "px"}) {
    return this.rect({
      className: className,
      w: sz,
      h: sz,
      fill: fill,
      alpha: alpha,
      x: x,
      y: y,
      unit: unit
    });
  }
  textMultiline({
    className = "",
    txt = ["one", "two", "three"],
    fz = 20,
    fill = "black",
    alpha = 1,
    x = 0,
    y = 0,
    family = "arial",
    weight = "",
    unit = "px"
  }) {
    let h = txt.length * fz;
    ////console.log("height", h);
    let yStart = y - h / 2 + fz / 2;
    let maxW = 0;
    for (const t of txt) {
      this.text({
        className: className,
        txt: t,
        fz: fz,
        fill: fill,
        alpha: alpha,
        x: x,
        y: yStart,
        family: family,
        weight: weight
      });
      maxW = Math.max(maxW, this.bounds.w);
      yStart += fz;
    }
    return this;
  }
  text({className = "", txt = "A", fz = 20, fill = "black", alpha = 1, x = 0, y = 0, family = "arial", weight = "", unit = "px"}) {
    let r = document.createElementNS("http://www.w3.org/2000/svg", "text");
    fill = this.getColor(fill, alpha);
    r.setAttribute("font-family", family);
    r.setAttribute("font-size", "" + fz + "px");
    if (weight !== "") {
      r.setAttribute("font-weight", weight);
    }
    r.setAttribute("x", x);
    r.setAttribute("y", isString(y) ? y : y + fz / 2.8 + unit);
    r.setAttribute("text-anchor", "middle");
    r.textContent = txt;
    r.setAttribute("fill", fill);
    if (className !== "") {
      r.setAttribute("class", className);
    }
    if (this.elem.childNodes.length == 0) {
      sFont = weight + " " + fz + "px " + family; //"bold 12pt arial"
      sFont = sFont.trim();
      this.bounds.w = getTextWidth(txt, sFont);
      this.bounds.h = fz;
      this.unit = unit;
      this.interactiveChild = r;
    }
    this.elem.appendChild(r);
    return this;
  }
  image({className = "", path = "", w = 50, h = 50, x = 0, y = 0, unit = "px"}) {
    //<image xlink:href="firefox.jpg" x="0" y="0" height="50px" width="50px"/>
    let r = document.createElementNS("http://www.w3.org/2000/svg", "image");
    r.setAttribute("href", path);
    let nw = isString(w) ? firstNumber(w) : w;
    let nh = isString(h) ? firstNumber(h) : h;
    let nx = isString(x) ? firstNumber(x) : x;
    let ny = isString(y) ? firstNumber(y) : y;
    r.setAttribute("width", nw + unit);
    r.setAttribute("height", nh + unit);
    r.setAttribute("x", -nw / 2 + nx + unit);
    r.setAttribute("y", -nh / 2 + ny + unit);
    if (className !== "") {
      r.setAttribute("class", className);
    }
    if (this.elem.childNodes.length == 0) {
      this.interactiveChild = r;
      this.unit = unit;
      this.bounds.w = nw;
      this.bounds.h = nh;
    }
    this.elem.appendChild(r);
    return this;
  }
  //#endregion

  //#region tags
  tag(key, val) {
    this.data[key] = val;
    return this;
  }
  hasTag(key, val) {
    return key in this.data && this.data[key] == val;
  }
  //#endregion
}
