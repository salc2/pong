(function(){
 var W = 900,
 H = 450,
 host,
 tcp,
 patch,
 ws,
 messages;

 tcp = window.location.protocol === 'https:' ? 'wss://' : 'ws://';
 host = window.location.host;
 path = window.location.pathname;
 ws = new WebSocket(tcp+host+path+'ws');

 messages = Rx.Observable.fromEvent(ws,'message').
 map(function(x){ return JSON.parse(x.data);}).
 filter(function(x){ return x.type === 'paddles'}).
 filter(function(x){ return x.posy >= 40 && x.posy <= H-40; });


 function sketch(source){
	 return function(p){
		 var ball,
		     lPaddle,
		     rPaddle,
		     sound;

		 function isCollisionX(){
			 var changed = (ball.x+10 > rPaddle.x-10 && 
					 rPaddle.y+40 > ball.y-10 && rPaddle.y-40 < ball.y+10 ) ||
				 (ball.x-10 < lPaddle.x+10 && (lPaddle.y+40 > ball.y-10 && 
							       lPaddle.y-40 < ball.y+10 ));
			 return changed;
		 }


		 function isCollisionY(){
			 var changed = (ball.y > H-10 || ball.y < 10);
			 return changed;
		 }

		 function moveAndSound(){
			 if(isCollisionX() || isCollisionY()){
				 sound.play();
			 }
			 ball.spdx = isCollisionX() ? ball.spdx * -1 : ball.spdx;
			 ball.spdy = isCollisionY() ? ball.spdy * -1 : ball.spdy;
			 ball.x += ball.spdx;
			 ball.y += ball.spdy;
			 if(ball.x > W-40 || ball.x < 40){
				 ball.x = W/2;
				 ball.y = H/2;
			 }
		 }


		 source.subscribe(function(o){
				 if(o.side === 'lpaddle'){
				 lPaddle.y = o.posy;
				 }else{
				 rPaddle.y = o.posy;
				 }
				 });

		 p.preload = function(){
			 sound = p.loadSound('/assets/ping-pong-ball-hit.wav');	
		 };

		 p.setup = function(){
			 p.createCanvas(W,H);
			 p.rectMode(p.CENTER);
			 ball = {x: W/2, y: H/2, spdy: 1, spdx: 8};
			 lPaddle = {x: 40, y: H/2};
			 rPaddle = {x: W-40, y: H/2};
		 };
		 p.draw = function (){
			 p.background(3);
			 p.rect(ball.x,ball.y,20,20);
			 p.rect(rPaddle.x,rPaddle.y,20,80);
			 p.rect(lPaddle.x,lPaddle.y,20,80);
			 moveAndSound(); 
		 };
	 }
 }

 new p5(sketch(messages),'board');
})();
