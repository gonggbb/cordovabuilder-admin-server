import { Injectable } from '@nestjs/common';
import * as path from 'path';
import * as fs from 'fs';
import { BaseFileManager } from '../base/BaseFileManager';
import { resolveFromRoot } from '@common/utils/path.utils';

/**
 * 下载目录管理器
 * 继承 BaseFileManager 实现特定的下载目录管理功能
 */
@Injectable()
export class DownloadDirManager extends BaseFileManager {
  private readonly downloadBaseDir: string;
  // 解压目录
  private readonly extractDir: string;

  constructor() {
    super('DownloadDirManager'); // 传递 logger 上下文
    // 使用环境变量指定的下载根目录
    this.downloadBaseDir = resolveFromRoot(
      process.env.DOWNLOAD_DIR || 'downloads',
    );
    // 确保基础下载目录存在
    this.ensureDirectory(this.downloadBaseDir);
    this.logger.debug(`DownloadDirManager 下载根目录: ${this.downloadBaseDir}`);
    // 解压目录
    this.extractDir = resolveFromRoot(process.env.EXTRACT_DIR || 'extract');
    this.ensureDirectory(this.extractDir);
    this.logger.debug(`DownloadDirManager 解压目录: ${this.extractDir}`);
  }

  /**
   * [API] 确保解压目录存在,如果不存在则创建
   * @param dirPath - 解压目录路径
   */
  getComponentExtractDir(componentName: string): string {
    const componentDir = path.join(this.extractDir, componentName);
    this.ensureDirectory(componentDir);
    return componentDir;
  }

  /**
   * [API] 获取特定组件的下载目录
   * @param componentName - 组件名称 (如 'node', 'gradle', 'cmdline-tools')
   * @returns 组件下载目录路径
   */
  getComponentDownloadDir(componentName: string): string {
    const componentDir = path.join(this.downloadBaseDir, componentName);
    this.ensureDirectory(componentDir);
    return componentDir;
  }

  /**
   * [API] 清理指定组件的下载文件
   * @param componentName - 组件名称
   * @returns 清理结果
   */
  cleanComponentDownloads(componentName: string): {
    success: boolean;
    message: string;
  } {
    try {
      const componentDir = this.getComponentDownloadDir(componentName);
      if (this.exists(componentDir)) {
        this.remove(componentDir, true);
        this.ensureDirectory(componentDir);
        return {
          success: true,
          message: `已清理 ${componentName} 的下载文件`,
        };
      }
      return {
        success: true,
        message: `${componentName} 下载目录不存在,无需清理`,
      };
    } catch (error) {
      return {
        success: false,
        message: `清理失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * [API] 获取下载目录使用情况
   * @returns 目录大小信息
   */
  getDownloadDirUsage(): {
    success: boolean;
    sizeBytes?: number;
    message?: string;
  } {
    try {
      if (!this.exists(this.downloadBaseDir)) {
        return {
          success: false,
          message: '下载目录不存在',
        };
      }

      const stats = this.getStats(this.downloadBaseDir);
      if (!stats) {
        return {
          success: false,
          message: '无法获取目录信息',
        };
      }

      return {
        success: true,
        sizeBytes: this.calculateDirectorySize(this.downloadBaseDir),
      };
    } catch (error) {
      return {
        success: false,
        message: `获取目录使用情况失败: ${error instanceof Error ? error.message : String(error)}`,
      };
    }
  }

  /**
   * [辅助方法] 递归计算目录大小
   * @param dirPath - 目录路径
   * @returns 目录总大小(字节)
   */
  private calculateDirectorySize(dirPath: string): number {
    let totalSize = 0;

    try {
      const files = this.readdirSyncSafe(dirPath);
      for (const file of files) {
        const filePath = path.join(dirPath, file);
        const stats = this.getStats(filePath);

        if (stats) {
          if (stats.isDirectory()) {
            totalSize += this.calculateDirectorySize(filePath);
          } else {
            totalSize += stats.size;
          }
        }
      }
    } catch (error) {
      this.logger.error(
        '[Helper] calculateDirectorySize - 计算目录大小失败',
        error instanceof Error ? error.message : String(error),
      );
    }

    return totalSize;
  }

  /**
   * [辅助方法] 安全读取目录内容
   * @param dirPath - 目录路径
   * @returns 文件列表
   */
  private readdirSyncSafe(dirPath: string): string[] {
    try {
      return fs.readdirSync(dirPath);
    } catch (error) {
      this.logger.error(
        '[Helper] readdirSyncSafe - 读取目录失败',
        error instanceof Error ? error.message : String(error),
      );
      return [];
    }
  }
}
