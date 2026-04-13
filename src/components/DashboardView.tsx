import React from 'react';
import { 
  Building, Layers, TrendingUp, DollarSign, Target, Activity, Package 
} from 'lucide-react';
import { ServiceReport } from '../types';
import { formatCurrency, parseNumber } from '../utils/formatters';
import { calculateMaterialValue } from '../constants/materials';
import { DashboardDonut, DashboardTimeline } from './DashboardCharts';

interface DashboardViewProps {
  reports: ServiceReport[];
  dashboardMonth: number;
  setDashboardMonth: (val: number) => void;
  dashboardYear: number;
  setDashboardYear: (val: number) => void;
  metaFaturamento: string;
  setMetaFaturamento: (val: string) => void;
  metaBlocos: string;
  setMetaBlocos: (val: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  reports, dashboardMonth, setDashboardMonth, dashboardYear, setDashboardYear,
  metaFaturamento, setMetaFaturamento, metaBlocos, setMetaBlocos
}) => {
  const daysInMonth = new Date(dashboardYear, dashboardMonth + 1, 0).getDate();
  
  const currentMonthReports = reports.filter(r => {
    const dateToUse = r.dataFim ? new Date(`${r.dataFim}T12:00:00Z`) : new Date(r.timestamp || Date.now());
    return dateToUse.getMonth() === dashboardMonth && dateToUse.getFullYear() === dashboardYear;
  });

  const totalOS = Number(currentMonthReports.length);
  const totalHps = currentMonthReports.reduce((acc, r) => acc + parseNumber(r.totalHps || r.estrutura?.totalHps), 0);
  const totalBlocos = currentMonthReports.reduce((acc, r) => acc + parseNumber(r.totalBlocos || r.estrutura?.blocos), 0);
  const faturamentoHps = currentMonthReports.reduce((acc, r) => acc + parseNumber(r.valorPorHp), 0);
  const custoMateriais = currentMonthReports.reduce((acc, r) => acc + calculateMaterialValue(r.materiaisUsados), 0);
  
  const concluidas = Number(currentMonthReports.filter(r => r.statusConstrucao === 'CONSTRUÍDO').length);
  const naoConcluidas = Number(currentMonthReports.filter(r => r.statusConstrucao === 'INICIADO MAS NÃO FINALIZADO').length);
  const sars = Number(currentMonthReports.filter(r => r.ativacao === 'ABERTO SAR').length);
  const incidentes = Number(currentMonthReports.filter(r => r.ativacao === 'INCIDENTE').length);

  const metaBlocosNum = parseNumber(metaBlocos) || 1;
  const metaFaturamentoNum = parseNumber(metaFaturamento) || 1;

  const progressoBlocos = Math.min((totalBlocos / metaBlocosNum) * 100, 100);
  const progressoFaturamento = Math.min((faturamentoHps / metaFaturamentoNum) * 100, 100);

  const monthsNames = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
       <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 border-b pb-4 border-slate-200">
          <div>
            <h2 className="text-2xl font-black text-[#002f6c] tracking-tight">Dashboard Executivo</h2>
            <p className="text-sm text-slate-500 mt-1">
              Acompanhamento financeiro em tempo real <strong className="text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-100">(Consolidado Geral)</strong>
            </p>
          </div>
          
          <div className="flex gap-2">
            <select 
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-bold shadow-sm"
              value={dashboardMonth}
              onChange={(e) => setDashboardMonth(Number(e.target.value))}
            >
              {monthsNames.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select 
              className="bg-white border border-slate-300 text-slate-700 text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block p-2 outline-none font-bold shadow-sm"
              value={dashboardYear}
              onChange={(e) => setDashboardYear(Number(e.target.value))}
            >
              {[2023, 2024, 2025, 2026, 2027].map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
       </div>
       
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Building size={14}/> Construções (Obras)</p>
               <h3 className="text-4xl font-black text-[#002f6c]">{totalOS}</h3>
             </div>
             <div className="mt-4">
               <span className="text-xs text-blue-700 bg-blue-50 font-bold px-3 py-1.5 rounded-lg border border-blue-100">{totalHps} HPs Lançados</span>
             </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col justify-between hover:shadow-lg transition-shadow">
             <div>
               <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1 flex items-center gap-1"><Package size={14}/> Custo de Materiais</p>
               <h3 className="text-3xl font-black text-rose-600">{formatCurrency(custoMateriais)}</h3>
             </div>
             <div className="mt-4">
               <span className="text-xs text-rose-700 bg-rose-50 font-bold px-3 py-1.5 rounded-lg border border-rose-100">Total no Período</span>
             </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-500 to-blue-700 p-6 rounded-2xl shadow-lg border border-indigo-400 relative overflow-hidden text-white flex flex-col justify-between">
             <Layers className="absolute -right-4 -bottom-4 w-32 h-32 opacity-10" />
             <div className="relative z-10">
               <div className="flex justify-between items-start">
                 <p className="text-xs font-bold text-indigo-100 uppercase tracking-widest mb-1 flex items-center gap-1"><Layers size={14}/> Blocos (MDU)</p>
                 <div className="flex items-center gap-1 bg-black/20 px-2 py-1 rounded-lg backdrop-blur-sm border border-white/10 hover:border-white/30 transition-colors">
                   <span className="text-[10px] font-bold text-indigo-200">META:</span>
                   <input type="text" className="w-16 bg-transparent text-white text-xs font-bold outline-none text-right placeholder-indigo-300" value={metaBlocos} onChange={(e) => setMetaBlocos(e.target.value)} />
                 </div>
               </div>
               <h3 className="text-4xl font-black mt-1">{totalBlocos}</h3>
             </div>
             <div className="mt-5 relative z-10">
               <div className="flex justify-between text-[10px] font-bold text-indigo-100 mb-1">
                 <span>Atingimento</span>
                 <span>{progressoBlocos.toFixed(1)}%</span>
               </div>
               <div className="w-full bg-black/20 rounded-full h-2 shadow-inner"><div className="bg-white h-2 rounded-full shadow-sm" style={{width: `${progressoBlocos}%`}}></div></div>
             </div>
          </div>

          <div className="bg-gradient-to-br from-emerald-500 to-green-700 p-6 rounded-2xl shadow-lg border border-emerald-400 relative overflow-hidden text-white flex flex-col justify-between lg:col-span-1">
             <TrendingUp className="absolute -right-4 -bottom-4 w-40 h-40 opacity-10" />
             <div className="relative z-10 flex flex-col justify-between items-start h-full">
               <div className="w-full flex justify-between items-start">
                 <div>
                   <p className="text-xs font-bold text-emerald-100 uppercase tracking-widest mb-1 flex items-center gap-1"><DollarSign size={14}/> Faturamento Bruto</p>
                   <h3 className="text-3xl sm:text-4xl font-black mt-1 tracking-tight drop-shadow-sm">{formatCurrency(faturamentoHps)}</h3>
                 </div>
               </div>
               
               <div className="flex items-center gap-2 mt-4 bg-black/20 w-full px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10 hover:border-white/30 transition-colors">
                 <Target size={14} className="text-emerald-200" />
                 <span className="text-xs font-bold text-emerald-200 whitespace-nowrap">META: R$</span>
                 <input type="text" className="w-full bg-transparent text-white text-sm font-black outline-none text-right placeholder-emerald-300" value={metaFaturamento} onChange={(e) => setMetaFaturamento(e.target.value)} />
               </div>

               <div className="mt-4 w-full relative z-10">
                 <div className="flex justify-between text-xs font-bold text-emerald-100 mb-1.5">
                   <span>Progresso</span>
                   <span className="bg-white text-emerald-700 px-2 py-0.5 rounded-md shadow-sm">{progressoFaturamento.toFixed(1)}% Atingido</span>
                 </div>
                 <div className="w-full bg-black/20 rounded-full h-2.5 shadow-inner"><div className="bg-white h-2.5 rounded-full shadow-sm" style={{width: `${progressoFaturamento}%`}}></div></div>
               </div>
             </div>
          </div>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
         <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 flex flex-col items-center">
            <h3 className="text-sm font-black text-slate-800 uppercase mb-4 w-full text-left tracking-wider">Status de Operações</h3>
            <DashboardDonut concluidas={concluidas} naoConcluidas={naoConcluidas} sars={sars} incidentes={incidentes} />
         </div>
         
         <div className="bg-white p-6 rounded-2xl shadow-md border border-slate-100 md:col-span-2 flex flex-col justify-between">
            <div className="flex justify-between items-start">
               <div>
                 <h3 className="text-sm font-black text-slate-800 uppercase tracking-wider">Volume Diário</h3>
                 <p className="text-xs text-slate-500 mb-4">Linha do tempo de execuções finalizadas no mês.</p>
               </div>
            </div>
            <DashboardTimeline reportsArray={currentMonthReports} daysInMonth={daysInMonth} />
         </div>
       </div>
    </div>
  );
};
