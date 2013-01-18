<script id="vs-anchor" type="x-shader/x-vertex">

const float RADIUS = 4.5;

attribute vec3 position;
attribute vec3 normal;

uniform mat4 projector;
uniform mat4 modelview;

varying vec3 con;
varying vec3 tex;

varying float bw;
varying float fog;

void main(void) {
	vec4 pos = modelview * vec4(position, 1.0);
	gl_Position = projector * pos;
	con = normal;
	tex = abs(mod(position, 10.0) - 5.0) + 5.0;

	float l = clamp(length(pos.xyz) / RADIUS, 0.0, 1.0);
	bw = 1.0 - l;
	fog = 1.0 - l * l;
}

</script>

<script id="fs-anchor" type="x-shader/x-fragment">

precision mediump float;

const vec4 GREY = vec4(0.75, 0.75, 0.75, 1.0);

uniform sampler2D texNoise;

varying vec3 con;
varying vec3 tex;

varying float bw;
varying float fog;

void main(void) {
	vec4 col = con.z * texture2D(texNoise, tex.xy) + con.y * texture2D(texNoise, tex.xz) + con.x * texture2D(texNoise, tex.yz);
	gl_FragColor = mix(GREY, col * bw, fog);
}

</script>

