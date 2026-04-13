export const MATERIALS_DB = [
  { sap: '30034323', name: 'ABRAC. UNHA N-1 GALVANIZADO', valor: 0.44 },
  { sap: '22055828', name: 'ABRACADEIRA HELLERMANN T50R-PT', valor: 0.12 },
  { sap: '30034326', name: 'ANEL GUIA AGS ACO CARB 40MM', valor: 1.04 },
  { sap: '22062448', name: 'BANDEJA EMENDA OPTICA FOSC 24 FO', valor: 19.07 }, 
  { sap: '60000449', name: 'CABO DROP 08FO C/M AS FIG.8 (PRETO)', valor: 1.67 },
  { sap: '22026267', name: 'CABO DROP 1FO LOW F FIG8 CINZA', valor: 0.73 },
  { sap: '22012583', name: 'CABO FO CFOA SM DROP FIG8 8FO', valor: 1.50 },
  { sap: '30059444', name: 'CABO RISER CFOI BLI 12 FO MDU', valor: 4.68 },
  { sap: '22068044', name: 'CAIXA DIO NAP MDU PS DIV 1:8 4 PIGTAIL', valor: 160.55 },
  { sap: '22062363', name: 'CAIXA EMENDA FOSC100 MINI B8 24F AZL KIT', valor: 178.30 }, 
  { sap: '22059418', name: 'CAIXA MDU GPON CDOI 1:8 SELADA C SHUTTER', valor: 90.97 },
  { sap: '22056396', name: 'CONECTOR FO CAMPO FAST SC/APC', valor: 5.94 }, 
  { sap: '22066730', name: 'CONJUNTO TUBO DERIVACAO FOSC', valor: 12.50 },
  { sap: '22068047', name: 'DIO ENTR MDU TRANS RISER S/PIG', valor: 69.17 },
  { sap: '22068046', name: 'DIO ENTRADA MDU 8 PIGTAILS S DIVISOR', valor: 143.85 },
  { sap: '22060790', name: 'DIVISOR OPTICO GPON 1:8 R132827', valor: 43.74 },
  { sap: '22055839', name: 'FECHO DE ACO INOX DENTADO 3/4', valor: 0.45 },
  { sap: '22055824', name: 'FITA ACO INOX 3/4 POLEGADA ROLO 25MT', valor: 3.25 },
  { sap: '22025072', name: 'FITA ISOLANTE 3M 33+', valor: 8.50 },
  { sap: '22056445', name: 'KIT TUBO DERIVACAO PEQUENO 30/8 87280000', valor: 11.44 },
  { sap: '22066616', name: 'MARCADOR CASA PRETO NR 0', valor: 0.90 },
  { sap: '22066615', name: 'MARCADOR CASA PRETO NR 1', valor: 0.90 },
  { sap: '22066614', name: 'MARCADOR CASA PRETO NR 2', valor: 0.90 },
  { sap: '22066613', name: 'MARCADOR CASA PRETO NR 3', valor: 0.90 },
  { sap: '22066612', name: 'MARCADOR CASA PRETO NR 4', valor: 0.90 },
  { sap: '22066611', name: 'MARCADOR CASA PRETO NR 5', valor: 0.90 },
  { sap: '22066610', name: 'MARCADOR CASA PRETO NR 6', valor: 0.90 },
  { sap: '22066609', name: 'MARCADOR CASA PRETO NR 7', valor: 0.90 },
  { sap: '22066608', name: 'MARCADOR CASA PRETO NR 8', valor: 0.90 },
  { sap: '22066607', name: 'MARCADOR CASA PRETO NR 9', valor: 0.90 },
  { sap: '22026510', name: 'PARAFUSO PANELA', valor: 0.00 },
  { sap: '22056395', name: 'PITAO GANCHO COM BUCHA S10', valor: 0.00 },
  { sap: '22055817', name: 'PLACA SINALIZACAO CABO OPTICO CLARO', valor: 0.00 },
  { sap: '30033493', name: 'PROTETOR_FO TERMOCONTR. 45MM', valor: 0.00 },
  { sap: '22025606', name: 'QUADRO SOBR ACO 400X400X135MM', valor: 0.00 },
  { sap: '22025442', name: 'QUADRO SOBR ACO 600X600X135MM', valor: 0.00 },
  { sap: '30033998', name: 'SUPORTE ROLDANA FO DROP SDA-1', valor: 0.00 },
  { sap: '22025049', name: 'VASELINA SOLIDA POTE 410G', valor: 0.00 }
];

export const calculateMaterialValue = (materiais: Record<string, any>) => {
  if (!materiais) return 0;
  let total = 0;
  Object.entries(materiais).forEach(([sap, qtd]) => {
    const numQtd = parseFloat(qtd) || 0;
    const mat = MATERIALS_DB.find(m => m.sap === sap);
    if (mat && numQtd > 0) total += numQtd * (mat.valor || 0);
  });
  return total;
};
