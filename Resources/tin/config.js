// Configuration file for TiN
var ns = {};
var cfg = {};
var _ = require('/lib/underscore');

// App
cfg.app = {
  title: 'Brightbudget'
}

// Font
cfg.font = {
  fontFamily : "Helvetica Neue",
  fontWeight : 'normal'
};

// UI config
cfg.ui = {
  Window: {},
  Button: {},
  Label:{
    font: _.extend(cfg.font, {})
  },
  LabelH1: {
    color: '#111',
    font: _.extend(cfg.font, {fontSize: 22, fontWeight: 'bold'}),
  },
  LabelH2: {
    font: _.extend(cfg.font, {fontSize: 18, fontWeight: 'bold'})
  },
  
  // Tables
  Table: {},
  TableRow: {}
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
  // Provide 'font' for defined base font
  args.unshift({font: ns.get('font', {})});
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