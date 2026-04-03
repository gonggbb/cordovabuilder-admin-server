# 🚀 快速启动指南

## 30 秒快速体验

### 步骤 1: 安装依赖 (如果还未安装)
```bash
pnpm install
```

### 步骤 2: 启动开发服务器
```bash
pnpm run start:dev
```

### 步骤 3: 打开 API 文档
在浏览器中访问：
```
http://localhost:3000/api/docs
```

## 🎉 完成！

现在你可以：
- ✅ 查看所有 API 接口文档
- ✅ 在浏览器中直接测试 API
- ✅ 查看请求和响应示例

## 💡 快速测试

### 测试 Node 下载接口

**使用 cURL:**
```bash
curl -X POST "http://localhost:3000/node/download?version=v18.16.0"
```

**使用 Swagger UI:**
1. 打开 http://localhost:3000/api/docs
2. 展开 "Node 管理" 部分
3. 点击 `POST /node/download` 的 "Try it out"
4. 输入 version: `v18.16.0`
5. 点击 "Execute"

## 📖 更多文档

- [完整使用指南](./USAGE.md)
- [API 文档说明](./API_DOCS.md)
- [实现总结](./IMPLEMENTATION_SUMMARY.md)

## ⚙️ 常用命令

```bash
# 开发模式（热重载）
pnpm run start:dev

# 生产模式
pnpm run build
pnpm run start:prod

# 代码格式化
pnpm run format

# 运行测试
pnpm run test
```

## 🔍 可用端点

| 端点 | 方法 | 描述 |
|------|------|------|
| `/api/docs` | GET | Swagger UI 交互式文档 |
| `/api-docs.json` | GET | OpenAPI JSON 格式文档 |
| `/api-docs.yaml` | GET | OpenAPI YAML 格式文档 |
| `/node` | GET | Node.js 管理信息 |
| `/node/download` | POST | 下载 Node.js |
| `/java` | GET | Java 管理信息 |
| `/gradle` | GET | Gradle 管理信息 |
| `/sdk` | GET | SDK 管理信息 |
