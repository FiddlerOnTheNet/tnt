class MTree {
  constructor(key) {
    this.data = key;
    this.parent = undefined;
    this.children = [];
  }
  addChild(data) {
    let mNew = new MTree(data);
    mNew.parent = this;
    this.children.push(mNew);
    return mNew;
  }
  addData(s) {
    // just adds data item to this.data (tree structure NOT modified!)
    this.data.push(s);
  }
  addChildTree(t) {
    this.children.push(t);
    t.parent = this;
  }
  addAsChildIfNotExist(slist) {
    for (const ch of this.children) {
      if (sameList(slist, ch.data)) return ch;
      // //console.log(ch.data.toString())
      // //console.log(slist);
      // //console.log('____________________')
    }
    return this.addChild(slist);
  }
  addBranch(branch) {
    // //console.log('____________________')
    // //console.log(branch)
    if (branch.length == 0) return;
    let ch = this.addAsChildIfNotExist(branch[0]);
    // //console.log(ch)
    if (ch) {
      branch.splice(0, 1);
      ch.addBranch(branch);
    }
  }
  branchlist(maxlen = -1, skipEmpty = true) {
    // if maxlen>0 yield all branches of <= maxlen nodes
    let branch = [];
    let lst = [];
    let t = this;
    this.branchlistRec(t, branch, lst, maxlen, skipEmpty);
    return lst;
  }
  branchlistRec(t, branch, lst, n, skipEmpty) {
    if (n == 0 || t.children.length == 0) {
      lst.push(branch);
    } else {
      for (const ch of t.children) {
        let newBranch = skipEmpty && ch.data.length == 0 ? branch : branch.concat([ch.data]);
        this.branchlistRec(ch, newBranch, lst, n - 1, skipEmpty);
      }
    }
  }
  getClone() {
    //TODO: test this
    let clone = new MTree(this.data);
    for (const ch of this.children) {
      clone.addChildTree(ch.getClone());
    }
    return clone;
  }
  getSiblings() {
    if (this.parent == undefined) return [this];
    else return this.parent.children;
  }
  getParent() {
    return this.parent;
  }
  findNode(key, maxLevels = 1) {
    let res = null;
    if (this.data == key || this.data.includes(key)) res = this;
    else if (maxLevels > 0) {
      for (const ch of this.children) {
        let newRes = ch.findNode(key, maxLevels - 1);
        if (newRes) {
          res = newRes;
          break;
        }
      }
    }
    return res;
  }
  findNodes(keys, maxLevels = 1) {
    let nodes = [];
    let t = this;

    for (const k of keys) {
      let res = t.findNode(k, maxLevels);
      if (!res) return null;
      //vielleicht sollte auch eine option for partial branch machen. not for now
      else nodes.push(res);
      t = res;
      maxLevels = 1;
    }
    return nodes;
  }
  firstChild() {
    return this.children[0];
  }
  hasChild() {
    return this.children.length > 0;
  }
  lastChild() {
    return this.children[this.children.length - 1];
  }
  print() {
    //console.log(this.toStr());
  }
  toStr(indent = 0) {
    let s = "";
    for (let i = 0; i < indent; i++) {
      s += "_";
    }
    s += this.data.toString() + "\n";
    for (const ch of this.children) {
      s += ch.toStr(indent + 1);
    }
    return s;
  }
  branchSample() {
    //console.log("hallo branchSample");
    let b=[];
    let t=this;
    while(t.hasChild()){
      let ch = t.firstChild();
      if (!empty(ch.data)) b.push(ch.data[0]);
      t=ch;
    }
    return b;
  }
}

function fromResortedLevelsNew(t, order) {
  // creates MTree from MTree resorting levels
  let blst = t.branchlist(-1, false);
  // //console.log("branchlist:");
  // //console.log(blst);
  // //console.log("order:");
  // //console.log(order);
  let bNew = blst.map(br => sortElementsSkipEmpty(br, order));
  // //console.log("--------------", bNew);

  // add each branch to a new tree
  let tNew = new MTree([]);
  for (const branch of bNew) {
    // //console.log("BRAnch to add:",branch);
    // //console.log('tNew:',tNew)
    //tNew.print();
    tNew.addBranch(branch);
  }

  return tNew;
}
function sortElements(lst, ilst) {
  let res = [];
  for (let i = 0; i < lst.length; i++) {
    const element = lst[ilst[i]];
    res.push(element);
  }
  return res;
}
function sortElementsSkipEmpty(lst, ilst) {
  let res = [];
  for (let i = 0; i < lst.length; i++) {
    const element = lst[ilst[i]];
    if (element != undefined && element.length > 0) res.push(element);
  }
  return res;
}
