import { ByteUnit, getByteUnitString, getBytesWithUnit } from '$lib/utils/byte-units';

describe('getBytesWithUnit', () => {
  const tests = [
    { bytes: 0, expected: [0, ByteUnit.B] },
    { bytes: 42 * 2 ** 20, expected: [42, ByteUnit.MiB] },
    { bytes: 69 * 2 ** 20 + 420 * 2 ** 19, expected: [279, ByteUnit.MiB] },
    { bytes: 42 + 1337, maxPrecision: 3, expected: [1.347, ByteUnit.KiB] },
    { bytes: 42 + 69, expected: [111, ByteUnit.B] },
    { bytes: 2 ** 30 - 1, expected: [1024, ByteUnit.MiB] },
    { bytes: 2 ** 30, expected: [1, ByteUnit.GiB] },
    { bytes: 2 ** 30 + 1, expected: [1, ByteUnit.GiB] },
    // sizes at or past the largest known unit stay clamped to EiB
    { bytes: 2 ** 60, expected: [1, ByteUnit.EiB] },
    { bytes: 2 ** 70, expected: [1024, ByteUnit.EiB] },
    // negative sizes keep their sign and still pick a sensible unit
    { bytes: -1, expected: [-1, ByteUnit.B] },
    { bytes: -(2 ** 30), expected: [-1, ByteUnit.GiB] },
    // sub-byte values do not underflow past B
    { bytes: 0.5, expected: [0.5, ByteUnit.B] },
  ];
  for (const { bytes, maxPrecision, expected } of tests) {
    it(`${bytes} should be split up in the factor ${expected[0]} and unit ${expected[1]}`, () => {
      expect(getBytesWithUnit(bytes, maxPrecision)).toEqual(expected);
    });
  }
});

describe('asByteUnitString', () => {
  it('should correctly return string', () => {
    expect(getByteUnitString(42 * 2 ** 20)).toEqual('42 MiB');
  });
});
