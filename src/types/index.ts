export interface IpaInfoType {
  BuildMachineOSBuild: string;
  CFBundleDevelopmentRegion: string;
  CFBundleDisplayName: string;
  CFBundleExecutable: string;
  CFBundleIconFiles: string[];
  CFBundleIdentifier: string;
  CFBundleInfoDictionaryVersion: string;
  CFBundleName: string;
  CFBundlePackageType: string;
  CFBundleShortVersionString: string;
  CFBundleSignature: string;
  CFBundleSupportedPlatforms: string[];
  CFBundleURLTypes: any[];
  CFBundleVersion: string;
  DTCompiler: string;
  DTPlatformBuild: string;
  DTPlatformName: string;
  DTPlatformVersion: string;
  DTSDKBuild: string;
  DTSDKName: string;
  DTXcode: string;
  DTXcodeBuild: string;
  Fabric: any;
  LSApplicationQueriesSchemes: string[];
  LSRequiresIPhoneOS: boolean;
  MinimumOSVersion: string;
  NSAppTransportSecurity: any;
  NSBluetoothPeripheralUsageDescription: string;
  NSCalendarsUsageDescription: string;
  NSCameraUsageDescription: string;
  NSContactsUsageDescription: string;
  NSLocationAlwaysUsageDescription: string;
  NSLocationWhenInUseUsageDescription: string;
  NSMicrophoneUsageDescription: string;
  NSPhotoLibraryUsageDescription: string;
  NSSpeechRecognitionUsageDescription: string;
  UIAppFonts: string[];
  UIBackgroundModes: string[];
  UIDeviceFamily: number[];
  UILaunchImages: {
    UILaunchImageOrientation: string;
    UILaunchImageName: string;
    UILaunchImageSize: string;
    UILaunchImageMinimumOSVersion: string;
  }[];
  UIRequiredDeviceCapabilities: string[];
  UISupportedInterfaceOrientations: string[];
  icon: string;
  mobileProvision: {
    AppIDName: string;
    ApplicationIdentifierPrefix: string[];
    CreationDate: string;
    Platform: string[];
    DeveloperCertificates: any[];
    Entitlements: any;
    ExpirationDate: string;
    Name: string;
    ProvisionsAllDevices: boolean;
    TeamIdentifier: string[];
    TeamName: string;
    TimeToLive: number;
    UUID: string;
    Version: number;
  };
}

interface Activities {
  label: string;
  name: string;
  intentFilters: {
    actions: {
      name: string;
    }[];
    categories: {
      name: string;
    }[];
    data: any[];
  }[];
  metaData: any[];
}
export interface ApkInfoType {
  versionCode: number;
  versionName: string;
  package: string;
  usesPermissions: any[];
  permissions: any[];
  permissionTrees: any[];
  permissionGroups: any[];
  instrumentation: null;
  usesSdk: {
    minSdkVersion: number;
    targetSdkVersion: number;
  };
  usesConfiguration: null;
  usesFeatures: any[];
  supportsScreens: null;
  compatibleScreens: any[];
  supportsGlTextures: any[];
  application: {
    theme: string;
    label: { value: string; locate: string }[];
    icon: { value: string }[];
    debuggable: boolean;
    allowBackup: boolean;
    activities: Activities[];
    activityAliases: any[];
    launcherActivities: Activities[];
    services: any[];
    receivers: any[];
    providers: any[];
    usesLibraries: any[];
  };
  icon: string | null;
}
