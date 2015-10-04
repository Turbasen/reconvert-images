#!/usr/local/bin/iojs

/* eslint no-console: [0] */
'use strict';

const cmd = require('nomnom')
  .script('npm start')
  .options({
    env: {
      help: 'Nasjonal Turbase environment',
      metavar: 'ENV',
      default: 'dev',
    },
    limit: {
      abbr: 'l',
      hidden: true,
      metavar: 'N',
      help: 'Limit number of results per page',
      default: 50,
    },
    skip: {
      abbr: 's',
      hidden: true,
      metavar: 'M',
      help: 'Number of results to skip before starting',
      default: 0,
    },
    file: {
      abbr: 'f',
      help: 'Optional line separated file with image _ids to convert',
    },
    ids: {
      abbr: 'i',
      help: 'Optional comma separated list of image _ids to convert',
    },
    'no-debug': {
      flag: true,
      help: 'Do not print debugging info',
    },
  });

const opts = cmd.parse();

process.env.NTB_API_ENV = opts.env;

const turbasen = require('turbasen');
const async = require('async');

const upload = require('./lib/upload');
const log = require('./lib/log');
const geojson = require('./lib/geojson');
const read = require('fs').readFileSync;

const options = {
  status: '!Slettet',
  'img.0.url': '',
  fields: 'img,endret,status,geojson',
  sort: 'endret',
  limit: opts.limit,
  skip: opts.skip,
};


let documents = [];

// Define the test function to retrieve documents
let test;
if (opts.file || opts.ids) {
  let ids;
  if (opts.file) {
    ids = read(opts.file, 'utf8').split('\n');
  } else {
    ids = opts.ids.split(',');
  }

  // Explicit document IDs are provided; retrieve just those
  let i = 0;

  test = function(callback) {
    if (i == ids.length) {
      return callback(null, false);
    }

    turbasen.bilder.get(ids[i], function getBilde(err, res, body) {
      documents = [body];
      i += 1;
      return callback(err, true);
    });
  }
} else {
  // Retrieve all the documents
  test = function(callback) {
    console.log(options.skip);
    turbasen.bilder(options, function getBilder(err, res, body) {
      options.skip += 50;
      documents = body.documents;
      callback(err, documents.length > 0);
    });
  }
}

async.during(test, function sync(callback) {
  async.eachSeries(documents, function eachSeries(document, cb) {
    const url = upload.getImage(document);
    const _id = document._id;

    if (!url) {
      log('turbasen_skipped.txt', document._id, document.status);
      return setTimeout(cb, 0);
    }

    console.log(_id, 'pre upload', url);

    upload(url, function uploadCallback(shasum, err, res, body) {
      if (err) {
        console.error(err);
        log('jotunheimr_error.txt', _id, url, err.message);
        return setTimeout(cb, 0);
      }

      if (res.statusCode !== 201) {
        log('jotunheimr_failed.txt', _id, url, res.statusCode, body.message);
        return setTimeout(cb, 0);
      }

      console.log(_id, 'post upload', res.statusCode);

      // Some images have no exif data
      if (!body.meta.exif) {
        body.meta.exif = {};
      }

      const data = {
        original: {
          size: body.meta.size,
          sha1: shasum.digest('hex'),
          format: body.meta.format,
          colorspace: body.meta.colorspace,
          height: body.meta.height,
          width: body.meta.width,
        },
        exif: {
          Artist: body.meta.exif.Artist,
          Copyright: body.meta.exif.Copyright,
          DateTime: body.meta.exif.DateTime,
          DateTimeDigitized: body.meta.exif.DateTimeDigitized,
          DocumentName: body.meta.exif.DocumentName,
          ImageDescription: body.meta.exif.ImageDescription,
          Make: body.meta.exif.Make,
          Model: body.meta.exif.Model,
          Software: body.meta.exif.Software,
        },
        img: body.versions
      }

      // Attach geometry if the image file on disk has valid GPS coordinates but
      // the image in Nasjonal Turbase does not
      if (geojson.validate(body.meta.geojson) && !document.geojson) {
        data.geojson = body.meta.geojson;
      }

      const jotunheimr_body = body;

      // Patch the image in Nasjonal Turbase
      turbasen.bilder.patch(_id, data, function patchCallback(err, res, body) {
        if (err) {
          console.error(err);
          log('turbasen_error.txt', _id, url, jotunheimr_body.versions[0].url, err);
          return setTimeout(cb, 0);
        }

        if (res.statusCode !== 200) {
          log('turbasen_failed.txt', _id, url, jotunheimr_body.versions[0].url, res.statusCode, body.message);
          return setTimeout(cb, 0);
        }

        console.log(_id, 'post patch', res.statusCode);

        log('turbasen_success.txt', _id);
        return setTimeout(cb, 0);
      });
    });
  }, callback);
}, function done(err) {
  console.log('Done!');
  console.log(err);
});
