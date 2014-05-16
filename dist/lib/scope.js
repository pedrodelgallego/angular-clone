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
    var $__0 = this;
    this.$$watchers.forEach((function(watcher) {
      var newValue = watcher.watchFn($__0);
      if (watcher.last !== newValue) {
        var oldValue = watcher.last === uniqueValue ? newValue : watcher.last;
        watcher.listenerFn(newValue, oldValue, $__0);
        watcher.last = newValue;
      }
    }));
  }
}, {});
