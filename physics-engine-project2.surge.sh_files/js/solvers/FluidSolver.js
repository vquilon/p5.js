'use strict';

/**
 * @module solvers
 */

/**
 * Fluid solver class
 *
 * @depends {Obj}
 */
var FluidSolver = Obj.extend({
    init: function(particleSystem) {
        this.particleSystem = particleSystem;
        this.iterations = 20;
        this.dt = 0.05;
        this.dens;
        this.dens_prev;
        this.u;
        this.u_prev;
        this.v;
        this.v_prev;
        this.vorticity;
        this.width;
        this.height;
        this.rowSize;
        this.size;
        this.diffusion = 0.1;
        this.viscosity = 0;
        this.buoyancy = 0;
        this.static = false;
        this.setResolution(100, 180);
    },

    step: function(particles, stepSize) {
    },

    addFields: function(x, s, dt) {
        for (var i = 0; i < this.size; i++) x[i] += dt*s[i];
    },

    set_bnd: function(b, x, velocity) {
        if (b===1) { // X
            for (var i = 1; i <= this.width; i++) {
                x[i] = x[i + this.rowSize];
                x[i + (this.height+1) * this.rowSize] = x[i + this.height * this.rowSize];
            }

            for (var j = 1; i <= this.height; i++) {
                x[j * this.rowSize] = -x[1 + j * this.rowSize];
                x[(this.width + 1) + j * this.rowSize] = -x[this.width + j * this.rowSize];
            }
        } else if (b === 2) { // Y
            for (var i = 1; i <= this.width; i++) {
                x[i] = -x[i + this.rowSize];
                x[i + (this.height + 1) * this.rowSize] = -x[i + this.height * this.rowSize];
            }

            for (var j = 1; j <= this.height; j++) {
                x[j * this.rowSize] =  x[1 + j * this.rowSize];
                x[(this.width + 1) + j * this.rowSize] =  x[this.width + j * this.rowSize];
            }
        } else {
            for (var i = 1; i <= this.width; i++) {
                x[i] =  x[i + this.rowSize];
                x[i + (this.height + 1) * this.rowSize] = x[i + this.height * this.rowSize];
            }

            for (var j = 1; j <= this.height; j++) {
                x[j * this.rowSize] =  x[1 + j * this.rowSize];
                x[(this.width + 1) + j * this.rowSize] =  x[this.width + j * this.rowSize];
            }
        }

        //Set bounds corners
        var maxEdge = (this.height + 1) * this.rowSize;
        x[0]                 = 0.5 * (x[1] + x[this.rowSize]);
        x[maxEdge]           = 0.5 * (x[1 + maxEdge] + x[this.height * this.rowSize]);
        x[(this.width+1)]         = 0.5 * (x[this.width] + x[(this.width + 1) + this.rowSize]);
        x[(this.width+1)+maxEdge] = 0.5 * (x[this.width + maxEdge] + x[(this.width + 1) + this.height * this.rowSize]);

        // Internal boundaries
        // https://d2f99xq7vri1nk.cloudfront.net/legacy_app_files/pdf/talks/jos_gdc03.pdf
        for(var i = 0; i < this.objects.length; i++){
            if(this.objects[i] !== 0){
                // 0 When cell before is part of object, 1 when it is surrounding
                var before = (i - 1 % this.rowSize >= 1)                 ? 1 - Math.min(1,this.objects[i - 1]) : 1;
                var after =  ((i % this.rowSize) + 1 <= this.rowSize - 1)     ? 1 - Math.min(1,this.objects[i + 1]) : 1;
                var above =  (i - this.rowSize >= 0)                     ? 1 - Math.min(1,this.objects[i - this.rowSize]) : 1;
                var below =  (i + this.rowSize <= this.objects.length-1) ? 1 - Math.min(1,this.objects[i + this.rowSize]) : 1;

                //Value in x field around current cell
                var x_before = (before == 1) ? x[i - 1] : 0;
                var x_after =  (after == 1) ? x[i + 1] : 0;
                var x_above =  (above == 1) ? x[i - this.rowSize] : 0;
                var x_below =  (below == 1) ? x[i + this.rowSize] : 0;

                if(before+after+above+below > 0){
                    //Assign average value of neigboring non-object cells
                    
                    if(b==1 || b==2) {
                        x[i] *= -1; //flip velocity other way

                        //Find rigid body
                        if(particleFluid){
                        	var sx = 180 / 900;
                        	var sy = 100 / 500;
                        	var real_x = (i % this.rowSize) / sx;
                        	var real_y = Math.floor(i / this.rowSize) / sy;

    	                    var rigidBodies = this.particleSystem.getRigidBodies();
        	                var rigidBody = rigidBodies.find(function(rb) {
            	                return rb.containsPoint(real_x, real_y);
                	        });
     
    						if(typeof rigidBody !== "undefined") {
                        	    var vel = rigidBody.velocityAtPoint(real_x, real_y);
                                var factor = this.dt*1.1;
                	            if(b == 1){
            	                    x[i] += vel[0]*factor;
        	                    } else if (b == 2){
    	                            x[i] += vel[1]*factor;
                            	}
    						}
                        }
                        
                    } else {
                        x[i] = (x_before+x_after+x_above+x_below) / (before+after+above+below);
                    }
                } else {
                    //Be 0 inside the object
                    //x[i] = (x_before+x_after+x_above+x_below);
                    x[i] *= 0.98;
                }
            }
        }
    },

    // Gauss-Seidel relaxiation
    lin_solve: function(b, x, x0, a, c, velocity) {
        if (a === 0 && c === 1) {
            for (var j = 1; j <= this.height; j++) {
                var currentRow = j * this.rowSize;
                ++currentRow;

                for (var i = 0; i < this.width; i++) {
                    x[currentRow] = x0[currentRow];
                    ++currentRow;
                }
            }

            this.set_bnd(b, x, velocity);
        } else {
            var invC = 1 / c;

            for (var k = 0 ; k < this.iterations; k++) {
                for (var j = 1; j <= this.height; j++) {
                    var lastRow = (j - 1) * this.rowSize;
                    var currentRow = j * this.rowSize;
                    var nextRow = (j + 1) * this.rowSize;
                    var lastX = x[currentRow];
                    ++currentRow;

                    for (var i = 1; i <= this.width; i++)
                        lastX = x[currentRow] = (x0[currentRow] + a*(lastX+x[++currentRow]+x[++lastRow]+x[++nextRow])) * invC;
                }

                this.set_bnd(b, x, velocity);
            }
        }
    },
    
    diffuse: function(b, x, x0, dt, velocity) {
        var a = (b == 0) ? this.diffusion : this.viscosity;

        this.lin_solve(b, x, x0, a, 1 + 4*a, velocity);
    },
    
    advect: function(b, d, d0, u, v, dt) {
        var Wdt0 = dt * this.width;
        var Hdt0 = dt * this.height;
        var Wp5 = this.width + 0.5;
        var Hp5 = this.height + 0.5;
        for (var j = 1; j <= this.height; j++) {
            var pos = j * this.rowSize;
            for (var i = 1; i <= this.width; i++) {
                var x = i - Wdt0 * u[++pos]; 
                var y = j - Hdt0 * v[pos];
                if (x < 0.5)
                    x = 0.5;
                else if (x > Wp5)
                    x = Wp5;
                var i0 = x | 0;
                var i1 = i0 + 1;
                if (y < 0.5)
                    y = 0.5;
                else if (y > Hp5)
                    y = Hp5;
                var j0 = y | 0;
                var j1 = j0 + 1;
                var s1 = x - i0;
                var s0 = 1 - s1;
                var t1 = y - j0;
                var t0 = 1 - t1;
                var row1 = j0 * this.rowSize;
                var row2 = j1 * this.rowSize;
                d[pos] = s0 * (t0 * d0[i0 + row1] + t1 * d0[i0 + row2]) + s1 * (t0 * d0[i1 + row1] + t1 * d0[i1 + row2]);
            }
        }
        this.set_bnd(b, d);
    },
    
    project: function(u, v, p, div) {
        var h = -0.5 / Math.sqrt(this.width * this. height);
        for (var j = 1 ; j <= this.height; j++ ) {
            var row = j * this.rowSize;
            var previousRow = (j - 1) * this.rowSize;
            var prevValue = row - 1;
            var currentRow = row;
            var nextValue = row + 1;
            var nextRow = (j + 1) * this.rowSize;
            for (var i = 1; i <= this.width; i++ ) {
                div[++currentRow] = h * (u[++nextValue] - u[++prevValue] + v[++nextRow] - v[++previousRow]);
                p[currentRow] = 0;
            }
        }
        this.set_bnd(0, div, true);
        this.set_bnd(0, p, true);
        
        this.lin_solve(0, p, div, 1, 4 );
        var wScale = 0.5 * this.width;
        var hScale = 0.5 * this.height;

        for (var j = 1; j<= this.height; j++ ) {
            var prevPos = j * this.rowSize - 1;
            var currentPos = j * this.rowSize;
            var nextPos = j * this.rowSize + 1;
            var prevRow = (j - 1) * this.rowSize;
            var currentRow = j * this.rowSize;
            var nextRow = (j + 1) * this.rowSize;

            for (var i = 1; i <= this.width; i++) {
                u[++currentPos] -= wScale * (p[++nextPos] - p[++prevPos]);
                v[currentPos]   -= hScale * (p[++nextRow] - p[++prevRow]);
            }
        }
        this.set_bnd(1, u, true);
        this.set_bnd(2, v, true);
    },

    vorticity_confinement: function(dt){
        var curl = this.dens_prev.slice();
        var n = this.rowSize;

        //compute vorticity
        //var totalDens = 0;
        for (var j = 1; j <= this.height; j++) {
            for (var i = 1; i < this.width; i++) {
                var ij = j*this.rowSize + i;
                //totalDens += this.dens[ij];

                // curlx = dw/dy - dv/dz
                var x = (this.u[(i+1) + j*n] - this.u[(i-1) + j*n]) * 0.5;

                // curly = du/dz - dw/dx
                var y = (this.v[i + (j+1)*n] - this.v[i + (j-1)*n]) * 0.5;

                // curlz = dv/dx - du/dy
                var z = 0;

                // curl = |curl|
                curl[i+j*n] = Math.sqrt(x*x+y*y+z*z);
            }
        }

        //$('.navbar-brand').text(totalDens);

        //add vorticity confinement
        for (var j = 1; j <= this.height; j++) {
            for (var i = 1; i < this.width; i++) {
                var ij = j*this.rowSize + i;
                
                var Nx = (curl[(i+1) + j*n] - curl[(i-1) + j*n]) * 0.5;
                var Ny = (curl[i + (j+1)*n] - curl[i + (j-1)*n]) * 0.5;

                //normalize
                var len1 = 1/(Math.sqrt(Nx*Nx + Ny*Ny) + 0.0000000000000000001);
                Nx *= len1;
                Ny *= len1;

                this.u[ij] += Nx*this.u_prev[ij];
                this.v[ij] += Ny*this.v_prev[ij];
            }
        }
    },

    add_buoyancy: function(dt){
        var buoyancy = this.buoyancy;

        for (var i = 0; i < this.size; i++)
            this.v[i] += -this.dens[i] * buoyancy * dt;
    },
    
    dens_step: function(x, x0, u, v, dt) {
        this.addFields(x, x0, dt);
        this.diffuse(0, x0, x, dt );
        this.advect(0, x, x0, u, v, dt );
    },
    
    vel_step: function(u, v, u0, v0, dt) {
        this.addFields(u, u0, dt );
        this.addFields(v, v0, dt );

        var temp = u0; u0 = u; u = temp;
        var temp = v0; v0 = v; v = temp;
        this.diffuse(1, u, u0, dt, true);
        this.diffuse(2 ,v, v0, dt, true);
        this.project(u, v, u0, v0);
        var temp = u0; u0 = u; u = temp; 
        var temp = v0; v0 = v; v = temp;
        this.advect(1, u, u0, u0, v0, dt);
        this.advect(2, v, v0, u0, v0, dt);
        this.project(u, v, u0, v0 ); //conserve mass
    },

    update: function() {
        var sx = 180 / 900;
        var sy = 100 / 500;

        this.resetObjects();

        var rigidBodies = scene.getRigidBodies();
        rigidBodies.forEach(function(rigidBody){
            var pixels = rigidBody.getGridCells();

            for(var i = 0, q = pixels.length; i < q; i++){
                var x = i % (sx*rigidBody.width*2);
                var y = Math.floor(i / (sx*rigidBody.width*2));
                if(pixels[i] != 0) {
                    var rx = Math.round(sx * (rigidBody.position.x - rigidBody.width) + (x+1));
                    var ry = Math.round(sy * (rigidBody.position.y - rigidBody.height) + (y+1));
                    this.objects[rx + ry * this.rowSize] = pixels[i];
                }
            }
        }.bind(this));

        for (var i = 0; i < this.size; i++)
            this.u_prev[i] = this.v_prev[i] = this.dens_prev[i] = 0.0;

        this.vel_step(this.u, this.v, this.u_prev, this.v_prev, this.dt);
        this.dens_step(this.dens, this.dens_prev, this.u, this.v, this.dt);

        if(this.buoyancy !== 0) this.add_buoyancy(this.dt);
        this.vorticity_confinement(this.dt);
    },

    setDensity: function(x, y, d) {
         this.dens[(x + 1) + (y + 1) * this.rowSize] = d;
    },

    getDensity: function(x, y) {
         return this.dens[(x + 1) + (y + 1) * this.rowSize];
    },

    setVelocity: function(x, y, xv, yv) {
         this.u[(x + 1) + (y + 1) * this.rowSize] = xv;
         this.v[(x + 1) + (y + 1) * this.rowSize] = yv;
    },

    getXVelocity: function(x, y) {
         return this.u[(x + 1) + (y + 1) * this.rowSize];
    },

    getYVelocity: function(x, y) {
         return this.v[(x + 1) + (y + 1) * this.rowSize];
    },

    reset: function() {
        this.rowSize = this.width + 2;
        this.size = (this.width+2) * (this.height+2);
        this.dens = new Array(this.size);
        this.dens_prev = new Array(this.size);
        this.u = new Array(this.size);
        this.u_prev = new Array(this.size);
        this.v = new Array(this.size);
        this.v_prev = new Array(this.size);
        this.vorticity = new Array(this.size);
        this.objects = new Array(this.size);

        for (var i = 0; i < this.size; i++){
            empty[i] = this.vorticity[i] = this.objects[i] = this.dens_prev[i] = this.u_prev[i] = this.v_prev[i] = this.dens[i] = this.u[i] = this.v[i] = 0;        
        }
    },

    resetObjects: function(){
        this.objects = empty.slice();

        if(this.static) {
            var circle = [  0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                            0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,
                            0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,
                            0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,
                            0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
                            0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
                            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
                            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
                            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
                            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
                            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
                            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
                            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
                            0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,
                            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
                            0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,
                            0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
                            0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,
                            0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,
                            0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,
                            0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,
                            0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

            var circle2 = [ 1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,
                            1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,
                            1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
                            1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,
                            1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
                            1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
                            1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
                            1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
                            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                            1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,
                            1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
                            1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,
                            1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
                            1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,
                            1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,
                            1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,
                            1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,
                            1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1];

            for(var x = 0; x < 22; x++){
                for(var y = 0; y < 21; y++){
                    this.objects[(y+15) * this.rowSize + (x+20)] = circle[y*22 + x];
                }
            }
            // for(var x = 0; x < 22; x++){
            //     for(var y = 0; y < 22; y++){
            //         this.objects[(y+70) * this.rowSize + (x+70)] = circle2[y*22 + x];
            //     }
            // }

            var utahTeapot = [
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,1,1,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,0,0,
                0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,1,1,1,1,1,0,0,0,
                0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,1,1,1,1,1,0,0,0,0,
                0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,1,1,1,1,0,0,0,0,0,
                0,0,0,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,1,1,1,1,1,0,0,0,0,0,
                0,0,0,1,1,1,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,
                0,0,0,1,1,1,1,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,
                0,0,0,0,1,1,1,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,
                0,0,0,0,1,1,1,1,1,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,
                0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0
            ];

            for(var x = 0; x < 53; x++){
                for(var y = 0; y < 25; y++){
                    this.objects[(y+15) * this.rowSize + (x+70)] = utahTeapot[y*53 + x];
                }
            }

            for(var x = 0; x < 20; x++){
                for(var y = 0; y < 20; y++){
                    this.objects[(y+70) * this.rowSize + (x+20)] = 1;
                }
            }

            for(var x = 0; x < 20; x++){
                for(var y = 0; y < 20; y++){
                    this.objects[(y+70) * this.rowSize + (x+45)] = 1;
                }
            }
        }
    },

    setResolution: function (hRes, wRes) {
        var res = wRes * hRes;
        if (res > 0 && res < 1000000 && (wRes != this.width || hRes != this.height)) {
            this.width = wRes;
            this.height = hRes;
            this.reset();
            return true;
        }
        return false;
    },

    printField: function(field) {
        var output = '';
        field.forEach(function(x,i){
            output += x.toFixed(2) + ',\t';
            if((i+1) % this.rowSize == 0) output += "\n"; 
        }.bind(this));

        return output;
    }
});
var empty = [];
var buffer = null;
var bufferData = null;
var clampData = false;
function prepareBuffer(field, width, height) {
    if (buffer == null) {
        buffer = document.createElement("canvas");
        buffer.width = width;
        buffer.height = height;
    }
    
    if(bufferData == null) {
        try {
            var context = buffer.getContext("2d");
            bufferData = context.createImageData(width, height);
        } catch(e) {
            return null;
        }
        if (!bufferData)
            return null;

        //Set alpha channels of every pixel to opaque
        var max = width * height * 4;
        for (var i=3; i<max; i+=4)
            bufferData.data[i] = 255;
    }
}

var spriteAdded = false;
function displayDensity(field) {
    prepareBuffer(field, 180, 100);
    var context = buffer.getContext("2d");
    var width = field.width;
    var height = field.height;

    if (bufferData) {
        var data = bufferData.data;
        var dlength = data.length;

        if (clampData) {
            for (var x = 0; x < width; x++) {
                for (var y = 0; y < height; y++) {
                    var d = field.getDensity(x, y) * 255 / 5;
                    d = d | 0;
                    if (d > 255)
                        d = 255;
                    data[4*(y * height + x) + 1] = d;
                }
            }
        } else {
            for (var y = 0; y < height; y++) {
                for (var x = 0; x < width; x++) {
                    if(field.objects[(y+1) * (width+2) + x + 1] != 0 && field.static){
                        //if(field.getDensity(x, y) == 0) {
                            data[4*(y * width + x) + 0] = 0;
                            data[4*(y * width + x) + 1] = 160;
                            data[4*(y * width + x) + 2] = 255;
                        // } else {
                        //     data[4*(y * width + x) + 0] = 0;
                        //     data[4*(y * width + x) + 1] = 120;
                        //     data[4*(y * width + x) + 2] = 200;
                        // }
                    } else {
                        var r =  Math.abs((field.getXVelocity(x, y) * 1000 )   | 0);
                        var b =  Math.abs((field.getYVelocity(x, y) * 1000 )   | 0);
                        var g = (field.getDensity(x, y) * 255 / 4) | 0;
    
                        if(enableFluidForceColors){
                            data[4*(y * width + x) + 0] = 255 - r;
                            data[4*(y * width + x) + 1] = 255 - g;
                            data[4*(y * width + x) + 2] = 255 - b;
                        } else {
                            data[4*(y * width + x) + 0] = 255 - g;
                            data[4*(y * width + x) + 1] = 255 - g;
                            data[4*(y * width + x) + 2] = 255 - g;
                        }
                    }
                }
            }
        }
        context.clearRect(0,0,buffer.width, buffer.height);
        context.putImageData(bufferData, 0, 0);
    } else {
        for (var x = 0; x < width; x++) {
            for (var y = 0; y < height; y++) {
                var d = field.getDensity(x, y) / 5;
                context.setFillColor(0, d, 0, 1);
                context.fillRect(x, y, 1, 1);
            }
        }
    }

    var canvasTexture = PIXI.Texture.fromCanvas(buffer, PIXI.SCALE_MODES.NEAREST);
    var sprite = new PIXI.Sprite(canvasTexture);
    sprite.scale.x = 5;
    sprite.scale.y = 5;

    buffer = null;

    if(!spriteAdded){
        stage.addChildAt(sprite,0);
    } else {
        stage.removeChildAt(0);
        stage.addChildAt(sprite,0);
    }
    
    spriteAdded = true;
}

function displayInterpolatedDensity(field) {
    prepareBuffer(field, 900, 500);
    var context = buffer.getContext("2d");
    var sx = field.width / buffer.width;
    var sy = field.height / buffer.height;

    if (bufferData) {
        var data = bufferData.data;
        var dlength = data.length;

        for (var y = 0; y < buffer.height; y++) {
            for (var x = 0; x < buffer.width; x++) {
                var fx = x * sx;
                var fx1 = Math.floor(fx);
                var fx2 = fx1+1;

                var fy = y * sy;
                var fy1 = Math.floor(fy);
                var fy2 = fy1+1;

                var object = bilinearInterpolate(fx1, fx, fx2,
                                                    fy1, fy, fy2,
                                                    field.objects[(Math.floor(fy)+1) *(field.width+2) + (Math.floor(fx)+1)],
                                                    field.objects[(Math.floor(fy)+1) *(field.width+2) + (Math.ceil(fx)+1)],
                                                    field.objects[(Math.ceil(fy)+1) *(field.width+2) + (Math.floor(fx)+1)],
                                                    field.objects[(Math.ceil(fy)+1) *(field.width+2) + (Math.ceil(fx)+1)]
                );
                var dens = bilinearInterpolate(fx1, fx, fx2,
                                                    fy1, fy, fy2,
                                                    field.getDensity(fx1, fy1),
                                                    field.getDensity(fx2, fy1),
                                                    field.getDensity(fx1, fy2),
                                                    field.getDensity(fx2, fy2)
                );
                var vel_x = bilinearInterpolate(fx1, fx, fx2,
                                                fy1, fy, fy2,
                                                field.getXVelocity(fx1, fy1),
                                                field.getXVelocity(fx2, fy1),
                                                field.getXVelocity(fx1, fy2),
                                                field.getXVelocity(fx2, fy2)
                );
                var vel_y = bilinearInterpolate(fx1, fx, fx2,
                                                fy1, fy, fy2,
                                                field.getYVelocity(fx1, fy1),
                                                field.getYVelocity(fx2, fy1),
                                                field.getYVelocity(fx1, fy2),
                                                field.getYVelocity(fx2, fy2)
                );

                
                if(object > 0.5 && field.static){
                    if(dens == 0) {
                        data[4*(y * buffer.width + x) + 0] = 0;
                        data[4*(y * buffer.width + x) + 1] = 160;
                        data[4*(y * buffer.width + x) + 2] = 255;
                    } else {
                        data[4*(y * buffer.width + x) + 0] = 0;
                        data[4*(y * buffer.width + x) + 1] = 120;
                        data[4*(y * buffer.width + x) + 2] = 200;
                    }
                } else {
                    var r =  Math.abs((vel_x * 500 )   | 0);
                    var b =  Math.abs((vel_y * 500 )   | 0);
                    var g = (dens * 255 / 4) | 0;

                    if(enableFluidForceColors){
                        data[4*(y * buffer.width + x) + 0] = 255 - r;
                        data[4*(y * buffer.width + x) + 1] = 255 - g;
                        data[4*(y * buffer.width + x) + 2] = 255 - b;
                    } else {
                        data[4*(y * buffer.width + x) + 0] = 255 - g;
                        data[4*(y * buffer.width + x) + 1] = 255 - g;
                        data[4*(y * buffer.width + x) + 2] = 255 - g;
                    }
                }
            }
        }

        context.clearRect(0,0,buffer.width, buffer.height);
        context.putImageData(bufferData, 0, 0);
    }

    var canvasTexture = PIXI.Texture.fromCanvas(buffer);
    var sprite = new PIXI.Sprite(canvasTexture);
    buffer = null;

    if(!spriteAdded){
        stage.addChildAt(sprite, 0);
    } else {
        stage.removeChild(stage.children[0]);
        stage.addChildAt(sprite, 0);
    }
    
    spriteAdded = true;
}

function displayVelocity(field) {
    var vectorScale = 10;
    var wScale =  900 / field.width;
    var hScale = 500 / field.height;

    graphics.beginFill(0xffffff);
    graphics.drawRect(0,0,900,500);

    for (var x = 0; x < field.width; x+=3) {
        for (var y = 0; y < field.height; y+=3) {
            var velocity = [field.getXVelocity(x, y), field.getYVelocity(x, y)];

            // var length = velocity[0]*velocity[0] + velocity[1]*velocity[1];
            // if(length > 2){
            //     vectorScale = 1/length;
            // }
            graphics.lineStyle(2, velocityColor(velocity), 1);
            graphics.moveTo((x + 0.5)*wScale, (y + 0.5)*hScale);
            graphics.lineTo((x + 0.5 + vectorScale * velocity[0]) * wScale, 
                           (y + 0.5 + vectorScale * velocity[1]) * hScale);
        }
    }
}

function velocityColor(velocity){
    var maxVelocity = 0.6;
    var totalVelocity = Math.abs(velocity[0]) + Math.abs(velocity[1]);

    if (totalVelocity > maxVelocity) totalVelocity = maxVelocity;
    if (totalVelocity < -maxVelocity) totalVelocity = -maxVelocity;

    var hue = Math.floor((maxVelocity - totalVelocity) * 120 / maxVelocity);
    var color = HSVtoDecimal(hue/360, 1, 0.9);

    return color;
}

var bilinearInterpolate = function(x1,x,x2,y1,y,y2,Q11,Q21,Q12,Q22){
    
    /**
     * (x1, y1) - coordinates of corner 1 - [Q11]
     * (x2, y1) - coordinates of corner 2 - [Q21]
     * (x1, y2) - coordinates of corner 3 - [Q12]
     * (x2, y2) - coordinates of corner 4 - [Q22]
     * 
     * (x, y)   - coordinates of interpolation
     * 
     * Q11      - corner 1
     * Q21      - corner 2
     * Q12      - corner 3
     * Q22      - corner 4
    */
   
    var x2x1 = x2 - x1;
    var y2y1 = y2 - y1;
    var x2x = x2 - x;
    var y2y = y2 - y;
    var yy1 = y - y1;
    var xx1 = x - x1;

    return 1.0 / (x2x1 * y2y1) * (
        Q11 * x2x * y2y +
        Q21 * xx1 * y2y +
        Q12 * x2x * yy1 +
        Q22 * xx1 * yy1
    );
};