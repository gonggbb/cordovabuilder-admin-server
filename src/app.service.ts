import { Injectable } from '@nestjs/common';

/**
 * 应用服务类
 * 提供应用程序的核心业务逻辑和服务功能
 */
@Injectable()
export class AppService {
  /**
   * 获取欢迎消息
   * 返回预定义的问候语字符串
   * @returns 包含"Hello World!"的字符串
   */
  getHello(): string {
    return 'Hello World!';
  }
}
