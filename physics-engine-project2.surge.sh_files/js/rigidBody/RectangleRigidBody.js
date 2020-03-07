'use strict';

/**
 * @module js
 */

RigidBody.prototype._init2 = RigidBody.prototype.init;

/**
 * Particle class
 *
 * @depends {Obj}
 */
var RectangleRigidBody = Obj.extend(RigidBody, {
    /**
     * Constructor
     *
     * @param {number} x   X coordinate of particle
     * @param {number} y   Y coordinate of particle
     */
    init: function(x, y, width, height) {
        this._init2(x, y);

        this.width = width;
        this.height = height;

        //http://scienceworld.wolfram.com/physics/MomentofInertiaRectangle.html

        // this.Ibody = (this.mass / 12) * (width * width + height * height);
        this.Ibody = (this.mass*(this.width * this.width + this.height * this.height))/15000;
        this.Ibodyinv = 1 / this.Ibody;

        //Add particle sprite
        this.rect = new PIXI.Graphics();
        stage.addChildAt(this.rect, 1);

        graphics = new PIXI.Graphics();
        stage.addChild(graphics);

        this.projection = new PIXI.Graphics();

        this.prevTime = null;
    },

    containsPoint: function(x, y) {
        var vs = this.getRotatedPoints();

        var inside = false;
        for (var i = 0, j = vs.length - 1; i < vs.length; j = i++) {
            var xi = vs[i][0], yi = vs[i][1];
            var xj = vs[j][0], yj = vs[j][1];

            var intersect = ((yi > y) != (yj > y))
                && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
            if (intersect) inside = !inside;
        }

        return inside;
    },

    getRotatedPoints: function(scaleX, scaleY) {
        if(typeof(scaleX) === "undefined")
            scaleX = 1;
        if(typeof(scaleY) === "undefined")
            scaleY = 1;

        //x and y
        var x = Math.round(this.position.x * scaleX);
        var y = Math.round(this.position.y * scaleY);
        var w = this.width * scaleX;
        var h = this.height * scaleY;

        var points = [
            [x - (w/2), y - (h/2)],
            [x + (w/2), y - (h/2)],
            [x + (w/2), y + (h/2)],
            [x - (w/2), y + (h/2)]
        ];

        return points.map(function(point){
            return rotate_point(point, [x,y], this.rotation);
        }.bind(this));
    },

    getClosestEdge: function(x, y){
        var points = this.getRotatedPoints(1,1);
        var edges = [
            [points[0], points[1]],
            [points[1], points[2]],
            [points[2], points[3]],
            [points[3], points[0]]
        ];

        edges.sort(function(a,b){
            var p1 = a[0];
            var p2 = a[1];
            var dist_a = distancePointToLine(x, y, p1[0], p1[1], p2[0],p2[1]);
            
            var p1 = b[0];
            var p2 = b[1];
            var dist_b = distancePointToLine(x, y, p1[0], p1[1], p2[0],p2[1]);

            return dist_a - dist_b;
        });

        var closestEdge = edges[0];
        var p1 = closestEdge[0];
        var p2 = closestEdge[1];

        return [closestEdge, distancePointToLine(x,y,p1[0], p1[1], p2[0],p2[1])];
    },

    applyImpulse: function(impulse, contactVector, normal){
        if(!this.pinned){
            this.force.x += (Math.abs(impulse[0]) < 20) ? impulse[0]*15 : impulse[0]*5;
            this.force.y += (Math.abs(impulse[1]) < 20) ? impulse[1]*15 : impulse[1]*5;

            this.torque += (this.Ibodyinv/2) * numeric.det([contactVector, impulse]);
        }
    },

    // draw: function() {
    //     this.rect.x = this.position.x;
    //     this.rect.y = this.position.y;

    //     this.rect.rotation = this.rotation;// Math.atan2(this.rotation[1][0], this.rotation[0][0]);
    //     //console.log("rot: " + this.rotation + " | mom: " + this.angularMomentum + " | vel: " + this.angularVelocity);
    // },
    draw: function(){
        this.rect.clear()
        this.rect.beginFill(0xFFFF00, 1);

        // Rotate points around origin x,y
        var points = this.getRotatedPoints();

        this.rect.lineStyle(1, 0x000000, 1);
        this.rect.drawPolygon([].concat.apply([], points));

        this.rect.lineStyle(3, 0xFF0000, 1);
        var lineLength = 2;
        var vel = this.velocityAtPoint(points[0][0], points[0][1]);
        this.rect.moveTo((points[0][0]), (points[0][1]));
        this.rect.lineTo((points[0][0]) + (vel[0]*lineLength), (points[0][1]) + (vel[1]*lineLength));

        vel = this.velocityAtPoint(points[1][0], points[1][1]);
        this.rect.moveTo((points[1][0]), (points[1][1]));
        this.rect.lineTo((points[1][0])+(vel[0]*lineLength), (points[1][1])+vel[1]*lineLength);

        vel = this.velocityAtPoint(points[2][0], points[2][1]);
        this.rect.moveTo((points[2][0]), (points[2][1]));
        this.rect.lineTo((points[2][0])+(vel[0]*lineLength), (points[2][1])+vel[1]*lineLength);

        vel = this.velocityAtPoint(points[3][0], points[3][1]);
        this.rect.moveTo((points[3][0]), (points[3][1]));
        this.rect.lineTo((points[3][0])+(vel[0]*lineLength), (points[3][1])+vel[1]*lineLength);


    },

    getGridCells: function(){
        if(this.prevTime === time)
            return this.pixels;

        this.prevTime = time;

        this.projection.clear()
        this.projection.beginFill(0x000, 1);

        //scale ratios
        var sx = 180 / 900;
        var sy = 100 / 500;
        var x = Math.round(this.position.x * sx);
        var y = Math.round(this.position.y * sy);
        var w = this.width * sx;
        var h = this.height * sy;

        // Rotate points around origin x,y
        var points = this.getRotatedPoints(sx, sy);

        this.projection.drawPolygon([].concat.apply([], points));

        var texture = new PIXI.RenderTexture(renderer, 180, 100);
        texture.render(this.projection);

        //Get pixel information around the object.
        var gl = renderer.gl;
        var realPixels = new Uint8Array((w*2) * (h*2) * 4);
        gl.bindFramebuffer(gl.FRAMEBUFFER, texture.textureBuffer.frameBuffer);
        gl.readPixels(x-w, y-h, w*2, h*2, gl.RGBA, gl.UNSIGNED_BYTE, realPixels);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        //Unfortunately, gl.ALPHA is not currently supported. Thus we need to remove RGB channels manually
        var pixels = [];
        for(var i = 3, z = realPixels.length; i < z; i+= 4){
            pixels.push(realPixels[i]);
        }

        this.pixels = pixels;
        return pixels;
    },

    velocityAtPoint: function(x,y) {
        var nx = x - this.position.x;
        var ny = y - this.position.y;

        return [
            (-ny * this.angularVelocity) + (this.velocity.x),
            (nx * this.angularVelocity) + (this.velocity.y)
        ];
    },

    clone: function(){
        var p = new RectangleRigidBody(this.position.x, this.position.y, this.width, this.height);

        p.velocity = {x: this.velocity.x, y: this.velocity.y};
        p.force = {x: this.force.x, y: this.force.y};

        p.rotation = 0+this.rotation;
        p.linearMomentum = {x: this.linearMomentum.x, y: this.linearMomentum.y};

        //Derived quantities
        p.angularVelocity = 0+this.angularVelocity;
        p.angularMomentum = 0+this.angularMomentum;

        //Computed quantities
        p.torque = 0+this.torque;

        p.pinned = this.pinned;

        return p;
    }
});

function rotate_point(point, origin, angle) {
    return [
        Math.cos(angle) * (point[0]-origin[0]) - Math.sin(angle) * (point[1]-origin[1]) + origin[0],
        Math.sin(angle) * (point[0]-origin[0]) + Math.cos(angle) * (point[1]-origin[1]) + origin[1]
    ];
}