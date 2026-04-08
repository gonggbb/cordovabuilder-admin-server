import * as fs from 'fs';

/**
 * 文件管理器接口
 * 定义文件和目录检测、创建的标准操作契约
 */
export interface IFileManager {
  /**
   * 检查文件或目录是否存在
   * @param targetPath - 目标路径
   * @returns 是否存在
   */
  exists(targetPath: string): boolean;

  /**
   * 确保目录存在,如果不存在则创建
   * @param dirPath - 目录路径
   * @param recursive - 是否递归创建父目录
   */
  ensureDirectory(dirPath: string, recursive?: boolean): void;

  /**
   * 确保文件存在,如果不存在则创建空文件
   * @param filePath - 文件路径
   */
  ensureFile(filePath: string): void;

  /**
   * 删除文件或目录
   * @param targetPath - 目标路径
   * @param recursive - 是否为目录时递归删除
   */
  remove(targetPath: string, recursive?: boolean): void;

  /**
   * 获取文件或目录信息
   * @param targetPath - 目标路径
   * @returns 文件统计信息
   */
  getStats(targetPath: string): fs.Stats | null;
}
