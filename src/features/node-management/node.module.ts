import { Module } from '@nestjs/common';
import { NodeController } from './node.controller';
import { NodeService } from './node.service';
import { FileManagementModule } from '@features/file-management';

/**
 * Node 管理模块
 *
 * 该模块负责管理 Node.js 环境的相关功能，
 * 包括版本检测、安装、切换和管理。
 *
 * @module NodeManagementModule
 */
@Module({
  imports: [FileManagementModule],
  controllers: [NodeController],
  providers: [NodeService],
})
export class NodeManagementModule {}
