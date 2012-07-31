var testCase = require('nodeunit').testCase;
var handleWrapper = require('../main').handleWrapper;

function factory(initializeNotification, cleanupNotification) {

  var instance = { initialize: initialize, cleanup: cleanup };
  var state = 'uninitialized';
  return instance;

  function initialize(callback) {
    // Complete initialization asynchronously.
    process.nextTick(function () {
      // Initialization completes asynchronously, but everything created
      // during initialization can be used in cleanup.
      initializeNotification(state);
      state = 'initialize completed';
      callback();
    });
    state = 'initialize called';
  }

  function cleanup(callback) {
    // Cleanup always called after initialize and hence can be used
    cleanupNotification(state);
    state = 'cleanup completed';
    callback();
  }
}

function handleFactory(initializeNotification, cleanupNotification) {
  return handleWrapper(factory(initializeNotification, cleanupNotification));
}

module.exports = testCase({

  handletest: function (test) {
    var step = 'bla';
    var handle = handleFactory(function (state) {
      test.equal(state, 'initialize called');
      step = state;
    }, function (state) {
      test.equal(state, 'initialize completed');
      step = state;
    });
    test.equal(step, 'bla');
    handle.close(function () {
      test.equal(step, 'initialize completed');
      test.done();
    });
    test.equal(step, 'bla');
  }

});