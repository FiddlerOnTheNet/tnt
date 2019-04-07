var pz = undefined;
function reset() {
  // get actualwidth of rootDiv
  let width = rootDiv.offsetWidth;
  let height = rootDiv.offsetHeight;

  // scale board so that the width fits exactly
  let scaleFactor1 = width / 3400;
  let scaleFactor2 = height / 2200;
  let scaleFactor = Math.max(scaleFactor1, scaleFactor2);

  board.setAttribute("transform", `translate(-20,-20) scale(${scaleFactor})`);
  if (pz != undefined) {
    pz.dispose();
    pz = undefined;
  }
  //TODO: make sure dispose is not async!!!!
  pz = panzoom(board, {
    zoomDoubleClickSpeed: 1,
    zoomSpeed: 0.1, // 0.065, // 6.5% per mouse wheel event
    maxZoom: 2,
    minZoom: 0.1
  });
}
