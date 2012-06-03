
// Require Titanium Nitride (TiN)
//var tin = require('/tin/lib');
var api = require('/tin/api');

// Master background color
Ti.UI.setBackgroundColor('#fff');

// Start API App at API root 
api.app('http://localhost/brightb.it/budgetapp/').open();
