'use strict';

// Settings
var mouse_influence = 30,
    cloth_height = 20,
    cloth_width = 70,
    tear_distance = 30,
    canvas_width = 900,
    canvas_height = 500,
    enableForceColors = true,
    enableFluidForceColors = true,
    visualizeVelocity = false,
    bilinearInterpolation = false,
    particleFluid = false;

// Global
var renderer,
    canvas,
    stage,
    graphics,
    stats,
    scene,
    boundsx,
    boundsy,
    mouse = {
        down: false,
        button: 1,
        x: 0,
        y: 0,
        px: 0,
        py: 0
    };

var lastTime = null;
var deltaTime = null;
var time = null;

var pause = false;

var fps = 120;
var fpsInterval = 1000 / fps;

//We add a ccsTranspose function to the numeric library
numeric.ccsDiag = function ccsDiag(diag) {
    var ij = [];
    for (var i = 0; i < diag.length; ++i) ij.push(i);
    return numeric.ccsScatter([ij, ij, diag]);
};
numeric.ccsTranspose = function ccsTranspose( A )
{
    var rows_cols_vals = numeric.ccsGather( A );
    return numeric.ccsScatter( [ rows_cols_vals[1], rows_cols_vals[0], rows_cols_vals[2] ] );
};

function update() {
    requestAnimationFrame(update);

    time = Date.now();
    deltaTime = lastTime !== null ? time - lastTime : time;

    if (deltaTime > fpsInterval) {
        lastTime = time - (deltaTime % fpsInterval);

        stats.begin();

        if (!pause) {
            graphics.clear();

            scene.update();
            scene.draw();

            renderer.render(stage);
        }

        //var fps = 30; window.setTimeout(update, 1000/fps);
        
        stats.end();
    }
}

function start() {
    canvas.onmousedown = function(e) {
        mouse.button = e.which;
        mouse.px = mouse.x;
        mouse.py = mouse.y;
        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left,
            mouse.y = e.clientY - rect.top,
            mouse.down = true;
        e.preventDefault();
    };

    canvas.onmouseup = canvas.onmouseout = function(e) {
        mouse.down = false;
        e.preventDefault();
    };

    canvas.onmousemove = function(e) {
        mouse.px = mouse.x;
        mouse.py = mouse.y;

        var rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
        e.preventDefault();
    };

    canvas.oncontextmenu = function(e) {
        e.preventDefault();
    };

    boundsx = canvas.width - 1;
    boundsy = canvas.height - 1;

    scene = new Fluid3Scene();

    if (scene.solver instanceof Euler) {
        $('#methodSelector span.title').text('Euler');
        $('#methodSelector ul.dropdown-menu li').eq(0).addClass('active');
    } else if (scene.solver instanceof MidPoint) {
        $('#methodSelector span.title').text('MidPoint');
        $('#methodSelector ul.dropdown-menu li').eq(1).addClass('active');
    } else if (scene.solver instanceof RungeKutta) {
        $('#methodSelector span.title').text('RungeKutta');
        $('#methodSelector ul.dropdown-menu li').eq(2).addClass('active');
    }else if (scene.solver instanceof Verlet) {
        $('#methodSelector span.title').text('Verlet');
        $('#methodSelector ul.dropdown-menu li').eq(3).addClass('active');
    }

    if (scene instanceof Fluid3Scene) {
        $('#sceneSelector span.title').text('Static bodies');
        $('#sceneSelector ul.dropdown-menu li').eq(0).addClass('active');
    } else if(scene instanceof ClothFluidScene) {
        $('#sceneSelector span.title').text('Rigid bodies');
        $('#sceneSelector ul.dropdown-menu li').eq(1).addClass('active');
    }
     else if(scene instanceof ClothFluidScene2) {
        $('#sceneSelector span.title').text('Rigid bodies');
        $('#sceneSelector ul.dropdown-menu li').eq(2).addClass('active');
    }
     else if(scene instanceof RigidBodyScene) {
        $('#sceneSelector span.title').text('Rigid bodies');
        $('#sceneSelector ul.dropdown-menu li').eq(3).addClass('active');
    }
    else if (scene instanceof FluidScene) {
        $('#sceneSelector span.title').text('Fluid -> RigidBody');
        $('#sceneSelector ul.dropdown-menu li').eq(4).addClass('active');
    } else if (scene instanceof Fluid2Scene) {
        $('#sceneSelector span.title').text('RigidBody -> Fluid');
        $('#sceneSelector ul.dropdown-menu li').eq(5).addClass('active');
    }

    requestAnimationFrame(update);
}

