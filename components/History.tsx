import React, { useMemo } from 'react';
import { AllData } from '../types';
import { ICONS } from '../constants';
import { calculateEntryTotal } from '../utils/calculationUtils';

interface HistoryProps {
  allData: AllData;
}

const calculateQuinzenaTotal = (monthData: AllData[string], quinzena: 1 | 2) => {
    let total = { earnings: 0, count: 0 };
    const startDay = quinzena === 1 ? 1 : 16;
    const endDay = quinzena === 1 ? 15 : 31;
    for (let i = startDay; i <= endDay; i++) {
        if (monthData[i]) {
            const dayTotal = calculateEntryTotal(monthData[i]);
            total.earnings += dayTotal.earnings;
            total.count += dayTotal.count;
        }
    }
    return total;
}

const History: React.FC<HistoryProps> = ({ allData }) => {
    const history = useMemo(() => {
        const completedQuinzenas: { id: string; earnings: number; count: number }[] = [];
        const today = new Date();
        const currentYear = today.getFullYear();
        const currentMonth = today.getMonth();
        const currentDay = today.getDate();

        const sortedMonthKeys = Object.keys(allData).sort().reverse();

        for (const monthKey of sortedMonthKeys) {
            const [year, month] = monthKey.split('-').map(Number);
            const monthData = allData[monthKey];

            // Check 1st Quinzena
            if (
                year < currentYear ||
                (year === currentYear && month - 1 < currentMonth) ||
                (year === currentYear && month - 1 === currentMonth && currentDay > 15)
            ) {
                const total = calculateQuinzenaTotal(monthData, 1);
                if (total.count > 0) {
                     completedQuinzenas.push({ id: `1ª Quinzena ${month}/${year}`, ...total });
                }
            }

            // Check 2nd Quinzena
            if (
                year < currentYear ||
                (year === currentYear && month - 1 < currentMonth)
            ) {
                 const total = calculateQuinzenaTotal(monthData, 2);
                 if (total.count > 0) {
                     completedQuinzenas.push({ id: `2ª Quinzena ${month}/${year}`, ...total });
                 }
            }
        }
        return completedQuinzenas;
    }, [allData]);

    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="flex-grow p-4 overflow-y-auto">
            <h2 className="text-xl font-bold text-brand-primary flex items-center mb-4">
                {ICONS.ARCHIVE} Histórico
            </h2>
            {history.length === 0 ? (
                <p className="text-slate-500 dark:text-slate-400 text-center mt-4">Nenhum histórico de quinzena fechada ainda.</p>
            ) : (
                <div className="space-y-3">
                    {history.map(({ id, earnings, count }) => (
                        <div key={id} className="bg-slate-200 dark:bg-slate-700 p-3 rounded-lg flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-sm text-slate-800 dark:text-slate-200">{id}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{count} entregas</p>
                            </div>
                            <p className="font-bold text-base text-accent">{formatCurrency(earnings)}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default History;