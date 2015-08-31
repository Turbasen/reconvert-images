#!/usr/local/bin/iojs

/* eslint no-console: [0] */
'use strict';

const cmd = require('nomnom')
  .script('npm run check')
  .options({
    env: {
      help: 'Nasjonal Turbase environment',
      metavar: 'ENV',
      default: 'dev',
    },
    file: {
      abbr: 'f',
      help: 'Line seperated file with image _ids to check',
    },
    ids: {
      abbr: 'i',
      help: 'Comma seperated list of image _ids to check',
    },
    patch: {
      abbr: 'p',
      flag: true,
      help: 'Remove image references from other objects',
    },
    delete: {
      abbr: 'd',
      flag: true,
      help: 'Delete image from Nasjonal Turbase',
    },
    debug: {
      abbr: 'd',
      flag: true,
      help: 'Print debugging info',
    },
  });

const opts = cmd.parse();

process.env.NTB_API_ENV = opts.env;

const turbasen = require('turbasen');
const async = require('async');
const read = require('fs').readFileSync;

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

if (opts.debug) {
  console.log(`images: ${opts.ids.length}`);
}

async.each(opts.ids, function asyncEach(image, done) {
  if (image === '') { return done(); }

  const id = image.split(' ')[0];

  const tasks = {
    bilde: turbasen.bilder.get.bind(turbasen.bilder, id),
    turer: turbasen.turer.bind(turbasen, {bilder: id}),
    steder: turbasen.steder.bind(turbasen, {bilder: id}),
    områder: turbasen.områder.bind(turbasen, {bilder: id}),
  };

  if (opts.patch) {
    tasks.delete_turer = ['turer', function deleteTurer(callback, results) {
      async.each(results.turer[1].documents, function eachTurer(doc, cb) {
        turbasen.turer.patch(doc._id, {$pull: {bilder: id}}, cb);
      }, callback);
    }];

    tasks.delete_steder = ['steder', function deleteSteder(callback, results) {
      async.each(results.steder[1].documents, function eachSteder(doc, cb) {
        turbasen.steder.patch(doc._id, {$pull: {bilder: id}}, cb);
      }, callback);
    }];

    tasks.delete_områder = ['områder', function deleteOmrader(callback, results) {
      async.each(results.områder[1].documents, function eachOmrader(doc, cb) {
        turbasen.områder.patch(doc._id, {$pull: {bilder: id}}, cb);
      }, callback);
    }];
  }

  if (opts.delete) {
    tasks.delete = ['bilde', turbasen.bilder.delete.bind(turbasen.bilder, id)];
  }

  async.auto(tasks, function asyncAuto(err, results) {
    if (err) { return done(err); }

    if (opts.debug) {
      console.log('bilde.status', results.bilde[0].statusCode);

      if (opts.delete) {
        console.log('delete.status', results.delete[0].statusCode);
      }
    }

    turer += results.turer[1].documents.length;
    steder += results.steder[1].documents.length;
    områder += results.områder[1].documents.length;

    done();
  });
}, function asyncAutoDone(err) {
  if (err) { throw err; }

  console.log('Reference Check:');
  console.log('  turer  :', turer);
  console.log('  steder :', steder);
  console.log('  områder:', områder);
});
