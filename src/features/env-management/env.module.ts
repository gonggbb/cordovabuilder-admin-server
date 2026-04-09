import { Module } from '@nestjs/common';
import { EnvController } from './env.controller';
import { EnvService } from './env.service';

/**
 * 环境变量管理模块
 * 提供环境配置的保存、加载和切换功能
 */
@Module({
  controllers: [EnvController],
  providers: [EnvService],
  exports: [EnvService],
})
export class EnvModule {}
