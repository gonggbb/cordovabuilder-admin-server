// 接口层
export type { IFileManager } from './interfaces/IFileManager';

// 抽象基类层
export { BaseFileManager } from './base/BaseFileManager';

// 具体实现层
export { DownloadDirManager } from './impl/DownloadDirManager';

// 模块
export { FileManagementModule } from './file-management.module';
