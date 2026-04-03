# CordovaBuilder Admin Server

<p align="center">
  <a href="http://nestjs.com/" target="blank"><img src="https://nestjs.com/img/logo-small.svg" width="120" alt="Nest Logo" /></a>
</p>

CordovaBuilder 项目管理后端服务器 - 基于 NestJS 框架的 TypeScript 服务端应用，提供 Node.js、Java、Gradle、SDK 等开发环境的管理功能。

## 🚀 快速开始

### 安装依赖
```bash
pnpm install
```

### 启动开发服务器
```bash
pnpm run start:dev
```

### 访问 API 文档
打开浏览器访问：
```
http://localhost:3000/api/docs
```

详细快速启动指南请查看 [QUICKSTART.md](./QUICKSTART.md)

## 📚 文档

- **[🚀 快速启动指南](./QUICKSTART.md)** - 30 秒快速体验
- **[📖 API 文档说明](./API_DOCS.md)** - Swagger API 详细使用指南
- **[💡 使用指南](./USAGE.md)** - 完整的项目使用说明
- **[📝 实现总结](./IMPLEMENTATION_SUMMARY.md)** - 接口文档功能实现详情

## 🎯 核心功能

### 1. Node.js 管理
- 获取 Node.js 信息
- 下载指定版本的 Node.js（支持多平台）

### 2. Java 管理
- 获取 Java 环境信息
- JDK/JRE 版本管理（待扩展）

### 3. Gradle 管理
- 获取 Gradle 构建工具信息
- 版本管理（待扩展）

### 4. SDK 管理
- 获取 SDK 管理信息
- SDK 下载和配置（待扩展）

## 🛠️ 技术栈

- **框架**: [NestJS](https://github.com/nestjs/nest) v11.0.1
- **语言**: TypeScript v5.7.3
- **API 文档**: [Swagger](https://swagger.io/) (OpenAPI)
- **包管理器**: [pnpm](https://pnpm.io/)
- **测试框架**: Jest v30.0.0

## 📦 项目结构

```
cordovabuilder-admin-server/
├── src/
│   ├── features/
│   │   ├── node-management/      # Node.js 管理模块
│   │   ├── java-management/      # Java 管理模块
│   │   ├── gradle-management/    # Gradle 管理模块
│   │   ├── sdk-management/       # SDK 管理模块
│   │   └── hello/                # 基础示例模块
│   ├── main.ts                   # 应用入口（含 Swagger 配置）
│   └── app.module.ts             # 根模块
├── API_DOCS.md                   # API 文档说明
├── USAGE.md                      # 使用指南
├── QUICKSTART.md                 # 快速启动指南
└── README.md                     # 项目说明
```

## 🔧 可用命令

```bash
# 开发模式（热重载）
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

## 🌐 API 端点

所有 API 都提供了 Swagger 文档，访问 `http://localhost:3000/api/docs` 查看。

| 端点 | 方法 | 描述 |
|------|------|------|
| `/node` | GET | 获取 Node.js 管理信息 |
| `/node/download` | POST | 下载指定版本的 Node.js |
| `/java` | GET | 获取 Java 管理信息 |
| `/gradle` | GET | 获取 Gradle 管理信息 |
| `/sdk` | GET | 获取 SDK 管理信息 |

## 📖 API 测试示例

### 下载 Node.js
```bash
curl -X POST "http://localhost:3000/node/download?version=v18.16.0&platform=linux&arch=x64"
```

### 使用 Swagger UI
1. 访问 http://localhost:3000/api/docs
2. 选择要测试的功能模块（如 "Node 管理"）
3. 展开具体接口
4. 点击 "Try it out"
5. 填写参数
6. 点击 "Execute" 执行

## ⚙️ 环境配置

### 端口配置
默认端口：3000
通过环境变量修改：
```bash
PORT=8080 pnpm run start:dev
```

### 下载目录
所有下载文件保存在项目根目录的 `downloads/` 文件夹

## ⚠️ 注意事项

1. **wget 依赖**: Node.js 下载功能需要系统安装 `wget` 工具
2. **网络要求**: 需要能够访问 https://nodejs.org
3. **磁盘空间**: 确保有足够的空间存储下载的压缩包

## 📝 开发规范

- 使用 ESLint + Prettier 进行代码检查和格式化
- TypeScript 严格模式 (`strictNullChecks: true`)
- 遵循模块化架构设计原则
- 统一的命名规范

## 🚀 部署

### 本地构建
```bash
pnpm run build
pnpm run start:prod
```

### 云平台部署
使用 [NestJS Mau](https://mau.nestjs.com) 部署到 AWS：
```bash
pnpm install -g @nestjs/mau
mau deploy
```

详细部署说明请查看 [官方部署文档](https://docs.nestjs.com/deployment)。

## 🤝 贡献

欢迎提交 Issue 和 Pull Request！

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

## 📞 支持

- 项目文档：查看 [USAGE.md](./USAGE.md)
- API 文档：访问 http://localhost:3000/api/docs
- NestJS 官方文档：https://docs.nestjs.com

---

<p align="center">
  Made with ❤️ using <a href="https://nestjs.com/" target="_blank">NestJS</a>
</p>
