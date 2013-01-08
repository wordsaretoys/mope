/**
	generate and decorate the anchors of space

	@namespace M
	@class anchor
**/

M.anchor = {

	UPDATE_INTERVAL: 1,
	lastUpdate: RISE.createVector(Infinity, Infinity, Infinity),

	/**
		create and init required objects
		
		@method init
	**/

	init: function() {
		var toRGBA = RISE.misc.toRGBA;

		this.texture = (function() {
			var bmp = RISE.createBitmap(256);
			bmp.walk(8, 0.05, toRGBA(0.8, 0.7, 0.4, 1), 0.95, 0.5, 0.5, 0.5);
			bmp.sweep(3, 0.05, toRGBA(0.3, 0.9, 0.2, 1), 0.5);
			bmp.walk(6, 0.1, toRGBA(0.9, 0.9, 0.2, 1), 0.5, 0.5, 0.5, 0.5);
			return RISE.createTexture(GL, bmp);
		})();

		var shader = this.shader = RISE.createShader(
			GL,
			RISE.misc.textOf("vs-anchor"), 
			RISE.misc.textOf("fs-anchor"),
			["position", "normal", "image"], 
			["projector", "modelview"],
			["texNoise"]
		);
		
		this.mesh = RISE.createMesh(
			GL,
			[ shader.position, shader.normal ],
			[ 3, 3 ]
		);

		M.worker.addEventListener("message", M.anchor.handleWorker, false);
	},
	
	/**
		update the anchor state when necessary
		called for every frame
		
		@method update
		@param pp player position
	**/
	
	update: function(pp) {
		if (M.anchor.lastUpdate.distance(pp) > M.anchor.UPDATE_INTERVAL) {
			M.worker.postMessage( {
				cmd: "update-anchor",
				pos: pp
			} );
			M.anchor.lastUpdate.copy(pp);
		}
	},
	
	/**
		handle message event from worker thread
		build the mesh with vertex data
		
		@method handleWorker
		@param e message object from worker
	**/
	
	handleWorker: function(e) {
		if (e.data.cmd === "update-anchor") {
			M.anchor.mesh.build(e.data.vbuffer);
		}
	},	
	
	/**
		draw the rocks
		
		@method draw
	**/
	 
	draw: function() {
		var camera = M.viewer.camera;
		var shader;

		GL.disable(GL.BLEND);
		GL.enable(GL.CULL_FACE);
		GL.cullFace(GL.BACK);
		
		shader = this.shader;
		shader.activate();
		GL.uniformMatrix4fv(shader.projector, false, camera.projector);
		GL.uniformMatrix4fv(shader.modelview, false, camera.modelview);

		this.texture.bind(0, shader.texNoise);
		this.mesh.draw();

	}
};
