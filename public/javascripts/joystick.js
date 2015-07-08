(function(){
var w = window.innerWidth,
h = window.innerHeight,
posY = h/2;

var ws, 
eventstreams, 
observer;

var host,
path,
tcp;
tcp = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
host = window.location.host;
path = window.location.pathname;
ws = new WebSocket(tcp+host+'/ws'+path);
eventstreams = Rx.Observable.fromEvent(document,'joystickmove');
observer = Rx.Observer.create(
	function(n){
		try{
			ws.send(JSON.stringify(n.detail));
		}catch(e){
			console.log(e);
		}
	},
	function(e){ console.log(e);},
	function(){});

eventstreams.subscribe(observer);

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
	document.dispatchEvent(new CustomEvent('joystickmove',{'detail':{posy: posY}}));
};

p.touchEnded = function(){
	//posY = h/2;
};
}
new p5(sketch);
})();
