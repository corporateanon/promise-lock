# promise-lock

[![NPM Version][npm-image]][npm-url]
[![Build Status][travis-image]][travis-url]

[npm-image]: https://img.shields.io/npm/v/promise-lock.svg
[npm-url]: https://npmjs.org/package/promise-lock
[travis-image]: https://travis-ci.org/corporateanon/promise-lock.svg?branch=master
[travis-url]: https://travis-ci.org/corporateanon/promise-lock

## Installation

   npm install promise-lock

## Usage

1. Rejecting concurrent promises

```javascript
    const lock = new PromiseLock();

    lock.on($.get('/foo'))
        .then((res)=>console.log(res))       //<-- will log the result
        .catch((res)=>console.log('Error'));

    lock.on($.get('/bar'))
        .then((res)=>console.log(res))
        .catch((res)=>console.log('Error'));//<-- will log "Error", because the lock is previously set on anothe promise
```

2. Cancelling previously started promise

```javascript
    const lock = new PromiseLock();

    lock.on($.get('/foo'))
        .then((res)=>console.log(res))       //<-- will never run
        .catch((res)=>console.log('Error')); //<-- will never run
    
    lock.cancel();

    lock.on($.get('/bar'))
        .then((res)=>console.log(res))       //<-- will log the result
        .catch((res)=>console.log('Error'));
```

