import {LockedError, CancelledError} from './errors';
import Cancellable from './cancellable';


const CancellableSymbol = Symbol('Cancellable');


export default class PromiseLock {
  constructor() {
    this[CancellableSymbol] = null;
  }

  on(promiseOrFactory) {
    if('function' === typeof(promiseOrFactory)) {
      return this.onFactory(promiseOrFactory);
    } else {
      return this.onPromise(promiseOrFactory);
    }
  }

  onFactory(promiseFactory) {
    if(this.isRunning()) {
      return Promise.reject(new LockedError());
    }
    return this.onPromise(promiseFactory());
  }

  onPromise(promise) {
    if(this.isRunning()) {
      return Promise.reject(new LockedError());
    }

    this[CancellableSymbol] = new Cancellable(Promise.resolve(promise));
    
    return this[CancellableSymbol].promise
      .then((res) => {
        this[CancellableSymbol] = null;
        return res;
      }, (err) => {
        if(!( err instanceof CancelledError )) {
          //If the error is not about cancelling
          this[CancellableSymbol] = null;
        }
        return Promise.reject(err);
      });
  }

  isRunning() {
    return this[CancellableSymbol] !== null;
  }

  cancel() {
    if(this.isRunning()) {
      this[CancellableSymbol].cancel();
      this[CancellableSymbol] = null;
      return true;
    }
    return false;
  }
}


PromiseLock.LockedError = LockedError;
PromiseLock.CancelledError = CancelledError;
PromiseLock.CanceledError = CancelledError; //support for American English "canceLed"
