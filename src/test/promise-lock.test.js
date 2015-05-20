import 'babel-core/polyfill';

import chai from 'chai';
import sinon from 'sinon';
import chaiAsPromised from 'chai-as-promised';
import sinonChai from 'sinon-chai';
import PromiseLock from '../';

const should = chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);


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
      p0.should.be.rejectedWith(PromiseLock.CancelledError),
      p1.should.be.fulfilled,
    ]).should.notify(done);
  });

  it('should allow cancel even if no promise is running', () => {
    const lock = new PromiseLock();
    should.not.throw(() => lock.cancel());    
  });

  it('should not create promise from factory when it is locked', (done) => {
    const lock = new PromiseLock();
    const fac0 = sinon.spy(() => sleep(100));
    const fac1 = sinon.spy(() => sleep(50));

    const p0 = lock.on(fac0);
    const p1 = lock.on(fac1);

    Promise.all([
      p0.should.be.fulfilled,
      p1.should.be.rejectedWith(PromiseLock.LockedError),
    ])
    .then(()=>{
      fac0.should.have.been.called;
      fac1.should.have.not.been.called;
    })
    .should.notify(done);
  });

});
