import 'babel-core/polyfill';

var chai = require("chai");
chai.should();
var chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

import PromiseLock from '../';

function sleep(delay) {
  return new Promise(function (resolve) {
    setTimeout(function () {
      resolve();
    }, delay);
  });
}

describe('PromiseLock', () => {
  it('should work', (done) => {
    const lock = new PromiseLock();
    const p0 = lock.on(sleep(100));
    const p1 = lock.on(sleep(50));

    Promise.all([
      p0.should.be.fulfilled,
      p1.should.be.rejectedWith(PromiseLock.LockedError),
    ]).should.notify(done);
  });

  it('should allow cancel', (done) => {
    const lock = new PromiseLock();
    const p0 = lock.on(sleep(100));
    lock.cancel();
    const p1 = lock.on(sleep(50));

    Promise.all([
      p0.should.not.be.fulfilled,
      p1.should.be.fulfilled,
    ]).should.notify(done);
  });
});
