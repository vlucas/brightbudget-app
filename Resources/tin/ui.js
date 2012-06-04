/**
 * UI Elements
 */
var ns = {};
var tin = require('/tin/lib');
var cfg = require('/tin/config');

// Helper functions for object positioning
var _displayCaps = Ti.Platform.displayCaps;
ns.platformWidth = _displayCaps.platformWidth;
ns.platformHeight = _displayCaps.platformHeight;

// Pixel width assuming 320px dimension
ns.x = function(p) {
  var size = p;
  var xe = 320;
  var xp = _displayCaps.platformWidth;
  if(ns.isAndroid() || xe != xp) {
    var pct = (p/xe); // percentage of 320 width
    return Math.floor(xp * pct);
  }
  //Ti.API.info('X size ' + p + ' to ' + size);
  return size;
}

// Pixel height assuming 480px dimension
ns.y = function(p) {
  var size = p;
  var ye = 480;
  var yp = _displayCaps.platformHeight;
  if(ns.isAndroid() || ye != yp) {
    var pct = (p/ye); // percentage of 480 height
    size = Math.floor(yp * pct);
  }
  //Ti.API.info('Y size ' + p + ' to ' + size);
  return size;
}

// Ensure max length for field
ns.ensureMaxLength = function(e) {
  var maxlength = e.source.maxLength || 254;
  if(e.value.length > maxlength) {
    e.source.value = e.value.substr(0, maxlength);
  }
};

// Window helper 
ns.Window = function(_props) {
    // Merge with default props
    var o = cfg.extend('ui.Window', _props);
    
    // Start looking for window URL in 'views' path
    if(o.url) {
      o.url = tin.path() + o.url;
    }
  var win = Ti.UI.createWindow(o);

  // Set orientation AFTER window creation for Android (not sure why it has to be done this way...)
  win.orientationModes = [
    Ti.UI.PORTRAIT,
    Ti.UI.UPSIDE_PORTRAIT
  ];

  return win;
};

// View object
ns.View = function(_props) {
  return Ti.UI.createButton(cfg.extend('ui.View', _props));
};

// Navigation Group object (currently iOS ONLY)
ns.NavigationGroup = function(_props) {
  var nav = Ti.UI.iPhone.createNavigationGroup(cfg.extend('ui.NavigationGroup', _props));
  return nav;
};

// Table object
ns.Table = function(_props) {
  var tbl = Ti.UI.createTableView(cfg.extend('ui.Table', _props));
  return tbl;
};

// Table object, 'GROUPED' style (with fallback to Table for non-iOS)
ns.TableGroup = function(_props) {
  var tbl = Ti.UI.createTableView(cfg.extend('ui.TableGroup', _props));
  if(tin.isiOS()) {
    tbl.style = Ti.UI.iPhone.TableViewStyle.GROUPED;
  }
  return tbl;
};

// Table Section to go within a table object
ns.TableSection = function(_props) {
  if (typeof arguments[0] === 'string') {
    var o = cfg.extend('ui.TableSection', { headerTitle: L(arguments[0], arguments[0]) }, arguments[1] || {});
  } else {
    var o = cfg.extend('ui.TableSection', arguments[0]);
  }
  return Ti.UI.createTableViewSection(o);
};

// TableRowViw object
ns.TableRow = function(/* [title,] options */) {
  var rowLabel = false;
  if (typeof arguments[0] === 'string') {
    var rowLabel = ns.LabelTableRowTitle(arguments[0]);
    var o = arguments[1] || {};
  } else {
    var o = arguments[0];
  }
  var row = Ti.UI.createTableViewRow(cfg.extend('ui.TableRow', { height: 40 }, o));
  
  if(rowLabel) {
    row.add(rowLabel);
  }
  
  var borderTopColor = false;
  if(borderTopColor = cfg.get('ui.TableRow.borderTopColor', false)) {
    // Top border
    var topBorder = Ti.UI.createView({
      top: 0,
      width: tin.platformWidth + 20, // Not sure why it has to be wider than the viewport here...
      height: 1,
      backgroundColor: borderTopColor
    });
    row.add(topBorder);
  }

  // Bottom border
  var borderBottomColor = false;
  if(borderBottomColor = cfg.get('ui.TableRow.borderBottomColor', false)) {
    var bottomBorder = Ti.UI.createView({
      bottom: 0,
      width: tin.platformWidth + 20, // Not sure why it has to be wider than the viewport here...
      height: 1,
      backgroundColor: borderBottomColor
    });
    row.add(bottomBorder);
  }

  return row;    
};

