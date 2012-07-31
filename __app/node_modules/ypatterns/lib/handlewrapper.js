// Create handle for the object that can be used to trigger object's cleanup.
// Handle garantees that cleanup of object will be called after initialization.

var gate = require('./gatejs');

// Handle wrapper
// instance - object should expose the 'initialize' and 'cleanup' methods,
// each has only callback as a parameter.
module.exports = function (instance) {

  var initGate = gate();

  // Before starting initialization obtain gate entrance.
  // No need to check return code as the gate is new.
  initGate.enter();
  instance.initialize(function (err) {
    // Upon initialization completion, exit the gate. From now on the cleanup can be executed.
    // at any time. Before exiting the gate, cleanup was delayed until this moment.
    initGate.exit();
  });

  // Return handle.
  return { close: close };

  function close(callback) {
    // Close the initialization gate.
    // Upon completion, can be sure the initialization was done.
    // Now cleanup can operate on all objects initialization created.
    initGate.close(function () {
      instance.cleanup(callback);
    });
  }
}

