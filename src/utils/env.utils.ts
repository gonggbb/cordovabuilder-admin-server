import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import dotenv from 'dotenv';
import { getConfigDir } from '@utils/path.utils';
import { getLogger } from '@utils/logger.utils';

// 创建日志实例
const logger = getLogger('EnvConfig');

/**
 * 根据 PLATFORM 配置加载对应的平台环境文件
 */
export function loadPlatformConfig(): void {
  // 根目录下的 config 目录路径
  const configDir = getConfigDir();
  logger.debug(`Config directory: ${configDir}`);

  // 首先加载基础 .env 文件获取 PLATFORM 变量
  const baseEnvPath = path.join(configDir, '.env');
  logger.debug(`Base env path: ${baseEnvPath}`);

  if (fs.existsSync(baseEnvPath)) {
    dotenv.config({ path: baseEnvPath });
  }

  // 读取 PLATFORM 配置，如果未设置则根据操作系统自动检测
  const platform = process.env.PLATFORM || os.platform();

  if (!platform) {
    logger.warn(`未设置 PLATFORM，自动检测到当前平台: ${platform}`);
  }

  // 根据平台加载对应的配置文件
  const platformEnvFiles = {
    win32: '.env.win32',
    linux: '.env.linux',
    darwin: '.env.darwin',
  };

  const platformEnvFile =
    platformEnvFiles[platform as keyof typeof platformEnvFiles];

  if (platformEnvFile) {
    const platformEnvPath = path.join(configDir, platformEnvFile);

    if (fs.existsSync(platformEnvPath)) {
      // 重新加载平台特定配置（覆盖基础配置）
      dotenv.config({ path: platformEnvPath, override: true });
      logger.log(`✓ 已加载平台配置: ${platformEnvFile} (PLATFORM=${platform})`);
    } else {
      logger.warn(`⚠ 警告：平台配置文件不存在: ${platformEnvPath}`);
    }
  } else {
    logger.warn(`⚠ 警告：不支持的平台类型: ${platform}`);
    logger.warn(`  支持的平台: win, linux, macos`);
  }
}
