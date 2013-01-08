/** generated on Mon Dec 31 14:46:53 EST 2012 **/

/**
	Rise Object Library for WebGL Applications
	
	@module RISE
	@author cpgauthier
**/

RISE = {
	prototypes: {}
};


/**
	bitmap plus pattern generators
	used to create texture objects
	
	@namespace RISE
	@class bitmap
**/

RISE.prototypes.bitmap = {

	/**
		fill in a single pixel on the bitmap
		
		@method set
		@param x, y coordinates of point to fill
		@param color color to fill it with
	**/
	
	set: function(x, y, color) {
		this.view[Math.floor(x) + this.width * Math.floor(y)] = color;
	},
	
	/**
		return a single pixel on the bitmap
		
		@method get
		@param x, y coordinates of point to return
		@return color at point
	**/
	
	get: function(x, y) {
		return this.view[Math.floor(x) + this.width * Math.floor(y)];
	},

	/**
		blend a single pixel on the bitmap
		
		@method blend
		@param x, y coordinates of point to blend
		@param color to fill it with
		@param blend mixing factor (0..1)
	**/
	
	blend: function(x, y, color, blend) {
		var i = Math.floor(x) + this.width * Math.floor(y);
		this.view[i] = RISE.misc.mixRGBA(this.view[i], color, blend);
	},
	
	/**
		enforce tiling rules for coordinates
		
		@method tile(X|Y)
		@method x, y, coordinates of point
		@return corrected coordinates
	**/
	
	tileX: function(x) {
		return (x >= this.width) ? 0 : (x < 0) ? this.width - 1 : x;
	},
	
	tileY: function(y) {
		return (y >= this.height) ? 0 : (y < 0) ? this.height - 1 : y;
	},

	/**
		fills a bitmap with a specified color
		
		@method fill
		@param color number, color value in 0xAABBGGRR format
	**/
	
	fill: function(color) {
		var dt = this.view;
		var il = dt.length;
		for (var i = 0; i < il; i++) {
			dt[i] = color;
		}
	},
	
	/**
		generate a pattern by random walking across bitmap
		
		blend MUST be the range (0..1)
		p0-p3 MUST be in range (0...1)
		
		@method walk
		@param reps number, multiplier for iterations
		@param blend number, multipler for blending
		@param color number, color value in 0xAABBGGRR format
		@param p0 number, chance of moving +x on each pass
		@param p1 number, chance of moving +y on each pass
		@param p2 number, chance of moving -x on each pass
		@param p3 number, chance of moving -y on each pass
	**/
		
	walk: function (reps, blend, color, p0, p1, p2, p3) {
		var dt = this.view;
		var scale = RISE.misc.scale;
		var il = Math.round(this.width * this.height * reps);
		var x, y, i;
		
		x = Math.floor(scale(Math.random(), 0, this.width));
		y = Math.floor(scale(Math.random(), 0, this.height));
		for (i = 0; i < il; i++) {

			this.blend(x, y, color, blend);
			
			if (Math.random() < p0) {
				x++;
			}
			if (Math.random() < p1) {
				y++;
			}
			if (Math.random() < p2) {
				x--;
			}
			if (Math.random() < p3) {
				y--;
			}
			
			x = this.tileX(x);
			y = this.tileY(y);
		}
	},
	
	/**
		blends color into the bitmap at random points
		
		@method stipple
		@param reps number, multiplier for iterations
		@param blend number, multipler for blending
		@param color number, color value in 0xAABBGGRR format
	**/
	
	stipple: function(reps, blend, color) {
		var dt = this.view;
		var scale = RISE.misc.scale;
		var mixRGBA = RISE.misc.mixRGBA;
		var l = this.width * this.height;
		var il = Math.round(l * reps);
		var i;
		
		for (i = 0; i < il; i++) {
			j = Math.floor(scale(Math.random(), 0, l));
			dt[j] = mixRGBA(dt[j], color, blend);
		}
	},
	
	/**
		draw a line across an image (with tiling)
		
		blend MUST be in the range (0..1)

		@method scratch
		@param blend number, multipler for blending
		@param color number, color value in 0xAABBGGRR format
		@param x, y number, starting point of scratch
		@param dx, dy number, direction of scratch
		@param len number, length of scratch
	**/
	
	scratch: function(blend, color, x, y, dx, dy, len) {
		
		for (var i = 0; i < len; i++) {
			this.blend(x, y, color, blend);
			x = this.tileX(x + dx);
			y = this.tileY(y + dy);			
		}
	},
	
	/**
		draw a tiled curve across an image
		
		blend MUST be in the range (0..1)
		curve SHOULD be in the range (0..1)

		@method sweep
		@param reps number, multiplier for iterations
		@param blend number, multipler for blending
		@param color number, color value in 0xAABBGGRR format
		@param curve number, curve factor
	**/
	
	sweep: function(reps, blend, color, curve) {
		var scale = RISE.misc.scale;
		var il = Math.round(this.width * this.height * reps);
		var x = scale(Math.random(), 0, this.width);
		var y = scale(Math.random(), 0, this.height);
		var dx = scale(Math.random(), -1, 1);
		var dy = scale(Math.random(), -1, 1);
		for (var i = 0; i < il; i++) {
			this.blend(x, y, color, blend);
			x = this.tileX(x + dx);
			y = this.tileY(y + dy);
			dx = dx + scale(Math.random(), -curve, curve);
			dy = dy + scale(Math.random(), -curve, curve);
			dd = 2 * Math.sqrt(dx * dx + dy * dy);
			dx /= dd;
			dy /= dd;
		}
	}
	
	
};

/**
	creates a new RBGA bitmap object
	
	@method createBitmap
	@param sz number size, must be power of 2
	@return object
**/

RISE.createBitmap = function(sz) {
	var o = Object.create(RISE.prototypes.bitmap);
	o.width = sz;
	o.height = sz;
	o.length = sz * sz * 4;
	o.data = new Uint8Array(o.length);
	o.view = new Uint32Array(o.data.buffer);
	return o;
};


/**
	growable buffer, any type
	
	@namespace RISE
	@class buffer
**/

RISE.prototypes.buffer = {

	STARTING_LENGTH: 16,

	/**
		place a variable list of of values into the buffer,
		growing the buffer if necessary, and advance to the
		next buffer position
		
		@method set
		@param list of values
	**/
	
	set: function() {
		var i, il = arguments.length;
		this.grow(il);
		for (i = 0; i < il; i++) {
			this.data[this.length++] = arguments[i];
		}
	},

	/**
		increase the size of the buffer if necessary
		
		@method grow
		@param n number of values to grow by
	**/
	
	grow: function(n) {
		var newSize = this.length + n;
		var newBuffer, l;
		if (newSize > this.data.length) {
			// find smallest power of 2 greater than newSize
			l = Math.pow(2, Math.ceil(Math.log(newSize) / Math.LN2));
			newBuffer = new (this.type)(l);
			newBuffer.set(this.data);
			this.data = newBuffer;
		}
	},

	/**
		copy/append another buffer into this one
		
		@method copy
		@param buffer another buffer object
	**/
	
	copy: function(buffer) {
		this.grow(buffer.length);
		this.data.set(buffer.data, this.length);
		this.length += buffer.length;
	},

	/**
		reset the buffer to its first position
		
		@method reset
	**/
	
	reset: function() {
		this.length = 0;
	}
};

/**
	create a new buffer object
	
	@method createBuffer
	@param type array type (Float32Array, Int8Array, etc)
	@return new buffer object
**/

RISE.createBuffer = function(type) {

	var o = Object.create(RISE.prototypes.buffer);
	
	o.type = type;
	o.data = new type(o.STARTING_LENGTH);
	o.length = 0;

	return o;
};


/**
	camera object (mote plus projection matrix)
	
	@namespace RISE
	@class camera
**/

RISE.prototypes.camera = {

	/**
		set camera aspect ratio and viewport
		
		@method size
		@param width, height dimensions of viewport
	**/
	size: function(width, height) {
		var aspectRatio = width / height;
		this.projector[0] = this.viewFactor / aspectRatio;
	}

};

/**
	create a new camera
	
	@method createCamera
	@param viewAngle viewing frustum angle
	@param nearLimit viewing frustum near limit
	@param farLimit viewing frustum far limit
	@return new camera object
**/

RISE.createCamera = function(viewAngle, nearLimit, farLimit) {

	// simulate OO-inheritance by adding camera members to mote object
	var o = RISE.misc.chain( RISE.createMote(), RISE.prototypes.camera );

	// set fixed matrix elements
	o.viewFactor = 1 / Math.tan(viewAngle * Math.PI / 180);
	o.projector = new Float32Array(16);
	var d = nearLimit - farLimit;
	o.projector[0] = o.viewFactor;
	o.projector[5] = o.viewFactor;
	o.projector[10] = (farLimit + nearLimit) / d;
	o.projector[11] = -1;
	o.projector[14] = 2 * nearLimit * farLimit / d;

	return o;
};

/**
	provides keyboard and mouse handling
	
	@namespace RISE
	@class control
**/

