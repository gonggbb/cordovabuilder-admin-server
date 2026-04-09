# 环境变量管理模块

## 概述

环境变量管理模块提供了动态切换不同版本 SDK、Gradle、Java 和 Node.js 配置的能力。通过该模块,您可以轻松管理和切换多个环境配置,特别适用于 Cordova 多版本开发场景。

## 功能特性

- ✅ 创建和管理多个环境配置
- ✅ 快速切换不同配置
- ✅ 查看当前激活的配置
- ✅ 删除不需要的配置
- ✅ **Cordova 预设配置模板** - 一键应用官方推荐的版本组合
- ✅ 默认配置保护机制

## 默认配置

系统预置的默认配置如下:

```json
{
  "sdk": "30.0.3",
  "gradle": "7.1.1",
  "java": "11",
  "node": "18.20.8"
}
```

## Cordova 预设配置

模块内置了基于 Cordova 官方推荐的依赖版本组合,包括:

### 🦞 Cordova 12 CA:11
- cordova-android: 11.0.x
- Build Tools: ^32.0.0
- Gradle: 7.4.2
- Java: 11
- Node.js: 18.20.8
- **预设名称**: `cordova-12-ca11`

### 🦞 Cordova 12 CA:12
- cordova-android: 12.0.x
- Build Tools: ^33.0.2
- Gradle: 7.6
- Java: 17.0.10
- Node.js: 18.20.8
- **预设名称**: `cordova-12-ca12`

### 🦞 Cordova 13 CA:13
- cordova-android: 13.0.x
- Build Tools: ^34.0.0
- Gradle: 8.7
- Java: 17.0.10
- Node.js: 20.19.5
- **预设名称**: `cordova-13-ca13`

### 🦞 Cordova 13 CA:14
- cordova-android: 14.0.x
- Build Tools: ^35.0.0
- Gradle: 8.13
- Java: 17.0.10
- Node.js: 20.19.5
- **预设名称**: `cordova-13-ca14`

### 🦞 Cordova 13 CA:15
- cordova-android: 15.0.x
- Build Tools: ^36.0.0
- Gradle: 8.14.2
- Java: 17.0.10
- Node.js: 20.19.5
- **预设名称**: `cordova-13-ca15`

## API 接口

### 基础配置管理

#### 1. 获取所有环境配置

**请求:**
```http
GET /env/profiles
```

**响应示例:**
```json
{
  "profiles": {
    "default": {
      "sdk": "30.0.3",
      "gradle": "7.1.1",
      "java": "11",
      "node": "18.20.8"
    },
    "development": {
      "sdk": "33.0.0",
      "gradle": "8.0",
      "java": "17",
      "node": "20.0.0"
    }
  },
  "currentProfile": "default"
}
```

#### 2. 获取当前激活的配置

**请求:**
```http
GET /env/current
```

**响应示例:**
```json
{
  "profileName": "default",
  "profile": {
    "sdk": "30.0.3",
    "gradle": "7.1.1",
    "java": "11",
    "node": "18.20.8"
  }
}
```

#### 3. 切换到指定配置

**请求:**
```http
POST /env/switch
Content-Type: application/json

{
  "profileName": "development"
}
```

**响应示例:**
```json
{
  "success": true,
  "message": "已成功切换到配置 \"development\"。注意:需要重启应用才能使新配置生效。",
  "previousProfile": "default",
  "currentProfile": "development"
}
```

#### 4. 保存新的环境配置

**请求:**
```http
POST /env/save
Content-Type: application/json

{
  "profileName": "production",
  "profile": {
    "sdk": "34.0.0",
    "gradle": "8.5",
    "java": "21",
    "node": "22.0.0"
  }
}
```

**说明:**
- `profile` 对象中的所有字段都是可选的
- 未提供的字段将使用默认值或现有值
- 如果配置已存在,则会更新该配置

**响应示例:**
```json
{
  "success": true,
  "message": "已成功保存配置 \"production\""
}
```

#### 5. 删除指定的环境配置

**请求:**
```http
DELETE /env/delete/:profileName
```

**示例:**
```http
DELETE /env/delete/old-config
```

**响应示例:**
```json
{
  "success": true,
  "message": "已成功删除配置 \"old-config\""
}
```

**注意事项:**
- ❌ 无法删除当前激活的配置
- ❌ 至少需要保留一个配置
- ⚠️ 删除操作不可恢复

#### 6. 获取默认配置

**请求:**
```http
GET /env/default
```

**响应示例:**
```json
{
  "sdk": "30.0.3",
  "gradle": "7.1.1",
  "java": "11",
  "node": "18.20.8"
}
```

### Cordova 预设配置 API

#### 7. 获取所有 Cordova 预设配置

**请求:**
```http
GET /env/cordova-presets
```

**响应示例:**
```json
[
  {
    "name": "cordova-12-ca11",
    "description": "Cordova 12 + cordova-android 11.0.x",
    "cordovaVersion": "12.x",
    "cordovaAndroid": "11.0.x",
    "buildTools": "^32.0.0",
    "profile": {
      "sdk": "32.0.0",
      "gradle": "7.4.2",
      "java": "11",
      "node": "18.20.8"
    }
  },
  {
    "name": "cordova-13-ca15",
    "description": "Cordova 13 + cordova-android 15.0.x",
    "cordovaVersion": "13.x",
    "cordovaAndroid": "15.0.x",
    "buildTools": "^36.0.0",
    "profile": {
      "sdk": "36.0.0",
      "gradle": "8.14.2",
      "java": "17.0.10",
      "node": "20.19.5"
    }
  }
]
```

