import { isDebugEnabled } from '../config';
import { debugLog, debugWarn, debugError } from '../utils';

describe('isDebugEnabled — precedencia del flag de debug', () => {
  it('el canónico REACT_APP_DEBUG_ENABLED lo prende', () => {
    expect(isDebugEnabled({ REACT_APP_DEBUG_ENABLED: 'true' })).toBe(true);
  });

  it('el canónico en false manda aunque el alias heredado diga true', () => {
    expect(
      isDebugEnabled({ REACT_APP_DEBUG_ENABLED: 'false', REACT_APP_DEBUG: 'true' })
    ).toBe(false);
  });

  it('sin el canónico definido, cae al alias heredado REACT_APP_DEBUG', () => {
    expect(isDebugEnabled({ REACT_APP_DEBUG: 'true' })).toBe(true);
  });

  it('el canónico vacío no cuenta como definido: cae al alias', () => {
    expect(
      isDebugEnabled({ REACT_APP_DEBUG_ENABLED: '', REACT_APP_DEBUG: 'true' })
    ).toBe(true);
  });

  it('sin ninguna de las dos, apagado', () => {
    expect(isDebugEnabled({})).toBe(false);
  });

  it('cualquier valor que no sea el string "true" queda apagado', () => {
    expect(isDebugEnabled({ REACT_APP_DEBUG_ENABLED: '1' })).toBe(false);
    expect(isDebugEnabled({ REACT_APP_DEBUG_ENABLED: 'yes' })).toBe(false);
  });
});

describe('helpers de debug con el flag documentado', () => {
  const OLD = process.env;
  let spies;

  beforeEach(() => {
    process.env = { ...OLD };
    delete process.env.REACT_APP_DEBUG;
    spies = {
      log: jest.spyOn(console, 'log').mockImplementation(() => {}),
      warn: jest.spyOn(console, 'warn').mockImplementation(() => {}),
      error: jest.spyOn(console, 'error').mockImplementation(() => {}),
    };
  });

  afterEach(() => {
    process.env = OLD;
    jest.restoreAllMocks();
  });

  // DISCRIMINANTE: con el código viejo (utils.js leyendo REACT_APP_DEBUG a
  // secas) estos tres fallan, porque ningún entorno —CI incluido— setea esa
  // variable: solo setea REACT_APP_DEBUG_ENABLED.
  it('debugLog emite cuando REACT_APP_DEBUG_ENABLED=true y el alias no está', () => {
    process.env.REACT_APP_DEBUG_ENABLED = 'true';
    debugLog('hola');
    expect(spies.log).toHaveBeenCalledWith('hola');
  });

  it('debugWarn emite cuando REACT_APP_DEBUG_ENABLED=true y el alias no está', () => {
    process.env.REACT_APP_DEBUG_ENABLED = 'true';
    debugWarn('ojo');
    expect(spies.warn).toHaveBeenCalledWith('ojo');
  });

  it('debugError emite cuando REACT_APP_DEBUG_ENABLED=true y el alias no está', () => {
    process.env.REACT_APP_DEBUG_ENABLED = 'true';
    debugError('feo');
    expect(spies.error).toHaveBeenCalledWith('feo');
  });

  it('con el flag documentado en false no emite nada', () => {
    process.env.REACT_APP_DEBUG_ENABLED = 'false';
    debugLog('x');
    debugWarn('x');
    debugError('x');
    expect(spies.log).not.toHaveBeenCalled();
    expect(spies.warn).not.toHaveBeenCalled();
    expect(spies.error).not.toHaveBeenCalled();
  });
});
