/**
	mope worker thread
	
	generates surfaces
**/

importScripts("/debug/rise/rise.cat.js");

// placeholder namespace for mope
var M = {};
importScripts("/debug/mope/world.js");

/**
	initializes anchor objects
	
	@method initAnchor
**/

function initAnchor() {
	var vbuffer = RISE.createBuffer(Float32Array);
	
	var step = M.world.ANCHOR_STEP;
	var radius = M.world.ANCHOR_RADIUS;
	var threshold = M.world.ANCHOR_THRESHOLD;
	
	var source = function(x, y, z) {
		return M.world.getAnchorField(x, y, z);
	};

	var handle = function(v0, v1, v2, n) {
		var nx = n.x * n.x;
		var ny = n.y * n.y;
		var nz = n.z * n.z;		
		vbuffer.set(v0.x, v0.y, v0.z, nx, ny, nz);
		vbuffer.set(v1.x, v1.y, v1.z, nx, ny, nz);
		vbuffer.set(v2.x, v2.y, v2.z, nx, ny, nz);
	};

	var surf = RISE.createSurfacer(radius, step, threshold, source, handle);
	
	M.generate = function(p) {
		vbuffer.reset();
		surf.generate(p);
		
		// have to post fake vbuffer object back to main thread
		// as functions (among other types) can't be serialized
		postMessage( { 
			cmd: "update-anchor",
			vbuffer: {
				data: vbuffer.data,
				length: vbuffer.length
			}
		} );
	};
}

// message handling stub
this.addEventListener("message", function(e) {

	switch(e.data.cmd) {
	case "init":
		initAnchor();
		break;
	case "update-anchor":
		M.generate(e.data.pos);
		break;
	}

}, false);

