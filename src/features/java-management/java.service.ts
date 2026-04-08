import { Injectable } from '@nestjs/common';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import * as zlib from 'zlib';
import { pipeline } from 'stream';
import extractZip from 'extract-zip';
import { getErrorMessage } from '@common/utils/error.utils';
import {
  getJdkPlatformIdentifier,
  getNormalizedArchName,
} from '@common/utils/platform.utils';
import { getLogger } from '@common/utils/logger.utils';
import { DownloadDirManager } from '@features/file-management';
import { downloadFile } from '@common/utils/download.utils';

/**
 * Java 管理服务
 * 提供 Java 环境管理的核心业务逻辑和服务功能
 */
@Injectable()
export class JavaService {
  private readonly javaInstallDir: string;
  private readonly downloadDir: string;
  private readonly logger = getLogger('JavaService');

  constructor(private readonly fileManager: DownloadDirManager) {
    this.javaInstallDir = this.fileManager.getComponentExtractDir(
      process.env.JAVA_HOME!,
    );

    // 使用环境变量指定的下载目录，如果未设置则使用默认值
    this.downloadDir = this.fileManager.getComponentDownloadDir(
      process.env.JAVA_INSTALL_DIR!,
    );
    // C:\Users\user\AppData\Local\Temp
    this.logger.debug(`JavaService 下载目录: ${os.tmpdir()}`);
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

      // await this.downloadFile(downloadUrl, filePath);
      // await this.downloadFile(downloadUrl, filePath);
      await downloadFile(downloadUrl, filePath);

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
   * 免费 OpenJDK 发行版：如 Adoptium、Amazon Corretto、Azul Zulu 等，这些版本提供长期免费商用授权，避免 Oracle 的收费政策限制。
   * Adoptium (Temurin) JDK 下载 URL 格式示例：
   * https://github.com/adoptium/temurin17-binaries/releases/download/jdk-17.0.12%2B7/OpenJDK17U-jdk_x64_linux_hotspot_17.0.12_7.tar.gz
     https://github.com/adoptium/temurin11-binaries/releases/download/jdk-11.0.29%2B7/OpenJDK11U-jdk_x64_linux_hotspot_11.0.29_7.tar.gz
   * Oracle JDK 不适用
   * https://www.oracle.com/java/technologies/downloads/archive/
   * https://download.oracle.com/java/21/latest/jdk-21_linux-x64_bin.tar.gz
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
    // 11.0.30+7 -> 11.0.30_7
    const versionNum = version.replace(/^j?dk-?/i, '').replace(/\+/g, '_');
    // 11.0.30_7 -> 11.0.30%2B7
    const decodeVersionNum = versionNum.replace(/_/g, '%2B');

    const majorVersion = versionNum.split('.')[0];
    this.logger.debug(
      `构建 JDK 下载 URL，version=${version}, platform=${platform}, arch=${arch}`,
    );

    const osName = getJdkPlatformIdentifier(platform);
    const archName = getNormalizedArchName(arch);
    this.logger.debug(
      `构建 JDK 下载 URL，osName=${osName}, archName=${archName}`,
    );
    if (!osName || !archName) {
      return null;
    }
    const downloadUrl = `https://github.com/adoptium/temurin${majorVersion}-binaries/releases/download/jdk-${decodeVersionNum}/OpenJDK${majorVersion}U-jdk_${archName}_${osName}_hotspot_${versionNum}.tar.gz`;

    this.logger.debug(`构建 JDK 下载 URL，${downloadUrl}`);
    // Adoptium Temurin JDK 下载 URL 格式
    return downloadUrl;
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
