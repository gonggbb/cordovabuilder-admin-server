import { Injectable } from '@nestjs/common';
import { exec, execSync } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as os from 'os';

const execAsync = promisify(exec);

/**
 * Node 管理服务
 * 提供 Node.js 环境管理的核心业务逻辑和服务功能
 */
@Injectable()
export class NodeService {
  // 使用环境变量指定的下载目录，如果未设置则使用默认值
  private readonly downloadDir: string;
  // 使用环境变量指定的安装目录，如果未设置则使用默认值
  private readonly nodeInstallDir: string;

  constructor() {
    this.downloadDir = process.env.DOWNLOAD_DIR
      ? path.join(process.env.DOWNLOAD_DIR, 'node')
      : path.join(process.cwd(), 'downloads');

    this.nodeInstallDir =
      process.env.NODE_INSTALL_DIR || path.join(process.cwd(), 'nodejs');
  }

  /**
   * 获取 Node 信息
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
      installPath: this.nodeInstallDir,
      platform,
      arch,
      isInstalled,
      npmVersion: isInstalled ? this.getNpmVersion() : undefined,
    };
  }

  /**
   * 检查 Node.js 是否已安装
   * @returns 是否已安装
   */
  checkNodeInstalled(): boolean {
    try {
      const nodePath = process.env.PATH?.split(path.delimiter).find((p) =>
        p.includes('node'),
      );
      return !!nodePath || this.checkCommandExists('node');
    } catch {
      return false;
    }
  }

  /**
   * 获取 Node.js 版本
   * @returns 版本号
   */
  private getNodeVersion(): string {
    try {
      if (this.checkNodeInstalled()) {
        const stdout = execSync('node --version', {
          encoding: 'utf-8',
        });
        return stdout.trim();
      }
      return '未安装';
    } catch {
      return '未安装';
    }
  }

  /**
   * 获取 npm 版本
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
   * 检查命令是否存在
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
   * 下载指定版本的 Node.js
   * 使用 wget 工具从官方源下载 Node.js 安装包
   * @param version - Node.js 版本号 (例如：'v18.16.0')
   * @param platform - 操作系统平台 (例如：'linux', 'win', 'darwin')
   * @param arch - 系统架构 (例如：'x64', 'x86', 'arm64')
   * @returns 下载结果信息
   * https://nodejs.org/dist/v25.9.0/node-v25.9.0-linux-x64.tar.xz
   * https://nodejs.org/dist/v25.9.0/node-v25.9.0-win-x64.zip
   * https://nodejs.org/dist/v25.9.0/node-v25.9.0-darwin-x64.tar.gz
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
      await this.ensureDownloadDir();

      // 使用 wget 下载文件
      const command = `wget -O "${outputPath}" "${downloadUrl}"`;

      console.log(`开始下载 Node.js ${version}...`);
      console.log(`下载 URL: ${downloadUrl}`);
      console.log(`保存路径：${outputPath}`);

      const { stdout, stderr } = await execAsync(command);

      if (
        stderr &&
        !stderr.includes('Connecting to') &&
        !stderr.includes('HTTP request sent')
      ) {
        console.error('下载过程中的警告:', stderr);
      }

      console.log('下载完成:', stdout);

      return {
        success: true,
        message: `Node.js ${version} 已成功下载到 ${outputPath}`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      console.error('下载失败:', errorMessage);
      return {
        success: false,
        message: `下载失败：${errorMessage}`,
      };
    }
  }

  /**
   * 构建 Node.js 下载 URL
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
    if (platform === 'linux') {
      return `${baseUrl}/${normalizedVersion}/node-${normalizedVersion}-linux-${arch}.tar.xz`;
    } else if (platform === 'win') {
      return `${baseUrl}/${normalizedVersion}/node-${normalizedVersion}-win-${arch}.zip`;
    } else if (platform === 'darwin') {
      return `${baseUrl}/${normalizedVersion}/node-${normalizedVersion}.pkg`;
    }

    return null;
  }

  /**
   * 获取下载文件名
   * @param version - 版本号
   * @param platform - 平台
   * @param arch - 架构
   * @returns 文件名
   */
  private getFileName(version: string, platform: string, arch: string): string {
    const normalizedVersion = version.startsWith('v') ? version : `v${version}`;

    if (platform === 'linux') {
      return `node-${normalizedVersion}-linux-${arch}.tar.xz`;
    } else if (platform === 'win') {
      return `node-${normalizedVersion}-win-${arch}.zip`;
    } else if (platform === 'darwin') {
      return `node-${normalizedVersion}.pkg`;
    }

    return `node-${normalizedVersion}`;
  }

  /**
   * 确保下载目录存在
   */
  private async ensureDownloadDir(): Promise<void> {
    try {
      // 在 Windows 上使用 mkdir 命令创建目录
      await execAsync(`mkdir "${this.downloadDir}"`);
    } catch {
      // 目录已存在，忽略错误
    }
  }
}
