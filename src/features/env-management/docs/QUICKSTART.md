# 环境变量切换 - 快速开始指南

## 🚀 快速开始

### 1. 查看所有可用的 Cordova 预设配置

```bash
curl http://localhost:3000/env/cordova-presets
```

这将返回所有内置的 Cordova 版本组合配置。

### 2. 创建您的第一个 Cordova 项目配置

假设您要开发一个基于 **Cordova 13 + Android 15** 的项目:

```bash
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{
    "presetName": "cordova-13-ca15",
    "profileName": "my-first-app"
  }'
```

响应:
```json
{
  "success": true,
  "message": "已从预设 \"cordova-13-ca15\" 创建配置 \"my-first-app\"。已成功保存配置 \"my-first-app\"",
  "profile": {
    "sdk": "36.0.0",
    "gradle": "8.14.2",
    "java": "17.0.10",
    "node": "20.19.5"
  }
}
```

### 3. 切换到该配置

```bash
curl -X POST http://localhost:3000/env/switch \
  -H "Content-Type: application/json" \
  -d '{"profileName": "my-first-app"}'
```

响应:
```json
{
  "success": true,
  "message": "已成功切换到配置 \"my-first-app\"。注意:需要重启应用才能使新配置生效。",
  "previousProfile": "default",
  "currentProfile": "my-first-app"
}
```

### 4. ⚠️ 重启应用使配置生效

**重要**: 环境变量在应用启动时加载,因此必须重启应用:

```bash
# 停止当前运行的应用 (Ctrl+C)
# 然后重新启动
pnpm run start:dev
```

### 5. 验证当前配置

```bash
curl http://localhost:3000/env/current
```

您将看到当前激活的配置详情。

---

## 📋 常用操作速查

### 查看所有配置
```bash
curl http://localhost:3000/env/profiles
```

### 查看特定 Cordova 预设详情
```bash
curl http://localhost:3000/env/cordova-presets/cordova-13-ca15
```

### 在不同配置间快速切换
```bash
# 切换到 Cordova 12 环境
curl -X POST http://localhost:3000/env/switch \
  -H "Content-Type: application/json" \
  -d '{"profileName": "cordova-12-ca11"}'

# 重启应用后测试
# ...

# 切换回 Cordova 13 环境
curl -X POST http://localhost:3000/env/switch \
  -H "Content-Type: application/json" \
  -d '{"profileName": "cordova-13-ca15"}'

# 再次重启应用
```

### 删除不需要的配置
```bash
curl -X DELETE http://localhost:3000/env/delete/my-old-config
```

---

## 🦞 Cordova 预设配置列表

| 预设名称 | Cordova | cordova-android | Build Tools | Gradle | Java | Node.js |
|---------|---------|----------------|-------------|--------|------|---------|
| `cordova-12-ca11` | 12.x | 11.0.x | ^32.0.0 | 7.4.2 | 11 | 18.20.8 |
| `cordova-12-ca12` | 12.x | 12.0.x | ^33.0.2 | 7.6 | 17.0.10 | 18.20.8 |
| `cordova-13-ca13` | 13.x | 13.0.x | ^34.0.0 | 8.7 | 17.0.10 | 20.19.5 |
| `cordova-13-ca14` | 13.x | 14.0.x | ^35.0.0 | 8.13 | 17.0.10 | 20.19.5 |
| `cordova-13-ca15` | 13.x | 15.0.x | ^36.0.0 | 8.14.2 | 17.0.10 | 20.19.5 |

---

## 💡 实用技巧

### 技巧 1: 为不同项目创建独立配置

```bash
# 项目 A - 使用最新的 Cordova 13
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{"presetName": "cordova-13-ca15", "profileName": "project-a"}'

# 项目 B - 使用稳定的 Cordova 12
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{"presetName": "cordova-12-ca11", "profileName": "project-b"}'
```

### 技巧 2: 自定义配置(在预设基础上调整)

```bash
# 先从预设创建
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{"presetName": "cordova-13-ca15", "profileName": "custom-config"}'

# 然后修改特定字段(例如升级 Gradle 版本)
curl -X POST http://localhost:3000/env/save \
  -H "Content-Type: application/json" \
  -d '{
    "profileName": "custom-config",
    "profile": {
      "gradle": "8.15"
    }
  }'
```

### 技巧 3: 备份和恢复配置

```bash
# 备份: 复制配置文件
cp config/env-profiles.json config/env-profiles.backup.json

# 恢复: 覆盖配置文件
cp config/env-profiles.backup.json config/env-profiles.json

# 重启应用
```

---

## ❓ 常见问题

### Q: 我应该在什么时候切换配置?

A: 当您需要在不同的 Cordova 项目之间切换开发时。每个项目可能有不同的依赖版本要求。

### Q: 切换配置后我的下载文件会怎样?

A: 配置文件只影响环境变量,不会影响已下载的文件。您可以根据新配置下载相应版本的 SDK、Gradle 等。

### Q: 可以同时使用多个配置吗?

A: 同一时间只能激活一个配置。但您可以快速切换,只需重启应用即可。

### Q: 如何知道哪个配置适合我的项目?

A: 查看项目的 `package.json` 或 `config.xml`,找到 `cordova-android` 的版本号,然后选择对应的预设:
- cordova-android 11.x → `cordova-12-ca11`
- cordova-android 12.x → `cordova-12-ca12`
- cordova-android 13.x → `cordova-13-ca13`
- cordova-android 14.x → `cordova-13-ca14`
- cordova-android 15.x → `cordova-13-ca15`

---

## 🔗 相关资源

- [完整 API 文档](./README.md)
- [Cordova 官方文档](https://cordova.apache.org/)
- [cordova-android 发布说明](https://github.com/apache/cordova-android/releases)

---

**祝您开发愉快! 🎉**
