'use strict';

/**
 * @module constraints
 */

/**
 * Circular wire constraint class
 *
 * @depends {Constraint, Obj}
 * @extends {Constraint}
 */
var CircularWireConstraint = Obj.extend(Constraint, {
	init: function(particleIndices, x, y, particleSystem){
		this.particleIndices = particleIndices;
		this.x = x;
		this.y = y;

		//Add feedback force
		this.circlePoint = new Particle(x,y);
		this.circlePoint.pinned = true;
		var p = particleSystem.particles[particleIndices[0]];
		var radius = Math.sqrt(Math.pow(p.position.x - this.x, 2) + Math.pow(p.position.y - this.y, 2));
		this.feedbackforces = [new SpringForce([particleIndices[0], this.circlePoint], radius, 20.0, 0.5)];
	},

	apply: function (particles) {
		var p = particles[this.particleIndices[0]];

		var f = [-p.force.x, -p.force.y];
		var x = [p.position.x - self.x, p.position.y - self.y];
		var v = [p.velocity.x, p.velocity.y];

		var lambda = (numeric.dot(f, x) - numeric.dot(v,v) * p.mass) / numeric.dot(x,x);

		var fhat = numeric.mul(x, lambda);

		p.force.x += fhat.elements[0];
		p.force.y += fhat.elements[1];
	},

	/**
	 * Get derivative of C with respect to x
	 *
	 * (x - x_c)^2 + (y - y_c)^2 -r^2
	 * \frac{dC}{Dx} = 2(x - x_c)
	 * \frac{dC}{Dy} = 2(y - y_c)
	 *
	 * @return {particleId: [dC/dx, dC/dy]} Dict mapping particleId to derivatives
	 */
	getDerivatives: function(particles){
		var p = particles[this.particleIndices[0]];

		var derivatives = {};
		derivatives[this.particleIndices[0]] = [2 * (p.position.x - this.x), 2 * (p.position.y - this.y)];
		return derivatives;
	},

	getSecondDerivatives: function(particles){
		var p = particles[this.particleIndices[0]];

		var derivatives = {};
		derivatives[this.particleIndices[0]] = [2 * p.velocity.x, 2 * p.velocity.y];
		return derivatives;
	},

	draw: function(particles){
		var p = particles[this.particleIndices[0]];

		//Draw radius
		var radius = Math.sqrt(Math.pow(p.position.x - this.x, 2) + Math.pow(p.position.y - this.y, 2));
		graphics.lineStyle(2, 0x999999, 1);
		graphics.drawCircle(this.x, this.y, radius);

		//Draw line
		graphics.moveTo(p.position.x, p.position.y);
		graphics.lineTo(this.x, this.y);
	}
});