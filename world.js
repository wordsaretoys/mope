/**
	world-generating functions are maintained here
	to make them easily available to worker thread
	
	@namespace M
	@class world
**/

M.world = {

	ANCHOR_STEP: 0.25,
	ANCHOR_THRESHOLD: 0,
	ANCHOR_RADIUS: 5,

	getAnchorField: function(x, y, z) {
		var a = 2 * Math.cos(1.2 * x);
		var b = 2 * Math.cos(0.7 * y);
		var c = 2 * Math.cos(1.3 * z);
		
		return (Math.sin(x + y + a) + Math.sin(y + z + b) + Math.sin(z + x + c)) / 3;
	},
	
	getAnchorNormal: function(vector, x, y, z) {
		var source = M.world.getAnchorField;
		var step = M.world.ANCHOR_STEP;
		vector.x = source(x + step, y, z) - source(x - step, y, z);
		vector.y = source(x, y + step, z) - source(x, y - step, z);
		vector.z = source(x, y, z + step) - source(x, y, z - step);
		vector.norm();
	}	
};

