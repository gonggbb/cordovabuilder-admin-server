# Node 管理 API 文档

## 概述

Node 管理模块提供 Node.js 环境管理功能，包括版本检测、下载和配置。

## API 端点

### 1. 获取 Node 信息

**请求：**

```
GET /node
```

**响应：**

```
Node Management Service
```

### 2. 下载 Node.js

**请求：**

```
POST /node/download?version=v18.16.0&platform=linux&arch=x64
```

**查询参数：**

- `version` (必需): Node.js 版本号，例如：`v18.16.0`, `v20.5.0`
- `platform` (可选): 操作系统平台，默认为当前系统
  - `linux`: Linux 系统
  - `win32`: Windows 系统
  - `darwin`: macOS 系统
- `arch` (可选): 系统架构，默认为当前架构
  - `x64`: 64 位系统
  - `x86`: 32 位系统
  - `arm64`: ARM 64 位系统

**成功响应：**

```json
{
  "success": true,
  "message": "Node.js v18.16.0 已成功下载到 ./downloads/node-v18.16.0-linux-x64.tar.xz"
}
```

**失败响应：**

```json
{
  "success": false,
  "message": "不支持的平台或架构：linux/arm32"
}
```

## 使用示例

### cURL 示例

#### 下载 Node.js v18.16.0 for Linux x64

```bash
curl -X POST "http://localhost:3000/node/download?version=v18.16.0&platform=linux&arch=x64"
```

#### 下载 Node.js v20.5.0 for Windows x64

```bash
curl -X POST "http://localhost:3000/node/download?version=v20.5.0&platform=win32&arch=x64"
```

#### 下载 Node.js v18.16.0 for macOS

```bash
curl -X POST "http://localhost:3000/node/download?version=v18.16.0&platform=darwin"
```

## 技术实现

### 下载机制
- 使用 `wget` 命令行工具进行文件下载
- 从 Node.js 官方源 (https://nodejs.org/dist) 下载
- 自动根据平台和架构选择正确的安装包格式
  - Linux: `.tar.xz`
  - Windows: `.zip`
  - macOS: `.pkg`

### 文件存储
- 所有下载的文件保存在**项目根目录**下的 `downloads/` 目录
- 使用绝对路径确保跨平台兼容性
- 文件名格式：`node-{version}-{platform}-{arch}.{ext}`

## 注意事项

1. **依赖要求**: 系统需要安装 `wget` 工具
2. **网络要求**: 需要能够访问 https://nodejs.org
3. **磁盘空间**: 确保有足够的磁盘空间存储下载的压缩包
4. **权限要求**: 应用需要有创建 `./downloads/` 目录的权限
