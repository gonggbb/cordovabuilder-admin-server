# SSH Terminal WebSocket 功能

## 概述

本模块提供了基于 WebSocket 的 SSH 终端功能，允许前端通过 WebSocket 连接远程服务器并执行命令。

## 技术栈

- **WebSocket 框架**: `@nestjs/websockets` + `@nestjs/platform-ws`
- **WebSocket 库**: `ws`
- **SSH 客户端**: `ssh2`

## 架构

```
┌─────────────┐         WebSocket          ┌──────────────┐         SSH         ┌─────────────┐
│   Frontend  │ ◄════════════════════════► │  SshGateway  │ ◄════════════════► │  Remote     │
│  (Vue.js)   │      ws://localhost:3000   │              │    ssh2 library    │  Server     │
│             │        /ws/ssh             │  SshService  │                    │             │
└─────────────┘                            └──────────────┘                    └─────────────┘
```

## WebSocket 端点

- **URL**: `ws://localhost:3000/ws/ssh`
- **协议**: WebSocket

## 消息格式

### 客户端 → 服务端

#### 1. 建立 SSH 连接

```javascript
{
  type: 'connect',
  data: {
    host: '192.168.1.100',
    port: 22,
    username: 'admin',
    password: 'your_password',  // 或使用 privateKey
    // privateKey: '-----BEGIN RSA PRIVATE KEY-----...'
  }
}
```

#### 2. 发送命令

```javascript
{
  type: 'command',
  data: 'ls -la\n'  // 注意：需要包含换行符
}
```

#### 3. 调整终端大小

```javascript
{
  type: 'resize',
  data: {
    cols: 80,
    rows: 24
  }
}
```

### 服务端 → 客户端

#### 1. 连接成功

```javascript
{
  type: 'connected',
  data: {
    sessionId: 'uuid-string'
  }
}
```

#### 2. 终端输出

```javascript
{
  type: 'output',
  data: 'total 0\ndrwxr-xr-x 2 user group 4096 Jan 1 00:00 .\n'
}
```

#### 3. 错误信息

```javascript
{
  type: 'error',
  data: 'SSH 连接失败: Authentication failed'
}
```

#### 4. 连接断开

```javascript
{
  type: 'disconnected',
  data: 'Connection closed'
}
```

## 前端使用示例

### Vue.js + xterm.js 示例

```vue
<template>
  <div ref="terminal" class="terminal"></div>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue';
import { Terminal } from 'xterm';
import 'xterm/css/xterm.css';

const terminal = ref(null);
let term = null;
let ws = null;

onMounted(() => {
  // 初始化终端
  term = new Terminal();
  term.open(terminal.value);

  // 创建 WebSocket 连接
  ws = new WebSocket('ws://localhost:3000/ws/ssh');

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
        term.write(message.data);
        break;
      case 'error':
        console.error('SSH Error:', message.data);
        term.write(`\r\nError: ${message.data}\r\n`);
        break;
      case 'connected':
        console.log('SSH connected, session:', message.data.sessionId);
        break;
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  ws.onclose = () => {
    console.log('WebSocket closed');
  };

  // 监听终端输入
  term.onData((data) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'command',
        data: data
      }));
    }
  });

  // 监听终端大小变化
  term.onResize((size) => {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'resize',
        data: {
          cols: size.cols,
          rows: size.rows
        }
      }));
    }
  });
});

onUnmounted(() => {
  if (ws) {
    ws.close();
  }
  if (term) {
    term.dispose();
  }
});
</script>

<style scoped>
.terminal {
  width: 100%;
  height: 500px;
}
</style>
```

## 启动服务

```bash
# 安装依赖
pnpm install

# 开发模式启动
pnpm run start:dev

# 生产模式启动
pnpm run build
pnpm run start:prod
```

服务启动后，WebSocket 端点将在：
- `ws://localhost:3000/ws/ssh`

## 安全注意事项

⚠️ **重要安全提示**：

1. **认证**: 当前实现没有身份验证机制，生产环境必须添加 JWT 或其他认证方式
2. **密码传输**: 密码通过 WebSocket 明文传输，建议使用 WSS (WebSocket Secure)
3. **访问控制**: 应限制哪些用户可以建立 SSH 连接
4. **会话管理**: 建议添加会话超时和最大连接数限制
5. **输入验证**: 已实现基本的参数验证，但可能需要更严格的验证规则

## 配置选项

可以在 `.env` 文件中添加以下配置：

```env
# WebSocket 配置
WS_PORT=3000
WS_PATH=/ws/ssh

# SSH 默认配置（可选）
SSH_DEFAULT_PORT=22
SSH_CONNECTION_TIMEOUT=10000
```

## 故障排查

### 问题：WebSocket 连接失败

**可能原因**：
1. 服务未启动
2. 端口被占用
3. CORS 配置不正确

**解决方案**：
```bash
# 检查服务是否运行
netstat -an | findstr 3000

# 查看日志
pnpm run start:dev
```

### 问题：SSH 连接失败

**可能原因**：
1. 主机地址或端口错误
2. 用户名或密码错误
3. SSH 服务未运行
4. 防火墙阻止连接

**解决方案**：
1. 检查 SSH 服务器是否可访问：`ssh username@host`
2. 确认端口是否正确（默认 22）
3. 检查服务器日志

## 扩展功能

可以进一步扩展的功能：

1. **会话管理**: 支持多个并发 SSH 会话
2. **密钥管理**: 安全的 SSH 密钥存储和管理
3. **命令历史**: 记录和回放命令历史
4. **文件传输**: 支持 SFTP 文件上传下载
5. **端口转发**: 支持 SSH 隧道和端口转发
6. **审计日志**: 记录所有 SSH 会话和操作

## 依赖包

```json
{
  "@nestjs/websockets": "^11.1.18",
  "@nestjs/platform-ws": "^11.1.18",
  "ws": "^8.20.0",
  "ssh2": "^1.17.0",
  "uuid": "^13.0.0"
}
```

## 相关文件

- `src/features/ssh-terminal/ssh.gateway.ts` - WebSocket 网关
- `src/features/ssh-terminal/ssh.service.ts` - SSH 服务
- `src/features/ssh-terminal/ssh.module.ts` - 模块定义
- `src/app.module.ts` - 主应用模块（已导入 SshModule）
- `src/main.ts` - 应用入口（已配置 WebSocket 适配器）
