
let walls = [];
let particle;

let xoff =0;
let yoff = 10000;

function setup() {
  createCanvas(400, 400);
  for(let i=0;i<5; i++){
		let x1 = random(width);
		let x2 = random(width);
		let y1 = random(height);
		let y2 = random(height);
  	walls[i] = new Boundary(x1, y1, x2, y2, 0.3);
  }

  border_absortion = 0.3
  walls.push(new Boundary(0, 0, width, 0, border_absortion));
  walls.push(new Boundary(width, 0, width, height, border_absortion));
  walls.push(new Boundary(0, height, width, height, border_absortion));
  walls.push(new Boundary(0, height, 0, 0, border_absortion));

  particle = new Particle();
}

function draw() {
  background(0);
  for(let wall of walls){
  	 wall.show();
  }
  particle.update(mouseX,mouseY);
  //particle.update(noise(xoff)*width,noise(yoff)*height);
  particle.show();
  particle.look(walls, particle.rays);

  //xoff+=0.005;
  //yoff+=0.005;
}