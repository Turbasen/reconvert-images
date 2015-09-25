'use strict';

const append = require('fs').appendFileSync;

module.exports.validate = function validate(geojson) {
  // Check that geojson is defined
  if (!geojson) {
    return false;
  }

  // Check that coordinates are numeric
  function isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }
  if (!geojson.coordinates.every(isNumeric)) {
    return false;
  }

  // Check that lng/lat are within range
  if (geojson.coordinates[0] < -180
      || geojson.coordinates[0] > 180
      || geojson.coordinates[1] < -90
      || geojson.coordinates[1] > 90) {
    return false;
  }

  // All validation checks passed
  return true;
}
