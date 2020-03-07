'use strict';

/**
 * @module js
 */

/**
 * Particle class
 *
 * @depends {Obj}
 */
var Particle = Obj.extend({
    /**
     * Constructor
     *
     * @param {number} x   X coordinate of particle
     * @param {number} y   Y coordinate of particle
     */
    init: function(x, y) {
        this.pinned = false;
        
        //Constant quantities
        this.mass = 50;

        //State variables
        this.position = {
            x: x,
            y: y
        };
        this.linearMomentum = {
            x: 0,
            y: 0
        };

        //Derived quantities
        this.velocity = {
            x: 0,
            y: 0
        };

        //Computed quantities
        this.force = {
            x: 0,
            y: 0
        };
    },

    update: function() {
    },

    draw: function() {
    },

    clone: function(){
        var p = new Particle(this.position.x, this.position.y);

        p.velocity = {x: this.velocity.x, y: this.velocity.y};
        p.force = {x: this.force.x, y: this.force.y};
        p.pinned = this.pinned;

        return p;
    }
});
