'use strict';

/**
 * @module forces
 */

/**
 * Gravity force class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var GravityForce = Obj.extend(Force, {
	init: function(factor) {
		this.factor = factor;
	},

	apply: function(particles) {
		particles.forEach(function(p) {
		 	p.force.y += p.mass * this.factor;
		}.bind(this));
	}
});