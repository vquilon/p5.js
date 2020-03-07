let movers;
// let moverA;
// let moverB;

var gui_col;
var dtime_local = 10
var Config = function() {
  this.message = 'dat.gui';
  this.dtime=dtime_local;
  this.fps=60;
  this.steps=1000;
  this.time=[0];
}
  //this.displayOutline = false;
  //this.explode = function() { ... };
  // Define render logic ...

var config

function setup() {
  // INCREASE FPS
  // noLoop();
  // setInterval(redraw, 10);
  //frameRate(10);

  // CONFIG DAT
  config = new Config();
  gui_col = new dat.GUI();
  gui_col.add(config, "dtime", 0, 50, 1).onChange(function(){
    if(config.dtime == 0){
      console.log("STOP");
      noLoop();
    } else{

      loop();
      //frameRate(config.dtime*60);
    }
  });
  gui_col.add(config, "steps", 0, 1000);
  gui_col.add(config, "fps", 0, 60).onChange(function(){
    frameRate(config.fps);
  });

  createCanvas(400, 400);
  background(0);

  // FPS
  stats = new Stats();
  stats.showPanel(0);
  document.body.appendChild(stats.dom);
  frameRate(config.fps);

  // Calculo del eje del tiempo, osea el valor de t en un momento dato con una precision de dtime
  // let time = [0];
  // let k = String(config.dtime).substring(String(config.dtime).indexOf('.')+1).length;
  // for(let x=0;x <= config.steps/config.dtime; x++) {
  //   time.push(Math.round(time[time.length-1]+config.dtime * Math.pow(10,k)) / Math.pow(10,k));
  // }


  // moverA = new Mover(200, 200, 4);
  // moverB = new Mover(100, 200, 8);

  movers = [];
  for(let i=1;i<20;i++){
    movers.push(new Mover(i*20, 100, 2));
  }

  //movers.push(new Mover(width/2, height/2, 20));
  airDensity = 0.8 // 1.225 kg/m3
  airPressure = 1 // 1 atm
  airTemperature = 15 // 15ºC
  airHummidity = 50 // rel %
}

function absoluteHummidity(R_H2O, T) {
  L = 2.5*Math.pow(10, 6) // J/Kg
  T0 = 273.15 // K

  e_s = 6.11 * Math.exp((L/R_H20)*((1/T0)-(1/T)))
  e = hummidity_rel*e_s
  hummidity_abs = e / (R_H2O*T)

  return hummidity_abs
}

function calculateAirDensity() {
  O2 = 0.20946      // %
  M_O2 = 2*15.9994  // Kg/Kmol
  N2 = 0.78084      // %
  M_N2 = 2*14.0067  // Kg/Kmol
  Ar = 0.00934      // %
  M_Ar = 39.948     // Kg/Kmol
  CO2 = 0.00033     // %
  M_co2 = 44.010    // Kg/Kmol

  // M_air = O2*M_O2 + N2*M_N2 + Ar*M_Ar + CO2*M_CO2
  M_air = 28.9647 // Kg/Kmol

  M_H2O = 18.01528 // Kg/Kmol
  R_H20 = Ru / M_H2O
  H2O = absoluteHummidity(R_H20, T) //porcentaje de humedad absoluta

  M_air = (1-H20)*M_air + H2O*M_H2O // Masa molar del aire
  

  Ru =  8314.47 // J/(kmol K)
  R_air = Ru / M_air



  density = pressure / (R_air*T)

  return density
}


function draw() {
  stats.begin();
  background(0);

  // let k = String(config.dtime).substring(String(config.dtime).indexOf('.')+1).length
  // time.push(Math.round(time[time.length-1]+ (config.dtime * Math.pow(10,k)) / Math.pow(10,k)));

  // if(time.length > config.steps){
  //   // Reinicio la ventana a 0 solo conservando el ultimo valor
  //   // Esto se puede modificar añadiendo steps como ventana, en la cual puedes ir
  //   // atras en el tiempo en ese rango de steps con un dtime dado
  //   // Si se quisiera modificar el dtime, hay que volver a recalcular
  //   // la escala de tiempo con el numero de steps, el max time de escala que habia, el min con un dtime

  //   // Si dtime es 1 y pasa a 0 el time queda parado
  //   // por lo que la escala de tiempo se queda estatica
  //   // pero sigue generando tiempos, por lo que habra que parar 
  //   // realmente la animacion
  //   time = [time[time.length-1]]
  // }

  //console.log(time);


  
  
  let wind = createVector(0, 0);
  if (mouseIsPressed) {
    if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0){
      wind = createVector(0.0005, 0);
      //wind = createVector(0.01, 0);
    }
    
  }
  
  let gravity = createVector(0, 0.001);
  //let gravity = createVector(0, 0.2);
  // background(0);
  for(let i=0;i<movers.length;i++) {

    // stroke(100);
    // text(Math.round(movers[i].pos.y-movers[i].r), movers[i].pos.x, 80);
    for (var dt_i = 0; dt_i < config.dtime; dt_i++) {
      movers[i].applyForce(wind, config.dtime);
      movers[i].applyForce(p5.Vector.mult(gravity, movers[i].mass), config.dtime);
      
      for(let j=0;j<movers.length;j++){
        if(i!=j){
          movers[i].collision(movers[j], 1);
        }
      }

      movers[i].edges();
      movers[i].update();
    }
  }
  
  //}
  // else{
  //   //Para ir rapido
  //   for(let x=0; x<config.dtime; x++) {
  //     let wind = createVector(0, 0);
  //     if (mouseIsPressed) {
  //       if (mouseX < width && mouseX > 0 && mouseY < height && mouseY > 0){
  //         //wind = createVector(0.1, 0);
  //       }
        
  //     }
      
  //     let gravity = createVector(0, 0.2);  

  //     for(let i=0;i<movers.length;i++) {
  //       movers[i].applyForce(wind);
  //       movers[i].applyForce(p5.Vector.mult(gravity, movers[i].mass));
  //       movers[i].edges();

  //       for(let j=0;j<movers.length;j++){
  //         if(i!=j){
  //           movers[i].collision(movers[j]);
  //         }
  //       }

      
  //       movers[i].update(1);
  //     }
  //   }
  // }

  for(let i=0;i<movers.length;i++) {
    movers[i].show();
  }
  //console.log(time);

  stats.end();
}