RISE.prototypes.control = {

	codeTable: {
		TAB: 9,
		ENTER: 13,
		PAUSE: 19,
		SPACE: 32,
		ESCAPE: 27,
		LEFT: 37,
		UP: 38,
		RIGHT: 39,
		DOWN: 40,
		SHIFT: 16,
		CTRL: 17,
		ALT: 18,

		F1: 112, F2: 113, F3: 114, F4: 115,
		F5: 116, F6: 117, F7: 118, F8: 119,
		F9: 120, F10: 121, F11: 122, F12: 123,
		
		A: 65, 	B: 66,	C: 67,	D: 68,
		E: 69,	F: 70,	G: 71,	H: 72,
		I: 73,	J: 74,	K: 75,	L: 76,
		M: 77,	N: 78,	O: 79,	P: 80,
		Q: 81,	R: 82,	S: 83,	T: 84,
		U: 85,	V: 86,	W: 87,	X: 88,
		Y: 89,	Z: 90,

		"0": 48, "1": 49, "2": 50, "3": 51,
		"4": 52, "5": 53, "6": 54, "7": 55,
		"8": 56, "9": 57,
		
		LMOUSE: -1,
		MMOUSE: -2,
		RMOUSE: -3
	},

	/**
		adds an entry to the action table
		
		func will be passed a parameter which will be true if the key or mouse
		button was pressed down, and false if it was released.
		
		@method addAction
		@param name string, short name of action (e.g., "forward")
		@param label string, control label (e.g., "TAB", "MOUSE1", "W")
		@param event function, execute when action triggered
	**/
	
	addAction: function(name, label, event) {
		var code = this.codeTable[label];
		this.addActionByCode(name, code, event);
	},
	
	/**
		adds a code entry to the action table
		
		func will be passed a parameter which will be true if the key or mouse
		button was pressed down, and false if it was released.
		
		@method addActionByCode
		@param name string, short name of action (e.g., "forward")
		@param code number, unicode key value or mouse button code to assign to action
		@param event function, execute when action triggered
	**/
	
	addActionByCode: function(name, code, event) {
		this.action[name] = {
			code: code,
			event: event,
			active: true
		};
	},
	
	/**
		looks up an action by its code
		
		@method lookup
		@param code number, assigned unicode key value or mouse button code
		@return action object, or undefined if no action found
	**/
	
	lookup: function(code) {
		var a, n;
		for (n in this.action) {
			a = this.action[n];
			if (a.active && a.code === code) {
				return a;
			}
		}
		return undefined;
	},

	/**
		set full screen mode (and kick off pointer lock)
	
		MUST be called in the context of a click or key event!
	
		@method setFullscreen
	**/

	setFullscreen: function() {
		var db = document.body;
		db.requestFullscreen = db.requestFullscreen || db.mozRequestFullscreen || 
			db.mozRequestFullScreen || db.webkitRequestFullscreen;
		db.requestFullscreen();
	}

};

/**
	create a control object
	
	@method createControl
	@param new control object
**/

RISE.createControl = function() {

	var o = Object.create(RISE.prototypes.control);
	o.action = [];

	var raw = {
		down: false,
		lock: false,
		lastX: 0,
		lastY: 0,
		dx: 0,
		dy: 0,
		run: false
	};

	// keyboard events we pass to the calling application
	window.addEventListener("keydown", function(e) {
		if (raw.run) {
			var action = o.lookup(e.keyCode);
			if (action) {
				action.event(true);
				return false;
			} else {
				return true;
			}
		}
	}, false);

	window.addEventListener("keyup", function(e) {
		if (raw.run) {
			var action = o.lookup(e.keyCode);
			if (action) {
				action.event(false);
				return false;
			} else {
				return true;
			}
		}
	}, false);

	// but mouse events we handle locally
	document.body.addEventListener("mousedown", function(e) {
		if (raw.run) {
			var action = o.lookup(-e.button - 1);
			if (action) {
				action.event(true);
			}
		
			raw.lastX = e.screenX;
			raw.lastY = e.screenY;
			raw.down = true;

			e.preventDefault();
		}
		return false;
	}, false);
	
	document.body.addEventListener("mouseup", function(e) {
		if (raw.run) {
			var action = o.lookup(-e.button);
			if (action) {
				action.event(false);
			}

			raw.down = false;
		}
		return false;
	}, false);

	document.body.addEventListener("mousemove", function(e) {
		if (raw.run && (raw.down || raw.lock)) {
			// if the movement properties are available
			if (typeof(e.movementX) !== "undefined" ||
			typeof(e.mozMovementX) !== "undefined" ||
			typeof(e.webkitMovementX) !== "undefined") {

				raw.dx += e.movementX || e.mozMovementX || e.webkitMovementX || 0;
				raw.dy += e.movementY || e.mozMovementY || e.webkitMovementY || 0;
				
			} else {
				// if not, fall back to click-n-drag method
				raw.dx += (e.screenX - raw.lastX);
				raw.dy += (e.screenY - raw.lastY);
			}
			raw.lastX = e.screenX;
			raw.lastY = e.screenY;
		}
		return false;
	}, false);
	
	// set handler for full screen change event
	var fullScreenChange = function () {
		var db = document.body;
		if (document.fullScreenElement === db || 
		document.webkitFullscreenElement === db ||
		document.mozFullscreenElement === db ||	
		document.mozFullScreenElement === db) {
			// if we go full screen, we want pointer lock too
			db.requestPointerLock = db.requestPointerLock || 
				db.mozRequestPointerLock || db.webkitRequestPointerLock;
			db.requestPointerLock();
		}
	};

	document.addEventListener("fullscreenchange", fullScreenChange, false);
	document.addEventListener("mozfullscreenchange", fullScreenChange, false);
	document.addEventListener("webkitfullscreenchange", fullScreenChange, false);
	
	// set handler for pointer lock event
	var pointerLockChange = function () {
		var db = document.body;
		// if pointer lock succeeded, set raw flag
		if (document.pointerLockElement === db || 
		document.webkitPointerLockElement === db ||
		document.mozPointerLockElement === db) {
			raw.lock = true;
		} else {
			raw.lock = false;
		}
	};
	
	document.addEventListener('pointerlockchange', pointerLockChange, false);
	document.addEventListener('mozpointerlockchange', pointerLockChange, false);
	document.addEventListener('webkitpointerlockchange', pointerLockChange, false);
	
	// add control and update methods
	// (can't be defined in prototype
	// as they interact with closure)
	o.update = function() {
		o.trackX = raw.dx;
		o.trackY = raw.dy;
		raw.dx = 0;
		raw.dy = 0;
	};
	o.start = function() {
		raw.run = true;
	};
	o.stop = function() {
		raw.run = false;
	};
	
	return o;
};

/**
	canvas object, GL context, plus operations
	
	@namespace RISE
	@class display
**/

RISE.prototypes.display = {

	/**
		adjust display size

		@method setSize
		@param width the new width of the canvas
		@param height the new height of the canvas
	**/

	setSize: function(width, height) {
		this.width = width;
		this.height = height;
		this.canvas.width = width;
		this.canvas.height = height;
		this.gl.viewport(0, 0, width, height);
	}
	
};

/**
	create a new display object
	
	@method createDisplay
	@param id DOM id of a canvas element
	@param alpha turns back-buffer alpha on/off
	@return display object
**/
	
RISE.createDisplay = function(id, alpha) {

	var o = Object.create(RISE.prototypes.display);

	o.canvas = document.getElementById(id);
	if (!o.canvas)
		throw "RISE.createDisplay couldn't create canvas object.";

	try {
		o.gl = o.canvas.getContext("experimental-webgl", {alpha: alpha} );
	}
	catch (e) {
		try {
			o.gl = o.canvas.getContext("webgl", {alpha: alpha} );
		}
		catch (e) {
			throw "RISE.createDisplay couldn't get WebGL context.";
		}
	}

	// just in case the browser didn't throw an exception in WebGL's absence
	if (!o.gl)
		throw "RISE.createDisplay couldn't get WebGL context.";

	return o;
};


/**
	wrapper around vertex buffer object
	
	@namespace RISE
	@class mesh
**/

RISE.prototypes.mesh = {

	/**
		generate a GL buffer from vertex/index data
		
		@method build
		@param vb vertex data buffer
		@param ib index data buffer
	**/
	
	build: function(vb, ib) {
		var gl = this.gl;
		
		// allocate and fill vertex buffer object
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex);
		gl.bufferData(gl.ARRAY_BUFFER, vb.data.subarray(0, vb.length), gl.STATIC_DRAW);
		this.vertexCount = vb.length / this.stride;
		
		// allocate and fill index buffer object, if data is present
		if (ib) {
			gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index);
			gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, ib.data.subarray(0, ib.length), gl.STATIC_DRAW);
			this.indexCount = ib.length;
		}
	},

	/**
		draw the mesh

		@method draw
	**/
	
	draw: function() {
		var gl = this.gl;
		var i, il, attr, acc;
		
		// bind the vertex/index data buffers
		gl.bindBuffer(gl.ARRAY_BUFFER, this.vertex);
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.index);

		// enable each attribute and indicate its position within the data buffer
		for (acc = 0, i = 0, il = this.attribute.length; i < il; i++) {
			attr = this.attribute[i];
			gl.enableVertexAttribArray(attr.id);
			gl.vertexAttribPointer(attr.id, attr.size, gl.FLOAT, false, 
				this.stride * Float32Array.BYTES_PER_ELEMENT, acc * Float32Array.BYTES_PER_ELEMENT);
			acc += attr.size;
		}
		
		// draw the vertex arrays (by index, if present)
		if (this.indexCount > 0) {
			gl.drawElements(this.drawPrimitive, this.indexCount, gl.UNSIGNED_SHORT, 0);
		} else {
			gl.drawArrays(this.drawPrimitive, 0, this.vertexCount);
		}

		// disable each attribute
		for (i = 0, il = this.attribute.length; i < il; i++)
			gl.disableVertexAttribArray(this.attribute[i].id);
	},
	
	/**
		release GL resources held by this object
		
		@method release
	**/
	
	release: function() {
		this.gl.deleteBuffer(this.vertex);
		this.gl.deleteBuffer(this.index);
	}

};

/**
	create a new mesh object
	
	id and sz must be the same length. typically,
	the call will be of the form
	
		mesh = RISE.createMesh( gl, [ shader.position, shader.normal ], [3, 3] );
		
	see the shader object for a similar convention
	
	@method createMesh
	@param gl GL context object
	@param id array of attribute names
	@param sz array of attribute float sizes
	@param dp draw primitive, defaults to TRIANGLES
	@return a new object
**/

