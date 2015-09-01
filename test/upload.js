/* eslint no-console: [0] */
'use strict';

const assert = require('assert');
const upload = require('../lib/upload');

describe.skip('upload()', function describe() {
  it('uploads image', function it(done) {
    this.timeout(10000);

    const url = 'http://www2.turistforeningen.no/images/4R/Cb/r2.JPG';
    upload(url, function uploadCb(shasum, err, res, body) {
      console.log(shasum.digest('hex'));
      console.log(err);
      console.log(res.statusCode);
      console.log(body);

      done();
    });
  });
});

describe('upload.validate()', function describe() {
  const valid = [
    'http://www2.turistforeningen.no/images/steder/foo-bar-baz.jpg',
    'http://www2.turistforeningen.no/images/Fq/fm/HU.jpg',
    'http://www2.turistforeningen.no/album/album3211/St_lsveien_mot_Arnafjord.jpg',
    'https://s3-eu-west-1.amazonaws.com/jotunheimr/images/45/jq/7E-large.jpg',
    'https://s3-eu-west-1.amazonaws.com/jotunheimr/images/RT/0B/Pf-full.jpg',
  ];

  const invalid = [
    'http://www2.turistforeningen.no/images/Fq/fm/HU.pdf',
    'https://s3-eu-west-1.amazonaws.com/jotunheimr/prod/45/jq/7E-large.jpg',
  ];

  it('returns true for valid image url', function it() {
    valid.forEach(function forEach(image) {
      assert.equal(upload.validate(image), true);
    });
  });

  it('returns false for invalid image url', function it() {
    invalid.forEach(function forEach(image) {
      assert.equal(upload.validate(image), false);
    });
  });
});

describe('upload.getImage()', function describe() {
  let doc1;
  let doc2;

  beforeEach(function beforeEach() {
    doc1 = {img: [{
      height: 1600,
      url: 'http://www2.turistforeningen.no/images/ab/cd/ef.jpg',
      width: 1200,
    }, {
      url: 'http://www2.turistforeningen.no/images/ab/cd/ef.sized.jpg',
      width: 375,
      height: 500,
    }, {
      url: 'http://www2.turistforeningen.no/images/ab/cd/ef.thumb.jpg',
      width: 113,
      height: 150,
    }]};

    doc2 =  {img: [{
      height: 1600,
      url: 'https://s3-eu-west-1.amazonaws.com/jotunheimr/images/ab/cd/ef-full.jpg',
      width: 1200,
    }, {
      url: 'https://s3-eu-west-1.amazonaws.com/jotunheimr/images/ab/cd/ef-500.jpg',
      width: 375,
      height: 500,
    }, {
      url: 'https://s3-eu-west-1.amazonaws.com/jotunheimr/images/ab/cd/ef-150.jpg',
      width: 113,
      height: 150,
    }]};
  });

  it('returns valid image', function it() {
    assert.equal(upload.getImage(doc1), doc1.img[0].url);
  });

  it('returns source image if applicable', function it() {
    assert.equal(upload.getImage(doc2), doc2.img[0].url.replace('-full', ''));
  });

  it('returns null for no image', function it() {
    assert.equal(upload.getImage({}), null);
  });

  it('returns null for invalid image', function it() {
    doc1.img[0].url = 'http://foo.bar/image/foo.jpg';
    assert.equal(upload.getImage(doc1), null);
  });
});
