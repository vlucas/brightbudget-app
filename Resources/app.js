
// Require Titanium Nitride (TiN)
//var tin = require('/tin/lib');
var api = require('/tin/api');

// Master background color
Ti.UI.setBackgroundColor('#fff');

// Start API App at API root 
api.App('Brightbudget', 'http://localhost/brightb.it/budgetapp/');






// Define specific item relation behaviors
api.rel('budget', {
  row: function(item) {
    return item.name;
  }
});
