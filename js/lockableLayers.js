/**
 * Created by Lyle Denman on 5/22/16.
 */
(function(){
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');

  /************************/
  /***** SQUARE CLASS *****/
  /************************/
  var Square = function(x, y, w, fillColor) {
    this.x = x || 0; // Default to 0 if no x provided, etc
    this.y = y || 0;
    this.width = w || 1;
    this.height = w || 1;
    this.fillColor = fillColor || "#FFFFFF";
  };

  Square.prototype.draw = function(ctx) {
    ctx.fillStyle = this.fillColor;
    ctx.fillRect(this.x, this.y, this.width, this.height);
  };

  var x = new Square(0, 0, 100, 100);
  x.draw(ctx);

  /************************/
  /***** CANVAS CLASS *****/
  /************************/
  var CanvasState = function(canvas) {
    this.canvas = canvas; // get canvas
    this.ctx = canvas.getContext('2d'); // get context for drawing
    this.paint = false; // paint: draw to canvas when true
    this.listenMouseDown();
    this.listenMouseMove();
    this.listenMouseUp();
    this.listenKeyDown();

    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];

    this.clickColor = [];
    this.colors = [{text: "Black", hex: "#000000"}, {text: "Red", hex: "#FF0000"},
      {text: "Green", hex: "#00FF00"}, {text: "Blue", hex: "#0000FF"}];
    this.curColorIndex = 0;
    this.curColorName = this.colors[this.curColorIndex].text;

    this.clickSize = [];
    this.ctx.lineWidth = 5;


  };

  CanvasState.prototype.addClick = function(x, y, dragging) {
    this.clickX.push(x);
    this.clickY.push(y);
    this.clickDrag.push(dragging);
    this.clickColor.push(this.colors[this.curColorIndex].hex);
  };

  CanvasState.prototype.redraw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear all
    this.ctx.lineJoin = "round";

    for(var i=0; i < this.clickX.length; i++) {
      this.ctx.beginPath();
      if(this.clickDrag[i] && i){
        this.ctx.moveTo(this.clickX[i-1], this.clickY[i-1]);
      }else{
        this.ctx.moveTo(this.clickX[i]-1, this.clickY[i]);
      }
      this.ctx.lineTo(this.clickX[i], this.clickY[i]);
      this.ctx.closePath();
      this.ctx.strokeStyle = this.clickColor[i];
      this.ctx.stroke();
    }
  };

  CanvasState.prototype.changeLineWidth = function() {
    switch(this.ctx.lineWidth) {
      case 5: this.ctx.lineWidth = 10;
        break;

      case 10: this.ctx.lineWidth = 20;
        break;

      case 20: this.ctx.lineWidth = 5;
        break;

      default:
        break;
    }
  };

  CanvasState.prototype.changeColor = function() {
    this.curColorIndex = (this.curColorIndex + 1) % this.colors.length;
    this.curColorName = this.colors[this.curColorIndex].text;
  };

  CanvasState.prototype.listenMouseMove = function() {
    this.canvas.addEventListener('mousemove', (e) => {
      if (this.paint) {
        this.addClick(e.offsetX, e.offsetY, true); // Pass mouse coordinates
        this.redraw();
      }
    });
  };

  CanvasState.prototype.listenMouseUp = function() {
    this.canvas.addEventListener('mouseup', (e) => {
      this.paint = false;
    })
  };

  CanvasState.prototype.listenMouseDown = function() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.paint = true;
      this.addClick(e.offsetX, e.offsetY, false); // Pass mouse coordinates
      // Passing 'false' for 'dragging' ensures there is not an undesired line
      // drawn between the last point of mouseUp and the current mouseDown
      this.redraw();
    });
  };


  var c = new CanvasState(canvas);

  var size = document.getElementById('size');
  size.onclick = function() {
    c.changeLineWidth();
  };

  var colorBtn = document.getElementById('color');
  colorBtn.innerHTML = "Color: " + c.curColorName;
  colorBtn.onclick = function() {
    c.changeColor();
    colorBtn.innerHTML = "Color: " + c.curColorName;
  };

  // Create a "Layer" class
  // One instance of Layer will hold all activity drawn to that layer.
  // Layers can be selected at random -- changes will only affect selected layer
  // Layers can be re-ordered
})();
