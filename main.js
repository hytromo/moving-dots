// the number of dots
var MAX_NODE_COUNT = 120;
// the max radius of each dot
var MAX_RADIUS = 3;
// the max speed (x coordinate modifier)
var MAX_SPEED = 0.05;
// the width of each line between the dots
var LINE_WIDTH = 2;
// the max distance where 2 dots are connected
var MAX_DISTANCE_SHOW_LINE = 160;
// how much off screen should a dot be in order to be reinitialized
var OFF_SCREEN_PIXELS = 50;
// change to true if you want the dots to be randomly transparent
var TRANSPARENT_DOTS = false;

var LINE_COLORS = [
// '229, 57, 53',
// '49, 27, 146',
// '3, 155, 229',
// '198, 255, 0',
'244, 81, 30',
// '38, 50, 56',
'0, 0, 0'
];

var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
canvas.width = document.body.clientWidth;
canvas.height = document.body.clientHeight;

window.requestAnimFrame = (function(){
	return  window.requestAnimationFrame       ||
	window.webkitRequestAnimationFrame ||
	window.mozRequestAnimationFrame    ||
	function( callback ){
		window.setTimeout(callback, 1000 / 60);
	};
})();

function randInt(min, max) {
	return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min, max) {
	return (Math.random() * (max - min) + min);
}

function nodeDistance(n1, n2) {
	return Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2));
}
var count = 0;
var Node = function () {
	this.init = function () {
		this.xInit = this.x = randInt(-1 * OFF_SCREEN_PIXELS, canvas.width + OFF_SCREEN_PIXELS);
		this.yInit = this.y = randInt(-1 * OFF_SCREEN_PIXELS, canvas.height + OFF_SCREEN_PIXELS);
		this.r = randInt(2, MAX_RADIUS);
		this.opacity = TRANSPARENT_DOTS ? randFloat(0.2, 0.9) : 1;
		this.speed = randFloat(-1 * MAX_SPEED, MAX_SPEED);
		this.color = LINE_COLORS[randInt(0, LINE_COLORS.length - 1)];
		this.l = randFloat(-1 * Math.abs(this.speed * 10), Math.abs(this.speed * 10));
	}

	this.needsReinit = function () {
		return this.x < -1 * OFF_SCREEN_PIXELS || this.y < -1 * OFF_SCREEN_PIXELS || this.x > canvas.width + OFF_SCREEN_PIXELS || this.y > canvas.height + OFF_SCREEN_PIXELS;
	}
	this.reinit = function () {
		console.log(count++);
		this.init();

		var xAreas = [-1 * OFF_SCREEN_PIXELS, canvas.width + OFF_SCREEN_PIXELS];
		var yAreas = [-1 * OFF_SCREEN_PIXELS, canvas.height + OFF_SCREEN_PIXELS];

		if (randInt(0, 1) === 0) {
			// specific x
			this.xInit = this.x = xAreas[randInt(0, 1)];
			this.yInit = this.y = randFloat(-1 * OFF_SCREEN_PIXELS, canvas.height + OFF_SCREEN_PIXELS);	
			if (this.xInit < 0 && this.speed < 0) {
				this.speed = Math.abs(this.speed);
			} else if (this.xInit > 0 && this.speed > 0) {
				this.speed = -1 * this.speed;
			}
		} else {
			// specific y
			this.yInit = this.y = yAreas[randInt(0, 1)];
			this.xInit = this.x = randFloat(-1 * OFF_SCREEN_PIXELS, canvas.width + OFF_SCREEN_PIXELS);	
			if (this.yInit < 0 && this.speed < 0) {
				this.speed = Math.abs(this.speed);
			} else if (this.xInit > 0 && this.l > 0) {
				this.speed = -1 * this.speed;
			}
		}
	}

	this.init();
}

var nodes = [];

for (var i = 0; i < MAX_NODE_COUNT; i++) {
	nodes.push(new Node());
}

var speedModifier = 1.0;
var faster = true;

function changeSpeedRandom() {
	speedModifier = faster ? randFloat(1.5, 2.5) : 1.0;
	faster = !faster;
	setInterval(changeSpeedRandom, randInt(100, 2000));
}

var lastTime = false;
function render(time) {
	var dt;
	if (!lastTime) {
		dt = 0;
	} else {
		dt = time - lastTime;
		if (dt > 100) {
			dt = 0;
		}
	}
	lastTime = time;
	canvas.width  = window.innerWidth;
	canvas.height = window.innerHeight;
	context.clearRect(0, 0, canvas.width, canvas.height);

	for (var i = 0; i < MAX_NODE_COUNT; i++) {
		var node = nodes[i];
		context.beginPath();
		context.arc(node.x, node.y, node.r, 0, 2 * Math.PI, false);
		context.fillStyle = 'rgba(0, 0, 0, ' + node.opacity + ')';
		context.fill();
	}

	context.lineWidth = LINE_WIDTH;
	for (var i = 0; i < MAX_NODE_COUNT; i++) {
		var curNode = nodes[i];
		for (var j = i; j < MAX_NODE_COUNT; j++) {
			if (i === j) {
				continue;
			}
			var node = nodes[j];

			var distance = nodeDistance(curNode, node);

			if (distance < MAX_DISTANCE_SHOW_LINE) {
				// draw the line
				context.beginPath();
				context.moveTo(curNode.x, curNode.y);
				context.lineTo(node.x, node.y);
				context.strokeStyle = 'rgba(' + curNode.color + ', ' + ((MAX_DISTANCE_SHOW_LINE - distance) / MAX_DISTANCE_SHOW_LINE) + ')';
				context.stroke();
			}
		}

		curNode.x += curNode.speed * speedModifier * dt;
		curNode.y = (curNode.l * (curNode.x - curNode.xInit) + curNode.yInit);

		if (curNode.needsReinit()) {
			curNode.reinit();
		}
	}

	window.requestAnimationFrame(render);
}

window.requestAnimationFrame(render);
changeSpeedRandom();