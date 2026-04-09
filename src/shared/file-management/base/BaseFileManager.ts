import * as fs from 'fs';
import * as path from 'path';
import { Logger } from '@nestjs/common';
import { IFileManager } from '../interfaces/IFileManager';

/**
 * 基础文件管理器抽象类
 * 实现 IFileManager 接口,提供文件和目录检测、创建的通用实现
 */
export abstract class BaseFileManager implements IFileManager {
  protected readonly logger: Logger;

  constructor(context: string = 'BaseFileManager') {
    this.logger = new Logger(context);
  }

  /**
   * 检查文件或目录是否存在
   * @param targetPath - 目标路径
   * @returns 是否存在
   */
  exists(targetPath: string): boolean {
    try {
      return fs.existsSync(targetPath);
    } catch (error) {
      this.logger.error(
        'BaseFileManager exists - 检查路径失败',
        error instanceof Error ? error.message : String(error),
      );
      return false;
    }
  }

  /**
   * 确保目录存在,如果不存在则创建
   * @param dirPath - 目录路径
   * @param recursive - 是否递归创建父目录(默认为 true)
   */
  ensureDirectory(dirPath: string, recursive = true): void {
    try {
      if (!fs.existsSync(dirPath)) {
        this.logger.debug(
          `BaseFileManager ensureDirectory - 创建目录: ${dirPath}`,
        );
        fs.mkdirSync(dirPath, { recursive });
      } else {
        this.logger.debug(
          `BaseFileManager ensureDirectory - 目录已存在: ${dirPath}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'BaseFileManager ensureDirectory - 创建目录失败',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 确保文件存在,如果不存在则创建空文件
   * @param filePath - 文件路径
   */
  ensureFile(filePath: string): void {
    try {
      if (!fs.existsSync(filePath)) {
        this.logger.debug(`BaseFileManager ensureFile - 创建文件: ${filePath}`);
        // 确保父目录存在
        const dirPath = path.dirname(filePath);
        this.ensureDirectory(dirPath);
        // 创建空文件
        fs.writeFileSync(filePath, '');
      } else {
        this.logger.debug(
          `BaseFileManager ensureFile - 文件已存在: ${filePath}`,
        );
      }
    } catch (error) {
      this.logger.error(
        'BaseFileManager ensureFile - 创建文件失败',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 删除文件或目录
   * @param targetPath - 目标路径
   * @param recursive - 是否为目录时递归删除(默认为 true)
   */
  remove(targetPath: string, recursive = true): void {
    try {
      if (fs.existsSync(targetPath)) {
        this.logger.debug(`BaseFileManager remove - 删除: ${targetPath}`);
        fs.rmSync(targetPath, { recursive, force: true });
      } else {
        this.logger.debug(`BaseFileManager remove - 路径不存在: ${targetPath}`);
      }
    } catch (error) {
      this.logger.error(
        'BaseFileManager remove - 删除失败',
        error instanceof Error ? error.message : String(error),
      );
      throw error;
    }
  }

  /**
   * 获取文件或目录信息
   * @param targetPath - 目标路径
   * @returns 文件统计信息,如果不存在返回 null
   */
  getStats(targetPath: string): fs.Stats | null {
    try {
      if (!fs.existsSync(targetPath)) {
        return null;
      }
      return fs.statSync(targetPath);
    } catch (error) {
      this.logger.error(
        'BaseFileManager getStats - 获取文件信息失败',
        error instanceof Error ? error.message : String(error),
      );
      return null;
    }
  }

  /**
   * [辅助方法] 验证路径格式
   * @param targetPath - 目标路径
   * @returns 是否为有效路径
   */
  protected isValidPath(targetPath: string): boolean {
    if (!targetPath || typeof targetPath !== 'string') {
      return false;
    }
    // 检查是否包含非法字符
    const invalidChars = /[<>:"|?*]/;
    return !invalidChars.test(targetPath);
  }

  /**
   * [辅助方法] 规范化路径
   * @param targetPath - 目标路径
   * @returns 规范化后的绝对路径
   */
  protected normalizePath(targetPath: string): string {
    return path.normalize(path.resolve(targetPath));
  }
}
