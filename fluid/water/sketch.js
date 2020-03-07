//Dynamic 2D Waves
/*****************
source http://gamedev.tutsplus.com/tutorials/implementation/make-a-splash-with-2d-water-effects
******************/
class Stone {
  constructor(p) {
    this.pos = p
    this.acc = new p5.Vector(0, 0.25);
    this.vel = new p5.Vector(0, 2);
    this.alpha=255;
  }


  run() {
    this.vel = p5.Vector.add(this.vel, this.acc);
    this.pos = p5.Vector.add(this.pos, this.vel);
    this.display();
  }

  display() {
    push();
    noStroke();
    fill(255, this.alpha);
    ellipse(this.pos.x, this.pos.y, 4, 4);
    pop();
  }
}

class Water {
  constructor(x, y, h, th, s, dx, dt) {
    this.targetHeight=h;
    this.h=th;
    this.spd=s;
    this.x=x;
    this.y=y;
    this.dx=dx;
    this.dt=dt
  }

  update(damp, ten, dt) {
    let x_aux=this.targetHeight-this.h;
    this.spd+=ten*x_aux-x_aux*damp;
    this.h+=dt*this.spd;
  }

  display() {
    stroke("blue");//, 255-this.h/2);
    line(this.x, this.h, this.x+this.dx, this.h);
    // beginShape(LINES);
    // vertex(this.x, this.h);
    // vertex(this.x+5, this.h);
    // endShape();
  }
}

let cnv;
var water = [];
var gui_col;

var Config = function() {
  this.message = 'dat.gui';
  this.numCols= 200; // 400 // 100
  this.ten=0.01; //0.02 // 0.025
  this.damp=0.0085; //0.015 //0.025
  this.spread=0.0008; //0.0008 //0.005
  this.dt=1.5; // 2 // 1
  this.reset = function(){
    SCALE = width/this.numCols;
    console.log(width, this.numCols, SCALE);
    fill(255);
    water=[];
    for (let i=0;i<this.numCols;i++) {
      water[i] = new Water(i*SCALE, 500, 240, 240, 0, SCALE, this.dt);
    }
  };
  this.example1 = function(){
    this.numCols= 200; // 400 // 100
    this.ten=0.01; //0.02 // 0.025
    this.damp=0.0085; //0.015 //0.025
    this.spread=0.0008; //0.0008 //0.005
    this.dt=1.5; // 2 // 1
    this.reset();
    for (var i in gui_col.__controllers) {
      gui_col.__controllers[i].updateDisplay();
    }
  }
  this.example2 = function(){
    this.numCols= 400; // 100
    this.ten=0.02; // 0.025
    this.damp=0.015; //0.025
    this.spread=0.0008; //0.005
    this.dt=2; // 1
    this.reset();
    for (var i in gui_col.__controllers) {
      gui_col.__controllers[i].updateDisplay();
    }
  }
  this.example3 = function(){
    this.numCols= 100;
    this.ten=0.025;
    this.damp=0.025;
    this.spread=0.005;
    this.dt=1;
    this.reset();
    for (var i in gui_col.__controllers) {
      gui_col.__controllers[i].updateDisplay();
    }
  }
  //this.displayOutline = false;
  //this.explode = function() { ... };
  // Define render logic ...
};

let SCALE = 5;
var stones = [];

var stats;
let context;
let config;
let numCols;

function setup() {
  // INCREASE FPS
  noLoop();
  setInterval(redraw, 0);

  config = new Config();
  gui_col = new dat.GUI();
  gui_col.add(config, "ten", 0, 0.5);
  gui_col.add(config, "damp", 0.0001, 0.025);
  gui_col.add(config, "spread", 0, 0.1);
  gui_col.add(config, "numCols", 100, 1000).onChange(function(value){
    config.reset();
  });
  gui_col.add(config, "dt", 0, 2);
  gui_col.add(config, "reset");
  gui_col.add(config, "example1");
  gui_col.add(config, "example2");
  gui_col.add(config, "example3");
  console.log(gui_col);
  background(0);
  cnv = createCanvas(800, 480);

  // FPS
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);


  numCols = config.numCols;
  dt = config.dt;

  SCALE = width/numCols;
  console.log(width, numCols, SCALE);

  fill(255);
  for (let i=0;i<numCols;i++) {
    water[i]=new Water(i*SCALE, 500, 240, 240, 0, SCALE, dt);
  }

}


function createStone() {
  console.log("Piedra va!");
  stones[stones.length] = new Stone(new p5.Vector(mouseX, mouseY));
}

function draw() {
  stats.begin();

  background(0);

  /*
  let fps = frameRate();
  fill(255);
  stroke(0);
  text("FPS: " + fps.toFixed(2), 10, height - 10);
  */

  let ten = config.ten;
  let damp = config.damp;
  let spread = config.spread;
  let dt = config.dt;
  let numCols = config.numCols;

  fill(0, 20);
  noStroke();

  cnv.mouseClicked(createStone);
  let stone;
  if(stones.length!=0) {
    for(let s=0; s<stones.length;s++){
      stone = stones[s];
      if(stone.pos.y > height){
        stones.splice(s, 1);
      }

      stone.run();


      if(stone) {
        // Condicion de que toque realmente esa porcion del agua
        if (stone.pos.y<240 && stone.pos.y+stone.vel.y>=240) {
          // incrementar la velocidad
          water[int(stone.pos.x/SCALE)].h = water[int(stone.pos.x/SCALE)].h + stone.vel.y*stone.vel.y*SCALE;
          stone.alpha=0;
        }
      }
    }
  }
  
  /*
  if (stone.pos.y>240) {
    stone.pos.y=200-random(1000);
    stone.pos.x=random(width);
    stone.vel.y=0;
    stone.alpha=255;
  }
  */

  for (let i=0;i<water.length;i++) {
    water[i].display();
    water[i].update(damp, ten, dt);

    let lDeltas = [];
    let rDeltas = [];

    //for (let j=0;j<8;j++) {
      for (let l=0;l<numCols;l++) {
        if (l>0) {
          lDeltas[l]=spread * (water[l].h - water[l-1].h);
          water[l-1].spd+=lDeltas[l];
        }

        if (l<numCols-1) {
          rDeltas[l] = spread * (water[l].h -  water[l+1].h);
          water[l+1].spd += rDeltas[l];
        }
      }

      for (let r = 0; r < numCols; r++) {
        if (r > 0){
          water[r - 1].h += lDeltas[r];
        } 
        if (r < numCols - 1){
          water[r + 1].h += rDeltas[r];
        }
      }
    //}
  }

  stats.end();
}