/*
 React Studio wrapper for the 'react-lottie-player' npm package.

 - 2020 / Nipun Khanna / @2nipun / automedia.ai 

. v1.1
. Lottie Icon from https://github.com/ascora/LottieSharp 

 */


// -- plugin info requested by host app --

this.describePlugin = function(id, lang) {
  switch (id) {
    case 'displayName':
      return "Lottie";

    case 'shortDisplayText':
      return "Embed Lottie files";

    case 'defaultNameForNewInstance':
      return "lottie";
  }
}

// This is all data for the plugin 
// -- private variables --

this._data = {
  lottieJson: '', 
  // loop:'true',
  // play : 'true', 
  speed: 1, 
};



// OFFICIAL dont touch 
// -- persistence, i.e. saving and loading --

this.persist = function() {
  return this._data;
}

this.unpersist = function(data) {  
  this._data = data;
}


// WHAT you see in settings in React Studio
// -- inspector UI --

this.inspectorUIDefinition = [
  {
    "type": "label",
    "text": "Paste the Lottie JSON below. \nSelect the speed (1=100%) \nDimensions come from React Studio canvas \nFile auto plays and loops infinitely",
    "height": 40,
  },
  {
    "type": "numberinput",
    "id": "speed",
    "label": "Speed",
    "min": 0.1,
    "max": 10,
    "increment": 0.1,
    "actionBinding": "this.onUIChange"
  },
  // {
  //   "type": "checkbox",
  //   "id": "loop",
  //   "actionBinding": "this.onUIChange"
  // },
  // {
  //   "type": "checkbox",
  //   "id": "play",
  //   "actionBinding": "this.onUIChange"
  // },
    {
    "type": "textinput",
    "id": "lottieJson", // MAKE SURE THIS is same as teh variable name in this._data{}
    "label": "Paste JSON from Lottie file",
    "actionBinding": "this.onUIChange",
    "multiline": true, 
    "height": 500,  // HEIGHT of component in RS 
    // "paddingTop": 10,
  }
];

// ACTUAL Settings declared 
this._uiTextFields = [ 'lottieJson' ];
this._uiCheckboxes = [];
// this._uiCheckboxes = ['loop', 'play'];
this._uiNumberFields = ['speed'];
this._uiColorPickers = [];
this._uiComponentPickers = [];

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
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  ctx.save();
  if (this.icon == null) {
    // got the YouTube logo online
    var path = Plugin.getPathForResource("logo.png");  // LOGO image 
    this.icon = Plugin.loadImage(path);
  }
  var iconW = this.icon.width;
  var iconH = this.icon.height;
  var aspectScale = Math.min(w/iconW, h/iconH);
  var scale = 0.9 * aspectScale; // add some margin around icon
  iconW *= scale;
  iconH *= scale;
  ctx.drawImage(this.icon, (w-iconW)*0.5, (h-iconH)*0.5, iconW, iconH);
  ctx.restore();
};

// WHAT shows in the RS area after dragging component 
this.renderEditingCanvasPreview = function(canvas, controller) {
  this._renderPreview(canvas, controller);
}

// REAL preview if needed to show while in dev
this._renderPreview = function(canvas, controller) {
  var ctx = canvas.getContext('2d');
  var w = canvas.width;
  var h = canvas.height;
  ctx.save();

  if (this.icon == null) {
    var path = Plugin.getPathForResource("logo.png");
    this.icon = Plugin.loadImage(path);
  }
  var iconW = this.icon.width;
  var iconH = this.icon.height;
  var aspectScale = Math.min(w/iconW, h/iconH);
  var scale = 0.9 * aspectScale; // add some margin around icon
  iconW *= scale;
  iconH *= scale;
  ctx.drawImage(this.icon, (w-iconW)*0.5, (h-iconH)*0.5, iconW, iconH);
  ctx.restore();

}


// ACTUALLY TELLING REACT WHERE TO PULL COMPONENT FROM 

// -- code generation, React web --

this.getReactWebPackages = function() {
  // Return dependencies that need to be included in the exported project's package.json file.
  // Each key is an npm package name that must be imported, and the value is the package version.
  
  return {
    "react-lottie-player": "^1.0.1"  // FROM NPM JS, name of package and version
  };
}

this.getReactWebImports = function(exporter) {
  var arr = [
    { varName: "LottieController", path: "react-lottie-player" }
  ];
  
  return arr;
}

this.writesCustomReactWebComponent = false;

this.getReactWebJSXCode = function(exporter) {  
  const lottieJson = this._data.lottieJson; // FROM Variable declared at top  
  // const loop = this._data.loop;
  // const play = this._data.play;
  const speed = this._data.speed; 
  var jsx = `<LottieController
        play
        loop
        speed = {${speed}}
        animationData={${lottieJson}}
        style={{ width: '100%', height: '100%' }} />`;
  return jsx;
}

