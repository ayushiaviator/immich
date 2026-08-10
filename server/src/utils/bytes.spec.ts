import { asHumanReadable, hexOrBufferToBase64, HumanReadableSize } from 'src/utils/bytes';
import { describe, expect, it } from 'vitest';

describe('HumanReadableSize', () => {
  it('should expose binary multiples', () => {
    expect(HumanReadableSize.KiB).toBe(1024);
    expect(HumanReadableSize.MiB).toBe(1024 ** 2);
    expect(HumanReadableSize.GiB).toBe(1024 ** 3);
    expect(HumanReadableSize.TiB).toBe(1024 ** 4);
    expect(HumanReadableSize.PiB).toBe(1024 ** 5);
  });
});

describe('asHumanReadable', () => {
  it('should render plain bytes without decimals', () => {
    expect(asHumanReadable(0)).toBe('0 B');
    expect(asHumanReadable(1023)).toBe('1023 B');
  });

  it('should step up to the next unit at 1024', () => {
    expect(asHumanReadable(1024)).toBe('1.0 KiB');
    expect(asHumanReadable(1024 ** 2)).toBe('1.0 MiB');
    expect(asHumanReadable(1024 ** 3)).toBe('1.0 GiB');
    expect(asHumanReadable(1024 ** 4)).toBe('1.0 TiB');
  });

  it('should honour the requested precision', () => {
    expect(asHumanReadable(1536, 0)).toBe('2 KiB');
    expect(asHumanReadable(1536, 2)).toBe('1.50 KiB');
  });

  it('should stop at the largest known unit', () => {
    expect(asHumanReadable(1024 ** 6)).toBe('1.0 EiB');
    expect(asHumanReadable(1024 ** 7)).toBe('1024.0 EiB');
  });
});

describe('hexOrBufferToBase64', () => {
  const value = Buffer.from('immich');

  it('should encode a buffer', () => {
    expect(hexOrBufferToBase64(value)).toBe(value.toString('base64'));
  });

  it('should drop the leading marker from a hex encoded string', () => {
    expect(hexOrBufferToBase64(`\\x${value.toString('hex')}`)).toBe(value.toString('base64'));
  });
});
