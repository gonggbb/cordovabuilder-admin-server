import * as https from 'https';
import * as http from 'http';
import * as fs from 'fs';
import { pipeline } from 'stream';

import { promisify } from 'util';
import { getLogger } from '@common/utils/logger.utils';

const logger = getLogger('DownloadUtils');
const pipelineAsync = promisify(pipeline);

/**
 * [辅助方法] 探测 URL 是否可达
 * @param url - 要探测的 URL
 * @returns 是否可达
 */
async function probeUrl(url: string): Promise<boolean> {
  return new Promise((resolve) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.request(url, { method: 'HEAD' }, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          probeUrl(redirectUrl)
            .then(resolve)
            .catch(() => resolve(false));
        } else {
          resolve(false);
        }
        return;
      }

      // 2xx 状态码表示可达
      resolve(
        response.statusCode !== undefined &&
          response.statusCode >= 200 &&
          response.statusCode < 400,
      );
    });

    request.setTimeout(10000, () => {
      request.destroy();
      resolve(false);
    });

    request.on('error', () => {
      resolve(false);
    });

    request.end();
  });
}

/**
 * [辅助方法] 下载文件(跨平台兼容)
 * @param url - 下载 URL
 * @param dest - 目标文件路径
 */
export async function downloadFile(url: string, dest: string): Promise<void> {
  // 检查文件是否已存在
  if (fs.existsSync(dest)) {
    logger.log(`文件已存在：${dest}`);
    return;
  }

  // 先探测 URL 是否可达
  const isReachable = await probeUrl(url);
  if (!isReachable) {
    throw new Error(`URL 不可达或不存在：${url}`);
  }

  return new Promise((resolve, reject) => {
    const protocol = url.startsWith('https') ? https : http;

    const request = protocol.get(url, (response) => {
      // 处理重定向
      if (response.statusCode === 301 || response.statusCode === 302) {
        const redirectUrl = response.headers.location;
        if (redirectUrl) {
          downloadFile(redirectUrl, dest).then(resolve).catch(reject);
        } else {
          reject(new Error('重定向响应缺少 location 头'));
        }
        return;
      }

      // 检查响应状态码
      if (response.statusCode !== 200) {
        reject(new Error(`下载失败，HTTP 状态码：${response.statusCode}`));
        return;
      }

      // 创建写入流
      const fileStream = fs.createWriteStream(dest);

      // 使用 pipeline 连接响应流和文件流
      pipelineAsync(response, fileStream)
        .then(() => resolve())
        .catch((error: unknown) => {
          // 清理未完成的文件
          if (fs.existsSync(dest)) {
            fs.unlinkSync(dest);
          }
          const errorMessage =
            error instanceof Error ? error : new Error(String(error));
          reject(errorMessage);
        });
    });

    // 设置超时时间（5分钟）
    request.setTimeout(300000, () => {
      request.destroy();
      reject(new Error('下载超时'));
    });

    // 处理请求错误
    request.on('error', (error) => {
      reject(error);
    });
  });
}
