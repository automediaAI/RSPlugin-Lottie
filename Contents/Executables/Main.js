/*
 React Studio wrapper for the 'react-rating' npm package.

 - 2017.02.27 / Pauli Ojala / pauli@neonto.com
 */


// -- plugin info requested by host app --

this.describePlugin = function(id, lang) {
  switch (id) {
    case 'displayName':
      return "Rating";

    case 'shortDisplayText':
      return "Visualize ratings on a scale.";

    case 'defaultNameForNewInstance':
      return "rating";
  }
}


// -- private variables --

this._data = {
    readonly: false,
	minValue: 0,
	maxValue: 5,
	iconType: 0,
	color: [1, 1, 0, 1],
	customComponent_full: '',
	customComponent_empty: '',
};


// -- persistence, i.e. saving and loading --

this.persist = function() {
  return this._data;
}

this.unpersist = function(data) {
	if ( !Array.isArray(data.color))
		data.color = [1, 1, 0, 1];

    if ( !data.readonly)
      data.readonly = false;
  
	this._data = data;
}


// -- inspector UI --

this.inspectorUIDefinition = [
  {
    "type": "checkbox",
    "id": "readonly",
    "label": "Read only (user can't modify)",
    "actionBinding": "this.onUIChange"
  },
  {
    "type": "label",
    "text": "Min/max values determine the scale:",
    "paddingTop": 20,
  },
  {
    "type": "numberinput",
    "id": "minValue",
    "label": "Min value",
    "min": 0,
    "max": 19,
    "increment": 1,
    "actionBinding": "this.onUIChange"
  },
  {
    "type": "numberinput",
    "id": "maxValue",
    "label": "Max value",
    "min": 1,
    "max": 20,
    "increment": 1,
    "actionBinding": "this.onUIChange"
  },
  
  {
    "type": "label",
    "text": "You can choose components to use as the icons.\nE.g. you could use a star as the rating icon\nand an empty component as the 'empty rating' icon.",
    "height": 40,
    "paddingTop": 20,
  },
  {
    "type": "label",
    "text": "Custom rating icon:"
  },
	{
    "type": "component-picker",
    "id": "customComponent_full",
    "actionBinding": "this.onUIChange"
  },
	{
    "type": "label",
    "text": "Custom icon for empty rating:"
  },
	{
    "type": "component-picker",
    "id": "customComponent_empty",
    "actionBinding": "this.onUIChange"
  }
];

this._uiTextFields = [];
this._uiCheckboxes = [ 'readonly' ];
this._uiNumberFields = [ 'minValue', 'maxValue', 'iconType' ];
this._uiColorPickers = [ 'color' ];
this._uiComponentPickers = [ 'customComponent_full', 'customComponent_empty' ];

this._accessorForDataKey = function(key) {
  if (this._uiTextFields.includes(key)) return 'text';
  else if (this._uiCheckboxes.includes(key)) return 'checked';
  else if (this._uiNumberFields.includes(key)) return 'numberValue';
  else if (this._uiColorPickers.includes(key)) return 'rgbaArrayValue';
  else if (this._uiComponentPickers.includes(key)) return 'componentName';
  return null;
}

this.onCreateUI = function() {
  var ui = this.getUI();
  for (var controlId in this._data) {
    var prop = this._accessorForDataKey(controlId);
    if (prop) {
      try {
      	ui.getChildById(controlId)[prop] = this._data[controlId];
      } catch (e) {
        console.log("** can't set ui value for key "+controlId+", prop "+prop);
      }
    }
  }
}

this.onUIChange = function(controlId) {
  var ui = this.getUI();
  var prop = this._accessorForDataKey(controlId);
  if (prop) {
    this._data[controlId] = ui.getChildById(controlId)[prop];
  } else {
    console.log("** no data property found for controlId "+controlId);
  }
}


// -- plugin preview --

this.renderIcon = function(canvas) {
  this._renderPreview(canvas, null, true, 5);
};

this.renderEditingCanvasPreview = function(canvas, controller) {
  this._renderPreview(canvas, controller, false, this._data.maxValue - this._data.minValue);
}

