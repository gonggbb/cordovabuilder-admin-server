import { Injectable, Logger } from '@nestjs/common';
import { Client, ConnectConfig, ClientChannel } from 'ssh2';
import { WebSocket } from 'ws';

interface SshSession {
  client: Client;
  stream: ClientChannel;
  ws: WebSocket;
}

@Injectable()
export class SshService {
  private readonly logger = new Logger(SshService.name);
  private sessions: Map<string, SshSession> = new Map();

  /**
   * 创建 SSH 连接
   * @param sessionId 会话 ID
   * @param ws WebSocket 实例
   * @param config SSH 连接配置
   */
  async createConnection(
    sessionId: string,
    ws: WebSocket,
    config: {
      host: string;
      port: number;
      username: string;
      password?: string;
      privateKey?: string;
    },
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const sshClient = new Client();

      // 构建 SSH 连接配置
      const sshConfig: ConnectConfig = {
        host: config.host,
        port: config.port,
        username: config.username,
        readyTimeout: 10000, // 10秒超时
      };

      // 添加认证方式
      if (config.password) {
        sshConfig.password = config.password;
      } else if (config.privateKey) {
        sshConfig.privateKey = config.privateKey;
      } else {
        reject(new Error('必须提供密码或私钥'));
        return;
      }

      // 监听连接成功事件
      sshClient.on('ready', () => {
        this.logger.log(`SSH connected to ${config.host}:${config.port}`);

        // 打开 shell 会话
        sshClient.shell(
          {
            term: 'xterm-color',
            cols: 80,
            rows: 24,
          },
          (err, stream) => {
            if (err) {
              this.logger.error('Failed to open shell', err);
              reject(err);
              return;
            }

            this.logger.log('Shell session opened');

            // 保存会话
            this.sessions.set(sessionId, {
              client: sshClient,
              stream,
              ws,
            });

            // 将 SSH 输出转发到 WebSocket
            stream.on('data', (data: Buffer) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'output',
                    data: data.toString(),
                  }),
                );
              }
            });

            stream.on('close', () => {
              this.logger.log('Shell stream closed');
              this.cleanupSession(sessionId);
            });

            stream.stderr.on('data', (data: Buffer) => {
              if (ws.readyState === WebSocket.OPEN) {
                ws.send(
                  JSON.stringify({
                    type: 'output',
                    data: data.toString(),
                  }),
                );
              }
            });

            resolve();
          },
        );
      });

      // 监听连接错误
      sshClient.on('error', (err) => {
        this.logger.error(`SSH connection error: ${err.message}`, err.stack);
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(
            JSON.stringify({
              type: 'error',
              data: `SSH 连接失败: ${err.message}`,
            }),
          );
        }
        reject(err);
      });

      // 监听连接关闭
      sshClient.on('close', () => {
        this.logger.log('SSH connection closed');
        this.cleanupSession(sessionId);
      });

      // 建立 SSH 连接
      try {
        sshClient.connect(sshConfig);
      } catch (error) {
        this.logger.error('Failed to initiate SSH connection', error);
        reject(error instanceof Error ? error : new Error(String(error)));
      }
    });
  }

  /**
   * 发送命令到 SSH 会话
   * @param sessionId 会话 ID
   * @param data 命令数据
   */
  sendCommand(sessionId: string, data: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session ${sessionId} not found`);
      return;
    }

    if (session.stream) {
      session.stream.write(data);
    }
  }

  /**
   * 调整终端大小
   * @param sessionId 会话 ID
   * @param cols 列数
   * @param rows 行数
   */
  resizeTerminal(sessionId: string, cols: number, rows: number): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      this.logger.warn(`Session ${sessionId} not found`);
      return;
    }

    // ssh2 库的 stream 对象有 setWindow 方法，但类型定义不完整
    /* eslint-disable @typescript-eslint/no-explicit-any */
    /* eslint-disable @typescript-eslint/no-unsafe-call */
    /* eslint-disable @typescript-eslint/no-unsafe-member-access */
    if (session.stream && 'setWindow' in session.stream) {
      (session.stream as any).setWindow(rows, cols);
      this.logger.debug(`Terminal resized to ${cols}x${rows}`);
    }
    /* eslint-enable @typescript-eslint/no-explicit-any */
    /* eslint-enable @typescript-eslint/no-unsafe-call */
    /* eslint-enable @typescript-eslint/no-unsafe-member-access */
  }

  /**
   * 清理会话
   * @param sessionId 会话 ID
   */
  cleanupSession(sessionId: string): void {
    const session = this.sessions.get(sessionId);
    if (!session) {
      return;
    }

    this.logger.log(`Cleaning up session ${sessionId}`);

    try {
      // 关闭 stream
      if (session.stream) {
        session.stream.end();
      }

      // 关闭 SSH 客户端
      if (session.client) {
        session.client.end();
      }

      // 从会话映射中移除
      this.sessions.delete(sessionId);

      this.logger.log(`Session ${sessionId} cleaned up`);
    } catch (error) {
      this.logger.error(`Error cleaning up session ${sessionId}`, error);
    }
  }

  /**
   * 获取活跃会话数量
   */
  getActiveSessionCount(): number {
    return this.sessions.size;
  }
}
