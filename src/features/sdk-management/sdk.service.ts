import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import {
  getErrorMessage,
  getErrorMessageOrDefault,
} from '@common/utils/error.utils';

/**
 * Android SDK 管理服务
 * 提供 Android SDK 整体管理功能（包括 platform-tools, platforms, build-tools 等）
 */
@Injectable()
export class SdkService {
  private readonly sdkRoot: string;
  private readonly platformsDir: string;
  private readonly buildToolsDir: string;
  private readonly platformToolsDir: string;

  constructor() {
    // 使用环境变量指定的 SDK 根目录，如果未设置则根据平台设置默认路径
    const platform = os.platform();

    this.sdkRoot =
      process.env.ANDROID_HOME ||
      (platform === 'linux'
        ? '/opt/android-sdk'
        : platform === 'win32'
          ? path.join('C:', 'Android', 'android-sdk')
          : path.join(os.homedir(), 'Library', 'Android', 'sdk'));

    this.platformsDir = path.join(this.sdkRoot, 'platforms');
    this.buildToolsDir = path.join(this.sdkRoot, 'build-tools');
    this.platformToolsDir = path.join(this.sdkRoot, 'platform-tools');
  }

  /**
   * 获取 SDK 信息
   * @returns SDK 配置信息
   */
  getInfo(): {
    sdkRoot: string;
    platformsPath: string;
    buildToolsPath: string;
    platformToolsPath: string;
    platform: string;
    installedPlatforms: string[];
    installedBuildTools: string[];
    hasPlatformTools: boolean;
  } {
    const platform = os.platform();

    return {
      sdkRoot: this.sdkRoot,
      platformsPath: this.platformsDir,
      buildToolsPath: this.buildToolsDir,
      platformToolsPath: this.platformToolsDir,
      platform,
      installedPlatforms: this.getInstalledPlatforms(),
      installedBuildTools: this.getInstalledBuildTools(),
      hasPlatformTools: fs.existsSync(this.platformToolsDir),
    };
  }

  /**
   * 获取已安装的 Android 平台列表
   * @returns 已安装的平台版本列表
   */
  private getInstalledPlatforms(): string[] {
    if (!fs.existsSync(this.platformsDir)) {
      return [];
    }

    const platforms = fs.readdirSync(this.platformsDir);
    return platforms.filter((dir) => dir.startsWith('android-'));
  }

  /**
   * 获取已安装的 Build Tools 列表
   * @returns 已安装的 Build Tools 版本列表
   */
  private getInstalledBuildTools(): string[] {
    if (!fs.existsSync(this.buildToolsDir)) {
      return [];
    }

    return fs.readdirSync(this.buildToolsDir);
  }

  /**
   * 检查 SDK 组件是否已安装
   * @param componentType - 组件类型
   * @param version - 版本号
   * @returns 是否已安装
   */
  checkComponentInstalled(
    componentType: 'platform' | 'build-tools' | 'platform-tools',
    version?: string,
  ): boolean {
    if (componentType === 'platform') {
      if (!version) return false;
      return fs.existsSync(path.join(this.platformsDir, `android-${version}`));
    } else if (componentType === 'build-tools') {
      if (!version) return false;
      return fs.existsSync(path.join(this.buildToolsDir, version));
    } else if (componentType === 'platform-tools') {
      return fs.existsSync(this.platformToolsDir);
    }
    return false;
  }

  /**
   * 获取 SDK 磁盘使用情况
   * @returns SDK 目录大小（字节）
   */
  getSdkDiskUsage(): {
    success: boolean;
    sizeBytes?: number;
    message?: string;
  } {
    try {
      if (!fs.existsSync(this.sdkRoot)) {
        return {
          success: false,
          message: 'SDK 目录不存在',
        };
      }

      const size = this.getDirectorySize(this.sdkRoot);

      return {
        success: true,
        sizeBytes: size,
      };
    } catch (error) {
      return {
        success: false,
        message: `获取 SDK 大小失败：${getErrorMessage(error)}`,
      };
    }
  }

  /**
   * 计算目录大小
   * @param dirPath - 目录路径
   * @returns 目录大小（字节）
   */
  private getDirectorySize(dirPath: string): number {
    let totalSize = 0;

    const files = fs.readdirSync(dirPath);

    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);

      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }

    return totalSize;
  }

  /**
   * 清理缓存文件
   * @returns 清理结果
   */
  cleanCache(): { success: boolean; message: string; freedBytes?: number } {
    try {
      const cacheDir = path.join(this.sdkRoot, '.cache');

      if (!fs.existsSync(cacheDir)) {
        return {
          success: true,
          message: '没有缓存需要清理',
          freedBytes: 0,
        };
      }

      const sizeBefore = this.getDirectorySize(cacheDir);

      fs.rmSync(cacheDir, { recursive: true, force: true });

      return {
        success: true,
        message: '已成功清理缓存',
        freedBytes: sizeBefore,
      };
    } catch (error) {
      return {
        success: false,
        message: `清理缓存失败：${getErrorMessage(error)}`,
      };
    }
  }

  /**
   * 验证 SDK 安装
   * @returns 验证结果
   */
  validateSdkInstallation(): {
    success: boolean;
    isValid?: boolean;
    issues?: string[];
    message?: string;
  } {
    const issues: string[] = [];

    // 检查 SDK 根目录
    if (!fs.existsSync(this.sdkRoot)) {
      issues.push(`SDK 根目录不存在：${this.sdkRoot}`);
    }

    // 检查 platform-tools
    if (!fs.existsSync(this.platformToolsDir)) {
      issues.push('缺少 platform-tools');
    } else if (!fs.existsSync(path.join(this.platformToolsDir, 'adb'))) {
      issues.push('platform-tools 中缺少 adb 工具');
    }

    // 检查至少一个 platform
    const platforms = this.getInstalledPlatforms();
    if (platforms.length === 0) {
      issues.push('未安装任何 Android 平台');
    }

    // 检查至少一个 build-tools
    const buildTools = this.getInstalledBuildTools();
    if (buildTools.length === 0) {
      issues.push('未安装任何 Build Tools');
    }

    if (issues.length > 0) {
      return {
        success: true,
        isValid: false,
        issues,
        message: `发现 ${issues.length} 个问题`,
      };
    }

    return {
      success: true,
      isValid: true,
      message: 'SDK 安装验证通过',
    };
  }

  /**
   * 获取 ADB 路径
   * @returns ADB 可执行文件路径
   */
  getAdbPath(): string {
    const adbPath = path.join(this.platformToolsDir, 'adb');
    return os.platform() === 'win32' ? `${adbPath}.exe` : adbPath;
  }

  /**
   * 执行 ADB 命令
   * @param args - ADB 命令参数
   * @returns 执行结果
   */
  executeAdbCommand(args: string[]): {
    success: boolean;
    output?: string;
    error?: string;
  } {
    try {
      const adbPath = this.getAdbPath();

      if (!fs.existsSync(adbPath)) {
        return {
          success: false,
          error: 'ADB 未找到，请先安装 platform-tools',
        };
      }

      const cmd = `"${adbPath}" ${args.join(' ')}`;

      const output = execSync(cmd, {
        encoding: 'utf-8',
        env: {
          ...process.env,
          ANDROID_HOME: this.sdkRoot,
          ANDROID_SDK_ROOT: this.sdkRoot,
        },
      });

      return {
        success: true,
        output,
      };
    } catch (error) {
      return {
        success: false,
        error: getErrorMessageOrDefault(error, '执行 ADB 命令失败'),
      };
    }
  }
}
