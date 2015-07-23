(function(){

 var ws, 
 eventstreams, 
 observer,
 host,
 path,
 tcp;

 tcp = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
 host = window.location.host;
 path = window.location.pathname;
 ws = new WebSocket(tcp+host+'/ws'+path);


 function sketch(websocket){
 return function(p){
 var w = window.innerWidth,
 h = window.innerHeight/2,
 posY = h/2;

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


 Rx.Observable.create(function(o){
		 p.touchMoved = function(){
		 posY = p.touchY;
		 var y = (p.touchY * 450) / h;
		 o.onNext({typee: 'paddles', side: path.replace('/',''), posy: y});
		 };
		 }).
		map(function(i){return JSON.stringify(i);}).
		subscribe(function(m){
			 websocket.send(m);
			 });

 p.touchEnded = function(){
	 posY = h/2;
 };

 }
 }
 new p5(sketch(ws));
})();