RISE.createMesh = function(gl, id, sz, dp) {

	if (id.length !== sz.length) {
		throw "RISE.createMesh must be called with arrays of the same length.";
	}

	var o = Object.create(RISE.prototypes.mesh);
	
	o.gl = gl;
	o.drawPrimitive = dp || gl.TRIANGLES;

	o.vertex = gl.createBuffer();
	o.index = gl.createBuffer();
	o.vertexCount = 0;
	o.indexCount = 0;

	// create the attribute table and determine stride
	for (var i = 0, s = 0, a = []; i < id.length; i++) {
		a.push( { id: id[i], size: sz[i] } );
		s += sz[i];
	}

	o.attribute = a;
	o.stride = s;

	return o;
};


/**
	useful misc functions not available in JS
	
	@namespace RISE
	@class misc
**/

RISE.misc = {

	/**
		retrieve and concatenate text from DOM objects

		@method textOf
		@param ... list of DOM ids
		@return concatenated text from all objects
	**/
	
	textOf: function() {
		var i, il = arguments.length, text = "";
		for (i = 0; i < il; i++) {
			text += document.getElementById( arguments[i] ).innerHTML;
		}
		return text;
	},
	
	/**
		copy members from one object to another
		
		@method extend
		@param dest object to copy members to
		@param src object to copy members from
	**/

	extend: function(dest, src) {
		for (p in src)
			if (src.hasOwnProperty(p))
				dest[p] = src[p];
	},
	
	/**
		create an inheritance chain between two objects
		
		@method chain
		@param a object to extend
		@param b object to copy members from
		@return new object
	**/

	chain: function(a, b) {
		var o = Object.create(a);
		RISE.misc.extend(o, b);
		return o;
	},
	
	/**
		obtain current time at highest available precision
		
		@method getPreciseTime
		@return time in ms
	**/
	
	getPreciseTime: function() {
		if (window.performance.now) {
			return window.performance.now();
		}
		if (window.performance.webkitNow) {
			return window.performance.webkitNow();
		}
		return Date.now();
	},
	
	/**
		convert 4 color values to RGBA value
		
		@method toRGBA
		@param r, g, b, a real values in range (0..1)
		@return integer representing RBGA value
	**/
	
	toRGBA: function(r, g, b, a) {
		r = Math.round(r * 255) & 0xff;
		g = Math.round(g * 255) & 0xff;
		b = Math.round(b * 255) & 0xff;
		a = Math.round(a * 255) & 0xff;
		return r + (g << 8) + (b << 16) + (a << 24);
	},
	
	/**
		interpolate between two RGBA color values
		
		@method mixRGBA
		@param c1, c2 integers in 0xAABBGGRR color format
		@param mu mixing factor in range (0..1)
		@return mixed color in 0xAABBGGRR format
	**/
	
	mixRGBA: function(c1, c2, mu) {
		var um = 1 - mu;

		var r1 = c1 & 0xff;
		var g1 = (c1 >> 8) & 0xff;
		var b1 = (c1 >> 16) & 0xff;
		var a1 = (c1 >> 24) & 0xff;
	
		var r2 = c2 & 0xff;
		var g2 = (c2 >> 8) & 0xff;
		var b2 = (c2 >> 16) & 0xff;
		var a2 = (c2 >> 24) & 0xff;
		
		var r = Math.round(um * r1 + mu * r2) & 0xff;
		var g = Math.round(um * g1 + mu * g2) & 0xff;
		var b = Math.round(um * b1 + mu * b2) & 0xff;
		var a = Math.round(um * a1 + mu * a2) & 0xff;
		
		return r + (g << 8) + (b << 16) + (a << 24);
	},
	
	/**
		return the sign of a number
		
		@method sign
		@param n number to test
		@return -1 if negative, 0 if zero, 1 if positive
	**/
	
	sign: function(n) {
		return n > 0 ? 1 : (n < 0 ? -1 : 0);
	},
	
	/**
		clamp a number to a set of limits
		
		@method clamp
		@param n number to clamp
		@param l number representing lower bound
		@param h number representing upper bound
		@return clamped value
	**/

	clamp: function(n, l, h) {
		return Math.min(Math.max(n, l), h);
	},
	
	/**
		scale a number to specified limits
		
		@method scale
		@param x number in range (0..1)
		@param l lower bound
		@param u upper bound
		@return scaled value
	**/
	
	scale: function(x, l, u) {
		return l + (u - l) * x;
	},

	/**
		linear interpolation
		
		@method lerp
		@param y1 lower value
		@param y2 upper value
		@param mu mixing factor (0..1)
		@return interpolated value between (y1, y2)
	**/
	
	lerp: function(y1, y2, mu) {
		return y1 * (1.0 - mu) + y2 * mu;
	},

	/**
		cosine interpolation
		
		@method cerp
		@param y1 lower value
		@param y2 upper value
		@param mu mixing factor (0..1)
		@return interpolated value between (y1, y2)
	**/
	
	cerp: function(y1, y2, mu) {
		var mu2 = (1.0 - Math.cos(mu * Math.PI)) / 2.0;
		return lerp(y1, y2, mu2);
	},
	
	/**
		multiplies two 4x4 matrices
		
		@method mulMatrix
		@param a array, first matrix (WILL be overwritten)
		@param b array, second matrix
		@return array, product matrix
	**/
	
	mulMatrix: function(a, b) {
		// generate the product in a set of temporary variables
		var r0 = a[0] * b[0] + a[1] * b[4] + a[2] * b[8] + a[3] * b[12];
		var r1 = a[0] * b[1] + a[1] * b[5] + a[2] * b[9] + a[3] * b[13];
		var r2 = a[0] * b[2] + a[1] * b[6] + a[2] * b[10] + a[3] * b[14];
		var r3 = a[0] * b[3] + a[1] * b[7] + a[2] * b[11] + a[3] * b[15];

		var r4 = a[4] * b[0] + a[5] * b[4] + a[6] * b[8] + a[7] * b[12];
		var r5 = a[4] * b[1] + a[5] * b[5] + a[6] * b[9] + a[7] * b[13];
		var r6 = a[4] * b[2] + a[5] * b[6] + a[6] * b[10] + a[7] * b[14];
		var r7 = a[4] * b[3] + a[5] * b[7] + a[6] * b[11] + a[7] * b[15];

		var r8 = a[8] * b[0] + a[9] * b[4] + a[10] * b[8] + a[11] * b[12];
		var r9 = a[8] * b[1] + a[9] * b[5] + a[10] * b[9] + a[11] * b[13];
		var r10 = a[8] * b[2] + a[9] * b[6] + a[10] * b[10] + a[11] * b[14];
		var r11 = a[8] * b[3] + a[9] * b[7] + a[10] * b[11] + a[11] * b[15];

		var r12 = a[12] * b[0] + a[13] * b[4] + a[14] * b[8] + a[15] * b[12];
		var r13 = a[12] * b[1] + a[13] * b[5] + a[14] * b[9] + a[15] * b[13];
		var r14 = a[12] * b[2] + a[13] * b[6] + a[14] * b[10] + a[15] * b[14];
		var r15 = a[12] * b[3] + a[13] * b[7] + a[14] * b[11] + a[15] * b[15];
		
		// overwrite the first matrix
		a[0] = r0;
		a[1] = r1;
		a[2] = r2;
		a[3] = r3;
		
		a[4] = r4;
		a[5] = r5;
		a[6] = r6;
		a[7] = r7;
		
		a[8] = r8;
		a[9] = r9;
		a[10] = r10;
		a[11] = r11;
		
		a[12] = r12;
		a[13] = r13;
		a[14] = r14;
		a[15] = r15;

		return a;
	},
	
	/**
		create seedable PRNG for repeatable sequences
		
		@method prng
		@param seed initial seed
		@return new prng object
	**/
	
	prng: function(seed) {
		return {
			seed: seed || 0,
			modu: Math.pow(2, 32),
			next: function() {
				return (this.seed = Math.abs(this.seed * 1664525 + 1013904223) % this.modu) / this.modu;
			}
		};
	}
};


/**
	represents a location plus orientation
	may be used as a base class for game objects
	
	@namespace RISE
	@class mote
**/

RISE.prototypes.mote = {

	/**
	 	turn mote on each axis by specified amounts
	 
	 	@method turn
	 	@param x, y, z angles in radians
	**/
	turn: function(x, y, z) {
	
		var rotations = this.rotations;
		var transpose = this.transpose;
		var modelview = this.modelview;
		
		// rotate by specified amounts
		var qx = this.qx.setFromAxisAngle(1, 0, 0, x);
		var qy = this.qy.setFromAxisAngle(0, 1, 0, y);
		var qz = this.qz.setFromAxisAngle(0, 0, 1, z);
		this.rotor.copy(qx.mul(qy).mul(qz).mul(this.rotor).norm());

		// generate rotation matrix
		this.rotor.toMatrix(rotations);

		// generate orientation vectors
		// (front vector inverted for LH coordinate system)
		this.right.set(rotations[0], rotations[4], rotations[8]);
		this.up.set(rotations[1], rotations[5], rotations[9]);
		this.front.set(rotations[2], rotations[6], rotations[10]).neg();

		// generate transpose matrix
		transpose[0] = rotations[0];
		transpose[1] = rotations[4];
		transpose[2] = rotations[8];

		transpose[4] = rotations[1];
		transpose[5] = rotations[5];
		transpose[6] = rotations[9];

		transpose[8] = rotations[2];
		transpose[9] = rotations[6];
		transpose[10] = rotations[10];

		// copy to modelview w/ transformed position
		modelview[0] = rotations[0];
		modelview[1] = rotations[1];
		modelview[2] = rotations[2];

		modelview[4] = rotations[4];
		modelview[5] = rotations[5];
		modelview[6] = rotations[6];

		modelview[8] = rotations[8];
		modelview[9] = rotations[9];
		modelview[10] = rotations[10];
		
		this.updateModelview();
	},
	
	/**
		translate position by specified vector
		
		@method move
		@param x, y, z translation coordinates
	**/
	move: function(x, y, z) {
		this.position.x += x;
		this.position.y += y;
		this.position.z += z;
		this.updateModelview();
	},
	
	/**
		updates modelview matrix with transformed position
		
		@method updateModelview
	**/
	updateModelview: function() {
		var modelview = this.modelview;
		var p = this.position;
		modelview[12] = -(modelview[0] * p.x + modelview[4] * p.y + modelview[8] * p.z);
		modelview[13] = -(modelview[1] * p.x + modelview[5] * p.y + modelview[9] * p.z);
		modelview[14] = -(modelview[2] * p.x + modelview[6] * p.y + modelview[10] * p.z);
	}

};

