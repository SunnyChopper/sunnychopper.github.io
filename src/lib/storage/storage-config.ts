import type { IStorageAdapter } from './storage-interface';
import { LocalStorageAdapter } from './local-storage-adapter';
import { APIStorageAdapter } from './api-storage-adapter';

export type StorageType = 'local' | 'api';

const STORAGE_TYPE_KEY = 'gs_storage_type';

export class StorageConfig {
  private static instance: StorageConfig;
  private currentAdapter: IStorageAdapter;
  private currentType: StorageType;

  private constructor() {
    const savedType = (localStorage.getItem(STORAGE_TYPE_KEY) as StorageType) || 'local';
    this.currentType = savedType;
    this.currentAdapter = this.createAdapter(savedType);
  }

  static getInstance(): StorageConfig {
    if (!StorageConfig.instance) {
      StorageConfig.instance = new StorageConfig();
    }
    return StorageConfig.instance;
  }

  private createAdapter(type: StorageType): IStorageAdapter {
    switch (type) {
      case 'local':
        return new LocalStorageAdapter();
      case 'api':
        return new APIStorageAdapter();
      default:
        return new LocalStorageAdapter();
    }
  }

  getAdapter(): IStorageAdapter {
    return this.currentAdapter;
  }

  getCurrentType(): StorageType {
    return this.currentType;
  }

  setStorageType(type: StorageType): void {
    if (type !== this.currentType) {
      this.currentType = type;
      this.currentAdapter = this.createAdapter(type);
      localStorage.setItem(STORAGE_TYPE_KEY, type);
      console.log(`Storage type changed to: ${type}`);
    }
  }
}

export const storageConfig = StorageConfig.getInstance();
export const getStorageAdapter = (): IStorageAdapter => storageConfig.getAdapter();
