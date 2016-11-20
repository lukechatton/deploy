var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({ path: '/webhook', secret: 'myhashsecret' });
var async = require('async');
var child_process = require('child_process');

var config = require('./config.json');

var projects = new Array();
async.eachSeries(config.projects, function(json, next) {
	var data = {};
	data.name = json.name;
	data.directory = json.directory;
	console.log('Added project: ' + json.name + ' -> ' + json.directory);

	projects.push(data);

	next();
});

http.createServer(function (req, res) {
  handler(req, res, function (err) {
    res.statusCode = 404
    res.end('no such location')
  })
}).listen(config.port);

handler.on('error', function (err) {
  console.error('Error:', err.message)
});

handler.on('push', function (event) {
  console.log('Received a push event for %s',
    event.payload.repository.full_name);

  	async.eachSeries(projects, function(project, next) {
  		if(event.payload.repository.full_name.toLowerCase() == project.name.toLowerCase()) {
  			child_process.exec('cd ' + project.directory + ' && git pull');
  			console.log('updated ' + event.payload.repository.full_name);
  		}
  	})

});

handler.on('issues', function (event) {
  console.log('Received an issue event for %s action=%s: #%d %s',
    event.payload.repository.name,
    event.payload.action,
    event.payload.issue.number,
    event.payload.issue.title)
});