import { Injectable } from '@nestjs/common';
import { execSync } from 'child_process';
import { promisify } from 'util';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import * as https from 'https';
import * as http from 'http';
import { pipeline } from 'stream';

const pipelineAsync = promisify(pipeline);

/**
 * Gradle 管理服务
 * 提供 Gradle 构建工具的核心业务逻辑和服务功能
 */
@Injectable()
export class GradleService {
  private readonly gradleInstallDir: string;
  private readonly downloadDir: string;

  constructor() {
    // 使用环境变量指定的安装目录，如果未设置则根据平台设置默认路径
    const platform = os.platform();

    this.gradleInstallDir =
      process.env.GRADLE_INSTALL_DIR ||
      (platform === 'linux'
        ? '/opt/gradle'
        : platform === 'win32'
          ? path.join('C:', 'Gradle')
          : path.join(os.homedir(), '.gradle'));

    // 使用环境变量指定的下载目录，如果未设置则使用默认值
    this.downloadDir = process.env.DOWNLOAD_DIR
      ? path.join(process.env.DOWNLOAD_DIR, 'gradle')
      : path.join(process.cwd(), 'downloads');

    // 确保下载目录存在
    if (!fs.existsSync(this.downloadDir)) {
      fs.mkdirSync(this.downloadDir, { recursive: true });
    }
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
   * @param version - Gradle 版本号 (例如：'8.5')
   * @returns 下载结果
   */
  async downloadGradle(
    version: string,
  ): Promise<{ success: boolean; message: string; path?: string }> {
    try {
      const downloadUrl = this.getGradleDownloadUrl(version);

      if (!downloadUrl) {
        return {
          success: false,
          message: `无法构建 Gradle ${version} 的下载 URL`,
        };
      }

      const fileName = path.basename(downloadUrl);
      const filePath = path.join(this.downloadDir, fileName);

      await this.downloadFile(downloadUrl, filePath);

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
   * @param version - 版本号
   * @returns 下载 URL
   */
  private getGradleDownloadUrl(version: string): string {
    const baseUrl = 'https://services.gradle.org/distributions';
    return `${baseUrl}/gradle-${version}-bin.zip`;
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
          pipelineAsync(response, fileStream)
            .then(() => resolve())
            .catch((err) =>
              reject(err instanceof Error ? err : new Error(String(err))),
            );
        })
        .on('error', reject);
    });
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
