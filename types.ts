
export enum DeliveryType {
  FLASH = 'flash',
  INTERLOG = 'interlog',
  ECOMMERCE = 'ecommerce',
}

export interface DeliveryCount {
  normal: number;
  express: number;
}

export interface DailyEntry {
  [DeliveryType.FLASH]: DeliveryCount;
  [DeliveryType.INTERLOG]: DeliveryCount;
  [DeliveryType.ECOMMERCE]: DeliveryCount;
}

// Para migração de dados legados
export interface OldDailyEntry {
  [DeliveryType.FLASH]: number;
  [DeliveryType.INTERLOG]: number;
  [DeliveryType.ECOMMERCE]: number;
  isExpress: boolean;
}

export interface MonthData {
  [day: number]: DailyEntry | OldDailyEntry;
}

export interface AllData {
  [monthKey: string]: MonthData;
}

export interface DetailedTotal {
  normal: {
    count: number;
    earnings: number;
  };
  express: {
    count: number;
    earnings: number;
  };
  total: {
    count: number;
    earnings: number;
  };
}

export interface ExpenseData {
  [quinzenaKey: string]: number;
}
