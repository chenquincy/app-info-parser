import ApkParser from './ApkParser';
import IpaParser from './IpaParser';
import { ExtensionNameEnum, getExtensionName } from './utils/getExtensionName';
import { Zip } from './utils/Zip';

export type AppFile = File | string;

export default class AppInfoParser {
  public file: AppFile;
  type: ExtensionNameEnum;
  parser: Zip;

  constructor(file: AppFile) {
    if (!file) {
      throw new Error(
        "Param miss: file(file's path in Node, instance of File or Blob in browser)."
      );
    }
    this.type = getExtensionName(typeof file === 'string' ? file : file.name);
    this.file = file;

    switch (this.type) {
      case ExtensionNameEnum.IPA:
        this.parser = new IpaParser(this.file);
        break;
      case ExtensionNameEnum.APK:
        this.parser = new ApkParser(this.file);
        break;
      default:
        throw new Error(
          'Unsupported file type, only support .ipa or .apk file.'
        );
    }
  }

  parse() {
    return this.parser.parse();
  }
}
export default AppInfoParser;
