/**
 * URL 编码工具函数
 * 提供安全的 URL 编码和解码功能
 */

import { getLogger } from './logger.utils';

const logger = getLogger('DownloadUtils');

/**
 * [辅助方法] 对 URL 进行安全编码
 * 保留协议、域名等结构,只编码路径和查询参数中的特殊字符
 * @param url - 原始 URL
 * @returns 编码后的 URL
 */
export function encodeUrl(url: string): string {
  try {
    // 解析 URL
    const parsedUrl = new URL(url);

    // 对路径和查询参数进行编码
    const encodedPathname = encodeURI(parsedUrl.pathname);
    const encodedSearch = encodeURI(parsedUrl.search);
    logger.debug(`Encoding URL: ${url}`);
    logger.debug(`Encoded pathname: ${encodedPathname}`);
    logger.debug(`Encoded search: ${encodedSearch}`);
    // 重建 URL
    return `${parsedUrl.protocol}//${parsedUrl.host}${encodedPathname}${encodedSearch}`;
  } catch {
    // 如果 URL 格式不正确,使用简单的 encodeURI
    return encodeURI(url);
  }
}

/**
 * [辅助方法] 解码 URL
 * @param encodedUrl - 编码后的 URL
 * @returns 解码后的 URL
 */
export function decodeUrl(encodedUrl: string): string {
  try {
    return decodeURI(encodedUrl);
  } catch {
    return encodedUrl;
  }
}

/**
 * [辅助方法] 验证 URL 格式
 * @param url - 待验证的 URL
 * @returns 是否为有效 URL
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}
