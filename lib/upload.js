'use strict';

const crypto = require('crypto');
const request = require('request');
const url = process.env.UPLOAD_URL;

module.exports = function upload(image, cb) {
  const stream = request.get(image);
  const shasum = crypto.createHash('sha1');

  // Generate SHA1 checksum of image file
  stream.on('data', shasum.update.bind(shasum));

  request.post(url, { formData: { image: stream } }, cb.bind(undefined, shasum);
};
