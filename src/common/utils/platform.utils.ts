/**
 * 平台类型枚举
 */
export enum PlatformType {
  LINUX = 'linux',
  WINDOWS = 'win',
  MACOS = 'darwin',
}

/**
 * 获取当前操作系统的标准化平台类型
 * @returns 标准化的平台类型字符串 ('linux' | 'win' | 'darwin')
 */
export function getPlatformType(): PlatformType {
  const platform = process.platform;

  switch (platform) {
    case 'linux':
      return PlatformType.LINUX;
    case 'win32':
      return PlatformType.WINDOWS;
    case 'darwin':
      return PlatformType.MACOS;
    default:
      throw new Error(`不支持的操作系统平台: ${platform}`);
  }
}

/**
 * 判断是否为 Linux 平台
 * @param platform - 可选的平台标识，如果不提供则检测当前平台
 * @returns 是否为 Linux 平台
 */
export function isLinux(platform?: string): boolean {
  const targetPlatform = platform || process.platform;
  return targetPlatform === 'linux';
}

/**
 * 判断是否为 Windows 平台
 * @param platform - 可选的平台标识，如果不提供则检测当前平台
 * @returns 是否为 Windows 平台
 */
export function isWindows(platform?: string): boolean {
  const targetPlatform = platform || process.platform;
  return targetPlatform === 'win32' || targetPlatform === 'win';
}

/**
 * 判断是否为 macOS 平台
 * @param platform - 可选的平台标识，如果不提供则检测当前平台
 * @returns 是否为 macOS 平台
 */
export function isMacOS(platform?: string): boolean {
  const targetPlatform = platform || process.platform;
  return targetPlatform === 'darwin';
}

/**
 * 根据平台类型获取对应的文件扩展名
 * @param platform - 平台类型
 * @returns 文件扩展名（不包含点号）
 */
export function getFileExtensionByPlatform(platform: string): string {
  if (isLinux(platform)) {
    return 'tar.xz';
  } else if (isWindows(platform)) {
    return 'zip';
  } else if (isMacOS(platform)) {
    return 'pkg';
  }
  throw new Error(`不支持的平台类型: ${platform}`);
}

/**
 * 将 Node.js 平台标识转换为通用平台名称
 * @param platform - Node.js 平台标识 (如 'linux', 'win32', 'darwin')
 * @returns 通用平台名称 (如 'linux', 'windows', 'mac')，如果不支持则返回 null
 */
export function getNormalizedPlatformName(platform: string): string | null {
  const platformMap: Record<string, string> = {
    linux: 'linux',
    win32: 'windows',
    win: 'windows',
    darwin: 'mac',
  };

  return platformMap[platform] || null;
}

/**
 * 将 Node.js 架构标识转换为通用架构名称
 * @param arch - Node.js 架构标识 (如 'x64', 'arm64', 'aarch64')
 * @returns 通用架构名称 (如 'x64', 'aarch64')，如果不支持则返回 null
 */
export function getNormalizedArchName(arch: string): string | null {
  const archMap: Record<string, string> = {
    x64: 'x64',
    x86_64: 'x64',
    amd64: 'x64',
    arm64: 'aarch64',
    aarch64: 'aarch64',
    arm: 'arm',
    armv7l: 'arm',
  };

  return archMap[arch] || null;
}

/**
 * 获取平台的 JDK/Java 下载标识
 * @param platform - 平台标识
 * @returns JDK 平台标识 (如 'linux', 'windows', 'macos')，如果不支持则返回 null
 */
export function getJdkPlatformIdentifier(platform: string): string | null {
  const jdkPlatformMap: Record<string, string> = {
    linux: 'linux',
    win32: 'windows',
    win: 'windows',
    darwin: 'macos',
  };

  return jdkPlatformMap[platform] || null;
}

/**
 * 获取平台的 Gradle/Node.js 下载标识
 * @param platform - 平台标识
 * @returns 下载平台标识 (如 'linux', 'win', 'darwin')，如果不支持则返回 null
 */
export function getDownloadPlatformIdentifier(platform: string): string | null {
  const downloadPlatformMap: Record<string, string> = {
    linux: 'linux',
    win32: 'win',
    win: 'win',
    darwin: 'darwin',
  };

  return downloadPlatformMap[platform] || null;
}
