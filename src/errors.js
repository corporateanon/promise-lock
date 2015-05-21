export class PromiseLockError extends Error {

}

export class LockedError extends PromiseLockError {
  constructor() {
    super('LockedError');
  }
}

export class CancelledError extends PromiseLockError {
  constructor({sender=null} = {}) {
    super('CancelledError');
    this.sender = sender;
  }
}
