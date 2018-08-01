var config = require('./config.json');

var http = require('http');
var createHandler = require('github-webhook-handler');
var handler = createHandler({ path: '/webhook', secret: config.secret });
var async = require('async');
var child_process = require('child_process');

var projects = new Array();
async.eachSeries(config.projects, function(json, next) {
	projects.push(json);

    console.log('Added project: ' + json.name);

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
  			async.series([
  				function(next) {
                    if(project.directory) {
                        var exec = child_process.exec('cd ' + project.directory + ' && git reset --hard && git pull');
                        exec.stdout.on('data', () => {
                            console.log('[' + project.name + ']: ' + data);
                        })
                        exec.on('exit', function () {
                            next();
                        });
                        exec.on('error', err => {
                            console.log("[" + project.name + "]:", err);
                        });
                    } else {
                    	next();
					}
				},

				function(next) {
                    if(project.commands) {
                        async.eachSeries(project.commands, function(command, next) {
                            console.log('executing command ' + command);

                            var exec = child_process.exec(command);
                            exec.stdout.on('data', () => {
                                console.log('[' + project.name + ']: ' + data);
                            })
                            exec.on('exit', function() {
                                next();
                            });
                            exec.on('error', err => {
                                console.log("[" + project.name + "]:", err);
                            });
                        }, function(err) {
                        	next();
						})
                    } else {
                    	next();
					}
				},

				function(next) {
                    console.log('Processed ' + event.payload.repository.full_name);
                    next();
				}
			])
  		} else {
  			next();
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