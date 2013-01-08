<!DOCTYPE html>
<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
		<title>mope</title>
		<style>
			html, body {
				width: 100%;
				height: 100%;
				overflow: hidden;
				margin: 0;
				padding: 0;
				background-color: black;
				font-family: Arial;
			}
			
			div {
				cursor: default;
			}
			
			#gl {
				position: absolute;
				top: 0px;
				left: 0px;
				margin: 0;
				padding: 0;
				z-index: 0;
			}
			
			#debugit {
				position: absolute;
				top: 20px;
				left: 20px;

				text-shadow: 0px 0px 5px black, 0px 0px 5px black, 0px 0px 5px black;
				color: white;

				width: 420px;
				padding: 5px;
				
				font-size: 16pt;

				z-index: 5;
			}
		</style>
		
		<script type="text/javascript" src="rise.cat.js"></script>
		<script type="text/javascript" src="mope.js"></script>
		<script type="text/javascript" src="world.js"></script>
		<script type="text/javascript" src="viewer.js"></script>
		<script type="text/javascript" src="anchor.js"></script>
	
<?php
foreach (glob("*.glsl") as $filename) {
    include $filename;
}
?>
		<script type="text/javascript">
			window.addEventListener("load", function() {
				M.start();
			}, false);
		</script>
		
    </head>
	<body>
		<canvas id="gl"></canvas>
		<div id="debugit"></div>
	</body>
</html>
