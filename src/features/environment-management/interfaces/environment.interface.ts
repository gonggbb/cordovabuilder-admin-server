export interface EnvironmentVersion {
    version: string;
    releaseDate: Date;
}

export interface CordovaVersionConfig {
    cordovaVersion: string;
    platforms: string[];
}

export interface EnvironmentStatus {
    status: 'stable' | 'beta' | 'deprecated';
    message?: string;
}