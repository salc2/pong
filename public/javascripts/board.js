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
		     lMarker,
		     rMarker,
		     sound;

		 function isCollisionX(){
			 var changed = (ball.x+10 > rPaddle.x-10 && 
					 rPaddle.y+(rPaddle.h/2) > ball.y-10 && 
					 rPaddle.y-(rPaddle.h/2) < ball.y+10 ) ||
				 (ball.x-10 < lPaddle.x+10 && (lPaddle.y+(lPaddle.h/2) > ball.y-10 && 
							       lPaddle.y-(lPaddle.h/2) < ball.y+10 ));
			 return changed;
		 }

		 function incrementSpeed(){
			 if(isCollisionX()){
				 var i = 0.3;
				 ball.spdx = ball.spdx > 0 ? ball.spdx + i : ball.spdx - i;
			 }
		 }

		 function isCollisionY(){
			 var changed = (ball.y > H-10 || ball.y < 10);
			 return changed;
		 }

		 function playerWin(){
			 if(lMarker.points == 15){
				 p.draw = {}; 
				 p.text('Left Won!',W/4,H/2);
			 }else if(rMarker.points == 15){
				 p.draw = {}; 
				 p.text('Right Won!',W/4,H/2);
			 }
		 }

		 function moveAndSound(){
			 ball.x += ball.spdx;
			 ball.y += ball.spdy;
			 if(isCollisionX() || isCollisionY()){
				 sound.play();
				 ball.spdx = isCollisionX() ? ball.spdx * -1 : ball.spdx;
				 ball.spdy = isCollisionY() ? ball.spdy * -1 : ball.spdy;
				 incrementSpeed();
			 }				
			 if(ball.x > W || ball.x < 0){
				 lMarker.points = ball.x > W-40 ? lMarker.points+1 : lMarker.points;
				 rMarker.points = ball.x < 40 ? rMarker.points+1 : rMarker.points;
				 playerWin();
				 ball.x = W/2;
				 ball.y = H/2;
				 ball.spdx = ((ball.spdx-8 > 0 ? ball.spdx-8 : 2)/2)+8;
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
			 lPaddle = {x: 40, y: H/2, w: 20, h: 80};
			 rPaddle = {x: W-40, y: H/2, w: 20, h: 80};
			 p.textSize(100);
			 p.textFont('Black Ops One');
			 rMarker = {points:0};
			 lMarker = {points:0};
		 };
		 p.draw = function (){
			 p.background(3);
			 moveAndSound(); 
			 p.fill(255,255,255,50);
			 p.text(lMarker.points,100,H/3);
			 p.text(rMarker.points,W-150,H/3);
			 p.fill(255);
			 p.rect(ball.x,ball.y,20,20);
			 p.rect(rPaddle.x,rPaddle.y,rPaddle.w,rPaddle.h);
			 p.rect(lPaddle.x,lPaddle.y,lPaddle.w,lPaddle.h);
		 };
	 }
 }

 new p5(sketch(messages),'board');
})();
