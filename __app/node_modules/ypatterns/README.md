# ypatterns

Miscellaneous programming patterns.

[![Build Status](https://secure.travis-ci.org/anodejs/node-ypatterns.png)](http://travis-ci.org/anodejs/node-ypatterns)

## Gate

This is the pattern of usage counter.
Anybody can enter the gate is the gate is not closed.
When gate is closed, nobody allowed entering. However, all those that are already inside, can exit the gate.
The completion of gate closure will be called when everybody left (exited the gate).

### Usage

```javascript
var gate = require('ypatterns').gate;
//...
if (gate.enter()) {
  //... entrance granted.
  //...
  gate.exit();
}
else {
  //... entrance is not allowed anymore, the gate is closed.
}
...
gate.close(function() {
  //... nobody is inside.
});
```

## Handle Wrapper

This pattern is for objects that exhibit handle-like facade. Upon instantiation, such objects return handle, which has
only method ```close```. Such facade is useful for object that are listeners and call for notifications.
To expose handle facade, one has to implement factory, which has ```initialize``` and ```cleanup``` methods.
The wrapper takes care to call cleanup only after initialization is completed.

### Definition

```javascript
var handleWrapper = require('ypatterns').handleWrapper;
//...
function factory(...) {
  function initialize(callback) {
    //...
  }
  function cleanup(callback) {
    //...
  }
  return handleWrapper({ initialize: initialize, cleanup: cleanup });
}
```

### Usage

```javascript
var handle = factory(...);
...
handle.close(function() {
  // Object is closed.
});
```

## Sync-Async Facade

This pattern is used to create objects which expose asynchronous instantiation, but can be used synchronously. Better 
behaving usage will use object upon instantiation completion, which ensures asynchronous initialization was completed.
However, if object is used before completion, this will still work. The facade wrapper invoke synchronous initializer
if object is used before asynchronous initializer was completed. All this done in a way opaque to usage.

### Usage

```javascript
var obj = factory(..., function() {
  // Object initialization completed asynchronously. The object can be used.
  obj.foo();
});
// At this point initialization might not be completed yet, however, the object can be used 
// here as well.
obj.foo();
// Function foo will trigger synchronous initializer, which will be invoked before calling foo, 
// if object's initialziation was not completed.
```

### Definition

```javascript
var syncasyncFacade = require('ypatterns').syncasyncFacade;
function factory(..., callback) {
  
  function createInstance() {
    // create object
    // ...
    return instance;
  }
  
  function initializeAsync(instance, callback) {
    // asynchronous initializer
  }
  
  function initializeSync(instance) {
    // synchronous initializer is invoked only if needed.
    // initializers should be idempotent, at least, it should be anticipated that synchronous 
    // initializer will be invoked after asynchronous started and asynchronous one should 
    // anticipate synchronous was called in the middle of its execution.
  }

  return syncasyncFacade({ 
      create: createInstance, 
      initializeAsync: initializeAsync, 
      initializeSync: initializeSync 
      }, 
    callback);
}
```

## License

MIT