/**
	create a new mote
	
	@method createMote
	@return new mote object
**/

RISE.createMote = function() {

	var o = Object.create(RISE.prototypes.mote);
	
	o.position = RISE.createVector();
	o.rotor = RISE.createQuaternion(0, 0, 0, 1);
	
	o.front = RISE.createVector();
	o.up = RISE.createVector();
	o.right = RISE.createVector();

	o.rotations = new Float32Array(16);
	o.transpose = new Float32Array(16);
	o.modelview = new Float32Array(16);

	o.qx = RISE.createQuaternion();
	o.qy = RISE.createQuaternion();
	o.qz = RISE.createQuaternion();
	
	o.rotor.toMatrix(o.rotations);
	o.rotor.toMatrix(o.transpose);
	o.rotor.toMatrix(o.modelview);

	o.updateModelview();
			
	return o;
};

/**
	quaternion in 3-space plus standard operations
	
	@namespace RISE
	@class quaternion
**/

RISE.prototypes.quaternion = {

	/**
		set the elements of the quaternion
		
		@method set
		@param x any real number
		@param y any real number
		@param z any real number
		@param w any real number
		@return the object itself
	**/
	
	set: function(x, y, z, w) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		this.w = w || 0;
		return this;
	},

	/**
		copy elements from another quaternion

		@method copy		
		@param a object to copy from
		@return the object itself
	**/
	
	copy: function(a) { 
		this.x = a.x;
		this.y = a.y;
		this.z = a.z;
		this.w = a.w;
		return this;
	},
	
	/**
		multiply another quaternion by this one
		result = this * a

		@method mul	
		@param a quaternion to multiply
		@return the object itself, multiplied
	**/
	
	mul: function(a) {
		var tx = this.x;
		var ty = this.y;
		var tz = this.z;
		var tw = this.w;
		this.x = tw * a.x + tx * a.w + ty * a.z - tz * a.y;
		this.y = tw * a.y + ty * a.w + tz * a.x - tx * a.z;
		this.z = tw * a.z + tz * a.w + tx * a.y - ty * a.x;
		this.w = tw * a.w - tx * a.x - ty * a.y - tz * a.z;
		return this;
	},

	/**
		negate the quaternion
		
		@method neg
		@return the object iself, negated
	**/
	
	neg: function() {
		return this.set(-this.x, -this.y, -this.z, this.w); 
	},

	/**
		normalize the quaternion
		
		@method norm
		@return the object itself, normalized
	**/
	
	norm: function()
	{
		var mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
		return this.set(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
	},

	/**
		copy quaternion data into array
		
		@method toArray
		@param a array to copy to, defaults to new empty array
		@return array containing elements [x, y, z, w]
	**/
	
	toArray: function(a)
	{
		a = a || [];
		a[0] = this.x;
		a[1] = this.y;
		a[2] = this.z;
		a[3] = this.w;
		return a;
	},
	
	/**
		generate matrix from quaternion
		
		@method toMatrix
		@param m array to copy to, defaults to new empty array
		@return 16-element array containing generated matrix
	**/
	
	toMatrix: function(m) {
		m = m || [];
		m[0] = 1.0 - 2.0 * (this.y * this.y + this.z * this.z);
		m[1] = 2.0 * (this.x * this.y + this.z * this.w);
		m[2] = 2.0 * (this.x * this.z - this.y * this.w);
		m[3] = 0;
		m[4] = 2.0 * (this.x * this.y - this.z * this.w);
		m[5] = 1.0 - 2.0 * (this.x * this.x + this.z * this.z);
		m[6] = 2.0 * (this.z * this.y + this.x * this.w);
		m[7] = 0;
		m[8] = 2.0 * (this.x * this.z + this.y * this.w);
		m[9] = 2.0 * (this.y * this.z - this.x * this.w);
		m[10] = 1.0 - 2.0 * (this.x * this.x + this.y * this.y);
		m[11] = 0;
		m[12] = 0;
		m[13] = 0;
		m[14] = 0;
		m[15] = 1;
		return m;
	},
	
	/**
		sets quaternion data from axis-angle representation
		
		@method setFromAxisAngle
		@param x any real number
		@param y any real number
		@param z any real number
		@param ang any real number
		@return the object itself
	**/
	
	setFromAxisAngle: function(x, y, z, ang) {
		var ha = Math.sin(ang / 2);
		return this.set(x * ha, y * ha, z * ha, Math.cos(ang / 2));
	},
	
	/**
		smooth linear interpolation between two quaternions
		
		@method slerp
		@param a object, quaternion
		@param b object, quaternion
		@param m number, interpolation factor
		@return interpolated quaternion
	**/
	
	slerp: function(a, b, m) {
		this.x += m * (b.x - a.x);
		this.y += m * (b.y - a.y);
		this.z += m * (b.z - a.z);
		this.w += m * (b.w - a.w);
		return this.norm();
	}
	
	
};

/**
	create a new quaternion object
	
	@method createQuaternion
	@param x the x-coordinate of the axis vector
	@param y the y-coordinate of the axis vector
	@param z the z-coordinate of the axis vector
	@param w the rotation around the axis vector
	@return new quaternion object
**/

RISE.createQuaternion = function(x, y, z, w) {
	var o = Object.create(RISE.prototypes.quaternion);
	o.set(x, y, z, w);
	return o;
};


/**
	wrapper around GL shader
	
	@namespace RISE
	@class shader
**/

RISE.prototypes.shader = {

	/**
		activates the shader program
		
		@method activate
	**/
	
	activate: function() {
		this.gl.useProgram(this.program);
	},

	/**
		release GL resources held by this object
		
		@method release
	**/
	
	release: function() {
		var gl = this.gl;
		var shader = gl.getAttachedShaders(this.program);
		var i, il;
		for (i = 0, il = shader.length; i < il; i++) {
			gl.detachShader(this.program, shader[i]);
			gl.deleteShader(shader[i]);
		}
		gl.deleteProgram(this.program);
	}

};

/**
	create a shader program object
	
	compiles the code into a GL program object. references to all 
	specified uniforms and samples are also added to this object.

	@method createShader
	@param GL context
	@param vertex string containing the vertex shader code to compile
	@param fragment string containing the fragment shader code to compile
	@param attributes array of all attribute variables referenced in vertex shader
	@param uniforms array of all uniform variables referenced in the shaders
	@param samplers array of all sampler variables referenced in the shaders
	@return new program object
**/

RISE.createShader = function(gl, vertex, fragment, attributes, uniforms, samplers) {

	attributes = attributes || [];
	uniforms = uniforms || [];
	samplers = samplers || [];

	// compile the vertex shader
	var vobj = gl.createShader(gl.VERTEX_SHADER);
	gl.shaderSource(vobj, vertex);
	gl.compileShader(vobj);
	if (!gl.getShaderParameter(vobj, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(vobj));
		throw "RISE.createShader couldn't compile vertex shader";
	}

	// compile the fragment shader
	var fobj = gl.createShader(gl.FRAGMENT_SHADER);
	gl.shaderSource(fobj, fragment);
	gl.compileShader(fobj);
	if (!gl.getShaderParameter(fobj, gl.COMPILE_STATUS)) {
		console.log(gl.getShaderInfoLog(fobj));
		throw "RISE.createShader couldn't compile fragment shader";
	}

	// create and link the shader program
	var prog = gl.createProgram();

	gl.attachShader(prog, vobj);
	gl.attachShader(prog, fobj);
	gl.linkProgram(prog);

	if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
		console.log(gl.getProgramInfoLog(prog));
		throw "RISE.createShader couldn't link shader program";
	}

	var o = Object.create(RISE.prototypes.shader);
	o.program = prog;
	o.gl = gl;

	// add attribute, uniform, and sampler variables
	var i, il, n;
	for (i = 0, il = attributes.length; i < il; i++) {
		n = attributes[i];
		o[n] = gl.getAttribLocation(prog, n);
	}
	for (i = 0, il = uniforms.length; i < il; i++) {
		n = uniforms[i];
		o[n] = gl.getUniformLocation(prog, n);
	}
	for (i = 0, il = samplers.length; i < il; i++) {
		n = samplers[i];
		o[n] = gl.getUniformLocation(prog, n);
	}

	return o;
};


/**
	javascript implementation of the marching cubes algorithm
	ported from http://paulbourke.net/geometry/polygonise and
	http://webglsamples.googlecode.com/hg/caves/caves.html
	
	@namespace RISE
	@class surfacer
**/

