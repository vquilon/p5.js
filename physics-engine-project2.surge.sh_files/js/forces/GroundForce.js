'use strict';

/**
 * @module forces
 */

/**
 * Ground force class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var GroundForce = Obj.extend(Force, {
	apply: function(particles) {
		particles.forEach(function(p,i) {
			if(p.position.y > 490){
				p.force.x *= 0.8; //friction
		 		p.force.y *= -1.0;

		 		p.velocity.x *= 0.8; //friction
		 		p.velocity.y *= -1.0;

		 		p.position.y -= 0.1; //instant repulsion
		 	}
		}.bind(this));
	}
});