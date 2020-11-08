/**
 * Import the type definitions
 */
require('./typedefs');

/**
 * Import the line types
 */
const {
  PLANET_SPEC,
  ROVER_START,
  ROVER_CMDS,
} = require('./cli');

/**
 * Import the important functions from the planet and rover modules
 */
const {
  executePlanetSpec,
} = require('../planet');
const {
  executeRoverStart,
  executeRoverCmds,
} = require('../rover');

/**
 * Defining the actual line executor functions. This relies on themn all having
 * the same interface, however this isn't strictly enforcable in "vanilla" javascript
 * due to the DuckTyping. This could be resolved by either using a superset (such as TypeScript)
 * or by using a number of reflection methods within the OOP model. For simplicity and
 * my use of pure functions, this forgos that particular issue by assuming the developer
 * knows what is expected.
 *
 * @var {Map} commands Map of line types to executer functions.
 */
const commands = new Map([
  [PLANET_SPEC, executePlanetSpec],
  [ROVER_START, executeRoverStart],
  [ROVER_CMDS, executeRoverCmds],
]);

/**
 * Execute the function behind the line types
 * @param {Planet} planet The planet to run against
 * @param {String} lineType The line type to execute
 * @param {String} inputLine The input line data
 * @returns {Planet}
 * @throws {Error} If unrecognised type
 */
function runLine(planet, lineType, inputLine) {
  const executer = commands.get(lineType);
  if (!executer) throw new Error('Unknown command type');
  return executer(planet, inputLine);
}

module.exports = {
  runLine,
};
