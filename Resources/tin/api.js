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
var currentWin = baseWin;
var isFirstOpen = true;
var navGroup = false;
function _navOpen(win) {
  if(navGroup === false) {
    // Base navigation stack
    navGroup = ui.NavigationGroup({ window: win }); // @TODO Make Android compatible
    ns._getNavMenu();
    baseWin.add(navGroup);
    baseWin.open();
  } else {
    navGroup.open(win, { animated: true }); 
  }
}

// Set/get current active window
ns.setCurrentWin = function(win) {
  win.setZIndex(10); // Set above slide menu
  currentWin = win;
};
ns.getCurrentWin = function(win) {
  return currentWin;
};

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

  // Setup new window
  var win = ui.Window({
    layout: 'vertical',
    title: title || cfg.get('app.title')
  });
  ns.setCurrentWin(win);

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
      
      // Table data holder
      var tblData = [];
      
      // Look for links in response JSON
      if(data.hasOwnProperty('_links')) {
        if(isFirstOpen) {
          ns.listMenuLinks(data._links, {
            tableSection: { 
              headingTitle: L('Actions')
            }
          });          
        } else {
          // Links
          linkSection = ns.listLinks(data._links, {
            tableSection: { 
              headingTitle: L('Actions')
            }
          });
          tblData.push(linkSection);
        }
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
      
      // No longer first open after this
      isFirstOpen = false;
    },
    error: function(xhr) {
      var msg = xhr.status + ' Error';
      alert(msg);
      var msgView = ui.MessageView(msg);
      win.add(msgView);
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
    // Skip 'self' links (results in recursive navigation)
    if(linkName === 'self') {
      continue;
    }
    
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

var _navMenuWin = ui.WindowMenu({
  top:   0,
  left:  0,
  zIndex: 1
});
var _navMenuTable;
var _navMenuShowing = false;
// animations
var _navAnimateIn = Ti.UI.createAnimation({
    left: _navMenuWin.getWidth(),
    curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration: 400
});
var _navAnimateOut = Ti.UI.createAnimation({
    left: 0,
    curve: Ti.UI.ANIMATION_CURVE_EASE_OUT,
    duration: 400
});
ns._getNavMenu = function() {
  // Setup for first open
  if(isFirstOpen) {
    // Facebook-like menu window
    _navMenuTable = ui.TableMenu();
    _navMenuWin.add(_navMenuTable);
  
    // Add button to base window to open menu
    var btnMenuToggle = Ti.UI.createButton({
        image: 'images/icons/259-list-white.png'
    });
    ns.getCurrentWin().setLeftNavButton(btnMenuToggle);
    btnMenuToggle.addEventListener('click', function(e) {
      ns.navMenuToggle();
    });
    
    _navMenuWin.open();
  }
  
  return _navMenuWin;
};

ns.navMenuToggle = function() {
  if( !_navMenuShowing ){
    baseWin.animate(_navAnimateIn);
    _navMenuShowing = true;
  } else {
    baseWin.animate(_navAnimateOut);
    _navMenuShowing = false;
  }
}
    
ns.listMenuLinks = function(links, opts) {
  var opts = opts || {};
  
  ns._getNavMenu();
  
  // Links  
  var rows = [];
  for(linkName in links) {
    // Skip 'self' links (results in recursive navigation)
    if(linkName === 'self') {
      continue;
    }
    
    var link = links[linkName];
    var linkTitle = _.isUndefined(link.title) ? tin.ucwords(linkName) : link.title;

    // Table Row
    rows.push(ui.TableRowMenu(linkTitle, {
      hasChild: true,
      _title: linkTitle,
      _link: link
    }));
  }

  if(opts.tableSection) {
    var section = ui.TableSectionMenu(opts.tableSection);
    _.each(rows, function(row) {
      section.add(row);
    });
    
    _navMenuTable.setData([section]);
    
    // Table section click event
    section.addEventListener('click', function(e) {
      ns.linkClick(e.rowData._title, e.rowData._link);
    });
  } else {
    _navMenuTable.setData(rows);
    
    // Table row click event
    _navMenuTable.addEventListener('click', function(e) {
      ns.linkClick(e.rowData._title, e.rowData._link);
    });
  }
  
  return true;
};

// Main app screen (starting point from root API)
ns.Form = function(title, link, opts) {
  var opts = opts || {};
  // Base window
  var formWin = ui.Window({
    layout: 'vertical',
    title: title
  });
  ns.setCurrentWin(formWin);

  var fields = link.parameters;
  var evUpdate = 'tin.ui.listItems:update:' + title;

  // Base view for fields
  var formView = Ti.UI.createScrollView({
    top : 15,
    bottom : 15,
    left : 15,
    right : 15
  });

  // Add fields according to their definitions
  var inputs = [];
  var labels = [];
  var fieldViews = [];

  // Pickers
  var pickerSlideIn = Ti.UI.createAnimation({
    bottom : -43
  });
  var pickerSlideOut = Ti.UI.createAnimation({
    bottom : -251
  })

  // How big is a text field?
  var tTop = 0;
  var maxWidth = 150;
  var minWidth = 50;
  var tHeight = 40;
  var tWidth = maxWidth;
  var keyboardType = Ti.UI.KEYBOARD_DEFAULT;

  // Display options
  var showField = true;
  var showLabel = true;

  var i = 0;
  for(fieldName in fields) {
    var field = fields[fieldName];

    // Reset label and field display
    showField = true;
    showLabel = true;

    // How long is text field?
    tWidth = (parseInt(field.length) ? (parseInt(field.length) * 15) : maxWidth);
    
    // Max width
    if(tWidth > maxWidth) {
      tWidth = maxWidth;
    }
    // Min width
    if(tWidth < minWidth) {
      tWidth = minWidth;
    }

    switch(field.type) {
      case "bool":
      case "boolean":
        // Handle custom display for field
        showField = false;

        // Add boolean switch
        var fInput = Ti.UI.createSwitch({
          top : tTop,
          right : 0,
          value : false
        });
        inputs.push(fInput);
        formView.add(fInput);

        break;

      case "int":
      case "integer":
        keyboardType = Ti.UI.KEYBOARD_NUMBER_PAD;
        break;

      case "float":
      case "double":
      case "decimal":
      case "number":
        keyboardType = Ti.UI.KEYBOARD_NUMBERS_PUNCTUATION;
        break;

      case "email":
        keyboardType = Ti.UI.KEYBOARD_EMAIL;
        break;

      case "url":
        keyboardType = Ti.UI.KEYBOARD_URL;
        break;

      case "date":
      case "datetime":
        //alert("DateTime input type!");
        // Date & time picker
        showField = false;

        // Add text input
        var fInput = Ti.UI.createTextField({
          top : tTop,
          right : 0,
          width : tWidth,
          height : tHeight,
          borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
          enabled : false
        });
        inputs.push(fInput);
        formView.add(fInput);

        // Add click event to show picker options
        fInput.addEventListener('click', function(_e) {
          // Blur to hide keyboard
          fInput.blur();

          // Setup Date object to current day at 6:00pm
          var startDate = new Date();
          startDate.setHours(18, 0, 0, 0);

          // Show Datetime picker
          ns.DatePickerModal({
            defaultValue : startDate,
            type : field.type,
            done : function(date) {
              // Set input value
              fInput.value = date.format('yyyy-mm-dd HH:MM');
              //date; // Date selection to string
            }
          });
        });
        break;

      default:
        keyboardType = Ti.UI.KEYBOARD_ASCII;
        break;
    }

    // Check custom render callbacks
    // Usage: Callbacks should return boolean false if they are NOT doing any custom rendering
    if(opts.itemAddRenderLabel) {
      // Don't show default label if callback returns anything but false
      var rLabel = opts.itemAddRenderLabel(fieldName, field);
      if(false !== rLabel) {
        // Add elemenent to view
        rLabel.top = tTop;
        rLabel.left = 0;
        rLabel.width = 150;
        labels.push(fieldName);
        formView.add(rLabel);

        // Don't render default
        showLabel = false;
      }
    }

    if(showLabel) {
      // Add text label
      var fLabel = ui.LabelForm({
        top : tTop,
        left : 0,
        width : 150,
        height : 40,
        text : tin.ucwords(fieldName)
      });
      labels.push(fieldName);
      formView.add(fLabel);
    }

    // Check custom render callbacks
    // Usage: Callbacks should return boolean false if they are NOT doing any custom rendering
    if(opts.itemAddRenderField) {
      // Don't show default field if callback returns anything but false
      var rField = opts.itemAddRenderField(fieldName, field);
      if(false !== rField) {
        // Add elemenent to view
        rField.top = tTop;
        rField.right = 0;
        inputs.push(rField);
        formView.add(rField);

        // Don't render default
        showField = false;
      }
    }

    if(showField) {
      // Add text input
      var fInput = Ti.UI.createTextField({
        top : tTop,
        right : 0,
        width : tWidth,
        height : tHeight,
        borderStyle : Ti.UI.INPUT_BORDERSTYLE_ROUNDED,
        keyboardType : keyboardType
      });
      inputs.push(fInput);
      formView.add(fInput);
    }

    // Increment height as we go so fields don't overlap
    tTop += tHeight + 10;
    i++;
  }

  // Add submit button
  var btnSubmit = ui.Button('Save', {top : tTop });
  btnSubmit.addEventListener('click', function(e) {
    // Assemble all data
    var params = link.parameters || {};
    // For URL hash comparison
    var hashParams = JSON.stringify(params);
    for(var i = 0; i < inputs.length; i++) {
      params[labels[i]] = inputs[i].value;
    }

    // Handle add click to add new item
    tin.ajax({
      url : link.href,
      method : link.method,
      data : params,
      success : function(xhr) {
        // Success
        try {
          var data = JSON.parse(xhr.responseText);
        } catch(e) {
          var data = {};
        }

        // Fire success callback if set
        if(opts.success) {
          opts.success(data);
        }

        // Update table listing
        var purl = link.method + link.href + hashParams;
        Ti.API.fireEvent(evUpdate, {
          url : purl
        });

        // Free memory
        xhr = null;
        data = null;
        o = null;
        action = null;
        params = null;

        // Close window
        navGroup.close(formWin);
      },
      error : function(xhr) {
        // Show errors
        try {
          var data = JSON.parse(xhr.responseText);
        } catch(e) {
          var data = {};
        }

        var err = "";
        if(data.errors) {
          for(field in data.errors) {
            elen = data.errors[field].length;
            for(var i = 0; i < elen; i++) {
              err += data.errors[field][i] + "\n";
            }
          }
        }
        alert("Validation Errors:\n" + (err != "" ? err : "Unable to add new item"));
        
        // Fire callback if set
        if(opts.error) {
          opts.error(data);
        }

        // Free memory
        xhr = null;
        data = null;
      }
    });
  });
  formWin.add(formView);
  formView.add(btnSubmit);
  

  // Add view and return window
  _navOpen(formWin);
  return formWin;
};

// Action to take when clicking on a "_link" item
ns.linkClick = function(title, link, opts) {
  var opts = opts || {};
  tin.log(arguments);
  var method = _.isUndefined(link.method) ? 'GET' : link.method.toUpperCase();
  tin.log('Link Click: ' + title + ' (' + link.href + ')');
  
  // Hide nav menu if showing
  if(_navMenuShowing) {
    ns.navMenuToggle();
  }

  // Form parameters (JSONSchema style)
  if(!_.isUndefined(link.parameters)) {
    return ns.Form(title, link);
  }
  
  // If link method is 'GET'
  if(method === 'GET') {
    return ns.App(title, link.href);
  }

  // DELETE method
  if(method === 'DELETE') {
    tin.ajax({
      url: link.href,
      method: link.method,
      success: function(xhr) {
        navGroup.close(currentWin);
        // @TODO Refresh app view so item row dissapears (or remove row manually)
      },
      error: function(xhr) {
        alert('Unable to DELETE');
      }
    });
  }
  
  // Just here to log items that don't do anything (no logic handling above)
  tin.log('[Link Doing Nothing...]');
};

// Action to take when clicking on an "item" in a collection
ns.itemClick = function(title, item, opts) {
  var opts = opts || {};
  //tin.log('Item Click: ' + title + ' (' + item._links.self.href + ')');
  tin.log(item);
  
  // If item has a 'self' defined
  if(item._links && item._links.self && (_.isUndefined(item._links.self.method) || item._links.self.method.toUpperCase() === 'GET')) {
    return ns.App(title, item._links.self.href);
  }
  
  // Just here to log links that don't do anything (no logic handling above)
  tin.log('[Item Doing Nothing...]');
};

// ===============================================

// Export all the things! *\('o')|
for(prop in ns) {
  // Property names starting with '_' are private
  if(ns.hasOwnProperty(prop) && prop.indexOf('_') !== 0) {
    exports[prop] = ns[prop];
  }
}