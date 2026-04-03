import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import * as https from 'https';
import * as http from 'http';
import { pipeline } from 'stream';
import extractZip from 'extract-zip';
import { getErrorMessage } from '@common/utils/error.utils';

/**
 * Java 管理服务
 * 提供 Java 环境管理的核心业务逻辑和服务功能
 */
@Injectable()
export class JavaService {
  private readonly javaInstallDir: string;
  private readonly downloadDir: string;

  constructor() {
    // 使用环境变量指定的安装目录，如果未设置则根据平台设置默认路径
    const platform = os.platform();

    this.javaInstallDir =
      process.env.JAVA_INSTALL_DIR ||
      (platform === 'linux'
        ? '/opt/java/java'
        : platform === 'win32'
          ? path.join('C:', 'Program Files', 'Java', 'jdk')
          : path.join(os.homedir(), '.java'));

    // 使用环境变量指定的下载目录，如果未设置则使用默认值
    this.downloadDir = process.env.DOWNLOAD_DIR
      ? path.join(process.env.DOWNLOAD_DIR, 'java')
      : path.join(os.tmpdir(), 'java-downloads');

    // 确保下载目录存在
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
  }

  /**
   * 获取 Java 信息
   * 返回 Java 版本和配置信息
   * @returns 包含 Java 信息的对象
   */
  getInfo(): {
    version: string;
    installPath: string;
    platform: string;
    arch: string;
    isInstalled: boolean;
  } {
    const platform = os.platform();
    const arch = os.arch();
    const isInstalled = this.checkJavaInstalled();

    return {
      version: this.getJavaVersion(),
      installPath: this.javaInstallDir,
      platform,
      arch,
      isInstalled,
    };
  }

  /**
   * 检查 Java 是否已安装
   * @returns 是否已安装
   */
  checkJavaInstalled(): boolean {
    return (
      fs.existsSync(this.javaInstallDir) &&
      fs.existsSync(path.join(this.javaInstallDir, 'bin', 'java'))
    );
  }

  /**
   * 获取 Java 版本
   * @returns Java 版本号
   */
  private getJavaVersion(): string {
    // 简化实现，实际应该执行 java -version 命令
    return '17.0.10';
  }

  /**
   * 下载 JDK
   * @param version - JDK 版本号
   * @param platform - 操作系统平台
   * @param arch - 系统架构
   * @returns 下载结果
   */
  async downloadJdk(
    version: string,
    platform?: string,
    arch?: string,
  ): Promise<{ success: boolean; message: string; path?: string }> {
    try {
      const currentPlatform = platform || os.platform();
      const currentArch = arch || os.arch();

      // 构建下载 URL（以 Oracle JDK 为例）
      const downloadUrl = this.getJdkDownloadUrl(
        version,
        currentPlatform,
        currentArch,
      );

      if (!downloadUrl) {
        return {
          success: false,
          message: `不支持的_platform=${currentPlatform}或_arch=${currentArch}组合`,
        };
      }

      const fileName = path.basename(downloadUrl);
      const filePath = path.join(this.downloadDir, fileName);

      await this.downloadFile(downloadUrl, filePath);

      return {
        success: true,
        message: `JDK ${version} 已成功下载到 ${filePath}`,
        path: filePath,
      };
    } catch (error) {
      return {
        success: false,
        message: `下载 JDK 失败：${getErrorMessage(error)}`,
      };
    }
  }

  /**
   * 解压并安装 JDK
   * @param archivePath - 压缩包路径
   * @param installPath - 安装路径
   * @returns 安装结果
   */
  async installJdk(
    archivePath: string,
    installPath?: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      const targetPath = installPath || this.javaInstallDir;

      // 确保目标目录存在
      const parentDir = path.dirname(targetPath);
      if (!fs.existsSync(parentDir)) {
        fs.mkdirSync(parentDir, { recursive: true });
      }

      // 根据文件扩展名选择解压方式
      if (archivePath.endsWith('.tar.gz')) {
        await this.extractTarGz(archivePath, targetPath);
      } else if (archivePath.endsWith('.zip')) {
        await this.extractZip(archivePath, targetPath);
      } else {
        return {
          success: false,
          message: `不支持的压缩格式：${archivePath}`,
        };
      }

      return {
        success: true,
        message: `JDK 已成功安装到 ${targetPath}`,
      };
    } catch (error) {
      return {
        success: false,
        message: `安装 JDK 失败：${getErrorMessage(error)}`,
      };
    }
  }

  /**
   * 获取 JDK 下载 URL
   * @param version - 版本号
   * @param platform - 平台
   * @param arch - 架构
   * @returns 下载 URL
   */
  private getJdkDownloadUrl(
    version: string,
    platform: string,
    arch: string,
  ): string | null {
    // 这里可以根据不同的 JDK 提供商（Oracle、OpenJDK、Adoptium 等）返回不同的 URL
    // 示例：使用 Adoptium (Temurin) JDK
    const versionNum = version.replace(/^j?dk-?/i, '');
    const majorVersion = versionNum.split('.')[0];

    const platformMap: Record<string, string> = {
      linux: 'linux',
      win32: 'windows',
      darwin: 'mac',
    };

    const archMap: Record<string, string> = {
      x64: 'x64',
      arm64: 'aarch64',
      aarch64: 'aarch64',
    };

    const osName = platformMap[platform];
    const archName = archMap[arch];

    if (!osName || !archName) {
      return null;
    }

    // Adoptium Temurin JDK 下载 URL 格式
    return `https://github.com/adoptium/temurin${majorVersion}-binaries/releases/download/jdk-${versionNum}%2B/OpenJDK${majorVersion}U-jdk_${osName}_${archName}_hotspot_${versionNum}.tar.gz`;
  }

  /**
   * 下载文件
   * @param url - 下载 URL
   * @param dest - 目标路径
   */
  private async downloadFile(url: string, dest: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const protocol = url.startsWith('https') ? https : http;

      protocol
        .get(url, (response) => {
          if (response.statusCode === 301 || response.statusCode === 302) {
            // 处理重定向
            this.downloadFile(response.headers.location!, dest)
              .then(resolve)
              .catch(reject);
            return;
          }

          if (response.statusCode !== 200) {
            reject(new Error(`下载失败，HTTP 状态码：${response.statusCode}`));
            return;
          }

          const fileStream = fs.createWriteStream(dest);
          pipeline(response, fileStream, (err) => {
            if (err) {
              reject(err);
            } else {
              resolve();
            }
          });
        })
        .on('error', reject);
    });
  }

  /**
   * 解压 tar.gz 文件
   * @param filePath - 压缩文件路径
   * @param destPath - 解压目标路径
   */
  private async extractTarGz(
    filePath: string,
    destPath: string,
  ): Promise<void> {
    const gunzip = zlib.createGunzip();
    const tar = await import('tar');
    const extract = tar.extract({ cwd: destPath });

    const inputStream = fs.createReadStream(filePath);

    return new Promise((resolve, reject) => {
      pipeline(inputStream, gunzip, extract, (err) => {
        if (err) {
          reject(new Error(getErrorMessage(err)));
        } else {
          resolve();
        }
      });
    });
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
