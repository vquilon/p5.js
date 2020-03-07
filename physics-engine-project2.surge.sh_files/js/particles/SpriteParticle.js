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
var SpriteParticle = Obj.extend(Particle, {
    /**
     * Constructor
     *
     * @param {number} x   X coordinate of particle
     * @param {number} y   Y coordinate of particle
     */
    init: function(x, y, image) {
        this._init(x, y);

        //Add particle sprite
        this.sprite = new PIXI.Sprite(PIXI.Texture.fromImage(image));
        this.sprite.anchor.x = 0.5;
        this.sprite.anchor.y = 0.5;
        this.sprite.x = x;
        this.sprite.y = y;
        stage.addChild(this.sprite);
    },

    draw: function() {
        this.sprite.x = this.position.x;
        this.sprite.y = this.position.y;
    }
});
