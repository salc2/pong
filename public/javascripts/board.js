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

 
function collisionX(o){
  var b = o.ball,
 lp = o.lpad,
 rp = o.rpad,
 changed = b.x+10 >= rp.x-10 && (rp.y+40 >= b.y-10 && rp.y-40 <= b.y+10 ) ||
		 (b.x-10 <= lp.x+10 && (lp.y+40 >= b.y-10 && lp.y-40 <= b.y+10 ));
	 return changed;
}


function collisionY(o){

 var b = o.ball,
 lp = o.lpad,
 rp = o.rpad, 
 changed = (b.y >= H-10 || b.y <= 10);
 return changed;
 }

 function move(o){
	 var b = o.ball;
	 b.spdx = collisionX(o) ? b.spdx * -1 : b.spdx;
	 b.spdy = collisionY(o) ? b.spdy * -1 : b.spdy;
	 b.x += b.spdx;
	 b.y += b.spdy;
	 if(b.x > W-40 || b.x < 40){
		 b.x = W/2;
		 b.y = H/2;
	 }
	return o;
 }


 function sketch(p){

	 var positions,
	     paddles,
	     moves,
		sound;

	 positions = Rx.Observable.fromEvent(document,'positions').
		 map(function(o){return o.detail;});

	 paddles = positions.
		 filter(function(x){ return x.type === 'paddles'}).
		 filter(function(x){
				 return x.posy >= 80 && x.posy <= H-80; 
				 });

	 moves = positions.filter(function(b){ return b.type === 'moves';});
	 moves.delay(16.66).map(move).do(draw).subscribe(dispatch);
	 
	 p.preload = function(){
		 sound = p.loadSound('/assets/ping-pong-ball-hit.wav');	
	 };
	 
	p.setup = function(){
		 var ball,
		     lPaddle,
		     rPaddle,
		     tmp;
		 p.createCanvas(W,H);
		 ball = {x: W/2, y: H/2, spdy: 1, spdx: 5};
		 lPaddle = {x: 40, y: H/2};
		 rPaddle = {x: W-40, y: H/2};
		 tmp = {type: 'moves', ball: ball, lpad: lPaddle, rpad: rPaddle}
		 p.rectMode(p.CENTER);
		 dispatch(tmp);
	 };
	 function draw(objs){
		var ball = objs.ball,
		 rPaddle = objs.rpad,
		 lPaddle = objs.lpad;
		 p.background(3);
		 p.rect(ball.x,ball.y,20,20);
		 p.rect(rPaddle.x,rPaddle.y,20,80);
		 p.rect(lPaddle.x,lPaddle.y,20,80);
		 if(collisionX(objs) || collisionY(objs)){
			sound.play();
		}
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
