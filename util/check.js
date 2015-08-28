#!/usr/local/bin/iojs
'use strict';

const turbasen = require('turbasen');
const async = require('async');
const read = require('fs').readFileSync;

if (!process.argv[2]) {
  console.log(`Usage: ${process.argv[1]} [file]`);
  console.log('Check what other objects are refferencing an image');
  process.exit(1);
}

const file = read(process.argv[2], 'utf8');

let turer = 0;
let steder = 0;
let områder = 0;

async.each(file.split('\n'), function(image, cb) {
  if (image === '') { return cb(); }

  image = image.split(' ');

  async.parallel({
    turer: turbasen.turer.bind(turbasen, {bilder: image[0]}),
    steder: turbasen.steder.bind(turbasen, {bilder: image[0]}),
    områder: turbasen.områder.bind(turbasen, {bilder: image[0]}),
  }, function(err, results) {
    turer += results.turer[1].documents.length;
    steder += results.steder[1].documents.length;
    områder += results.områder[1].documents.length;

    cb();
  });
}, function(err) {
  if (err) { throw err; }

  console.log('turer', turer);
  console.log('steder', steder);
  console.log('områder', områder);
});

