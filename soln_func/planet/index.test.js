const rewire = require('rewire');

const planet = rewire('./index');
const planetBase = planet.__get__('planetBase');

const {
  generate,
  update,
  landRover,
  replaceRover,
  isSafeToGo,
  getRovers,
  executePlanetSpec,
  markDanger,
} = planet;

const updateMock = jest.fn();
const mockPlanetData = {
  instantiated: true,
  maxX: 30,
  maxY: 23,
};
planet.__set__('update', updateMock);

beforeEach(() => {
  updateMock.mockReset();
  updateMock.mockReturnValue(mockPlanetData);
});

describe('generate()', () => {
  it('build an empty planet', () => {
    const startingPlanet = generate();
    expect(startingPlanet).toMatchObject(planetBase);
  });
});

describe('update()', () => {
  it('instantiated planets should fail with an error', () => {
    expect(() => update({ instantiated: true }, 1, 1)).toThrowError();
  });

  it('uninstantiated planet should have coords updated', () => {
    const instantiatedPlanet = {
      instantiated: false,
      maxY: 0,
      maxX: 1,
    };
    const outputPlanet = update(instantiatedPlanet, 30, 23);
    expect(outputPlanet).toMatchObject({
      instantiated: true,
      maxX: 30,
      maxY: 23,
    });
  });
});

describe('landRover()', () => {
  it('Landed rover should be attached to the planet', () => {
    const inputPlanet = {
      instantiated: true,
      maxX: 30,
      maxY: 23,
      rovers: new Map(),
    };
    const inputRover = {
      identifier: null,
      field: 'value',
    };

    const outputPlanet = landRover(inputPlanet, inputRover);
    expect(outputPlanet.rovers.size).toBe(1);
    expect(outputPlanet.rovers.get(1)).toMatchObject({
      identifier: 1,
      field: 'value',
    });

    const inputRover2 = {
      identifier: null,
      field: 'value2',
    };
    const outputPlanet1 = landRover(outputPlanet, inputRover2);
    expect(outputPlanet1.rovers.size).toBe(2);
    expect(outputPlanet1.rovers.get(2)).toMatchObject({
      identifier: 2,
      field: 'value2',
    });
  });
});

describe('replaceRover()', () => {
  it('will update a rover in the list', () => {
    const inputRover = {
      identifier: 1,
      position: { x: 4, y: 5 },
    };
    const inputPlanet = {
      rovers: new Map([[1, { identifier: 1, position: { x: 3, y: 4 } }]]),
      minX: 0,
      maxX: 20,
      minY: 0,
      maxY: 20,
    };

    const outputPlanet = replaceRover(inputPlanet, inputRover);
    expect(outputPlanet).toMatchObject({
      rovers: new Map([[1, inputRover]]),
      minX: 0,
      maxX: 20,
      minY: 0,
      maxY: 20,
    });
    expect(outputPlanet.rovers.get(1)).toMatchObject(inputRover);
  });

  it('if rover is out of bounds, error thrown with dangerzone', () => {
    const inputRover = {
      identifier: 1,
      position: { x: 400, y: 5 },
    };
    const inputPlanet = {
      rovers: new Map([[1, { identifier: 1, position: { x: 3, y: 4 } }]]),
      minX: 0,
      maxX: 20,
      minY: 0,
      maxY: 20,
    };

    expect(() => replaceRover(inputPlanet, inputRover)).toThrowError();
    try {
      replaceRover(inputPlanet, inputRover);
    } catch (e) {
      expect(e.getDangerZone()).toMatchObject({ x: 400, y: 5 });
    }
  });
});

describe('markDanger()', () => {
  it('Will add a dangerzone to  thhe planet', () => {
    const inputPlanet = {
      dangerZones: [],
    };
    const dangerZone = { x: 23, y: 99 };
    const outputPlanet = markDanger(inputPlanet, dangerZone);
    expect(outputPlanet).toMatchObject({
      dangerZones: [{ x: 23, y: 99 }],
    });
  });
});

describe('isSafeToGo()', () => {
  it('will return true if no dangerzones found (yet)', () => {
    const inputPlanet = {
      dangerZones: [{ x: 1, y: 3 }],
    };
    const isSafe = { x: 0, y: 2 };
    expect(isSafeToGo(inputPlanet, isSafe)).toBe(true);
  });
  it('will return false if dangerzones matched', () => {
    const inputPlanet = {
      dangerZones: [{ x: 1, y: 3 }],
    };
    const isSafe = { x: 1, y: 3 };
    expect(isSafeToGo(inputPlanet, isSafe)).toBe(false);
  });
});

describe('getRovers()', () => {
  it('Will convert map to array for iteration', () => {
    const inputPlanet = {
      rovers: new Map([[1, { identifier: 1 }]]),
    };
    expect(getRovers(inputPlanet)).toMatchObject([[1, { identifier: 1 }]]);
  });
});

describe('executePlanetSpec()', () => {
  it('will extract correct coordinates to setup the planet', () => {
    const inputText = '4 6';
    executePlanetSpec(mockPlanetData, inputText);
    expect(updateMock).toHaveBeenCalled();
    expect(updateMock).toHaveBeenCalledWith(mockPlanetData, 4, 6);
  });
});
