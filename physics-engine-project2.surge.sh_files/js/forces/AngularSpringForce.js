'use strict';

/**
 * @module forces
 */

SpringForce.prototype._apply = SpringForce.prototype.apply;
SpringForce.prototype._draw = SpringForce.prototype.draw;

/**
 * Spring force class
 * http://www.pixar.com/companyinfo/research/pbm2001/pdf/notesc.pdf
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var AngularSpringForce = Obj.extend(SpringForce, {
    init: function(particleIndices, particles, angle, stiffness, damping, draw) {
        this.particleIndices = particleIndices;
        this.angle = angle;
        this.stiffness = stiffness;
        this.damping = damping;
        this.hidden = (typeof draw == 'undefined') ? false : true;
    },

    apply: function(particles) {
        //Calculate distance based on the angle
        function toRadians (angle) {
            return angle * (Math.PI / 180);
        }
        var pA = particles[this.particleIndices[2]];
        var pB = particles[this.particleIndices[0]];
        var pC = particles[this.particleIndices[1]];
        var b = Math.sqrt(Math.pow(pA.position.x - pC.position.x, 2) + Math.pow(pA.position.y - pC.position.y, 2));
        var c = Math.sqrt(Math.pow(pA.position.x - pB.position.x, 2) + Math.pow(pA.position.y - pB.position.y, 2));
        this.length = Math.sqrt(b*b + c*c - 2*b*c*Math.cos(toRadians(this.angle)));

        this._apply(particles);
    },


    draw: function() {
        if(!this.hidden) {
            var pA = scene.particles[this.particleIndices[2]];
            var pB = scene.particles[this.particleIndices[0]];
            var pC = scene.particles[this.particleIndices[1]];

            var cx = pA.position.x;
            var cy = pA.position.y;

            var dAB = Math.sqrt(Math.pow(pA.position.x - pB.position.x, 2) + Math.pow(pA.position.y - pB.position.y, 2));
            var dAC = Math.sqrt(Math.pow(pA.position.x - pC.position.x, 2) + Math.pow(pA.position.y - pC.position.y, 2));
            var dBC = Math.sqrt(Math.pow(pB.position.x - pC.position.x, 2) + Math.pow(pB.position.y - pC.position.y, 2));
            var distance = Math.min(dAB, dAC);

            if(distance <= 0 || dBC <= 10)
                return;

            graphics.lineStyle(2, this.getForceColor(pB, pC), 1);
            graphics.moveTo(pB.position.x, pB.position.y);
            graphics.arcTo(cx, cy, pC.position.x, pC.position.y, (distance * this.angle)/300);
        }
    }
});