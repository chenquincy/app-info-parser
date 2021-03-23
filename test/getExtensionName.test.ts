import { getExtensionName } from '../src/utils/getExtensionName';

describe('Util getExtensionName', () => {
  it('Single dot in filename', () => {
    expect(getExtensionName('abcd.e')).toEqual('e');
  });

  it('Multiple dot in filename', () => {
    expect(getExtensionName('abcd.e.f')).toEqual('f');
  });

  it('Has file path', () => {
    expect(getExtensionName('/a/b/c/d.e')).toEqual('e');
  });
});
