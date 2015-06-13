(function(){
var ws,
messages,
observer;

function sketch(p){
    p.setup = function(){
      p.createCanvas(900,450);
    };
    p.draw = function(){
      p.background(3);
      p.rectMode(p.CENTER);
      p.rect(p.mouseX,p.mouseY,20,20);
    };
}

ws = new WebSocket('ws://localhost:9000/ws');
observer = Rx.Observer.create(function(n){
  console.log(n);
},
function(e){},
function(){});

messages = Rx.Observable.fromEvent(ws,'message').
map(function(x){
  return x.data;
  });

messages.subscribe(observer);
new p5(sketch,'board');
})();