RISE.prototypes.surfacer = {

	edgeTable: new Int16Array([
		0x0  , 0x109, 0x203, 0x30a, 0x406, 0x50f, 0x605, 0x70c,
		0x80c, 0x905, 0xa0f, 0xb06, 0xc0a, 0xd03, 0xe09, 0xf00,
		0x190, 0x99 , 0x393, 0x29a, 0x596, 0x49f, 0x795, 0x69c,
		0x99c, 0x895, 0xb9f, 0xa96, 0xd9a, 0xc93, 0xf99, 0xe90,
		0x230, 0x339, 0x33 , 0x13a, 0x636, 0x73f, 0x435, 0x53c,
		0xa3c, 0xb35, 0x83f, 0x936, 0xe3a, 0xf33, 0xc39, 0xd30,
		0x3a0, 0x2a9, 0x1a3, 0xaa , 0x7a6, 0x6af, 0x5a5, 0x4ac,
		0xbac, 0xaa5, 0x9af, 0x8a6, 0xfaa, 0xea3, 0xda9, 0xca0,
		0x460, 0x569, 0x663, 0x76a, 0x66 , 0x16f, 0x265, 0x36c,
		0xc6c, 0xd65, 0xe6f, 0xf66, 0x86a, 0x963, 0xa69, 0xb60,
		0x5f0, 0x4f9, 0x7f3, 0x6fa, 0x1f6, 0xff , 0x3f5, 0x2fc,
		0xdfc, 0xcf5, 0xfff, 0xef6, 0x9fa, 0x8f3, 0xbf9, 0xaf0,
		0x650, 0x759, 0x453, 0x55a, 0x256, 0x35f, 0x55 , 0x15c,
		0xe5c, 0xf55, 0xc5f, 0xd56, 0xa5a, 0xb53, 0x859, 0x950,
		0x7c0, 0x6c9, 0x5c3, 0x4ca, 0x3c6, 0x2cf, 0x1c5, 0xcc ,
		0xfcc, 0xec5, 0xdcf, 0xcc6, 0xbca, 0xac3, 0x9c9, 0x8c0,
		0x8c0, 0x9c9, 0xac3, 0xbca, 0xcc6, 0xdcf, 0xec5, 0xfcc,
		0xcc , 0x1c5, 0x2cf, 0x3c6, 0x4ca, 0x5c3, 0x6c9, 0x7c0,
		0x950, 0x859, 0xb53, 0xa5a, 0xd56, 0xc5f, 0xf55, 0xe5c,
		0x15c, 0x55 , 0x35f, 0x256, 0x55a, 0x453, 0x759, 0x650,
		0xaf0, 0xbf9, 0x8f3, 0x9fa, 0xef6, 0xfff, 0xcf5, 0xdfc,
		0x2fc, 0x3f5, 0xff , 0x1f6, 0x6fa, 0x7f3, 0x4f9, 0x5f0,
		0xb60, 0xa69, 0x963, 0x86a, 0xf66, 0xe6f, 0xd65, 0xc6c,
		0x36c, 0x265, 0x16f, 0x66 , 0x76a, 0x663, 0x569, 0x460,
		0xca0, 0xda9, 0xea3, 0xfaa, 0x8a6, 0x9af, 0xaa5, 0xbac,
		0x4ac, 0x5a5, 0x6af, 0x7a6, 0xaa , 0x1a3, 0x2a9, 0x3a0,
		0xd30, 0xc39, 0xf33, 0xe3a, 0x936, 0x83f, 0xb35, 0xa3c,
		0x53c, 0x435, 0x73f, 0x636, 0x13a, 0x33 , 0x339, 0x230,
		0xe90, 0xf99, 0xc93, 0xd9a, 0xa96, 0xb9f, 0x895, 0x99c,
		0x69c, 0x795, 0x49f, 0x596, 0x29a, 0x393, 0x99 , 0x190,
		0xf00, 0xe09, 0xd03, 0xc0a, 0xb06, 0xa0f, 0x905, 0x80c,
		0x70c, 0x605, 0x50f, 0x406, 0x30a, 0x203, 0x109, 0x0
	]),
	
	triTable: new Int16Array([
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 8, 3, 9, 8, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 2, 10, 0, 2, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 8, 3, 2, 10, 8, 10, 9, 8, -1, -1, -1, -1, -1, -1, -1,
		3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 11, 2, 8, 11, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 9, 0, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 11, 2, 1, 9, 11, 9, 8, 11, -1, -1, -1, -1, -1, -1, -1,
		3, 10, 1, 11, 10, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 10, 1, 0, 8, 10, 8, 11, 10, -1, -1, -1, -1, -1, -1, -1,
		3, 9, 0, 3, 11, 9, 11, 10, 9, -1, -1, -1, -1, -1, -1, -1,
		9, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 3, 0, 7, 3, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 1, 9, 4, 7, 1, 7, 3, 1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 4, 7, 3, 0, 4, 1, 2, 10, -1, -1, -1, -1, -1, -1, -1,
		9, 2, 10, 9, 0, 2, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
		2, 10, 9, 2, 9, 7, 2, 7, 3, 7, 9, 4, -1, -1, -1, -1,
		8, 4, 7, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 4, 7, 11, 2, 4, 2, 0, 4, -1, -1, -1, -1, -1, -1, -1,
		9, 0, 1, 8, 4, 7, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
		4, 7, 11, 9, 4, 11, 9, 11, 2, 9, 2, 1, -1, -1, -1, -1,
		3, 10, 1, 3, 11, 10, 7, 8, 4, -1, -1, -1, -1, -1, -1, -1,
		1, 11, 10, 1, 4, 11, 1, 0, 4, 7, 11, 4, -1, -1, -1, -1,
		4, 7, 8, 9, 0, 11, 9, 11, 10, 11, 0, 3, -1, -1, -1, -1,
		4, 7, 11, 4, 11, 9, 9, 11, 10, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 4, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 5, 4, 1, 5, 0, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 5, 4, 8, 3, 5, 3, 1, 5, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 8, 1, 2, 10, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
		5, 2, 10, 5, 4, 2, 4, 0, 2, -1, -1, -1, -1, -1, -1, -1,
		2, 10, 5, 3, 2, 5, 3, 5, 4, 3, 4, 8, -1, -1, -1, -1,
		9, 5, 4, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 11, 2, 0, 8, 11, 4, 9, 5, -1, -1, -1, -1, -1, -1, -1,
		0, 5, 4, 0, 1, 5, 2, 3, 11, -1, -1, -1, -1, -1, -1, -1,
		2, 1, 5, 2, 5, 8, 2, 8, 11, 4, 8, 5, -1, -1, -1, -1,
		10, 3, 11, 10, 1, 3, 9, 5, 4, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 5, 0, 8, 1, 8, 10, 1, 8, 11, 10, -1, -1, -1, -1,
		5, 4, 0, 5, 0, 11, 5, 11, 10, 11, 0, 3, -1, -1, -1, -1,
		5, 4, 8, 5, 8, 10, 10, 8, 11, -1, -1, -1, -1, -1, -1, -1,
		9, 7, 8, 5, 7, 9, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 3, 0, 9, 5, 3, 5, 7, 3, -1, -1, -1, -1, -1, -1, -1,
		0, 7, 8, 0, 1, 7, 1, 5, 7, -1, -1, -1, -1, -1, -1, -1,
		1, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 7, 8, 9, 5, 7, 10, 1, 2, -1, -1, -1, -1, -1, -1, -1,
		10, 1, 2, 9, 5, 0, 5, 3, 0, 5, 7, 3, -1, -1, -1, -1,
		8, 0, 2, 8, 2, 5, 8, 5, 7, 10, 5, 2, -1, -1, -1, -1,
		2, 10, 5, 2, 5, 3, 3, 5, 7, -1, -1, -1, -1, -1, -1, -1,
		7, 9, 5, 7, 8, 9, 3, 11, 2, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 7, 9, 7, 2, 9, 2, 0, 2, 7, 11, -1, -1, -1, -1,
		2, 3, 11, 0, 1, 8, 1, 7, 8, 1, 5, 7, -1, -1, -1, -1,
		11, 2, 1, 11, 1, 7, 7, 1, 5, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 8, 8, 5, 7, 10, 1, 3, 10, 3, 11, -1, -1, -1, -1,
		5, 7, 0, 5, 0, 9, 7, 11, 0, 1, 0, 10, 11, 10, 0, -1,
		11, 10, 0, 11, 0, 3, 10, 5, 0, 8, 0, 7, 5, 7, 0, -1,
		11, 10, 5, 7, 11, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 0, 1, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 8, 3, 1, 9, 8, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
		1, 6, 5, 2, 6, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 6, 5, 1, 2, 6, 3, 0, 8, -1, -1, -1, -1, -1, -1, -1,
		9, 6, 5, 9, 0, 6, 0, 2, 6, -1, -1, -1, -1, -1, -1, -1,
		5, 9, 8, 5, 8, 2, 5, 2, 6, 3, 2, 8, -1, -1, -1, -1,
		2, 3, 11, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 0, 8, 11, 2, 0, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1, -1, -1, -1,
		5, 10, 6, 1, 9, 2, 9, 11, 2, 9, 8, 11, -1, -1, -1, -1,
		6, 3, 11, 6, 5, 3, 5, 1, 3, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 11, 0, 11, 5, 0, 5, 1, 5, 11, 6, -1, -1, -1, -1,
		3, 11, 6, 0, 3, 6, 0, 6, 5, 0, 5, 9, -1, -1, -1, -1,
		6, 5, 9, 6, 9, 11, 11, 9, 8, -1, -1, -1, -1, -1, -1, -1,
		5, 10, 6, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 3, 0, 4, 7, 3, 6, 5, 10, -1, -1, -1, -1, -1, -1, -1,
		1, 9, 0, 5, 10, 6, 8, 4, 7, -1, -1, -1, -1, -1, -1, -1,
		10, 6, 5, 1, 9, 7, 1, 7, 3, 7, 9, 4, -1, -1, -1, -1,
		6, 1, 2, 6, 5, 1, 4, 7, 8, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 5, 5, 2, 6, 3, 0, 4, 3, 4, 7, -1, -1, -1, -1,
		8, 4, 7, 9, 0, 5, 0, 6, 5, 0, 2, 6, -1, -1, -1, -1,
		7, 3, 9, 7, 9, 4, 3, 2, 9, 5, 9, 6, 2, 6, 9, -1,
		3, 11, 2, 7, 8, 4, 10, 6, 5, -1, -1, -1, -1, -1, -1, -1,
		5, 10, 6, 4, 7, 2, 4, 2, 0, 2, 7, 11, -1, -1, -1, -1,
		0, 1, 9, 4, 7, 8, 2, 3, 11, 5, 10, 6, -1, -1, -1, -1,
		9, 2, 1, 9, 11, 2, 9, 4, 11, 7, 11, 4, 5, 10, 6, -1,
		8, 4, 7, 3, 11, 5, 3, 5, 1, 5, 11, 6, -1, -1, -1, -1,
		5, 1, 11, 5, 11, 6, 1, 0, 11, 7, 11, 4, 0, 4, 11, -1,
		0, 5, 9, 0, 6, 5, 0, 3, 6, 11, 6, 3, 8, 4, 7, -1,
		6, 5, 9, 6, 9, 11, 4, 7, 9, 7, 11, 9, -1, -1, -1, -1,
		10, 4, 9, 6, 4, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 10, 6, 4, 9, 10, 0, 8, 3, -1, -1, -1, -1, -1, -1, -1,
		10, 0, 1, 10, 6, 0, 6, 4, 0, -1, -1, -1, -1, -1, -1, -1,
		8, 3, 1, 8, 1, 6, 8, 6, 4, 6, 1, 10, -1, -1, -1, -1,
		1, 4, 9, 1, 2, 4, 2, 6, 4, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 8, 1, 2, 9, 2, 4, 9, 2, 6, 4, -1, -1, -1, -1,
		0, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 3, 2, 8, 2, 4, 4, 2, 6, -1, -1, -1, -1, -1, -1, -1,
		10, 4, 9, 10, 6, 4, 11, 2, 3, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 2, 2, 8, 11, 4, 9, 10, 4, 10, 6, -1, -1, -1, -1,
		3, 11, 2, 0, 1, 6, 0, 6, 4, 6, 1, 10, -1, -1, -1, -1,
		6, 4, 1, 6, 1, 10, 4, 8, 1, 2, 1, 11, 8, 11, 1, -1,
		9, 6, 4, 9, 3, 6, 9, 1, 3, 11, 6, 3, -1, -1, -1, -1,
		8, 11, 1, 8, 1, 0, 11, 6, 1, 9, 1, 4, 6, 4, 1, -1,
		3, 11, 6, 3, 6, 0, 0, 6, 4, -1, -1, -1, -1, -1, -1, -1,
		6, 4, 8, 11, 6, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 10, 6, 7, 8, 10, 8, 9, 10, -1, -1, -1, -1, -1, -1, -1,
		0, 7, 3, 0, 10, 7, 0, 9, 10, 6, 7, 10, -1, -1, -1, -1,
		10, 6, 7, 1, 10, 7, 1, 7, 8, 1, 8, 0, -1, -1, -1, -1,
		10, 6, 7, 10, 7, 1, 1, 7, 3, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 6, 1, 6, 8, 1, 8, 9, 8, 6, 7, -1, -1, -1, -1,
		2, 6, 9, 2, 9, 1, 6, 7, 9, 0, 9, 3, 7, 3, 9, -1,
		7, 8, 0, 7, 0, 6, 6, 0, 2, -1, -1, -1, -1, -1, -1, -1,
		7, 3, 2, 6, 7, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 3, 11, 10, 6, 8, 10, 8, 9, 8, 6, 7, -1, -1, -1, -1,
		2, 0, 7, 2, 7, 11, 0, 9, 7, 6, 7, 10, 9, 10, 7, -1,
		1, 8, 0, 1, 7, 8, 1, 10, 7, 6, 7, 10, 2, 3, 11, -1,
		11, 2, 1, 11, 1, 7, 10, 6, 1, 6, 7, 1, -1, -1, -1, -1,
		8, 9, 6, 8, 6, 7, 9, 1, 6, 11, 6, 3, 1, 3, 6, -1,
		0, 9, 1, 11, 6, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 8, 0, 7, 0, 6, 3, 11, 0, 11, 6, 0, -1, -1, -1, -1,
		7, 11, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 8, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 9, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 1, 9, 8, 3, 1, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
		10, 1, 2, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 3, 0, 8, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
		2, 9, 0, 2, 10, 9, 6, 11, 7, -1, -1, -1, -1, -1, -1, -1,
		6, 11, 7, 2, 10, 3, 10, 8, 3, 10, 9, 8, -1, -1, -1, -1,
		7, 2, 3, 6, 2, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		7, 0, 8, 7, 6, 0, 6, 2, 0, -1, -1, -1, -1, -1, -1, -1,
		2, 7, 6, 2, 3, 7, 0, 1, 9, -1, -1, -1, -1, -1, -1, -1,
		1, 6, 2, 1, 8, 6, 1, 9, 8, 8, 7, 6, -1, -1, -1, -1,
		10, 7, 6, 10, 1, 7, 1, 3, 7, -1, -1, -1, -1, -1, -1, -1,
		10, 7, 6, 1, 7, 10, 1, 8, 7, 1, 0, 8, -1, -1, -1, -1,
		0, 3, 7, 0, 7, 10, 0, 10, 9, 6, 10, 7, -1, -1, -1, -1,
		7, 6, 10, 7, 10, 8, 8, 10, 9, -1, -1, -1, -1, -1, -1, -1,
		6, 8, 4, 11, 8, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 6, 11, 3, 0, 6, 0, 4, 6, -1, -1, -1, -1, -1, -1, -1,
		8, 6, 11, 8, 4, 6, 9, 0, 1, -1, -1, -1, -1, -1, -1, -1,
		9, 4, 6, 9, 6, 3, 9, 3, 1, 11, 3, 6, -1, -1, -1, -1,
		6, 8, 4, 6, 11, 8, 2, 10, 1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 3, 0, 11, 0, 6, 11, 0, 4, 6, -1, -1, -1, -1,
		4, 11, 8, 4, 6, 11, 0, 2, 9, 2, 10, 9, -1, -1, -1, -1,
		10, 9, 3, 10, 3, 2, 9, 4, 3, 11, 3, 6, 4, 6, 3, -1,
		8, 2, 3, 8, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1,
		0, 4, 2, 4, 6, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 9, 0, 2, 3, 4, 2, 4, 6, 4, 3, 8, -1, -1, -1, -1,
		1, 9, 4, 1, 4, 2, 2, 4, 6, -1, -1, -1, -1, -1, -1, -1,
		8, 1, 3, 8, 6, 1, 8, 4, 6, 6, 10, 1, -1, -1, -1, -1,
		10, 1, 0, 10, 0, 6, 6, 0, 4, -1, -1, -1, -1, -1, -1, -1,
		4, 6, 3, 4, 3, 8, 6, 10, 3, 0, 3, 9, 10, 9, 3, -1,
		10, 9, 4, 6, 10, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 5, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 4, 9, 5, 11, 7, 6, -1, -1, -1, -1, -1, -1, -1,
		5, 0, 1, 5, 4, 0, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
		11, 7, 6, 8, 3, 4, 3, 5, 4, 3, 1, 5, -1, -1, -1, -1,
		9, 5, 4, 10, 1, 2, 7, 6, 11, -1, -1, -1, -1, -1, -1, -1,
		6, 11, 7, 1, 2, 10, 0, 8, 3, 4, 9, 5, -1, -1, -1, -1,
		7, 6, 11, 5, 4, 10, 4, 2, 10, 4, 0, 2, -1, -1, -1, -1,
		3, 4, 8, 3, 5, 4, 3, 2, 5, 10, 5, 2, 11, 7, 6, -1,
		7, 2, 3, 7, 6, 2, 5, 4, 9, -1, -1, -1, -1, -1, -1, -1,
		9, 5, 4, 0, 8, 6, 0, 6, 2, 6, 8, 7, -1, -1, -1, -1,
		3, 6, 2, 3, 7, 6, 1, 5, 0, 5, 4, 0, -1, -1, -1, -1,
		6, 2, 8, 6, 8, 7, 2, 1, 8, 4, 8, 5, 1, 5, 8, -1,
		9, 5, 4, 10, 1, 6, 1, 7, 6, 1, 3, 7, -1, -1, -1, -1,
		1, 6, 10, 1, 7, 6, 1, 0, 7, 8, 7, 0, 9, 5, 4, -1,
		4, 0, 10, 4, 10, 5, 0, 3, 10, 6, 10, 7, 3, 7, 10, -1,
		7, 6, 10, 7, 10, 8, 5, 4, 10, 4, 8, 10, -1, -1, -1, -1,
		6, 9, 5, 6, 11, 9, 11, 8, 9, -1, -1, -1, -1, -1, -1, -1,
		3, 6, 11, 0, 6, 3, 0, 5, 6, 0, 9, 5, -1, -1, -1, -1,
		0, 11, 8, 0, 5, 11, 0, 1, 5, 5, 6, 11, -1, -1, -1, -1,
		6, 11, 3, 6, 3, 5, 5, 3, 1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 10, 9, 5, 11, 9, 11, 8, 11, 5, 6, -1, -1, -1, -1,
		0, 11, 3, 0, 6, 11, 0, 9, 6, 5, 6, 9, 1, 2, 10, -1,
		11, 8, 5, 11, 5, 6, 8, 0, 5, 10, 5, 2, 0, 2, 5, -1,
		6, 11, 3, 6, 3, 5, 2, 10, 3, 10, 5, 3, -1, -1, -1, -1,
		5, 8, 9, 5, 2, 8, 5, 6, 2, 3, 8, 2, -1, -1, -1, -1,
		9, 5, 6, 9, 6, 0, 0, 6, 2, -1, -1, -1, -1, -1, -1, -1,
		1, 5, 8, 1, 8, 0, 5, 6, 8, 3, 8, 2, 6, 2, 8, -1,
		1, 5, 6, 2, 1, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 3, 6, 1, 6, 10, 3, 8, 6, 5, 6, 9, 8, 9, 6, -1,
		10, 1, 0, 10, 0, 6, 9, 5, 0, 5, 6, 0, -1, -1, -1, -1,
		0, 3, 8, 5, 6, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		10, 5, 6, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 5, 10, 7, 5, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		11, 5, 10, 11, 7, 5, 8, 3, 0, -1, -1, -1, -1, -1, -1, -1,
		5, 11, 7, 5, 10, 11, 1, 9, 0, -1, -1, -1, -1, -1, -1, -1,
		10, 7, 5, 10, 11, 7, 9, 8, 1, 8, 3, 1, -1, -1, -1, -1,
		11, 1, 2, 11, 7, 1, 7, 5, 1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 1, 2, 7, 1, 7, 5, 7, 2, 11, -1, -1, -1, -1,
		9, 7, 5, 9, 2, 7, 9, 0, 2, 2, 11, 7, -1, -1, -1, -1,
		7, 5, 2, 7, 2, 11, 5, 9, 2, 3, 2, 8, 9, 8, 2, -1,
		2, 5, 10, 2, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1,
		8, 2, 0, 8, 5, 2, 8, 7, 5, 10, 2, 5, -1, -1, -1, -1,
		9, 0, 1, 5, 10, 3, 5, 3, 7, 3, 10, 2, -1, -1, -1, -1,
		9, 8, 2, 9, 2, 1, 8, 7, 2, 10, 2, 5, 7, 5, 2, -1,
		1, 3, 5, 3, 7, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 7, 0, 7, 1, 1, 7, 5, -1, -1, -1, -1, -1, -1, -1,
		9, 0, 3, 9, 3, 5, 5, 3, 7, -1, -1, -1, -1, -1, -1, -1,
		9, 8, 7, 5, 9, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		5, 8, 4, 5, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1,
		5, 0, 4, 5, 11, 0, 5, 10, 11, 11, 3, 0, -1, -1, -1, -1,
		0, 1, 9, 8, 4, 10, 8, 10, 11, 10, 4, 5, -1, -1, -1, -1,
		10, 11, 4, 10, 4, 5, 11, 3, 4, 9, 4, 1, 3, 1, 4, -1,
		2, 5, 1, 2, 8, 5, 2, 11, 8, 4, 5, 8, -1, -1, -1, -1,
		0, 4, 11, 0, 11, 3, 4, 5, 11, 2, 11, 1, 5, 1, 11, -1,
		0, 2, 5, 0, 5, 9, 2, 11, 5, 4, 5, 8, 11, 8, 5, -1,
		9, 4, 5, 2, 11, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 5, 10, 3, 5, 2, 3, 4, 5, 3, 8, 4, -1, -1, -1, -1,
		5, 10, 2, 5, 2, 4, 4, 2, 0, -1, -1, -1, -1, -1, -1, -1,
		3, 10, 2, 3, 5, 10, 3, 8, 5, 4, 5, 8, 0, 1, 9, -1,
		5, 10, 2, 5, 2, 4, 1, 9, 2, 9, 4, 2, -1, -1, -1, -1,
		8, 4, 5, 8, 5, 3, 3, 5, 1, -1, -1, -1, -1, -1, -1, -1,
		0, 4, 5, 1, 0, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		8, 4, 5, 8, 5, 3, 9, 0, 5, 0, 3, 5, -1, -1, -1, -1,
		9, 4, 5, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 11, 7, 4, 9, 11, 9, 10, 11, -1, -1, -1, -1, -1, -1, -1,
		0, 8, 3, 4, 9, 7, 9, 11, 7, 9, 10, 11, -1, -1, -1, -1,
		1, 10, 11, 1, 11, 4, 1, 4, 0, 7, 4, 11, -1, -1, -1, -1,
		3, 1, 4, 3, 4, 8, 1, 10, 4, 7, 4, 11, 10, 11, 4, -1,
		4, 11, 7, 9, 11, 4, 9, 2, 11, 9, 1, 2, -1, -1, -1, -1,
		9, 7, 4, 9, 11, 7, 9, 1, 11, 2, 11, 1, 0, 8, 3, -1,
		11, 7, 4, 11, 4, 2, 2, 4, 0, -1, -1, -1, -1, -1, -1, -1,
		11, 7, 4, 11, 4, 2, 8, 3, 4, 3, 2, 4, -1, -1, -1, -1,
		2, 9, 10, 2, 7, 9, 2, 3, 7, 7, 4, 9, -1, -1, -1, -1,
		9, 10, 7, 9, 7, 4, 10, 2, 7, 8, 7, 0, 2, 0, 7, -1,
		3, 7, 10, 3, 10, 2, 7, 4, 10, 1, 10, 0, 4, 0, 10, -1,
		1, 10, 2, 8, 7, 4, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 1, 4, 1, 7, 7, 1, 3, -1, -1, -1, -1, -1, -1, -1,
		4, 9, 1, 4, 1, 7, 0, 8, 1, 8, 7, 1, -1, -1, -1, -1,
		4, 0, 3, 7, 4, 3, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		4, 8, 7, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		9, 10, 8, 10, 11, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 9, 3, 9, 11, 11, 9, 10, -1, -1, -1, -1, -1, -1, -1,
		0, 1, 10, 0, 10, 8, 8, 10, 11, -1, -1, -1, -1, -1, -1, -1,
		3, 1, 10, 11, 3, 10, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 2, 11, 1, 11, 9, 9, 11, 8, -1, -1, -1, -1, -1, -1, -1,
		3, 0, 9, 3, 9, 11, 1, 2, 9, 2, 11, 9, -1, -1, -1, -1,
		0, 2, 11, 8, 0, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		3, 2, 11, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 3, 8, 2, 8, 10, 10, 8, 9, -1, -1, -1, -1, -1, -1, -1,
		9, 10, 2, 0, 9, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		2, 3, 8, 2, 8, 10, 0, 1, 8, 1, 10, 8, -1, -1, -1, -1,
		1, 10, 2, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		1, 3, 8, 9, 1, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 9, 1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		0, 3, 8, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1,
		-1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1, -1	
	]),

	/**
		interpolate between two vertexes
		
		@method verp
		@param p vector to store results
		@param xa, ya, za vertex A
		@param xb, yb, zb vertex B
		@param fa, fb scalar field values at A & B
	**/
		
	verp: function(p, xa, ya, za, xb, yb, zb, fa, fb) {
		var th = this.threshold;
		// handle edge cases
		if (Math.abs(th - fa) < 0.00001) {
			p.x = xa;
			p.y = ya;
			p.z = za;
		} else if (Math.abs(th - fb) < 0.00001) {
			p.x = xb;
			p.y = yb;
			p.z = zb;
		} else if (Math.abs(fa - fb) < 0.00001) {
			p.x = xa;
			p.y = ya;
			p.z = za;
		} else {
			// perform interpolation
			var mu = (th - fa) / (fb - fa);
			p.x = xa + mu * (xb - xa);
			p.y = ya + mu * (yb - ya);
			p.z = za + mu * (zb - za);
		}
	},
		
	/**
		generate polygons for volume around a specified point
		
		@method generate
		@param p center of sampling volume
	**/

	generate: function(p) {
	
		var et = this.edgeTable;
		var tt = this.triTable;
		var vl = this.vertex;
		var nn = this.normal;
		
		var source = this.source;
		var handle = this.handle;
		
		var size = this.size;
		var step = this.step;
		var thresh = this.threshold;
		
		var xs = step * Math.floor(p.x / step) - size;
		var ys = step * Math.floor(p.y / step) - size;
		var zs = step * Math.floor(p.z / step) - size;
		
		var xe = step * Math.floor(p.x / step) + size;
		var ye = step * Math.floor(p.y / step) + size;
		var ze = step * Math.floor(p.z / step) + size;
		
		var x0, y0, z0, x1, y1, z1;
		var i, j, tric, cind;
		
		for (x0 = xs; x0 <= xe; x0 = x1) {
			x1 = x0 + step;
			for (y0 = ys; y0 <= ye; y0 = y1) {
				y1 = y0 + step;
				for (z0 = zs; z0 <= ze; z0 = z1) {
					z1 = z0 + step;
			
					// find surface points
					var f0 = source(x0, y0, z0);
					var f1 = source(x1, y0, z0);
					var f2 = source(x1, y0, z1);
					var f3 = source(x0, y0, z1);
					var f4 = source(x0, y1, z0);
					var f5 = source(x1, y1, z0);
					var f6 = source(x1, y1, z1);
					var f7 = source(x0, y1, z1);
			
					// calculate index into edgetable
					cind =  (f0 < thresh) ? 1 : 0;
					cind |= (f1 < thresh) ? 2 : 0;
					cind |= (f2 < thresh) ? 4 : 0;
					cind |= (f3 < thresh) ? 8 : 0;
					cind |= (f4 < thresh) ? 16 : 0;
					cind |= (f5 < thresh) ? 32 : 0;
					cind |= (f6 < thresh) ? 64 : 0;
					cind |= (f7 < thresh) ? 128 : 0;

					// surface does not penetrate cube, no triangles for you
					if (et[cind] === 0)
						continue;
				
					// find where the surface intersects the cube
					if (et[cind] & 1) {
						this.verp(vl[0], x0, y0, z0, x1, y0, z0, f0, f1);
					}
					if (et[cind] & 2) {
						this.verp(vl[1], x1, y0, z0, x1, y0, z1, f1, f2);
					}
					if (et[cind] & 4) {
						this.verp(vl[2], x1, y0, z1, x0, y0, z1, f2, f3);
					}
					if (et[cind] & 8) {
						this.verp(vl[3], x0, y0, z1, x0, y0, z0, f3, f0);
					}
					if (et[cind] & 16) {
						this.verp(vl[4], x0, y1, z0, x1, y1, z0, f4, f5);
					}
					if (et[cind] & 32) {
						this.verp(vl[5], x1, y1, z0, x1, y1, z1, f5, f6);
					}
					if (et[cind] & 64) {
						this.verp(vl[6], x1, y1, z1, x0, y1, z1, f6, f7);
					}
					if (et[cind] & 128) {
						this.verp(vl[7], x0, y1, z1, x0, y1, z0, f7, f4);
					}
					if (et[cind] & 256) {
						this.verp(vl[8], x0, y0, z0, x0, y1, z0, f0, f4);
					}
					if (et[cind] & 512) {
						this.verp(vl[9], x1, y0, z0, x1, y1, z0, f1, f5);
					}
					if (et[cind] & 1024) {
						this.verp(vl[10], x1, y0, z1, x1, y1, z1, f2, f6);
					}
					if (et[cind] & 2048) {
						this.verp(vl[11], x0, y0, z1, x0, y1, z1, f3, f7);
					}
			
					nn.x = (f1 + f2 + f5 + f6) - (f0 + f3 + f4 + f7);
					nn.y = (f4 + f5 + f6 + f7) - (f0 + f1 + f2 + f3);
					nn.z = (f2 + f3 + f6 + f7) - (f0 + f1 + f4 + f5);
					nn.norm();

					// generate triangle vertexes
					for (i = 0, j = cind * 16; tt[j + i] != -1; i += 3) {
						handle( vl[ tt[j + i] ], vl[ tt[j + i + 1] ], vl[ tt[j + i + 2] ], nn );
					}
				}
			}
		}
	}
		
};

