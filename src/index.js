class LockedError {

}

function hang() {
  return new Promise();
}

export default class PromiseLock {
  constructor() {
    this.instance = null;
  }

  on(promise) {
    if(this.isRunning()) {
      return Promise.reject(new LockedError());
    }

    this.instance = promise;

    return promise.then((data) => {
      if(this.isRunning()) {
        this.instance = null;
        return data;
      } else {
        return hang();
      }
    }, (error) => {
      if(this.isRunning()) {
        this.instance = null;
        return Promise.reject(error);
      } else {
        return hang();
      }
    });
  }

  isRunning() {
    return this.instance !== null;
  }

  cancel() {
    this.instance = null;
  }
}



PromiseLock.LockedError = LockedError;
