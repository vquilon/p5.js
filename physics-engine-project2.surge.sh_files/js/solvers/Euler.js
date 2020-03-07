'use strict';

/**
 * @module solvers
 */

/**
 * Solver class
 * https://www.cs.utexas.edu/~fussell/courses/cs384g/lectures/lecture14-Particle_systems.pdf
 *
 * @depends {Obj}
 */
var Euler = Obj.extend(Solver, {
    step: function(stepSize) {
        var particles = this.particleSystem.particles;
        var deriv = this.derivEval(particles);
        particles.forEach(function(p, i){
            if(p.pinned) return;

            var dp = deriv[i];

            p.position.x += stepSize * dp.v.x;
            p.position.y += stepSize * dp.v.y;

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