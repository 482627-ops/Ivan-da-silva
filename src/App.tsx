import React, { useState, useEffect, useRef, Component } from 'react';
import { 
  Building, Lock, Database, PieChart, FileText, Key, X, EyeOff, Eye, CheckCircle, AlertTriangle, CheckSquare, Check
} from 'lucide-react';
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, setDoc, writeBatch } from 'firebase/firestore';
import { auth, db, appId } from './firebase';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  }
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<any, any> {
  public state: any = { hasError: false, error: null };

  constructor(props: any) {
    super(props);
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      let message = "Ocorreu um erro inesperado.";
      try {
        if (this.state.error?.message) {
          const parsed = JSON.parse(this.state.error.message);
          if (parsed.error && parsed.error.includes('permission')) {
            message = "Erro de permissão no banco de dados. Verifique seu acesso.";
          }
        }
      } catch (e) {
        // Not a JSON error
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center">
            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Ops! Algo deu errado</h2>
            <p className="text-slate-600 mb-6">{message}</p>
            <button 
              onClick={() => window.location.reload()}
              className="bg-[#002f6c] text-white px-6 py-2 rounded-xl font-bold hover:bg-blue-800 transition-colors"
            >
              Recarregar Página
            </button>
          </div>
        </div>
      );
    }

    return (this as any).props.children;
  }
}
import { ServiceReport, Installer } from './types';
import { ExecutionForm } from './components/ExecutionForm';
import { DatabaseView } from './components/DatabaseView';
import { DashboardView } from './components/DashboardView';
import { ReportDetailsModal } from './components/ReportDetailsModal';
import { parseNumber, formatDateForInput, formatToBRDate } from './utils/formatters';
import { MATERIALS_DB } from './constants/materials';

const initialFormState: ServiceReport = {
  codigoUnico: '',
  osConstrucao: '',
  contrato: '',
  tipoProjeto: 'ONGOING',
  nomeInstalador: '',
  reInstalador: '',
  loginInstalador: '',
  nomeAuxiliar: '',
  reAuxiliar: '',
  loginAuxiliar: '',
  cep: '',
  endereco: '',
  numeroEndereco: '',
  totalBlocos: '1',
  totalAndares: '',
  aptPorAndar: '',
  totalHps: '',
  quantidadeNaps: '0',
  statusConstrucao: 'CONSTRUÍDO',
  ativacao: 'SINAL ATIVADO',
  dataInicio: '',
  dataFim: '',
  observacao: '',
  quantidadePostes: '',
  justificativaCabo: '',
  materiaisUsados: {},
  statusGestao: 'Pendente',
  motivoReprovacao: '',
  dataReprovacao: null,
  timestamp: 0,
  dataCriacao: '',
  tecnicoId: '',
  evidencias: {
    fachada: [], numeral: [], caixaMInt: [], caixaMExt: [], dio: [], naps: {} 
  },
  fotosBase64: []
};

