'use strict';

/**
 * @module solvers
 */

/**
 * Solver class
 *
 * @depends {Obj}
 */
var RungeKutta = Obj.extend(Solver, {
    step: function(stepSize) {
        var particles = this.particleSystem.particles;
        var k1a = this.derivEval(particles);
        var k2a = this.derivEval(this.getDerivedParticles(particles, k1a, stepSize*2, 0.5));
        var k3a = this.derivEval(this.getDerivedParticles(particles, k2a, stepSize*2, 0.5));
        var k4a = this.derivEval(this.getDerivedParticles(particles, k3a, stepSize, 1));

        particles.forEach(function(p, i){
            if(p.pinned) return;

            var k1 = k1a[i];
            var k2 = k2a[i];
            var k3 = k3a[i];
            var k4 = k4a[i];

            p.position.x += stepSize/6 * (k1.v.x + 2*k2.v.x + 2*k3.v.x + k4.v.x);
            p.position.y += stepSize/6 * (k1.v.y + 2*k2.v.y + 2*k3.v.y + k4.v.y);

            p.rotation += stepSize/6 * (k1.Rdot + 2*k2.Rdot + 2*k3.Rdot + k4.Rdot);

            p.linearMomentum.x += stepSize/6 * (k1.F.x + 2*k2.F.x + 2*k3.F.x + k4.F.x);
            p.linearMomentum.y += stepSize/6 * (k1.F.y + 2*k2.F.y + 2*k3.F.y + k4.F.y);

            p.angularMomentum += stepSize/6 * (k1.t + 2*k2.t + 2*k3.t + k4.t);

            //Compute auxiliary variables
            p.velocity.x = p.linearMomentum.x / p.mass;
            p.velocity.y = p.linearMomentum.y / p.mass;

            p.angularVelocity = p.angularMomentum * p.Ibodyinv;
        }.bind(this));
    }
});