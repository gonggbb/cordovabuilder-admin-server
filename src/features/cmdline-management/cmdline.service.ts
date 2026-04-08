import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';
import extractZip from 'extract-zip';
import { getLogger } from '@common/utils/logger.utils';
import { downloadFile } from '@common/utils/download.utils';
import { DownloadDirManager } from '@features/file-management';

const execAsync = promisify(exec);

/**
 * Android SDK Command Line Tools 管理服务
 * 提供 Android SDK 命令行工具的管理功能
 */
@Injectable()
export class CmdlineToolsService {
  private readonly sdkRoot: string;
  private readonly cmdlineToolsDir: string;
  private readonly downloadDir: string;
  private readonly logger = getLogger('CmdlineToolsService');

  constructor(private readonly fileManager: DownloadDirManager) {
    // 使用环境变量指定的 SDK 根目录，如果未设置则根据平台设置默认路径

    this.sdkRoot = this.fileManager.getComponentExtractDir(
      process.env.ANDROID_HOME!,
    );

    this.logger.debug(`Android SDK 根目录 sdkRoot：${this.sdkRoot}`);
    this.cmdlineToolsDir = path.join(this.sdkRoot, 'cmdline-tools');

    this.logger.debug(
      `Android SDK 根目录 cmdlineTools Dir：${this.cmdlineToolsDir}`,
    );

    // 使用环境变量指定的下载目录，如果未设置则使用默认值
    this.downloadDir = this.fileManager.getComponentDownloadDir(
      process.env.CMDLINE_TOOLS_INSTALL_DIR!,
    );
  }

  /**
   * 获取 Command Line Tools 信息
   * @returns Command Line Tools 信息
   */
  getInfo(): {
    sdkRoot: string;
    cmdlineToolsPath: string;
    platform: string;
    isInstalled: boolean;
    version?: string;
  } {
    const platform = os.platform();
    const isInstalled = this.checkCmdlineToolsInstalled();

    return {
      sdkRoot: this.sdkRoot,
      cmdlineToolsPath: this.cmdlineToolsDir,
      platform,
      isInstalled,
      version: isInstalled ? this.getCmdlineToolsVersion() : undefined,
    };
  }

  /**
   * 检查 Command Line Tools 是否已安装
   * @returns 是否已安装
   */
  checkCmdlineToolsInstalled(): boolean {
    const latestDir = path.join(this.cmdlineToolsDir, 'latest');
    const binPath = path.join(latestDir, 'bin', 'sdkmanager');
    return fs.existsSync(binPath) || fs.existsSync(binPath + '.bat');
  }

  /**
   * 获取 Command Line Tools 版本
   * @returns 版本号
   */
  private getCmdlineToolsVersion(): string {
    try {
      const latestDir = path.join(this.cmdlineToolsDir, 'latest');
      const sourcePropertiesPath = path.join(latestDir, 'source.properties');

      if (fs.existsSync(sourcePropertiesPath)) {
        const content = fs.readFileSync(sourcePropertiesPath, 'utf-8');
        const match = content.match(/Pkg\.Revision=(.+)/);
        if (match) {
          return match[1].trim();
        }
      }
      return 'unknown';
    } catch {
      return 'unknown';
    }
  }

  /**
   * 下载 Command Line Tools
   * @param version - 版本号
   * @param platform - 平台
   * @returns 下载结果
   */
  async downloadCmdlineTools(
    version?: string,
    platform?: string,
  ): Promise<{ success: boolean; message: string; path?: string }> {
    try {
      const currentPlatform = platform || os.platform();

      // 构建下载 URL
      const downloadUrl = this.getCmdlineToolsDownloadUrl(
        version,
        currentPlatform,
      );

      if (!downloadUrl) {
        return {
          success: false,
          message: `不支持的平台：${currentPlatform}`,
        };
      }

      const fileName = path.basename(downloadUrl);
      const filePath = path.join(this.downloadDir, fileName);

      // await this.downloadFile(downloadUrl, filePath);
      await downloadFile(downloadUrl, filePath);

      return {
        success: true,
        message: `Command Line Tools 已成功下载到 ${filePath}`,
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `下载 Command Line Tools 失败：${(error as Error).message}`,
      };
    }
  }

