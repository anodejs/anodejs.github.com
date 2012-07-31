// Syncrhonous-asynchronous facade pattern.
// Create facade for objects to allow both syncrhonous and asyncrhonous usage.
// Modules which use this pattern expose externally factory like this:
// BlablaFactory(param1, param2, etc, callback) with instance return as factory return parameter.
// The normal asynchronous usage can safely call any methods on returned instance.
// Syncrhonous usage pattern can access methods upon factory return and not in completion callback.

// Facade factory.
// factory - original factory should implement:
//  - create - return an instance.
//  - initializeAsync(instance, callback) - asynchronous initializator.
//  - initializeSync(instance) - syncrhonous initializator.
// Synchronous initializator will be called only if instance is not initialized while one of its
// methods (including getters and setters)) is accessed.
module.exports = function (factory, callback) {

  var obj = factory.create();
  var methods = {};
  var getters = {};
  var setters = {};

  // Wrap all functions, getters and setters.
  for (var p in obj) {
    if (typeof (obj[p]) === 'function') {
      var fn = obj[p];
      methods[p] = fn;
      obj[p] = _wrapMethod(fn);
      continue;
    }
    var g = obj.__lookupGetter__(p);
    if (g) {
      getters[p] = g;
      obj.__defineGetter__(p, _wrapMethod(g));
      continue;
    }
    var s = obj.__lookupSetter__(p);
    if (s) {
      setters[p] = s;
      obj.__defineSetter__(p, _wrapMethod(s));
      continue;
    }
  }

  // Start asynchronous initialization from the factory.
  factory.initializeAsync(obj, function (err) {
    _unwrapInstance();
    // Call completion asynchounously to ensure factory return value can be used.
    process.nextTick(function () {
      if (callback) {
        callback(err);
      }
    });
  });

  // Return object with wrapped methods.
  return obj;

  // Unwrap instance so it will return to be as original.
  function _unwrapInstance() {
    // Restore original methods.
    for (var m in methods) {
      obj[m] = methods[m];
      delete methods[m];
    }
    for (var g in getters) {
      obj.__defineGetter__(g, getters[g]);
      delete getters[g];
    }
    for (var s in setters) {
      obj.__defineSetter__(g, setters[s]);
      delete setters[s];
    }
  }

  function _wrapMethod(fn) {
    return function () {
      // If get here, the method was called before initialization was completed.
      // Don't wait and perform synchronous initilization before executing the original method.
      factory.initializeSync(obj);
      // Now the instance is initialized for sure.
      _unwrapInstance();
      return fn.apply(this, arguments);
    }
  }
}

