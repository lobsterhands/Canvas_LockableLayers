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


  var Layer = function() {
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickSize = [];
    this.drawToCanvas = true;
  };


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

    this.colors = [{text: "Black", hex: "#000000"}, {text: "Red", hex: "#FF0000"},
      {text: "Green", hex: "#00FF00"}, {text: "Blue", hex: "#0000FF"}];
    this.curColorIndex = 0;
    this.curColorName = this.colors[this.curColorIndex].text;

    this.sizes = [{text: "Tiny", radius: 2}, {text: "Small", radius: 5},
      {text: "Medium", radius: 10}, {text: "Large", radius: 15}];
    this.curSizeIndex = 0;
    this.curSizeName = this.sizes[this.curSizeIndex].text;

    this.layers = []; // Store all layers
    this.layers.push(new Layer());
    this.curLayerIndex = 0;
  };

  CanvasState.prototype.addClick = function(x, y, dragging) {
    this.layers[this.curLayerIndex].clickX.push(x);
    this.layers[this.curLayerIndex].clickY.push(y);
    this.layers[this.curLayerIndex].clickDrag.push(dragging);
    this.layers[this.curLayerIndex].clickColor.push(this.colors[this.curColorIndex].hex);
    this.layers[this.curLayerIndex].clickSize.push(this.sizes[this.curSizeIndex].radius);
  };

  CanvasState.prototype.redraw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear all
    this.ctx.lineJoin = "round";

    for(var i=0; i < this.layers[this.curLayerIndex].clickX.length; i++) {
      this.ctx.beginPath();
      if(this.layers[this.curLayerIndex].clickDrag[i] && i){
        this.ctx.moveTo(this.layers[this.curLayerIndex].clickX[i-1], this.layers[this.curLayerIndex].clickY[i-1]);
      }else{
        this.ctx.moveTo(this.layers[this.curLayerIndex].clickX[i]-1, this.layers[this.curLayerIndex].clickY[i]);
      }
      this.ctx.lineTo(this.layers[this.curLayerIndex].clickX[i], this.layers[this.curLayerIndex].clickY[i]);
      this.ctx.closePath();
      this.ctx.strokeStyle = this.layers[this.curLayerIndex].clickColor[i];
      this.ctx.lineWidth = this.layers[this.curLayerIndex].clickSize[i];
      this.ctx.stroke();
    }
  };

  CanvasState.prototype.drawAllLayers = function() {
    var ctx = this.ctx;

    for (var layerNum = 0; layerNum < this.layers.length; layerNum++) {
      if (this.layers[layerNum].drawToCanvas) {
        for(var i=0; i < this.layers[layerNum].clickX.length; i++) {
          ctx.beginPath();
          if(this.layers[layerNum].clickDrag[i] && i){
            ctx.moveTo(this.layers[layerNum].clickX[i-1], this.layers[layerNum].clickY[i-1]);
          }else{
            ctx.moveTo(this.layers[layerNum].clickX[i]-1, this.layers[layerNum].clickY[i]);
          }
          ctx.lineTo(this.layers[layerNum].clickX[i], this.layers[layerNum].clickY[i]);
          ctx.closePath();
          ctx.strokeStyle = this.layers[layerNum].clickColor[i];
          ctx.lineWidth = this.layers[layerNum].clickSize[i];
          ctx.stroke();
        }
      }
    }
  };

  CanvasState.prototype.changeLineWidth = function() {
    this.curSizeIndex = (this.curSizeIndex + 1) % this.sizes.length;
    this.curSizeName = this.sizes[this.curSizeIndex].text;
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
        this.drawAllLayers();
      }
    });
  };

  CanvasState.prototype.listenMouseUp = function() {
    this.canvas.addEventListener('mouseup', (e) => {
      this.paint = false;
      this.drawAllLayers();
    })
  };

  CanvasState.prototype.listenMouseDown = function() {
    this.canvas.addEventListener('mousedown', (e) => {
      this.paint = true;
      this.addClick(e.offsetX, e.offsetY, false); // Pass mouse coordinates
      // Passing 'false' for 'dragging' ensures there is not an undesired line
      // drawn between the last point of mouseUp and the current mouseDown
      this.redraw();
      this.drawAllLayers();
    });
  };

  CanvasState.prototype.createNewLayer = function() {
    this.layers.push(new Layer());
    this.curLayerIndex++;
  };


  var c = new CanvasState(canvas);

  var sizeBtn = document.getElementById('size');
  sizeBtn.innerHTML = "Size: " + c.curSizeName;
  sizeBtn.onclick = function() {
    c.changeLineWidth();
    sizeBtn.innerHTML = "Size: " + c.curSizeName;
  };

  var colorBtn = document.getElementById('color');
  colorBtn.innerHTML = "Color: " + c.curColorName;
  colorBtn.onclick = function() {
    c.changeColor();
    colorBtn.innerHTML = "Color: " + c.curColorName;
  };

  var newLayerBtn = document.getElementById('new-layer');
  newLayerBtn.innerHTML = "Layer: " + c.curLayerIndex;
  var layers = document.getElementById('layers');
  var newDiv = document.createElement('DIV');
  newDiv.index = c.curLayerIndex;
  newDiv.onclick = function() {
    c.layers[this.index].drawToCanvas = (c.layers[this.index].drawToCanvas) ? false : true;
  };
  var newDivText = document.createTextNode("Layer: " + c.curLayerIndex);
  newDiv.appendChild(newDivText);
  layers.appendChild(newDiv);
  newLayerBtn.onclick = function() {
    c.createNewLayer();
    newLayerBtn.innerHTML = "Layer: " + c.curLayerIndex;
    var layers = document.getElementById('layers');
    var newDiv = document.createElement('DIV');
    newDiv.index = c.curLayerIndex;
    newDiv.onclick = function() {
      c.layers[this.index].drawToCanvas = (c.layers[this.index].drawToCanvas) ? false : true;
    };
    var newDivText = document.createTextNode("Layer: " + c.curLayerIndex);
    newDiv.appendChild(newDivText);
    layers.appendChild(newDiv);
  };

  // Create a "Layer" class
  // One instance of Layer will hold all activity drawn to that layer.
  // Layers can be selected at random -- changes will only affect selected layer
  // Layers can be re-ordered
})();