/**
	creates a surfacer object
	
	fsource must accept three floats and return a float, and be defined for all reals.
	fhandle must accept a three vertexes and a normal vector.
	
	@method createSurfacer
	@param size length of total surface volume
	@param step length of each sampling cube
	@param threshold isosurface value
	@param source callback function for scalar field
	@param handle callback function for generated polygons
	@return surfacer object
**/
RISE.createSurfacer = function(size, step, threshold, source, handle) {

	var o = Object.create(RISE.prototypes.surfacer);
	
	o.size = size;
	o.step = step;
	o.threshold = threshold;
	o.source = source;
	o.handle = handle;

	o.vertex = [
		RISE.createVector(), RISE.createVector(), RISE.createVector(), 
		RISE.createVector(), RISE.createVector(), RISE.createVector(), 
		RISE.createVector(), RISE.createVector(), RISE.createVector(), 
		RISE.createVector(), RISE.createVector(), RISE.createVector()
	];
	
	o.normal = RISE.createVector();
	
	return o;
};


/**
	wrapper around GL texture
	
	@namespace RISE
	@class texture
**/

RISE.prototypes.texture = {

	/**
		bind the texture to a specified texture unit

		used in conjunction with shader.activate()
		the sampler parameter is available from the activated shader
		
		@method bind
		@param index the index of the GL texture unit, range {0..MAX_TEXTURE_IMAGE_UNITS}
		@param sampler object reference to the sampler variable
	**/

	bind: function(index, sampler) {
		var gl = this.gl;
		gl.uniform1i(sampler, index);
		gl.activeTexture(gl.TEXTURE0 + index);
		gl.bindTexture(gl.TEXTURE_2D, this.id);  
	},
	
	/**
		release GL resources held by this object
		
		@method release
	**/
	
	release: function() {
		this.gl.deleteTexture(this.id);
	}
	
};

