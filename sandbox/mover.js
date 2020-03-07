class Mover {
  constructor(x, y, mass) {
    this.pos = createVector(x, y);
    this.pos_max = createVector(x, y);
    //this.vel = createVector(1, -1);
    this.vel = createVector(0, 0)
    this.vel_max = createVector(0, 0);
    // p5.Vector.random2D();
    // this.vel.mult(random(3));
    this.acc = createVector(0, 0);
    this.mass = mass
    this.r = 2*mass;
  }
  
  applyForce(force, dt) {
    this.acc.add(p5.Vector.div(force, this.mass));
  }
  
  edges() {
    // Choque con suelo o techo
    if (this.pos.y > height-this.r) {
      this.pos.y = height-this.r;
      this.vel.y *= -1;
    } else if (this.pos.y < 0+this.r) {
      this.pos.y = 0+this.r;
      this.vel.y *= -1;
    }

    // Choque con paredes
    if (this.pos.x > width-this.r) {
      this.pos.x = width-this.r;
      this.vel.x *= -1;
    } else if (this.pos.x < 0+this.r) {
      this.pos.x = 0+this.r;
      this.vel.x *= -1;
    }
  }

  collision(mover) {
    //Choque con otro objeto, calcular si se encuentra dentro de su area
    // Para choque con otros objetos

    //Calculo desde su centro de masas (Son solo circulos)
    let dist = p5.Vector.dist(this.pos, mover.pos);
    let minDist = this.r + mover.r
    if (dist <= minDist) {
      // Choque elastico
      let xDist = this.pos.x - mover.pos.x;
      let yDist = this.pos.y - mover.pos.y;
      let distSquared = xDist * xDist + yDist * yDist;
      let xVelocity = mover.vel.x - this.vel.x;
      let yVelocity = mover.vel.y - this.vel.y;

      let dotProduct = xDist * xVelocity + yDist * yVelocity;

      //checks if the objects moves towards one another
      if(dotProduct > 0) {
        let collisionScale = dotProduct / distSquared;
        let xCollision = xDist * collisionScale;
        let yCollision = yDist * collisionScale;

        let combindedMass = this.mass + mover.mass;
        let collisionWeightA = 2 * mover.mass / combindedMass;
        let collisionWeightB = 2 * this.mass / combindedMass;

        //The Collision vector is the speed difference projected on the Dist vector
        // Esto es basicamente añadir una aceleracion por lo que hay que tener en cuenta el tiempo
        this.vel.x += collisionWeightA * xCollision;
        this.vel.y += collisionWeightA * yCollision;
        
        mover.vel.x -= collisionWeightB * xCollision;
        mover.vel.y -= collisionWeightB * yCollision;

        // // La distancia que hay entre sus centros y la que hay cuando es choque
        // // Esta distancia resultante es el error que hay y hay que sumar a la posicion actual
        // this.pos.x = dist(this.pos.x, mover.pos.x) - abs(this.r + mover.r) + this.pos.x
        // this.pos.y = abs(distSquared) - abs(this.r + mover.r) + this.pos.y
      }
    }
  }
  
  update(dt) {
    //let mouse = createVector(mouseX, mouseY);
    //this.acc = p5.Vector.sub(mouse, this.pos);
    //this.acc.setMag(1);

    // let k = 1
    // this.acc = createVector(
    //   Math.round(this.acc.x * Math.pow(10, k)) / Math.pow(10, k),
    //   Math.round(this.acc.y * Math.pow(10, k)) / Math.pow(10, k)
    // );

    this.vel.add(p5.Vector.mult(this.acc,1));
    // this.vel = createVector(
    //   Math.round(this.vel.x * Math.pow(10, k)) / Math.pow(10, k),
    //   Math.round(this.vel.y * Math.pow(10, k)) / Math.pow(10, k)
    // );


    this.pos.add(p5.Vector.mult(this.vel, 1));

    // this.pos.mult(deltaTime/50)
    // this.pos = createVector(
    //   Math.round(this.pos.x * Math.pow(10, k)) / Math.pow(10, k),
    //   Math.round(this.pos.y * Math.pow(10, k)) / Math.pow(10, k)
    // );
    
    this.acc.set(0, 0);
    
    // Se llama a edges pero podria llamar a una funcion que detecte cuanto se distorsiona
    // la pelota al rebotar
    this.edges();
  }
  
  show() {
    stroke(255);
    strokeWeight(1);
    fill(255, 100);
    ellipse(this.pos.x, this.pos.y, 2*this.r);
  }
    
}