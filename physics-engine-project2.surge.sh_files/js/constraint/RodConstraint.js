'use strict';

/**
 * @module constraints
 */

Constraint.prototype._init = Constraint.prototype.init;

/**
 * Rod constraint class
 *
 * @depends {Constraint, Obj}
 * @extends {Constraint}
 */
var RodConstraint = Obj.extend(Constraint, {
    init: function(particleIndices, particleSystem){
        this._init(particleIndices);

        var p1 = particleSystem.particles[particleIndices[0]];
        var p2 = particleSystem.particles[particleIndices[1]];
        var distance = Math.sqrt(Math.pow(p1.position.x - p2.position.x, 2) + Math.pow(p1.position.y - p2.position.y, 2));
        this.feedbackforces = [new SpringForce([particleIndices[0],particleIndices[1]], distance, 20.0, 0.5)];
    },

    apply: function (particles) {
        var p1 = particles[this.particleIndices[0]];
        var p2 = particles[this.particleIndices[1]];

        var f = [-p1.force.x, -p1.force.y];
        var x = [p1.position.x - p2.position.x, p1.position.y - p2.position.y];
        var v = [p1.velocity.x, p1.velocity.y];

        var lambda = (numeric.dot(f, x) - numeric.dot(v,v) * p.mass) / numeric.dot(x,x);
        var fhat = numeric.mul(x, lambda);

        p.force.x += fhat.elements[0];
        p.force.y += fhat.elements[1];

        var f = [-p2.force.x, -p2.force.y];
        var x = [p2.position.x - p1.position.x, p2.position.y - p1.position.y];
        var v = [p2.velocity.x, p2.velocity.y];

        var lambda = (numeric.dot(f, x) - numeric.dot(v,v) * p.mass) / numeric.dot(x,x);
        var fhat = numeric.mul(x, lambda);

        p2.force.x += fhat.elements[0];
        p2.force.y += fhat.elements[1];
    },

    draw: function() {
        var p1 = scene.particles[this.particleIndices[0]];
        var p2 = scene.particles[this.particleIndices[1]];

        //Draw line
        graphics.lineStyle(2, 0x000, 1);
        graphics.moveTo(p1.position.x, p1.position.y);
        graphics.lineTo(p2.position.x, p2.position.y);
    },

    /**
     * Get derivative of C with respect to x
     *
     * (x_1 - x_2)^2 + (y_1 - y_2)^2 -r^2
     * \frac{dC}{Dx_1} = 2(x_1 - x_2)
     * \frac{dC}{Dy_1} = 2(y_1 - y_2)
     *
     * @return {particleId: [dC/dx, dC/dy]} Dict mapping particleId to derivatives
     */
    getDerivatives: function(particles){
        var p1 = particles[this.particleIndices[0]];
        var p2 = particles[this.particleIndices[1]];

        var derivatives = {};
        derivatives[this.particleIndices[0]] = [2 * (p1.position.x - p2.position.x), 2 * (p1.position.y - p2.position.y)];
        derivatives[this.particleIndices[1]] = [2 * (p2.position.x - p1.position.x), 2 * (p2.position.y - p1.position.y)];
        return derivatives;
    },

    getSecondDerivatives: function(particles){
        var p1 = particles[this.particleIndices[0]];
        var p2 = particles[this.particleIndices[1]];

        var derivatives = {};
        derivatives[this.particleIndices[0]] = [2 * (p1.velocity.x - p2.velocity.x), 2 * (p1.velocity.y - p2.velocity.y)];
        derivatives[this.particleIndices[1]] = [2 * (p2.velocity.x - p1.velocity.x), 2 * (p2.velocity.y - p1.velocity.y)];
        return derivatives;
    }
});