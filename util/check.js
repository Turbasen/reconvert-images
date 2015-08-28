#!/usr/local/bin/iojs
'use strict';

const turbasen = require('turbasen');
const async = require('async');
const read = require('fs').readFileSync;

const cmd = require('nomnom')
  .script('check')
  .options({
    file: {
      abbr: 'f',
      help: 'File with _ids to check',
    },
    ids: {
      abbr: 'i',
      help: 'Image _id to check',
    },
    debug: {
      abbr: 'd',
      flag: true,
      help: 'Print debugging info',
    }
  });

const opts = cmd.parse();

let turer = 0;
let steder = 0;
let områder = 0;

// Require --file or --ids
if (!opts.file && !opts.ids) {
  cmd.print(cmd.getUsage());
}

// Parse image IDs
if (opts.file) {
  opts.ids = read(opts.file, 'utf8').split('\n');
} else {
  opts.ids = opts.ids.split(',');
}

async.each(opts.ids, function(image, cb) {
  if (image === '') { return cb(); }

  image = image.split(' ');

  async.parallel({
    turer: turbasen.turer.bind(turbasen, {bilder: image[0]}),
    steder: turbasen.steder.bind(turbasen, {bilder: image[0]}),
    områder: turbasen.områder.bind(turbasen, {bilder: image[0]}),
  }, function(err, results) {
    if (err) { return cb(err); }

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
