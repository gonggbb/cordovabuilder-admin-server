import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'ws';
import { WebSocket } from 'ws';
import { SshService } from './ssh.service';
import { v4 as uuidv4 } from 'uuid';

interface WsMessage {
  type: string;
  data: any;
}

@WebSocketGateway({
  path: '/ws/ssh',
  cors: {
    origin: '*', // 生产环境应限制具体域名
  },
})
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private readonly logger = new Logger(SshGateway.name);
  private sessionMap: Map<WebSocket, string> = new Map();

  constructor(private readonly sshService: SshService) {}

  /**
   * 处理新的 WebSocket 连接
   */
  handleConnection(client: WebSocket) {
    const sessionId = uuidv4();
    this.sessionMap.set(client, sessionId);
    this.logger.log(`Client connected: ${sessionId}`);

    // 发送连接成功消息
    client.send(
      JSON.stringify({
        type: 'connected',
        data: { sessionId },
      }),
    );

    // 监听原生 WebSocket 消息
    client.on('message', (rawMessage: string) => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        const message: WsMessage = JSON.parse(rawMessage.toString());
        this.logger.debug(`Received message type: ${message.type}`);

        switch (message.type) {
          case 'connect':
          case 'ssh-connect':
            this.handleConnect(client, sessionId, message.data);
            break;

          case 'command':
          case 'ssh-command':
            this.sshService.sendCommand(sessionId, message.data);
            break;

          case 'resize':
          case 'ssh-resize': {
            const { cols, rows } = message.data as {
              cols: number;
              rows: number;
            };
            this.sshService.resizeTerminal(sessionId, cols, rows);
            break;
          }

          default:
            this.logger.warn(`Unknown message type: ${message.type}`);
            client.send(
              JSON.stringify({
                type: 'error',
                data: `未知的消息类型: ${message.type}`,
              }),
            );
        }
      } catch (error) {
        this.logger.error('Failed to parse message', error);
        client.send(
          JSON.stringify({
            type: 'error',
            data: '消息格式错误',
          }),
        );
      }
    });
  }

  /**
   * 处理 WebSocket 断开连接
   */
  handleDisconnect(client: WebSocket) {
    const sessionId = this.sessionMap.get(client);
    if (sessionId) {
      this.logger.log(`Client disconnected: ${sessionId}`);
      this.sshService.cleanupSession(sessionId);
      this.sessionMap.delete(client);
    }
  }

  /**
   * 处理 SSH 连接请求
   */
  private async handleConnect(
    client: WebSocket,
    sessionId: string,
    config: {
      host: string;
      port: number;
      username: string;
      password?: string;
      privateKey?: string;
    },
  ) {
    try {
      // 验证必要参数
      if (!config.host || !config.port || !config.username) {
        throw new Error('缺少必要的连接参数: host, port, username');
      }

      this.logger.log(
        `Attempting SSH connection to ${config.host}:${config.port}`,
      );

      await this.sshService.createConnection(sessionId, client, config);

      this.logger.log(`SSH connection established for session ${sessionId}`);
    } catch (error) {
      this.logger.error('Failed to establish SSH connection', error);
      client.send(
        JSON.stringify({
          type: 'error',
          data: `SSH 连接失败: ${error instanceof Error ? error.message : String(error)}`,
        }),
      );
    }
  }
}
