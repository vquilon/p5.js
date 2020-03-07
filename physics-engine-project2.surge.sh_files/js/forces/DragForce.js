'use strict';

/**
 * @module forces
 */

/**
 * Drag force class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var DragForce = Obj.extend(Force, {
	init: function(factor){
		this.factor = factor;
	},

    apply: function(particles) {
        particles.forEach(function(p) {
            p.force.x -= this.factor * p.linearMomentum.x / 100;
            p.force.y -= this.factor * p.linearMomentum.y / 100;
            p.torque -= this.factor * p.angularVelocity;
        }.bind(this));
    }
});