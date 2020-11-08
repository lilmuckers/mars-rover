# Mars Rover

## Introduction
This is my implementation of the mars rover problem, that will behave in the following manner
 * A flat "planet" will be generated based of a single set of x/y coordinates, assuming (0,0) to be the south-western corner, and the specified coordinate set to be the north-eastern corner.
    * **Assumption**: Planet will never be bigger than 50x50
    * **Assumption**: Planet is accellerating forever upwards at a constant rate to ensure the illusion of gravity is maintained
    * **Assumption**: Metaphysical, philosophical and theological ramifications of such a cosmological model have already been settled by highly reliable backyard researchers communicating their correct and accurate ideas via the means of badly shot youtube videos.
 * An arbitrary number of "rovers" will be specified with the following:
    * Starting position and direction it is facing (eg: 2,12 W)
    * A set of movements utilising relative directional turns (left/right) and moves a single step forward in the direction the rover is facing.
    * **Assumption**: Instructions assumed to not be longer than 99 characters (LRFFRLRLFRLLFRFFFLRLF)
 * The rovers will be executed in order, with all their movement commands executing prior to executing the subsequent rover command chain.
    * If a rover falls off the edge of the planet, into the never ending void, it will leave a marker (or scent) that other rovers will be able to detect to avoid the same fate if they enter the square that the previous rover fell from.
    * Rovers will output their final position on this planet before shutting down.
        * If rover is lost, system will detect this loss and return last known "Safe" coordinates of the rover and note that it was lost.
    * **Assumption**: If a rover attempts to move through a square already occupied by one of its brethren/sistren then it will have the capacity to sidle past.

## Implementation Details
This has been written in JavaScript, as it is a decent rapid prototyping language with a well known syntax and grammar, with multiple possible paradigms that can be approached. As well as relatively simple setup.

### Setup
 * Run `yarn` or `npm i`
 * Run the commands:
    1. `npm run sync`, `yarn run sync` - Run the base functional example to fill the brief
    5. `npm test`, `yarn test` - Run all the tests

### Functional Implementation
 * This solution has been written using functinal programming, and mostly "pure" functions. ]
 * The "planet" is defined using an object generator containing it's bounding coordinates and current rover states.
 * The code is contained within the path `./soln_functional`
 * Functions are "pure" and syncronous.
 * Information:
    1. Planet is instantiated in a blank state on application bootup
    2. Input commands are parsed and categoried based on format
        * Planet set up just contains coordinates (`2 2`)
        * Rover landing is inferred by cardinal coordinate format (`3 4 E`)
        * Rover command lists are inferred by the format of the three commands (`LRLRLFFFLRLRFFRR`)
    3. Once the planet is setup, it will error on any subsequent planet setup commands
        * Planet receives max Y and max X coordinates to determine scale, and then locked
        * Planet retains list of landed rovers
    4. Rovers can be landed en bulk but only the most recently landed can be controlled
    5. Once a rover has received a set of commands, those are executed, and the rover is disabled
        * Attempts todeliver another set of comands to a rover already disabled will result in an error
    6. User can then land another rover towork with
    7. When a rover leaves the planetary bounds, it will write a dangerZone value to the planet as the "scent"
    8. When a rover moves, it generates a post-command state, and checks that coordinate value against the dangerzones to determine if it's save to move.
    9. If there's no dangerzone it will move to this state, and if that's off the bounds of the map an error is thrown
    10. Rover has 4 states:
        1. `idle` - just landed
        2. `moving` - currently on maneuvers
        3. `finished` - commands all completed
        4. `lost` - Strayed into the dark and was eaten by a grue
    11. Rover maintains a history of previous positions - mostly for debugging purposes

## Potential further work
 * Additional rover commands could be added by adding new functional maps.
    * Assuming a simimlar command pattern, executors and command patterns could be added
 * Prettify the CLI interface
    * This readline interface is clunky for use unless clearly documented
 * Asyncronous functionality
    * It wouldn't be a stretch to make an async version of this. If one is communicating with, for example, mars, a 40 minute signal round trip would not make this workable, but an async system would allow commands to be queued.
    * It wouldn't be a stretch to assume you're working with a kafka-esque data stream.
 * Accounting for collisions
    * If a rover crossed a square that an existing rover was in, would both be marked as "lost" or "damaged"
 * Ability to address sets of commands to specific rovers, with an ID
 
 ## Caveats
The testing coverage is not complete. Using `rewire` to mock and test internal non-public functions breaks jest code coverage, and similarly certain situations of module imports are hard to mock in javascript depending on which tools you are using, with no single tool offering a complete solution. I opted for `rewire` to allow for testing all functinos, but this blocks my ability to mock local modules effectively with either Jest of Proxyquire.
