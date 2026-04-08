import * as fs from 'fs';
import * as path from 'path';
import * as zlib from 'zlib';
import { pipeline } from 'stream';
import { getLogger } from './logger.utils';
import { getErrorMessage } from './error.utils';

const logger = getLogger('ArchiveUtils');

/**
 * 归档文件类型枚举
 */
export enum ArchiveType {
  TAR_GZ = 'tar.gz',
  ZIP = 'zip',
  UNKNOWN = 'unknown',
}

/**
 * [辅助方法] 识别归档文件类型
 * @param filePath - 文件路径
 * @returns 归档文件类型
 */
export function getArchiveType(filePath: string): ArchiveType {
  const ext = path.extname(filePath).toLowerCase();

  if (ext === '.gz' || ext === '.tgz') {
    return ArchiveType.TAR_GZ;
  } else if (ext === '.zip') {
    return ArchiveType.ZIP;
  }

  return ArchiveType.UNKNOWN;
}

/**
 * [辅助方法] 安全删除文件或目录
 * @param targetPath - 要删除的文件或目录路径
 */
function safeRemove(targetPath: string): void {
  try {
    if (fs.existsSync(targetPath)) {
      const stats = fs.statSync(targetPath);
      if (stats.isDirectory()) {
        fs.rmSync(targetPath, { recursive: true, force: true });
      } else {
        fs.unlinkSync(targetPath);
      }
      logger.debug(`已清理: ${targetPath}`);
    }
  } catch (error) {
    logger.warn(`清理失败 ${targetPath}:`, getErrorMessage(error));
  }
}

/**
 * [API] 自动识别并解压归档文件
 * 根据文件扩展名自动选择对应的解压方式
 * @param filePath - 压缩文件路径
 * @param destPath - 解压目标路径
 */
export async function extractArchive(
  filePath: string,
  destPath: string,
): Promise<void> {
  // 验证源文件是否存在
  if (!fs.existsSync(filePath)) {
    throw new Error(`压缩文件不存在: ${filePath}`);
  }

  const archiveType = getArchiveType(filePath);
  logger.debug(`检测到归档类型: ${archiveType}, 文件: ${filePath}`);

  switch (archiveType) {
    case ArchiveType.TAR_GZ:
      await extractTarGz(filePath, destPath);
      break;
    case ArchiveType.ZIP:
      await extractZip(filePath, destPath);
      break;
    default:
      throw new Error(`不支持的归档格式: ${path.extname(filePath)}`);
  }

  logger.log(`解压完成: ${filePath} → ${destPath}`);
}

/**
 * [辅助方法] 解压 tar.gz 文件
 * @param filePath - 压缩文件路径
 * @param destPath - 解压目标路径
 */
export async function extractTarGz(
  filePath: string,
  destPath: string,
): Promise<void> {
  logger.debug(`开始解压 tar.gz: ${filePath} → ${destPath}`);

  // 验证源文件
  if (!fs.existsSync(filePath)) {
    throw new Error(`tar.gz 文件不存在: ${filePath}`);
  }

  // 确保目标目录存在
  try {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
  } catch (error) {
    logger.error('创建目标目录失败:', getErrorMessage(error));
    throw new Error(`创建目录失败 ${destPath}: ${getErrorMessage(error)}`);
  }

  const gunzip = zlib.createGunzip();
  const tar = await import('tar');
  const extract = tar.extract({ cwd: destPath });

  const inputStream = fs.createReadStream(filePath);

  return new Promise((resolve, reject) => {
    pipeline(inputStream, gunzip, extract, (err) => {
      if (err) {
        const errorMsg = getErrorMessage(err);
        logger.error('tar.gz 解压失败:', errorMsg);

        // 清理不完整的解压内容
        safeRemove(destPath);

        reject(new Error(`tar.gz 解压失败: ${errorMsg}`));
      } else {
        logger.debug('tar.gz 解压成功');
        resolve();
      }
    });
  });
}

/**
 * [辅助方法] 解压 zip 文件
 * @param filePath - 压缩文件路径
 * @param destPath - 解压目标路径
 */
export async function extractZip(
  filePath: string,
  destPath: string,
): Promise<void> {
  logger.debug(`开始解压 zip: ${filePath} → ${destPath}`);

  // 验证源文件
  if (!fs.existsSync(filePath)) {
    throw new Error(`zip 文件不存在: ${filePath}`);
  }

  // 确保目标目录存在
  try {
    if (!fs.existsSync(destPath)) {
      fs.mkdirSync(destPath, { recursive: true });
    }
  } catch (error) {
    logger.error('创建目标目录失败:', getErrorMessage(error));
    throw new Error(`创建目录失败 ${destPath}: ${getErrorMessage(error)}`);
  }

  try {
    const extractZipModule = await import('extract-zip');
    const extractZipFn = extractZipModule.default;
    await extractZipFn(filePath, { dir: destPath });
    logger.debug('zip 解压成功');
  } catch (error) {
    const errorMsg = getErrorMessage(error);
    logger.error('zip 解压失败:', errorMsg);

    // 清理不完整的解压内容
    safeRemove(destPath);

    throw new Error(`zip 解压失败: ${errorMsg}`);
  }
}
