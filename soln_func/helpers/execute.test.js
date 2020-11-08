const rewire = require('rewire');

const execute = rewire('./execute');
const { runLine } = execute;

/**
 * create mock commands
 */
const commands = execute.__get__('commands');
commands.clear();
const MOCK_CMD1 = 'm1';
const MOCK_CMD2 = 'm2';
const MOCK_CMD3 = 'm3';
commands.set(MOCK_CMD1, jest.fn());
commands.set(MOCK_CMD2, jest.fn());
commands.set(MOCK_CMD3, jest.fn());

beforeEach(() => {
  commands.forEach((cmdFunction) => cmdFunction.mockReset());
});

describe('runLine()', () => {
  it('if unknown executor is run, error thrown', () => {
    expect(() => runLine({}, 'UNKNOWN_TYPE', '')).toThrowError();
  });

  it('run requested type', () => {
    const testPlanet = 'TEST_PLANET';
    const testText = 'TEST_TEXT';
    runLine(testPlanet, MOCK_CMD2, testText);
    expect(commands.get(MOCK_CMD2)).toHaveBeenCalled();
    expect(commands.get(MOCK_CMD2)).toHaveBeenCalledWith(testPlanet, testText);
  });
});
