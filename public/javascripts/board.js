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

function collision(o){
var b = o.ball,
lp = o.lpad,
rp = o.rpad;
b.spdy = b.y >= H-10 || 
b.y <= 10 ? b.spdy * -1 : b.spdy;

if(b.x+10 >= rp.x-10 && (rp.y+40 >= b.y-10 && rp.y-40 <= b.y+10 ) ||
	(b.x-10 <= lp.x+10 && (lp.y+40 >= b.y-10 && lp.y-40 <= b.y+10 ))){
   b.spdx = b.spdx * -1;
 }
	return o;
}

function move(o){
	var b = o.ball;
	b.x += b.spdx;
	b.y += b.spdy;
	if(b.x > W-40 || b.x < 40){
		b.x = W/2;
		b.y = H/2;
	}
}


 function sketch(p){
 var ball,
 lPaddle,
 rPaddle;
 
 var positions,
 paddles,
 moves;

 positions = Rx.Observable.fromEvent(document,'positions').
	map(function(o){return o.detail;});

 paddles = positions.
	filter(function(x){ return x.type === 'paddles'}).
	filter(function(x){
			return x.posy >= 80 && x.posy <= H-80; 
	});

	paddles.filter(function(x){ return x.side === 'rpaddle';}).
	subscribe(function(n){
		rPaddle.y = n.posy;
	});
	paddles.filter(function(x){ return x.side === 'lpaddle';}).
	subscribe(function(n){
		lPaddle.y = n.posy;
	});
 moves = positions.filter(function(b){ return b.type === 'moves';});
 moves.map(collision).subscribe(move);
 p.setup = function(){
	 p.createCanvas(W,H);
	 p.frameRate(60);
	 ball = {x: W/2, y: H/2, spdy: 1, spdx: 4};
	 lPaddle = {x: 40, y: H/2};
	 rPaddle = {x: W-40, y: H/2};
	 p.rectMode(p.CENTER);
 };
 p.draw = function(){
	 p.background(3);
	 dispatch({type: 'moves', ball: ball, lpad: lPaddle, rpad: rPaddle});
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
