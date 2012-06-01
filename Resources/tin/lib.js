// All TiN functionality is namespaced here
var ns = {};
var cfg = require('/tin/config');
ns.ui = require('/tin/ui');

// Application variables held in namespace
ns._vars = {};

// Loggers
ns.log = function(msg) {
  Ti.API.log(msg);
};

// Extend a given object with all the properties in passed-in object(s).
// Thanks Underscore.js
ns.extend = function(obj) {
  each(slice.call(arguments, 1), function(source) {
    for (var prop in source) {
      obj[prop] = source[prop];
    }
  });
  return obj;
};

// Platform detection helpers
ns.osname = Ti.Platform.osname;
ns.isiOS = function() {
  return ('iphone' == ns.osname || 'ipad' == ns.osname || 'ios' == ns.osname);
};
ns.isiPhone = function() {
  return ('iphone' == ns.osname);
};
ns.isiPad = function() {
  return ('ipad' == ns.osname);
};
ns.isAndroid = function() {
  return ('android' == ns.osname);
};

// Get string setting from property storage or return null/default value
ns.getString = function(_name, _default) {
  if(!Ti.App.Properties.hasProperty(_name)) {
    return _default;
  }
  return Ti.App.Properties.getString(_name);
};
ns.getBool = function(_name, _default) {
  if(!Ti.App.Properties.hasProperty(_name)) {
    return _default;
  }
  return Ti.App.Properties.getBool(_name);
};

// AJAX/XHR method that mimmicks jQuery's
ns.ajax = function(_props) {
  // Merge given dict with default options
  var o = ns.extend({
    method: 'GET',
    url: null,
    data: false,
    contentType: 'application/json',
    timeout: 10000,

    // Ti API Options
    async: true,
    autoEncodeUrl: true,

    // Callbacks
    success: null,
    error: null,
    beforeSend: null,
    complete: null,
  }, _props || {});

  Ti.API.info("XHR " + o.method + ": \n'" + o.url + "'...");
  var xhr = Ti.Network.createHTTPClient({
    autoEncodeUrl: o.autoEncodeUrl,
    async: o.async
  });

  // URL
  xhr.open(o.method.toUpperCase(), o.url);
  
  // Request header
  xhr.setRequestHeader('Content-Type', o.contentType);

  if(o.beforeSend) {
    o.beforeSend(xhr);
  }
  
  // Errors
  xhr.setTimeout(o.timeout);
  xhr.onerror = function() {
    Ti.API.error('XHR "onerror" ['+this.status+']: '+this.responseText+'');
    if(null !== o.error) {
      return o.error(this);
    }
  };
  
  // Success
  xhr.onload = function() {
    // Log
    Ti.API.info('XHR "onload" ['+this.status+']: '+this.responseText+'');
    
    // Success = 1xx or 2xx (3xx = redirect)
    if(this.status < 400) {
      try {
        if(null !== o.success) {
          return o.success(this);
        }
      } catch(e) {
        Ti.API.error('XHR success function threw Exception: ' + e + '');
        return;
      }
    // Error = 4xx or 5xx
    } else {
      Ti.API.error('XHR error ['+this.status+']: '+this.responseText+'');
      if(null !== o.error) {
        return o.error(this);
      }
    }
  };
  
  // Send
  if(o.data) {
    Ti.API.info(o.data);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.send(o.data);
  } else {
    xhr.send();
  }

  // Completed
  if(null !== o.complete) {
    return o.complete(this);
  }
};

// Helper functions in global scope for object positioning
var _displayCaps = Ti.Platform.displayCaps;

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

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}