/**
	create texture object from a image/bitmap

	@method createTexture
	@param GL context object
	@param bmp image, imageData, or custom bitmap
	@return new texture object
**/

RISE.createTexture = function(gl, bmp) {
	var o = Object.create(RISE.prototypes.texture);
	o.gl = gl;
	
	o.id = gl.createTexture();
	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
	gl.bindTexture(gl.TEXTURE_2D, o.id);
	
	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, bmp.width, bmp.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, bmp.data);

	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
	gl.generateMipmap(gl.TEXTURE_2D);
	gl.bindTexture(gl.TEXTURE_2D, null);

	return o;
};


/**
	wrapper around frame animation API
	
	callback function should be of the form:
		function(t) { ... }
	t will be time in ms since last callback
	
	if period is 0 or unspecified, the timer
	will use the frame animation API to run
	as fast as possible
	
	@namespace RISE
	@method createTimer
	@param optional period interval in ms
	@param handler callback function
	@return timer control object
**/

RISE.createTimer = function(handler, period) {

	var requestAnimationFrame =	
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame;

	var elapsedTime = 0;
	var lastFrameTime = RISE.misc.getPreciseTime();
	var interval = 0;
	var running = false;

	function run() {

		if (running) {
		
			var t = RISE.misc.getPreciseTime();
			var dt = t - lastFrameTime;
			lastFrameTime = t;
			
			// reuse the last interval if this one's too long
			// this protects the app against weird effects if
			// the app was paused/tabbed over for a long time
			if (dt < 500) {
				interval = dt;
			}
			
			handler(interval);

			// set up the next callback
			if (!period && requestAnimationFrame) {
				requestAnimationFrame(run);
			} else {
				setTimeout(run, period);
			}
		}

	}

	// return a control object	
	return {
		start: function() {
			running = true;
			run();
		},
		stop: function() {
			running = false;
		},
		isRunning: function() {
			return running;
		}
	};

};

