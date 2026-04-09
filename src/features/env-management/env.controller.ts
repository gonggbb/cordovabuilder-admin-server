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
import { EXAMPLES } from './env.controller.examples';

@ApiTags('环境变量管理')
@Controller('env')
export class EnvController {
  constructor(private readonly envService: EnvService) {}

  @Get('profiles')
  @ApiOperation({ summary: '获取所有环境配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回所有环境配置',
    schema: { example: EXAMPLES.getAllProfiles },
  })
  getAllProfiles() {
    return this.envService.getAllProfiles();
  }

  @Get('current')
  @ApiOperation({ summary: '获取当前激活的环境配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回当前配置',
    schema: { example: EXAMPLES.getCurrentProfile },
  })
  getCurrentProfile() {
    return this.envService.getCurrentProfile();
  }

  @Post('switch')
  @ApiOperation({ summary: '切换到指定的环境配置' })
  @ApiBody({ schema: { example: EXAMPLES.switchProfileRequest } })
  @ApiResponse({
    status: 200,
    description: '切换成功',
    schema: { example: EXAMPLES.switchProfileSuccess },
  })
  @ApiResponse({
    status: 400,
    description: '配置不存在',
    schema: { example: EXAMPLES.switchProfileNotFound },
  })
  switchProfile(@Body('profileName') profileName: string) {
    if (!profileName) {
      return { success: false, message: '请提供配置名称' };
    }

    return this.envService.switchProfile(profileName);
  }

  @Post('save')
  @ApiOperation({ summary: '保存新的环境配置' })
  @ApiBody({ schema: { example: EXAMPLES.saveProfileRequest } })
  @ApiResponse({
    status: 200,
    description: '保存成功',
    schema: { example: EXAMPLES.saveProfileSuccess },
  })
  saveProfile(
    @Body('profileName') profileName: string,
    @Body('profile') profile: Partial<EnvProfile>,
  ) {
    if (!profileName) {
      return { success: false, message: '请提供配置名称' };
    }

    return this.envService.saveProfile(profileName, profile || {});
  }

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
    schema: { example: EXAMPLES.deleteProfileSuccess },
  })
  @ApiResponse({
    status: 400,
    description: '无法删除',
    schema: { example: EXAMPLES.deleteProfileError },
  })
  deleteProfile(@Param('profileName') profileName: string) {
    return this.envService.deleteProfile(profileName);
  }

  @Get('default')
  @ApiOperation({ summary: '获取默认环境配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回默认配置',
    schema: { example: EXAMPLES.getDefaultProfile },
  })
  getDefaultProfile() {
    return this.envService.getDefaultProfile();
  }

  @Get('cordova-presets')
  @ApiOperation({ summary: '获取所有 Cordova 预设配置' })
  @ApiResponse({
    status: 200,
    description: '成功返回 Cordova 预设配置列表',
    schema: { example: EXAMPLES.getCordovaPresets },
  })
  getCordovaPresets(): CordovaPreset[] {
    return this.envService.getCordovaPresets();
  }

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
    schema: { example: EXAMPLES.getCordovaPresetByName },
  })
  @ApiResponse({
    status: 404,
    description: '预设不存在',
    schema: { example: EXAMPLES.getCordovaPresetNotFound },
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

  @Post('create-from-cordova')
  @ApiOperation({ summary: '从 Cordova 预设创建配置' })
  @ApiBody({ schema: { example: EXAMPLES.createFromCordovaRequest } })
  @ApiResponse({
    status: 200,
    description: '创建成功',
    schema: { example: EXAMPLES.createFromCordovaSuccess },
  })
  createFromCordovaPreset(
    @Body('presetName') presetName: string,
    @Body('profileName') profileName?: string,
  ) {
    if (!presetName) {
      return { success: false, message: '请提供预设名称 (presetName)' };
    }

    return this.envService.createFromCordovaPreset(presetName, profileName);
  }
}
