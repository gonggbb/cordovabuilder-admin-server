import * as os from 'os';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { loadPlatformConfig } from '@utils/env.utils';
import { getLogger } from '@utils/logger.utils';

// 在应用启动前加载平台配置
loadPlatformConfig();

// 创建全局 Logger 实例
const logger = getLogger('Bootstrap');

logger.log('Starting CordovaBuilder Admin API Server...');
logger.debug(`Node Install Dir: ${process.env.NODE_INSTALL_DIR}`);
logger.debug(`Port: ${process.env.PORT}`);
logger.debug(`Platform: ${os.platform()} (${os.arch()})`);

/**
 * 启动并配置 NestJS 应用程序
 * 该函数创建应用程序实例并监听指定端口
 * @returns Promise<void> 异步启动过程
 */
async function bootstrap() {
  // 创建 NestJS 应用程序实例，配置日志选项
  const app = await NestFactory.create(AppModule, {
    logger: ['error', 'warn', 'log', 'debug', 'verbose'], // 启用所有日志级别
  });

  // 启用 CORS 支持
  const corsOrigins = process.env.CORS_ORIGINS?.split(',') || ['*'];
  app.enableCors({
    origin: corsOrigins.includes('*') ? true : corsOrigins,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  // 获取实际使用的端口
  const port = process.env.PORT ?? 3000;

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

  logger.log('Swagger documentation enabled at /api/docs');

  // 启动服务器并监听端口
  await app.listen(port);

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`API Documentation: http://localhost:${port}/api/docs`);
}

// 执行启动函数
bootstrap().catch((error: unknown) => {
  const errorMessage = error instanceof Error ? error.stack : String(error);
  logger.error('Failed to start application', errorMessage);
  process.exit(1);
});
