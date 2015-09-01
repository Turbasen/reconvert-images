/* eslint no-console: [0] */
'use strict';

const append = require('fs').appendFileSync;

module.exports = function log(file, ...values) {
  const str = values.join(' ');

  if (process.env.NODE_ENV !== 'testing') {
    console.log(`${file}: ${str}`);
  }

  append(file, `${str}\n`, 'utf8');
}
