import { Module } from '@nestjs/common';
import { JavaController } from './java.controller';
import { JavaService } from './java.service';
import { FileManagementModule } from '@shared/file-management';

/**
 * Java 管理模块
 *
 * 该模块负责管理 Java 环境的相关功能，
 * 包括 JDK/JRE 版本管理、环境变量配置等。
 *
 * @module JavaManagementModule
 */
@Module({
  imports: [FileManagementModule],
  controllers: [JavaController],
  providers: [JavaService],
  exports: [JavaService],
})
export class JavaManagementModule {}
