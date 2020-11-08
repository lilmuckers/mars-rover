/**
 * Import the type definitions
 */
const { RoverLostError } = require('../helpers/typedefs');

/**
 * The base planet
 * @var {Planet}
 */
const planetBase = {
  instantiated: false,
  maxY: 0,
  maxX: 0,
  minY: 0,
  minX: 0,
  rovers: new Map(),
  dangerZones: [],
};

/**
 * Define the cardinal directions
 */
const DIR_NORTH = 'N';
const DIR_SOUTH = 'S';
const DIR_EAST = 'E';
const DIR_WEST = 'W';

/**
 * Generate the planet information based off the north-east most coordinate.
 * @returns {Object}
 */
function generate() {
  return { ...planetBase, dangerZones: [], rovers: new Map() };
}

/**
 * Update the bounding conditions of the planet
 * @param {Planet} planet The planet to define the parameters for
 * @param {Integer} x The maxX value
 * @param {Integer} y The maxY value
 */
function update(planet, x, y) {
  if (planet.instantiated) throw new Error('Planet has already been defined');
  const updatedPlanet = { ...planet };
  updatedPlanet.instantiated = true;
  updatedPlanet.maxX = x;
  updatedPlanet.maxY = y;
  return updatedPlanet;
}

/**
 * Land a rover on the planet
 * @param {Planet} planet The planet to land on
 * @param {Rover} rover The rover to land
 * @return {Planet}
 * @throws {Error} if the planet has not been instantiated prior to landing
 */
function landRover(planet, rover) {
  if (!planet.instantiated) {
    throw new Error('The planet has not been bounded');
  }

  const updatedPlanet = { ...planet };
  const updatedRover = { ...rover };

  // rover id is a simple incrementor for each new rover
  const roverId = updatedPlanet.rovers.size + 1;
  updatedRover.identifier = roverId;

  updatedPlanet.rovers.set(roverId, updatedRover);
  return updatedPlanet;
}

/**
 * Update a rover on the planet
 * @param {Planet} planet The planet to update rover on
 * @param {Rover} rover The rover to move
 * @returns {Planet}
 */
function replaceRover(planet, rover) {
  planet.rovers.set(rover.identifier, rover);
  const { position } = rover;
  const { x, y } = position;
  if ((planet.minX > x || planet.maxX < x) || (planet.minY > y || planet.maxY < y)) {
    const e = new RoverLostError();
    e.setDangerZone(position);
    throw e;
  }
  return planet;
}

/**
 * Mark a zone as danger
 * @param {Planet} planet The planet to mark
 * @param {CardinalCoordinate} coords Where to mark
 * @returns {Planet}
 */
function markDanger(planet, coords) {
  const newPlanet = { ...planet };
  newPlanet.dangerZones.push(coords);
  return newPlanet;
}

/**
 * Figure out if a movement is safe to execute.
 * @param {Planet} planet The planet to move around on
 * @param {CardinalCoordinate} move The move to perform
 */
function isSafeToGo(planet, { x: xMove, y: yMove }) {
  const predicate = ({ x, y }) => x === xMove && y === yMove;
  return !planet.dangerZones.find(predicate);
}

/**
 * Get all the rovers on a planet
 * @param {Planet} planet The planet to get rovers for
 * @return {Rover[]}
 */
function getRovers(planet) {
  return Array.from(planet.rovers);
}

/**
 * Execute the planet update code
 * @param {Planet} planet The planet to run against
 * @param {String} text The command text of the format "X Y"
 * @return {Planet}
 */
function executePlanetSpec(planet, text) {
  const dataExtractRegex = /^(?<x>[0-9]{1,2}) (?<y>[0-9]{1,2})$/;
  const { groups: { x, y } } = text.match(dataExtractRegex);
  return update(planet, Number(x), Number(y));
}

module.exports = {
  generate,
  update,
  landRover,
  isSafeToGo,
  getRovers,
  executePlanetSpec,
  replaceRover,
  markDanger,
  DIR_NORTH,
  DIR_SOUTH,
  DIR_EAST,
  DIR_WEST,
};
