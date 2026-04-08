import { Module } from '@nestjs/common';
import { DownloadDirManager } from './impl/DownloadDirManager';

/**
 * 文件管理模块
 * 提供文件和目录管理的核心功能
 */
@Module({
  providers: [DownloadDirManager],
  exports: [DownloadDirManager],
})
export class FileManagementModule {}
