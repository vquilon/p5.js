'use strict';

/**
 * @module solvers
 */

/**
 * Solver class
 *
 * @depends {Obj}
 */
var MidPoint = Obj.extend(Solver, {
    step: function(stepSize) {
        var particles = this.particleSystem.particles;
        var deriv = this.derivEval(particles);
        var second_deriv = this.derivEval(this.getDerivedParticles(particles, deriv, stepSize/2, 0.5));

        particles.forEach(function(p, i){
            var dp = deriv[i];
            var dpp = second_deriv[i];

            if(p.pinned) return;

            p.position.x += stepSize * dp.v.x;
            p.position.y += stepSize * dp.v.y;

            p.velocity.x += stepSize * dpp.a.x;
            p.velocity.y += stepSize * dpp.a.y;
        });
    }
});