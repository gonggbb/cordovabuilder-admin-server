import * as fs from 'fs';
import * as path from 'path';
import { Injectable, Logger } from '@nestjs/common';
import { getAppRootDir } from '@utils/path.utils';
import { getErrorMessage } from '@utils/error.utils';
import { CORDOVA_PRESETS } from './cordova-presets';
import type {
  CordovaPreset,
  EnvProfile,
  EnvProfiles,
} from 'src/type/env.types';

/**
 * 环境变量管理服务
 * 负责管理不同版本的环境配置
 */
@Injectable()
export class EnvService {
  private readonly logger = new Logger(EnvService.name);
  private readonly configPath: string;
  private readonly defaultProfile: EnvProfile = {
    sdk: '30.0.3',
    gradle: '7.1.1',
    java: '11',
    node: '18.20.8',
  };

  constructor() {
    // 配置文件路径: config/env-profiles.json
    const rootDir = getAppRootDir();
    this.configPath = path.join(rootDir, 'config', 'env-profiles.json');

    // 确保配置文件存在
    this.ensureConfigFile();
  }

  /**
   * 确保配置文件存在,如果不存在则创建默认配置
   */
  private ensureConfigFile(): void {
    if (!fs.existsSync(this.configPath)) {
      const defaultConfig: EnvProfiles = {
        profiles: {
          default: { ...this.defaultProfile },
        },
        currentProfile: 'default',
      };

      this.writeConfig(defaultConfig);
      this.logger.log('已创建默认环境配置文件');
    }
  }

  /**
   * 读取配置文件
   * @returns 环境配置对象
   */
  private readConfig(): EnvProfiles {
    try {
      const content = fs.readFileSync(this.configPath, 'utf-8');
      return JSON.parse(content) as EnvProfiles;
    } catch (error) {
      this.logger.error(`读取配置文件失败: ${getErrorMessage(error)}`);
      throw new Error('读取环境配置文件失败');
    }
  }

  /**
   * 写入配置文件
   * @param config - 配置对象
   */
  private writeConfig(config: EnvProfiles): void {
    try {
      const dir = path.dirname(this.configPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        this.configPath,
        JSON.stringify(config, null, 2),
        'utf-8',
      );
    } catch (error) {
      this.logger.error(`写入配置文件失败: ${getErrorMessage(error)}`);
      throw new Error('写入环境配置文件失败');
    }
  }

  /**
   * 获取所有环境配置
   * @returns 包含所有配置和当前激活配置的列表
   */
  getAllProfiles(): {
    profiles: Record<string, EnvProfile>;
    currentProfile: string;
  } {
    const config = this.readConfig();
    return config;
  }

  /**
   * 获取当前激活的环境配置
   * @returns 当前配置名称和配置详情
   */
  getCurrentProfile(): {
    profileName: string;
    profile: EnvProfile;
  } {
    const config = this.readConfig();
    const currentProfile = config.currentProfile;
    const profile = config.profiles[currentProfile];

    if (!profile) {
      throw new Error(`当前配置 "${currentProfile}" 不存在`);
    }

    return {
      profileName: currentProfile,
      profile,
    };
  }

  /**
   * 切换到指定的环境配置
   * @param profileName - 配置名称
   * @returns 切换结果
   */
  switchProfile(profileName: string): {
    success: boolean;
    message: string;
    previousProfile?: string;
    currentProfile?: string;
  } {
    const config = this.readConfig();

    // 验证配置是否存在
    if (!config.profiles[profileName]) {
      return {
        success: false,
        message: `配置 "${profileName}" 不存在`,
      };
    }

    const previousProfile = config.currentProfile;
    config.currentProfile = profileName;
    this.writeConfig(config);

    this.logger.log(
      `环境配置已从 "${previousProfile}" 切换到 "${profileName}"`,
    );

    return {
      success: true,
      message: `已成功切换到配置 "${profileName}"。注意:需要重启应用才能使新配置生效。`,
      previousProfile,
      currentProfile: profileName,
    };
  }

