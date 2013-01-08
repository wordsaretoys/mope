/**

	mope
	
	initialization and frame pump
	
	@module M
	@author cpgauthier

**/

var M = {

	prototypes: {},

	/**
		create GL context, set up objects, load resources

		@method start
	**/

	start: function() {

		var gl, init, total, id;

		// create the GL display and GL global variable
		M.display = RISE.createDisplay("gl");
		GL = M.display.gl;
		
		// resize display & redraw if window size changes
		window.addEventListener("resize", M.resize, false);
		
		// set initial display size
		M.display.setSize(
			document.body.clientWidth, 
			document.body.clientHeight
		);
		
		// set up debugger element
		M.debugit = document.getElementById("debugit");
		
		// set up any webgl stuff that's not likely to change
		GL.clearDepth(1.0);
		GL.depthFunc(GL.LEQUAL);
		GL.enable(GL.DEPTH_TEST);
		GL.clearColor(0.75, 0.75, 0.75, 1);
		
		// spawn worker thread
		M.worker = new Worker("worker.js");
		M.worker.onerror = function(e) {
			console.log("worker thread error: " + 
				e.message + " at line " +
				e.lineno + " in file " +
				e.filename);
		};
		
		// set up an array of all objects to be initialized
		inits = [ M.viewer, M.anchor ];
		total = inits.length;
		
		// create control object
		M.control = RISE.createControl();
				
		// set up a timer to call for the next several animation frames
		// this will perform initialization, with progress bar animations
		var initTimer = RISE.createTimer(function() {
			var il = inits.length;
			var np = total - il;
			// as long as there are objects to init
			if (il > 0) {
				// init the next one
				inits.shift().init();
			} else {
				// finished with init timer
				initTimer.stop();			

				// set display parameters
				M.resize();
				
				// create animation/debug timers
				M.updateTimer = RISE.createTimer(M.update);
				M.debugTimer = RISE.createTimer(M.debug, 100);
				
				// initialize worker thread
				M.worker.postMessage({
					cmd: "init"
				});
				
				// start everything
				M.control.start();
				M.updateTimer.start();
				M.debugTimer.start();
			}
		
		});
		
		initTimer.start();
	},
	
	/**
		handle browser resizing
		
		@method resize
	**/
	
	resize: function() {
		M.display.setSize(
			document.body.clientWidth, 
			document.body.clientHeight
		);
		M.viewer.camera.size(
			document.body.clientWidth, 
			document.body.clientHeight
		);
		M.draw(0);
	},
	
	/**
		update all objects that require it
		
		@method update
		@param t time in ms
	**/
	
	update: function(t) {
	
		var pp = M.viewer.camera.position;
		var ts = t * 0.001;
	
		M.control.update();
		M.viewer.update(ts);

		M.anchor.update(pp);

		M.draw(ts);
	},
	
	/**
		draw all objects that require it
		
		draw and update are separated so that the
		game can redraw the display when the game
		is paused (i.e., not updating) and resize
		events are being generated
		
		@method draw
		@param dt time interval in seconds
	**/
	
	draw: function(dt) {
		GL.disable(GL.BLEND);
		GL.disable(GL.CULL_FACE);
		GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
		
		M.anchor.draw();
	},
	
	dump: function(o) {
		M.debugit.innerHTML = JSON.stringify(o);
	},
	
	debug: function() {
		var s = "", e = "<br>";
		if (M.updateTimer.isRunning()) {
			var p = M.viewer.camera.position;
//			s += e + M.anchor.mesh.vertexCount;
		} else {
			s += e + "*** PAUSED ***";
		}
		M.debugit.innerHTML = s;
	}

};
