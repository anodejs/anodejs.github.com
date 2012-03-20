var fs = require('fs');

module.exports = function(files, callback) {
  var obj = new process.EventEmitter();

  var watches = [];
  
  files.forEach(function(file) {
    console.log('adding a watch for', file);
    watches.push(fs.watch(file, function(event, fn) {
      return obj.emit('change', event, fn);
    }));
  });

  obj.files = files;

  if (callback) {
    obj.on('change', callback);
  }

  return obj;
}