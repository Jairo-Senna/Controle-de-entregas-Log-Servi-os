
import React, { useMemo } from 'react';
import {
  ResponsiveContainer, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend
} from 'recharts';
import { AllData, DetailedTotal } from '../types';
import { getMonthKey, getQuinzena, getMonthName } from '../utils/dateUtils';
import { ICONS } from '../constants';
import { calculateEntryTotal, calculatePeriodTotals } from '../utils/calculationUtils';

interface SummaryProps {
  selectedDate: Date;
  allData: AllData;
  theme: 'light' | 'dark';
}

const Card: React.FC<{title: string, children: React.ReactNode, icon: React.ReactNode}> = ({ title, children, icon }) => (
    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold text-brand-primary flex items-center mb-4">{icon}{title}</h3>
        {children}
    </div>
);

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


const Charts: React.FC<{ selectedDate: Date; allData: AllData; theme: 'light' | 'dark' }> = ({ selectedDate, allData, theme }) => {
    const chartColors = {
        grid: theme === 'light' ? '#e2e8f0' : '#334155',
        text: theme === 'light' ? '#334155' : '#e2e8f0',
        barFill: '#FB923C', // Orange 400
        lineStroke: '#F97316', // Orange 500
        tooltipCursor: theme === 'light' ? 'rgba(251, 146, 60, 0.2)' : 'rgba(251, 146, 60, 0.2)',
    };

    const dailyChartData = useMemo(() => {
        const monthKey = getMonthKey(selectedDate);
        const monthData = allData[monthKey] || {};
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
            const monthData = allData[monthKey] || {};
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
        <div className="space-y-6">
            <div>
                <h4 className="text-md font-semibold text-slate-600 dark:text-slate-300 mb-2">Ganhos diários em {getMonthName(selectedDate)}</h4>
                 <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={dailyChartData} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />
                        <XAxis dataKey="day" stroke={chartColors.text} fontSize={12} />
                        <YAxis stroke={chartColors.text} fontSize={12} tickFormatter={(value) => `R$${value}`}/>
                        <Tooltip content={<CustomTooltip />} cursor={{fill: chartColors.tooltipCursor}} />
                        <Legend />
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
                         <Legend />
                         <Line type="monotone" dataKey="earnings" stroke={chartColors.lineStroke} strokeWidth={2} name="Ganhos" dot={{ r: 4 }} activeDot={{ r: 8 }}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>
        </div>
    );
};

const Breakdown: React.FC<{ data: DetailedTotal }> = ({ data }) => {
    const formatCurrency = (value: number) => value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

    return (
        <div className="space-y-3 text-sm">
            <div className="flex justify-between items-baseline">
                <span className="text-slate-500 dark:text-slate-400">Normais:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {data.normal.count} entregas ({formatCurrency(data.normal.earnings)})
                </span>
            </div>
             <div className="flex justify-between items-baseline">
                <span className="text-slate-500 dark:text-slate-400">Expressas:</span>
                 <span className="font-semibold text-slate-700 dark:text-slate-300">
                    {data.express.count} entregas ({formatCurrency(data.express.earnings)})
                </span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 mt-3 pt-3 flex justify-between items-baseline">
                 <span className="font-bold text-slate-800 dark:text-slate-200">Total:</span>
                 <div className="text-right">
                     <p className="text-xl font-bold text-accent">{formatCurrency(data.total.earnings)}</p>
                     <p className="text-xs text-slate-500 dark:text-slate-400">{data.total.count} entregas</p>
                 </div>
            </div>
        </div>
    );
};


const Summary: React.FC<SummaryProps> = ({ selectedDate, allData, theme }) => {
    
    const { daily, quinzena, monthly } = useMemo(() => {
        const monthKey = getMonthKey(selectedDate);
        const monthData = allData[monthKey] || {};
        const currentQuinzena = getQuinzena(selectedDate);

        // Daily
        const dailyEntry = monthData[selectedDate.getDate()];
        const dailyTotals = calculatePeriodTotals(dailyEntry ? [dailyEntry] : []);

        // Quinzena
        const quinzenaEntries = [];
        const startDay = currentQuinzena === 1 ? 1 : 16;
        const endDay = currentQuinzena === 1 ? 15 : 31;
        for (let i = startDay; i <= endDay; i++) {
            if (monthData[i]) {
                quinzenaEntries.push(monthData[i]);
            }
        }
        const quinzenaTotals = calculatePeriodTotals(quinzenaEntries);

        // Monthly
        const monthlyEntries = Object.values(monthData);
        const monthlyTotals = calculatePeriodTotals(monthlyEntries);
        
        return { daily: dailyTotals, quinzena: quinzenaTotals, monthly: monthlyTotals };
    }, [selectedDate, allData]);

    return (
        <div className="space-y-8">
            <Card title="Resumo do Dia" icon={ICONS.CALENDAR}>
                <Breakdown data={daily} />
            </Card>

            <Card title={`${getQuinzena(selectedDate)}ª Quinzena`} icon={ICONS.CALENDAR}>
                <Breakdown data={quinzena} />
            </Card>

            <Card title={`Total de ${getMonthName(selectedDate)}`} icon={ICONS.DOLLAR}>
                 <Breakdown data={monthly} />
            </Card>

            <Card title="Gráficos de Desempenho" icon={ICONS.CHART_BAR}>
                <Charts selectedDate={selectedDate} allData={allData} theme={theme} />
            </Card>
        </div>
    );
};

export default Summary;