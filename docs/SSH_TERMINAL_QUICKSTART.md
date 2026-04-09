# SSH Terminal 快速启动指南

## 问题诊断

你遇到的错误：
```
WebSocket connection to 'ws://localhost:3001/ws/ssh' failed
```

**原因**：后端服务尚未实现 WebSocket SSH 功能。

## ✅ 已完成的修复

我已经为你实现了完整的 WebSocket SSH 功能，包括：

### 1. 安装必要的依赖包

```bash
pnpm add @nestjs/websockets @nestjs/platform-ws ws ssh2 uuid
pnpm add -D @types/ws @types/ssh2 @types/uuid
```

### 2. 创建的文件

- ✅ `src/features/ssh-terminal/ssh.service.ts` - SSH 服务层
- ✅ `src/features/ssh-terminal/ssh.gateway.ts` - WebSocket 网关
- ✅ `src/features/ssh-terminal/ssh.module.ts` - 模块定义
- ✅ `src/features/ssh-terminal/index.ts` - 导出索引
- ✅ `src/features/ssh-terminal/README.md` - 完整文档
- ✅ `docs/ssh-terminal-test.html` - 测试页面

### 3. 修改的文件

- ✅ `src/app.module.ts` - 导入 SshModule
- ✅ `src/main.ts` - 配置 WebSocket 适配器

## 🚀 启动步骤

### 步骤 1: 确认依赖已安装

```bash
cd c:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server
pnpm install
```

### 步骤 2: 构建项目

```bash
pnpm run build
```

### 步骤 3: 启动服务

```bash
# 开发模式（推荐，支持热重载）
pnpm run start:dev

# 或生产模式
pnpm run start:prod
```

### 步骤 4: 验证服务启动

服务启动后，你应该看到类似以下输出：

```
[Nest] xxxxx  - xx/xx/xxxx, xx:xx:xx PM     LOG [Bootstrap] Application is running on: http://localhost:3001
[Nest] xxxxx  - xx/xx/xxxx, xx:xx:xx PM     LOG [Bootstrap] WebSocket SSH endpoint: ws://localhost:3001/ws/ssh
[Nest] xxxxx  - xx/xx/xxxx, xx:xx:xx PM     LOG [Bootstrap] API Documentation: http://localhost:3001/api/docs
```

### 步骤 5: 测试 WebSocket 连接

#### 方法 1: 使用测试页面

在浏览器中打开：
```
file:///c:/worksapce/cusworksapce/cordovabuilder-admin/cordovabuilder-admin-server/docs/ssh-terminal-test.html
```

填写 SSH 连接信息并点击"连接"按钮。

#### 方法 2: 使用浏览器控制台测试

打开任意网页的开发者工具（F12），在 Console 中运行：

```javascript
// 创建 WebSocket 连接
const ws = new WebSocket('ws://localhost:3001/ws/ssh');

ws.onopen = () => {
  console.log('✓ WebSocket 已连接');
  
  // 发送 SSH 连接请求
  ws.send(JSON.stringify({
    type: 'connect',
    data: {
      host: 'your-ssh-server.com',
      port: 22,
      username: 'your-username',
      password: 'your-password'
    }
  }));
};

ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  console.log('收到消息:', message);
  
  if (message.type === 'output') {
    console.log('终端输出:', message.data);
  }
};

ws.onerror = (error) => {
  console.error('✗ WebSocket 错误:', error);
};

// 发送命令
function sendCommand(cmd) {
  ws.send(JSON.stringify({
    type: 'command',
    data: cmd + '\n'
  }));
}

// 示例：执行 ls 命令
sendCommand('ls -la');
```

#### 方法 3: 在你的 Vue 组件中使用

参考 `SshTerminal.vue` 的实现，确保：

