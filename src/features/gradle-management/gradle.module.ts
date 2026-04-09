import { Module } from '@nestjs/common';
import { GradleController } from './gradle.controller';
import { GradleService } from './gradle.service';
import { FileManagementModule } from '@shared/file-management';

/**
 * Gradle 管理模块
 *
 * 该模块负责管理 Gradle 构建工具的相关功能，
 * 包括版本管理、配置管理和构建任务执行。
 *
 * @module GradleModule
 */
@Module({
  imports: [FileManagementModule],
  controllers: [GradleController],
  providers: [GradleService],
})
export class GradleManagementModule {}
