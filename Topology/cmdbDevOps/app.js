/*eslint-env node*/

//------------------------------------------------------------------------------
// node.js starter application for Bluemix
//------------------------------------------------------------------------------

// This application uses express as its web server
// for more info, see: http://expressjs.com
var express = require('express');


var mysql = require("mysql");
var con = mysql.createConnection({
  host: "159.8.41.178",
  user: "cmdb",
  password: "cmdb",
  database: "cmdb"
  //,debug: true
});


// cfenv provides access to your Cloud Foundry environment
// for more info, see: https://www.npmjs.com/package/cfenv
var cfenv = require('cfenv');

// create a new express server
var app = express();

// serve the files out of ./public as our main files
app.use(express.static(__dirname + '/public'));

// get the app environment from Cloud Foundry
var appEnv = cfenv.getAppEnv();

app.get('/list', function (req, res) {
	con.connect(function(err){
	  if(err){
		console.log('Error connecting to Db');
		return;
	  }
	  console.log('Connection established');
	});

	con.query('SELECT * FROM cmdb',function(err,rows){
	  if(err) throw err;
	  res.send(rows);
	});
})

app.get('/add', function (req, res) {
	var d = new Date();
	var n = d.getTime(); 
	var uniqueID = n/1000;
	con.connect(function(err){
	  if(err){
		console.log('Error connecting to Db');
		return;
	  }
	  console.log('Connection established');
	});

	
	if(req.query.servicename ) { servicename = req.query.servicename; } else { servicename="BlueCompute"; }
	if(req.query.serviceid )   { serviceid = req.query.serviceid; }     else { serviceid="1507"; }
	if(req.query.description ) { description = req.query.description; } else { description=""; }
	
	if(!req.query.appname) { console.log('ERR: No appname sent'); res.send('No appname sent'); return;}
	if(!req.query.apptype) { console.log('ERR: No apptype sent'); res.send('No apptype sent'); return;}
	if(!req.query.region ) { console.log('ERR: No region sent');  res.send('No region sent');  return;}
	if(req.query.appid )   { uniqueID = req.query.appid; }

	var component = { APPID: uniqueID, APPNAME: req.query.appname, 'APPTYPE':req.query.apptype, 'REGIONNAME':req.query.region, 'CLIENT':'CASE-DEV', 'SERVICENAME':servicename, 'SERVICEID':serviceid, 'DESCRIPTION':description};
	con.query('INSERT INTO cmdb SET ?', component, function(err,res){
	  if(err) throw err;
	  console.log('Last insert ID:', res.insertId);
	});

	con.query('SELECT * FROM cmdb',function(err,rows){
	  if(err) throw err;
	  console.log('Data received from Db:\n');
	  console.log(rows[rows.length-1]);
	  res.send(rows[rows.length-1]);

	});

})

// start server on the specified port and binding host
app.listen(appEnv.port, '0.0.0.0', function() {
  // print a message when the server starts listening
  console.log("server starting on " + appEnv.url);
});