// Button with a localized title
ns.Button = function() {
  if (typeof arguments[0] === 'string') {
    return Ti.UI.createButton(cfg.extend('ui.Button', { title: L(arguments[0], arguments[0]) }, arguments[1]||{}));
  } else {
    return Ti.UI.createButton(cfg.extend('ui.Button', arguments[0]));
  }
};

// Image with more intelligent defaults
ns.ImageView = function(img,args) {
  return Ti.UI.createImageView(cfg.extend('ui.ImageView', {
    image: img,
    height: 'auto',
    width: 'auto'
  }, args||{}));
};

ns.MessageView = function(msg) {
  var viewMsg = Ti.UI.createView({
    left : _x(30),
    right : _x(30),
    top : _y(80),
    bottom : _y(80),
    backgroundColor : '#fff',
    borderRadius : 6,
    borderColor : '#333',
    borderWidth : 1,
    opacity : 0.8
  });
  var lblMsg = Ti.UI.createLabel({
    left : _x(20),
    right : _x(20),
    top : _y(20),
    bottom : _y(20),
    text : msg,
    color : '#222',
    font : {
      fontSize : _y(16),
      fontWeight : 'bold'
    },
    shadowColor : '#ddd',
    shadowOffset : {
      x : 0,
      y : -1
    },
    textAlign : 'center'
  });
  viewMsg.add(lblMsg);
  return viewMsg;
};

// Label helper
ns.Label = function() {
  if (typeof arguments[0] === 'string') {
    var o = cfg.extend('ui.Label', { text: L(arguments[0], arguments[0]) }, arguments[1] || {});
  } else {
    var o = cfg.extend('ui.Label', arguments[0]);
  }
  return Ti.UI.createLabel(o);
};
// Label helper H1
ns.LabelH1 = function(text, _props) {
  var lbl = ns.Label.apply(this, arguments);
  return tin.extend(lbl, cfg.extend('ui.LabelH1', _props));
};
// Label helper H2
ns.LabelH2 = function(text, _props) {
  var lbl = ns.Label.apply(this, arguments);
  return tin.extend(lbl, cfg.extend('ui.LabelH2', _props));
};
// Label helper small
ns.LabelSmall = function(text, _props) {
  var lbl = ns.Label.apply(this, arguments);
  return tin.extend(lbl, cfg.extend('ui.LabelSmall', _props));
};
ns.LabelTableRowTitle = function(text, _props) {
  var lbl = ns.Label.apply(this, arguments);
  return tin.extend(lbl, cfg.extend('ui.LabelTableRowTitle', _props));
}; 

// WebView helper
ns.WebView = function(_props) {
  // Merge with default props
  var o = cfg.extend('ui.WebView', _props);
  var webView = Ti.UI.createWebView(o);

  if(tin.isiOS()) {

  }
  
  // Inject CSS file if specified
  // @link http://stackoverflow.com/questions/6920081/css-injection-in-uiwebview
  if(o.cssFile) {
    webView.addEventListener('load', function () {
      // Read the css content from styles.css
      var cssContent = Ti.Filesystem.getFile(Ti.Filesystem.resourcesDirectory + o.cssFile);
      var cssContentString = JSON.stringify(String(cssContent.read()));

      // Create the style element with the css content to inject
      webView.evalJS("var s = document.createElement('style'); s.setAttribute('type', 'text/css'); s.innerHTML = " + cssContentString + "; document.getElementsByTagName('head')[0].appendChild(s);");
    });
  }

  return webView;
};

// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}