window.onload = function() {
    var container = document.getElementsByClassName('container')[1];
    renderer = new PIXI.autoDetectRenderer(900, 500, {resolution: window.devicePixelRatio});
    renderer.backgroundColor = 0xffffff;
    canvas = renderer.view;
    container.appendChild(canvas);

    stage = new PIXI.Container();
    stage.interactive = true;

    graphics = new PIXI.Graphics();
    stage.addChild(graphics);

    stats = new Stats();
    document.body.appendChild( stats.domElement );

    var button = document.getElementById('pause');
    button.onclick = function(){
        pause = !pause;
        button.innerHTML = (pause) ? 'Play' : 'Pause';
    }

    $('body').keyup(function(e){
       if(e.keyCode == 32){
            pause = !pause;
            button.innerHTML = (pause) ? 'Play' : 'Pause';
       }
    });

    $("#stiffnessConstant").on("input change", function() {
        scene.stiffnessConstant = this.value / 100;
    });

    $("#timestep").on("input change", function() {
        scene.timestep = this.value / 200;
        scene.fluidField.dt = this.value / 100;
    });

    $("#stepsPerFrame").on("input change", function() {
        scene.stepsPerFrame = this.value;
    });

    $("#forceColors").on("input change", function() {
        enableForceColors = !enableForceColors;
    });

    $("#visualizeVelocity").on("input change", function() {
        visualizeVelocity = !visualizeVelocity;
    });

    $("#bilinearInterpolation").on("input change", function() {
        buffer = null;
        bufferData = null;
        bilinearInterpolation = !bilinearInterpolation;
    });

    $('#sceneSelector ul.dropdown-menu li').on('click', function() {
      //Make sure the clicked item has class active and reflect that in menu text
      $(this).siblings().removeClass('active');
      $(this).addClass('active');

      pause = true;
      while(stage.children[0]) { stage.removeChildAt(0); }
      graphics = new PIXI.Graphics();
      stage.addChild(graphics);

      setTimeout(function(){
          $('#sceneSelector span.title').text($(this).text());

          // Remove all children that are not the graphics context
          

          if($(this).text() == 'Rigid Bodies') {
              scene = new RigidBodyScene();
          }
          else if($(this).text() == 'ClothFluidScene'){
            scene = new ClothFluidScene();
            setTimeout(function(){stage.addChild(graphics);},50);
          }
          else if($(this).text() == 'ClothFluidScene2'){
            scene = new ClothFluidScene2();
            setTimeout(function(){stage.addChild(graphics);},50);
          }
          else if($(this).text() == 'Fluid -> RigidBody'){
            scene = new FluidScene();
          } else if($(this).text() == 'RigidBody -> Fluid'){
            scene = new Fluid2Scene();
          } else if($(this).text() == 'Static bodies'){
            scene = new Fluid3Scene();
          }
          pause = false;
      }.bind(this), 100);
    });

    $('#methodSelector ul.dropdown-menu li').on('click', function() {
      //Make sure the clicked item has class active and reflect that in menu text
      $(this).siblings().removeClass('active');
      $(this).addClass('active');

      pause = true;
      setTimeout(function(){
          $('#methodSelector span.title').text($(this).text());

          if($(this).text() == 'Euler'){
            scene.solver = new Euler(scene);
          } else if($(this).text() == 'MidPoint'){
            scene.solver = new MidPoint(scene);
          } else if($(this).text() == 'RungeKutta'){
            scene.solver = new RungeKutta(scene);
          } else if($(this).text() == 'Verlet'){
            scene.solver = new Verlet(scene);
          }
          $('#timestep').val(scene.timestep * 10);
          pause = false;
      }.bind(this), 100);
    });

    start();
};