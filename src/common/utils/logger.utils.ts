import { Logger } from '@nestjs/common';

/**
 * 日志工具函数
 * 提供统一的日志记录功能，适用于非依赖注入场景
 */

/**
 * [辅助方法] 创建指定上下文的 Logger 实例
 * @param context - 日志上下文标识
 * @returns Logger 实例
 */
export function getLogger(context: string): Logger {
  return new Logger(context);
}
