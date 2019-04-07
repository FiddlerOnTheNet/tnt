class MSelection {
  constructor(info) {
    this.tree = info.tree;
    this.levelTypes = info.typelilevelTypesst;
    this.levelsPerChoice = info.levelsPerChoice;
    this.choiceTypes = info.choiceTypes;
    this.index = 0; // index of selection step, starting with 0: select from children of root
    this.node = this.tree; // parent of selection branch
    this.stack = []; // stack of selections of the form {idlist:idlist,node:node,choiceType:choiceType}
  }
  getChoices(tree = null, branchlen = 0) {
    // returns a list of lists containing ids or partial ids that can be selected according to current
    // selection level
    console.log('****** selecting level: '+this.index+' *****');
    if (!tree) tree = this.node;
    if (branchlen == 0) branchlen = this.levelsPerChoice[this.index];
    tree.print();
    let branchlist = tree.branchlist();
    branchlist = branchlist.map(l => l.slice(0, branchlen));
    branchlist = branchlist.map(b => cartesianOf(b)).flat();
    branchlist = branchlist.map(s => s.split("_"));
    console.log(branchlist);
    return branchlist;
  }
  processSelection(idlist,typeSelected){ //idlist is list of partial types or types involved,
    // corresponding to a branch of tree under this.node;
    console.log('*** processSelection ***');
    let t = this.node.findNodes(idlist);
    if (!t){
      console.log('processSelection: ERROR CANNOT FIND SELECTED NODES');return false;
    }
    console.log('selected Nodes:');
    t.map(x=>console.log(x.data.toString()));
    if (typeSelected == this.choiceTypes[this.index]){
      // new type has been selected
      // travel down branch and increment index.
      // push furthest node involved in choice to stack
      let lastNode = last(t);
      this.stack.push({idlist:idlist,node:this.node,choiceType:typeSelected});
      this.node = lastNode;
      this.index += 1;
    }else {
      let i=this.index;
      while(i>0 && typeSelected!=this.choiceTypes[i]){
        let top=this.stack.pop();
        this.node = top.node;
        i-=1;
      }
      this.index=i;
      if (typeSelected != this.choiceTypes[i]){
        console.log('processSelection: IMPOSSIBLE: NO TYPE FITS ',typeSelected);
      }
    }

    return typeSelected==last(this.choiceTypes);
    // if (t) {
    //   let tlast = t[t.length - 1];
    //   tlast.print();
    //   console.log("node:");
    //   console.log(t); //t.print();
    //   console.log(id, type, keys);
    //   this.push(tlast, id, type);
    // } else if (this.previousNode) {
    //   t = this.previousNode.findNodes(keys);
    //   if (t) {
    //     let tlast = t[t.length - 1];
    //     tlast.print();
    //     console.log("node:");
    //     console.log(t); //t.print();
    //     console.log(id, type, keys);
    //     this.pop();
    //     this.push(tlast, id, type);
    //   } else {
    //     console.log("SELECTION ERROR HAS HAPPENED!!!");
    //   }
    //   //2b. user selects current level (changes his mind): pop current selection, push new selection, goto 1
    //   //3. this is done until all levels complete: display submit button
    //   //4. user submits: selection converted in server format, sent back to server, getting next action

    //   //ask selectionTree if selection complete
    //   //if yes, display submit button and send request
    // }

  }
  getSelectedNodeLabels(){
    return this.stack.map(x=>x.idlist); //last(this.stack).idlist;
  }
  // pop() {
  //   let last = this.stack.pop();
  //   this.node = this.previousNode;
  //   this.index -= 1;
  //   last.ms.unselect();
  //   console.log("popped element ", last.id);
  //   this.node.print();
  //   //unselect object that was previously selected!!!
  // }
  // push(t, id, type) {
  //   // id has been selected
  //   let ms = this.manager.get(id).ms;
  //   this.stack.push({id: id, ms: ms, type: type, node: t});
  //   this.previousNode = this.node;
  //   this.node = t;
  //   this.index += 1;
  //   this.highlight();
  //   console.log("pushed element ", id);
  //   this.node.print();
  // }
}
