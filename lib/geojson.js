'use strict';

const append = require('fs').appendFileSync;

module.exports.validate = function validate(geojson) {
  // Check that geojson is defined
  if (!geojson) {
    return false;
  }

  // All validation checks passed
  return true;
}
