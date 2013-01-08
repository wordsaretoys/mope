/**
	maintain viewer state and camera, handle control 
	events related to viewer motion and interactions
	
	@namespace M
	@class viewer
**/

M.viewer = {

	motion: {
		moveleft: false, moveright: false,
		movefore: false, moveback: false,
		movefast: false
	},
	
	direct: RISE.createVector(),
	normal: RISE.createVector(),
	
	/**
		set up viewer objects such as camera,
		key event handlers and collision detector
		
		@method init
	**/

	init: function() {
		var that = this;

		// create a free camera
		this.camera = RISE.createCamera(30, 0.01, 25);

		// set up events to capture
		M.control.addAction("forward", "W", function(down) {
			that.motion.movefore = down;
		});
		M.control.addAction("backward", "S", function(down) {
			that.motion.moveback = down;
		});
		M.control.addAction("left", "A", function(down) {
			that.motion.moveleft = down;
		});
		M.control.addAction("right", "D", function(down) {
			that.motion.moveright = down;
		});
		M.control.addAction("sprint", "SHIFT", function(down) {
			that.motion.movefast = down;
		});
		M.control.addAction("pause", "PAUSE", function(down) {
			if (down) {
				if (M.updateTimer.isRunning()) {
					M.updateTimer.stop();
				} else {
					M.updateTimer.start();
				}
			}
		});
		M.control.addAction("fullscreen", "Q", function(down) {
			if (down) {
				M.control.setFullscreen();
			}
		});
		
	},
	
	/**
		react to viewer controls by updating velocity and position
		
		called on every animation frame
		
		@method update
	**/

	update: function(t) {
		var motion = this.motion;
		var camera = this.camera;
		var direct = this.direct;
		var normal = this.normal;
		var pos = camera.position;
		var surface = this.surface;
		var dx, dy, speed;
		
		// get mouse deltas, transform by time delta, and normalize by screen
		dx = 250 * t * M.control.trackX / M.display.width;
		dy = 250 * t * M.control.trackY / M.display.height;
	
		// turn the camera by specified rotations
		camera.turn(dy, dx, 0);

		// determine new movement direction
		direct.set();
		if (motion.movefore) {
			direct.add(camera.front);
		}
		if (motion.moveback) {
			direct.sub(camera.front);
		}
		if (motion.moveleft) {
			direct.sub(camera.right);
		}
		if (motion.moveright) {
			direct.add(camera.right);
		}
		direct.norm();
		speed = (motion.movefast ? 10 : 0.25) * t;

		// use spring-like force to push camera away from surface
		var s = Math.max(0, M.world.getAnchorField(pos.x, pos.y, pos.z)) - 0.05;
		var f = Math.pow((1 - s), 128) * 2;
		M.world.getAnchorNormal(normal, pos.x, pos.y, pos.z);
		normal.mul(f);
		direct.add(normal);

		direct.mul(speed);
		camera.move(direct.x, direct.y, direct.z);
	}
	
};
