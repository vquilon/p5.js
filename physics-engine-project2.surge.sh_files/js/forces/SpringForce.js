'use strict';

/**
 * @module forces
 */

/**
 * Spring force class
 * http://www.pixar.com/companyinfo/research/pbm2001/pdf/notesc.pdf
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var SpringForce = Obj.extend(Force, {
    init: function(particleIndices, length, stiffness, damping, color) {
        this.particleIndices = particleIndices;
        this.length = length;
        this.stiffness = stiffness;
        this.damping = damping;
        this.color = color;
    },

    apply: function (particles) {
        var p1 = particles[this.particleIndices[0]];
        var p2 = (this.particleIndices[1] instanceof Particle) ? this.particleIndices[1] : particles[this.particleIndices[1]];

        var deltaX1 = p1.position.x - p2.position.x;
        var deltaV1 = p1.velocity.x - p2.velocity.x;
        var deltaX2 = p1.position.y - p2.position.y;
        var deltaV2 = p1.velocity.y - p2.velocity.y;

        var distance = Math.sqrt(deltaX1*deltaX1 + deltaX2*deltaX2);

        var a = (-(scene.stiffnessConstant * this.stiffness * (distance - this.length)) - (this.damping * (deltaV1 * deltaX1) / distance)) * (deltaX1 / distance);
        var b = (-(scene.stiffnessConstant * this.stiffness * (distance - this.length)) - (this.damping * (deltaV2 * deltaX2) / distance)) * (deltaX2 / distance);
        
        if(!isNaN(a) && isFinite(a)) {
            p1.force.x += a;
            p2.force.x -= a;
        }
        if(!isNaN(b) && isFinite(b)) {
            p1.force.y += b;
            p2.force.y -= b;
        }
    },

    update: function() {
        if (mouse.down && mouse.button == 3) {
            var p1 = scene.particles[this.particleIndices[0]];
            var p2 = scene.particles[this.particleIndices[1]];

            if((mouse.x > p1.position.x - tear_distance/2 && mouse.x < p2.position.x + tear_distance/2 &&
               mouse.y > p2.position.y - tear_distance/2 && mouse.y < p1.position.y + tear_distance/2) ||
                (mouse.x > p1.position.x - tear_distance/2 && mouse.x < p2.position.x + tear_distance/2 &&
               mouse.y > p2.position.y - tear_distance/2 && mouse.y < p1.position.y + tear_distance/2)) {
                scene.forces.splice(scene.forces.indexOf(this),1);
            }
        }
    },

    getForceColor: function(p1, p2) {
        if(enableForceColors){
            var maxForce = 10;
            var totalForce = p1.force.x + p1.force.y + p2.force.x + p2.force.y + (maxForce/2);

            if (totalForce > maxForce) totalForce = maxForce;
            if (totalForce < -maxForce) totalForce = -maxForce;

            var hue = Math.floor((maxForce - totalForce) * 120 / maxForce);
            var color = HSVtoDecimal(hue/360, 1, 0.8);

            return color;
        } else {
            return (typeof this.color != "undefined") ? this.color : 0x000;
        }
    },

    draw: function() {
      if(typeof this.color == 'undefined' || this.color){
          var p1 = scene.particles[this.particleIndices[0]];
          var p2 = (this.particleIndices[1] instanceof Particle) ? this.particleIndices[1] : scene.particles[this.particleIndices[1]];

          graphics.lineStyle(2, this.getForceColor(p1, p2), 1);
          graphics.moveTo(p1.position.x, p1.position.y);
          graphics.lineTo(p2.position.x, p2.position.y);
      }
    }
});

//Helper method
function HSVtoDecimal(h, s, v) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
        s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    return (Math.round(r*255) << 16) + (Math.round(g*255) << 8) + Math.round(b*255);
};