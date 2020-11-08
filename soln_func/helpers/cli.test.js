const rewire = require('rewire');

const cli = rewire('./cli');
const validate = cli.__get__('validate');
const { interpretLine, cleanLine } = cli;

/**
 * Mock a single validator regex
 */
const mockValidatorRegex = jest.fn();
const mockValidatorAdditional = jest.fn();
const mockValidatorWithAdditional = {
  regex: {
    exec: mockValidatorRegex,
  },
  additional: mockValidatorAdditional,
};
const mockValidatorWithoutAdditional = {
  regex: {
    exec: mockValidatorRegex,
  },
};

/**
 * Mock a set of validator regexes and validate function
 *
 * because this is a constant array - i need to empty the array, and populate it with my mocks
 */
const inlineValidationRegex = cli.__get__('validationRegex');
inlineValidationRegex.splice(0, inlineValidationRegex.length);
inlineValidationRegex.push({
  type: 'TYPE1',
});
inlineValidationRegex.push({
  type: 'TYPE2',
});
inlineValidationRegex.push({
  type: 'TYPE3',
});
const mockValidate = jest.fn();
cli.__set__('validate', mockValidate);

beforeEach(() => {
  mockValidatorRegex.mockReset();
  mockValidatorRegex.mockReturnValue([]);
  mockValidatorAdditional.mockReset();
  mockValidatorAdditional.mockReturnValue(true);

  mockValidate.mockReset();
  mockValidate.mockReturnValue(true);
});

describe('validate()', () => {
  it('will execute a regex and an additional function', () => {
    const testText = 'testing-text';
    validate(testText, mockValidatorWithAdditional);

    expect(mockValidatorRegex).toHaveBeenCalled();
    expect(mockValidatorRegex).toHaveBeenCalledWith(testText);
    expect(mockValidatorAdditional).toHaveBeenCalled();
    expect(mockValidatorAdditional).toHaveBeenCalledWith(testText);
  });

  it('will return false if regex returns falsey, and not call additional', () => {
    mockValidatorRegex.mockReturnValue(null);
    const testText = 'testing-text';
    const result = validate(testText, mockValidatorWithAdditional);
    expect(result).toBe(false);
    expect(mockValidatorRegex).toHaveBeenCalled();
    expect(mockValidatorRegex).toHaveBeenCalledWith(testText);
    expect(mockValidatorAdditional).toHaveBeenCalledTimes(0);
  });

  it('will return false if regex returns truthy, and additional returns falsey', () => {
    mockValidatorAdditional.mockReturnValue(null);
    const testText = 'testing-text';
    const result = validate(testText, mockValidatorWithAdditional);
    expect(result).toBe(false);
    expect(mockValidatorRegex).toHaveBeenCalled();
    expect(mockValidatorRegex).toHaveBeenCalledWith(testText);
    expect(mockValidatorAdditional).toHaveBeenCalled();
    expect(mockValidatorAdditional).toHaveBeenCalledWith(testText);
  });

  it('will return truthy even if additional not specified and regex passes', () => {
    const testText = 'testing-text';
    const output = validate(testText, mockValidatorWithoutAdditional);
    expect(output).toBe(true);
    expect(mockValidatorRegex).toHaveBeenCalled();
    expect(mockValidatorRegex).toHaveBeenCalledWith(testText);
  });

  it('will return false if additional not specified and regex fails', () => {
    mockValidatorRegex.mockReturnValue(null);
    const testText = 'testing-text';
    const output = validate(testText, mockValidatorWithoutAdditional);
    expect(output).toBe(false);
    expect(mockValidatorRegex).toHaveBeenCalled();
    expect(mockValidatorRegex).toHaveBeenCalledWith(testText);
  });
});

describe('interpretLine()', () => {
  it('will iterate through all validators if they all return false, and throw an error in that case', () => {
    mockValidate.mockReturnValue(false);
    const mockText = 'test-text';
    expect(() => interpretLine(mockText)).toThrowError();
    expect(mockValidate).toHaveBeenCalledTimes(inlineValidationRegex.length);
    inlineValidationRegex.forEach((validator, index) => {
      expect(mockValidate).toHaveBeenNthCalledWith(index + 1, mockText, validator);
    });
  });

  it('will iterate through all validators until one returns true, and return that value', () => {
  // this will be the second value returned
    mockValidate.mockReturnValue(false)
      .mockReturnValueOnce(false)
      .mockReturnValueOnce(true);

    const mockText = 'test-text';
    expect(interpretLine(mockText)).toBe(inlineValidationRegex[1].type);
    expect(mockValidate).toHaveBeenCalledTimes(2);
  });
});

describe('cleanLine()', () => {
  it('Expect string to be trimmed and uppercased', () => {
    const test = '    123ererRR   ';
    const expected = '123ERERRR';
    expect(cleanLine(test)).toBe(expected);
  });
});