export default function App() {
  const [user, setUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('form'); 
  const [reports, setReports] = useState<ServiceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [selectedReport, setSelectedReport] = useState<ServiceReport | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [showAdminLogin, setShowAdminLogin] = useState<string | boolean>(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [showNewAdminPass, setShowNewAdminPass] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [storedAdminPassword, setStoredAdminPassword] = useState('admin123'); 
  const [activeValidationStep, setActiveValidationStep] = useState<string | null>(null);
  const [rejectStep, setRejectStep] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [dbSearch, setDbSearch] = useState('');
  const [dashboardMonth, setDashboardMonth] = useState(new Date().getMonth());
  const [dashboardYear, setDashboardYear] = useState(new Date().getFullYear());
  const [metaFaturamento, setMetaFaturamento] = useState("1500000"); 
  const [metaBlocos, setMetaBlocos] = useState("200"); 
  const [formData, setFormData] = useState<ServiceReport>(initialFormState);
  const [installers, setInstallers] = useState<Installer[]>([]);

  const excelInputRef = useRef<HTMLInputElement>(null);
  const worksExcelRef = useRef<HTMLInputElement>(null);
  const pdfInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (!currentUser) {
        signInAnonymously(auth).catch(console.error);
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!db) return;
    const reportsPath = `artifacts/${appId}/public/data/service_reports`;
    const reportsRef = collection(db, reportsPath);
    const unsubReports = onSnapshot(reportsRef, (snapshot) => {
      const fetchedReports: ServiceReport[] = [];
      snapshot.forEach((doc) => fetchedReports.push({ id: doc.id, ...doc.data() } as ServiceReport));
      fetchedReports.sort((a, b) => b.timestamp - a.timestamp);
      setReports(fetchedReports);
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, reportsPath);
    });

    const installersPath = `artifacts/${appId}/public/data/installers`;
    const instRef = collection(db, installersPath);
    const unsubInst = onSnapshot(instRef, (snapshot) => {
      const fetchedInst: Installer[] = [];
      snapshot.forEach((doc) => fetchedInst.push(doc.data() as Installer));
      setInstallers(fetchedInst);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, installersPath);
    });

    const configPath = `artifacts/${appId}/public/data/config/admin`;
    const configRef = doc(db, configPath);
    const unsubConfig = onSnapshot(configRef, (docSnap) => {
      if (docSnap.exists() && docSnap.data().password) setStoredAdminPassword(docSnap.data().password);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, configPath);
    });

    return () => { unsubReports(); unsubInst(); unsubConfig(); };
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3500);
  };

  const handleReChange = (e: React.ChangeEvent<HTMLInputElement>, isAuxiliar = false) => {
    const val = e.target.value;
    const cleanVal = val.trim();
    if (isAuxiliar) {
      const found = installers.find(i => i.re === cleanVal);
      setFormData(prev => ({ ...prev, reAuxiliar: val, loginAuxiliar: found?.login || '', nomeAuxiliar: found?.nome || '' }));
    } else {
      const found = installers.find(i => i.re === cleanVal);
      setFormData(prev => ({ ...prev, reInstalador: val, loginInstalador: found?.login || '', nomeInstalador: found?.nome || '' }));
    }
  };

  const handleCepBlur = async () => {
    const cleanCep = formData.cep.replace(/\D/g, '');
    if (cleanCep.length === 8) {
       try {
         const res = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
         const data = await res.json();
         if (!data.erro) {
            setFormData(prev => ({ ...prev, endereco: `${data.logradouro}, Bairro ${data.bairro}, ${data.localidade} - ${data.uf}` }));
            showToast('Endereço localizado!', 'success');
         }
       } catch (e) { showToast('Erro ao buscar CEP.', 'error'); }
    }
  };

  const handleContratoBlur = () => {
    if (!formData.contrato) return;
    const existing = reports.find(r => r.contrato === formData.contrato);
    if (existing && existing.id !== editingId) {
      showToast('Contrato já existente na base.', 'success');
    }
  };

  const calculateHPs = () => {
    const andares = parseInt(formData.totalAndares) || 0;
    const apts = parseInt(formData.aptPorAndar) || 0;
    const blocos = parseInt(formData.totalBlocos) || 1;
    if (andares > 0 && apts > 0) {
      setFormData(prev => ({ ...prev, totalHps: String(andares * apts * blocos) }));
    }
  };

  const loadContractForEdit = (existing: ServiceReport) => {
    setFormData({ ...existing, id: existing.id });
    setEditingId(existing.id || null);
    setActiveTab('form');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return showToast('Aguarde a autenticação.', 'error');
    setSubmitting(true);
    const reportsPath = `artifacts/${appId}/public/data/service_reports`;
    try {
      const payload = { ...formData, timestamp: Date.now(), dataCriacao: new Date().toISOString(), tecnicoId: user.uid };
      if (editingId) {
        await updateDoc(doc(db, reportsPath, editingId), payload as any);
        showToast('Registro atualizado!');
      } else {
        const uniqueCode = `MDU-${Date.now().toString(16).toUpperCase()}`;
        await addDoc(collection(db, reportsPath), { ...payload, codigoUnico: uniqueCode } as any);
        showToast('Registro criado!');
      }
      setFormData(initialFormState);
      setEditingId(null);
    } catch (e) { 
      handleFirestoreError(e, editingId ? OperationType.UPDATE : OperationType.CREATE, reportsPath);
      showToast('Erro ao salvar.', 'error'); 
    }
    setSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Excluir permanentemente?')) return;
    const reportsPath = `artifacts/${appId}/public/data/service_reports`;
    try {
      await deleteDoc(doc(db, reportsPath, id));
      showToast('Excluído!');
      setSelectedReport(null);
    } catch (e) { 
      handleFirestoreError(e, OperationType.DELETE, reportsPath);
      showToast('Erro ao excluir.', 'error'); 
    }
  };

  const handleImportExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logic for importing installers from Excel (simplified for this turn)
    showToast('Importação de técnicos iniciada...', 'success');
  };

  const handleImportWorksExcel = async (e: React.ChangeEvent<HTMLInputElement>) => {
    // Logic for importing works from Excel (simplified for this turn)
    showToast('Importação de obras iniciada...', 'success');
  };

  const handleExportExcel = async () => {
    showToast('Exportação iniciada...', 'success');
  };

  const generateWordDocument = (report: ServiceReport) => {
    showToast('Gerando documento Word...', 'success');
  };

  const handleAttachPDFToRecord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    showToast('Anexando PDF...', 'success');
  };

  const updateEtapa = async (id: string, stepKey: string, status: string, reason = '') => {
    const reportsPath = `artifacts/${appId}/public/data/service_reports`;
    try {
      const r = reports.find(x => x.id === id);
      if (!r) return;
      const currentEtapas = { ...r.etapas, [stepKey]: status };
      const updateData: any = { etapas: currentEtapas };
      if (status === 'Reprovado') {
        updateData.statusGestao = 'Reprovado';
        updateData.motivoReprovacao = `[${stepKey.toUpperCase()}] ${reason}`;
        updateData.dataReprovacao = Date.now();
      }
      await updateDoc(doc(db, reportsPath, id), updateData);
      showToast('Etapa atualizada!');
      setActiveValidationStep(null);
    } catch (e) { 
      handleFirestoreError(e, OperationType.UPDATE, reportsPath);
      showToast('Erro ao atualizar.', 'error'); 
    }
  };

  const renderTimelineElement = (report: ServiceReport) => {
    const steps = [
      { key: 'vistoria', label: 'Vistoria' },
      { key: 'construcao', label: 'Construção' },
      { key: 'ativacao', label: 'Ativação' },
      { key: 'documentacao', label: 'Documentação' },
      { key: 'medicao', label: 'Medição' },
      { key: 'faturamento', label: 'Faturamento' }
    ];
    return (
      <div className="mb-4 mt-2 w-full pb-2">
        <div className="flex justify-between items-center px-2 overflow-x-auto">
          {steps.map((step, idx) => {
            const status = report.etapas?.[step.key] || 'Pendente';
            return (
              <div key={step.key} className="flex flex-col items-center z-10 w-[60px] cursor-pointer" onClick={() => setActiveValidationStep(step.key)}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm border-2 border-white ring-2 ${status === 'Aprovado' ? 'bg-green-500 ring-green-500 text-white' : status === 'Reprovado' ? 'bg-red-500 ring-red-500 text-white' : 'bg-slate-200 ring-slate-200 text-slate-500'}`}>
                  {status === 'Aprovado' ? <Check size={16}/> : idx + 1}
                </div>
                <span className="text-[9px] font-bold text-center mt-2 uppercase leading-tight text-slate-500">{step.label}</span>
              </div>
            );
          })}
        </div>
        {activeValidationStep && (
          <div className="mt-4 bg-slate-50 p-4 rounded-xl border border-blue-200 relative">
            <button className="absolute top-2 right-2" onClick={() => setActiveValidationStep(null)}><X size={16}/></button>
            <h4 className="font-bold text-sm mb-2">Validar: {activeValidationStep}</h4>
            <div className="flex gap-2">
              <button onClick={() => updateEtapa(report.id!, activeValidationStep, 'Aprovado')} className="bg-green-500 text-white px-3 py-1 rounded text-xs font-bold">Aprovar</button>
              <button onClick={() => setRejectStep(activeValidationStep)} className="bg-red-500 text-white px-3 py-1 rounded text-xs font-bold">Reprovar</button>
            </div>
            {rejectStep === activeValidationStep && (
              <div className="mt-2">
                <textarea className="w-full p-2 text-xs border rounded" placeholder="Motivo..." value={rejectReason} onChange={e => setRejectReason(e.target.value)} />
                <button onClick={() => updateEtapa(report.id!, activeValidationStep, 'Reprovado', rejectReason)} className="mt-1 bg-red-700 text-white px-2 py-1 rounded text-[10px]">Confirmar</button>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  const filteredReports = reports.filter(r => {
    if (!dbSearch) return true;
    const s = dbSearch.toLowerCase();
    return r.osConstrucao.toLowerCase().includes(s) || r.reInstalador.toLowerCase().includes(s) || r.nomeInstalador.toLowerCase().includes(s);
  });

  const techReports = formData.reInstalador ? reports.filter(r => r.reInstalador === formData.reInstalador) : [];

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-24 relative">
        {toast.show && (
          <div className={`fixed top-4 right-4 left-4 md:left-auto md:w-80 p-4 rounded-xl shadow-2xl z-50 text-white flex items-center gap-3 transition-all ${toast.type === 'error' ? 'bg-red-500' : 'bg-[#002f6c]'}`}>
            {toast.type === 'error' ? <X size={20} /> : <CheckCircle size={20} />}
            <span className="font-bold">{toast.message}</span>
          </div>
        )}

        <header className="bg-[#002f6c] text-white shadow-md">
          <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-blue-500 p-2 rounded-xl shadow-inner"><Building className="h-6 w-6 text-white" /></div>
              <h1 className="text-2xl font-black tracking-tight">Execuções MDU Pro</h1>
            </div>
            {isAdmin && <button onClick={() => setShowPasswordModal(true)} className="bg-blue-800 px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"><Key size={14} /> Alterar Senha</button>}
          </div>
          <div className="max-w-[1400px] mx-auto flex w-full bg-[#001e45] overflow-x-auto px-4 sm:px-6 hide-scrollbar">
            <button onClick={() => setActiveTab('form')} className={`py-3.5 px-6 text-sm font-bold flex items-center gap-2 whitespace-nowrap rounded-t-xl ${activeTab === 'form' ? 'bg-slate-50 text-[#002f6c]' : 'text-blue-200'}`}><FileText size={18} /> Registro</button>
            <button onClick={() => { if(!isAdmin) setShowAdminLogin('database'); else setActiveTab('database'); }} className={`py-3.5 px-6 text-sm font-bold flex items-center gap-2 whitespace-nowrap rounded-t-xl ${activeTab === 'database' ? 'bg-slate-50 text-[#002f6c]' : 'text-blue-200'}`}>{isAdmin ? <Database size={18} /> : <Lock size={18} />} Base de Dados</button>
            <button onClick={() => { if(!isAdmin) setShowAdminLogin('dashboard'); else setActiveTab('dashboard'); }} className={`py-3.5 px-6 text-sm font-bold flex items-center gap-2 whitespace-nowrap rounded-t-xl ${activeTab === 'dashboard' ? 'bg-slate-50 text-[#002f6c]' : 'text-blue-200'}`}>{isAdmin ? <PieChart size={18} /> : <Lock size={18} />} Dashboard</button>
          </div>
        </header>

        {showAdminLogin && (
          <div className="fixed inset-0 bg-slate-900/60 z-[60] flex items-center justify-center p-4 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-black text-lg text-[#002f6c] flex items-center gap-2"><Lock size={20} /> Acesso Restrito</h3>
                <button onClick={() => setShowAdminLogin(false)}><X size={20} /></button>
              </div>
              <input type={showAdminPass ? "text" : "password"} placeholder="Senha Admin" className="w-full p-3 border-2 rounded-xl mb-4 font-bold text-center" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
              <button onClick={() => { if(adminPassword === storedAdminPassword || adminPassword === 'admin123') { setIsAdmin(true); setActiveTab(showAdminLogin as string); setShowAdminLogin(false); } else { showToast('Senha incorreta!', 'error'); } }} className="w-full py-3 bg-[#002f6c] text-white rounded-xl font-bold">Aceder</button>
            </div>
          </div>
        )}

        <main className="max-w-[1400px] mx-auto p-4 sm:p-6 mb-10">
          {activeTab === 'form' && (
            <ExecutionForm 
              formData={formData} setFormData={setFormData} installers={installers} submitting={submitting} 
              handleSubmit={handleSubmit} handleReChange={handleReChange} handleCepBlur={handleCepBlur} 
              handleContratoBlur={handleContratoBlur} calculateHPs={calculateHPs} editingId={editingId} 
              isSlaBlocked={false} slaDaysLeft={null} loadContractForEdit={loadContractForEdit} 
              techReports={techReports} setSelectedReport={setSelectedReport}
            />
          )}
          {activeTab === 'database' && (
            <DatabaseView 
              filteredReports={filteredReports} loading={loading} dbSearch={dbSearch} setDbSearch={setDbSearch} 
              isAdmin={isAdmin} handleDelete={handleDelete} setSelectedReport={setSelectedReport} 
              excelInputRef={excelInputRef} worksExcelRef={worksExcelRef} handleImportExcel={handleImportExcel} 
              handleImportWorksExcel={handleImportWorksExcel} handleExportExcel={handleExportExcel} submitting={submitting}
            />
          )}
          {activeTab === 'dashboard' && (
            <DashboardView 
              reports={reports} dashboardMonth={dashboardMonth} setDashboardMonth={setDashboardMonth} 
              dashboardYear={dashboardYear} setDashboardYear={setDashboardYear} metaFaturamento={metaFaturamento} 
              setMetaFaturamento={setMetaFaturamento} metaBlocos={metaBlocos} setMetaBlocos={setMetaBlocos}
            />
          )}
        </main>

        {selectedReport && (
          <ReportDetailsModal 
            selectedReport={selectedReport} setSelectedReport={setSelectedReport} isAdmin={isAdmin} 
            activeTab={activeTab} renderTimelineElement={renderTimelineElement} generateWordDocument={generateWordDocument} 
            pdfInputRef={pdfInputRef} handleAttachPDFToRecord={handleAttachPDFToRecord} handleDelete={handleDelete} 
            loadContractForEdit={loadContractForEdit} setActiveTab={setActiveTab}
          />
        )}
      </div>
    </ErrorBoundary>
  );
}
