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
};
($traceurRuntime.createClass)(Scope, {
  $watch: function(watchFn, listenerFn) {
    this.$$watchers.push({
      watchFn: watchFn,
      listenerFn: listenerFn,
      last: uniqueValue
    });
  },
  $digest: function() {
    for (var $__1 = this.$$watchers[Symbol.iterator](),
        $__2; !($__2 = $__1.next()).done; ) {
      var watcher = $__2.value;
      {
        var newValue = watcher.watchFn(this);
        if (watcher.last !== newValue) {
          var oldValue = watcher.last === uniqueValue ? newValue : watcher.last;
          watcher.listenerFn(newValue, oldValue, this);
          watcher.last = newValue;
        }
      }
    }
  }
}, {});
