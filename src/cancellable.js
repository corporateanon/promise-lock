import {CancelledError} from './errors';


const CancelledSymbol = Symbol('Cancelled');
const RejectSymbol = Symbol('Reject');


export default class Cancellable {
  constructor(promise) {
    this[CancelledSymbol] = false; 
    this.promise = new Promise((res, rej)=>{
      this[RejectSymbol] = () => {
        this[CancelledSymbol] = true;
        rej(new CancelledError({sender: this}));
      };
      promise.then((data) => {
        if(!this[CancelledSymbol]) {
          res(data);
        }
      },(error) => {
        if(!this[CancelledSymbol]) {
          rej(error);
        }
      });
    });
  }
  
  cancel() {
    this[RejectSymbol]();
  }
}
