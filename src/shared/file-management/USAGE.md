# 文件管理模块使用指南

## 📦 在其他模块中使用

### 步骤 1: 导入 FileManagementModule

在需要使用文件管理功能的模块中,首先导入 `FileManagementModule`:

```typescript
// src/features/your-feature/your-feature.module.ts
import { Module } from '@nestjs/common';
import { FileManagementModule } from '@features/file-management';
import { YourService } from './your.service';

@Module({
  imports: [FileManagementModule], // ← 导入文件管理模块
  providers: [YourService],
})
export class YourFeatureModule {}
```

### 步骤 2: 在 Service 中注入 DownloadDirManager

通过构造函数注入 `DownloadDirManager`:

```typescript
// src/features/your-feature/your.service.ts
import { Injectable } from '@nestjs/common';
import { DownloadDirManager } from '@features/file-management';
import { getLogger } from '@utils/logger.utils';

@Injectable()
export class YourService {
  private readonly logger = getLogger('YourService');

  constructor(private readonly fileManager: DownloadDirManager) {}

  // 现在可以使用 fileManager 的所有方法了
}
```

## 💡 使用示例

### 示例 1: Node.js 管理模块

```typescript
import { Injectable } from '@nestjs/common';
import { DownloadDirManager } from '@features/file-management';
import { getLogger } from '@utils/logger.utils';
import * as path from 'path';

@Injectable()
export class NodeService {
  private readonly logger = getLogger('NodeService');
  private readonly downloadDir: string;

  constructor(private readonly fileManager: DownloadDirManager) {
    // 获取 Node.js 的专用下载目录
    this.downloadDir = this.fileManager.getComponentDownloadDir('node');
  }

  async downloadNode(version: string): Promise<void> {
    // 检查目录是否存在
    if (!this.fileManager.exists(this.downloadDir)) {
      this.logger.warn('[API] 下载目录不存在,将自动创建');
    }

    // 确保目录存在 (如果不存在会自动创建)
    this.fileManager.ensureDirectory(this.downloadDir);

    const filePath = path.join(this.downloadDir, `node-${version}.tar.xz`);

    // 检查文件是否已存在
    if (this.fileManager.exists(filePath)) {
      this.logger.log('[API] 文件已存在,跳过下载');
      return;
    }

    // ... 执行下载逻辑
  }

  async cleanOldVersions(): Promise<void> {
    // 清理旧的下载文件
    const result = this.fileManager.cleanComponentDownloads('node');
    this.logger.log(`[API] ${result.message}`);
  }

  getStorageUsage(): void {
    // 获取下载目录使用情况
    const usage = this.fileManager.getDownloadDirUsage();
    if (usage.success && usage.sizeBytes) {
      const sizeMB = (usage.sizeBytes / 1024 / 1024).toFixed(2);
      this.logger.log(`[API] Node.js 下载目录占用: ${sizeMB} MB`);
    }
  }
}
```

### 示例 2: Gradle 管理模块

```typescript
import { Injectable } from '@nestjs/common';
import { DownloadDirManager } from '@features/file-management';

@Injectable()
export class GradleService {
  private readonly gradleDownloadDir: string;

  constructor(private readonly fileManager: DownloadDirManager) {
    this.gradleDownloadDir = this.fileManager.getComponentDownloadDir('gradle');
  }

  async installGradle(version: string, archivePath: string): Promise<void> {
    // 确保安装目录存在
    const installDir = path.join('/opt', 'gradle', version);
    this.fileManager.ensureDirectory(installDir);

    // ... 执行安装逻辑
  }
}
```

### 示例 3: Android SDK 管理模块

```typescript
import { Injectable } from '@nestjs/common';
import { DownloadDirManager } from '@features/file-management';

@Injectable()
export class SdkService {
  constructor(private readonly fileManager: DownloadDirManager) {}

  async downloadSdkComponent(component: string): Promise<void> {
    const sdkDownloadDir =
      this.fileManager.getComponentDownloadDir('android-sdk');

    // 确保目录存在
    this.fileManager.ensureDirectory(sdkDownloadDir);

    // 获取目录信息
    const stats = this.fileManager.getStats(sdkDownloadDir);
    if (stats && stats.isDirectory()) {
      console.log('SDK 下载目录有效');
    }
  }
}
```

## 🔧 可用的 API 方法

### 基础文件操作 (来自 BaseFileManager)

