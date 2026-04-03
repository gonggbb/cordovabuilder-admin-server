# CordovaBuilder Admin API 文档

## 概述
本项目使用 Swagger (OpenAPI) 提供交互式 API 文档。

## 访问 API 文档

启动应用后，可以通过以下地址访问 API 文档：

### Swagger UI（交互式文档）
```
http://localhost:3000/api/docs
```

在 Swagger UI 中，您可以：
- 查看所有可用的 API 端点
- 查看每个接口的详细参数说明
- 直接在浏览器中测试 API 接口
- 查看请求和响应示例

### JSON 格式文档
```
http://localhost:3000/api-docs.json
```

### YAML 格式文档
```
http://localhost:3000/api-docs.yaml
```

## API 端点分类

### 1. Node 管理 (`/node`)
- `GET /node` - 获取 Node 管理信息
- `POST /node/download` - 下载指定版本的 Node.js

### 2. Java 管理 (`/java`)
- `GET /java` - 获取 Java 管理信息

### 3. Gradle 管理 (`/gradle`)
- `GET /gradle` - 获取 Gradle 管理信息

### 4. SDK 管理 (`/sdk`)
- `GET /sdk` - 获取 SDK 管理信息

## 快速开始

### 1. 启动应用
```bash
pnpm run start:dev
```

### 2. 打开浏览器访问
```
http://localhost:3000/api/docs
```

### 3. 测试接口
以 Node 下载接口为例：

**使用 Swagger UI:**
1. 展开 "Node 管理" 部分
2. 点击 `POST /node/download` 接口的 "Try it out" 按钮
3. 填写参数：
   - version: `v18.16.0`
   - platform: `linux` (可选)
   - arch: `x64` (可选)
4. 点击 "Execute" 执行请求
5. 查看响应结果

**使用 cURL:**
```bash
curl -X POST "http://localhost:3000/node/download?version=v18.16.0&platform=linux&arch=x64"
```

## Swagger 配置

Swagger 配置位于 `src/main.ts` 文件中：

```typescript
const config = new DocumentBuilder()
  .setTitle('CordovaBuilder Admin API')
  .setDescription('CordovaBuilder 项目管理后端服务器 API 文档')
  .setVersion('1.0')
  .addTag('node', 'Node.js 管理相关接口')
  .addTag('java', 'Java 管理相关接口')
  .addTag('gradle', 'Gradle 管理相关接口')
  .addTag('sdk', 'SDK 管理相关接口')
  .build();
```

## 添加新的 API 文档

为控制器添加 Swagger 注解的步骤：

### 1. 导入 Swagger 装饰器
```typescript
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
```

### 2. 为控制器添加标签
```typescript
@ApiTags('功能名称')
@Controller('endpoint')
export class FeatureController {}
```

### 3. 为方法添加操作说明
```typescript
@Get()
@ApiOperation({ summary: '接口功能描述' })
@ApiResponse({ status: 200, description: '成功响应说明' })
getData() {}
```

### 4. 为查询参数添加说明
```typescript
@Get()
@ApiQuery({ 
  name: 'paramName', 
  required: true, 
  description: '参数描述', 
  example: 'example-value' 
})
getData(@Query('paramName') param: string) {}
```

## 依赖项

- `@nestjs/swagger`: ^11.0.0

## 注意事项

1. **开发环境使用**: Swagger 文档默认在所有环境中启用，生产环境可根据需要禁用
2. **性能考虑**: Swagger 会扫描所有控制器和路由，大型项目可能影响启动时间
3. **安全性**: 生产环境建议添加认证保护 Swagger UI

## 自定义配置

如需在生产环境禁用 Swagger，可以修改 `src/main.ts`:

```typescript
if (process.env.NODE_ENV !== 'production') {
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);
}
```
