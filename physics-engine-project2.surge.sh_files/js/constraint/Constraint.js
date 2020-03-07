'use strict';

/**
 * @module constraints
 */

/**
 * Abstract Constraint class
 *
 * @depends {Obj}
 */
var Constraint = Obj.extend({
  /**
   * Constructor
   * 
   * @param {number} particleIndices The indices of the particles this
   * constraint applies to.
   */
  init: function(particleIndices) {
    this.particleIndices = particleIndices;
  },

  apply: function(particles) {},
  update: function() {},
  draw: function() {},
  getDerivatives: function() {},
  getSecondDerivatives: function() {}
});
