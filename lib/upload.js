'use strict';

const crypto = require('crypto');
const request = require('request');
const url = process.env.UPLOAD_URL;

module.exports = function upload(image, cb) {
  const stream = request.get(image);
  const shasum = crypto.createHash('sha1');

  // Generate SHA1 checksum of image file
  stream.on('data', shasum.update.bind(shasum));

  request.post(url, { formData: { image: stream } }, cb.bind(undefined, shasum));
};

module.exports.validate = function validate(image) {
  const valid = [
    /^http:\/\/www2.turistforeningen.no\/images\/steder\/[\w-]+.jpg$/i,
    /^http:\/\/www2.turistforeningen.no\/images\/\w{2}\/\w{2}\/\w{2}.(jpe?g|png|gif)$/i,
    /^http:\/\/www2.turistforeningen.no\/album\/[^\/]+\/\w+.jpe?g$/i,
    /^https:\/\/s3-eu-west-1.amazonaws.com\/jotunheimr\/images\/\w{2}\/\w{2}\/\w{2}-(full|large).(jpe?g|png|gif)/i,
  ];

  for (let i = 0; i < valid.length; i++) {
    if (valid[i].test(image)) {
      return true;
    }
  }

  return false;
};

module.exports.getImage = function getImage(document) {
  if (!document
      || !document.img
      || !document.img[0]
      || !module.exports.validate(document.img[0].url)) {
    return null;
  }

  return document.img[0].url.replace(/-(large|full)/, '');
};
