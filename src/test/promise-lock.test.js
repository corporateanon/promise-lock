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

  it('should set `isRunning=false` after promise has resolved', (done) => {
    const lock = new PromiseLock();
    const p0 = lock.on(sleep(10));

    lock.isRunning().should.be.true;

    p0.should.be.fulfilled
      .then(() => {
        lock.isRunning().should.be.false;
      })
      .should.notify(done);
  });

  it('should set `isRunning=false` after promise has rejected', (done) => {
    const lock = new PromiseLock();
    const p0 = lock.on(sleep(10).then(()=>Promise.reject()));

    lock.isRunning().should.be.true;

    p0.should.be.rejected
      .then(() => {
        lock.isRunning().should.be.false;
      })
      .should.notify(done);
  });

  it('should set `isRunning=false` after promise has cancelled', (done) => {
    const lock = new PromiseLock();
    const p0 = lock.on(sleep(10));

    lock.isRunning().should.be.true;

    lock.cancel();

    p0.should.be.rejected
      .then(() => {
        lock.isRunning().should.be.false;
      })
      .should.notify(done);
  });

  it('should be stable against data races', (done) => {
    const lock = new PromiseLock();
    const success = sinon.spy();
    const error = sinon.spy();
    lock.on(() => sleep(200).then(() => 'one')).then(success, error);

    sleep(5)
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before first cancel');
        lock.cancel();
      })
      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(false, 'should not be running after first cancel');
        lock.on(() => sleep(200).then(() => 'two'))
          .then(success, error);
      })

      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before second cancel');
        lock.cancel();
      })
      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(false, 'should not be running after second cancel');
        lock.on(() => sleep(200).then(() => 'three'))
          .then(success, error);
      })

      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before third cancel');
        lock.cancel();
      })
      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(false, 'should not be running after third cancel');
        lock.on(() => sleep(200).then(() => 'four'))
          .then(success, error);
      })

      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before fourth cancel');
        lock.cancel();
      })
      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(false, 'should not be running after fourth cancel');
        lock.on(() => sleep(200).then(() => 'five'))
          .then(success, error);
      })

      .then(()=>sleep(500))
      .then(()=>{
        lock.isRunning().should.equal(false, 'should be not running, because all promises have resolved');
        success.should.have.been.calledOnce;
        success.should.have.been.calledWith('five');
        error.should.have.callCount(4);
      })
      .should.notify(done);
  });

  it('should be stable against data races (syncronous cancel)', (done) => {
    const lock = new PromiseLock();
    const success = sinon.spy();
    const error = sinon.spy();
    lock.on(() => sleep(200).then(() => 'one')).then(success, error);

    sleep(5)
      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before first cancel');
        lock.cancel();
        lock.isRunning().should.equal(false, 'should not be running after first cancel');
        lock.on(() => sleep(200).then(() => 'two'))
          .then(success, error);
      })

      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before second cancel');
        lock.cancel();
        lock.isRunning().should.equal(false, 'should not be running after second cancel');
        lock.on(() => sleep(200).then(() => 'three'))
          .then(success, error);
      })

      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before third cancel');
        lock.cancel();
        lock.isRunning().should.equal(false, 'should not be running after third cancel');
        lock.on(() => sleep(200).then(() => 'four'))
          .then(success, error);
      })

      .then(()=>sleep(5))
      .then(() => {
        lock.isRunning().should.equal(true, 'should be running before fourth cancel');
        lock.cancel();
        lock.isRunning().should.equal(false, 'should not be running after fourth cancel');
        lock.on(() => sleep(200).then(() => 'five'))
          .then(success, error);
      })

      .then(()=>sleep(500))
      .then(()=>{
        lock.isRunning().should.equal(false, 'should be not running, because all promises have resolved');
        success.should.have.been.calledOnce;
        success.should.have.been.calledWith('five');
        error.should.have.callCount(4);
      })
      .should.notify(done);
  });


});
