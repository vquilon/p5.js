'use strict';

/**
 * @module solvers
 */

Array.prototype.unique = function() {
    var o = {}, i, l = this.length, r = [];
    for(i=0; i<l;i+=1) o[this[i]] = this[i];
    for(i in o) r.push(o[i]);
    return r;
};

/**
 * Cloth class
 *
 * @depends {Obj}
 */
var Solver = Obj.extend({
    init: function(particleSystem) {
        this.particleSystem = particleSystem;
    },

    step: function(particles, stepSize) {
    },

    /**
     * Calculate the derivative for the given particles.
     * @param particles
     * @returns [] Derivative
     */
    derivEval: function(particles) {
        //Clear forces
        for(var i = 0; i < particles.length; i++) {
            var p = particles[i];
            p.force.x = 0;
            p.force.y = 0;
            p.torque = 0;
        }

        //Calculate forces
        this.particleSystem.forces.forEach(function(force) {
            force.apply(particles);
        });

        //Calculate constraints
        if(this.particleSystem.constraints.length !== 0)
        {
            //Construct sparse matrices, in Column Compressed Storage (CCS) format
            var Q = [[], [], []]; //force vector (CCS)
            var qdot = [[], [], []]; //velocity vector (CCS)
            var W = [[], [], []]; //mass reciprocal diagonal (CCS)
            particles.forEach(function(p, i) {
                Q[1].push(i * 2);
                Q[1].push(i * 2 + 1);
                Q[2].push(p.force.x);
                Q[2].push(p.force.y);

                qdot[1].push(i * 2);
                qdot[1].push(i * 2 + 1);
                qdot[2].push(p.velocity.x);
                qdot[2].push(p.velocity.y);

                W[0].push(i * 2);
                W[0].push(i * 2 + 1);
                W[1].push(i * 2);
                W[1].push(i * 2 + 1);
                W[2].push(1 / p.mass);
                W[2].push(1 / p.mass);
            });
            Q[0].push(0);
            Q[0].push(i * 2 + 1);
            qdot[0].push(0);
            qdot[0].push(i * 2 + 1);
            W[0].push(i * 2 + 1); //'close' the column pointer array

            //Construct J and Jdot
            var J = [[], [], []]; //Jacobian matrix (CCS)
            var Jdot = [[], [], []]; //Jacobian matrix differentiated with time (CCS)
            for(var constraintIndex = 0; constraintIndex < this.particleSystem.constraints.length; constraintIndex++) {
                var constraint = this.particleSystem.constraints[constraintIndex];

                //Fill J
                J[0].push(J[2].length);
                var derivatives = constraint.getDerivatives(particles);
                for(var particleIndex in derivatives) {
                    var derivative = derivatives[particleIndex];
                    var derivX = derivative[0];
                    var derivY = derivative[1];

                    J[1].push(particleIndex * 2);
                    J[1].push(particleIndex * 2 + 1);
                    J[2].push(derivX);
                    J[2].push(derivY);

                    //J[constraintIndex][particleIndex * 2] = derivX;
                    //J[constraintIndex][particleIndex * 2 + 1] = derivY;
                }

                //Fill Jdot
                Jdot[0].push(Jdot[2].length);
                var secondDerivatives = constraint.getSecondDerivatives(particles);
                for(var particleIndex in secondDerivatives) {
                    var secondDerivative = secondDerivatives[particleIndex];
                    var derivX = secondDerivative[0];
                    var derivY = secondDerivative[1];

                    Jdot[1].push(particleIndex * 2);
                    Jdot[1].push(particleIndex * 2 + 1);
                    Jdot[2].push(derivX);
                    Jdot[2].push(derivY);

                    // Jdot[constraintIndex][particleIndex * 2] = derivX;
                    // Jdot[constraintIndex][particleIndex * 2 + 1] = derivY;
                }
            }
            J[0].push(J[2].length);
            Jdot[0].push(Jdot[2].length);
            J = numeric.ccsTranspose(J);
            Jdot = numeric.ccsTranspose(Jdot);

            //Solve linear system
            var lhs = numeric.ccsDot(numeric.ccsDot(J, W), numeric.ccsTranspose(J));
            var rhs = numeric.ccsadd(numeric.ccsDot(Jdot, qdot), numeric.ccsDot(numeric.ccsDot(J, W), Q));
            rhs[2] = numeric.neg(rhs[2]);
            var lambda = numeric.ccsLUPSolve(numeric.ccsLUP(lhs), rhs);

            //Calculate 'counter' force
            var Qhat = numeric.ccsDot(numeric.ccsTranspose(J), lambda);
            Qhat = numeric.ccsFull(Qhat);

            //Determine what the ordering of particles is in Qhat. Qhat only contains forces for
            //the particles that are set in the constraints, and also in that order. If two
            //constraints have the same reference to a particle, the particle will only appear once
            //in the Qhat vector. Therefore, find out what particles are in Qhat and in what order.
            var particleIndices = [];
            var particleIndexHashes = {};
            this.particleSystem.constraints.forEach(function(c) {
                c.particleIndices.forEach(function(particleIndex) {
                    if(!(particleIndex in particleIndexHashes))
                    {
                        particleIndices.push(particleIndex);
                        particleIndexHashes[particleIndex] = null;
                    }
                });
            });

            //Apply constraint forces
            for(var i = 0; i < particleIndices.length; i++) {
                var particleIndex = particleIndices[i];
                var particle = particles[particleIndex];
                particle.force.x += Qhat[particleIndex * 2][0];
                particle.force.y += Qhat[particleIndex * 2 + 1][0];
            }

            //Apply feedback forces
            this.particleSystem.constraints.forEach(function(c) {
                c.feedbackforces.forEach(function(feedbackforce){
                    feedbackforce.apply(this.particleSystem.particles);
                }.bind(this));
            }.bind(this));
        }

        //Copy all to destination array
        var r = [];

        for(var i = 0; i < particles.length; i++) {
            var p = particles[i];

            //Auto pause when system blows up
            // if(p.velocity.x > 50 || p.velocity.y > 50){
            //     $('#pause').click();
            // }

            r.push({
                v: p.velocity,
                Rdot: p.angularVelocity,// * p.rotation,
                F: {
                    x: p.force.x,
                    y: p.force.y
                },
                t: p.torque
            });
        }

        return r;
    },

    getDerivedParticles: function(particles, deriv, stepSize, scalar){
        return particles.map(function(p, i){
            var p = p.clone();
            var dp = deriv[i];

            if(p.pinned)
                return p;

            p.position.x += (stepSize * dp.v.x) * scalar;
            p.position.y += (stepSize * dp.v.y) * scalar;

            p.rotation += stepSize * dp.Rdot*scalar;

            p.linearMomentum.x += (stepSize * dp.F.x) * scalar;
            p.linearMomentum.y += (stepSize * dp.F.y) * scalar;

            p.angularMomentum += stepSize * dp.t * scalar;

            //Compute auxiliary variables
            p.velocity.x = p.linearMomentum.x / p.mass;
            p.velocity.y = p.linearMomentum.y / p.mass;

            p.angularVelocity = p.angularMomentum * p.Ibodyinv;

            return p;
        });
    }
});