import { ApkParser } from './ApkParser';
import { IpaParser } from './IpaParser';
import { getExtensionName } from './utils/getExtensionName';
import { Zip } from './utils/Zip';

const supportFileTypes = ['ipa', 'apk'];

export type AppFile = File | string;

export default class AppInfoParser {
  public file: AppFile;
  parser: Zip;

  constructor(file: AppFile) {
    if (!file) {
      throw new Error(
        "Param miss: file(file's path in Node, instance of File or Blob in browser)."
      );
    }

    const fileExtension = getExtensionName(
      typeof file === 'string' ? file : file.name
    );

    if (!supportFileTypes.includes(fileExtension)) {
      throw new Error('Unsupported file type, only support .ipa or .apk file.');
    }

    this.file = file;

    switch (fileExtension) {
      case 'ipa':
        this.parser = new IpaParser(this.file);
        break;
      case 'apk':
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
