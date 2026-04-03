# 环境配置管理 - 快速参考 🚀

## 📌 常用命令速查

### 查看环境和切换

```bash
# 查看所有可用环境
node scripts/env-switcher.js list
pnpm env:list

# 查看当前环境状态
node scripts/env-switcher.js status
pnpm env:status

# 切换到开发环境（最常用）⭐
node scripts/env-switcher.js dev
pnpm env:dev

# 切换到测试环境
node scripts/env-switcher.js test
pnpm env:test

# 切换到生产环境
node scripts/env-switcher.js prod
pnpm env:prod
```

### 启动应用

```bash
# 开发模式（使用开发环境配置）
pnpm env:dev && pnpm run start:dev

# 测试模式
pnpm env:test && pnpm run test

# 生产构建和启动
pnpm env:prod && pnpm run build && pnpm run start:prod
```

## 🎯 典型工作流

### 日常开发
```bash
# 1. 切换到开发环境
pnpm env:dev

# 2. 启动开发服务器
pnpm run start:dev
```

### 运行测试
```bash
# 1. 切换到测试环境
pnpm env:test

# 2. 运行测试
pnpm run test:e2e
```

### 部署发布
```bash
# 1. 切换到生产环境
pnpm env:prod

# 2. 构建
pnpm run build

# 3. 启动生产服务
pnpm run start:prod
```

## 📁 文件位置

```
config/
├── .env                      # 当前使用的配置 ← 看这里
└── environments/
    ├── .env.development      # 开发环境配置
    ├── .env.test            # 测试环境配置
    └── .env.production      # 生产环境配置
```

## 🔍 查看配置内容

```bash
# Windows
type config\.env

# Linux/macOS
cat config/.env

# 查看前 10 个非注释配置
node -e "console.log(require('fs').readFileSync('config/.env','utf8').split('\n').filter(l=>!l.startsWith('#')&&l).slice(0,10).join('\n'))"
```

## 💡 提示

- ✅ 切换环境后需要**重启应用**才能生效
- ✅ 切换前会自动**备份**旧配置
- ✅ Windows 上软连接失败会**自动降级**为复制模式
- ✅ 所有脚本都支持**跨平台**使用

## ❓ 获取帮助

```bash
node scripts/env-switcher.js help
```
