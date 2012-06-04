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
    navGroup = ui.NavigationGroup({ window: win });
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
ns.App = function(title, baseUrl, opts) {
  var opts = opts || {};
  // Base window
  var win = ui.Window({
    layout: 'vertical',
    title: title || cfg.get('app.title')
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
      
      // Create table
      var tblData = [];
      
      // Look for links in response JSON
      if(data.hasOwnProperty('_links')) {
        // Links
        linkSection = ns.listLinks(data._links, {
          tableSection: { 
            headingTitle: L('Actions')
          }
        });
        tblData.push(linkSection);
      }
      
      // List 'items' if present
      if(data.hasOwnProperty('items')) {
        // Items
        itemSection = ns.listItems(data.items, {
          tableSection: {
            headingTitle: L('Items')
          }
        });
        tblData.push(itemSection);
      }
      
      // Add table
      var tbl = ui.TableGroup({
        data: tblData
      });
      win.add(tbl);
    }
  });
  
  // Return window
  _navOpen(win);
  return win;
};

ns.listLinks = function(links, opts) {
  var opts = opts || {};
  
  // Links  
  var rows = [];
  for(linkName in links) {
    var link = links[linkName];
    var linkTitle = _.isUndefined(link.title) ? tin.ucwords(linkName) : link.title;

    if(opts.tableSection) {
      // Table Row
      rows.push(ui.TableRow(linkTitle, {
        hasDetail: true,
        _title: linkTitle,
        _link: link
      }));
    } else {
      // Button
      rows[linkName] = ui.Button(linkTitle, {
        width: ui.platformWidth - 20,
        _link: link
      });

      // Add click handler for button    
      rows[linkName].addEventListener('click', function(e) {
        ns.linkClick(e.source._title, e.source._link);
      });
    }
  }

  if(opts.tableSection) {
    var view = ui.TableSection(opts.tableSection);
    
    // Add click handler for table row    
    view.addEventListener('click', function(e) {
      ns.linkClick(e.row._title, e.row._link);
    });
  } else {
    // Base view
    var view = ui.View({
      layout: 'horizontal'
    });
  }
  
  _.each(rows, function(row) {
    view.add(row);
  });
  
  // Return view
  return view;
};

ns.listItems = function(links, opts) {
  var opts = opts || {};
  
  // Create table rows
  var rows = [];
  for(i in links) {
    var link = links[i];
    var relRowHandler = ns.relOpt(link, 'row');
    var linkRow = relRowHandler ? relRowHandler(link) : '[Item]';
    
    rowObj = {};
    if(typeof linkRow === 'string') {
      rowObj = ui.TableRow(linkRow);
      rowObj._title = linkRow;
      rowObj.hasChild = true;
    } else {
      rowObj = linkRow; // @TODO Ensure custom rows have a '_title' property
    }
    
    // Custom row properties
    rowObj._link = link;
    
    // Add row to table
    rows.push(rowObj);
  }
  
  if(opts.tableSection) {
    var tbl = ui.TableSection(opts.tableSection);
    _.each(rows, function(row) {
      tbl.add(row);
    });
  } else {
    var tbl = ui.Table({
      data: rows
    });
  }
  
  // Table row click event
  tbl.addEventListener('click', function(e) {
    ns.itemClick(e.rowData._title, e.rowData._link);
  });
  
  // Return table
  return tbl;
};

// Action to take when clicking on a "_link" item
ns.linkClick = function(title, link, opts) {
  var opts = opts || {};
  tin.log('Clicked: ' + title + ' (' + link.href + ')');

  // If link method is 'GET'
  if(_.isUndefined(link.method) || link.method.toUpperCase() === 'GET') {
    ns.App(title, link.href);
  }

  // @TODO DELETE method
};

// Action to take when clicking on an "item" in a collection
ns.itemClick = function(title, link, opts) {
  var opts = opts || {};
  tin.log('Clicked: ' + title + ' (' + link._links.self.href + ')');
  
};

// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}