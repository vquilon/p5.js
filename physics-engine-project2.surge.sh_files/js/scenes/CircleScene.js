'use strict';

/**
 * @module scenes
 */

Scene.prototype._init = Scene.prototype.init;

/**
 * Circle scene class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var CircleScene = Obj.extend(Scene, {
  init: function(){
    this._init();
    
    ///Two competing particles
    var p0 = new SpriteParticle(200, 200, 'img/bunny_small.png');
    var p1 = new SpriteParticle(320, 200, 'img/bunny_small.png');
    this.particles.push(p0);
    this.particles.push(p1);

    this.constraints.push(new CircularWireConstraint([0], 250, 200, this));
    this.constraints.push(new CircularWireConstraint([1], 250, 200, this));

    var p2 = new SpriteParticle(400, 200, 'img/bunny_small.png');
    var p3 = new SpriteParticle(500, 200, 'img/bunny_small.png');
    var p4 = new SpriteParticle(450, 113, 'img/bunny_small.png');
    this.particles.push(p2);
    this.particles.push(p3);
    this.particles.push(p4);

    this.constraints.push(new RodConstraint([2,3], this));
    this.constraints.push(new RodConstraint([2,4], this));
    this.constraints.push(new RodConstraint([3,4], this));

    var p5 = new SpriteParticle(600, 200, 'img/bunny_small.png');
    var p6 = new SpriteParticle(700, 200, 'img/bunny_small.png');
    var p7 = new SpriteParticle(700, 100, 'img/bunny_small.png');
    var p8 = new SpriteParticle(600, 100, 'img/bunny_small.png');
    this.particles.push(p5);
    this.particles.push(p6);
    this.particles.push(p7);
    this.particles.push(p8);

    this.constraints.push(new RodConstraint([5,6], this));
    this.constraints.push(new RodConstraint([6,7], this));
    this.constraints.push(new RodConstraint([7,8], this));
    this.constraints.push(new RodConstraint([8,5], this));

    this.forces.push(new SpringForce([5,7], 141, 1.0, 0.5));
    this.forces.push(new SpringForce([6,8], 141, 1.0, 0.5));

    //Angular example
    var p9 = new SpriteParticle(200, 200, 'img/bunny_small.png');
    var p10 = new SpriteParticle(300, 200, 'img/bunny_small.png');
    var p11 = new SpriteParticle(200, 175, 'img/bunny_small.png');
    var p12 = new SpriteParticle(300, 150, 'img/bunny_small.png');
    var p13 = new SpriteParticle(200, 125, 'img/bunny_small.png');
    var p14 = new SpriteParticle(300, 100, 'img/bunny_small.png');
    var p15 = new SpriteParticle(200, 75, 'img/bunny_small.png');
    var p16 = new SpriteParticle(300, 75, 'img/bunny_small.png');

    this.particles.push(p9);
    this.particles.push(p10);
    this.particles.push(p11);
    this.particles.push(p12);
    this.particles.push(p13);
    this.particles.push(p14);
    this.particles.push(p15);
    this.particles.push(p16);
    
    this.constraints.push(new RodConstraint([9, 10], this));
    this.constraints.push(new RodConstraint([10, 11], this));
    this.constraints.push(new RodConstraint([11, 12], this));
    this.constraints.push(new RodConstraint([12, 13], this));
    this.constraints.push(new RodConstraint([13, 14], this));
    this.constraints.push(new RodConstraint([14, 15], this));
    this.constraints.push(new RodConstraint([15, 16], this));

    this.forces.push(new AngularSpringForce([9, 11, 10],  this.particles, 14, 1.6, 0.0));
    this.forces.push(new AngularSpringForce([10, 12, 11], this.particles, 28, 0.8, 0.0));
    this.forces.push(new AngularSpringForce([11, 13, 12], this.particles, 28, 0.8, 0.0));
    this.forces.push(new AngularSpringForce([12, 14, 13], this.particles, 28, 0.8, 0.0));
    this.forces.push(new AngularSpringForce([13, 15, 14], this.particles, 28, 0.8, 0.0));
    this.forces.push(new AngularSpringForce([14, 16, 15], this.particles, 14, 1.6, 0.0));
  }
});

