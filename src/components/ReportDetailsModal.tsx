import React from 'react';
import { 
  X, CheckSquare, Package, AlertTriangle, Camera, CheckCircle, FileText, Upload, Trash2 
} from 'lucide-react';
import { ServiceReport } from '../types';
import { formatToBRDate } from '../utils/formatters';
import { MATERIALS_DB } from '../constants/materials';

interface ReportDetailsModalProps {
  selectedReport: ServiceReport;
  setSelectedReport: (report: ServiceReport | null) => void;
  isAdmin: boolean;
  activeTab: string;
  renderTimelineElement: (report: ServiceReport) => React.ReactNode;
  generateWordDocument: (report: ServiceReport) => void;
  pdfInputRef: React.RefObject<HTMLInputElement | null>;
  handleAttachPDFToRecord: (e: React.ChangeEvent<HTMLInputElement>) => Promise<void>;
  handleDelete: (id: string) => Promise<void>;
  loadContractForEdit: (existing: ServiceReport) => void;
  setActiveTab: (tab: string) => void;
}

export const ReportDetailsModal: React.FC<ReportDetailsModalProps> = ({
  selectedReport, setSelectedReport, isAdmin, activeTab, renderTimelineElement,
  generateWordDocument, pdfInputRef, handleAttachPDFToRecord, handleDelete,
  loadContractForEdit, setActiveTab
}) => {
  return (
    <div className="fixed inset-0 bg-slate-900/60 z-[80] flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col animate-in zoom-in-95 duration-200">
        <div className="p-5 border-b border-slate-100 flex justify-between items-center sticky top-0 bg-white/95 backdrop-blur z-10">
          <div>
            <h3 className="font-black text-xl text-[#002f6c]">Detalhes do Contrato</h3>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">OS: {selectedReport.osConstrucao} | ID: {selectedReport.codigoUnico}</p>
          </div>
          <button onClick={() => setSelectedReport(null)} className="p-2.5 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors">
            <X size={20} className="text-slate-500" />
          </button>
        </div>
        
        <div className="p-6 space-y-6 flex-grow">
          {isAdmin && activeTab === 'database' && renderTimelineElement(selectedReport)}

          <div className="flex flex-wrap gap-4 items-center justify-between border-b border-slate-100 pb-6">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Técnico Responsável</p>
              <p className="text-2xl font-black text-[#002f6c]">{selectedReport.nomeInstalador || 'N/A'}</p>
              <p className="text-xs font-bold text-slate-400">R.E.: {selectedReport.reInstalador || 'N/A'} | Login: {selectedReport.loginInstalador || 'N/A'}</p>
              
              {selectedReport.nomeAuxiliar && (
                <div className="mt-3 pt-2 border-t border-slate-100">
                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Auxiliar</p>
                   <p className="text-sm font-bold text-slate-700">{selectedReport.nomeAuxiliar}</p>
                   <p className="text-[10px] font-bold text-slate-500">Login: {selectedReport.loginAuxiliar || 'N/A'}</p>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end gap-2">
              <span className={`px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest border shadow-sm ${selectedReport.ativacao === 'SINAL ATIVADO' ? 'bg-emerald-100 text-emerald-800 border-emerald-300' : selectedReport.statusConstrucao === 'INICIADO MAS NÃO FINALIZADO' ? 'bg-amber-100 text-amber-800 border-amber-300' : 'bg-blue-100 text-blue-800 border-blue-300'}`}>
                {selectedReport.statusConstrucao}
              </span>
              {selectedReport.statusGestao === 'Reprovado' && (
                 <span className="text-[10px] font-black bg-rose-100 text-rose-800 px-3 py-1 rounded-md border border-rose-300 uppercase shadow-sm">Status: Reprovado</span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 shadow-inner">
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Blocos</p>
              <p className="font-black text-xl text-slate-800">{String(selectedReport.totalBlocos || '-')}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Andares</p>
              <p className="font-black text-xl text-slate-800">{String(selectedReport.totalAndares || '-')}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">Apt/Andar</p>
              <p className="font-black text-xl text-slate-800">{String(selectedReport.aptPorAndar || '-')}</p>
            </div>
            <div>
              <p className="text-[10px] text-blue-600 font-black uppercase tracking-widest">Total HPs</p>
              <p className="font-black text-2xl text-blue-800">{String(selectedReport.totalHps || '-')}</p>
            </div>
          </div>

          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5">Endereço MDU</p>
            <p className="text-slate-800 font-medium bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">{selectedReport.cep ? `${selectedReport.cep} - ` : ''}{selectedReport.endereco || 'Não informado'}{selectedReport.numeroEndereco ? `, Nº ${selectedReport.numeroEndereco}` : ''}</p>
          </div>

          {isAdmin && activeTab === 'database' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-slate-100 pt-6">
                {selectedReport.materiaisUsados && Object.keys(selectedReport.materiaisUsados).some(k => parseInt(selectedReport.materiaisUsados[k]) > 0) && (
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Package size={14}/> Materiais Utilizados</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-sm h-full max-h-[220px] overflow-y-auto shadow-inner">
                      <ul className="space-y-2">
                        {Object.entries(selectedReport.materiaisUsados).map(([sap, qtd]) => {
                          if (!qtd || String(qtd) === "0") return null;
                          const matNome = MATERIALS_DB.find(m => m.sap === sap)?.name || 'Material Desconhecido';
                          return (
                            <li key={`mat-use-${sap}`} className="flex justify-between border-b border-slate-200 last:border-0 pb-2">
                              <span className="text-slate-700 font-bold text-xs">{matNome} <span className="text-[9px] text-slate-400 block tracking-widest mt-0.5">SAP: {sap}</span></span>
                              <strong className="text-[#002f6c] text-lg">{String(qtd)}</strong>
                            </li>
                          );
                        })}
                      </ul>
                    </div>
                  </div>
                )}
                
                <div className="space-y-4 md:col-span-2 mt-2">
                  {selectedReport.quantidadePostes && (
                    <div>
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1">Lançamento de Cabo</p>
                      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-sm flex justify-between items-center">
                        <span className="text-slate-600 font-bold uppercase tracking-wider text-xs">Qtd. Postes Calculados</span>
                        <strong className="text-slate-900 text-2xl font-black">{String(selectedReport.quantidadePostes)}</strong>
                      </div>
                    </div>
                  )}
                  {selectedReport.justificativaCabo && (
                    <div>
                      <p className="text-xs font-black text-rose-500 uppercase tracking-widest mb-1.5 flex items-center gap-1"><AlertTriangle size={14}/> Justificativa (Excesso Cabo)</p>
                      <div className="bg-rose-50 p-4 rounded-xl border border-rose-200 text-sm text-rose-800 font-medium">
                        {selectedReport.justificativaCabo}
                      </div>
                    </div>
                  )}
                  
                  {selectedReport.fotosBase64 && selectedReport.fotosBase64.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 flex items-center gap-1"><Camera size={14}/> Imagens Anexadas</p>
                      <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-xl flex items-center gap-3">
                        <CheckCircle size={20} className="text-emerald-500 flex-shrink-0" />
                        <span className="text-sm font-bold text-emerald-800">{selectedReport.fotosBase64.length} Fotos anexadas prontas para exportação.</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
          )}
        </div>
        
        <div className="p-5 border-t border-slate-200 bg-white flex justify-between items-center sticky bottom-0 z-10 rounded-b-2xl shadow-[0_-10px_20px_rgba(0,0,0,0.03)] flex-wrap gap-4">
          <div className="flex gap-2 sm:gap-3 flex-wrap">
             {isAdmin && activeTab === 'database' && (
               <>
                 <button onClick={() => generateWordDocument(selectedReport)} className="px-5 py-2.5 bg-[#002f6c] hover:bg-[#001e45] text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2"><FileText size={18} /> Exportar Word</button>
                 <button onClick={() => pdfInputRef.current?.click()} className="px-5 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 rounded-xl font-bold transition-all border border-emerald-200 flex items-center gap-2"><Upload size={18} /> Anexar PDF de Fotos</button>
                 <button onClick={() => { if (selectedReport.id) handleDelete(selectedReport.id); }} className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-xl font-bold transition-all border border-rose-200 flex items-center gap-2"><Trash2 size={18} /> Excluir</button>
                 <input type="file" accept="application/pdf" className="hidden" ref={pdfInputRef} onChange={handleAttachPDFToRecord} />
               </>
             )}

             {(!isAdmin || activeTab === 'form') && selectedReport.statusGestao === 'Reprovado' && (
                <button onClick={() => {
                    loadContractForEdit(selectedReport);
                    setSelectedReport(null);
                    setActiveTab('form');
                }} className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold transition-all shadow-md flex items-center gap-2">
                    <CheckSquare size={18} /> Editar / Corrigir
                </button>
             )}
          </div>
          <button onClick={() => setSelectedReport(null)} className="px-6 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl font-bold transition-colors">Fechar</button>
        </div>
      </div>
    </div>
  );
};
