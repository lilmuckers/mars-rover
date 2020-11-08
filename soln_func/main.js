/**
 * At this point all we need is to read from STDIN
 */
const readline = require('readline');

/**
 * Import the CLI functional helpers and planet starter
 */
const { cleanLine, interpretLine } = require('./helpers/cli');
const { runLine } = require('./helpers/execute');
const { generate: generatePlanet } = require('./planet');

// Create the readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// create the blank planet we're landing on
let planet = generatePlanet();

// Watch for line events and assign functionality based on the cardinality of the line order.
rl.on('line', (input) => {
  try {
    const inputLine = cleanLine(input);
    const lineType = interpretLine(cleanLine(inputLine));
    planet = runLine(planet, lineType, inputLine);
  } catch (e) {
    console.error(`Process exited with error: ${e.message}`);
    console.log(e);
    // process.exit();
  }
});
