import { Test, TestingModule } from '@nestjs/testing';
import { describe, it, expect, beforeEach } from '@jest/globals';
import { AppController } from './app.controller';
import { AppService } from './app.service';

/**
 * AppController 的单元测试套件
 * 测试控制器的基本功能和依赖注入
 */
describe('AppController', () => {
  let appController: AppController;

  /**
   * 在每个测试用例执行前的初始化设置
   * 创建测试模块并获取 AppController 实例
   */
  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  /**
   * 测试根路径方法的功能
   */
  describe('root', () => {
    /**
     * 验证 getHello 方法是否正确返回 "Hello World!" 字符串
     */
    it('should return "Hello World!"', () => {
      expect(appController.getHello()).toBe('Hello World!');
    });
  });
});
