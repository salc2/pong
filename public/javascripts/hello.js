(function(){
var ws;

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
ws.onmessage = function(e){console.log(e.data);};
new p5(sketch,'board');


})();