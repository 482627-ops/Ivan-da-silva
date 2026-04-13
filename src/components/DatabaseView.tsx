import React from 'react';
import { 
  Users, FileUp, Download, Search, X, MapPin, Trash2 
} from 'lucide-react';
import { ServiceReport } from '../types';
import { formatCurrency, formatToBRDate } from '../utils/formatters';

interface DatabaseViewProps {
  filteredReports: ServiceReport[];
  loading: boolean;
  dbSearch: string;
  setDbSearch: (val: string) => void;
  isAdmin: boolean;
  handleDelete: (id: string) => Promise<void>;
  setSelectedReport: (report: ServiceReport) => void;
  excelInputRef: React.RefObject<HTMLInputElement | null>;
  worksExcelRef: React.RefObject<HTMLInputElement | null>;
  handleImportExcel: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleImportWorksExcel: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleExportExcel: () => Promise<void>;
  submitting: boolean;
}

export const DatabaseView: React.FC<DatabaseViewProps> = ({
  filteredReports, loading, dbSearch, setDbSearch, isAdmin, handleDelete,
  setSelectedReport, excelInputRef, worksExcelRef, handleImportExcel,
  handleImportWorksExcel, handleExportExcel, submitting
}) => {
  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200">
        <div><h2 className="text-xl font-black text-[#002f6c] tracking-tight">Obras & Asbuilts</h2><p className="text-sm text-slate-500 font-medium mt-0.5">Gestão de {filteredReports.length} registos na nuvem.</p></div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
           <button onClick={() => excelInputRef.current?.click()} disabled={submitting} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"><Users size={18} /> Importar Técnicos</button>
           <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={excelInputRef} onChange={handleImportExcel} />
           
           <button onClick={() => worksExcelRef.current?.click()} className="bg-[#002f6c] hover:bg-[#001e45] text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"><FileUp size={18} /> Importar Obras</button>
           <input type="file" accept=".xlsx, .xls, .csv" className="hidden" ref={worksExcelRef} onChange={handleImportWorksExcel} />
           
           <button onClick={handleExportExcel} className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-colors flex items-center gap-2"><Download size={18} /> Exportar Base</button>
        </div>
      </div>

      <div className="flex bg-white p-3 rounded-2xl items-center gap-3 border border-slate-200 shadow-sm focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100 transition-all">
        <Search size={20} className="text-slate-400 ml-2" />
        <input 
          type="text" 
          placeholder="Buscar obras por R.E., Nome do Técnico, OS, Login ou ID Único..." 
          className="bg-transparent border-none outline-none w-full text-base p-1 font-medium text-slate-700 placeholder-slate-400"
          value={dbSearch}
          onChange={(e) => setDbSearch(e.target.value)}
        />
        {dbSearch && <button onClick={() => setDbSearch('')} className="bg-slate-100 p-1.5 rounded-full hover:bg-rose-100 hover:text-rose-600 transition-colors"><X size={16} /></button>}
      </div>

      {loading ? <div className="flex justify-center p-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div> : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReports.map((r, idx) => (
            <div key={r.id || idx} className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-lg transition-all flex flex-col h-full cursor-pointer" onClick={() => setSelectedReport(r)}>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded">ID: {r.codigoUnico} | {r.dataFim ? new Date(`${r.dataFim}T12:00:00Z`).toLocaleDateString('pt-PT') : new Date(r.timestamp).toLocaleDateString('pt-PT')}</span>
                {isAdmin && <button onClick={(e) => { e.stopPropagation(); if (r.id) handleDelete(r.id); }} className="text-rose-400 hover:text-rose-600 transition-colors bg-rose-50 p-1.5 rounded-lg"><Trash2 size={16}/></button>}
              </div>
              <h3 className="font-black text-[#002f6c] text-xl mb-1">{r.osConstrucao}</h3>
              <p className="text-xs text-slate-500 mb-2 flex items-center gap-1.5 truncate font-medium" title={`${r.cep ? r.cep + ' - ' : ''}${r.endereco}${r.numeroEndereco ? ', Nº ' + r.numeroEndereco : ''}`}>
                 <MapPin size={14} className="text-blue-500" /> {r.cep ? `${r.cep} | ` : ''}{r.endereco}{r.numeroEndereco ? `, Nº ${r.numeroEndereco}` : ''}
              </p>
              
              {(r.dataInicio || r.dataFim) && (
                 <p className="text-[10px] text-slate-400 font-bold mb-4 flex gap-3 uppercase tracking-wider bg-slate-50 px-2 py-1.5 rounded w-max">
                   {r.dataInicio && <span><span className="text-slate-300 font-normal">INÍCIO:</span> {formatToBRDate(r.dataInicio)}</span>}
                   {r.dataFim && <span><span className="text-slate-300 font-normal">FIM:</span> {formatToBRDate(r.dataFim)}</span>}
                 </p>
              )}
              
              <div className="mt-auto space-y-3 pt-4 border-t border-slate-100">
                <div className="flex items-center justify-between">
                   <div className="flex items-center gap-2">
                     <span className="bg-indigo-50 text-indigo-700 text-[10px] font-black px-2 py-1.5 rounded-lg border border-indigo-100">{r.totalBlocos || 1} Blc</span>
                     <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-1.5 rounded-lg border border-blue-100">{r.totalHps || 0} HPs</span>
                   </div>
                   {isAdmin && <span className="text-sm font-black text-emerald-600 drop-shadow-sm">{formatCurrency(r.valorPorHp || 0)}</span>}
                </div>
              </div>
            </div>
          ))}
          {filteredReports.length === 0 && (
             <div className="col-span-full py-12 text-center text-slate-500 bg-white rounded-2xl border border-slate-200 border-dashed">
                <Search size={40} className="mx-auto text-slate-300 mb-3" />
                <p className="font-medium">Nenhuma obra encontrada para esta pesquisa.</p>
             </div>
          )}
        </div>
      )}
    </div>
  );
};
