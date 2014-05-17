// Functions are unique objects in JS this way new watches will always have
// their listener functions invoked, whatever their watch functions
// might return
var uniqueValue = () => { };

export class Scope {
  constructor(){
    this.$$watchers = [];
    this.$$lastDirtyWatch = null;
  }

  $watch(watchFn, listenerFn = () => {}) {
    this.$$watchers.push({watchFn, listenerFn, last: uniqueValue });
  }

  $$digestOnce(){
    var dirty, newValue, oldValue;
    for (var watcher of this.$$watchers){
      newValue = watcher.watchFn(this);

      if (watcher.last !== newValue) {

        this.$$lastDirtyWatch = watcher;

        // if the last value is equal to the uniqueValue, them we
        // should not leak the uniqueValue to the method, instead pass
        // the new value to the scope as the old value
        oldValue = watcher.last === uniqueValue? newValue : watcher.last;

        watcher.listenerFn(newValue, oldValue, this);
        watcher.last = newValue;
        dirty = true;
      } else if (this.$$lastDirtyWatch === watcher) {
        break;
      }
    }
    return dirty;
  }

  $digest() {
    var dirty, count = 10;
    this.$$lastDirtyWatch = null;
    do {
      if(!count--){
        throw "10 digest iterations reached";
      }

      dirty = this.$$digestOnce();
    } while(dirty);
  }

}
