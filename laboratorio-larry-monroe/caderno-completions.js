(function (root) {
'use strict';
// Reconstrucoes de estudo ritmico das paginas originais do Volume I.
// Sao versoes executaveis provisórias, sem declarar conferência editorial definitiva.
// Campos: licao, exercicio, pagina impressa, numerador, compassos separados por /.
// A=semibreve; B=minima pontuada; C=minima; D=seminima pontuada;
// E=seminima; F=colcheia; P=minima duplamente pontuada;
// G/H/I/J/K sao pausas correspondentes a 4/3/2/1/0.5 tempos.
const raw = `1,4,7,4,EEEE/CEE/EEEE/CC
1,5,7,4,EEC/IC/A/CC
8,1,69,4,FFFFI/DFI/FDEE/DFI
8,2,69,4,DFEJ/DFEJ/JEFD/DFEJ
8,3,69,4,FFFFI/JFFFFJ/IEFF/IJFF
8,4,69,4,BFF/IEE/JCFF/IFFJ
8,5,69,4,DFEE/DFEFF/FFFFJFF/FFJJFF
8,6,70,4,DFEE/DFDF/DFEE/DFEE
8,7,70,4,DFEE/ECE/DFEE/ECE
8,8,70,4,BE/ECE/DFEE/BE
8,9,70,4,DFC/DFC/FDEE/DFC
8,10,70,4,DFI/DFI/IDF/IDF
8,11,70,4,FDDF/DFI/DFFD/DFI
8,12,71,4,FDDF/DFI/FDEE/DFI/FDDF/DFI/DFDF/DFI
8,13,71,4,FFFFFFFF/FFFFFFFF/FFFFFFFF/EFFFFE/EFFEE/EFFEE/EFFC/FFFFC
8,14,71,4,FFFFFFFF/FFFFC/FFFFFFFF/EFFC/FFFFFFFF/DFC/FFFFFFFF/BJ
8,15,71,4,FFFFC/FFFFC/FEFC/FEFC/CFEF/FEFC/FFFFFFE/BJ
9,1,78,4,DFEJ/EJFD/FFFFC/JFFFFE
9,2,78,4,FDEE/EFFC/JEEE/EJFD
9,3,78,4,EJFFJ/DFJE/FFFFJFF/EFFI
9,4,78,4,EJFFFF/FFEEE/DFEE/EFFC
9,5,78,4,CC/CDF/DFDF/DFI
9,6,79,4,JFDE/DFJKF/DFEE/G
9,7,79,4,JFFEE/JFFEE/FEFEE/FFFFEE
9,8,79,3,FFFFE/FFFFE/FFEE/EEE
9,9,79,3,DFE/DFE/DFE/DD
9,10,79,3,DD/EEE/DD/EFD
9,11,79,3,EDF/EI/EJKF/EI
9,12,80,4,JEFEF/EFEFE/CEE/DFI/JEFFFF/IFFFF/EEEFF/DFI
9,13,80,4,EKFI/EKFI/JEFFFF/JKFI/EKFJKF/CEFF/EFFI/EKFI
9,14,80,3,DFE/DD/FDE/DD/DFE/DD/DD/DFE
9,15,80,3,DD/CE/EC/CE/DD/CE/EC/CE
10,1,87,4,FFJFFFF/KDFEF/EEFFFF/BE
10,2,87,4,PF/KDEFF/BE/FEFC
10,3,87,4,DFJKF/JKFC/DFJKF/IKD
10,4,87,4,KDEKF/EEKD/EKFEE/KDEJ
10,5,87,4,KDKD/EJKD/KDEJ/JKFEE
10,6,88,4,FFFFKKFF/JFFFJF/FFJFFFF/KFFFFD
10,7,88,4,FFKFEJ/KFEFFJ/KFEFFJ/EFFI
10,8,88,4,FEFEJ/KEFEJ/IKEF/EFFFD
10,9,88,3,FFKFE/JEJ/JFFJ/EI
10,10,88,3,EKFFF/EKEF/EKFFF/EKEK
10,11,88,3,FFJFF/JFFJ/FFJFF/JFFJ
10,12,89,4,KEFEE/KEFFFFF/KEFEE/JCE/KEFFFJ/FFJJFF/KEFEE/KEFEE
10,13,89,4,CFEF/JCE/FFJC/FFFFEE/FFFFEE/CFEF/JCE/FEFI
10,14,89,3,KEFE/EEJ/DEF/EI/KEFE/DFE/DEF/EJE
10,15,89,3,CFF/JC/FFJE/EFFJ/EDF/FFJE/KEFE/EI`;
const codes = {A:['n',4],B:['n',3],C:['n',2],D:['n',1.5],E:['n',1],F:['n',.5],P:['n',3.5],G:['r',4],H:['r',3],I:['r',2],J:['r',1],K:['r',.5]};
const catalog = root.MonroeCatalog;
if (!Array.isArray(catalog)) throw Error('MonroeCatalog indisponivel');
let added = 0;
for (const row of raw.trim().split('\n')) {
 const [l,n,page,meter,serialized] = row.trim().split(',');
 const original = catalog.find(item => item.l===+l && item.n===+n);
 if (!original) throw Error('Exercicio nao catalogado '+l+'-'+n);
 if (original.bars.length) continue; // preservar versoes de fonte que avancaram
 const bars = serialized.split('/').map(pattern => [...pattern].map(symbol => {
  const spec = codes[symbol];
  if (!spec) throw Error('Figura desconhecida '+symbol+' em '+l+'-'+n);
  return {t:spec[0],d:spec[1]};
 }));
 for (const [index,bar] of bars.entries()) {
  const sum = bar.reduce((value,note)=>value+note.d,0);
  if (Math.abs(sum - +meter)>0.00001) throw Error('Compasso incompleto: '+l+'-'+n+' / '+(index+1));
 }
 original.bars = bars;
 original.meter = [+meter,4];
 original.page = +page;
 original.status = 's';
 original.source = 'reconstrucao_ritmica_provisoria';
 added++;
}
root.MonroeCompletions = {added, expected:47};
})(globalThis);
