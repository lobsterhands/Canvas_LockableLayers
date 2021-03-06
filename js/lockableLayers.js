/**
 * Created by Lyle Denman on 5/22/16.
 *
 * This started with a lot of help from:
 * http://www.williammalone.com/articles/create-html5-canvas-javascript-drawing-app/
 */
(function(){
  var canvas = document.getElementById('canvas');
  var ctx = canvas.getContext('2d');
  /************************/
  /***** LAYER CLASS *****/
  /************************/
  // Create a "Layer" class
  // One instance of Layer will hold all activity drawn to that layer.
  var Layer = function() {
    this.clickX = [];
    this.clickY = [];
    this.clickDrag = [];
    this.clickColor = [];
    this.clickSize = [];
    this.drawToCanvas = true; // Toggled by checkbox: Hide
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

    this.tools = [{text: "Pen"}, {text: "Eraser"}];
    this.curToolIndex = 0;
    this.curToolName = this.tools[this.curToolIndex].text;

    this.sizes = [{text: "Tiny", radius: 2}, {text: "Small", radius: 5},
      {text: "Medium", radius: 10}, {text: "Large", radius: 15}];
    this.curSizeIndex = 0;
    this.curSizeName = this.sizes[this.curSizeIndex].text;

    this.layers = []; // Store all layers
    this.curLayerIndex = -1; // curLayerIndex is incremented in createNewLayer()
    this.noLayerSelected = false;
    this.createNewLayer();
  };

  CanvasState.prototype.createNewLayer = function() {
    this.layers.push(new Layer());
    this.curLayerIndex = this.layers.length-1;
    this.createNewLayerDiv();
  };

  CanvasState.prototype.createNewLayerDiv = function() {
    this.noLayerSelected = false;
    var newLayerBtn = document.getElementById('new-layer');

    newLayerBtn.onclick = () => {
      if (this.layers.length > 4) {
        alert("You've reached the current layer limit.");
        return;
      }
      this.createNewLayer();
    };
    newLayerBtn.innerHTML = "Create new Layer";
    var layers = document.getElementById('layers');
    var newDiv = document.createElement('DIV');
    newDiv.index = this.curLayerIndex;
    var newDivText = document.createTextNode("Layer: " + this.layers.length);
    newDiv.appendChild(newDivText);
    layers.appendChild(newDiv);
    this.appendHideCheckbox(newDiv);
    this.appendCurrentCheckbox(newDiv);
  };

  CanvasState.prototype.appendHideCheckbox = function(parent) {
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.id = parent.index;
    checkbox.onclick = () => {
      this.layers[checkbox.id].drawToCanvas = (this.layers[checkbox.id].drawToCanvas) ? false : true;
      this.redraw();
    };
    var label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.appendChild(document.createTextNode('Hide'));

    var br = document.createElement("br");

    parent.appendChild(br);
    parent.appendChild(checkbox);
    parent.appendChild(label);
  };

  CanvasState.prototype.appendCurrentCheckbox = function(parent) {
    var checkbox = document.createElement('input');
    checkbox.type = "checkbox";
    checkbox.name = "current";
    checkbox.index = parent.index;
    checkbox.id = "current" + checkbox.index;
    checkbox.checked = true;
    var currentCheckboxes = document.getElementsByName('current');
    for (var i = 0; i < currentCheckboxes.length; i++) {
      if (i != this.curLayerIndex) {
        currentCheckboxes[i].checked = false;
      }
    }
    checkbox.onclick = () => {
      if (checkbox.checked) {
        this.curLayerIndex = checkbox.index;
      }
      var currentCheckboxes = document.getElementsByName('current');
      for (var i = 0; i < currentCheckboxes.length; i++) {
        if (i != this.curLayerIndex) {
          currentCheckboxes[i].checked = false;
        }
      }
      if (checkbox.checked == false) {
        this.noLayerSelected = true;
      } else {
        this.noLayerSelected = false;
      }
    };

    var label = document.createElement('label');
    label.htmlFor = checkbox.id;
    label.appendChild(document.createTextNode('Current'));

    var br = document.createElement("br");

    parent.appendChild(br);
    parent.appendChild(checkbox);
    parent.appendChild(label);
  };


  CanvasState.prototype.addClick = function(x, y, dragging) {
    this.layers[this.curLayerIndex].clickX.push(x);
    this.layers[this.curLayerIndex].clickY.push(y);
    this.layers[this.curLayerIndex].clickDrag.push(dragging);
    if (this.curToolName != "Eraser") {
      this.layers[this.curLayerIndex].clickColor.push(this.colors[this.curColorIndex].hex);
    } else {
      this.layers[this.curLayerIndex].clickColor.push("#FFFFFF");
    }
    this.layers[this.curLayerIndex].clickSize.push(this.sizes[this.curSizeIndex].radius);
  };

  CanvasState.prototype.redraw = function() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height); // Clear all
    this.ctx.lineJoin = "round";

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

  CanvasState.prototype.changeTool = function() {
    this.curToolIndex = (this.curToolIndex + 1) % this.tools.length;
    this.curToolName = this.tools[this.curToolIndex].text;
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
      if (this.noLayerSelected) {
        alert('No layer selected!');
        return;
      }
      if (!this.layers[this.curLayerIndex].drawToCanvas) {
        alert("Can't draw to a hidden layer.");
        return;
      }
      this.paint = true;
      this.addClick(e.offsetX, e.offsetY, false); // Pass mouse coordinates
      // Passing 'false' for 'dragging' ensures there is not an undesired line
      // drawn between the last point of mouseUp and the current mouseDown
      this.redraw();
    });
  };

  var c = new CanvasState(canvas); // Create instance of CanvasState

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

  var toolBtn = document.getElementById('tool');
  toolBtn.innerHTML = "Tool: " + c.curToolName;
  toolBtn.onclick = function() {
    c.changeTool();
    toolBtn.innerHTML = "Tool: " + c.curToolName;
  }


})();
