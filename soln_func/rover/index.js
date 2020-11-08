/**
 * Import the type definitions
 */
const { RoverLostError } = require('../helpers/typedefs');

const {
  DIR_EAST, DIR_NORTH, DIR_SOUTH, DIR_WEST, landRover, isSafeToGo, replaceRover, markDanger,
} = require('../planet');

/**
 * Starting from north, incrementing array indexes are clockwise
 * @var {String[]}
 */
const directionCycle = [DIR_NORTH, DIR_EAST, DIR_SOUTH, DIR_WEST];
const forwardCoordOffset = new Map([
  [DIR_NORTH, { y: 1 }],
  [DIR_EAST, { x: 1 }],
  [DIR_SOUTH, { y: -1 }],
  [DIR_WEST, { x: -1 }],
]);

/**
 * Direction constants and Offset(s)
 */
const TURN_LEFT = 'L';
const TURN_RIGHT = 'R';
const MOVE_FORWARD = 'F';
const turnOffsets = new Map([
  [TURN_LEFT, -1],
  [TURN_RIGHT, 1],
]);

/**
 * The available rover states
 */
const STATE_IDLE = 'idle';
const STATE_MOVING = 'moving';
const STATE_FINISHED = 'finished';
const STATE_LOST = 'lost';

/**
 * The base rover object
 */
const roverBase = {
  identifier: 0,
  position: {
    x: 0,
    y: 0,
    direction: DIR_NORTH,
  },
  actions: [],
  pastActions: [],
  state: STATE_IDLE,
  history: [],
};

/**
 *
 * @param {CardinalCoordinates} start The starting cardinality
 */
function generate(start) {
  const rover = {
    ...roverBase, position: start, actions: [], pastActions: [], history: [],
  };
  return rover;
}

/**
 * Execute rover landing and startup
 * @param {Planet} planet The planet to land
 * @param {String} lineText The text which also contained the landing location
 */
function executeRoverStart(planet, lineText) {
  const dataExtractRegex = /^(?<x>[0-9]{1,2}) (?<y>[0-9]{1,2}) (?<direction>[NSWE])$/;
  const { groups: coords } = lineText.match(dataExtractRegex);
  const rover = generate({
    x: Number(coords.x),
    y: Number(coords.y),
    direction: coords.direction,
  });
  return landRover(planet, rover);
}

/**
 * Transform the direction by the command string
 * @param {String} cmd The command to change direction
 * @param {String} direction The starting direction
 * @returns {String}
 */
function transformCoordinateByTurning(cmd, direction) {
  // rotate based off the cycle array
  const offset = turnOffsets.get(cmd);
  let newIndex = directionCycle.indexOf(direction) + offset;

  // if the new index goes negative - cycle to the top
  if (newIndex < 0) newIndex += directionCycle.length;
  if (newIndex >= directionCycle.length) newIndex -= directionCycle.length;
  return directionCycle[newIndex];
}

/**
 * Transform a cardinal coordinate
 * @param {CardinalCoordinates} coordinate The coordinate to move forward by
 * @return {CardinalCoordinates}
 */
function transformCoordinateByMoving(coordinate) {
  const newCoord = { ...coordinate };
  const coordOffset = forwardCoordOffset.get(coordinate.direction);
  newCoord.x += coordOffset.x || 0;
  newCoord.y += coordOffset.y || 0;
  return newCoord;
}

/**
 * Transform an incoming coord by the cmd
 * @param {CardinalCoordinates} coord The position to be transposed
 * @param {String} cmd the command string (one of L, R and F)
 * @return {CardinalCoordinates}
 */
function transformCoordinate(coord, cmd) {
  let newCoord = { ...coord };

  switch (cmd) {
    case TURN_LEFT:
    case TURN_RIGHT:
      newCoord.direction = transformCoordinateByTurning(cmd, coord.direction);
      break;
    case MOVE_FORWARD:
      newCoord = transformCoordinateByMoving(newCoord);
      break;
    default:
      break;
  }

  return newCoord;
}

/**
 * Run a specific command against a rover on a planet
 * @param {Planet} planet The planet we're driving on
 * @param {Rover} rover The rover that's moving
 * @param {String} cmd The command to run
 * @returns {Rover}
 */
function runRoverCmd(planet, rover, cmd) {
  // get current position
  const current = rover.position;
  // get next position value
  const next = transformCoordinate(current, cmd);
  // test position for danger, if so we need to stop

  if (!isSafeToGo(planet, next)) return rover;
  // move rover, update history, add command to past actions
  const newRover = { ...rover, position: next };
  newRover.history.push(current);
  newRover.pastActions.unshift(cmd);
  replaceRover(planet, newRover);
  return newRover;
}

/**
 *
 * @param {Planet} planet The planet we're running on
 * @param {Rover} rover The rover we're running
 * @returns {Rover}
 */
function startRover(planet, rover) {
  let endRover = { ...rover, state: STATE_MOVING };
  const { actions } = rover;
  try {
    while (actions.length > 0) {
      const cmd = actions.shift();
      endRover = runRoverCmd(planet, endRover, cmd);
    }
    endRover.state = STATE_FINISHED;
  } catch (e) {
    if (e instanceof RoverLostError) {
      endRover.state = STATE_LOST;
      return {
        planet: markDanger(planet, e.getDangerZone()),
        rover: endRover,
      };
    }
    throw e;
  }
  return { planet, rover: endRover };
}

/**
 * Execute the rover commands against the most recently added rover.
 * @param {Planet} planet
 * @param {String} lineText
 * @return {Planet}
 * @throws {Error} In the event the last rover has already done a thing
 */
function executeRoverCmds(planet, lineText) {
  const commandList = lineText.split('');
  const lastRover = planet.rovers.get(planet.rovers.size);

  if (!lastRover) {
    throw new Error('No rover has yet landed');
  }

  if (lastRover.state !== STATE_IDLE) {
    throw new Error('Rover has already received and executed commands');
  }
  lastRover.actions = commandList;
  const { rover: outputRover, planet: outputPlanet } = startRover(planet, lastRover);
  const { position: { x, y, direction }, state } = outputRover;
  const stateOutput = state === STATE_LOST ? 'LOST' : '';

  // Adding "END" prefix to make it clearer
  console.log(`END> ${x} ${y} ${direction} ${stateOutput}`);
  return outputPlanet;
}

module.exports = {
  executeRoverStart,
  executeRoverCmds,
  STATE_IDLE,
  STATE_MOVING,
  STATE_FINISHED,
  STATE_LOST,
};
