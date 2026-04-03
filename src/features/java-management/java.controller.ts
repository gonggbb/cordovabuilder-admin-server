import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { JavaService } from './java.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Java 管理控制器
 * 处理与 Java 环境管理相关的 HTTP 请求
 */
@ApiTags('Java 管理')
@Controller('java')
export class JavaController {
  /**
   * 构造函数
   * @param javaService - Java 服务实例
   */
  constructor(private readonly javaService: JavaService) {}

  /**
   * 获取 Java 信息
   * 处理根路径的 GET 请求，返回 Java 相关信息
   * @returns 返回来自 Java 服务的信息
   */
  @Get()
  @ApiOperation({ summary: '获取 Java 管理信息' })
  @ApiResponse({ status: 200, description: '成功返回 Java 管理信息' })
  getInfo(): {
    version: string;
    installPath: string;
    platform: string;
    arch: string;
    isInstalled: boolean;
  } {
    return this.javaService.getInfo();
  }

  /**
   * 检查 Java 安装状态
   * @returns Java 安装状态
   */
  @Get('check')
  @ApiOperation({ summary: '检查 Java 安装状态' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Java 安装状态',
    schema: {
      example: {
        version: '17.0.10',
        installPath: '/opt/java/java',
        platform: 'linux',
        arch: 'x64',
        isInstalled: true,
      },
    },
  })
  checkInstalled() {
    return this.javaService.getInfo();
  }

  /**
   * 下载 JDK
   * 处理下载 JDK 指定版本的请求
   * @param version - JDK 版本号
   * @param platform - 操作系统平台 (可选，默认当前系统)
   * @param arch - 系统架构 (可选，默认当前架构)
   * @returns 下载结果
   */
  @Post('download')
  @ApiOperation({ summary: '下载指定版本的 JDK' })
  @ApiQuery({
    name: 'version',
    required: true,
    description: 'JDK 版本号，例如：jdk-17.0.10',
    example: 'jdk-17.0.10',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    description: '操作系统平台',
    example: 'linux',
  })
  @ApiQuery({
    name: 'arch',
    required: false,
    description: '系统架构',
    example: 'x64',
  })
  @ApiResponse({
    status: 200,
    description: '下载成功',
    schema: {
      example: {
        success: true,
        message:
          'JDK jdk-17.0.10 已成功下载到 /path/to/downloads/jdk-17.0.10_linux-x64_bin.tar.gz',
        path: '/path/to/downloads/jdk-17.0.10_linux-x64_bin.tar.gz',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '缺少必要参数',
    schema: {
      example: {
        success: false,
        message: '请提供 JDK 版本号 (例如：jdk-17.0.10)',
      },
    },
  })
  async downloadJdk(
    @Query('version') version: string,
    @Query('platform') platform?: string,
    @Query('arch') arch?: string,
  ): Promise<{ success: boolean; message: string; path?: string }> {
    if (!version) {
      return {
        success: false,
        message: '请提供 JDK 版本号 (例如：jdk-17.0.10)',
      };
    }

    return this.javaService.downloadJdk(version, platform, arch);
  }

  /**
   * 安装 JDK
   * 处理安装 JDK 的请求
   * @param archivePath - 压缩包路径
   * @param installPath - 安装路径 (可选)
   * @returns 安装结果
   */
  @Post('install')
  @ApiOperation({ summary: '安装 JDK' })
  @ApiResponse({
    status: 200,
    description: '安装成功',
    schema: {
      example: {
        success: true,
        message: 'JDK 已成功安装到 /opt/java/java',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '缺少必要参数',
    schema: {
      example: {
        success: false,
        message: '请提供 JDK 压缩包路径',
      },
    },
  })
  async installJdk(
    @Body('archivePath') archivePath: string,
    @Body('installPath') installPath?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!archivePath) {
      return {
        success: false,
        message: '请提供 JDK 压缩包路径',
      };
    }

    return this.javaService.installJdk(archivePath, installPath);
  }
}
