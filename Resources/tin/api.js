/**
 * API Automation for Hypermedia APIs
 */
var ns = {};
var tin = require('/tin/lib');
var cfg = require('/tin/config');
var ui = require('/tin/ui');
var _ = require('/lib/underscore');

// Open Window in NavigationGroup controller
var baseWin = ui.Window({ title: cfg.get('app.title') });
var navGroup = false;
function _navOpen(win) {
  if(navGroup === false) {
    // Base tabgroup
    navGroup = Ti.UI.iPhone.createNavigationGroup({ window: win });
    baseWin.add(navGroup);
    baseWin.open();
  } else {
    navGroup.open(win, { animated: true }); 
  }
}

// Relation handler options
var _rels = [];
ns.rel = function(rel, opts) {
  _rels[rel] = opts;
};
// Get relation handler option by key
ns.relOpt = function(rel, opt, def) {
  var def = def || false;
  if(typeof rel !== 'string') {
    var relName;
    // Use rel.rel if set (object's rel type)
    if(rel.rel) {
      relName = rel.rel;
    }
    // Use rel._links.self.rel if set ('self' link rel type)
    if(rel._links && rel._links.self && rel._links.self.rel) {
      relName = rel._links.self.rel;
    }
    rel = relName;
  }
  if(_.isUndefined(_rels[rel]) || _.isUndefined(_rels[rel][opt])) {
    return def;
  } else {
    return _rels[rel][opt];
  };
};

// Main app screen (starting point from root API)
ns.App = function(baseUrl, opts) {
  var opts = opts || {};
  // Base window
  var win = ui.Window({
    layout: 'vertical',
    title: opts.title || cfg.get('app.title')
  });
  
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
        // Heading
        var lblHead = ui.LabelH1('Links');
        win.add(lblHead);
        
        // Links
        linksView = ns.listLinks(data._links);
        win.add(linksView);
      }
      
      // List 'items' if present
      if(data.hasOwnProperty('items')) {
        // Heading
        var lblHead = ui.LabelH1('Items');
        win.add(lblHead);
        
        // Items
        linksView = ns.listItems(data.items);
        win.add(linksView);
      }
    }
  });
  
  // Return window
  _navOpen(win);
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
    var linkTitle = _.isUndefined(link.title) ? tin.ucwords(linkName) : link.title;
    
    // Button
    btns[linkName] = ui.Button(linkTitle, {
      width: ui.platformWidth - 20,
      _link: link
    });
    // Add click handler for button    
    btns[linkName].addEventListener('click', function(e) {
      tin.log('Clicked: ' + e.source.title + ' (' + e.source._link.href + ')');
      
      // If link method is 'GET'
      if(_.isUndefined(e.source._link.method) || e.source._link.method.toUpperCase() === 'GET') {
        ns.App(e.source._link.href);
      }
      
      // @TODO DELETE method
    });
    
    // Add to view
    view.add(btns[linkName]);
  }
  
  // Return view
  return view;
};

ns.listItems = function(links, opts) {
  // Base view
  var tbl = ui.Table();
  
  var rows = [];
  for(i in links) {
    var link = links[i];
    var relRowHandler = ns.relOpt(link, 'row');
    var linkRow = relRowHandler ? relRowHandler(link) : '[Item]';
    
    if(typeof linkRow === 'string') {
      rows[linkName] = ui.TableRow(linkRow, { height: 60 });
    } else {
      rows[linkName] = linkRow;
    }
    rows[linkName]._link = link;
    
    // Add row to table
    tbl.add(rows[linkName]);
  }
  
  // Table row click event
  tbl.addEventListener('click', function(e) {
    tin.log('Clicked: ' + e.source.title + ' (' + e.source._link.href + ')');
  });
  
  // Return table
  return tbl;
};


// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}