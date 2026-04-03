import { Module } from '@nestjs/common';
import { SdkController } from './sdk.controller';
import { SdkService } from './sdk.service';

/**
 * SDK 管理模块
 *
 * 该模块负责管理 SDK 的相关功能，
 * 包括 SDK 下载、更新、配置等操作。
 *
 * @module SdkModule
 */
@Module({
  imports: [],
  controllers: [SdkController],
  providers: [SdkService],
  exports: [SdkService],
})
export class SdkModule {}
