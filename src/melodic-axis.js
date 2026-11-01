/**
 * Laboratório de Improvisação · Eixos melódicos.
 * 7 modos × 4 posições fechadas × 24 percursos ordenados.
 * Apenas alturas originais geradas, sem transcrição de licks.
 */
(function(root,factory){
 const rhythm=typeof module!=="undefined"&&module.exports
  ?require("./rhythm-lab.js"):root.RhythmLabEngine;
 const api=factory(rhythm);
 if(typeof module!=="undefined"&&module.exports)module.exports=api;
 if(root)root.RhythmLabMelody=api;
})(typeof globalThis!=="undefined"?globalThis:this,function(E){
 "use strict";
 const MODES=Object.freeze([
  {id:"ionian",name:"Jônico",scale:[0,2,4,5,7,9,11]},
  {id:"dorian",name:"Dórico",scale:[0,2,3,5,7,9,10]},
  {id:"phrygian",name:"Frígio",scale:[0,1,3,5,7,8,10]},
  {id:"lydian",name:"Lídio",scale:[0,2,4,6,7,9,11]},
  {id:"mixolydian",name:"Mixolídio",scale:[0,2,4,5,7,9,10]},
  {id:"aeolian",name:"Eólio",scale:[0,2,3,5,7,8,10]},
  {id:"locrian",name:"Lócrio",scale:[0,1,3,5,6,8,10]}
 ]);
 const INVERSIONS=Object.freeze([
  {id:0,title:"Posição fundamental",order:"1–3–5–7"},
  {id:1,title:"Primeira inversão",order:"3–5–7–1"},
  {id:2,title:"Segunda inversão",order:"5–7–1–3"},
  {id:3,title:"Terceira inversão",order:"7–1–3–5"}
 ]);
 const DEGREES=[1,3,5,7],LETTER={1:"C",3:"E",5:"G",7:"B"};
 const NAME={1:"Dó",3:"Mi",5:"Sol",7:"Si"};
 const MAJOR={1:0,3:4,5:7,7:11};
 function permutations(values){
  if(!values.length)return [[]];
  return values.flatMap((value,i)=>permutations(values.filter((_,j)=>j!==i)).map(t=>[value,...t]));
 }
 const PATHS=Object.freeze(permutations(DEGREES).map((degrees,i)=>Object.freeze({
  id:i,degrees:Object.freeze(degrees),label:degrees.join("–")
 })));
 function option(opts={}){
  const mode=MODES.find(x=>x.id===(opts.mode??"ionian"));
  const inversion=INVERSIONS.find(x=>x.id===Number(opts.inversion??0));
  const path=PATHS.find(x=>x.id===Number(opts.path??0));
  if(!mode||!inversion||!path)throw new RangeError("Modo, disposição ou percurso desconhecido");
  return{mode,inversion,path};
 }
 function pool(opts={}){
  const {mode,inversion}=option(opts);
  // A disposição é um conjunto de quatro alturas próximas em registro,
  // a ordem de execução (percurso) é escolhida independentemente.
  const pcs={1:mode.scale[0],3:mode.scale[2],5:mode.scale[4],7:mode.scale[6]};
  const result={};
  for(let i=0;i<4;i++){
   const degree=DEGREES[(inversion.id+i)%4];
   const octave=(inversion.id+i)>=4?12:0;
   const semitone=pcs[degree];
   const midi=60+semitone+octave;
   const difference=semitone-MAJOR[degree];
   const accidental=difference===-1?"♭":difference===1?"♯":"";
   result[degree]={
    degree:accidental+degree,name:NAME[degree]+accidental,
    letter:LETTER[degree],alteration:accidental,
    midi,octave:Math.floor(midi/12)-1,
    diatonic:degree
   };
  }
  return result;
 }
 function notes(opts={}){
  const {path}=option(opts),mapping=pool(opts);
  return path.degrees.map((d,i)=>({...mapping[d],index:i}));
 }
 function events(id,opts={}){
  const rhythmic=E.events(id),tones=notes(opts);
  return rhythmic.map((e,i)=>({...e,...tones[i],index:i}));
 }
 function modalColors(modeId){
  const {mode}=option({mode:modeId});
  const canonical=[0,2,4,5,7,9,11],numbers=[1,2,3,4,5,6,7];
  return numbers.map((degree,i)=>{
   const delta=mode.scale[i]-canonical[i];
   return (delta===-1?"♭":delta===1?"♯":"")+degree;
  });
 }
 function chordSymbol(modeId){
  const m=option({mode:modeId}).mode;
  const minor=m.scale[2]===3,flat5=m.scale[4]===6,flat7=m.scale[6]===10;
  return "C"+(minor?"m":"")+(flat7?"7":"7M")+(flat5?"(♭5)":"");
 }
 function distinctTetrads(){
  const grouped=new Map();
  for(const m of MODES){
   const key=[0,2,4,6].map(i=>m.scale[i]).join("-");
   grouped.set(key,[...(grouped.get(key)||[]),m.name]);
  }
  return [...grouped.values()];
 }
 return{MODES,INVERSIONS,PATHS,option,pool,notes,events,modalColors,chordSymbol,distinctTetrads};
});
