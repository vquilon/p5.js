'use strict';

/**
 * @module scenes
 */

Scene.prototype._init = Scene.prototype.init;

var HairScene = Obj.extend(Scene, {
  init: function() {
    this._init();

    //Create some particles
    var spacing = 0.75;
    var hairColors = [0x8c5d3e, 0xa07447, 0xa08259, 0x7d4c2c]; //http://icon-tutorial.livejournal.com/5790563.html
    enableForceColors = false;

    function createStrand(start_x, start_y, length, color) {
      for(var i = 0; i < length; i++) {
        var p1 = this.particles[this.particles.length - 1];// new Particle(start_x + x * spacing, start_y + y * spacing);
        var p2 = new Particle(start_x + spacing, start_y + (i + 1) * spacing);
        var p3 = new Particle(start_x, start_y + (i + 2) * spacing);

        var p4 = new Particle(start_x + spacing, start_y + (i + 3) * spacing);
        var p5 = new Particle(start_x, start_y + (i + 4) * spacing);

        p1.mass = p2.mass = p3.mass = p3.mass = p4.mass = p5.mass = 30;

        this.particles.push(p1, p2, p3);

        var randomAngle = Math.floor(Math.random()*(160-140+1)+140);
        var randomLength = Math.floor(Math.random()*(11-9+1)+9);
        this.forces.push(new AngularSpringForce([this.particles.length - 3, this.particles.length - 1, this.particles.length - 2], this.particles, randomAngle, 15, 0.8, true));
        this.forces.push(new SpringForce([this.particles.length - 3, this.particles.length - 2], randomLength, 20.0, 0.8, color));
        this.forces.push(new SpringForce([this.particles.length - 2, this.particles.length - 1], randomLength, 20.0, 0.8, color));

        this.particles.push(p4, p5);

        this.forces.push(new AngularSpringForce([this.particles.length - 3, this.particles.length - 1, this.particles.length - 2], this.particles, randomAngle, 15, 0.8, true));
        this.forces.push(new SpringForce([this.particles.length - 3, this.particles.length - 2], randomLength, 20.0, 0.8, color));
        this.forces.push(new SpringForce([this.particles.length - 2, this.particles.length - 1], randomLength, 20.0, 0.8, color));

      }
    }

    var start_x = canvas.width / window.devicePixelRatio / 2 - cloth_width * spacing / 2;
    var start_y = 20;

    shuffle(range(120)).forEach(function(i){
      this.particles.push(new Particle(start_x + i * spacing, start_y));
      this.particles[this.particles.length - 1].pinned = true;

      var randomColor = hairColors[Math.floor(Math.random() * hairColors.length)];
      createStrand.call(this, start_x + i * spacing, 0, 6, randomColor);
    }.bind(this));
  }
});

function range(length) {
    return Array.apply(null, Array(length)).map(function (_, i) {return i;});
}

function shuffle(array) {
    return array.sort(function() {
      return .5 - Math.random();
    });
}

