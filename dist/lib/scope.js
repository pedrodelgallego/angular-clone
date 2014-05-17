"use strict";
Object.defineProperties(exports, {
  Scope: {get: function() {
      return Scope;
    }},
  __esModule: {value: true}
});
var __moduleName = "scope";
var uniqueValue = (function() {});
var Scope = function Scope() {
  this.$$watchers = [];
  this.$$lastDirtyWatch = null;
};
($traceurRuntime.createClass)(Scope, {
  $watch: function(watchFn) {
    var listenerFn = arguments[1] !== (void 0) ? arguments[1] : (function() {});
    this.$$watchers.push({
      watchFn: watchFn,
      listenerFn: listenerFn,
      last: uniqueValue
    });
  },
  $$digestOnce: function() {
    var dirty,
        newValue,
        oldValue;
    for (var $__1 = this.$$watchers[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var watcher = $__2.value;
      {
        newValue = watcher.watchFn(this);
        if (watcher.last !== newValue) {
          this.$$lastDirtyWatch = watcher;
          oldValue = watcher.last === uniqueValue ? newValue : watcher.last;
          watcher.listenerFn(newValue, oldValue, this);
          watcher.last = newValue;
          dirty = true;
        } else if (this.$$lastDirtyWatch === watcher) {
          break;
        }
      }
    }
    return dirty;
  },
  $digest: function() {
    var dirty,
        count = 10;
    this.$$lastDirtyWatch = null;
    do {
      if (!count--) {
        throw "10 digest iterations reached";
      }
      dirty = this.$$digestOnce();
    } while (dirty);
  }
}, {});
