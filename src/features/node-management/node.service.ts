import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';
import {
  isLinux,
  isWindows,
  isMacOS,
  getFileExtensionByPlatform,
} from '@common/utils/platform.utils';
import { downloadFile } from '@common/utils/download.utils';
import { resolveFromRoot } from '@common/utils/path.utils';
import { getLogger } from '@common/utils/logger.utils';

/**
 * Node 管理服务
 * 提供 Node.js 环境管理的核心业务逻辑和服务功能
 */
@Injectable()
export class NodeService {
  private readonly logger = getLogger('NodeService');

  // 使用环境变量指定的下载目录,如果未设置则使用项目根目录下的
  private readonly downloadDir = resolveFromRoot(
    process.env.DOWNLOAD_DIR!, //非空断言运算符（!）
    process.env.NODE_INSTALL_DIR!,
  );
  constructor() {}

  // ==================== API 调用方法（公开接口）====================

  /**
   * [API] 获取 Node 信息
   * 返回 Node.js 版本和配置信息
   * @returns Node.js 相关信息对象
   */
  getInfo(): {
    version: string;
    installPath: string;
    platform: string;
    arch: string;
    isInstalled: boolean;
    npmVersion?: string;
  } {
    const platform = os.platform();
    const arch = os.arch();
    const isInstalled = this.checkNodeInstalled();

    return {
      version: this.getNodeVersion(),
      installPath: this.downloadDir,
      platform,
      arch,
      isInstalled,
      npmVersion: isInstalled ? this.getNpmVersion() : undefined,
    };
  }

  /**
   * [API] 检查 Node.js 是否已安装
   * @returns 是否已安装
   */
  checkNodeInstalled(): boolean {
    try {
      const nodePath = process.env.PATH?.split(path.delimiter).find((p) =>
        p.includes('node'),
      );
      this.logger.debug(`检测到 Node.js 路径: ${nodePath}`);
      return !!nodePath || this.checkCommandExists('node');
    } catch {
      return false;
    }
  }

  /**
   * [API] 下载指定版本的 Node.js
   * https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-x64.tar.xz
   * https://nodejs.org/dist/v25.9.0/node-v25.9.0-win-x64.zip
   * https://nodejs.org/dist/v25.9.0/node-v25.9.0-darwin-x64.tar.gz
   * 
   * 检测到 Node.js 路径: C:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server\node_modules\.bin
    开始下载 Node.js v18.16.0...
    下载 URL: https://nodejs.org/dist/v18.16.0/node-v18.16.0-linux-x64.tar.xz
    保存路径：C:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server\downloads\node-install\node-v18.16.0-linux-x64.tar.xz

   * 使用 Node.js 原生 HTTP 模块进行跨平台下载
   * @param version - Node.js 版本号 (例如：'v18.16.0')
   * @param platform - 操作系统平台 (例如：'linux', 'win', 'darwin')
   * @param arch - 系统架构 (例如：'x64', 'x86', 'arm64')
   * @returns 下载结果信息
   */
  async downloadNode(
    version: string,
    platform: string = process.platform,
    arch: string = process.arch,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 构建下载 URL
      const downloadUrl = this.buildDownloadUrl(version, platform, arch);

      if (!downloadUrl) {
        return {
          success: false,
          message: `不支持的平台或架构：${platform}/${arch}`,
        };
      }

      // 构建本地文件路径
      const fileName = this.getFileName(version, platform, arch);
      const outputPath = path.join(this.downloadDir, fileName);

      // 确保下载目录存在
      this.ensureDownloadDir();

      this.logger.log(`开始下载 Node.js ${version}...`);
      this.logger.debug(`下载 URL: ${downloadUrl}`);
      this.logger.debug(`保存路径：${outputPath}`);

      // 使用 Node.js 原生 HTTP 模块下载（跨平台兼容）
      await downloadFile(downloadUrl, outputPath);

      this.logger.log('下载完成');

      return {
        success: true,
        message: `Node.js ${version} 已成功下载到 ${outputPath}`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      this.logger.error(`下载失败: ${errorMessage}`);
      return {
        success: false,
        message: `下载失败：${errorMessage}`,
      };
    }
  }

  // ==================== 辅助方法（私有实现）====================

  /**
   * [辅助方法] 获取 Node.js 版本
   * @returns 版本号
   */
  private getNodeVersion(): string {
    try {
      if (this.checkNodeInstalled()) {
        const stdout = execSync('node --version', {
          encoding: 'utf-8',
        });
        this.logger.debug(`检测到 Node.js 版本: ${stdout.trim()}`);
        return stdout.trim();
      }
      return '未安装';
    } catch {
      return '未安装';
    }
  }

  /**
   * [辅助方法] 获取 npm 版本
   * @returns 版本号
   */
  private getNpmVersion(): string {
    try {
      if (this.checkNodeInstalled()) {
        const stdout = execSync('npm --version', {
          encoding: 'utf-8',
        });
        return stdout.trim();
      }
      return '未知';
    } catch {
      return '未知';
    }
  }

  /**
   * [辅助方法] 检查命令是否存在
   * @param command - 命令名称
   * @returns 是否存在
   */
  private checkCommandExists(command: string): boolean {
    try {
      const cmd =
        os.platform() === 'win32' ? `where ${command}` : `which ${command}`;
      execSync(cmd, { stdio: 'ignore' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * [辅助方法] 构建 Node.js 下载 URL
   * @param version - 版本号
   * @param platform - 平台
   * @param arch - 架构
   * @returns 下载 URL 字符串
   */
  private buildDownloadUrl(
    version: string,
    platform: string,
    arch: string,
  ): string | null {
    const baseUrl = 'https://nodejs.org/dist';

    // 规范化版本号格式
    const normalizedVersion = version.startsWith('v') ? version : `v${version}`;

    // 根据平台构建文件名
    if (isLinux(platform)) {
      return `${baseUrl}/${normalizedVersion}/node-${normalizedVersion}-linux-${arch}.tar.xz`;
    } else if (isWindows(platform)) {
      return `${baseUrl}/${normalizedVersion}/node-${normalizedVersion}-win-${arch}.zip`;
    } else if (isMacOS(platform)) {
      return `${baseUrl}/${normalizedVersion}/node-${normalizedVersion}.pkg`;
    }

    return null;
  }

  /**
   * [辅助方法] 获取下载文件名
   * @param version - 版本号
   * @param platform - 平台
   * @param arch - 架构
   * @returns 文件名
   */
  private getFileName(version: string, platform: string, arch: string): string {
    const normalizedVersion = version.startsWith('v') ? version : `v${version}`;
    const extension = getFileExtensionByPlatform(platform);

    if (isLinux(platform)) {
      return `node-${normalizedVersion}-linux-${arch}.${extension}`;
    } else if (isWindows(platform)) {
      return `node-${normalizedVersion}-win-${arch}.${extension}`;
    } else if (isMacOS(platform)) {
      return `node-${normalizedVersion}.${extension}`;
    }

    return `node-${normalizedVersion}`;
  }

  /**
   * [辅助方法] 确保下载目录存在
   */
  private ensureDownloadDir(): void {
    try {
      if (!fs.existsSync(this.downloadDir)) {
        fs.mkdirSync(this.downloadDir, { recursive: true });
      }
    } catch (error) {
      this.logger.error(
        '创建下载目录失败',
        error instanceof Error ? error.stack : String(error),
      );
      throw error;
    }
  }
}
