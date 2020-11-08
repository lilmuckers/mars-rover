const { RoverLostError } = require('./typedefs');

describe('RoverLostError()', () => {
  it('value set to the danger zone is returned', () => {
    const e = new RoverLostError();
    const dangerZone = 'DANGER-ZONE';
    e.setDangerZone(dangerZone);
    expect(e.getDangerZone()).toBe(dangerZone);
  });
});
