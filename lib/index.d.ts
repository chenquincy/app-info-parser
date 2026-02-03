
/**
 * AppInfoParser - Parse APK/IPA files to extract app information
 * 
 * @example
 * ```typescript
 * import AppInfoParser from 'app-info-parser';
 * 
 * const parser = new AppInfoParser('/path/to/app.apk');
 * const info = await parser.parse();
 * console.log(info.package, info.versionName);
 * ```
 */
declare class AppInfoParser {
    /**
     * Create a new parser instance
     * @param filePath - Path to the APK or IPA file
     */
    constructor(filePath: string);

    /**
     * Parse the APK/IPA file and extract app information
     * @returns Parsed app information containing package details
     * @throws {Error} If file cannot be parsed
     */
    parse(): Promise<AppInfoParser.AppInfo>;
}

declare namespace AppInfoParser {
    /**
     * Application information extracted from APK/IPA file
     */
    export interface AppInfo {
        /**
         * Package/Bundle identifier
         * @example "com.example.myapp"
         */
        package: string;

        /**
         * Numeric version code (Android) or build number (iOS)
         * @example 123
         */
        versionCode: number;

        /**
         * Human-readable version string
         * @example "1.2.3"
         */
        versionName: string;

        /**
         * Application metadata and resources
         */
        application?: ApplicationInfo;

        /**
         * Platform-specific metadata
         * Additional fields vary by platform (APK vs IPA)
         */
        [key: string]: any;
    }

    /**
     * Application metadata from manifest
     */
    export interface ApplicationInfo {
        /**
         * App display name/label
         * Can contain multiple language variants
         * @example ["My App", "我的应用"]
         */
        label?: string[];

        /**
         * Path to app icon within package
         * @example "res/drawable/icon.png"
         */
        icon?: string;

        /**
         * Other manifest attributes
         */
        [key: string]: any;
    }
}

export = AppInfoParser;