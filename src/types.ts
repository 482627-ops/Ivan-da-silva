export interface Material {
  sap: string;
  name: string;
  valor: number;
}

export interface Evidencias {
  fachada: string[];
  numeral: string[];
  caixaMInt: string[];
  caixaMExt: string[];
  dio: string[];
  naps: Record<string, string[]>;
}

export interface ServiceReport {
  id?: string;
  codigoUnico: string;
  osConstrucao: string;
  contrato: string;
  tipoProjeto: string;
  nomeInstalador: string;
  reInstalador: string;
  loginInstalador: string;
  nomeAuxiliar: string;
  reAuxiliar: string;
  loginAuxiliar: string;
  cep: string;
  endereco: string;
  numeroEndereco: string;
  totalBlocos: string;
  totalAndares: string;
  aptPorAndar: string;
  totalHps: string;
  quantidadeNaps: string;
  statusConstrucao: string;
  ativacao: string;
  dataInicio: string;
  dataFim: string;
  observacao: string;
  quantidadePostes: string;
  justificativaCabo: string;
  materiaisUsados: Record<string, string>;
  statusGestao: string;
  motivoReprovacao: string;
  dataReprovacao: number | null;
  timestamp: number;
  dataCriacao: string;
  tecnicoId: string;
  evidencias: Evidencias;
  fotosBase64: string[];
  etapas?: Record<string, string>;
  valorPorHp?: number;
  
  // Incident fields
  incidenteEndereco?: string;
  incidenteModo?: string;
  incidenteEquipe?: string;
  incidenteSupervisor?: string;
  incidenteCaixaM?: string;
  incidenteNomenclaturaFibra?: string;
  incidentePosicaoFibra?: string;
  incidenteDescricao?: string;
  
  // Legacy or extra fields
  estrutura?: {
    blocos: number;
    totalHps: number;
  };
  postes?: number;
}

export interface Installer {
  re: string;
  login: string;
  nome: string;
}
