export interface EnvProfile {
  sdk: string;
  gradle: string;
  java: string;
  node: string;
}

export interface EnvProfiles {
  profiles: Record<string, EnvProfile>;
  currentProfile: string;
}

export interface CordovaPreset {
  name: string;
  description: string;
  cordovaVersion: string;
  cordovaAndroid: string;
  buildTools: string;
  profile: EnvProfile;
}
