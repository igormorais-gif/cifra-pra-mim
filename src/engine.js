window.CifraEngine = (function createEngine(){
  const natural={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
  const letters=["C","D","E","F","G","A","B"];
  const bases={1:0,2:2,3:4,4:5,5:7,6:9,7:11,9:14,11:17,13:21};
  const mod=(a,b)=>((a%b)+b)%b;
  function pitch(name){const match=/^([A-G])([#b]?)$/i.exec(name);if(!match)return null;return mod(natural[match[1].toUpperCase()]+(match[2]==="#"?1:match[2]==="b"?-1:0),12)}
  function spell(root,degree,semitones){const idx=letters.indexOf(root[0].toUpperCase());const target=letters[mod(idx+(degree-1)%7,7)];const p=mod(pitch(root)+semitones,12);let a=mod(p-natural[target]+6,12)-6;return target+(a===0?"":a===1?"♯":a===2?"𝄪":a===-1?"♭":a===-2?"𝄫":"")}
  function degree(label,semi,number){return {label,semitones:semi,number};}
  function parseChord(raw){
    const source=String(raw??"").trim().replace(/♯/g,"#").replace(/♭/g,"b").replace(/[−–]/g,"-");
    const m=/^([A-G](?:#|b)?)(.*)$/i.exec(source);
    if(!m)throw Error("Acorde inválido: "+raw);
    const root=m[1][0].toUpperCase()+m[1].slice(1);
    let suffix=m[2];let bass=root;
    const slash=/\/([A-G](?:#|b)?)$/i.exec(suffix);
    if(slash){bass=slash[1][0].toUpperCase()+slash[1].slice(1);suffix=suffix.slice(0,-slash[0].length);}
    const rawSuffix=suffix;
    const s=suffix.replace(/[() ,]/g,"").replace(/º/g,"°").replace(/Δ/g,"maj7").replace(/𝄫/g,"bb").replace(/𝄪/g,"##");
    const low=s.toLowerCase();
    const half=/ø|m7b5|min7b5|halfdim/.test(low);
    const diminished=half||/°|dim/.test(low);
    const dimSeventh=/°7|dim7/.test(low);
    const minor=!diminished&&(/^(m(?!aj)|min|-)/.test(s)||/^minor/i.test(s));
    const augmented=/aug|\+/.test(low);
    const sus=/sus2/i.test(s)?2:/sus4|sus(?![0-9])/i.test(s)?4:0;
    const majorSeven=/7M|M7|maj7|Maj7|MAJ7|ma7/.test(s);
    const minorMajor=/m(?:maj7|M7|7M)/.test(s);
    const seventh=dimSeventh?"dim":(majorSeven||minorMajor)?"maj":half||/7/.test(s)||(!/6/.test(s)&&/(?:9|11|13)/.test(s))?"dom":null;
    const sixth=/(?:^|[^0-9])6(?![0-9])/.test(s);
    const ninth=/#9/.test(s)?"♯9":/b9/.test(s)?"♭9":/9/.test(s)?"9":null;
    const eleventh=/#11/.test(s)?"♯11":/11/.test(s)?"11":null;
    const thirteenth=/b13/.test(s)?"♭13":/13/.test(s)?"13":null;
    const flat5=/b5/.test(s)||half;
    const sharp5=/#5/.test(s)||augmented;
    if(flat5&&sharp5)throw Error("Quinta alterada de forma contraditória em "+raw);
    if(/[^A-Za-z0-9#b+°ø/() ,Δ-]/.test(rawSuffix))throw Error("Símbolo não reconhecido: "+raw);
    if(/(?:^|[^a-z])(?:sus[0-9]+)(?![24])/.test(low))throw Error("Suspensão desconhecida: "+raw);
    let tones=[
      degree("1",0,1),
      sus?degree(String(sus),bases[sus],sus):degree(diminished||minor?"♭3":"3",diminished||minor?3:4,3),
      degree(diminished||flat5?"♭5":sharp5?"♯5":"5",diminished||flat5?6:sharp5?8:7,5)
    ];
    if(seventh){tones[0]=degree(seventh==="dim"?"𝄫7":seventh==="maj"?"7":"♭7",seventh==="dim"?9:seventh==="maj"?11:10,7);}
    if(ninth){
      const n=degree(ninth,ninth==="♭9"?13:ninth==="♯9"?15:14,9);
      if(tones.some(t=>t.number===1))tones[tones.findIndex(t=>t.number===1)]=n;else tones.push(n);
    }
    if(eleventh){
      const e=degree(eleventh,eleventh==="♯11"?18:17,11);
      if(sus&&sus===4)tones[tones.findIndex(t=>t.number===4)]=e;else tones.push(e);
    }
    if(thirteenth){tones[tones.findIndex(t=>t.number===5)]=degree(thirteenth,thirteenth==="♭13"?20:21,13);}
    if(sixth)tones.push(degree("6",9,6));
    const unique=[];for(const tone of tones){if(!unique.some(t=>t.semitones===tone.semitones))unique.push({...tone,name:spell(root,tone.number,tone.semitones)})}
    if(unique.length>5)throw Error("Acorde extenso demais para esta versão: "+raw);
    return {raw:source,root,bass,rootPc:pitch(root),bassPc:pitch(bass),tones:unique,signature:unique.map(t=>t.label).join(" – ")};
  }
  function parseProgression(value){
    const input=String(value??"").replace(/[|;,\n\r]+/g," ").replace(/\s+/g," ").trim();
    if(!input)throw Error("Digite pelo menos um acorde.");
    const tokens=input.split(" ").filter(Boolean);
    if(tokens.length>48)throw Error("Limite de 48 acordes por geração.");
    const chords=tokens.map(parseChord);
    return chords;
  }
  function bassMidi(chord){return 36+chord.bassPc;}
  function hasClash(bass,notes){return notes.some(n=>[1,13].includes(Math.abs(n.midi-bass)));}
  function candidates(chord){
    const root=60+chord.rootPc;
    const base=chord.tones.map((tone,index)=>({...tone,index,midi:root+tone.semitones})).sort((a,b)=>a.midi-b.midi);
    const out=[];
    for(let k=0;k<base.length;k++){
      const order=base.slice(k).concat(base.slice(0,k).map(x=>({...x,midi:x.midi+12})));
      for(const shift of [-24,-12,0,12]){
        const notes=order.map(t=>({...t,midi:t.midi+shift}));
        if(notes[0].midi<48||notes[notes.length-1].midi>84)continue;
        const clash=hasClash(bassMidi(chord),notes);
        out.push({notes,top:notes[notes.length-1].midi,rotation:k,omitted:[],clash,bass:bassMidi(chord)});
      }
    }
    const preferred=out.filter(c=>!c.clash);
    if(preferred.length)return preferred;
    // If a semitone or minor-ninth clash cannot be avoided, name the omitted tone.
    const omissions=[];
    for(const c of out){
      const remaining=c.notes.filter(n=>![1,13].includes(Math.abs(n.midi-c.bass)));
      if(remaining.length>=2&&remaining.length<c.notes.length){
        const omitted=c.notes.filter(n=>!remaining.includes(n)).map(n=>({label:n.label,name:n.name}));
        omissions.push({...c,notes:remaining,top:remaining[remaining.length-1].midi,omitted,clash:false});
      }
    }
    return omissions.length?omissions:out;
  }
  function original(chord,origin){
    const options=candidates(chord);
    const chosen=options.filter(c=>c.rotation===mod(origin,Math.max(1,chord.tones.length)));
    const pool=chosen.length?chosen:options;
    return pool.slice().sort((a,b)=>Math.abs(a.top-70)-Math.abs(b.top-70)||a.omitted.length-b.omitted.length)[0];
  }
  function chooseNext(chord,prev){
    const options=candidates(chord);
    const score=c=>{
      const dist=Math.abs(c.top-prev.top);
      const n=Math.min(c.notes.length,prev.notes.length);
      let sum=0;for(let i=0;i<n;i++)sum+=Math.abs(c.notes[i].midi-prev.notes[i].midi);
      return (dist>2?50+dist*3:dist*8)+sum+Math.abs(c.notes.length-prev.notes.length)*4+c.omitted.length*25+(c.clash?1000:0);
    };
    return options.slice().sort((a,b)=>score(a)-score(b))[0];
  }
  function generate(value){
    const chords=Array.isArray(value)?value:parseProgression(value);
    const originalTracks=[0,1,2].map(origin=>chords.map(c=>original(c,origin)));
    const adapted=originalTracks.map(track=>{
      const result=[track[0]];
      for(let i=1;i<chords.length;i++)result.push(chooseNext(chords[i],result[i-1]));
      return result;
    });
    return {chords,originalTracks,adapted};
  }
  return {parseChord,parseProgression,candidates,generate,pitch,spell};
})();
