/* eslint no-console: [0] */
'use strict';

const assert = require('assert');
const log = require('../lib/log');
const rm = require('fs').unlink;
const read = require('fs').readFile;

const file = 'test.txt';

beforeEach(function beforeEach(done) {
  rm(file, done.bind(undefined, null));
});

afterEach(function afterEach(done) {
  rm(file, done.bind(undefined, null));
});

describe('log()', function describe() {
  it('appends to specified logfile', function it(done) {
    log(file, 'bar', 'baz');
    log(file, 'bix', 'box');

    read(file, 'utf8', function readCallback(err, data) {
      assert.ifError(err);
      assert.equal(data, 'bar baz\nbix box\n');
      done();
    });
  });
});
