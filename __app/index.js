var express = require('express');
var rebus = require('rebus')(process.env.ANODE_REBUS);
var cfg = rebus.value.farm['metrics.sys'];
var metrics = require('metricsd')({
  prefix: 'anodejs_org',
  host: cfg.host,
  port: cfg.port
});
require('./remote'); // implements `req.remote`

var server = express.createServer();

var hits = metrics.count('hits');

server.get('/analytics/hit', function(req, res) {

  console.info('%s - - "%s %s" "%s"',
    req.remote.ip,
    req.method,
    req.url,
    req.headers['user-agent']);

  hits.inc();

  res.end();
});

server.listen(process.env.PORT || 5000);
