var app = require('electron').app,
	express = require('express'),
	compiler = express();

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

compiler.listen(2157, function(){
	console.log("Express Server Started: " + 2157);

	app.on('ready', function() {
		let mainWindow = new BrowserWindow({width: 1024, height: 768});
		// mainWindow.loadURL('file://' + __dirname + '/browser/browser.html');
		mainWindow.loadURL('http://localhost:2157');
		//mainWindow.openDevTools();
	});
});

app.on('window-all-closed', function() {
	app.quit();
});