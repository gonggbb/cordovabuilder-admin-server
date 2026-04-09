# 文件管理模块 (File Management Module)

## 📁 模块结构

本模块采用分层架构设计,将接口、抽象基类和具体实现分离,提高代码的可维护性和可扩展性。

```
file-management/
├── interfaces/              # 接口层 - 定义标准契约
│   └── IFileManager.ts     # 文件管理器接口
├── base/                   # 抽象基类层 - 提供通用实现
│   └── BaseFileManager.ts  # 基础文件管理器抽象类
├── impl/                   # 具体实现层 - 业务特定实现
│   └── DownloadDirManager.ts # 下载目录管理器
├── file-management.module.ts # NestJS 模块定义
└── index.ts                # 统一导出索引
```

## 🏗️ 分层设计

### 1. 接口层 (`interfaces/`)

- **IFileManager**: 定义文件管理的标准操作契约
- 职责: 声明 `exists`, `ensureDirectory`, `ensureFile`, `remove`, `getStats` 等方法
- 优势: 其他模块可以依赖此接口,而不依赖具体实现

### 2. 抽象基类层 (`base/`)

- **BaseFileManager**: 实现 IFileManager 接口的通用逻辑
- 职责: 提供文件检测、创建、删除等基础功能的默认实现
- 特点:
  - 包含完整的错误处理和日志记录
  - 提供受保护的辅助方法 (`isValidPath`, `normalizePath`)
  - 可被其他具体类继承扩展

### 3. 具体实现层 (`impl/`)

- **DownloadDirManager**: 针对下载目录的特定管理功能
- 职责:
  - 管理组件下载目录
  - 清理下载文件
  - 计算目录使用情况
- 特点: 继承 BaseFileManager,添加业务特定逻辑

## 💡 使用示例

### 在 Service 中注入使用

```typescript
import { Injectable } from '@nestjs/common';
import { DownloadDirManager } from '@features/file-management';

@Injectable()
export class NodeService {
  constructor(private fileManager: DownloadDirManager) {}

  async downloadNode(version: string) {
    // 获取 Node.js 的下载目录
    const downloadDir = this.fileManager.getComponentDownloadDir('node');

    // 检查目录是否存在
    if (this.fileManager.exists(downloadDir)) {
      // ...
    }
  }
}
```

### 创建新的文件管理器

```typescript
import { Injectable } from '@nestjs/common';
import { BaseFileManager } from '@features/file-management/base/BaseFileManager';
import { getLogger } from '@utils/logger.utils';

@Injectable()
export class InstallDirManager extends BaseFileManager {
  protected readonly logger = getLogger('InstallDirManager');
  private readonly installBaseDir: string;

  constructor() {
    super();
    this.installBaseDir = '/opt/installs';
    this.ensureDirectory(this.installBaseDir);
  }

  getComponentInstallDir(componentName: string): string {
    const installDir = path.join(this.installBaseDir, componentName);
    this.ensureDirectory(installDir);
    return installDir;
  }
}
```

## ✨ 设计优势

1. **关注点分离**: 接口、抽象实现、具体实现各司其职
2. **可扩展性**: 轻松创建新的文件管理器实现
3. **依赖倒置**: 高层模块依赖接口,不依赖具体实现
4. **代码复用**: 通用逻辑在 BaseFileManager 中统一实现
5. **易于测试**: 可以基于接口进行 Mock 测试

## 🔧 API 方法

### IFileManager 接口方法

| 方法              | 说明                            | 参数                                      | 返回值             |
| ----------------- | ------------------------------- | ----------------------------------------- | ------------------ |
| `exists`          | 检查文件或目录是否存在          | `targetPath: string`                      | `boolean`          |
| `ensureDirectory` | 确保目录存在,不存在则创建       | `dirPath: string, recursive?: boolean`    | `void`             |
| `ensureFile`      | 确保文件存在,不存在则创建空文件 | `filePath: string`                        | `void`             |
| `remove`          | 删除文件或目录                  | `targetPath: string, recursive?: boolean` | `void`             |
| `getStats`        | 获取文件或目录信息              | `targetPath: string`                      | `fs.Stats \| null` |

### DownloadDirManager 扩展方法

| 方法                      | 说明                 | 参数                    | 返回值                              |
| ------------------------- | -------------------- | ----------------------- | ----------------------------------- |
| `getComponentDownloadDir` | 获取组件下载目录     | `componentName: string` | `string`                            |
| `cleanComponentDownloads` | 清理组件下载文件     | `componentName: string` | `{ success, message }`              |
| `getDownloadDirUsage`     | 获取下载目录使用情况 | -                       | `{ success, sizeBytes?, message? }` |

## 📝 日志规范

所有方法遵循项目日志规范:

- **API 方法**: 日志前缀 `[API]`
- **辅助方法**: 日志前缀 `[Helper]`

示例:

```typescript
this.logger.log('[API] ensureDirectory - 创建目录: /path/to/dir');
this.logger.debug('[Helper] normalizePath - 规范化路径');
```