```javascript
// 正确的 WebSocket URL
const wsUrl = 'ws://localhost:3001/ws/ssh';  // 注意端口是 3001

// 创建连接
this.ws = new WebSocket(wsUrl);

// 监听连接成功
this.ws.onopen = () => {
  console.log('WebSocket connected');
  
  // 发送 SSH 配置
  this.ws.send(JSON.stringify({
    type: 'connect',
    data: {
      host: this.sshHost,
      port: this.sshPort,
      username: this.sshUsername,
      password: this.sshPassword
    }
  }));
};

// 监听消息
this.ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  
  switch (message.type) {
    case 'output':
      // 处理终端输出
      this.terminal.write(message.data);
      break;
    case 'error':
      console.error('SSH Error:', message.data);
      break;
    case 'connected':
      console.log('SSH connected, session ID:', message.data.sessionId);
      break;
  }
};
```

## 🔧 常见问题排查

### 问题 1: 仍然无法连接

**检查清单**：
1. ✅ 服务是否正在运行？
   ```bash
   # Windows
   netstat -ano | findstr 3001
   
   # 应该看到类似输出：
   # TCP    0.0.0.0:3001           0.0.0.0:0              LISTENING       12345
   ```

2. ✅ 防火墙是否阻止了端口？
   ```bash
   # 以管理员身份运行 PowerShell
   Test-NetConnection -ComputerName localhost -Port 3001
   ```

3. ✅ CORS 配置是否正确？
   - 当前配置允许所有来源 (`origin: '*'`)
   - 检查浏览器控制台是否有 CORS 错误

### 问题 2: WebSocket 连接成功但 SSH 连接失败

**可能原因**：
- SSH 服务器地址或端口错误
- 用户名或密码错误
- SSH 服务未运行
- 防火墙阻止 SSH 连接

**调试步骤**：
1. 先用普通 SSH 客户端测试连接：
   ```bash
   ssh username@hostname -p 22
   ```

2. 检查后端日志，查看详细的错误信息

### 问题 3: 端口不是 3001

如果你的环境配置不同，请检查：

```bash
# 查看当前 .env 文件
cat config/.env

# 查找 PORT 配置
# PORT=3001
```

如果端口不同，前端需要相应调整：
```javascript
const wsUrl = 'ws://localhost:' + YOUR_PORT + '/ws/ssh';
```

## 📝 消息协议参考

### 客户端 → 服务端

| 类型 | 说明 | 数据格式 |
|------|------|----------|
| `connect` | 建立 SSH 连接 | `{host, port, username, password?, privateKey?}` |
| `command` | 发送命令 | 字符串（包含换行符） |
| `resize` | 调整终端大小 | `{cols: number, rows: number}` |

### 服务端 → 客户端

| 类型 | 说明 | 数据格式 |
|------|------|----------|
| `connected` | 连接成功 | `{sessionId: string}` |
| `output` | 终端输出 | 字符串 |
| `error` | 错误信息 | 字符串 |
| `disconnected` | 连接断开 | - |

## 🔐 安全建议

⚠️ **重要**：当前实现仅用于开发和测试，生产环境需要：

1. **添加身份验证**
   ```typescript
   // 在 gateway 中添加认证守卫
   @UseGuards(JwtAuthGuard)
   @WebSocketGateway({ path: '/ws/ssh' })
   export class SshGateway { ... }
   ```

2. **使用 WSS (WebSocket Secure)**
   ```nginx
   # Nginx 配置示例
   location /ws/ssh {
       proxy_pass http://backend;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection "upgrade";
   }
   ```

3. **限制连接来源**
   ```typescript
   @WebSocketGateway({
     path: '/ws/ssh',
     cors: {
       origin: ['https://yourdomain.com'], // 限制特定域名
     },
   })
   ```

4. **添加速率限制和会话超时**

## 📚 相关文档

- [完整 README](../src/features/ssh-terminal/README.md)
- [NestJS WebSocket 文档](https://docs.nestjs.com/websockets/gateways)
- [ssh2 文档](https://github.com/mscdex/ssh2)

## ✨ 下一步

1. 启动服务：`pnpm run start:dev`
2. 打开测试页面或你的 Vue 应用
3. 连接到 SSH 服务器
4. 开始使用终端！

如有问题，请检查：
- 后端日志（终端输出）
- 浏览器控制台（F12）
- 网络面板（查看 WebSocket 连接状态）
