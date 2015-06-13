(function(){
function sketch(p){
    p.setup = function(){
      p.createCanvas(900,450);
    }
    p.draw = function(){
      p.background(3);
      p.rectMode(p.CENTER);
      p.rect(p.mouseX,p.mouseY,30,30);
    }
}

new p5(sketch,'board');
})();