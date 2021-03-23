/**
 * transform buffer to base64
 * @param {Buffer} buffer
 */
export function getBase64FromBuffer(buffer: Buffer) {
  return 'data:image/png;base64,' + buffer.toString('base64');
}
