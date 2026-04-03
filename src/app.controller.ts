import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * 应用程序控制器
 * 处理应用程序的根路由请求
 */
@Controller()
export class AppController {
  /**
   * 构造函数
   * @param appService - 应用服务实例
   */
  constructor(private readonly appService: AppService) {}

  /**
   * 获取欢迎消息
   * 处理根路径的GET请求，返回欢迎字符串
   * @returns 返回来自应用服务的欢迎消息
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