/**
	vector in 3-space plus standard operations
	
	@namespace RISE
	@class vector
**/

RISE.prototypes.vector = {

	/**
		set the elements of the vector
		
		@method set
		@param x any real number
		@param y any real number
		@param z any real number
		@return the object itself
	**/
	
	set: function(x, y, z) {
		this.x = x || 0;
		this.y = y || 0;
		this.z = z || 0;
		return this;
	},
	
	/**
		copy elements from another vector

		@method copy
		@param a object to copy from
		@return the object itself
	**/
	
	copy: function(a) { 
		this.x = a.x;
		this.y = a.y;
		this.z = a.z;
		return this;
	},
	
	/**
		add another vector to this one
		
		@method add
		@param a vector to add
		@return the vector, added
	**/
	
	add: function(a) {
		this.x += a.x;
		this.y += a.y;
		this.z += a.z;
		return this;
	},
	
	/**
		subtract another vector from this one
		
		@method sub
		@param a vector to subtract
		@return the vector, subtracted
	**/
	
	sub: function(a) {
		this.x -= a.x;
		this.y -= a.y;
		this.z -= a.z;
		return this;
	},
	
	/**
		multiply this vector by a constant
		
		@method mul
		@param c scalar to multiply
		@return the vector, multiplied
	**/
	
	mul: function(c) {
		this.x *= c;
		this.y *= c;
		this.z *= c;
		return this;
	},
	
	/**
		divide this vector by a constant
		
		return zero-length vector if constant is zero
		
		@method div
		@param c constant to divide by
		@return the vector, divided
	**/
	
	div: function(c) {
		if (c)
		{
			this.x /= c;
			this.y /= c;
			this.z /= c;
		}
		else
			this.set(0, 0, 0);
		return this;
	},
	
	/**
		negate this vector
		
		@method neg
		@return the vector, negated
	**/
	
	neg: function() {
		return this.set(-this.x, -this.y, -this.z); 
	},
	
	/**
		return the length of the vector
		
		@method length
		@return the length of the vector
	**/
	
	length: function() {
		return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
	},

	/**
		get distance between this vector and another
		
		@method distance
		@param a vector 
		@return distance between this vector and a
	**/
	
	distance: function(a) {
		var dx = this.x - a.x;
		var dy = this.y - a.y;
		var dz = this.z - a.z;
		return Math.sqrt(dx * dx + dy * dy + dz * dz);
	},

	/**
		get square of distance between this vector and another
		
		@method distsqrd
		@param a vector 
		@return distance^2 between this vector and a
	**/
	
	distsqrd: function(a) {
		var dx = this.x - a.x;
		var dy = this.y - a.y;
		var dz = this.z - a.z;
		return dx * dx + dy * dy + dz * dz;
	},

	/**
		normalize this vector
		
		@method norm
		@return this vector, normalized
	**/
	
	norm: function() {
		var l = this.length();
		return this.div(l);
	},

	/**
		obtain dot product between this vector and another
		
		@method dot
		@param a vector
		@return dot product between this vector and a
	**/
	
	dot: function(a) {
		return this.x * a.x + this.y * a.y + this.z * a.z;
	},

	/**
		obtain cross product between this vector and another
		
		@method cross
		@param a vector
		@return this vector crossed with a
	**/
	
	cross: function(a) {
		var tx = this.x;
		var ty = this.y;
		var tz = this.z;
		this.x = ty * a.z - tz * a.y;
		this.y = tz * a.x - tx * a.z;
		this.z = tx * a.y - ty * a.x;
		return this;
	},

	/**
		copy vector data into array
		
		@method toArray
		@param a array to copy to, defaults to new empty array
		@return array containing elements [x, y, z]
	**/
	
	toArray: function(a) {
		a = a || [];
		a[0] = this.x;
		a[1] = this.y;
		a[2] = this.z;
		return a;
	},
	
	/**
		round the vector by a specified factor
		
		@method nearest
		@param v number to round by
		@param f rounding function, defaults to Math.round
		@return the object, rounded off
	**/
	
	nearest: function(v, f) {
		f = f || Math.round;
		this.x = f(this.x / v) * v;
		this.y = f(this.y / v) * v;
		this.z = f(this.z / v) * v;
		return this;
	},
	
	/**
		transform by a matrix multiplication
		
		@method transform
		@param m array, the matrix to multiply by
		@return the object, transformed
	**/
	
	transform: function(m) {
		var x = m[0] * this.x + m[4] * this.y + m[8] * this.z + m[12];
		var y = m[1] * this.x + m[5] * this.y + m[9] * this.z + m[13];
		var z = m[2] * this.x + m[6] * this.y + m[10] * this.z + m[14];
		var d = m[3] * this.x + m[7] * this.y + m[11] * this.z + m[15];
		return this.set(x / d, y / d, z / d);
	},
	
	/**
		generate a guaranteed perpendicular vector (for length > 0)
		
		@method perp
		@return the object, perpendicularized
	**/
	
	perp: function() {
		var swp;
		if (this.x !== this.y) {
			swp = this.x;
			this.x = this.y;
			this.y = swp;
		} else if (this.x !== this.z) {
			swp = this.x;
			this.x = this.z;
			this.z = swp;
		} else {
			swp = this.y;
			this.y = this.z;
			this.z = swp;
		}
		if (this.x !== 0) {
			this.x = -this.x;
		} else if (this.y !== 0) {
			this.y = -this.y;
		} else {
			this.z = -this.z;
		}
		return this;
	}
};

/**
	create a new vector object
	
	@method create
	@param x the x-coordinate of the new vector
	@param y the y-coordinate of the new vector
	@param z the z-coordinate of the new vector
	@return a new vector object
**/

RISE.createVector = function(x, y, z) {
	var o = Object.create(RISE.prototypes.vector);
	o.set(x, y, z);
	return o;
};
