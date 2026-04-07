import * as path from 'path';

/**
 * 获取项目根目录
 * 从 src/common/utils/ 向上三级到达项目根目录
 * @returns 项目根目录的绝对路径
 */
export function getAppRootDir(): string {
  return path.resolve(__dirname, '../../..');
}

/**
 * 从项目根目录解析路径
 * @param paths - 要拼接的路径片段
 * @returns 完整的绝对路径
 * @example
 * resolveFromRoot('node-install') // => /project/node-install
 * resolveFromRoot('config', '.env') // => /project/config/.env
 */
export function resolveFromRoot(...paths: string[]): string {
  return path.join(getAppRootDir(), ...paths);
}

/**
 * 获取配置目录路径
 * @returns 配置目录的绝对路径
 */
export function getConfigDir(): string {
  return path.join(getAppRootDir(), 'config');
}

/**
 * 获取下载目录路径
 * @param subPath - 可选的子路径
 * @returns 下载目录的绝对路径
 */
export function getDownloadsDir(subPath?: string): string {
  const downloadsDir = path.join(getAppRootDir(), 'downloads');
  return subPath ? path.join(downloadsDir, subPath) : downloadsDir;
}
