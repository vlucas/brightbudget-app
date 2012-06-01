/**
 * UI Elements
 */
var ns = {};
var cfg = require('/tin/config');

// Window creation helper due to shitty JSS support for iPhone 
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

// Button with a localized title
ns.Button = function() {
  if (typeof arguments[0] === 'string') {
    return Ti.UI.createButton(cfg.extend('ui.Button', {
      title:L(arguments[0], arguments[0])
    },arguments[1]||{}));
  } else {
    return Ti.UI.createButton(cfg.extend('ui.Button', arguments[0]));
  }
};

// Image with more intelligent defaults
ns.ImageView = function(img,args) {
  return Ti.UI.createImageView(cfg.extend('ui.ImageView', {
    image:img,
    height:'auto',
    width:'auto'
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

// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}