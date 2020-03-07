/*
 * Copyright (c) 2008-2009 Karsten Schmidt
 *
 * This demo & library is free software; you can redistribute it and/or
 * modify it under the terms of the GNU Lesser General Public
 * License as published by the Free Software Foundation; either
 * version 2.1 of the License, or (at your option) any later version.
 *
 * http://creativecommons.org/licenses/LGPL/2.1/
 *
 * This library is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the GNU
 * Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public
 * License along with this library; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin St, Fifth Floor, Boston, MA  02110-1301  USA
 */

let VerletPhysics2D = toxi.physics2d.VerletPhysics2D,
    GravityBehavior = toxi.physics2d.behaviors.GravityBehavior,
    VerletParticle2D = toxi.physics2d.VerletParticle2D,
    VerletSpring2D = toxi.physics2d.VerletSpring2D,
    Vec2D = toxi.geom.Vec2D,
    Rect =toxi.geom.Rect;

let DIM=15;
let REST_LENGTH=10;
let STRENGTH=0.125;
let INNER_STRENGTH = 0.13;

let physics;
let head,tail;

var stats;

function setup() {
  /*
  noLoop();
  setInterval(redraw, 0);
  */
  createCanvas(940, 582);


  stats = new Stats();
  stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
  document.body.appendChild(stats.dom);

  smooth();
  physics=new VerletPhysics2D();
  physics.addBehavior(new GravityBehavior(new Vec2D(0,0.1)));
  physics.setWorldBounds(new Rect(0,0,width,height));
  for(let y=0,idx=0; y<DIM; y++) {
    for(let x=0; x<DIM; x++) {
      let p = new VerletParticle2D(x*REST_LENGTH,y*REST_LENGTH);
      physics.addParticle(p);
      if (x>0) {
        let s= new VerletSpring2D(p,physics.particles[idx-1],REST_LENGTH,STRENGTH);
        physics.addSpring(s);
      }
      if (y>0) {
        let s = new VerletSpring2D(p,physics.particles[idx-DIM],REST_LENGTH,STRENGTH);
        physics.addSpring(s);
      }
      idx++;
    }
  }
  let p=physics.particles[0];
  let q=physics.particles[physics.particles.length-1];
  let len=sqrt(sq(REST_LENGTH*(DIM-1))*2);
  let s=new VerletSpring2D(p,q,len,INNER_STRENGTH);
  physics.addSpring(s);
  p=physics.particles[DIM-1];
  q=physics.particles[physics.particles.length-DIM];
  s=new VerletSpring2D(p,q,len,INNER_STRENGTH);
  physics.addSpring(s);
  var headIdx = (DIM-1)/2;
  console.log(headIdx)
  head=physics.particles[Math.floor(headIdx)];
  head.lock();
}

function draw() {
  stats.begin();

  background(0);
  stroke(255);
  head.set(mouseX,mouseY);
  physics.update();
  for(let i =0; i< physics.springs.length; i++) {
    let s = physics.springs[i];
    line(s.a.x,s.a.y,s.b.x,s.b.y);
  }

  stats.end();
}