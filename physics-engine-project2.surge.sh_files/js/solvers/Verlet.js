'use strict';

/**
 * @module solvers
 */

/**
 * Solver class
 *
 * @depends {Obj}
 */
var Verlet = Obj.extend(Solver, {
    init: function(particleSystem) {
        this.particleSystem = particleSystem;
    },

    step: function(stepSize) {
        var particles = this.particleSystem.particles;
        var deriv = this.derivEval(particles);
        particles.forEach(function(p, i){
            if(p.pinned) return;

            var dp = deriv[i];

            p.position.x = 2*p.position.x - (p.position.x - stepSize * p.velocity.x - stepSize * (p.force.x / p.mass)) + (stepSize*stepSize) * (dp.F.x/p.mass);
            p.position.y = 2*p.position.y - (p.position.y - stepSize * p.velocity.y - stepSize * (p.force.y / p.mass)) + (stepSize*stepSize) * (dp.F.y/p.mass);

            p.rotation += stepSize * dp.Rdot;

            p.linearMomentum.x += stepSize * dp.F.x;
            p.linearMomentum.y += stepSize * dp.F.y;

            p.angularMomentum += stepSize * dp.t;

            //Compute auxiliary variables
            p.velocity.x = p.linearMomentum.x / p.mass;
            p.velocity.y = p.linearMomentum.y / p.mass;

            p.angularVelocity = p.angularMomentum * p.Ibodyinv;
        });
    }
});