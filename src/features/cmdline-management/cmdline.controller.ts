import { Controller, Get, Post, Query, Body } from '@nestjs/common';
import { CmdlineToolsService } from './cmdline.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Command Line Tools 管理控制器
 * 处理与 Android SDK 命令行工具相关的 HTTP 请求
 */
@ApiTags('Command Line Tools 管理')
@Controller('cmdline-tools')
export class CmdlineToolsController {
  /**
   * 构造函数
   * @param cmdlineToolsService - Command Line Tools 服务实例
   */
  constructor(private readonly cmdlineToolsService: CmdlineToolsService) {}

  /**
   * 获取 Command Line Tools 信息
   * @returns Command Line Tools 信息
   */
  @Get()
  @ApiOperation({ summary: '获取 Command Line Tools 管理信息' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Command Line Tools 管理信息',
  })
  getInfo(): {
    sdkRoot: string;
    cmdlineToolsPath: string;
    platform: string;
    isInstalled: boolean;
    version?: string;
  } {
    return this.cmdlineToolsService.getInfo();
  }

  /**
   * 检查安装状态
   * @returns Command Line Tools 安装状态
   */
  @Get('check')
  @ApiOperation({ summary: '检查 Command Line Tools 安装状态' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Command Line Tools 安装状态',
    schema: {
      example: {
        sdkRoot: '/opt/android-sdk',
        cmdlineToolsPath: '/opt/android-sdk/cmdline-tools',
        platform: 'linux',
        isInstalled: true,
        version: '14.0',
      },
    },
  })
  checkInstalled() {
    return this.cmdlineToolsService.getInfo();
  }

  /**
   * 下载 Command Line Tools
   * @param version - 版本号
   * @param platform - 平台
   * @returns 下载结果
   */
  @Post('download')
  @ApiOperation({ summary: '下载 Command Line Tools' })
  @ApiQuery({
    name: 'version',
    required: false,
    description: 'Command Line Tools 版本号，例如：14742923',
    example: '14742923',
  })
  @ApiQuery({
    name: 'platform',
    required: false,
    description: '操作系统平台',
    example: 'linux',
  })
  @ApiResponse({
    status: 200,
    description: '下载成功',
    schema: {
      example: {
        success: true,
        message:
          'Command Line Tools 已成功下载到 /path/to/downloads/commandlinetools-linux-14742923_latest.zip',
        path: '/path/to/downloads/commandlinetools-linux-14742923_latest.zip',
      },
    },
  })
  async downloadCmdlineTools(
    @Query('version') version?: string,
    @Query('platform') platform?: string,
  ): Promise<{ success: boolean; message: string; path?: string }> {
    return this.cmdlineToolsService.downloadCmdlineTools(version, platform);
  }

  /**
   * 安装 Command Line Tools
   * @param archivePath - 压缩包路径
   * @returns 安装结果
   */
  @Post('install')
  @ApiOperation({ summary: '安装 Command Line Tools' })
  @ApiResponse({
    status: 200,
    description: '安装成功',
    schema: {
      example: {
        success: true,
        message:
          'Command Line Tools 已成功安装到 /opt/android-sdk/cmdline-tools/latest',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '缺少必要参数',
    schema: {
      example: {
        success: false,
        message: '请提供 Command Line Tools 压缩包路径',
      },
    },
  })
  async installCmdlineTools(
    @Body('archivePath') archivePath: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!archivePath) {
      return {
        success: false,
        message: '请提供 Command Line Tools 压缩包路径',
      };
    }

    return this.cmdlineToolsService.installCmdlineTools(archivePath);
  }

  /**
   * 安装 SDK 组件
   * @param packages - 要安装的包列表
   * @returns 安装结果
   */
  @Post('install-packages')
  @ApiOperation({ summary: '使用 sdkmanager 安装 SDK 组件' })
  @ApiResponse({
    status: 200,
    description: '安装成功',
    schema: {
      example: {
        success: true,
        message:
          '成功安装 SDK 组件：platform-tools, platforms;android-36, build-tools;36.0.0',
        installedPackages: [
          'platform-tools',
          'platforms;android-36',
          'build-tools;36.0.0',
        ],
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '缺少必要参数',
    schema: {
      example: {
        success: false,
        message: '请提供要安装的 SDK 组件列表',
      },
    },
  })
  async installSdkPackages(@Body('packages') packages: string[]): Promise<{
    success: boolean;
    message: string;
    installedPackages?: string[];
  }> {
    if (!packages || packages.length === 0) {
      return {
        success: false,
        message: '请提供要安装的 SDK 组件列表',
      };
    }

    return this.cmdlineToolsService.installSdkPackages(packages);
  }

  /**
   * 列出已安装的 SDK 组件
   * @returns 已安装的组件列表
   */
  @Get('list-installed')
  @ApiOperation({ summary: '列出已安装的 SDK 组件' })
  @ApiResponse({
    status: 200,
    description: '成功返回已安装的 SDK 组件列表',
    schema: {
      example: {
        success: true,
        packages: [
          'platform-tools',
          'platforms;android-36',
          'build-tools;36.0.0',
        ],
      },
    },
  })
  listInstalledPackages() {
    return this.cmdlineToolsService.listInstalledPackages();
  }

  /**
   * 接受所有 SDK 许可证
   * @returns 接受结果
   */
  @Post('accept-licenses')
  @ApiOperation({ summary: '接受所有 SDK 许可证' })
  @ApiResponse({
    status: 200,
    description: '成功接受所有许可证',
    schema: {
      example: {
        success: true,
        message: '已成功接受所有 SDK 许可证',
      },
    },
  })
  async acceptLicenses(): Promise<{ success: boolean; message: string }> {
    return this.cmdlineToolsService.acceptLicenses();
  }
}
