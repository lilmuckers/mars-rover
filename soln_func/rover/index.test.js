const rewire = require('rewire');

// jest.mock('../planet', () => ({ landRover: mockLandRover }));
const rover = rewire('./index');

const roverBase = rover.__get__('roverBase');
const generate = rover.__get__('generate');
const transformCoordinateByTurning = rover.__get__('transformCoordinateByTurning');
const transformCoordinateByMoving = rover.__get__('transformCoordinateByMoving');
const transformCoordinate = rover.__get__('transformCoordinate');

const mockCoordTurn = jest.fn();
rover.__set__('transformCoordinateByTurning', mockCoordTurn);
const mockCoordMove = jest.fn();
rover.__set__('transformCoordinateByMoving', mockCoordMove);

const mockGenerate = jest.fn();
rover.__set__('generate', mockGenerate);

beforeEach(() => {
  mockGenerate.mockReset();
  mockGenerate.mockReturnValue({ rover: true });
  mockCoordTurn.mockReset();
  mockCoordMove.mockReset();
});

describe('generate()', () => {
  it('build a starting rover', () => {
    const startingPosition = { x: 3, y: 5, direction: 'W' };
    const expected = { ...roverBase, position: startingPosition };
    expect(generate(startingPosition)).toMatchObject(expected);
  });
});

describe('transformCoordinateByTurning()', () => {
  it('turning left will go from N to W', () => expect(transformCoordinateByTurning('L', 'N')).toBe('W'));
  it('turning left will go from E to N', () => expect(transformCoordinateByTurning('L', 'E')).toBe('N'));
  it('turning left will go from S to E', () => expect(transformCoordinateByTurning('L', 'S')).toBe('E'));
  it('turning left will go from W to S', () => expect(transformCoordinateByTurning('L', 'W')).toBe('S'));
  it('turning left will go from N to E', () => expect(transformCoordinateByTurning('R', 'N')).toBe('E'));
  it('turning left will go from E to S', () => expect(transformCoordinateByTurning('R', 'E')).toBe('S'));
  it('turning left will go from S to W', () => expect(transformCoordinateByTurning('R', 'S')).toBe('W'));
  it('turning left will go from W to N', () => expect(transformCoordinateByTurning('R', 'W')).toBe('N'));
});

describe('transformCoordinateByMoving()', () => {
  const move = transformCoordinateByMoving;
  it('facing W should decrement X value, but leave Y', () => expect(move({ x: 1, y: 1, direction: 'W' })).toMatchObject({ x: 0, y: 1, direction: 'W' }));
  it('facing E should dincrement X value, but leave Y', () => expect(move({ x: 1, y: 1, direction: 'E' })).toMatchObject({ x: 2, y: 1, direction: 'E' }));
  it('facing N should increment Y value, but leave X', () => expect(move({ x: 1, y: 1, direction: 'N' })).toMatchObject({ x: 1, y: 2, direction: 'N' }));
  it('facing S should decrement Y value, but leave X', () => expect(move({ x: 1, y: 1, direction: 'S' })).toMatchObject({ x: 1, y: 0, direction: 'S' }));
});

describe('transformCoordinate()', () => {
  it('turning left calls turn function', () => {
    transformCoordinate({ x: 1, y: 2, direction: 'W' }, 'L');
    expect(mockCoordTurn).toHaveBeenCalled();
    expect(mockCoordTurn).toHaveBeenCalledWith('L', 'W');
  });
  it('turning right calls turn function', () => {
    transformCoordinate({ x: 1, y: 2, direction: 'W' }, 'R');
    expect(mockCoordTurn).toHaveBeenCalled();
    expect(mockCoordTurn).toHaveBeenCalledWith('R', 'W');
  });
  it('turning updates direction', () => {
    mockCoordTurn.mockReturnValue('D');
    const output = transformCoordinate({ x: 1, y: 2, direction: 'W' }, 'R');
    expect(output).toMatchObject({ x: 1, y: 2, direction: 'D' });
  });
  it('moving forward calls move function', () => {
    transformCoordinate({ x: 1, y: 2, direction: 'W' }, 'F');
    expect(mockCoordMove).toHaveBeenCalled();
    expect(mockCoordMove).toHaveBeenCalledWith({ x: 1, y: 2, direction: 'W' });
  });
  it('moving updates coords', () => {
    mockCoordMove.mockReturnValue({ x: 100, y: 100, direction: 'D' });
    const output = transformCoordinate({ x: 1, y: 2, direction: 'W' }, 'F');
    expect(output).toMatchObject({ x: 100, y: 100, direction: 'D' });
  });
});
