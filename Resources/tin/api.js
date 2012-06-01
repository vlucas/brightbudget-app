/**
 * API Automation for Hypermedia APIs
 */
var ns = {};
var cfg = require('/tin/config');
var ui = require('/tin/ui');

ns.App = function(baseUrl) {
  
};

// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}