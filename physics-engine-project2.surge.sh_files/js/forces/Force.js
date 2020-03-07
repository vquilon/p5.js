'use strict';

/**
 * @module forces
 */

/**
 * Abstract Force class
 *
 * @depends {Obj}
 */
var Force = Obj.extend({
  /**
   * Constructor
   * 
   * @param {number} particleIndices The indices of the particles this
   * force applies to.
   */
  init: function() {},
  apply: function(particles) {},
  update: function() {},
  draw: function() {}
});

