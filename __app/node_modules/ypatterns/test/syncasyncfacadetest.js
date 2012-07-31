var testCase = require('nodeunit').testCase;
var syncasyncFacade = require('../main').syncasyncFacade;

function originalFactory(param1, param2) {

  return { create: createInstance, initializeAsync: initializeAsync, initializeSync: initializeSync };

  function createInstance() {
    var instance = {
      fn: function (param) {
        this.p3 = param;
        return this.data;
      },
      initsync: 0
    }
    instance.__defineGetter__("value", function () { return this._value; });
    instance.__defineSetter__("value", function (val) { this._value = 'via setter ' + val; });
    return instance;
  }

  function initializeAsync(obj, callback) {
    // Complete initialization asynchronously.
    process.nextTick(function () {
      obj.p1 = param1;
      obj.p2 = param2;
      obj.data = 'async';
      callback();
    });
  }

  function initializeSync(obj) {
    obj.p1 = param1;
    obj.p2 = param2;
    obj.data = 'sync';
    obj.initsync++;
  }
}

function facadedFactory(param1, param2, callback) {
  var factory = originalFactory(param1, param2);
  return syncasyncFacade(factory, callback);
}

module.exports = testCase({

  sync: function (test) {
    var obj = facadedFactory('p1', 'p2');
    test.equal(obj.fn('p3'), 'sync');
    test.equal(obj.p1, 'p1');
    test.equal(obj.p2, 'p2');
    test.equal(obj.p3, 'p3');
    test.equal(obj.initsync, 1);
    test.done();
  },

  async: function (test) {
    var obj = facadedFactory('p1', 'p2', function () {
      test.equal(obj.fn('p3'), 'async');
      test.equal(obj.p1, 'p1');
      test.equal(obj.p2, 'p2');
      test.equal(obj.p3, 'p3');
      test.equal(obj.initsync, 0);
      test.done();
    });
  },

  dual: function (test) {
    var obj = facadedFactory('p1', 'p2', function () {
      test.equal(obj.fn('p3'), 'async');
      test.equal(obj.p1, 'p1');
      test.equal(obj.p2, 'p2');
      test.equal(obj.p3, 'p3');
      test.equal(obj.initsync, 1);
      test.done();
    });
    test.equal(obj.fn('p4'), 'sync');
    test.equal(obj.p1, 'p1');
    test.equal(obj.p2, 'p2');
    test.equal(obj.p3, 'p4');
  },

  gettersetter: function (test) {
    var obj = facadedFactory('p1', 'p2');
    obj.value = 'something';
    test.equal(obj.value, 'via setter something');
    test.equal(obj.data, 'sync');
    test.equal(obj.initsync, 1);
    test.done();
  }
});