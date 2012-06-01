// Configuration file for TiN
var ns = {};
var cfg = {};
var _ = require('/lib/underscore');

// UI config
cfg.ui = {
  Window: {
    backgroundColor: '#000'
  },
  Button: {
    color: '#222',
    backgroundColor: '#000'
  }
};

// ===============================================
// DO NOT EDIT BELOW THIS LINE (NO CONFIG OPTIONS)
// ===============================================

// GET config key by period-separated path
ns.get = function(key, def) {
  var def = def || null;
  var res = def;
  var keys = key.split('.');
  var cfgVal = cfg;
  for(k in keys) {
    var k = keys[k];
    if(_.isUndefined(cfgVal[k])) {
      return def;
    } else {
      cfgVal = cfgVal[k];
    }
  }
  return cfgVal;
};

// Return config object with second object mixed in (style overrides)
ns.extend = function(/* key, obj */) {
  var args = Array.prototype.slice.call(arguments);
  // Get 'key' (1st argument), pass it through 'get' fn above
  var cfgEl = ns.get(args.shift(), {});
  // Place returned value back at beginning of args array
  args.unshift(cfgEl);
  // Extend 'get' result with the remainder of objects passed in
  return _.extend.apply(this, args);
};

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}