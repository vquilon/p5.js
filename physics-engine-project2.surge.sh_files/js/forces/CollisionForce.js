'use strict';

/**
 * @module forces
 */

/**
 * RigidBody collision force class
 *
 * @depends {Force, Obj}
 * @extends {Force}
 */
var CollisionForce = Obj.extend(Force, {
	init: function(){
		this.feedbackforces = [];
	},

	apply: function(particles) {
		this.feedbackforces = [];
		var rigidBodies = scene.getRigidBodies();

		for(var i = 0; i < rigidBodies.length; i++){
			var rb = rigidBodies[i];

			for(var j = 0; j < rigidBodies.length; j++){
				if(i!=j){
					var rb2 = rigidBodies[j];

					this.resolveCollision(rb, rb2);
					this.resolveCollision(rb2, rb);
				}
			}
		}
	},

	resolveCollision: function(rb1, rb2){
		var points = rb1.getRotatedPoints();

		//points from rb hitting edges from rb2
		points = points.map(function(point){
			var edge = rb2.getClosestEdge(point[0], point[1]);
			return [point, edge[0], edge[1]];
		});

		var colliding = points.filter(function(entry){
			return entry[2] < 2;
		});

		colliding.forEach(function(entry){
			var point = entry[0];
			var closestEdge = entry[1];

			var closestEdgeVector = [
				closestEdge[0][0] - closestEdge[1][0],
				closestEdge[0][1] - closestEdge[1][1]
			];

			//Find normal of edge
			var normal = [-closestEdgeVector[1], closestEdgeVector[0]];
			var length = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
			normal[0] = (normal[0] == 0) ? 0 : normal[0] / length;
			normal[1] = (normal[1] == 0) ? 0 : normal[1] / length;

			var ra = numeric.sub(point, [rb1.position.x, rb1.position.y]);
			var rb = numeric.sub(point, [rb2.position.x, rb2.position.y]);

			//calculate relative velocity
			var rv = numeric.sub(numeric.add([rb2.position.x, rb2.position.y], numeric.mul(rb, rb2.angularVelocity)),
								 numeric.sub([rb1.position.x, rb1.position.y], numeric.mul(ra, rb1.angularVelocity)));

			//relative velocity along normal
			var contactVel = numeric.dot(rv, normal);

			// Do not resolve if velocities are separating
    		if(contactVel > 0)
      			return;

      		var raCrossN = numeric.det([ra, normal]);
      		var rbCrossN = numeric.det([rb, normal]);
      		var invMassSum = (1/rb1.mass) + (1/rb2.mass) + (raCrossN*raCrossN)*rb1.Ibodyinv + (rbCrossN*rbCrossN)*rb2.Ibodyinv;
			
			// Calculate impulse scalar
			var e = 0.2; //min restitution of rb1 and rb2
		    var j = -(1 + e) * contactVel;
		    j /= invMassSum;
		    j /= colliding.length;

			var impulse = numeric.mul(normal, j);

			rb1.applyImpulse([impulse[0], impulse[1]], ra, contactVel);
			rb2.applyImpulse([-impulse[0], -impulse[1]], rb, contactVel);
		});

		points.forEach(function(entry){
			var point = entry[0];
			var closestEdge = entry[1];

			if(rb2.containsPoint(point[0], point[1])){
				var closestEdgeVector = [
					closestEdge[0][0] - closestEdge[1][0],
					closestEdge[0][1] - closestEdge[1][1]
				];

				//Find normal of edge
				var normal = [-closestEdgeVector[1], closestEdgeVector[0]];
				var length = Math.sqrt(normal[0]*normal[0] + normal[1]*normal[1]);
				normal[0] = (normal[0] == 0) ? 0 : normal[0] / length;
				normal[1] = (normal[1] == 0) ? 0 : normal[1] / length;

				var ra = numeric.sub(point, [rb1.position.x, rb1.position.y]);
				var rb = numeric.sub(point, [rb2.position.x, rb2.position.y]);

				//calculate relative velocity
				var rv = numeric.sub(numeric.add([rb2.position.x, rb2.position.y], numeric.mul(rb, rb2.angularVelocity)),
									 numeric.sub([rb1.position.x, rb1.position.y], numeric.mul(ra, rb1.angularVelocity)));

				//relative velocity along normal
				var contactVel = numeric.dot(rv, normal);

				// Do not resolve if velocities are separating
	    		if(contactVel > 0)
	      			return;

	      		var raCrossN = numeric.det([ra, normal]);
	      		var rbCrossN = numeric.det([rb, normal]);
	      		var invMassSum = (1/rb1.mass) + (1/rb2.mass) + (raCrossN*raCrossN)*rb1.Ibodyinv + (rbCrossN*rbCrossN)*rb2.Ibodyinv;
				
				// Calculate impulse scalar
				var e = 0.2; //min restitution of rb1 and rb2
			    var j = -(1 + e) * contactVel;
			    j /= invMassSum;

				var impulse = numeric.mul(normal, j);

				var scale = 3;
				rb1.applyImpulse([scale*impulse[0], scale*impulse[1]], ra, contactVel);
				rb2.applyImpulse([-scale*impulse[0], -scale*impulse[1]], rb, contactVel);
			}
		}.bind(this));

	}
});