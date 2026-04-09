import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { DownloadDirManager } from '@shared/file-management';
import { getLogger } from '@utils/logger.utils';
import { downloadFile } from '@utils/download.utils';

/**
 * Gradle 管理服务
 * 提供 Gradle 构建工具的核心业务逻辑和服务功能
 */
@Injectable()
export class GradleService {
  private readonly gradleInstallDir: string;
  private readonly downloadDir: string;
  private readonly logger = getLogger('GradleService');

  constructor(private readonly fileManager: DownloadDirManager) {
    // 使用环境变量指定的安装目录，如果未设置则根据平台设置默认路径

    this.gradleInstallDir = fileManager.getComponentExtractDir(
      process.env.GRADLE_HOME!,
    );

    // 使用环境变量指定的下载目录，如果未设置则使用默认值
    this.downloadDir = fileManager.getComponentDownloadDir(
      process.env.GRADLE_INSTALL_DIR!,
    );
    this.logger.debug(`GradleService 下载目录: ${this.downloadDir}`);
  }

  /**
   * 获取 Gradle 信息
   * 返回 Gradle 版本和配置信息
   * @returns 包含 Gradle 信息的对象
   */
  getInfo(): {
    version: string;
    installPath: string;
    platform: string;
    arch: string;
    isInstalled: boolean;
    gradleHome?: string;
  } {
    const platform = os.platform();
    const arch = os.arch();
    const isInstalled = this.checkGradleInstalled();

    return {
      version: this.getGradleVersion(),
      installPath: this.gradleInstallDir,
      platform,
      arch,
      isInstalled,
      gradleHome: isInstalled ? process.env.GRADLE_HOME : undefined,
    };
  }

  /**
   * 检查 Gradle 是否已安装
   * @returns 是否已安装
   */
  checkGradleInstalled(): boolean {
    try {
      const gradlePath = process.env.PATH?.split(path.delimiter).find((p) =>
        p.includes('gradle'),
      );
      return !!gradlePath || this.checkCommandExists('gradle');
    } catch {
      return false;
    }
  }

  /**
   * 获取 Gradle 版本
   * @returns 版本号
   */
  private getGradleVersion(): string {
    try {
      if (this.checkGradleInstalled()) {
        const stdout = execSync('gradle --version', {
          encoding: 'utf-8',
        });
        const match = stdout.match(/Gradle\s+([\d.]+)/);
        if (match && match[1]) {
          return match[1];
        }
      }
      return '未安装';
    } catch {
      return '未安装';
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
   * 下载指定版本的 Gradle
   * "success": false,"message": "下载 Gradle 失败：下载失败，HTTP 状态码：307"
   * 可能的重定向链:
     1. github.com → 307 → github-releases.githubusercontent.com
     2. github-releases.githubusercontent.com → 302 → s3.amazonaws.com
     3. s3.amazonaws.com → 200 OK (开始下载)
   * @param version - Gradle 版本号 (例如：'8.5')
   * @returns 下载结果
   */
  async downloadGradle(
    version: string,
  ): Promise<{ success: boolean; message: string; path?: string }> {
    try {
      const downloadUrl = this.getGradleDownloadUrl(version);
      this.logger.debug(`downloadUrl ${downloadUrl}`);

      if (!downloadUrl) {
        return {
          success: false,
          message: `无法构建 Gradle ${version} 的下载 URL`,
        };
      }

      const fileName = path.basename(downloadUrl);
      const filePath = path.join(this.downloadDir, fileName);

      // await this.downloadFile(downloadUrl, filePath);
      this.logger.debug(`开始下载 Gradle ${version} 到 ${filePath}`);
      await downloadFile(downloadUrl, filePath);

      return {
        success: true,
        message: `Gradle ${version} 已成功下载到 ${filePath}`,
        path: filePath,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        success: false,
        message: `下载 Gradle 失败：${errorMessage}`,
      };
    }
  }

  /**
   * 安装 Gradle
   * @param archivePath - 压缩包路径
   * @returns 安装结果
   */
  async installGradle(
    archivePath: string,
  ): Promise<{ success: boolean; message: string }> {
    try {
      // 确保安装目录存在
      if (!fs.existsSync(this.gradleInstallDir)) {
        fs.mkdirSync(this.gradleInstallDir, { recursive: true });
      }

      // 解压到临时目录
      const tempExtractDir = path.join(this.gradleInstallDir, 'temp-extract');
      await this.extractZip(archivePath, tempExtractDir);

      // 查找解压后的 gradle 目录
      const extractedDirs = fs.readdirSync(tempExtractDir);
      const gradleDirName = extractedDirs.find((dir) =>
        dir.startsWith('gradle-'),
      );

      if (!gradleDirName) {
        throw new Error('未找到 Gradle 安装目录');
      }

      const extractedGradleDir = path.join(tempExtractDir, gradleDirName);
      const targetDir = path.join(this.gradleInstallDir, gradleDirName);

      // 移动到目标位置
      if (fs.existsSync(targetDir)) {
        fs.rmSync(targetDir, { recursive: true, force: true });
      }
      fs.renameSync(extractedGradleDir, targetDir);
      fs.rmSync(tempExtractDir, { recursive: true, force: true });

      // 设置环境变量（需要用户手动添加到系统环境变量）
      const binDir = path.join(targetDir, 'bin');
      console.log(`Gradle 已安装到：${targetDir}`);
      console.log(`请将 ${binDir} 添加到 PATH 环境变量`);

      return {
        success: true,
        message: `Gradle 已成功安装到 ${targetDir}，请手动将 ${binDir} 添加到 PATH`,
      };
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '未知错误';
      return {
        success: false,
        message: `安装 Gradle 失败：${errorMessage}`,
      };
    }
  }

  /**
   * 获取 Gradle 下载 URL
   * https://github.com/gradle/gradle-distributions/releases
   * https://github.com/gradle/gradle-distributions/releases/download/v9.4.1/gradle-9.4.1-bin.zip
   * https://github.com/gradle/gradle-distributions/releases/download/v8.5.0/gradle-8.5-all.zip
   * {
  "success": false,
  "message": "下载 Gradle 失败：URL 不可达或不存在：https://github.com/gradle/gradle-distributions/releases/download/v8.5.0/gradle-8.5.0-all.zip"
}
   * @param version - 版本号 (例如: '9.4.1', 'v9.4.1', '8.5')
   * @returns 下载 URL
   */
  private getGradleDownloadUrl(version: string): string {
    // 去除 'v' 前缀,统一处理
    const tag = version.replace(/^v/i, '');

    // 标准化版本号格式: 确保是 x.y.z 格式
    const parts = tag.split('.');
    while (parts.length < 3) {
      parts.push('0'); // 补0,如 8.5 → 8.5.0
    }
    // GitHub Releases 标签格式: v + 标准化版本号
    const normalizedVersion = `v${parts.join('.')}`;
    this.logger.debug(`Normalized version: ${normalizedVersion}, Tag: ${tag}`);
    // 构建 GitHub Releases 下载 URL
    const baseUrl =
      'https://github.com/gradle/gradle-distributions/releases/download';
    return `${baseUrl}/${normalizedVersion}/gradle-${tag}-all.zip`;
  }

  /**
   * 解压 zip 文件
   * @param filePath - 压缩文件路径
   * @param destPath - 解压目标路径
   */
  private async extractZip(filePath: string, destPath: string): Promise<void> {
    const extractZipModule = await import('extract-zip');
    const extractZip = extractZipModule.default;
    await extractZip(filePath, { dir: destPath });
  }
}
