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
var ClothScene = Obj.extend(Scene, {
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
	}
});