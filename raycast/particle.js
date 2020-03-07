class Particle {
	constructor() {
		this.pos = createVector(width/2,height/2);
		this.rays = [];
		for(let a=0;a<360; a+=1){
			this.rays.push(new Ray(this.pos, radians(a), 0.4));
		}
		//this.rays.push(new Ray(this.pos, radians(110), 0.8, true, null));
	}

	look(walls, rays){
		let rays_reflected = []

		for(let ray of rays){
			let closest = null;
			let record = Infinity;
			let cWall = null;
			for(let wall of walls){
				//No puede chocar con el mismo muro que va reflejar el rayo
				//En un futuro cuando se choque con varios muros si vuelve a chocar que guarde en auxiliar el muro
				//y compruebe que no es el anterior choacdo
				if((!ray.source && wall !== ray.wall_source)|| ray.source){
					const pt = ray.cast(wall);
					if(pt){
						const d = p5.Vector.dist(ray.pos, pt);
						if(d<record){
							record = d;
							closest = pt;
							cWall = wall;

							//Se añade el muro con el que choca y el punto del muro
							ray.wall_end = cWall;
							ray.point_wall_end = closest;
						}
					}
				}
			}

			if(closest){
				ray.show()

				//CALCULO DEL RAYO REFLEJADO
				//Si la intensidad del nuevo rayo es menor a 0 no hay rebote
				if (float(ray.intensity.toFixed(2)) - cWall.absortion > 0) {
					//Calculo del rayo reflejado
					let vrayR = this.reflected(ray.pos, cWall, closest);
					let absoluteAngleReflected = vrayR.heading();
					let rayR = new Ray(closest, absoluteAngleReflected, float(ray.intensity.toFixed(2))-cWall.absortion, false, cWall);
					
					// Se añade el rayo reflejado
					rays_reflected.push(rayR);
					
				}
				
			}

		}
		// Se dibujan los nuevos rayos reflejados
		if (rays_reflected.length > 0) {
			this.look(walls, rays_reflected);
		}
		
	}

	reflected(source, cWall, closest){
		//Extraer y dibujar el rayo reflejado
		//let vwall = createVector(cWall.b.x-cWall.a.x,cWall.b.y-cWall.a.y);
		let vwall =  p5.Vector.sub(cWall.a, closest);
		//Vector del rayo del muro a la particula
		//let vray = createVector(closest.x-this.pos.x, closest.y-this.pos.y);
		let vray = p5.Vector.sub(createVector(source.x, source.y), closest);
		
		let vrayR = createVector(vray.x, vray.y);
		let alfa = vray.angleBetween(vwall);
		//Angulo reflejado con respecto al muro y el rayo
		let teta = alfa;
		let beta = alfa;
		if(alfa>=PI/2){
			beta = alfa - PI/2;
			teta = alfa - 2*beta;
		} else if(alfa<PI/2){
			beta = PI/2 - alfa;
			teta = alfa + 2*beta;
		}

		let rotateAngle = 2*beta;
		//El eje y esta invertido en la representacion
		let m = (cWall.b.y-cWall.a.y)/(cWall.a.x-cWall.b.x);
		let factor = 1;

		let bw1 = -closest.y-m*closest.x;
		let b1 =-source.y-m*source.x

		let equalDir = false;
		if(Math.sign(vrayR.y) == Math.sign(vrayR.x)){
			equalDir = true;
		} else {
			equalDir = false;
		}

		let isWall = m===0 || m===-Infinity || m===Infinity ? true:false;
		//VERSION 2.0
		//Calcular la pendiente de la recta ortogonal en el punto de choque
		//Calcular la pendiente de la recta de choque
		//saber si el punto foco esta arriba o abajo de la recta de choque
		//saber si el punto foco esta a la arriba o abajo de la recta ortogonal
		let mOrtogonal = -1/m;
		//b of the ortogonal line that match with focal point
		let bw2 =-closest.y-mOrtogonal*closest.x;
		let b2 =-source.y-mOrtogonal*source.x;

		if(m <= 0 && m !== -Infinity){
			//Si tienen la misma direccion factor negativo
			if(!equalDir){
				factor = -1;
			} else {
				factor = 1;
			}
			//Para los objetos que no sean los muros
			if(!isWall){
				//Esta arriba-derecha
				if(b1>=bw1){
					//Esta arriba-izquierda
					if(b2>=bw2){
						factor = 1;
					//Esta abajo-derecha
					} else{
						factor = -1;
					}
				//Esta abajo-izquierda
				} else {
					//arriba-izquierda
					if(b2>=bw2){
						factor = -1;
					//abajo-derecha
					} else{
						factor = 1;
					}
				}
			}
			
		//Pendiente positiva - b1 más grande a la derecha
		} else if(m > 0 || m === -Infinity){
			//Si tienen la misma direccion factor negativo
			if(equalDir){
				factor = -1;
			} else {
				factor = 1;
			}
			if(!isWall){
				//Esta arriba-izquierda
				if(b1>=bw1){
					//Esta arriba-derecha
					if(b2>=bw2){
						factor = -1;
					//Esta abajo-izquierda
					} else{
						factor = 1;
					}
				//Esta abajo-derecha
				} else {
					//Esta arriba-derecha
					if(b2>=bw2){
						factor = 1;
					//Esta abajo-izquierda
					} else{
						factor = -1;
					}
				}
			}
		}
		vrayR.rotate(2*beta*factor);
		return vrayR;
	}

	update(x,y){
		this.pos.set(x,y);
	}

	show(){
		fill(255);
		ellipse(this.pos.x,this.pos.y, 16);
		/*for(let ray of this.rays){
			ray.show();
		}
		*/
	}
}