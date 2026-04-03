import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { GradleManagementModule } from './features/gradle-management/gradle.module';
import { JavaManagementModule } from './features/java-management/java.module';
import { NodeManagementModule } from './features/node-management/node.module';
import { SdkModule } from './features/sdk-management/sdk.module';
import { CmdlineToolsModule } from './features/cmdline-management/cmdline.module';

/**
 * 应用模块定义
 *
 * 该模块是 NestJS 应用程序的根模块，负责组织和配置应用程序的核心组件。
 * 它导入必要的依赖模块，注册控制器和提供者服务。
 *
 * @module AppModule - 根模块
 */
@Module({
  imports: [
    JavaManagementModule,
    GradleManagementModule,
    NodeManagementModule,
    SdkModule,
    CmdlineToolsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
