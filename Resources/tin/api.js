/**
 * API Automation for Hypermedia APIs
 */
var ns = {};
var tin = require('/tin/lib');
var cfg = require('/tin/config');
var ui = require('/tin/ui');

// Main app screen (starting point from root API)
ns.app = function(baseUrl) {
  // Base window
  var win = ui.Window({
    layout: 'vertical'
  });
  
  // Heading
  var lblHead = ui.LabelH1('Links');
  win.add(lblHead);
  
  // Need to access ajax stuff
  tin.ajax({
    url: baseUrl,
    method: 'GET',
    success: function(xhr) {
      try {
        var data = JSON.parse(xhr.responseText);
      } catch(e) {
        var data = {};
      }
      
      // Look for links in response JSON
      if(data.hasOwnProperty('_links')) {
        linksView = ns.listLinks(data._links);
        win.add(linksView);
      }
      
      // List 'items' if present
      /*
      if(data.hasOwnProperty('items')) {
        linksView = ns.listItems(data.items);
        win.add(linksView);
      }
      */
    }
  });
  
  // Return window
  return win;
};

ns.listLinks = function(links) {
  // Base view
  var view = ui.View({
    layout: 'horizontal'
  });
  
  // Buttons  
  var btns = [];
  for(linkName in links) {
    var link = links[linkName];
    
    // Button
    btns[linkName] = ui.Button(linkName, {
      _link: link
    });
    // Add click handler for button    
    btns[linkName].addEventListener('click', function(e) {
      alert('Clicked: ' + e.source._link.href);
    });
    
    // Add to view
    view.add(btns[linkName]);
  }
  
  // Return view
  return view;
};

ns.listItems = function(links) {
  // Base view
  var view = ui.View();
  
  var btns = [];
  for(linkName in links) {
    var link = links[linkName];
    
    btns[linkName] = ui.Button(linkName);
    btns[linkName]._link = link;
    btns[linkName].addEventListener('click', function(e) {
      alert('Clicked: ' + e.source._link.href);
    })
    // Add click handler
    view.add(btns[linkName]);
  }
  
  // Return view
  return view;
};

// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}