```typescript
// 1. 检查文件或目录是否存在
const exists = this.fileManager.exists('/path/to/file');

// 2. 确保目录存在 (不存在则创建)
this.fileManager.ensureDirectory('/path/to/dir');
this.fileManager.ensureDirectory('/path/to/nested/dir', true); // 递归创建

// 3. 确保文件存在 (不存在则创建空文件)
this.fileManager.ensureFile('/path/to/file.txt');

// 4. 删除文件或目录
this.fileManager.remove('/path/to/file');
this.fileManager.remove('/path/to/dir', true); // 递归删除目录

// 5. 获取文件/目录信息
const stats = this.fileManager.getStats('/path/to/file');
if (stats) {
  console.log('文件大小:', stats.size);
  console.log('是否为目录:', stats.isDirectory());
}
```

### DownloadDirManager 扩展方法

```typescript
// 1. 获取组件的下载目录
const nodeDir = this.fileManager.getComponentDownloadDir('node');
const gradleDir = this.fileManager.getComponentDownloadDir('gradle');
const sdkDir = this.fileManager.getComponentDownloadDir('android-sdk');

// 2. 清理组件的下载文件
const result = this.fileManager.cleanComponentDownloads('node');
if (result.success) {
  console.log(result.message); // "已清理 node 的下载文件"
}

// 3. 获取下载目录使用情况
const usage = this.fileManager.getDownloadDirUsage();
if (usage.success && usage.sizeBytes) {
  const sizeMB = usage.sizeBytes / 1024 / 1024;
  console.log(`下载目录总大小: ${sizeMB.toFixed(2)} MB`);
}
```

## 🎯 最佳实践

### 1. 在构造函数中初始化目录路径

```typescript
@Injectable()
export class MyService {
  private readonly componentDir: string;

  constructor(private readonly fileManager: DownloadDirManager) {
    // 在构造函数中获取并缓存目录路径
    this.componentDir =
      this.fileManager.getComponentDownloadDir('my-component');
  }
}
```

### 2. 使用前检查目录/文件是否存在

```typescript
async downloadFile(url: string, fileName: string): Promise<void> {
  const filePath = path.join(this.componentDir, fileName);

  // 先检查文件是否已存在
  if (this.fileManager.exists(filePath)) {
    this.logger.log('[API] 文件已存在,跳过下载');
    return;
  }

  // 确保目录存在
  this.fileManager.ensureDirectory(this.componentDir);

  // 执行下载...
}
```

### 3. 错误处理

```typescript
async performFileOperation(): Promise<void> {
  try {
    this.fileManager.ensureDirectory(this.targetDir);
    // ... 其他操作
  } catch (error) {
    this.logger.error(
      '[API] 文件操作失败',
      error instanceof Error ? error.message : String(error)
    );
    throw error;
  }
}
```

### 4. 定期清理临时文件

```typescript
@Cron(CronExpression.EVERY_WEEK)
async cleanupDownloads(): Promise<void> {
  const result = this.fileManager.cleanComponentDownloads('node');
  this.logger.log(`[Helper] 定期清理: ${result.message}`);
}
```

## 📝 注意事项

1. **模块导入**: 确保在使用前已在模块的 `imports` 数组中添加 `FileManagementModule`
2. **依赖注入**: 通过构造函数注入,不要手动实例化
3. **目录自动创建**: `getComponentDownloadDir()` 和 `ensureDirectory()` 会自动创建不存在的目录
4. **线程安全**: 所有文件操作都是同步的,适合管理场景,不适合高并发场景
5. **日志规范**: 遵循 `[API]` 和 `[Helper]` 前缀规范

## 🔄 扩展示例: 创建自定义文件管理器

如果需要其他类型的文件管理,可以继承 `BaseFileManager`:

```typescript
// src/features/file-management/impl/InstallDirManager.ts
import { Injectable } from '@nestjs/common';
import { BaseFileManager } from '../base/BaseFileManager';
import { getLogger } from '@utils/logger.utils';
import { resolveFromRoot } from '@utils/path.utils';

@Injectable()
export class InstallDirManager extends BaseFileManager {
  protected readonly logger = getLogger('InstallDirManager');
  private readonly installBaseDir: string;

  constructor() {
    super();
    this.installBaseDir = resolveFromRoot(
      process.env.INSTALL_DIR || 'installs',
    );
    this.ensureDirectory(this.installBaseDir);
  }

  getComponentInstallDir(componentName: string): string {
    const installDir = path.join(this.installBaseDir, componentName);
    this.ensureDirectory(installDir);
    return installDir;
  }
}
```

然后在模块中注册:

```typescript
@Module({
  providers: [DownloadDirManager, InstallDirManager],
  exports: [DownloadDirManager, InstallDirManager],
})
export class FileManagementModule {}
```
