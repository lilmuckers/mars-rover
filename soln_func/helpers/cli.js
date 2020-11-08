/**
 * Import the type definitions
 */
require('./typedefs');

/**
 * Line type constants for defining what the incoming data is
 */
const PLANET_SPEC = 'planet-coords';
const ROVER_START = 'rover-coords';
const ROVER_CMDS = 'rover-cmds';
const EMPTY = 'empty';

/**
 * A mapping of validations to
 * @var {Array[LineValidation]}
 */
const validationRegex = [{
  type: PLANET_SPEC,
  regex: /^[0-9]{1,2} [0-9]{1,2}$/,
}, {
  type: ROVER_START,
  regex: /^[0-9]{1,2} [0-9]{1,2} [NSWE]$/,
}, {
  type: ROVER_CMDS,
  regex: /^[FLR]{1,99}$/,
}, {
  type: EMPTY,
  regex: /^$/,
}];

/**
 * Execute a validation set and return a boolean result
 * @param {String} text
 * @param {LineValidation} validation
 * @returns {Boolean}
 */
function validate(text, { regex, additional = () => true }) {
  return !!regex.exec(text) && !!additional(text);
}

/**
 * Take in an input line and validate or error
 * @param {String} text
 * @throws {Error} When unexpected format is entered
 * @returns {String}
 */
function interpretLine(text) {
  // Reduce to a single line type - based off the validator
  const reduce = (type, validator) => (type || (validate(text, validator) ? validator.type : null));
  const lineType = validationRegex.reduce(reduce, null);

  // if there's no line type discovered, throw an error
  if (!lineType) throw new Error('Unexpected input format');
  return lineType;
}

/**
 * Do some basic line sanitation, we know we want it trimmed and capitalised for simplicities sake
 * @param {String} line The line to be cleaned
 * @returns {String}
 */
function cleanLine(line) {
  return line.trim().toUpperCase();
}

module.exports = {
  cleanLine,
  interpretLine,
  PLANET_SPEC,
  ROVER_START,
  ROVER_CMDS,
  EMPTY,
};
