import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { GradleService } from './gradle.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Gradle 管理控制器
 * 处理与 Gradle 构建工具相关的 HTTP 请求
 */
@ApiTags('Gradle 管理')
@Controller('gradle')
export class GradleController {
  /**
   * 构造函数
   * @param gradleService - Gradle 服务实例
   */
  constructor(private readonly gradleService: GradleService) {}

  /**
   * 获取 Gradle 信息
   * 处理根路径的 GET 请求，返回 Gradle 相关信息
   * @returns 返回来自 Gradle 服务的信息
   */
  @Get()
  @ApiOperation({ summary: '获取 Gradle 管理信息' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Gradle 管理信息',
    schema: {
      example: {
        version: '8.5',
        installPath: '/opt/gradle',
        platform: 'linux',
        arch: 'x64',
        isInstalled: true,
        gradleHome: '/opt/gradle/gradle-8.5',
      },
    },
  })
  getInfo(): {
    version: string;
    installPath: string;
    platform: string;
    arch: string;
    isInstalled: boolean;
    gradleHome?: string;
  } {
    return this.gradleService.getInfo();
  }

  /**
   * 检查 Gradle 安装状态
   * @returns Gradle 安装状态
   */
  @Get('check')
  @ApiOperation({ summary: '检查 Gradle 安装状态' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Gradle 安装状态',
    schema: {
      example: {
        isInstalled: true,
        version: '8.5',
        path: '/usr/bin/gradle',
      },
    },
  })
  checkInstallation(): {
    isInstalled: boolean;
    version: string;
    path?: string;
  } {
    const info = this.gradleService.getInfo();

    return {
      isInstalled: info.isInstalled,
      version: info.version,
      path: info.gradleHome,
    };
  }

  /**
   * 下载指定版本的 Gradle
   * @param version - Gradle 版本号
   * @returns 下载结果
   */
  @Post('download')
  @ApiOperation({ summary: '下载指定版本的 Gradle' })
  @ApiQuery({
    name: 'version',
    required: true,
    description: 'Gradle 版本号，例如：8.5',
    example: '8.5',
  })
  async downloadGradle(@Query('version') version: string): Promise<{
    success: boolean;
    message: string;
    path?: string;
  }> {
    const result = await this.gradleService.downloadGradle(version);
    return result;
  }

  /**
   * 安装 Gradle
   * @param archivePath - 压缩包路径
   * @returns 安装结果
   */
  @Post('install')
  @ApiOperation({ summary: '安装 Gradle' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Gradle 安装结果',
    schema: {
      example: {
        success: true,
        message: 'Gradle 已成功安装到 /opt/gradle/gradle-8.5',
      },
    },
  })
  async installGradle(@Body() body: { archivePath: string }): Promise<{
    success: boolean;
    message: string;
  }> {
    if (!body.archivePath) {
      return {
        success: false,
        message: '请提供 archivePath 参数（压缩包路径）',
      };
    }
    const result = await this.gradleService.installGradle(body.archivePath);
    return result;
  }

  /**
   * 列出可用的 Gradle 版本
   * @returns 可用版本列表
   */
  @Get('versions')
  @ApiOperation({ summary: '获取可用的 Gradle 版本列表' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Gradle 版本列表',
    schema: {
      example: {
        versions: ['8.5', '8.4', '8.3', '7.6.4', '7.6'],
        latest: '8.5',
      },
    },
  })
  getAvailableVersions(): {
    versions: string[];
    latest: string;
  } {
    // 这里可以调用 Gradle 官方 API 获取最新版本列表
    // 暂时返回硬编码的版本列表
    return {
      versions: [
        '8.5',
        '8.4',
        '8.3',
        '8.2.1',
        '8.1.1',
        '8.0.2',
        '7.6.4',
        '7.6',
        '7.5.1',
        '7.4.2',
      ],
      latest: '8.5',
    };
  }
}
