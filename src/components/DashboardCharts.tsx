import React from 'react';

interface DonutProps {
  concluidas: number;
  naoConcluidas: number;
  sars: number;
  incidentes: number;
}

export const DashboardDonut: React.FC<DonutProps> = ({ concluidas, naoConcluidas, sars, incidentes }) => {
  const total = (Number(concluidas) || 0) + (Number(naoConcluidas) || 0) + (Number(sars) || 0) + (Number(incidentes) || 0);
  if (total === 0) return <div className="h-48 flex items-center justify-center text-slate-400 text-sm">Sem Dados para o Mês Atual</div>;
  
  const pctConcluidas = (concluidas / total) * 100;
  const pctNaoConcluidas = (naoConcluidas / total) * 100;
  const pctSars = (sars / total) * 100;
  const pctIncidentes = (incidentes / total) * 100;
  
  const radius = 15.9155;
  let offsetConcluidas = 25;
  let offsetNaoConcluidas = 100 - pctConcluidas + 25;
  let offsetSars = 100 - pctConcluidas - pctNaoConcluidas + 25;
  let offsetIncidentes = 100 - pctConcluidas - pctNaoConcluidas - pctSars + 25;

  return (
    <div className="flex flex-col items-center">
      <div className="relative w-36 h-36 drop-shadow-md">
        <svg viewBox="0 0 40 40" className="w-full h-full transform -rotate-90">
          <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f1f5f9" strokeWidth="6" />
          {incidentes > 0 && <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f43f5e" strokeWidth="6" strokeDasharray={`${pctIncidentes} ${100 - pctIncidentes}`} strokeDashoffset={offsetIncidentes} className="transition-all duration-1000 ease-out" />}
          {sars > 0 && <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f97316" strokeWidth="6" strokeDasharray={`${pctSars} ${100 - pctSars}`} strokeDashoffset={offsetSars} className="transition-all duration-1000 ease-out" />}
          {naoConcluidas > 0 && <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#f59e0b" strokeWidth="6" strokeDasharray={`${pctNaoConcluidas} ${100 - pctNaoConcluidas}`} strokeDashoffset={offsetNaoConcluidas} className="transition-all duration-1000 ease-out" />}
          {concluidas > 0 && <circle cx="20" cy="20" r={radius} fill="transparent" stroke="#10b981" strokeWidth="6" strokeDasharray={`${pctConcluidas} ${100 - pctConcluidas}`} strokeDashoffset={offsetConcluidas} className="transition-all duration-1000 ease-out" />}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-2xl font-black text-slate-800">{total}</span>
          <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Total</span>
        </div>
      </div>
      
      <div className="mt-6 w-full space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm"></div> Concluídas</span>
          <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">{concluidas}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-sm"></div> Não Concluídas</span>
          <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded">{naoConcluidas}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm"></div> SAR</span>
          <span className="text-orange-700 bg-orange-100 px-2 py-0.5 rounded">{sars}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-bold text-slate-600 bg-slate-50 p-2 rounded-lg">
          <span className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-sm"></div> Incidentes</span>
          <span className="text-rose-700 bg-rose-100 px-2 py-0.5 rounded">{incidentes}</span>
        </div>
      </div>
    </div>
  );
};

interface TimelineProps {
  reportsArray: any[];
  daysInMonth: number;
}

export const DashboardTimeline: React.FC<TimelineProps> = ({ reportsArray, daysInMonth }) => {
  const dailyCounts = Array(daysInMonth).fill(0);
  reportsArray.forEach(r => {
    const dateToUse = r.dataFim ? new Date(`${r.dataFim}T12:00:00Z`) : new Date(r.timestamp || Date.now());
    if (dateToUse.getDate() <= daysInMonth) dailyCounts[dateToUse.getDate() - 1]++;
  });

  const maxCount = Math.max(...dailyCounts, 5); 
  const w = 400;
  const h = 120;
  
  const points = dailyCounts.map((count, index) => {
    const x = (index / (daysInMonth - 1)) * w;
    const y = h - (count / maxCount) * h;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <div className="w-full flex flex-col h-full justify-end relative mt-2">
      <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-32 overflow-visible drop-shadow-sm" preserveAspectRatio="none">
        <line x1="0" y1="0" x2={w} y2="0" stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1={h/2} x2={w} y2={h/2} stroke="#f1f5f9" strokeWidth="1" strokeDasharray="4 4" />
        <line x1="0" y1={h} x2={w} y2={h} stroke="#e2e8f0" strokeWidth="1" />
        
        <polygon points={areaPoints} fill="url(#gradientCurve)" />
        <polyline points={points} fill="none" stroke="#0ea5e9" strokeWidth="3" vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" />
        
        <defs>
          <linearGradient id="gradientCurve" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-bold px-1">
        <span>Dia 1</span>
        <span>Dia {Math.floor(daysInMonth/2)}</span>
        <span>Dia {daysInMonth}</span>
      </div>
    </div>
  );
};
