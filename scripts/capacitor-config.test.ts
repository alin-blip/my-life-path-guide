import { describe, expect, test } from 'bun:test';
import config from '../capacitor.config';

describe('production Capacitor configuration', () => {
  test('uses the requested iOS bundle identifier', () => {
    expect(config.appId).toBe('com.ceomindos.app');
  });

  test('uses the requested application name', () => {
    expect(config.appName).toBe('CEO Mind OS');
  });

  test('bundles the Vite dist directory', () => {
    expect(config.webDir).toBe('dist');
  });

  test('has no remote server or hot-reload override', () => {
    expect(config.server).toBeUndefined();
  });
});