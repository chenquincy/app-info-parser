import { getBase64FromBuffer } from '../src/utils/getBase64FromBuffer';
import { Buffer } from 'buffer';

const imageBuffer = Buffer.from('abde', 'utf-8');
const base64Buffer = imageBuffer.toString('base64');

describe('Util getBase64FromBuffer', () => {
  it('Should return start with base64 image', () => {
    expect(
      getBase64FromBuffer(imageBuffer).startsWith('data:image/png;base64,')
    ).toBeTruthy();
  });

  it('Should return base64 encode string', () => {
    expect(
      getBase64FromBuffer(imageBuffer).endsWith(base64Buffer)
    ).toBeTruthy();
  });
});
