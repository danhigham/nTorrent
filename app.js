
/**
 * Module dependencies.
 */

var express = require('express')
  , routes = require('./routes')
  , xmlrpc = require('xmlrpc')
  , util = require('util')
  , http = require('http');

var app = express();



app.configure(function(){
  app.set('port', process.env.VCAP_APP_PORT || 3000);
  app.set('views', __dirname + '/views');
  app.set('view engine', 'jade');
  app.use(express.favicon());
  app.use(express.logger('dev'));
  app.use(express.bodyParser());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(__dirname + '/public'));
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', routes.index);

app.get('/torrents', function(req, res) {
  var client = getClient();
  client.methodCall('download_list', [], function (error, value) {
    res.render('torrents', { downloads: value });
  });
});

app.get('/torrents/info', function(req, res) {
  var hash = req.query['hash'];
  var client = getClient();

  var calledBack = false;

  batch_commands(client, hash, ['d.base_filename', 'd.completed_bytes', 'd.size_bytes', 'd.up.rate', 'd.down.rate'], function (info) {
    res.json(info);
  });

});

app.get('/torrents/erase', function(req, res) {
  var hash = req.query['hash'];
  var client = getClient();
  client.methodCall('d.erase', [hash], function (error, value) {    
    res.redirect('/torrents');
  });
});


app.post('/torrents/add', function(req, res) {
  var url = req.body.url;
  var client = getClient();
  client.methodCall('load_start', [url], function (error, value) {    
    res.redirect('/torrents');
  });
});

function getClient() {
  return(xmlrpc.createClient({ host: '192.168.1.7', port: 80, path: '/RPC2'}));
}

function batch_commands(client, hash, commands, callback) {
  var mcParams = []
  var out = {}

  for (index in commands) {
    var cmd = commands[index];
    mcParams.push({'methodName': cmd, 'params': [hash]});
  }

  client.methodCall('system.multicall', [mcParams], function (error, value) {
    for (index in commands) {
      var cmd = commands[index];
      out[cmd] = value[index][0];
    }
    out['hash'] = hash;
    callback(out);
  });

  return out;
}

function send_command(client, hash, command, callback) {
  client.methodCall(command, [hash], function (error, value) {
    callback(command, value);
  });
}

http.createServer(app).listen(app.get('port'), function(){
  console.log("Express server listening on port " + app.get('port'));
});
