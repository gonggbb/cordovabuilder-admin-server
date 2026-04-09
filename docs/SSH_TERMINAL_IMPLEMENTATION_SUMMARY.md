# WebSocket SSH 功能实现总结

## 问题原因

你的前端 `SshTerminal.vue` 尝试连接 `ws://localhost:3001/ws/ssh`，但后端服务缺少 WebSocket SSH 功能的实现。

## ✅ 已完成的解决方案

### 1. 安装的依赖包

```json
{
  "@nestjs/websockets": "^11.1.18",
  "@nestjs/platform-ws": "^11.1.18",
  "ws": "^8.20.0",
  "ssh2": "^1.17.0",
  "uuid": "^13.0.0",
  "@types/ws": "^8.18.1",
  "@types/ssh2": "^1.15.5",
  "@types/uuid": "^11.0.0"
}
```

### 2. 创建的文件结构

```
src/features/ssh-terminal/
├── ssh.service.ts      # SSH 服务层（管理 SSH 连接和会话）
├── ssh.gateway.ts      # WebSocket 网关（处理 WebSocket 消息）
├── ssh.module.ts       # 模块定义
├── index.ts            # 导出索引
└── README.md           # 完整使用文档

docs/
├── ssh-terminal-test.html          # HTML 测试页面
└── SSH_TERMINAL_QUICKSTART.md      # 快速启动指南
```

### 3. 修改的文件

- ✅ `src/app.module.ts` - 导入 `SshModule`
- ✅ `src/main.ts` - 配置 `WsAdapter`

## 🏗️ 架构设计

```
前端 (Vue.js)                    后端 (NestJS)
┌──────────────┐              ┌─────────────────┐
│ SshTerminal  │  WebSocket   │  SshGateway     │
│   .vue       │ ◄══════════► │  (/ws/ssh)      │
│              │  ws://:3001  │                 │
└──────────────┘              └────────┬────────┘
                                       │
                                       │ SSH
                                       ▼
                                ┌─────────────────┐
                                │  SshService     │
                                │  (ssh2 client)  │
                                └────────┬────────┘
                                         │
                                         ▼
                                  ┌──────────────┐
                                  │ Remote SSH   │
                                  │ Server       │
                                  └──────────────┘
```

## 📡 WebSocket 消息协议

### 客户端 → 服务端

| 消息类型 | 说明 | 数据格式 |
|---------|------|----------|
| `connect` | 建立 SSH 连接 | `{host, port, username, password?, privateKey?}` |
| `command` | 发送命令 | `string` (需包含 `\n`) |
| `resize` | 调整终端大小 | `{cols: number, rows: number}` |

### 服务端 → 客户端

| 消息类型 | 说明 | 数据格式 |
|---------|------|----------|
| `connected` | 连接成功 | `{sessionId: string}` |
| `output` | 终端输出 | `string` |
| `error` | 错误信息 | `string` |
| `disconnected` | 连接断开 | - |

## 🚀 使用方法

### 1. 启动后端服务

```bash
cd c:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server
pnpm run start:dev
```

你应该看到：
```
[Nest] xxxxx  - xx/xx/xxxx, xx:xx:xx PM     LOG [Bootstrap] Application is running on: http://localhost:3001
[Nest] xxxxx  - xx/xx/xxxx, xx:xx:xx PM     LOG [Bootstrap] WebSocket SSH endpoint: ws://localhost:3001/ws/ssh
```

### 2. 前端连接示例

#### Vue.js 组件中：

```typescript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:3001/ws/ssh');

ws.onopen = () => {
  console.log('WebSocket connected');
  
  // 发送 SSH 连接配置
  ws.send(JSON.stringify({
    type: 'connect',
    data: {
      host: '192.168.1.100',
      port: 22,
      username: 'admin',
      password: 'your_password'
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'output':
      // 将输出写入终端
      terminal.write(message.data);
      break;
    case 'error':
      console.error('SSH Error:', message.data);
      break;
    case 'connected':
      console.log('SSH connected!');
      break;
  }
};

// 发送命令
function sendCommand(cmd: string) {
  ws.send(JSON.stringify({
    type: 'command',
    data: cmd + '\n'  // 重要：需要换行符
  }));
}
```

### 3. 测试页面

