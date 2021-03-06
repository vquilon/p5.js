'use strict';

/**
 * @module scenes
 */

Scene.prototype._init = Scene.prototype.init;

/**
 * Circle scene class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */

var FluidScene = Obj.extend(Scene, {
  init: function(){
    this._init();
    
    this.forces = [new BoundsForce(), new DragForce(0.4), new CollisionForce()];

    this.solver = new Euler(this);
    this.fluidField = new FluidSolver(this);
    this.fluidField.dt = 0.05;
    this.fluidField.diffusion = 0.1;
    this.timestep = 0.05;
    this.stepsPerFrame = 20;

    var p0 = new PolygonRigidBody(200, 200, [
        [25,-25],
        [25,25],
        [0,50],
        [-25,25],
        [-25,-25],
        [0,-50]
    ]);
    //star
    // var p0 = new PolygonRigidBody(200, 200, [
    //     [0, -75], [19, -18], [79, -18], [31, 18], [49, 75], [0, 41], [-49, 75], [-31, 18], [-79, -18], [-19, -18]
    // ]);
    this.particles.push(p0);

    var p1 = new RectangleRigidBody(400, 200, 100, 50);

    this.particles.push(p1);

    this.forces.push(new GridForce());

    particleFluid = false;
  },

  update: function(){
    for (var i = 0,z = this.stepsPerFrame; i < z; i++){
        this.solver.step(this.timestep);
    }

    for (var i = 0; i < this.particles.length; i++)
        this.particles[i].update();

    for (var i = 0; i < this.forces.length; i++)
        this.forces[i].update();

    //Handle interaction rigid bodies. If does not apply. then fluid interaction
    this.mouseInteraction();
    if(this.mouseSprings.length == 0 && mouse.down && mouse.button === 1) {
        var dx = mouse.x - mouse.px;
        var dy = mouse.y - mouse.py;
        var length = (Math.sqrt(dx * dx + dy * dy) + 0.5) | 0;
        if (length < 1) length = 1;
        for (var i = 0; i < length; i++) {
            var x = (((mouse.px + dx * (i / length)) / 900) * this.fluidField.width) | 0
            var y = (((mouse.py + dy * (i / length)) / 500) * this.fluidField.height) | 0;
            this.fluidField.setVelocity(x, y, dx, dy);
            this.fluidField.setDensity(x, y, 20);
        }
    }

    this.fluidField.update();
  },

  draw: function() {
    if(visualizeVelocity){
        displayVelocity(this.fluidField);
    } else if(bilinearInterpolation){
        displayInterpolatedDensity(this.fluidField);
    } else {
        displayDensity(this.fluidField);
    }

    for (var i = 0; i < this.particles.length; i++)
        this.particles[i].draw();

    for (var i = 0; i < this.forces.length; i++)
        this.forces[i].draw();

    for (var i = 0; i < this.constraints.length; i++)
        this.constraints[i].draw(this.particles);
  }
});



var BoundsForce = Obj.extend(Force, {
    apply: function(particles) {
        var bounce = 1.0;
        var friction = 1.0;
        var impulse = 0.5;
        particles.forEach(function(p,i) {
            var diagonal = Math.sqrt(p.width*p.width + p.height*p.height)/2;
            if(p.position.y > 500-diagonal){
                p.force.x *= friction; //friction
                p.force.y *= -bounce;

                p.velocity.x *= friction; //friction
                p.velocity.y *= -bounce;
                p.linearMomentum.x *= friction; //friction
                p.linearMomentum.y *= -bounce;

                p.position.y -= impulse; //instant repulsion
            }
            if(p.position.y < diagonal){
                p.force.x *= friction; //friction
                p.force.y *= -bounce;

                p.velocity.x *= friction; //friction
                p.velocity.y *= -bounce;
                p.linearMomentum.x *= friction; //friction
                p.linearMomentum.y *= -bounce;

                p.position.y += impulse; //instant repulsion
            }

            if(p.position.x < diagonal){
                p.force.x *= -bounce;
                p.force.y *= friction;

                p.velocity.x *= -bounce;
                p.velocity.y *= friction;
                p.linearMomentum.x *= -bounce;
                p.linearMomentum.y *= friction;

                p.position.x += impulse; //instant repulsion
            }

            if(p.position.x > 900-diagonal){
                p.force.x *= -bounce;
                p.force.u *= friction;

                p.velocity.x *= -bounce;
                p.velocity.y *= friction;
                p.linearMomentum.x *= -bounce;
                p.linearMomentum.y *= friction;

                p.position.x -= impulse; //instant repulsion
            }
        }.bind(this));
    }
});