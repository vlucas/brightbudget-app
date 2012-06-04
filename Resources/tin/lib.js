// All TiN functionality is namespaced here
var ns = {};
var cfg = require('/tin/config');
var _ = require('/lib/underscore');

// Application variables held in namespace
ns._vars = {};

// Loggers
ns.log = function(msg) {
  Ti.API.log(msg);
};

// Extend a given object with all the properties in passed-in object(s).
// Thanks Underscore.js
ns.extend = _.extend;

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

// Truncate string to specified character length
ns.truncate = function(_str, _length) {
  var length = _length || '50';
  var etc = '...';
  var str = (_str + '');
  if(str.length > length + etc.length) {
    return str.substring(0, length) + etc;
  } else {
    return str;
  }
};

// Uppercase the first character of every word in a string
ns.ucwords = function(str) {
  return (str + '').toLowerCase().replace(/_/g, ' ').replace(/^([a-z])|\s+([a-z])/g, function ($1) {
    return $1.toUpperCase();
  });
};

// Returns the number rounded to specified precision
// @link http://phpjs.org/functions/round
ns.round = function(value, precision, mode) {
  var m, f, isHalf, sgn; // helper variables
  precision |= 0; // making sure precision is integer
  m = Math.pow(10, precision);
  value *= m;
  sgn = (value > 0) | -(value < 0); // sign of the number
  isHalf = value % 1 === 0.5 * sgn;
  f = Math.floor(value);
 
  if (isHalf) {
    switch (mode) {
    case 'ROUND_HALF_DOWN':
      value = f + (sgn < 0); // rounds .5 toward zero
      break;
    case 'ROUND_HALF_EVEN':
      value = f + (f % 2 * sgn); // rouds .5 towards the next even integer
      break;
    case 'ROUND_HALF_ODD':
      value = f + !(f % 2); // rounds .5 towards the next odd integer
      break;
    default:
      value = f + (sgn > 0); // rounds .5 away from zero
    }
  }
 
  return (isHalf ? value : Math.round(value)) / m;
};


// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}