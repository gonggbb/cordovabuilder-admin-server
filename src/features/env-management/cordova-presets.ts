import type { CordovaPreset } from '@type/env.types';

/**
 * Cordova 官方推荐的依赖版本组合预设
 * 基于不同版本的 cordova-android 平台要求
 */
export const CORDOVA_PRESETS: CordovaPreset[] = [
  {
    name: 'cordova-12-ca11',
    description: 'Cordova 12 + cordova-android 11.0.x',
    cordovaVersion: '12.x',
    cordovaAndroid: '11.0.x',
    buildTools: '^32.0.0',
    profile: {
      sdk: '32.0.0',
      gradle: '7.4.2',
      java: '11',
      node: '18.20.8',
    },
  },
  {
    name: 'cordova-12-ca12',
    description: 'Cordova 12 + cordova-android 12.0.x',
    cordovaVersion: '12.x',
    cordovaAndroid: '12.0.x',
    buildTools: '^33.0.2',
    profile: {
      sdk: '33.0.2',
      gradle: '7.6',
      java: '17.0.10',
      node: '18.20.8',
    },
  },
  {
    name: 'cordova-13-ca13',
    description: 'Cordova 13 + cordova-android 13.0.x',
    cordovaVersion: '13.x',
    cordovaAndroid: '13.0.x',
    buildTools: '^34.0.0',
    profile: {
      sdk: '34.0.0',
      gradle: '8.7',
      java: '17.0.10',
      node: '20.19.5',
    },
  },
  {
    name: 'cordova-13-ca14',
    description: 'Cordova 13 + cordova-android 14.0.x',
    cordovaVersion: '13.x',
    cordovaAndroid: '14.0.x',
    buildTools: '^35.0.0',
    profile: {
      sdk: '35.0.0',
      gradle: '8.13',
      java: '17.0.10',
      node: '20.19.5',
    },
  },
  {
    name: 'cordova-13-ca15',
    description: 'Cordova 13 + cordova-android 15.0.x',
    cordovaVersion: '13.x',
    cordovaAndroid: '15.0.x',
    buildTools: '^36.0.0',
    profile: {
      sdk: '36.0.0',
      gradle: '8.14.2',
      java: '17.0.10',
      node: '20.19.5',
    },
  },
];
