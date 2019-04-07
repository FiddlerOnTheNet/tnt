class MParser{
  constructor(data){ 
    //console.log('hallo',data);
    this.tokens = Array.isArray(data)?data:new MScanner(data).tokenList;
    let t = new MTree([]);
    t=this.parse(this.tokens,t,[t]);
    this.tree=t;

    //t.print();
  }
  parse(tokens,t,trees){
    // console.log('parse ',tokens,t);
    if (tokens[0]=='@SS' && tokens[1]=="@TS") {
      //this is a set of tuples
      return this.parseSetOfTuples(tokens,t,trees);
    }
    else if (tokens[0]=='@SS'){
      //this is a set of strings
      return this.parseSetOfStrings(tokens,t,trees);
    }
    else if (tokens[0]=='@TS'){
      //this is a tuple of sets and/or strings
      return this.parseComplexTuple(tokens,t,trees);
    }
    else{
      //let literal = tokens[0];
      //tokens.splice(0,1);
      return this.parseLiteral(tokens,t);
      // this is just a literal
    }
  }
  parseSetOfTuples(tokens,t,trees){
    //console.log('parseSetOfTuples ',tokens,t);
    tokens.splice(0,1,"@CO");
    while(tokens[0] == "@CO"){
      tokens.splice(0,1);
      let newT = new MTree([]);
      newT = this.parseComplexTuple(tokens,newT,trees);
      t.addChildTree(newT.children[0]);
    }
    if (tokens[0]!="@SE"){console.log('ERROR SET END!!!!');}
    else tokens.splice(0,1); //
    return t;
  }
  parseComplexTuple(tokens,t,trees){
    // console.log('parseComplexTuple ',tokens,t);
    tokens.splice(0,1,"@CO");
    let troot = new MTree([]);
    let t1 = t;//troot;
    while(tokens[0] == "@CO"){
      tokens.splice(0,1);
      let t2 = new MTree([]);
      t1.addChildTree(this.parse(this.tokens,t2,[t1]));
      t1 = t2;
    }
    // console.log('tree',t);t.print()
    if (tokens[0]!="@TE"){console.log('ERROR TUPLE END!!!!');}
    else tokens.splice(0,1); //
    return t;
  }
  parseLiteral(tokens,t,trees){
    // console.log('parseLiteral ',tokens,t);
    t.addData(tokens[0]);
    // console.log('after adding literal to t:',t.data.toString())
    tokens.splice(0,1);
    //t.print();
    return t;
  }
  parseSetOfStrings(tokens,t,trees){
    // console.log('parseSetOfStrings ',tokens,t);
    tokens.splice(0,1,"@CO");
    while(tokens[0] == "@CO"){
      tokens.splice(0,1);
      t.addData(tokens[0]);
      tokens.splice(0,1);
    }
    if (tokens[0]!="@SE"){console.log('ERROR SET END!!!!');}
    else tokens.splice(0,1); //
    return t;
  }
}