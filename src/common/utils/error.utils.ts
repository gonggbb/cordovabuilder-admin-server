/**
 * 错误消息工具函数
 * 提供统一的错误消息提取和处理功能
 */

/**
 * 从任意类型的错误对象中提取错误消息
 * @param error - 任意类型的错误对象
 * @returns 安全的字符串格式错误消息
 */
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }

  // 检查是否包含 stderr 属性（如 execSync 的错误）
  if (error && typeof error === 'object' && 'stderr' in error) {
    const stderr = (error as { stderr?: unknown }).stderr;
    if (stderr !== undefined && stderr !== null) {
      // 如果 stderr 是字符串，直接返回；否则尝试 JSON 序列化
      return typeof stderr === 'string'
        ? stderr
        : stderr instanceof Error
          ? stderr.message
          : JSON.stringify(stderr);
    }
  }

  // 默认转换为字符串
  return String(error);
}

/**
 * 从任意类型的错误对象中提取错误消息，支持默认值
 * @param error - 任意类型的错误对象
 * @param defaultValue - 默认错误消息
 * @returns 安全的字符串格式错误消息或默认值
 */
export function getErrorMessageOrDefault(
  error: unknown,
  defaultValue: string = '发生未知错误',
): string {
  const message = getErrorMessage(error);
  return message || defaultValue;
}
