我理解您需要添加对 HTTP 307 重定向状态码的处理。307 (Temporary Redirect) 与 301/302 类似,但要求客户端在重定向时保持原始的请求方法(POST/GET等)。让我更新 download.utils.ts:

```typescript
// 处理重定向 (301, 302, 307, 308)
if (
  response.statusCode === 301 ||
  response.statusCode === 302 ||
  response.statusCode === 307 ||
  response.statusCode === 308
) {
  const redirectUrl = response.headers.location;
  if (redirectUrl) {
    downloadFile(redirectUrl, dest).then(resolve).catch(reject);
  } else {
    reject(new Error('重定向响应缺少 location 头'));
  }
  return;
}
```

### 📋 HTTP 重定向状态码说明

| 状态码  | 名称               | 含义       | 特点                                  |
| ------- | ------------------ | ---------- | ------------------------------------- |
| **301** | Moved Permanently  | 永久重定向 | 浏览器会缓存,后续请求直接使用新 URL   |
| **302** | Found              | 临时重定向 | 传统重定向,可能改变请求方法(POST→GET) |
| **307** | Temporary Redirect | 临时重定向 | **保持原始请求方法**(POST 仍为 POST)  |
| **308** | Permanent Redirect | 永久重定向 | **保持原始请求方法**,且永久有效       |

### 💡 为什么需要支持 307/308?

1. **GitHub Releases 常用 307**:
   - GitHub 的 CDN 和文件分发系统经常使用 307 临时重定向
   - 例如从 `github.com` 重定向到实际的 S3 存储桶地址

2. **保持语义正确性**:
   - 307/308 明确要求客户端保持原始 HTTP 方法
   - 虽然 GET 请求不受影响,但遵循规范更可靠

3. **提高兼容性**:
   - 不同的服务器/CDN 可能选择不同的重定向策略
   - 全面支持各种重定向状态码,避免下载失败

### 🎯 实际应用场景

```typescript
// 场景: 下载 Gradle 时遇到 GitHub CDN 重定向
const gradleUrl =
  'https://github.com/gradle/gradle-distributions/releases/download/v9.4.1/gradle-9.4.1-bin.zip';

// 可能的重定向链:
// 1. github.com → 307 → github-releases.githubusercontent.com
// 2. github-releases.githubusercontent.com → 302 → s3.amazonaws.com
// 3. s3.amazonaws.com → 200 OK (开始下载)
```

# npm test -- app.controller.spec.ts

Remove-Item "c:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server\src\common\interfaces\file-manager.interface.ts" -ErrorAction SilentlyContinue

cd c:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server; pnpm run format
