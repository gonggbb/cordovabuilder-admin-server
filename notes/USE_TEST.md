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

# PowerShell 版本的测试脚本。现在你可以这样执行:

## 执行方式

### 方法 1: 直接运行(推荐)

```powershell
.\scripts\test-env-api.ps1
```

### 方法 2: 如果提示执行策略限制

```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\scripts\test-env-api.ps1
```

### 方法 3: 绕过执行策略

```powershell
PowerShell -ExecutionPolicy Bypass -File .\scripts\test-env-api.ps1
```

## 测试环境 API

games@DESKTOP-EH2GAQ2  C:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server  master  curl.exe -X OPTIONS http://localhost:3001/env/profiles -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -v

- Host localhost:3001 was resolved.
- IPv6: ::1
- IPv4: 127.0.0.1
- Trying [::1]:3001...
- Established connection to localhost (::1 port 3001) from ::1 port 57385
- using HTTP/1.x
  > OPTIONS /env/profiles HTTP/1.1
  > Host: localhost:3001
  > User-Agent: curl/8.18.0
  > Accept: _/_
  > Origin: http://localhost:3000
  > Access-Control-Request-Method: GET
- Request completely sent off
  < HTTP/1.1 204 No Content
  < X-Powered-By: Express
  < Access-Control-Allow-Origin: http://localhost:3000
  < Vary: Origin, Access-Control-Request-Headers
  < Access-Control-Allow-Credentials: true
  < Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
  < Content-Length: 0
  < Date: Thu, 09 Apr 2026 05:16:36 GMT
  < Connection: keep-alive
  < Keep-Alive: timeout=5
  <
- Connection #0 to host localhost:3001 left intact

这是因为在 PowerShell 中,`curl` 是 `Invoke-WebRequest` 的别名,语法与 Linux 的 `curl` 不同。让我给你提供正确的 PowerShell 测试命令:

## 🔧 PowerShell 正确用法

### 方法 1: 使用 `Invoke-WebRequest` (推荐)

```powershell
$headers = @{
    "Origin" = "http://localhost:3000"
    "Access-Control-Request-Method" = "GET"
}

Invoke-WebRequest -Uri "http://localhost:3001/env/profiles" -Method OPTIONS -Headers $headers -Verbose
```

### 方法 2: 使用真正的 `curl.exe` (Windows 自带)

Windows 10+ 自带了真正的 curl,需要使用完整名称 `curl.exe`:

```powershell
curl.exe -X OPTIONS http://localhost:3001/env/profiles `
  -H "Origin: http://localhost:3000" `
  -H "Access-Control-Request-Method: GET" `
  -v
```

注意: PowerShell 中使用 **反引号 `` ` ``** 而不是反斜杠 `\` 来换行。

### 方法 3: 单行命令

```powershell
curl.exe -X OPTIONS http://localhost:3001/env/profiles -H "Origin: http://localhost:3000" -H "Access-Control-Request-Method: GET" -v
```

## 📋 预期输出

如果 CORS 配置正确,你应该看到类似这样的响应头:

```
< HTTP/1.1 204 No Content
< Access-Control-Allow-Origin: http://localhost:3000
< Access-Control-Allow-Credentials: true
< Access-Control-Allow-Methods: GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS
< Access-Control-Allow-Headers: Content-Type, Authorization
```

## 💡 快速验证脚本

创建一个简单的测试脚本 `test-cors.ps1`:

```toolCall::edit_file::call_470164b996e84648864201da::INIT

```

完成!现在你可以用以下方式测试 CORS:

## 🚀 执行测试

```powershell
# 运行测试脚本
.\scripts\test-cors.ps1
```

或者直接使用命令行:

```powershell
# 使用 curl.exe (真正的 curl)
curl.exe -X OPTIONS http://localhost:3001/env/profiles `
  -H "Origin: http://localhost:3000" `
  -H "Access-Control-Request-Method: GET" `
  -v

# 或使用 PowerShell 原生命令
$headers = @{ "Origin" = "http://localhost:3000"; "Access-Control-Request-Method" = "GET" }
Invoke-WebRequest -Uri "http://localhost:3001/env/profiles" -Method OPTIONS -Headers $headers
```

## 📝 关键区别总结

| 命令         | Linux/macOS                                                                                                  | Windows PowerShell                     |
| ------------ | ------------------------------------------------------------------------------------------------------------ | -------------------------------------- |
| **换行符**   | [\](file://c:\worksapce\cusworksapce\cordovabuilder-admin\cordovabuilder-admin-server\Dockerfile15) (反斜杠) | `` ` `` (反引号)                       |
| **curl**     | `curl`                                                                                                       | `curl.exe` (避免别名冲突)              |
| **Header**   | `-H "Key: Value"`                                                                                            | 相同,但需用反引号换行                  |
| **推荐方式** | 直接用 curl                                                                                                  | 使用 `Invoke-WebRequest` 或 `curl.exe` |
