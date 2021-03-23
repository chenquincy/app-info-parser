import AppInfoParser from '../src/index';
import ApkParser from '../src/ApkParser';

describe('AppInfoParser parse', () => {
  it('Parse ipa', async () => {
    const parser = new AppInfoParser('../packages/test.ipa');
    const result = await parser.parse();
    ['CFBundleName', 'CFBundleDisplayName', 'CFBundleVersion', 'icon'].forEach(
      item => {
        expect(Object.keys(result)).toContain(item);
      }
    );
  });
  it('Parse apk', async () => {
    const parser = new ApkParser('../packages/test.apk');
    const result = await parser.parse();
    ['versionCode', 'versionName', 'application', 'icon'].forEach(item => {
      expect(Object.keys(result)).toContain(item);
    });
  });
});
