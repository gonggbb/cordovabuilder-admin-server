import { Controller, Get, Post, Delete, Body, Param } from '@nestjs/common';
import { EnvService } from './env.service';
import type { CordovaPreset, EnvProfile } from '@type/env.types';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';

/**
 * 环境变量管理控制器
 * 处理与环境配置切换相关的 HTTP 请求
 */
@ApiTags('环境变量管理')
@Controller('env')
export class EnvController {
  /**
   * 构造函数
   * @param envService - 环境服务实例
   */
  constructor(private readonly envService: EnvService) {}

  /**
   * 获取所有环境配置
   * @returns 包含所有配置和当前激活配置的列表
   */
  @Get('profiles')
  @ApiOperation({ summary: '获取所有环境配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回所有环境配置',
    schema: {
      example: {
        profiles: {
          default: {
            sdk: '30.0.3',
            gradle: '7.1.1',
            java: '11',
            node: '18.20.8',
          },
        },
        currentProfile: 'default',
      },
    },
  })
  getAllProfiles() {
    return this.envService.getAllProfiles();
  }

  /**
   * 获取当前激活的环境配置
   * @returns 当前配置名称和配置详情
   */
  @Get('current')
  @ApiOperation({ summary: '获取当前激活的环境配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回当前配置',
    schema: {
      example: {
        profileName: 'default',
        profile: {
          sdk: '30.0.3',
          gradle: '7.1.1',
          java: '11',
          node: '18.20.8',
        },
      },
    },
  })
  getCurrentProfile() {
    return this.envService.getCurrentProfile();
  }

  /**
   * 切换到指定的环境配置
   * @param profileName - 配置名称
   * @returns 切换结果
   */
  @Post('switch')
  @ApiOperation({ summary: '切换到指定的环境配置' })
  @ApiBody({
    schema: {
      example: {
        profileName: 'production',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '切换成功',
    schema: {
      example: {
        success: true,
        message:
          '已成功切换到配置 "production"。注意:需要重启应用才能使新配置生效。',
        previousProfile: 'default',
        currentProfile: 'production',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '配置不存在',
    schema: {
      example: {
        success: false,
        message: '配置 "production" 不存在',
      },
    },
  })
  switchProfile(@Body('profileName') profileName: string) {
    if (!profileName) {
      return {
        success: false,
        message: '请提供配置名称',
      };
    }

    return this.envService.switchProfile(profileName);
  }

  /**
   * 保存新的环境配置
   * @param profileName - 配置名称
   * @param profile - 配置详情(可选字段)
   * @returns 保存结果
   */
  @Post('save')
  @ApiOperation({ summary: '保存新的环境配置' })
  @ApiBody({
    schema: {
      example: {
        profileName: 'development',
        profile: {
          sdk: '33.0.0',
          gradle: '8.0',
          java: '17',
          node: '20.0.0',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '保存成功',
    schema: {
      example: {
        success: true,
        message: '已成功保存配置 "development"',
      },
    },
  })
  saveProfile(
    @Body('profileName') profileName: string,
    @Body('profile') profile: Partial<EnvProfile>,
  ) {
    if (!profileName) {
      return {
        success: false,
        message: '请提供配置名称',
      };
    }

    return this.envService.saveProfile(profileName, profile || {});
  }

  /**
   * 删除指定的环境配置
   * @param profileName - 配置名称
   * @returns 删除结果
   */
  @Delete('delete/:profileName')
  @ApiOperation({ summary: '删除指定的环境配置' })
  @ApiParam({
    name: 'profileName',
    required: true,
    description: '要删除的配置名称',
    example: 'old-config',
  })
  @ApiResponse({
    status: 200,
    description: '删除成功',
    schema: {
      example: {
        success: true,
        message: '已成功删除配置 "old-config"',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: '无法删除',
    schema: {
      example: {
        success: false,
        message: '无法删除当前激活的配置 "default"',
      },
    },
  })
  deleteProfile(@Param('profileName') profileName: string) {
    return this.envService.deleteProfile(profileName);
  }

  /**
   * 获取默认配置
   * @returns 默认配置对象
   */
  @Get('default')
  @ApiOperation({ summary: '获取默认环境配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回默认配置',
    schema: {
      example: {
        sdk: '30.0.3',
        gradle: '7.1.1',
        java: '11',
        node: '18.20.8',
      },
    },
  })
  getDefaultProfile() {
    return this.envService.getDefaultProfile();
  }

  /**
   * 获取所有 Cordova 预设配置
   * @returns Cordova 预设配置列表
   */
  @Get('cordova-presets')
  @ApiOperation({ summary: '获取所有 Cordova 预设配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Cordova 预设配置列表',
    schema: {
      example: [
        {
          name: 'cordova-12-ca11',
          description: 'Cordova 12 + cordova-android 11.0.x',
          cordovaVersion: '12.x',
          cordovaAndroid: '11.0.x',
          buildTools: '^32.0.0',
          profile: {
            sdk: '32.0.0',
            gradle: '7.4.2',
            java: '11',
            node: '18.20.8',
          },
        },
      ],
    },
  })
  getCordovaPresets(): CordovaPreset[] {
    return this.envService.getCordovaPresets();
  }

  /**
   * 获取指定的 Cordova 预设配置
   * @param presetName - 预设名称
   * @returns Cordova 预设配置详情
   */
  @Get('cordova-presets/:presetName')
  @ApiOperation({ summary: '获取指定的 Cordova 预设配置' })
  @ApiParam({
    name: 'presetName',
    required: true,
    description: '预设名称',
    example: 'cordova-13-ca15',
  })
  @ApiResponse({
    status: 200,
    description: '成功返回 Cordova 预设配置',
    schema: {
      example: {
        name: 'cordova-13-ca15',
        description: 'Cordova 13 + cordova-android 15.0.x',
        cordovaVersion: '13.x',
        cordovaAndroid: '15.0.x',
        buildTools: '^36.0.0',
        profile: {
          sdk: '36.0.0',
          gradle: '8.14.2',
          java: '17.0.10',
          node: '20.19.5',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: '预设不存在',
    schema: {
      example: {
        success: false,
        message: '未找到名为 "invalid-preset" 的 Cordova 预设配置',
      },
    },
  })
  getCordovaPresetByName(@Param('presetName') presetName: string) {
    const preset = this.envService.getCordovaPresetByName(presetName);

    if (!preset) {
      return {
        success: false,
        message: `未找到名为 "${presetName}" 的 Cordova 预设配置`,
      };
    }

    return preset;
  }

  /**
   * 从 Cordova 预设创建配置
   * @param presetName - 预设名称
   * @param profileName - 要保存的配置名称(可选)
   * @returns 创建结果
   */
  @Post('create-from-cordova')
  @ApiOperation({ summary: '从 Cordova 预设创建配置' })
  @ApiBody({
    schema: {
      example: {
        presetName: 'cordova-13-ca15',
        profileName: 'my-cordova-project',
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: '创建成功',
    schema: {
      example: {
        success: true,
        message:
          '已从预设 "cordova-13-ca15" 创建配置 "my-cordova-project"。已成功保存配置 "my-cordova-project"',
        profile: {
          sdk: '36.0.0',
          gradle: '8.14.2',
          java: '17.0.10',
          node: '20.19.5',
        },
      },
    },
  })
  createFromCordovaPreset(
    @Body('presetName') presetName: string,
    @Body('profileName') profileName?: string,
  ) {
    if (!presetName) {
      return {
        success: false,
        message: '请提供预设名称 (presetName)',
      };
    }

    return this.envService.createFromCordovaPreset(presetName, profileName);
  }
}
