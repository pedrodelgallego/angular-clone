// Functions are unique objects in JS this way new watches will always have
// their listener functions invoked, whatever their watch functions
// might return
var uniqueValue = () => { };

export class Scope {
  constructor(){
    this.$$watchers = [];
  }

  $watch(watchFn, listenerFn) {
    this.$$watchers.push({ watchFn, listenerFn, last: uniqueValue });
  }

  $digest(){
    this.$$watchers.forEach((watcher) =>  {
      var newValue = watcher.watchFn(this);

      if (watcher.last !== newValue) {
        // if the last value is equal to the uniqueValue, them we
        // should not leak the uniqueValue to the method, instead pass
        // the new value to the scope as the old value
        var oldValue = watcher.last === uniqueValue? newValue : watcher.last;

        watcher.listenerFn(newValue, oldValue, this);
        watcher.last = newValue;
      }
    });
  }


}
