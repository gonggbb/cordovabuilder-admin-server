import { Module } from '@nestjs/common';
import { CmdlineToolsController } from './cmdline.controller';
import { CmdlineToolsService } from './cmdline.service';
import { FileManagementModule } from '@shared/file-management';

/**
 * Command Line Tools 模块
 * 提供 Android SDK 命令行工具的管理功能
 */
@Module({
  imports: [FileManagementModule],
  controllers: [CmdlineToolsController],
  providers: [CmdlineToolsService],
  exports: [CmdlineToolsService],
})
export class CmdlineToolsModule {}