#### 8. 获取指定的 Cordova 预设配置

**请求:**
```http
GET /env/cordova-presets/:presetName
```

**示例:**
```http
GET /env/cordova-presets/cordova-13-ca15
```

**响应示例:**
```json
{
  "name": "cordova-13-ca15",
  "description": "Cordova 13 + cordova-android 15.0.x",
  "cordovaVersion": "13.x",
  "cordovaAndroid": "15.0.x",
  "buildTools": "^36.0.0",
  "profile": {
    "sdk": "36.0.0",
    "gradle": "8.14.2",
    "java": "17.0.10",
    "node": "20.19.5"
  }
}
```

#### 9. 从 Cordova 预设创建配置

**请求:**
```http
POST /env/create-from-cordova
Content-Type: application/json

{
  "presetName": "cordova-13-ca15",
  "profileName": "my-project"
}
```

**说明:**
- `presetName`: 必填,预设名称(如 `cordova-13-ca15`)
- `profileName`: 可选,要保存的配置名称,如果不提供则使用预设名称

**响应示例:**
```json
{
  "success": true,
  "message": "已从预设 \"cordova-13-ca15\" 创建配置 \"my-project\"。已成功保存配置 \"my-project\"",
  "profile": {
    "sdk": "36.0.0",
    "gradle": "8.14.2",
    "java": "17.0.10",
    "node": "20.19.5"
  }
}
```

## 配置文件

环境配置存储在 `config/env-profiles.json` 文件中:

```json
{
  "profiles": {
    "default": {
      "sdk": "30.0.3",
      "gradle": "7.1.1",
      "java": "11",
      "node": "18.20.8"
    },
    "cordova-13-ca15": {
      "sdk": "36.0.0",
      "gradle": "8.14.2",
      "java": "17.0.10",
      "node": "20.19.5"
    }
  },
  "currentProfile": "default"
}
```

## 使用场景

### 场景 1: 快速设置 Cordova 项目环境

```bash
# 从 Cordova 13 CA:15 预设创建配置
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{
    "presetName": "cordova-13-ca15",
    "profileName": "my-cordova-app"
  }'

# 切换到该配置
curl -X POST http://localhost:3000/env/switch \
  -H "Content-Type: application/json" \
  -d '{"profileName": "my-cordova-app"}'

# 重启应用使配置生效
```

### 场景 2: 在多个 Cordova 版本间切换测试

```bash
# 创建 Cordova 12 CA:11 配置
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{"presetName": "cordova-12-ca11"}'

# 创建 Cordova 13 CA:15 配置
curl -X POST http://localhost:3000/env/create-from-cordova \
  -H "Content-Type: application/json" \
  -d '{"presetName": "cordova-13-ca15"}'

# 在两个配置之间快速切换进行测试
curl -X POST http://localhost:3000/env/switch \
  -H "Content-Type: application/json" \
  -d '{"profileName": "cordova-12-ca11"}'

# ... 测试完成后切换回来
curl -X POST http://localhost:3000/env/switch \
  -H "Content-Type: application/json" \
  -d '{"profileName": "cordova-13-ca15"}'
```

### 场景 3: 查看所有可用的 Cordova 预设

```bash
# 获取所有预设列表
curl http://localhost:3000/env/cordova-presets

# 查看特定预设详情
curl http://localhost:3000/env/cordova-presets/cordova-13-ca15
```

## 重要提示

⚠️ **配置切换后需要重启应用**

环境变量在应用启动时读取,因此切换配置后必须重启应用才能使新配置生效。

## 最佳实践

1. **使用预设配置**: 对于 Cordova 项目,优先使用内置的预设配置,确保版本兼容性
2. **命名规范**: 使用有意义的配置名称,如 `cordova-13-project-a`、`legacy-app`
3. **备份配置**: 定期备份 `config/env-profiles.json` 文件
4. **谨慎删除**: 删除配置前确认不会影响其他工作流程
5. **文档记录**: 记录每个配置的用途和适用场景

## 技术实现

- **存储方式**: JSON 文件 (`config/env-profiles.json`)
- **配置验证**: 自动验证配置完整性
- **错误处理**: 提供清晰的错误提示信息
- **日志记录**: 所有配置变更都会记录到应用日志
- **预设模板**: 基于 Cordova 官方推荐的依赖版本组合

## 常见问题

### Q: 为什么切换配置后没有生效?

A: 配置切换后需要重启应用才能生效。环境变量是在应用启动时加载的。

### Q: 可以删除所有配置吗?

A: 不可以。系统要求至少保留一个配置,以防止误操作导致无法使用。

### Q: 如何恢复到默认配置?

A: 有两种方式:
1. 切换到 `default` 配置: `POST /env/switch` with `{"profileName": "default"}`
2. 删除 `config/env-profiles.json` 文件,重启应用会自动创建默认配置

### Q: Cordova 预设配置可以修改吗?

A: 预设配置是只读的模板,不能直接修改。但您可以:
1. 从预设创建配置: `POST /env/create-from-cordova`
2. 然后修改该配置: `POST /env/save`

### Q: 如何查看某个 Cordova 版本需要的具体依赖?

A: 使用 `GET /env/cordova-presets/:presetName` 接口,返回的信息包含:
- Cordova 版本
- cordova-android 版本
- Build Tools 版本要求
- 完整的 SDK/Gradle/Java/Node.js 配置

### Q: 配置文件中可以添加自定义字段吗?

A: 当前版本仅支持 `sdk`、`gradle`、`java`、`node` 四个字段。如需扩展,可以修改 `EnvProfile` 接口定义。
