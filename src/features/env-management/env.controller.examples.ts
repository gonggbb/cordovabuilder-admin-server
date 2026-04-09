/**
 * 环境变量管理控制器 - Swagger 示例常量
 */

export const EXAMPLES = {
  getAllProfiles: {
    profiles: {
      default: {
        sdk: '30.0.3',
        gradle: '7.1.1',
        java: '11',
        node: '18.20.8',
      },
    },
    currentProfile: 'default',
  },

  getCurrentProfile: {
    profileName: 'default',
    profile: {
      sdk: '30.0.3',
      gradle: '7.1.1',
      java: '11',
      node: '18.20.8',
    },
  },

  switchProfileRequest: {
    profileName: 'production',
  },

  switchProfileSuccess: {
    success: true,
    message:
      '已成功切换到配置 "production"。注意:需要重启应用才能使新配置生效。',
    previousProfile: 'default',
    currentProfile: 'production',
  },

  switchProfileNotFound: {
    success: false,
    message: '配置 "production" 不存在',
  },

  saveProfileRequest: {
    profileName: 'development',
    profile: {
      sdk: '33.0.0',
      gradle: '8.0',
      java: '17',
      node: '20.0.0',
    },
  },

  saveProfileSuccess: {
    success: true,
    message: '已成功保存配置 "development"',
  },

  deleteProfileSuccess: {
    success: true,
    message: '已成功删除配置 "old-config"',
  },

  deleteProfileError: {
    success: false,
    message: '无法删除当前激活的配置 "default"',
  },

  getDefaultProfile: {
    sdk: '30.0.3',
    gradle: '7.1.1',
    java: '11',
    node: '18.20.8',
  },

  getCordovaPresets: [
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
  ],

  getCordovaPresetByName: {
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

  getCordovaPresetNotFound: {
    success: false,
    message: '未找到名为 "invalid-preset" 的 Cordova 预设配置',
  },

  createFromCordovaRequest: {
    presetName: 'cordova-13-ca15',
    profileName: 'my-cordova-project',
  },

  createFromCordovaSuccess: {
    success: true,
    message: '已从预设创建配置并保存',
    profile: {
      sdk: '36.0.0',
      gradle: '8.14.2',
      java: '17.0.10',
      node: '20.19.5',
    },
  },
} as const;
