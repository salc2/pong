(function(){

var w = window.innerWidth,
h = window.innerHeight,
posY = h/2;

function sketch(p){
p.setup = function() {
	p.createCanvas(w, h);
};

p.draw = function(){
	p.clear();
	p.rectMode(p.CENTER);
	p.fill(0);
	p.rect(w/2,h/2,(w/3)-200,h-10);
	p.ellipseMode(p.CENTER);
	p.fill(255,0,0);
	p.noStroke();
	p.ellipse(w/2,posY, w/3,w/3);
};

p.touchMoved = function(){
	posY = p.touchY;
};

p.touchEnded = function(){
	posY = h/2;
};
}
new p5(sketch);
})();