  /**
   * 保存新的环境配置
   * @param profileName - 配置名称
   * @param profile - 配置详情
   * @returns 保存结果
   */
  saveProfile(
    profileName: string,
    profile: Partial<EnvProfile>,
  ): {
    success: boolean;
    message: string;
  } {
    if (!profileName || profileName.trim() === '') {
      return {
        success: false,
        message: '配置名称不能为空',
      };
    }

    const config = this.readConfig();

    // 合并配置,未提供的字段使用默认值或现有值
    const existingProfile = config.profiles[profileName] || {};
    const mergedProfile: EnvProfile = {
      sdk: profile.sdk || existingProfile.sdk || this.defaultProfile.sdk,
      gradle:
        profile.gradle || existingProfile.gradle || this.defaultProfile.gradle,
      java: profile.java || existingProfile.java || this.defaultProfile.java,
      node: profile.node || existingProfile.node || this.defaultProfile.node,
    };

    config.profiles[profileName] = mergedProfile;
    this.writeConfig(config);

    this.logger.log(`已保存环境配置 "${profileName}"`);

    return {
      success: true,
      message: `已成功保存配置 "${profileName}"`,
    };
  }

  /**
   * 删除指定的环境配置
   * @param profileName - 配置名称
   * @returns 删除结果
   */
  deleteProfile(profileName: string): {
    success: boolean;
    message: string;
  } {
    const config = this.readConfig();

    // 不允许删除当前激活的配置
    if (profileName === config.currentProfile) {
      return {
        success: false,
        message: `无法删除当前激活的配置 "${profileName}"`,
      };
    }

    // 不允许删除最后一个配置
    const profileCount = Object.keys(config.profiles).length;
    if (profileCount <= 1) {
      return {
        success: false,
        message: '至少需要保留一个配置',
      };
    }

    // 检查配置是否存在
    if (!config.profiles[profileName]) {
      return {
        success: false,
        message: `配置 "${profileName}" 不存在`,
      };
    }

    delete config.profiles[profileName];
    this.writeConfig(config);

    this.logger.log(`已删除环境配置 "${profileName}"`);

    return {
      success: true,
      message: `已成功删除配置 "${profileName}"`,
    };
  }

  /**
   * 获取默认配置
   * @returns 默认配置对象
   */
  getDefaultProfile(): EnvProfile {
    return { ...this.defaultProfile };
  }

  /**
   * 获取所有 Cordova 预设配置
   * @returns Cordova 预设配置列表
   */
  getCordovaPresets(): CordovaPreset[] {
    return CORDOVA_PRESETS as CordovaPreset[];
  }

  /**
   * 根据名称获取特定的 Cordova 预设配置
   * @param presetName - 预设名称
   * @returns Cordova 预设配置,如果不存在则返回 null
   */
  getCordovaPresetByName(presetName: string): CordovaPreset | null {
    const presets = CORDOVA_PRESETS as CordovaPreset[];
    const preset = presets.find((p) => p.name === presetName);
    return preset ?? null;
  }

  /**
   * 从 Cordova 预设创建配置
   * @param presetName - 预设名称
   * @param profileName - 要保存的配置名称(可选,默认使用预设名称)
   * @returns 创建结果
   */
  createFromCordovaPreset(
    presetName: string,
    profileName?: string,
  ): {
    success: boolean;
    message: string;
    profile?: EnvProfile;
  } {
    const preset = this.getCordovaPresetByName(presetName);

    if (!preset) {
      return {
        success: false,
        message: `未找到名为 "${presetName}" 的 Cordova 预设配置`,
      };
    }

    const targetProfileName = profileName || presetName;
    const result = this.saveProfile(targetProfileName, preset.profile);

    if (result.success) {
      return {
        success: true,
        message: `已从预设 "${presetName}" 创建配置 "${targetProfileName}"。${result.message}`,
        profile: preset.profile,
      };
    }

    return result;
  }
}
