
import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
// FIX: Imported MonthData to correctly type month-specific data.
import { AllData, MonthData } from '../types';
import { getMonthKey, getMonthName } from '../utils/dateUtils';
import { ICONS } from '../constants';
import { calculateEntryTotal } from '../utils/calculationUtils';

interface PerformanceChartsProps {
  selectedDate: Date;
  allData: AllData;
  theme: 'light' | 'dark';
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-200 dark:bg-slate-700 p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg">
        <p className="label text-slate-600 dark:text-slate-300">{`Dia ${label}`}</p>
        <p className="intro text-accent font-bold">{`Ganhos: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
      </div>
    );
  }
  return null;
};

const CustomMonthTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-200 dark:bg-slate-700 p-2 border border-slate-300 dark:border-slate-600 rounded-md shadow-lg">
        <p className="label text-slate-600 dark:text-slate-300">{`${label}`}</p>
        <p className="intro text-accent font-bold">{`Ganhos: ${payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`}</p>
      </div>
    );
  }
  return null;
};


const PerformanceCharts: React.FC<PerformanceChartsProps> = ({ selectedDate, allData, theme }) => {
    const chartColors = {
        grid: theme === 'light' ? '#e2e8f0' : '#334155',
        text: theme === 'light' ? '#334155' : '#e2e8f0',
        barFill: '#FB923C', // Orange 400
        lineStroke: '#F97316', // Orange 500
        tooltipCursor: theme === 'light' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.2)',
    };

    const dailyChartData = useMemo(() => {
        const monthKey = getMonthKey(selectedDate);
        // FIX: Cast monthData to MonthData to ensure correct type inference for its properties.
        const monthData = (allData[monthKey] || {}) as MonthData;
        const daysInMonth = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0).getDate();
        
        return Array.from({ length: daysInMonth }, (_, i) => {
            const day = i + 1;
            const entry = monthData[day];
            const { earnings } = calculateEntryTotal(entry);
            return { day, earnings };
        });
    }, [selectedDate, allData]);

    const monthlyChartData = useMemo(() => {
        const data = [];
        const date = new Date(selectedDate);
        date.setDate(1);

        for(let i=0; i < 12; i++) {
            const monthKey = getMonthKey(date);
            // FIX: Cast monthData to MonthData to ensure correct type inference for Object.values.
            const monthData = (allData[monthKey] || {}) as MonthData;
            let monthTotal = 0;
            Object.values(monthData).forEach(entry => {
                monthTotal += calculateEntryTotal(entry).earnings;
            });
            data.push({
                month: date.toLocaleString('pt-BR', { month: 'short', year: '2-digit' }),
                earnings: monthTotal
            });
            date.setMonth(date.getMonth() - 1);
        }
        return data.reverse();
    }, [selectedDate, allData]);

    return (
        <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-brand-primary flex items-center mb-4">{ICONS.CHART_BAR}Gráficos de Desempenho</h3>
            <div className="space-y-6">
                <div>
                    <h4 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-2">Ganhos diários em {getMonthName(selectedDate)}</h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                            <XAxis dataKey="day" stroke={chartColors.text} fontSize={12} />
                            <YAxis stroke={chartColors.text} fontSize={12} tickFormatter={(value) => `R$${value}`}/>
                            <Tooltip content={<CustomTooltip />} cursor={{fill: chartColors.tooltipCursor}} />
                            <Legend wrapperStyle={{ paddingTop: '10px' }} />
                            <Bar dataKey="earnings" fill={chartColors.barFill} name="Ganhos"/>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
                <div>
                     <h4 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-2">Ganhos Mensais (Últimos 12 meses)</h4>
                     <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={monthlyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                             <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                             <XAxis dataKey="month" stroke={chartColors.text} fontSize={12} />
                             <YAxis stroke={chartColors.text} fontSize={12} tickFormatter={(value) => `R$${value}`}/>
                             <Tooltip content={<CustomMonthTooltip />} />
                             <Legend wrapperStyle={{ paddingTop: '10px' }} />
                             <Line type="monotone" dataKey="earnings" stroke={chartColors.lineStroke} strokeWidth={2} name="Ganhos" dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default PerformanceCharts;