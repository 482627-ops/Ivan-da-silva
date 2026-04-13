import React, { useRef, useState } from 'react';
import { 
  FileSpreadsheet, Users, User, Building, Search, CalendarDays, Camera, Target, X, Package, AlertTriangle, FileText 
} from 'lucide-react';
import { ServiceReport, Installer, Evidencias } from '../types';
import { MATERIALS_DB } from '../constants/materials';
import { formatToBRDate } from '../utils/formatters';

interface ExecutionFormProps {
  formData: ServiceReport;
  setFormData: React.Dispatch<React.SetStateAction<ServiceReport>>;
  installers: Installer[];
  submitting: boolean;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
  handleReChange: (e: React.ChangeEvent<HTMLInputElement>, isAuxiliar?: boolean) => void;
  handleCepBlur: () => Promise<void>;
  handleContratoBlur: () => void;
  calculateHPs: () => void;
  editingId: string | null;
  isSlaBlocked: boolean;
  slaDaysLeft: number | null;
  loadContractForEdit: (existing: ServiceReport) => void;
  techReports: ServiceReport[];
  setSelectedReport: (report: ServiceReport) => void;
}

export const ExecutionForm: React.FC<ExecutionFormProps> = ({
  formData, setFormData, installers, submitting, handleSubmit, handleReChange,
  handleCepBlur, handleContratoBlur, calculateHPs, editingId, isSlaBlocked,
  slaDaysLeft, loadContractForEdit, techReports, setSelectedReport
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [materialSearch, setMaterialSearch] = useState('');

  const handleCategorizedImageCapture = async (e: React.ChangeEvent<HTMLInputElement>, category: keyof Evidencias, napId: string | null = null) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const compressedPhotos = await Promise.all(files.map((file: File) => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const MAX_WIDTH = 600;
            const MAX_HEIGHT = 600;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > MAX_WIDTH) { height *= MAX_WIDTH / width; width = MAX_WIDTH; }
            } else {
              if (height > MAX_HEIGHT) { width *= MAX_HEIGHT / height; height = MAX_HEIGHT; }
            }

            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (ctx) {
              ctx.fillStyle = '#FFFFFF';
              ctx.fillRect(0, 0, width, height);
              ctx.drawImage(img, 0, 0, width, height);
              resolve(canvas.toDataURL('image/jpeg', 0.4));
            }
          };
        };
      });
    }));

    setFormData(prev => {
      const newEvidencias = { ...prev.evidencias };
      if (napId) {
        newEvidencias.naps = {
          ...newEvidencias.naps,
          [napId]: [...(newEvidencias.naps[napId] || []), ...compressedPhotos]
        };
      } else if (category !== 'naps') {
        newEvidencias[category] = [...(newEvidencias[category] as string[] || []), ...compressedPhotos];
      }
      return { ...prev, evidencias: newEvidencias };
    });
    e.target.value = '';
  };

  const removeCategorizedPhoto = (category: keyof Evidencias, napId: string | null, indexToRemove: number) => {
    setFormData(prev => {
      const newEvidencias = { ...prev.evidencias };
      if (napId) {
        newEvidencias.naps[napId] = newEvidencias.naps[napId].filter((_, i) => i !== indexToRemove);
      } else if (category !== 'naps') {
        newEvidencias[category] = (newEvidencias[category] as string[]).filter((_, i) => i !== indexToRemove);
      }
      return { ...prev, evidencias: newEvidencias };
    });
  };

  const renderCategoryUploader = (categoryKey: keyof Evidencias, title: string, napId: string | null = null) => {
     const photos = napId ? (formData.evidencias?.naps?.[napId] || []) : (formData.evidencias?.[categoryKey] as string[] || []);
     return (
       <div className="border border-slate-200 rounded-xl p-4 bg-white shadow-sm">
         <div className="flex justify-between items-center mb-3 border-b border-slate-100 pb-2">
            <h4 className="text-xs font-black text-[#002f6c] uppercase tracking-wide">{title}</h4>
            <span className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2 py-0.5 rounded">{photos.length} Fotos</span>
         </div>
         <div className="flex flex-wrap gap-3 mb-3">
            {photos.map((foto, idx) => (
              <div key={idx} className="relative w-20 h-20 group rounded-lg overflow-hidden border border-slate-200">
                <img src={foto} className="w-full h-full object-cover" alt="preview"/>
                <button type="button" onClick={() => removeCategorizedPhoto(categoryKey, napId, idx)} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-md">
                  <X size={12}/>
                </button>
              </div>
            ))}
            <label className="w-20 h-20 border-2 border-dashed border-blue-200 rounded-lg flex flex-col items-center justify-center text-blue-400 cursor-pointer hover:bg-blue-50 transition-colors">
              <Camera size={20} />
              <span className="text-[9px] font-bold mt-1">Adicionar</span>
              <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => handleCategorizedImageCapture(e, categoryKey, napId)} />
            </label>
         </div>
       </div>
     );
  };

  const checkCableLimit = () => {
    const postes = parseInt(formData.quantidadePostes) || 0;
    const caboUsado = parseInt(formData.materiaisUsados['60000449']) || 0;
    const limiteBase = postes * 30;
    const limiteTolerancia = limiteBase * 1.2; 
    return (postes > 0 && caboUsado > limiteTolerancia);
  };

  const requiresCableJustification = checkCableLimit();

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-blue-50/50 border-b border-slate-100 p-4 sm:p-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-blue-100 text-blue-600 p-2.5 rounded-xl"><FileSpreadsheet size={24} /></div>
          <div>
            <h2 className="text-xl font-black text-slate-800">Formulário de Execução & Asbuilt</h2>
            <p className="text-sm text-slate-500 font-medium mt-0.5">Preencha os dados e a requisição de material.</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row w-full sm:w-auto items-center gap-4">
           <div className="flex items-center gap-2 bg-blue-100 text-blue-800 font-bold px-4 py-2.5 rounded-xl text-sm whitespace-nowrap border border-blue-200 shadow-sm">
              <Users size={16} />
              <span>{installers.length} Técnicos na Base</span>
           </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-8">
        {/* SLA and Rejection Alerts */}
        {isSlaBlocked && (
          <div className="bg-rose-900 border-l-4 border-rose-500 p-4 md:p-6 rounded-r-xl shadow-lg animate-in fade-in slide-in-from-top-4 duration-500 text-white">
            <div className="flex items-center gap-4">
              <AlertTriangle className="text-rose-400 flex-shrink-0" size={36} />
              <div>
                <h3 className="font-black text-xl uppercase tracking-wide">Acesso Bloqueado</h3>
                <p className="text-sm mt-1 text-rose-200">O prazo limite de 10 dias para correção desta OS expirou. Por favor, contate o seu gestor.</p>
              </div>
            </div>
          </div>
        )}

        {editingId && formData.statusGestao === 'Reprovado' && !isSlaBlocked && (
          <div className="bg-rose-50 border-l-4 border-rose-600 p-4 md:p-6 rounded-r-xl shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
            <div className="flex items-start gap-4">
              <AlertTriangle className="text-rose-600 flex-shrink-0" size={32} />
              <div className="w-full">
                <div className="flex justify-between items-start">
                  <h3 className="font-black text-rose-800 text-lg uppercase tracking-wide">OS Reprovada - Efetuar Correção</h3>
                  <span className={`text-xs font-bold px-2 py-1 rounded border ${slaDaysLeft && slaDaysLeft <= 3 ? 'bg-rose-100 text-rose-800 border-rose-300' : 'bg-amber-100 text-amber-800 border-amber-300'}`}>
                    SLA: {slaDaysLeft} dia(s) restante(s)
                  </span>
                </div>
                <p className="text-sm text-rose-900 mt-2 bg-rose-100 p-3 rounded border border-rose-200">
                  <strong>Motivo da Reprovação:</strong> {formData.motivoReprovacao}
                </p>
              </div>
            </div>
          </div>
        )}

        <div className={`space-y-4 ${isSlaBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <User size={16} /> Identificação da Equipa
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">RE - Técnico</label><input type="text" placeholder="Ex: 6194" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none font-bold" value={formData.reInstalador} onChange={(e) => handleReChange(e, false)} /></div>
            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Login - Técnico</label><input type="text" placeholder="Ex: Z086632" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" value={formData.loginInstalador} onChange={(e) => setFormData({...formData, loginInstalador: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Nome - Técnico *</label><input type="text" required placeholder="Nome completo" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none font-bold text-[#002f6c]" value={formData.nomeInstalador} onChange={(e) => setFormData({...formData, nomeInstalador: e.target.value})} /></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">RE - Auxiliar (Opcional)</label><input type="text" placeholder="Ex: 8054" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" value={formData.reAuxiliar} onChange={(e) => handleReChange(e, true)} /></div>
            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Login - Auxiliar</label><input type="text" placeholder="Login Auxiliar" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" value={formData.loginAuxiliar} onChange={(e) => setFormData({...formData, loginAuxiliar: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-sm font-bold text-slate-700">Nome - Auxiliar</label><input type="text" placeholder="Nome completo" className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg outline-none" value={formData.nomeAuxiliar} onChange={(e) => setFormData({...formData, nomeAuxiliar: e.target.value})} /></div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><Building size={16} /> Dados e Estrutura MDU</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 pb-4">
            <div className="space-y-1"><label className="text-sm font-bold">Contrato</label><input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none" value={formData.contrato} onChange={(e) => setFormData({...formData, contrato: e.target.value})} onBlur={handleContratoBlur} /></div>
            <div className="space-y-1"><label className="text-sm font-bold text-[#002f6c]">OS Construção *</label><input type="text" required className="w-full p-2.5 border border-[#002f6c]/30 focus:border-[#002f6c] rounded-lg outline-none font-bold text-lg" value={formData.osConstrucao} onChange={(e) => setFormData({...formData, osConstrucao: e.target.value})} /></div>
            <div className="space-y-1"><label className="text-sm font-bold">Tipo de Projeto</label><select className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none font-bold text-blue-900" value={formData.tipoProjeto} onChange={(e) => setFormData({...formData, tipoProjeto: e.target.value})}><option value="ONGOING">ONGOING</option><option value="PROJETO F">PROJETO F</option><option value="SINERGIA">SINERGIA</option></select></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pb-4 border-b border-slate-100">
             <div className="space-y-1">
                <label className="text-sm font-bold text-blue-700">CEP da Obra</label>
                <div className="flex relative shadow-sm">
                  <input type="text" placeholder="Ex: 01001-000" className="w-full p-2.5 border border-blue-200 rounded-l-lg outline-none focus:ring-2 focus:ring-blue-500 font-bold" value={formData.cep} onChange={(e) => setFormData({...formData, cep: e.target.value})} onBlur={handleCepBlur} />
                  <button type="button" onClick={handleCepBlur} className="bg-blue-600 hover:bg-blue-700 text-white px-3 rounded-r-lg transition-colors flex items-center justify-center"><Search size={18}/></button>
                </div>
             </div>
             <div className="space-y-1 md:col-span-2">
               <label className="text-sm font-bold">Logradouro / Bairro</label>
               <input type="text" className="w-full p-2.5 border border-slate-300 rounded-lg outline-none shadow-sm" placeholder="Rua, Avenida, Bairro..." value={formData.endereco} onChange={(e) => setFormData({...formData, endereco: e.target.value})} />
             </div>
             <div className="space-y-1">
               <label className="text-sm font-bold">Número *</label>
               <input id="numeroEndereco" type="text" required className="w-full p-2.5 border border-slate-300 rounded-lg outline-none shadow-sm font-bold" placeholder="Ex: 123A" value={formData.numeroEndereco} onChange={(e) => setFormData({...formData, numeroEndereco: e.target.value})} />
             </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-1.5"><label className="text-xs font-black text-slate-500 uppercase">Blocos</label><input type="number" className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none font-bold text-lg" value={formData.totalBlocos} onChange={(e) => setFormData({...formData, totalBlocos: e.target.value})} onBlur={calculateHPs} /></div>
            <div className="space-y-1.5"><label className="text-xs font-black text-slate-500 uppercase">Andares</label><input type="number" className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none font-bold text-lg" value={formData.totalAndares} onChange={(e) => setFormData({...formData, totalAndares: e.target.value})} onBlur={calculateHPs} /></div>
            <div className="space-y-1.5"><label className="text-xs font-black text-slate-500 uppercase">Apt/Andar</label><input type="number" className="w-full p-2.5 bg-white border border-slate-300 rounded-lg outline-none font-bold text-lg" value={formData.aptPorAndar} onChange={(e) => setFormData({...formData, aptPorAndar: e.target.value})} onBlur={calculateHPs} /></div>
            <div className="space-y-1.5"><label className="text-xs font-black text-[#002f6c] uppercase">Total HPs</label><input type="number" className="w-full p-2.5 bg-blue-100 border border-blue-300 rounded-lg font-black text-2xl text-[#002f6c] outline-none" value={formData.totalHps} onChange={(e) => setFormData({...formData, totalHps: e.target.value})} /></div>
          </div>
        </div>

        {/* Status and Dates */}
        <div className="space-y-4 pt-4 border-t border-slate-200">
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2"><CalendarDays size={16} /> Status & Datas</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-2">
              <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Status da Construção</label><select className="w-full p-3 border border-slate-300 rounded-xl outline-none shadow-sm bg-white" value={formData.statusConstrucao} onChange={(e) => setFormData({...formData, statusConstrucao: e.target.value})}><option value="CONSTRUÍDO">CONSTRUÍDO</option><option value="INICIADO MAS NÃO FINALIZADO">INICIADO MAS NÃO FINALIZADO</option></select></div>
              <div className="space-y-1.5"><label className="text-sm font-bold text-slate-700">Ativação Operacional</label><select className="w-full p-3 border border-slate-300 rounded-xl outline-none font-bold shadow-sm bg-white" value={formData.ativacao} onChange={(e) => setFormData({...formData, ativacao: e.target.value})}><option value="SINAL ATIVADO">SINAL ATIVADO</option><option value="ABERTO SAR">ABERTO SAR</option><option value="INCIDENTE">INCIDENTE</option></select></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Data de Início</label>
                <input type="date" className="w-full p-3 border border-slate-300 rounded-xl outline-none shadow-sm bg-slate-50 text-slate-700 font-bold" value={formData.dataInicio} onChange={(e) => setFormData({...formData, dataInicio: e.target.value})} />
             </div>
             <div className="space-y-1.5">
                <label className="text-sm font-bold text-slate-700">Data de Conclusão</label>
                <input type="date" className="w-full p-3 border border-slate-300 rounded-xl outline-none shadow-sm bg-slate-50 text-slate-700 font-bold" value={formData.dataFim} onChange={(e) => setFormData({...formData, dataFim: e.target.value})} />
             </div>
          </div>
        </div>

        {/* Asbuilt Photography */}
        <div className="space-y-6 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 mb-2">
             <div className="bg-emerald-100 text-emerald-600 p-2.5 rounded-xl shadow-inner"><Camera size={22}/></div>
             <div>
               <h3 className="text-xl font-black text-slate-800">Asbuilt Fotográfico</h3>
               <p className="text-xs font-medium text-slate-500">Submeta as evidências separadas por categoria para a geração automática do Word.</p>
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {renderCategoryUploader('fachada', 'FOTO DA AMPLA FACHADA DO MDU')}
            {renderCategoryUploader('numeral', 'FOTO DO NUMERAL DO MDU')}
            {renderCategoryUploader('caixaMInt', 'CAIXA M (ORGANIZAÇÃO DAS FIBRAS NA BANDEJA)')}
            {renderCategoryUploader('caixaMExt', 'CAIXA M (CANUZA, PLAQUETA E NUMERAL DO DROP)')}
            {renderCategoryUploader('dio', 'DIO / DIO NAP (ETIQUETAS, ANEL AGS E SINAL)')}
          </div>

          <div className="mt-8 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
             <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 border-b border-amber-200 pb-2 gap-2">
               <h4 className="text-sm font-black text-amber-700 uppercase tracking-widest flex items-center gap-2"><Target size={16}/> Evidências de NAPs</h4>
               <div className="flex items-center gap-2">
                  <button type="button" onClick={() => setFormData({...formData, quantidadeNaps: String(Math.max(0, (parseInt(formData.quantidadeNaps)||0) - 1))})} className="px-3 py-1.5 bg-rose-100 text-rose-700 rounded-lg text-xs font-bold hover:bg-rose-200 transition-colors shadow-sm">- Remover NAP</button>
                  <button type="button" onClick={() => setFormData({...formData, quantidadeNaps: String((parseInt(formData.quantidadeNaps)||0) + 1)})} className="px-3 py-1.5 bg-[#002f6c] text-white rounded-lg text-xs font-bold hover:bg-[#001e45] transition-colors shadow-sm">+ Adicionar NAP</button>
               </div>
             </div>
             
             {parseInt(formData.quantidadeNaps) > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Array.from({ length: parseInt(formData.quantidadeNaps) }, (_, i) => (
                     <div key={`nap-container-${i}`}>
                       {renderCategoryUploader('naps', `FOTO NAP ${i+1} (ETIQUETA, ANEL AGS E SINAL)`, (i+1).toString())}
                     </div>
                  ))}
                </div>
             ) : (
                <p className="text-xs text-slate-500 italic text-center">Nenhuma NAP adicionada. Clique no botão acima caso existam NAPs na estrutura.</p>
             )}
          </div>
        </div>

        {/* Materials */}
        <div className={`space-y-4 pt-6 border-t border-slate-200 ${isSlaBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-xs font-black text-[#002f6c] uppercase tracking-widest border-b border-blue-100 pb-2 flex items-center gap-2">
            <Package size={18} /> Requisição de Materiais Utilizados (SAP)
          </h3>
          
          <div className="bg-white p-5 rounded-2xl border border-slate-200 mb-4 flex flex-col md:flex-row items-start md:items-center gap-5 shadow-sm">
            <div className="space-y-1.5 flex-1">
              <label className="text-xs font-bold text-slate-700 uppercase">Postes até o Assinante (Base de Cálculo)</label>
              <input 
                type="number" min="0" placeholder="Ex: 3"
                className="w-full p-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none font-bold text-lg text-slate-800 bg-slate-50"
                value={formData.quantidadePostes} onChange={(e) => setFormData({...formData, quantidadePostes: e.target.value})}
              />
            </div>
            <div className="flex-1 w-full bg-blue-50 p-4 rounded-xl border border-blue-100 flex items-center justify-between">
              <span className="text-xs font-bold text-blue-700 uppercase">Limite de Cabo<br/>(1 Poste = 30m)</span>
              <span className="text-2xl font-black text-[#002f6c]">{String((parseInt(formData.quantidadePostes) || 0) * 30)}m</span>
            </div>
          </div>

          {requiresCableJustification && (
            <div className="bg-rose-50 border border-rose-200 p-5 rounded-2xl shadow-sm mb-4 animate-in fade-in duration-300">
              <div className="flex items-start gap-3">
                <AlertTriangle className="text-rose-600 mt-1 flex-shrink-0" size={24} />
                <div className="w-full">
                  <h4 className="text-sm font-black text-rose-800 uppercase tracking-wide">Uso de Cabo acima do limite (+20%)</h4>
                  <p className="text-xs text-rose-600 mb-3 mt-1 font-medium">O lançamento no código <strong>60000449</strong> é superior à quantidade de postes. Justifique o motivo.</p>
                  <textarea 
                    required rows="2" placeholder="Justificativa obrigatória..."
                    className="w-full p-3 border border-rose-300 rounded-xl focus:ring-2 focus:ring-rose-500 outline-none resize-none text-sm font-medium shadow-inner bg-white"
                    value={formData.justificativaCabo} onChange={(e) => setFormData({...formData, justificativaCabo: e.target.value})}
                  ></textarea>
                </div>
              </div>
            </div>
          )}

          <div className="mb-3 relative">
            <Search size={18} className="absolute left-4 top-3.5 text-slate-400" />
            <input 
              type="text" placeholder="Buscar material por nome ou SAP..."
              className="w-full p-3 pl-12 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm bg-slate-50 shadow-sm font-medium"
              value={materialSearch} onChange={(e) => setMaterialSearch(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 bg-slate-100 p-4 rounded-2xl border border-slate-200 max-h-[400px] overflow-y-auto">
            {MATERIALS_DB.filter(m => m.name.toLowerCase().includes(materialSearch.toLowerCase()) || m.sap.includes(materialSearch)).map(mat => (
              <div key={`mat-${mat.sap}`} className={`flex items-center justify-between bg-white p-3 rounded-xl border shadow-sm transition-colors ${mat.sap === '60000449' ? 'border-blue-400 ring-1 ring-blue-100' : 'border-slate-200 hover:border-blue-300'}`}>
                <div className="text-xs font-bold text-slate-700 w-[75%] pr-2 leading-tight">
                  {mat.name} <br/>
                  <span className="text-[10px] text-[#002f6c] font-black tracking-widest">SAP: {mat.sap}</span>
                </div>
                <input 
                  type="number" min="0" placeholder="0"
                  className="w-[25%] p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-[#002f6c] outline-none text-center font-black text-lg text-[#002f6c] bg-slate-50"
                  value={formData.materiaisUsados[mat.sap] || ''}
                  onChange={(e) => setFormData({...formData, materiaisUsados: {...formData.materiaisUsados, [mat.sap]: e.target.value}})}
                />
              </div>
            ))}
          </div>
        </div>

        <div className={`space-y-4 pt-6 border-t border-slate-200 ${isSlaBlocked ? 'opacity-50 pointer-events-none' : ''}`}>
          <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-2 flex items-center gap-2">
            <FileText size={16} /> Observações Adicionais
          </h3>
          <div className="space-y-1">
            <textarea 
              rows="3" placeholder="Escreva aqui qualquer detalhe importante do serviço..."
              className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none shadow-sm bg-slate-50"
              value={formData.observacao} onChange={(e) => setFormData({...formData, observacao: e.target.value})}
            ></textarea>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-200">
          <button type="submit" disabled={submitting} className={`w-full py-5 rounded-2xl text-white font-black text-lg flex items-center justify-center gap-2 transition-all shadow-xl ${submitting ? 'bg-slate-400 cursor-not-allowed' : 'bg-[#002f6c] hover:bg-[#001e45] hover:-translate-y-1'}`}>
            {submitting ? 'A processar e a guardar base de dados...' : 'Submeter Relatório & Evidências'}
          </button>
        </div>
      </form>
    </div>
  );
};
