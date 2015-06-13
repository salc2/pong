(function(){
var WIDTH = 900,
HEIGHT = 450;

var ws,
messages,
observer;

var ball,
lPaddle,
rPaddle;

function sketch(p){

    p.setup = function(){
      p.createCanvas(WIDTH,HEIGHT);
      ball = {x: WIDTH/2, y: HEIGHT/2};
      lPaddle = {x: 40, y: HEIGHT/2};
      rPaddle = {x: WIDTH-40, y: HEIGHT/2};
      p.rectMode(p.CENTER);
    };

    p.draw = function(){
      p.background(3);
      p.rect(ball.x,ball.y,20,20);
      p.rect(rPaddle.x,rPaddle.y,20,80);
      p.rect(lPaddle.x,lPaddle.y,20,80);
    };
}

ws = new WebSocket('ws://localhost:9000/ws');
observer = Rx.Observer.create(
    function(n){
      console.log(n);},
    function(e){},
    function(){});

messages = Rx.Observable.fromEvent(ws,'message').
map(function(x){
  return x.data;
  });

messages.subscribe(observer);
new p5(sketch,'board');
})();