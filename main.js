var app = require('electron').app;
const {BrowserWindow} = require('electron');



app.on('window-all-closed', function() {
  app.quit();
});

app.on('ready', function() {
  let mainWindow = new BrowserWindow({width: 1024, height: 768});
  mainWindow.loadURL('file://' + __dirname + '/browser/browser.html');
  //mainWindow.openDevTools();
});