  /**
   * 安装 Command Line Tools
   * @param archivePath - 压缩包路径
   * @returns 安装结果
   */
  async installCmdlineTools(
    archivePath: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 确保 cmdline-tools 目录存在
      if (!fs.existsSync(this.cmdlineToolsDir)) {
        fs.mkdirSync(this.cmdlineToolsDir, { recursive: true });
      }

      // 解压到临时目录
      const tempExtractDir = path.join(this.cmdlineToolsDir, 'temp-extract');
      await this.extractZip(archivePath, tempExtractDir);

      // 移动到 latest 目录
      const latestDir = path.join(this.cmdlineToolsDir, 'latest');

      // 删除已存在的 latest 目录
      if (fs.existsSync(latestDir)) {
        fs.rmSync(latestDir, { recursive: true, force: true });
      }

      // 查找解压后的 cmdline-tools 目录
      const extractedCmdlineTools = path.join(tempExtractDir, 'cmdline-tools');
      if (fs.existsSync(extractedCmdlineTools)) {
        fs.renameSync(extractedCmdlineTools, latestDir);
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
      } else {
        // 如果解压后直接就是 cmdline-tools 的内容，移动到 latest
        fs.renameSync(tempExtractDir, latestDir);
      }

      // 设置执行权限（Linux/Mac）
      if (os.platform() !== 'win32') {
        const binDir = path.join(latestDir, 'bin');
        if (fs.existsSync(binDir)) {
          fs.chmodSync(path.join(binDir, 'sdkmanager'), '755');
          fs.chmodSync(path.join(binDir, 'avdmanager'), '755');
        }
      }

      return {
        success: true,
        message: `Command Line Tools 已成功安装到 ${latestDir}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `安装 Command Line Tools 失败：${(error as Error).message}`,
      };
    }
  }

  /**
   * 使用 sdkmanager 安装 SDK 组件
   * @param packages - 要安装的包列表
   * @returns 安装结果
   */
  async installSdkPackages(packages: string[]): Promise<{
    success: boolean;
    message: string;
    installedPackages?: string[];
  }> {
    try {
      const latestDir = path.join(this.cmdlineToolsDir, 'latest');
      const sdkManagerPath = path.join(latestDir, 'bin', 'sdkmanager');

      if (!fs.existsSync(sdkManagerPath)) {
        return {
          success: false,
          message: 'sdkmanager 未找到，请先安装 Command Line Tools',
        };
      }

      // 构建命令
      const cmd =
        os.platform() === 'win32'
          ? `"${sdkManagerPath}.bat" ${packages.join(' ')}`
          : `"${sdkManagerPath}" ${packages.join(' ')}`;

      // 设置环境变量
      const env = {
        ...process.env,
        ANDROID_HOME: this.sdkRoot,
        ANDROID_SDK_ROOT: this.sdkRoot,
      };

      try {
        // 执行命令（自动接受许可证）
        if (os.platform() === 'win32') {
          // Windows 不支持 yes 命令，直接执行
          await execAsync(cmd, {
            env,
            encoding: 'utf-8',
          });
        } else {
          // Linux/Mac 使用 yes 自动接受许可证
          await execAsync(`yes | ${cmd}`, {
            env,
            encoding: 'utf-8',
          });
        }
      } catch (err) {
        // 如果失败，尝试不使用 yes 命令
        if (os.platform() !== 'win32') {
          await execAsync(cmd, {
            env,
            encoding: 'utf-8',
          });
        } else {
          throw err;
        }
      }

      return {
        success: true,
        message: `成功安装 SDK 组件：${packages.join(', ')}`,
        installedPackages: packages,
      };
    } catch (error) {
      return {
        success: false,
        message: `安装 SDK 组件失败：${(error as Error).message}`,
      };
    }
  }

  /**
   * 列出已安装的 SDK 组件
   * @returns 已安装的组件列表
   */
  async listInstalledPackages(): Promise<{
    success: boolean;
    packages?: string[];
    message?: string;
  }> {
    try {
      const latestDir = path.join(this.cmdlineToolsDir, 'latest');
      const sdkManagerPath = path.join(latestDir, 'bin', 'sdkmanager');

      if (!fs.existsSync(sdkManagerPath)) {
        return {
          success: false,
          message: 'sdkmanager 未找到',
        };
      }

      const cmd =
        os.platform() === 'win32'
          ? `"${sdkManagerPath}.bat" --list_installed`
          : `"${sdkManagerPath}" --list_installed`;

      const env = {
        ...process.env,
        ANDROID_HOME: this.sdkRoot,
        ANDROID_SDK_ROOT: this.sdkRoot,
      };

      const { stdout } = await execAsync(cmd, {
        env,
        encoding: 'utf-8',
      });

      // 解析输出，提取已安装的包
      const lines = stdout.split('\n');
      const installedPackages: string[] = [];

      for (const line of lines) {
        if (line.startsWith('    ')) {
          const match = line.match(/\s*([a-z0-9\-_.;]+)\s*/);
          if (match && match[1]) {
            installedPackages.push(match[1]);
          }
        }
      }

      return {
        success: true,
        packages: installedPackages,
      };
    } catch (error) {
      return {
        success: false,
        message: `列出已安装包失败：${(error as Error).message}`,
      };
    }
  }

  /**
   * 接受所有 SDK 许可证
   * @returns 接受结果
   */
  async acceptLicenses(): Promise<{ success: boolean; message: string }> {
    try {
      const latestDir = path.join(this.cmdlineToolsDir, 'latest');
      const sdkManagerPath = path.join(latestDir, 'bin', 'sdkmanager');

      if (!fs.existsSync(sdkManagerPath)) {
        return {
          success: false,
          message: 'sdkmanager 未找到',
        };
      }

      const cmd =
        os.platform() === 'win32'
          ? `"${sdkManagerPath}.bat" --licenses`
          : `"${sdkManagerPath}" --licenses`;

      const env = {
        ...process.env,
        ANDROID_HOME: this.sdkRoot,
        ANDROID_SDK_ROOT: this.sdkRoot,
      };

      // 自动接受所有许可证
      if (os.platform() === 'win32') {
        await execAsync(`echo y| ${cmd}`, {
          env,
          encoding: 'utf-8',
        });
      } else {
        await execAsync(`yes | ${cmd}`, {
          env,
          encoding: 'utf-8',
        });
      }

      return {
        success: true,
        message: '已成功接受所有 SDK 许可证',
      };
    } catch (error) {
      return {
        success: false,
        message: `接受许可证失败：${(error as Error).message}`,
      };
    }
  }

  /**
   * 获取 Command Line Tools 下载 URL
   * @param version - 版本号
   * @param platform - 平台
   * @returns 下载 URL
   */
  private getCmdlineToolsDownloadUrl(
    version?: string,
    platform?: string,
  ): string | null {
    const currentPlatform = platform || os.platform();

    // 默认使用最新版本
    const versionNum = version || '14742923';

    const platformMap: Record<string, string> = {
      linux: 'linux',
      win32: 'windows',
      darwin: 'mac',
    };

    const osName = platformMap[currentPlatform];
    if (!osName) {
      return null;
    }

    // Google 官方 Command Line Tools 下载 URL
    return `https://dl.google.com/android/repository/commandlinetools-${osName}-${versionNum}_latest.zip`;
  }

  /**
   * 解压 zip 文件
   * @param filePath - 压缩文件路径
   * @param destPath - 解压目标路径
   */
  private async extractZip(filePath: string, destPath: string): Promise<void> {
    await extractZip(filePath, { dir: destPath });
  }
}
