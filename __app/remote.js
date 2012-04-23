// https://gist.github.com/1740741
var http = require('http')
  , request = http.IncomingMessage.prototype;

/**
 * Add a uniform interface for remote address in Node.js
 *
 * @api private
 */

request.__defineGetter__('remote', function remote () {
  var connection = this.connection
    , headers = this.headers
    , socket = connection.socket;

  // return early if we are behind a reverse proxy
  if (headers['x-forwarded-for']) {
    return {
        ip: headers['x-forwarded-for']
      , port: headers['x-forwarded-port']
    }
  }

  // regular HTTP servers
  if (connection.remoteAddress) {
    return {
        ip: connection.remoteAddress
      , port: connection.remotePort
    };
  }

  // in node 0.4 the remote address for https servers was in a different
  // location
  if (socket.remoteAddress) {
    return {
        ip: socket.remoteAddress
      , port: socket.remotePort
    };
  }

  // last possible location..
  return {
      ip: this.socket.remoteAddress || '0.0.0.0'
    , port: this.socket.remotePort || 0
  }
});