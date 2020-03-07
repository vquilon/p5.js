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
var Cloth3Scene = Obj.extend(Scene, {
	init: function(){
		this._init();
		
		//Create some particles
        var spacing = 12;
        var start_x = canvas.width / window.devicePixelRatio / 2 - cloth_width * spacing / 2;
        var start_y = 20;

        for (var y = 0; y <= cloth_height; y++) {
            for (var x = 0; x <= cloth_width; x++) {
                var p = new Particle(start_x + x * spacing, start_y + y * spacing);
                this.particles.push(p);

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
            }
            
            if(y === 0) {
                var p1 = this.particles[0];
                var p2 = this.particles[this.particles.length - 1];
                var radius = Math.abs(p1.position.x - p2.position.x) / 2;

                var centerX = p1.position.x + radius;
                var centerY = p1.position.y - radius;

                // this.constraints.push(new CircularWireConstraint([0], centerX, centerY, this));
                // this.constraints.push(new CircularWireConstraint([this.particles.length - 1], centerX, centerY, this));

                //Add spring between the two outer hooks
                // this.forces.push(new SpringForce([0, this.particles.length - 1], radius * 3, 1, 1));

                //Add 'hooks'
                var hooks = this.particles.length / 5;
                var stepSize = Math.round(this.particles.length / hooks);
                for(var i = 0; i <= hooks; i++) {
                    var particleIndex = i * stepSize;
                    var p = this.particles[particleIndex];
                    centerX = p.position.x;
                    centerY = p.position.y - 20;
                    this.constraints.push(new CircularWireConstraint([particleIndex], centerX, centerY, this));
                }
            }
        }
	}
});