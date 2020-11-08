/**
 * A Validation and line type definition
 * @typedef {Object} LineValidation
 * @property {String} type The line type constant
 * @property {RegExp} regex The regular expression for initial validation
 * @property {Function} [additional] Any additional validation required.
 */

/**
 * @typedef {Object} Planet
 * @property {Boolean} instantiated Has the planet been instantiated properly
 * @property {Integer} maxY The maximum Y value (north)
 * @property {Integer} maxX The maximum X value (east)
 * @property {Integer} minY The minimum Y value (north)
 * @property {Integer} minX The minimum X value (west)
 * @property {Map[Rover]} rovers The landed rovers
 * @property {Array[CardinalCoordinate]} dangerZones Anywhere a rover fell off the world
 */

/**
 * @typedef {Object} CardinalCoordinate
 * @property {Integer} x The east/west value
 * @property {Integer} y The north/south value
 * @property {String} direction The letter direction of the current facing direction
 */

/**
 * @typedef {Object} Rover
 * @property {String} identifier The generated ID of the rover
 * @property {CardinalCoordinate} position Current position of the rover
 * @property {Array[String]} actions The array of actions to perform
 * @property {Array[String]} pastActions Actions already performed
 * @property {String} state The current state of the rover
 * @property {Array[CardinalCoordinate]} history State history of the rover
 */

/**
  * RoverLostError Class
  */
class RoverLostError extends Error {
  /**
   * Set the danger zone
   * @param {CardinalCoordinate} dangerZone The danger zone to mark
   */
  setDangerZone(dangerZone) {
    this.dangerZone = dangerZone;
  }

  /**
   * Set the danger zone
   * @returns {CardinalCoordinate}
   */
  getDangerZone() {
    return this.dangerZone;
  }
}

module.exports = {
  RoverLostError,
};
