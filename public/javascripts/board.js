(function(){
 var W = 900,
 H = 450,
 host,
 tcp,
 patch,
 ws,
 messages,
 observer,
 positions,
 paddles,
 moves;

 function emitter(obj){
 document.dispatchEvent(new CustomEvent('positions',{detail: obj}));
 }


 function collisionX(o){
 var b = o.ball,
 lp = o.lpad,
 rp = o.rpad,
 changed = b.x+10 >= rp.x-10 && 
	 (rp.y+40 >= b.y-10 && rp.y-40 <= b.y+10 ) ||
	 (b.x-10 <= lp.x+10 && (lp.y+40 >= b.y-10 && 
				lp.y-40 <= b.y+10 ));
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


 function sketch(source,padds){
	 return function(p){
		 var ball,
		     lPaddle,
		     rPaddle,
		     sound;
		 padds.do(function(o){
			if(o.side === 'lpaddle'){
				lPaddle.y = o.posy;
			}else{
				rPaddle.y = o.posy;
			}
		 }).subscribe(function(o){
			console.log(o);
		 });
		 source.map(move).
			 do(function(o){
					 if(collisionX(o) || collisionY(o)){
					 sound.play();
					 }
					 }).
		 do(function(o){
				 lPaddle.y = o.lpad.y;
				 rPaddle.y = o.rpad.y;
				 }).
		 delay(16.66).subscribe(emitter);

		 p.preload = function(){
			 sound = p.loadSound('/assets/ping-pong-ball-hit.wav');	
		 };

		 p.setup = function(){
			 var tmp;
			 p.createCanvas(W,H);
			 p.rectMode(p.CENTER);
			 ball = {x: W/2, y: H/2, spdy: 1, spdx: 8};
			 lPaddle = {x: 40, y: H/2};
			 rPaddle = {x: W-40, y: H/2};
			 tmp = {type: 'moves', ball: ball, lpad: lPaddle, rpad: rPaddle};
			 emitter(tmp);
		 };
		 p.draw = function (){
			 p.background(3);
			 p.rect(ball.x,ball.y,20,20);
			 p.rect(rPaddle.x,rPaddle.y,20,80);
			 p.rect(lPaddle.x,lPaddle.y,20,80);
		 };
	 }
 }

 tcp = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
 host = window.location.host;
 path = window.location.pathname;
 ws = new WebSocket(tcp+host+path+'ws');

 observer = Rx.Observer.create(
		 function(n){
		 emitter(n);},
		 function(e){},
		 function(){});

 messages = Rx.Observable.fromEvent(ws,'message').
	 map(function(x){
			 return JSON.parse(x.data);
			 });

 messages.subscribe(observer);

 positions = Rx.Observable.fromEvent(document,'positions').
	 map(function(o){return o.detail;});

 paddles = positions.
	 filter(function(x){ return x.type === 'paddles'}).
	 filter(function(x){
			 return x.posy >= 80 && x.posy <= H-80; 
			 });


 moves = positions.filter(function(b){ return b.type === 'moves';});

 new p5(sketch(moves,paddles),'board');
})();
