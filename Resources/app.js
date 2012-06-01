
// Require Titanium Nitride (TiN)
var tin = require('/tin/lib');

// Master background color
Ti.UI.setBackgroundColor('#000');

// Start API App at API root 
tin.api.App('http://localhost/brightb.it/budgetapp/').open();
