import { Module } from '@nestjs/common';
import { CmdlineToolsController } from './cmdline.controller';
import { CmdlineToolsService } from './cmdline.service';

/**
 * Command Line Tools 模块
 * 提供 Android SDK 命令行工具的管理功能
 */
@Module({
  controllers: [CmdlineToolsController],
  providers: [CmdlineToolsService],
  exports: [CmdlineToolsService],
})
export class CmdlineToolsModule {}
