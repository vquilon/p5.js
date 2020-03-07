let cnv;

var Config = function() {
 
  //this.displayOutline = false;
  //this.explode = function() { ... };
  // Define render logic ...
};



function setup() {
  noLoop();
  setInterval(redraw, 0);

  config = new Config();
  let gui_col = new dat.GUI();
  // gui_col.add(config, "dt", 0, 2);
  // gui_col.add(config, "reset");
  
  background(0);
  cnv = createCanvas(800, 480);

  // FPS
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);

}

function draw() {
  stats.begin();

  background(0);


  stats.end();
}