# CordovaBuilder Admin Server 使用指南

## 📦 项目简介

基于 NestJS 框架的 TypeScript 服务端应用，作为 CordovaBuilder 项目的管理后端服务器。提供 Node.js、Java、Gradle、SDK 等开发环境的管理功能。

## 🚀 快速开始

### 1. 安装依赖

```bash
pnpm install
```

### 2. 启动开发服务器

```bash
pnpm run start:dev
```

### 3. 访问 API 文档

打开浏览器访问：
```
http://localhost:3000/api/docs
```

## 📚 API 接口说明

### Node.js 管理

#### GET /node
获取 Node 管理信息

#### POST /node/download
下载指定版本的 Node.js

**参数：**
- `version` (必需): Node.js 版本号，例如：`v18.16.0`
- `platform` (可选): 操作系统平台，默认当前系统
- `arch` (可选): 系统架构，默认当前架构

**示例：**
```bash
curl -X POST "http://localhost:3000/node/download?version=v18.16.0&platform=linux&arch=x64"
```

### Java 管理

#### GET /java
获取 Java 管理信息

### Gradle 管理

#### GET /gradle
获取 Gradle 管理信息

### SDK 管理

#### GET /sdk
获取 SDK 管理信息

## 🔧 可用命令

```bash
# 开发模式
pnpm run start:dev

# 调试模式
pnpm run start:debug

# 生产模式（需先构建）
pnpm run build
pnpm run start:prod

# 代码格式化
pnpm run format

# 代码检查
pnpm run lint

# 运行测试
pnpm run test

# 端到端测试
pnpm run test:e2e

# 测试覆盖率
pnpm run test:cov
```

## 📖 详细文档

- [API 文档说明](./API_DOCS.md) - Swagger API 文档详细使用说明
- [Node 管理模块文档](./src/features/node-management/README.md) - Node.js 管理功能详细说明

## 🏗️ 项目结构

```
cordovabuilder-admin-server/
├── src/
│   ├── features/
│   │   ├── node-management/      # Node.js 管理模块
│   │   ├── java-management/      # Java 管理模块
│   │   ├── gradle-management/    # Gradle 管理模块
│   │   ├── sdk-management/       # SDK 管理模块
│   │   └── hello/                # 基础示例模块
│   ├── main.ts                   # 应用入口
│   └── app.module.ts             # 根模块
├── API_DOCS.md                   # API 文档说明
├── README.md                     # 项目说明
└── package.json                  # 项目配置
```

## 💡 技术栈

- **框架**: NestJS v11.0.1
- **语言**: TypeScript v5.7.3
- **API 文档**: Swagger (OpenAPI)
- **包管理器**: pnpm
- **测试框架**: Jest v30.0.0

## 🎯 核心特性

1. **模块化设计**: 每个功能模块独立，职责清晰
2. **类型安全**: 完整的 TypeScript 类型支持
3. **API 文档**: 自动生成 Swagger/OpenAPI 文档
4. **测试支持**: 内置单元测试和端到端测试
5. **代码规范**: ESLint + Prettier 强制代码质量

## ⚠️ 注意事项

1. **wget 依赖**: Node.js 下载功能需要系统安装 `wget` 工具
2. **下载目录**: 所有下载文件保存在项目根目录的 `downloads/` 文件夹
3. **端口配置**: 默认使用 3000 端口，可通过 `PORT` 环境变量修改

## 📝 开发规范

遵循以下代码规范：
- 使用 ESLint + Prettier 进行代码检查和格式化
- TypeScript 严格模式 (`strictNullChecks: true`)
- 模块化架构设计原则
- 统一的命名规范

## 🔐 生产环境部署

1. 构建项目：
   ```bash
   pnpm run build
   ```

2. 运行生产版本：
   ```bash
   pnpm run start:prod
   ```

3. （可选）禁用 Swagger 文档：
   修改 `src/main.ts`，添加环境判断逻辑

## 📞 更多信息

详细的 API 文档和使用说明请查看 [API_DOCS.md](./API_DOCS.md)
