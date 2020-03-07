'use strict';

/**
 * @module scenes
 */

Scene.prototype._init = Scene.prototype.init;

/**
 * 2D Cloth scene class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var ClothFluidScene2 = Obj.extend(Scene, {
    init: function(){
        this._init();

        this.solver = new Verlet(this);
        this.fluidField = new FluidSolver(this);
        this.fluidField.dt = 0.1;
        this.fluidField.diffusion = 0.1;
        this.fluidField.buoyancy = 0.2;
        this.timestep = 0.4;
        this.stepsPerFrame = 10;

        //Create some particles
        var cloth_height = 15,
            cloth_width = 30;
        var spacing = 18;
        var start_x = canvas.width / window.devicePixelRatio / 2 - cloth_width * spacing / 2;
        var start_y = 20;

        for (var y = 0; y <= cloth_height; y++) {
            for (var x = 0; x <= cloth_width; x++) {
                var p = new Particle(start_x + x * spacing, start_y + y * spacing);
                this.particles.push(p);

                //x != 0 && p.attach(this.particles[this.particles.length - 1]);
                // y == 0 && p.pin(p.x, p.y);
                //y != 0 && p.attach(this.particles[x + (y - 1) * (cloth_width + 1)])

                if(x !== 0) {
                    this.forces.push(new SpringForce([
                        this.particles.length - 1,
                        this.particles.length - 2
                    ], spacing, 1.8, 0.5))
                }
                if(y !== 0) {
                    this.forces.push(new SpringForce([
                        this.particles.length - 1,
                        x + (y - 1) * (cloth_width + 1)
                    ], spacing, 1.8, 0.5))
                }
                if(y === 0) {
                    p.pinned = true;
                }
            }
        }

        enableFluidForceColors = false;
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

        this.particles.forEach(function(p){
            p.velocity.x = this.fluidField.getXVelocity(Math.floor((p.position.x/900)*this.fluidField.width), Math.floor((p.position.y/500)*this.fluidField.height))*80;
            p.velocity.y = this.fluidField.getYVelocity(Math.floor((p.position.x/900)*this.fluidField.width), Math.floor((p.position.y/500)*this.fluidField.height))*80;
        }.bind(this));
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