'use strict';

/**
 * @module forces
 */

/**
 * Grid force class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var GridForce = Obj.extend(Force, {
	init: function() {
	},

	apply: function(particles) {
		graphics.clear();
		particles.forEach(function(p) {
			if(!(p instanceof RigidBody))
				return;

			var sx = 180 / 900;
			var sy = 100 / 500;

			var rigidBody = p;
			var pixels = rigidBody.getGridCells();

			for(var i = 0, q = pixels.length; i < q; i++) {
				var rowSize = (sx * rigidBody.width * 2);
				var x = i % rowSize;
				var y = Math.floor(i / rowSize);

				if (pixels[i] != 0) {
					// 0 When cell before is part of object, 1 when it is surrounding
					var before = (((i - 1) % rowSize) >= 1)                 	? 1 - Math.min(1,pixels[i - 1]) : 0;
					var after =  (((i % rowSize) + 1) <= (rowSize - 1))   ? 1 - Math.min(1,pixels[i + 1]) : 0;
					var above =  ((i - rowSize) >= 0)                     	? 1 - Math.min(1,pixels[i - rowSize]) : 0;
					var below =  ((i + rowSize) <= (pixels.length-1)) 			? 1 - Math.min(1,pixels[i + rowSize]) : 0;
					
					var rx = Math.round(sx * (rigidBody.position.x - rigidBody.width) + x);
					var ry = Math.round(sy * (rigidBody.position.y - rigidBody.height) + y);
					var j = ry * rowSize + rx; //index of cell in total grid

					var u = scene.fluidField.u;
					var v = scene.fluidField.v;
					var d = scene.fluidField.dens;

					//Sample velocities around point
					var localVelocities = [];
					if(before == 1) localVelocities.push([scene.fluidField.getXVelocity(rx-1,ry), scene.fluidField.getYVelocity(rx-1,ry), scene.fluidField.getDensity(rx-1,ry)]);
					if(after == 1) localVelocities.push([scene.fluidField.getXVelocity(rx+1,ry), scene.fluidField.getYVelocity(rx+1,ry), scene.fluidField.getDensity(rx+1,ry)]);
					if(above == 1) localVelocities.push([scene.fluidField.getXVelocity(rx,ry-1), scene.fluidField.getYVelocity(rx,ry-1), scene.fluidField.getDensity(rx,ry-1)]);
					if(below == 1) localVelocities.push([scene.fluidField.getXVelocity(rx,ry+1), scene.fluidField.getYVelocity(rx,ry+1), scene.fluidField.getDensity(rx,ry+1)]);

					localVelocities = localVelocities.filter(function(v) {
						return !isNaN(v[0]) && !isNaN(v[1]) && isFinite(v[0]) && isFinite(v[1]);
					});

					if(localVelocities.length === 0)
						continue;


					//For every pixel on the edge of the object
					if(before+after+above+below > 0){

						//Compute the normal of the surface
						var rrx = (rigidBody.position.x - rigidBody.width) + ((x+0.5)/sx);
						var rry = (rigidBody.position.y - rigidBody.height) + ((y+0.5)/sy);

						//Find closest edge
						var closestEdge = rigidBody.getClosestEdge(rrx, rry)[0];
						var closestEdgeVector = [
							closestEdge[0][0] - closestEdge[1][0],
							closestEdge[0][1] - closestEdge[1][1]
						];

						//Find normal of closest edge
						var normal = [closestEdgeVector[1], -closestEdgeVector[0]];
						var length = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
						normal[0] = (normal[0] == 0) ? 0 : normal[0] / length;
						normal[1] = (normal[1] == 0) ? 0 : normal[1] / length;

						
						//Find distance to center
						var surface = [-normal[1], normal[0]]; //perpendicular to normal
						var helper = [
							((rx/sx) - rigidBody.position.x),
							((ry/sy) - rigidBody.position.y)
						];

						//project along the surface
						helper[0] *= surface[0];
						helper[1] *= surface[1];

						var distanceToCenter = Math.sqrt(helper[0]*helper[0] + helper[1]*helper[1]);
						distanceToCenter *= (helper[0]+helper[1] < 0) ? distanceToCenter : -distanceToCenter; //difference clockwise / anticlockwise
						distanceToCenter /= 100;

						//project velocities along the normal
						var totalVelocity = localVelocities.map(function(v) {
							return [v[0]*normal[0], v[1]*normal[1], v[2]];
						});
						var totalVelocity = localVelocities.reduce(function(v1, v2) {
							return [v1[0] + v2[0], v1[1] + v2[1], v1[2] + v2[2]];
						});

						var velocityLength = Math.min(1, Math.sqrt(totalVelocity[0]*totalVelocity[0] + totalVelocity[1]*totalVelocity[1]));
						var localDensity = totalVelocity[2];

						//Display force lines
						var arrowlength = (Math.abs(distanceToCenter) * velocityLength)*2; //velocityLength*20 + 1;
						var point = [rrx+(normal[0]*arrowlength), rry+(normal[1]*arrowlength)];
						graphics.lineStyle(3, 0xff0000, 1);
						graphics.moveTo(rrx, rry);
						graphics.lineTo(point[0], point[1]);

						// var pressure = (0.5*localDensity) * (velocityLength*velocityLength);
						// rigidBody.torque += (distanceToCenter*pressure)/70;
						// rigidBody.force.x -= pressure*5;
						// rigidBody.force.y -= pressure*5;
						rigidBody.torque += (distanceToCenter * velocityLength)/100;
						rigidBody.force.x += (totalVelocity[0] * velocityLength)*7;
						rigidBody.force.y += (totalVelocity[1] * velocityLength)*7;

					}
				}
			}
		}.bind(this));

	}
});

function distancePointToLine(x, y, x1, y1, x2, y2) {
  var A = x - x1;
  var B = y - y1;
  var C = x2 - x1;
  var D = y2 - y1;

  var dot = A * C + B * D;
  var len_sq = C * C + D * D;
  var param = -1;
  if (len_sq != 0) //in case of 0 length line
      param = dot / len_sq;

  var xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  }
  else if (param > 1) {
    xx = x2;
    yy = y2;
  }
  else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  var dx = x - xx;
  var dy = y - yy;
  return Math.sqrt(dx * dx + dy * dy);
}