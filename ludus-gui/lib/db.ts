import Dexie, { type Table } from 'dexie';
import type { DatabaseNotification } from './types/notification';

export interface RangeLayout {
  id?: number;
  userId: string;
  rangeId: string;
  nodePositions: Array<{
    nodeId: string;
    x: number;
    y: number;
  }>;
  lastUpdated: number;
}

export class LudusDatabase extends Dexie {
  rangeLayouts!: Table<RangeLayout>;
  notifications!: Table<DatabaseNotification>;

  constructor() {
    super('LudusGUIDatabase');
    
    this.version(1).stores({
      rangeLayouts: '++id, userId, rangeId, [userId+rangeId]',
      notifications: '++id, userId, read, createdAt, [userId+read]'
    });
    
    // Version 2: Remove type field from notifications
    this.version(2).stores({
      rangeLayouts: '++id, userId, rangeId, [userId+rangeId]',
      notifications: '++id, userId, read, createdAt, [userId+read]'
    }).upgrade(tx => {
      // Migrate existing notifications by removing type field
      return tx.table('notifications').toCollection().modify(notification => {
        delete (notification as Record<string, unknown>).type;
        delete (notification as Record<string, unknown>).metadata;
      });
    });
  }
}

export const db = new LudusDatabase();