this._renderPreview = function(canvas, controller, fitToWidth, numIcons) {
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  ctx.save();
  
  var scale = 1;
  if (controller && controller.renderPixelsPerWebPixel) {
    scale = controller.renderPixelsPerWebPixel;
    ctx.scale(scale, scale);
  }
	
	var customIcon_full = this.getComponentPreviewImage(this._data.customComponent_full);
	var customIcon_empty = this.getComponentPreviewImage(this._data.customComponent_empty);
  
  var color = "rgba(0, 0, 0, 0.75)";
  ctx.fillStyle = color;
  ctx.strokeStyle = color;
  
  ctx.strokeWidth = scale * 0.7;

  var xMargin = 1;
  var yMargin = 2;
  var spacing = 3;
  var r;
  if (fitToWidth) {
    r = (w - 2*xMargin - (numIcons-1)*spacing) / numIcons / 2;
    yMargin = h/2 - r;
  } else {
    r = 9;
  }
  
  var x = xMargin + r;
  var y = yMargin + r;
  for (var i = 0; i < numIcons; i++) {
    var w = r*2 + spacing;
		var icon = null;
		if (numIcons > 1 && i === numIcons - 1) {
			icon = customIcon_empty;
		}
		if ( !icon) {
			icon = customIcon_full;
		}
		if (icon) {
			var iconW = icon.width/scale;
			var iconH = icon.height/scale;
			ctx.drawImage(icon, x-r, y-r, iconW, iconH);
          
          if ( !fitToWidth) 
            w = iconW;
		} else {
          /*
          // draw filled circle with outline
	      ctx.beginPath();
	      ctx.arc(x, y, r, 0, Math.PI*2, false);
	      ctx.stroke();
	      ctx.beginPath();
	      ctx.arc(x, y, r - 2, 0, Math.PI*2, false);
	      ctx.fill();
          */
          // draw star
          ctx.beginPath();
          ctx.moveTo(x, y - r);
          for (var k = 1; k < 10; k++) {
            var t = -Math.PI/2 + (k/5 * Math.PI);
            var rp = (k % 2 == 1) ? r*0.4 : r;
            ctx.lineTo(x + rp*Math.cos(t), y + rp*Math.sin(t));
          }
          if (i < numIcons - 1) {
            ctx.fill();
          }
          ctx.closePath();
          ctx.stroke();
		}
    
    x += w;
  }

  ctx.restore();
}


// -- code generation, React web --

this.getReactWebPackages = function() {
  // Return dependencies that need to be included in the exported project's package.json file.
  // Each key is an npm package name that must be imported, and the value is the package version.
  // 
  // Example:
  //    return { "somepackage": "^1.2.3" }
  
  return {
    "react-rating": "^1.1.0"
  };
}

this.getReactWebImports = function(exporter) {
	var arr = [
    { varName: "Rating", path: "react-rating" }
  ];
	
	var customComp_full = exporter.classNameForComponentByName(this._data.customComponent_full);
	if (customComp_full) {
		arr.push({ varName: customComp_full, path: `./${customComp_full}` });
	}
	var customComp_empty = exporter.classNameForComponentByName(this._data.customComponent_empty);
	if (customComp_empty && customComp_empty != customComp_full) {
		arr.push({ varName: customComp_empty, path: `./${customComp_empty}` });
	}
	
	return arr;
}

this.writesCustomReactWebComponent = false;

this.reactWebDataLinkKeys = [
	"value"
];

this.reactWebInteractions = [
	"valueChange"  // This is the id for the default interaction available to plugins in React Studio
];

this.describeReactWebInteraction = function(exporter, interactionId) {
	switch (interactionId) {
		case 'valueChange':
			return {
				actionMethod: {
					arguments: ['rating'],
					getDataExpression: 'rating'
				}
			};
	}
	return null;
}

this.getReactWebJSXCode = function(exporter) {
  var min = this._data.minValue;
  var max = this._data.maxValue;
  var readonly = this._data.readonly;
  
  var jsx = `<Rating readonly={${readonly}} start={${min}} stop={${max}}`;

  var valueLinkage = exporter.getExpressionForLinkKey('value');
  if (valueLinkage) {
    jsx += ` initialRating={parseInt(${valueLinkage})}`;
  }
  
  var onValueChange = exporter.getCallbackForInteraction('valueChange');
  if (onValueChange) {
	jsx += ` onChange={${onValueChange}}`;
  }
  
  var customComp = exporter.classNameForComponentByName(this._data.customComponent_full);
  if (customComp) {
    jsx += ` fullSymbol={<${customComp} locStrings={this.props.locStrings} />}`;
  } else {
    jsx += " fullSymbol={<div style={{fontSize:18, width:20, height:20}}>★</div>}";
  }
  
  customComp = exporter.classNameForComponentByName(this._data.customComponent_empty);
  if (customComp) {
    jsx += ` emptySymbol={<${customComp} locStrings={this.props.locStrings} />}`;
  } else {
    jsx += " emptySymbol={<div style={{fontSize:17, width:20, height:20}}>☆</div>}";
  }
		
  jsx += ` />`;
  return jsx;
}

