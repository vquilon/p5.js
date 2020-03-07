'use strict';

/**
 * @module js
 */

Particle.prototype._init = Particle.prototype.init;

/**
 * Particle class
 *
 * @depends {Obj}
 */
var RigidBody = Obj.extend(Particle, {
    /**
     * Constructor
     *
     * @param {number} x   X coordinate of particle
     * @param {number} y   Y coordinate of particle
     */
    init: function(x, y) {
        this._init(x, y);

        //Constant quantities
        this.Ibody = 0;
        this.Ibodyinv = 0;

        //State variables
        this.rotation = 0;
        this.angularMomentum = 0;

        //Derived quantities
        this.angularVelocity = 0;

        //Computed quantities
        this.torque = 0;
    },

    containsPoint: function(x, y) {
        return false;
    },

    update: function() {
        //Normalise rotation to be between 0 and 2PI
        this.rotation = Math.atan2(Math.sin(this.rotation), Math.cos(this.rotation));
    },

    draw: function() {
    },

    clone: function (){
        throw new Error("Not implemented");
    }
});
