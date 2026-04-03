import { NestFactory } from '@nestjs/core';
import * as os from 'os';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
console.log(
  'Starting CordovaBuilder Admin API Server...',
  process.env.NODE_INSTALL_DIR,
  process.env.PORT,
  os.platform(), //win32, linux, darwin
  os.arch(), //x64, arm64
);
/**
 * 启动并配置 NestJS 应用程序
 * 该函数创建应用程序实例并监听指定端口
 * @returns Promise<void> 异步启动过程
 */
async function bootstrap() {
  // 创建 NestJS 应用程序实例
  const app = await NestFactory.create(AppModule);

  // 配置 Swagger 文档
  const config = new DocumentBuilder()
    .setTitle('CordovaBuilder Admin API')
    .setDescription('CordovaBuilder 项目管理后端服务器 API 文档')
    .setVersion('1.0')
    .addTag('java', 'Java 管理相关接口')
    .addTag('gradle', 'Gradle 管理相关接口')
    .addTag('node', 'Node.js 管理相关接口')
    .addTag('sdk', 'SDK 管理相关接口')
    .addTag('cmdline-tools', 'Android SDK Command Line Tools 管理相关接口')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // 启动服务器并监听端口（使用环境变量中的端口或默认 3000 端口）
  await app.listen(process.env.PORT ?? 3000);
}

// 执行启动函数
bootstrap();
