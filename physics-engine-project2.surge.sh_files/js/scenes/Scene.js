'use strict';

/**
 * @module scenes
 */

/**
 * Scene class
 *
 * @depends {Obj}
 */
var Scene = Obj.extend({
    /**
     * Constructor
     */
    init: function() {
        //Settings
        this.stiffnessConstant = 1.0;
        this.timestep = 0.4;
        this.stepsPerFrame = 10;

        //System components
        this.particles = [];
        this.solver = new Verlet(this);
        this.forces = [];
        this.constraints = [];

        //Add some standard forces
        this.forces.push(new GravityForce(0.02));
        this.forces.push(new DragForce(0.2));
        this.forces.push(new GroundForce());

        this.mouseDragging = false;
        this.mouseParticle = new Particle(mouse.x, mouse.y);
        this.mouseSprings = [];
    },

    getRigidBodies: function() {
        return this.particles.filter(function(p) {
            return p instanceof RigidBody;
        });
    },

    update: function() {
        for (var i = 0,z = this.stepsPerFrame; i < z; i++)
            this.solver.step(this.timestep);

        for (var i = 0; i < this.particles.length; i++) 
            this.particles[i].update();

        for (var i = 0; i < this.forces.length; i++)
            this.forces[i].update();

        this.mouseInteraction();
    },

    mouseInteraction: function(){
        if (mouse.down && mouse.button === 1) {
            this.mouseParticle.position.x = mouse.x;
            this.mouseParticle.position.y = mouse.y;

            if(!this.mouseDragging) {
                this.particles.forEach(function(p, i) {
                    var diff_x = p.position.x - mouse.x;
                    var diff_y = p.position.y - mouse.y;
                    var dist = Math.sqrt(diff_x * diff_x + diff_y * diff_y);

                    if (dist > mouse_influence)
                        return;

                    //The particle is within range, so create a spring between the mouse
                    //particle and the normal particle
                    var spring = new SpringForce([i, this.mouseParticle], 20, 0.5, 1);
                    this.mouseSprings.push(spring);
                    this.forces.push(spring);
                }.bind(this));

                this.mouseDragging = true;
            }
        }
        else if(this.mouseDragging) {
            //Remove the mouse<->particle springs
            while(this.mouseSprings.length > 0) {
                var spring = this.mouseSprings.pop();
                this.forces.splice(this.forces.indexOf(spring));
            }

            this.mouseDragging = false;
        }
    },

    draw: function() {
        for (var i = 0; i < this.particles.length; i++)
            this.particles[i].draw();

        for (var i = 0; i < this.forces.length; i++)
            this.forces[i].draw();

        for (var i = 0; i < this.constraints.length; i++)
            this.constraints[i].draw(this.particles);
    }
});