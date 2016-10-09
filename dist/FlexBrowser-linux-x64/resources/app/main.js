const {Menu} = require('electron');

const template = [
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo'
      },
      {
        role: 'redo'
      },
      {
        type: 'separator'
      },
      {
        role: 'cut'
      },
      {
        role: 'copy'
      },
      {
        role: 'paste'
      },
      {
        role: 'pasteandmatchstyle'
      },
      {
        role: 'delete'
      },
      {
        role: 'selectall'
      }
    ]
  },
  {
    label: 'View',
    submenu: [
      {
        label: 'Reload',
        accelerator: 'CmdOrCtrl+R',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.reload()
        }
      },
      {
        label: 'Toggle Developer Tools',
        accelerator: process.platform === 'darwin' ? 'Alt+Command+I' : 'Ctrl+Shift+I',
        click (item, focusedWindow) {
          if (focusedWindow) focusedWindow.webContents.toggleDevTools()
        }
      },
      {
        type: 'separator'
      },
      {
        role: 'resetzoom'
      },
      {
        role: 'zoomin'
      },
      {
        role: 'zoomout'
      },
      {
        type: 'separator'
      },
      {
        role: 'togglefullscreen'
      }
    ]
  },
  {
    role: 'window',
    submenu: [
      {
        role: 'minimize'
      },
      {
        role: 'close'
      }
    ]
  },
  {
    role: 'help',
    submenu: [
      {
        label: 'Learn More',
        click () { require('electron').shell.openExternal('http://www.cognizantsoftwaresolutions.ca/flex') }
      }
    ]
  }
]

if (process.platform === 'darwin') {
  // const name = require('electron').remote.app.getName()
  template.unshift({
    label: 'Flex Browser',
    submenu: [
      {
        role: 'about'
      },
      {
        type: 'separator'
      },
      {
        role: 'services',
        submenu: []
      },
      {
        type: 'separator'
      },
      {
        role: 'hide'
      },
      {
        role: 'hideothers'
      },
      {
        role: 'unhide'
      },
      {
        type: 'separator'
      },
      {
        role: 'quit'
      }
    ]
  });
  // Edit menu.
  template[1].submenu.push(
    {
      type: 'separator'
    },
    {
      label: 'Speech',
      submenu: [
        {
          role: 'startspeaking'
        },
        {
          role: 'stopspeaking'
        }
      ]
    }
  )
  // Window menu.
  template[3].submenu = [
    {
      label: 'Close',
      accelerator: 'CmdOrCtrl+W',
      role: 'close'
    },
    {
      label: 'Minimize',
      accelerator: 'CmdOrCtrl+M',
      role: 'minimize'
    },
    {
      label: 'Zoom',
      role: 'zoom'
    },
    {
      type: 'separator'
    },
    {
      label: 'Bring All to Front',
      role: 'front'
    }
  ]
}

/* const menu = Menu.buildFromTemplate(template)

Menu.setApplicationMenu(menu)
 */

var app = require('electron').app,
	express = require('express'),
	compiler = express();
const config = require('./config');

var browser = require('jade').compileFile(__dirname + "/browser/templates/browser.jade");

compiler.use(express.static(__dirname + "/browser/static"));

const {BrowserWindow} = require('electron');

compiler.get('/', function(req, res, next){
  	try{
	  	var html = browser({
			title: 'index'
	  	});
		res.send(html);
  	}catch(e){
		next(e);
	}
});

let vMainWin;

compiler.listen(2157, function(){
	console.log("Express Server Started: " + 2157);
	app.on('ready', function() {
		const lastWindowState = config.get('lastWindowState');
		let mainWindow = new BrowserWindow({
            x: lastWindowState.x,
    		y: lastWindowState.y,
    		width: lastWindowState.width,
    		height: lastWindowState.height,
            titleBarStyle: 'hidden'
        });

		vMainWin = mainWindow;
		// mainWindow.loadURL('file://' + __dirname + '/browser/browser.html');
		mainWindow.loadURL('http://localhost:2157');
		//mainWindow.openDevTools();
	});
});

app.on('window-all-closed', function() {
	app.quit();
});

app.on('before-quit', () => {
  	if (!vMainWin.isFullScreen()) {
    	config.set('lastWindowState', vMainWin.getBounds()); //Set the window position and size to the last window position and size
 	}
});
