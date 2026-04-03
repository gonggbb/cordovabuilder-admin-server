import { Controller, Get, Post, Body, Query } from '@nestjs/common';
import { SdkService } from './sdk.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * SDK 管理控制器
 * 处理与 Android SDK 管理相关的 HTTP 请求
 */
@ApiTags('SDK 管理')
@Controller('sdk')
export class SdkController {
  /**
   * 构造函数
   * @param sdkService - SDK 服务实例
   */
  constructor(private readonly sdkService: SdkService) {}

  /**
   * 获取 SDK 信息
   * @returns SDK 配置信息
   */
  @Get()
  @ApiOperation({ summary: '获取 SDK 管理信息' })
  @ApiResponse({ status: 200, description: '成功返回 SDK 管理信息' })
  getInfo(): {
    sdkRoot: string;
    platformsPath: string;
    buildToolsPath: string;
    platformToolsPath: string;
    platform: string;
    installedPlatforms: string[];
    installedBuildTools: string[];
    hasPlatformTools: boolean;
  } {
    return this.sdkService.getInfo();
  }

  /**
   * 检查 SDK 安装状态
   * @returns SDK 详细安装状态
   */
  @Get('check')
  @ApiOperation({ summary: '检查 SDK 安装状态' })
  @ApiResponse({
    status: 200,
    description: '成功返回 SDK 安装状态',
    schema: {
      example: {
        sdkRoot: '/opt/android-sdk',
        platformsPath: '/opt/android-sdk/platforms',
        buildToolsPath: '/opt/android-sdk/build-tools',
        platformToolsPath: '/opt/android-sdk/platform-tools',
        platform: 'linux',
        installedPlatforms: ['android-36'],
        installedBuildTools: ['36.0.0'],
        hasPlatformTools: true,
      },
    },
  })
  checkInstalled() {
    return this.sdkService.getInfo();
  }

  /**
   * 验证 SDK 安装
   * @returns 验证结果
   */
  @Get('validate')
  @ApiOperation({ summary: '验证 SDK 安装完整性' })
  @ApiResponse({
    status: 200,
    description: '成功返回 SDK 验证结果',
    schema: {
      example: {
        success: true,
        isValid: true,
        message: 'SDK 安装验证通过',
      },
    },
  })
  validateSdkInstallation() {
    return this.sdkService.validateSdkInstallation();
  }

  /**
   * 获取 SDK 磁盘使用情况
   * @returns SDK 目录大小
   */
  @Get('disk-usage')
  @ApiOperation({ summary: '获取 SDK 磁盘使用情况' })
  @ApiResponse({
    status: 200,
    description: '成功返回 SDK 磁盘使用量',
    schema: {
      example: {
        success: true,
        sizeBytes: 5368709120,
      },
    },
  })
  getDiskUsage() {
    return this.sdkService.getSdkDiskUsage();
  }

  /**
   * 清理 SDK 缓存
   * @returns 清理结果
   */
  @Post('clean-cache')
  @ApiOperation({ summary: '清理 SDK 缓存文件' })
  @ApiResponse({
    status: 200,
    description: '清理成功',
    schema: {
      example: {
        success: true,
        message: '已成功清理缓存',
        freedBytes: 104857600,
      },
    },
  })
  cleanCache() {
    return this.sdkService.cleanCache();
  }

  /**
   * 检查组件是否已安装
   * @param type - 组件类型
   * @param version - 版本号
   * @returns 是否已安装
   */
  @Get('check-component')
  @ApiOperation({ summary: '检查 SDK 组件是否已安装' })
  @ApiQuery({
    name: 'type',
    required: true,
    description: '组件类型',
    example: 'platform',
    enum: ['platform', 'build-tools', 'platform-tools'],
  })
  @ApiQuery({
    name: 'version',
    required: false,
    description: '版本号',
    example: '36',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回组件安装状态',
    schema: {
      example: {
        installed: true,
      },
    },
  })
  checkComponent(
    @Query('type') type: 'platform' | 'build-tools' | 'platform-tools',
    @Query('version') version?: string,
  ) {
    return {
      installed: this.sdkService.checkComponentInstalled(type, version),
    };
  }

  /**
   * 获取 ADB 路径
   * @returns ADB 可执行文件路径
   */
  @Get('adb-path')
  @ApiOperation({ summary: '获取 ADB 工具路径' })
  @ApiResponse({
    status: 200,
    description: '成功返回 ADB 路径',
    schema: {
      example: {
        adbPath: '/opt/android-sdk/platform-tools/adb',
      },
    },
  })
  getAdbPath() {
    return {
      adbPath: this.sdkService.getAdbPath(),
    };
  }

  /**
   * 执行 ADB 命令
   * @param command - ADB 命令
   * @returns 执行结果
   */
  @Post('adb')
  @ApiOperation({ summary: '执行 ADB 命令' })
  @ApiResponse({
    status: 200,
    description: '命令执行成功',
    schema: {
      example: {
        success: true,
        output: 'List of devices attached\nemulator-5554\tdevice',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '缺少必要参数',
    schema: {
      example: {
        success: false,
        error: '请提供 ADB 命令',
      },
    },
  })
  executeAdb(@Body('command') command: string) {
    if (!command) {
      return {
        success: false,
        error: '请提供 ADB 命令',
      };
    }

    const args = command.split(' ');
    return this.sdkService.executeAdbCommand(args);
  }
}
