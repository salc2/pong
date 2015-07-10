(function(){
 var host, 
 tcp,
 path;

 var W = 900,
 H = 450;

 var ws,
 messages,
 observer;

function dispatch(obj){
	document.dispatchEvent(new CustomEvent('positions',{detail: obj}));
}

 function sketch(p){
 var ball,
 lPaddle,
 rPaddle;
 Rx.Observable.fromEvent(document,'positions').
	map(function(o){return o.detail;}).
	filter(function(x){
			return x.posy >= 80 && x.posy <= H-80; 
	}).subscribe(function(n){
		rPaddle.y = n.posy;
	});
 p.setup = function(){
	 p.createCanvas(W,H);
	 ball = {x: W/2, y: H/2};
	 lPaddle = {x: 40, y: H/2};
	 rPaddle = {x: W-40, y: H/2};
	 p.rectMode(p.CENTER);
 };

 p.draw = function(){
	 p.background(3);
	 p.rect(ball.x,ball.y,20,20);
	 p.rect(rPaddle.x,rPaddle.y,20,80);
	 p.rect(lPaddle.x,lPaddle.y,20,80);
 };
 }

 tcp = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
 host = window.location.host;
 path = window.location.pathname;
 ws = new WebSocket(tcp+host+path+'ws');

 observer = Rx.Observer.create(
		 function(n){
		 dispatch(n);},
		 function(e){},
		 function(){});

 messages = Rx.Observable.fromEvent(ws,'message').
	 map(function(x){
			 return JSON.parse(x.data);
			 });

 messages.subscribe(observer);
 new p5(sketch,'board');
})();
