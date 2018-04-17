/**
 * IPromise - state machine
 * pending, fulfilled, rejected
 */
class IPromise {
  /**
   * Takes two params `resolve()` and `reject()`
   * executor is responsible for calling resolve() and reject() to
   * say the async op as succeeded or failed.
   */
  constructor(executor) {
    if (typeof executor !== 'function') {
      throw new Error('Executor must be a function');
    }

    /**
     * Internal state
     * state of the promise, and `chain` is an
     * array of functions we need to call once this promise is settled
     */
    // const STATES = {PENDING,FULFILLED,REJECTED};

    this.state = 'PENDING';
    this.chain = [];

    // Resolve for executor function to use
    const resolve = res => {
      // A promise is considered settled when it is no longer PENDING
      // which is when either resolve() or reject() was called.
      if (this.state !== 'PENDING') {
        return;
      }

      this.state = 'FULFILLED';
      this.internalValue = res;

      // If somebody called .then() while promise is pending, need
      // to call `onFulfilled()` function
      for (const {onFulfilled} of this.chained) {
        onFulfilled(res);
      }
    };

    // Reject for executor function to use
    const reject = err => {
      if (this.state !== 'PENDING') {
        return;
      }

      this.state = 'REJECTED';
      this.internalValue = err;

      for (const {onRejected} of this.chained) {
        onRejected(err);
      }
    };

    // Call the executor function with `resolve()` and `reject()`
    try {
      executor(resolve, reject);
    } catch(err) {
      reject(err);
    }
  }

  /**
   * `onFulfilled` is called if the promise is fulfilled
   * `onRejected` is called if the promise is rejected. Think of fulfilled as `resolved`
   */
  then(onFulfilled, onRejected) {
    if (this.state === 'FULFILLED') {
      onFulfilled(this.internalValue);
    } else if (this.state === 'REJECTED') {
      onRejected(this.internalValue);
    } else {
      this.chained.push({ onFulfilled, onRejected });
    }
  }
}
