import { Controller, Get, Query, Post } from '@nestjs/common';
import { NodeService } from './node.service';
import { ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Node 管理控制器
 * 处理与 Node.js 环境相关的 HTTP 请求
 */
@ApiTags('Node 管理')
@Controller('node')
export class NodeController {
  /**
   * 构造函数
   * @param nodeService - Node 服务实例
   */
  constructor(private readonly nodeService: NodeService) {}

  /**
   * 获取 Node 信息
   * 处理根路径的 GET 请求，返回 Node.js 相关信息
   * @returns 返回来自 Node 服务的信息
   */
  @Get()
  @ApiOperation({ summary: '获取 Node 管理信息' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Node 管理信息',
    schema: {
      example: {
        version: 'v18.16.0',
        installPath: '/usr/bin/node',
        platform: 'linux',
        arch: 'x64',
        isInstalled: true,
        npmVersion: '9.5.1',
      },
    },
  })
  getInfo(): {
    version: string;
    installPath: string;
    platform: string;
    arch: string;
    isInstalled: boolean;
    npmVersion?: string;
  } {
    return this.nodeService.getInfo();
  }

  /**
   * 下载 Node.js
   * 处理下载 Node.js 指定版本的请求
   * @param version - Node.js 版本号
   * @param platform - 操作系统平台 (可选，默认当前系统)
   * @param arch - 系统架构 (可选，默认当前架构)
   * @returns 下载结果
   * https://nodejs.org/dist/v24.14.1/node-v24.14.1-win-x64.zip
   * https://nodejs.org/dist/v24.14.1/node-v24.14.1-linux-x64.tar.xz
   */
  @Post('download')
  @ApiOperation({ summary: '下载指定版本的 Node.js' })
  @ApiQuery({
    name: 'version',
    required: true,
    description: 'Node.js 版本号，例如：v18.16.0',
    example: 'v18.16.0',
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
          'Node.js v18.16.0 已成功下载到 /path/to/downloads/node-v18.16.0-linux-x64.tar.xz',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '缺少必要参数',
    schema: {
      example: {
        success: false,
        message: '请提供 Node.js 版本号 (例如：v18.16.0)',
      },
    },
  })
  async downloadNode(
    @Query('version') version: string,
    @Query('platform') platform?: string,
    @Query('arch') arch?: string,
  ): Promise<{ success: boolean; message: string }> {
    if (!version) {
      return {
        success: false,
        message: '请提供 Node.js 版本号 (例如：v18.16.0)',
      };
    }

    return this.nodeService.downloadNode(version, platform, arch);
  }
}
