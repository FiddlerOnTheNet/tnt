class MScanner {
  constructor(code) {
    this.SET_START='{"set":['; //'{"set": ['; // "xset({"
    this.SET_END=']}'; //"})"
    this.TUPLE_START='['; // "("
    this.TUPLE_END=']'; //")"
    this.code = code;
    this.tokenList = this.scan(code);

    // console.log("code=" + code);
    // console.log(this.tokenList);
  }
  scan(s) {
    let lst = [];
    while (s.length > 0) {
      s = s.trim();
      //console.log(s);
      if (startsWith(s, this.SET_START)) {
        lst.push("@SS");
        s = stringAfter(s, this.SET_START);
        // if (startsWith(s.trim(),'"')||startsWith(s.trim(),"'")){
        //   lst.push("StringSetStart");
        // }else{lst.push("TupleSetStart")}
      } else if (startsWith(s, this.SET_END)) {
        lst.push("@SE");
        s = stringAfter(s, this.SET_END);
      } else if (startsWith(s,  this.TUPLE_START)) {
        lst.push("@TS");
        s = stringAfter(s, this.TUPLE_START);
      } else if (startsWith(s, this.TUPLE_END)) {
        lst.push("@TE");
        s = stringAfter(s, this.TUPLE_END);
      } else if (startsWith(s, '"')) {
        s = s.substring(1);
        lst.push(stringBefore(s, '"'));
        s = stringAfter(s, '"');
      } else if (startsWith(s, "'")) {
        s = s.substring(1);
        lst.push(stringBefore(s, "'"));
        s = stringAfter(s, "'");
      } else if (startsWith(s, ",")) {
        lst.push("@CO");
        s = stringAfter(s, ",");
      }
    }
    return lst;
  }
}