打开浏览器访问：
```
file:///c:/worksapce/cusworksapce/cordovabuilder-admin/cordovabuilder-admin-server/docs/ssh-terminal-test.html
```

填写 SSH 连接信息并测试。

## 🔧 核心代码说明

### SshService (ssh.service.ts)

负责管理 SSH 连接的生命周期：

```typescript
// 创建 SSH 连接
async createConnection(sessionId, ws, config) {
  const sshClient = new Client();
  
  sshClient.on('ready', () => {
    sshClient.shell({}, (err, stream) => {
      // 将 SSH 输出转发到 WebSocket
      stream.on('data', (data) => {
        ws.send(JSON.stringify({ type: 'output', data }));
      });
    });
  });
  
  sshClient.connect(sshConfig);
}

// 发送命令
sendCommand(sessionId, data) {
  const session = this.sessions.get(sessionId);
  session.stream.write(data);
}

// 清理会话
cleanupSession(sessionId) {
  session.stream.end();
  session.client.end();
  this.sessions.delete(sessionId);
}
```

### SshGateway (ssh.gateway.ts)

处理 WebSocket 连接和消息路由：

```typescript
@WebSocketGateway({ path: '/ws/ssh' })
export class SshGateway implements OnGatewayConnection, OnGatewayDisconnect {
  
  handleConnection(client: WebSocket) {
    const sessionId = uuidv4();
    this.sessionMap.set(client, sessionId);
    // 通知客户端连接成功
  }
  
  @SubscribeMessage('message')
  handleMessage(@MessageBody() message, @ConnectedSocket() client) {
    switch (message.type) {
      case 'connect':
        await this.sshService.createConnection(...);
        break;
      case 'command':
        this.sshService.sendCommand(...);
        break;
      case 'resize':
        this.sshService.resizeTerminal(...);
        break;
    }
  }
  
  handleDisconnect(client: WebSocket) {
    // 自动清理 SSH 会话
  }
}
```

## ⚠️ 重要注意事项

### 1. 端口配置

当前环境配置的端口是 **3001**（见 `config/.env`），所以 WebSocket URL 是：
```
ws://localhost:3001/ws/ssh
```

如果你的端口不同，请相应调整。

### 2. 安全警告

⚠️ **当前实现仅用于开发和测试！**

生产环境必须：
- ✅ 添加身份验证（JWT、OAuth 等）
- ✅ 使用 WSS (WebSocket Secure)
- ✅ 限制 CORS 来源
- ✅ 添加速率限制
- ✅ 实现会话超时
- ✅ 审计日志记录

### 3. 常见问题

#### Q: WebSocket 连接失败？

**检查**：
1. 服务是否运行：`netstat -ano | findstr 3001`
2. 防火墙是否阻止
3. CORS 配置是否正确

#### Q: SSH 连接失败？

**检查**：
1. SSH 服务器是否可访问：`ssh user@host`
2. 用户名和密码是否正确
3. 查看后端日志获取详细错误信息

#### Q: 终端没有输出？

**检查**：
1. 命令是否包含换行符 `\n`
2. WebSocket 连接状态是否为 OPEN
3. 查看浏览器控制台的错误信息

## 📚 相关文档

- [完整 README](../src/features/ssh-terminal/README.md)
- [快速启动指南](./SSH_TERMINAL_QUICKSTART.md)
- [测试页面](./ssh-terminal-test.html)

## 🎯 下一步建议

1. **立即测试**：
   ```bash
   pnpm run start:dev
   ```
   然后打开测试页面或更新你的 `SshTerminal.vue`

2. **集成到你的 Vue 组件**：
   参考 `docs/ssh-terminal-test.html` 或 `SSH_TERMINAL_QUICKSTART.md` 中的示例

3. **生产环境准备**：
   - 添加 JWT 认证
   - 配置 HTTPS/WSS
   - 实现用户权限控制

## ✨ 总结

现在你的后端已经完全支持 WebSocket SSH 功能！

- ✅ WebSocket 端点：`ws://localhost:3001/ws/ssh`
- ✅ 完整的 SSH 会话管理
- ✅ 实时终端输出
- ✅ 支持命令发送和终端大小调整
- ✅ 自动清理断开的连接

**立即启动服务并测试吧！** 🚀
