
import { RATES } from '../constants';
import { DailyEntry, DeliveryType, OldDailyEntry, DetailedTotal } from '../types';

// Verifica se uma entrada está no formato antigo (legado)
const isOldEntry = (entry: any): entry is OldDailyEntry => {
  return typeof entry.isExpress === 'boolean';
};

// Migra uma entrada do formato antigo para o novo
export const migrateEntry = (entry: DailyEntry | OldDailyEntry): DailyEntry => {
  if (!entry || !isOldEntry(entry)) {
    // Se já for o novo formato ou for nulo, retorna como está
    // Garantindo que tenha a estrutura correta se for um objeto vazio
    const defaultStructure = {
        [DeliveryType.FLASH]: { normal: 0, express: 0 },
        [DeliveryType.INTERLOG]: { normal: 0, express: 0 },
        [DeliveryType.ECOMMERCE]: { normal: 0, express: 0 },
    };
    return { ...defaultStructure, ...(entry as DailyEntry) };
  }

  const newEntry: DailyEntry = {
    [DeliveryType.FLASH]: { normal: 0, express: 0 },
    [DeliveryType.INTERLOG]: { normal: 0, express: 0 },
    [DeliveryType.ECOMMERCE]: { normal: 0, express: 0 },
  };

  if (entry.isExpress) {
    newEntry.flash.express = entry.flash || 0;
    newEntry.interlog.express = entry.interlog || 0;
    newEntry.ecommerce.express = entry.ecommerce || 0;
  } else {
    newEntry.flash.normal = entry.flash || 0;
    newEntry.interlog.normal = entry.interlog || 0;
    newEntry.ecommerce.normal = entry.ecommerce || 0;
  }
  
  return newEntry;
};


// Calcula os ganhos e a contagem total para uma única entrada diária
export const calculateEntryTotal = (rawEntry: DailyEntry | OldDailyEntry | undefined) => {
    if (!rawEntry) {
        return { earnings: 0, count: 0 };
    }
    
    const entry = migrateEntry(rawEntry);
    
    const earnings = (entry.flash.normal * RATES.NORMAL.flash) +
                     (entry.flash.express * RATES.EXPRESS.flash) +
                     (entry.interlog.normal * RATES.NORMAL.interlog) +
                     (entry.interlog.express * RATES.EXPRESS.interlog) +
                     (entry.ecommerce.normal * RATES.NORMAL.ecommerce) +
                     (entry.ecommerce.express * RATES.EXPRESS.ecommerce);

    const count = entry.flash.normal + entry.flash.express +
                  entry.interlog.normal + entry.interlog.express +
                  entry.ecommerce.normal + entry.ecommerce.express;

    return { earnings, count };
};

// Nova função para calcular totais detalhados para um período
export const calculatePeriodTotals = (entries: (DailyEntry | OldDailyEntry)[]): DetailedTotal => {
  const totals: DetailedTotal = {
    normal: { count: 0, earnings: 0 },
    express: { count: 0, earnings: 0 },
    total: { count: 0, earnings: 0 },
  };

  for (const rawEntry of entries) {
    if (!rawEntry) continue;
    const entry = migrateEntry(rawEntry);

    // Flash
    totals.normal.count += entry.flash.normal;
    totals.normal.earnings += entry.flash.normal * RATES.NORMAL.flash;
    totals.express.count += entry.flash.express;
    totals.express.earnings += entry.flash.express * RATES.EXPRESS.flash;

    // Interlog
    totals.normal.count += entry.interlog.normal;
    totals.normal.earnings += entry.interlog.normal * RATES.NORMAL.interlog;
    totals.express.count += entry.interlog.express;
    totals.express.earnings += entry.interlog.express * RATES.EXPRESS.interlog;

    // Ecommerce
    totals.normal.count += entry.ecommerce.normal;
    totals.normal.earnings += entry.ecommerce.normal * RATES.NORMAL.ecommerce;
    totals.express.count += entry.ecommerce.express;
    totals.express.earnings += entry.ecommerce.express * RATES.EXPRESS.ecommerce;
  }

  totals.total.count = totals.normal.count + totals.express.count;
  totals.total.earnings = totals.normal.earnings + totals.express.earnings;

  return totals;
};