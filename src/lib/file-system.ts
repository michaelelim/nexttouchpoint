/**
 * Gets the default backup directory path
 */
export const getBackupPath = (): string => {
  if (typeof window !== 'undefined' && window.navigator) {
    // In browser environment, we can only create the path string
    // But actual file creation will happen through Electron IPC
    const homePath = process.env.HOME || process.env.USERPROFILE || '';
    return `${homePath}/Desktop/touchpoint backups`;
  }
  
  return '/Desktop/touchpoint backups';
};

/**
 * Creates a timestamp-based filename for backups
 */
export const createBackupFilename = (): string => {
  const timestamp = new Date().toISOString()
    .replace(/:/g, '-')
    .split('.')[0];
  
  return `touchpoint_backup_${timestamp}.xlsx`;
};

// This interface definition helps TypeScript understand the electron API
declare global {
  interface Window {
    electron?: {
      sendMessage: (channel: string, data: any) => void;
      receive: (channel: string, func: (...args: any[]) => void) => void;
    }
  }
} 