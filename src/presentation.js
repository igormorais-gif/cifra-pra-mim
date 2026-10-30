/* Apresentação pedagógica no padrão CIFRA PRA MIM — teclado. */
window.CifraPresentation=(function(){
  "use strict";
  const pt={C:"Dó",D:"Ré",E:"Mi",F:"Fá",G:"Sol",A:"Lá",B:"Si"};
  function note(name){
    const m=/^([A-G])([#b♯♭]?)$/i.exec(String(name||""));
    if(!m)return name;
    return pt[m[1].toUpperCase()]+(m[2]==="#"||m[2]==="♯"?"#":m[2]==="b"||m[2]==="♭"?"♭":"");
  }
  function name(chord){
    const suffix=String(chord.raw).slice(chord.root.length).replace(/\/[A-G][#b]?$/i,"").replace(/[()]/g,"");
    const norm=suffix.replace(/º/g,"°");
    let quality;
    const minor=/^(?:m(?!aj)|min|-)/.test(norm);
    const diminished=/°|dim|ø/.test(norm)||/m7b5/.test(norm);
    const sus=/sus2/.test(norm)?" com Segunda Suspensa":/sus4|sus(?!\d)/.test(norm)?" com Quarta Suspensa":"";
    const maj7=/7M|M7|maj7/i.test(norm);
    const seven=/7/.test(norm);
    const six=/(?:^|[^0-9])6(?![0-9])/.test(norm);
    if(/m7b5|ø/.test(norm))quality="Meio-diminuto";
    else if(diminished)quality="Diminuto";
    else if(minor)quality=seven?(maj7?"Menor com Sétima Maior":"Menor com Sétima"):"Menor";
    else if(/aug|\+/.test(norm))quality="Aumentado";
    else if(maj7)quality="com Sétima Maior";
    else if(seven)quality="com Sétima";
    else if(six)quality="com Sexta";
    else quality="Maior";
    const append=[];
    if(sus)append.push(sus.trim());
    if(/#11/.test(norm))append.push("Décima Primeira Aumentada");
    if(/b13/.test(norm))append.push("Décima Terceira Menor");
    if(/#9/.test(norm))append.push("Nona Aumentada");
    if(/b9/.test(norm))append.push("Nona Menor");
    if(/m9|[^#b]9/.test(norm)&&!/b9|#9/.test(norm))append.push("Nona");
    const base=note(chord.root)+" "+quality+(append.length?" · "+append.join(", "):"");
    return chord.bass!==chord.root?base+" / baixo em "+note(chord.bass):base;
  }
  function dotLabel(label){
    return String(label).replace(/♭/g,"♭").replace(/♯/g,"#").replace(/𝄫/g,"♭♭");
  }
  function hand(chord,voicing){
    return {left:note(chord.bass),right:voicing.notes.map(n=>note(n.name)).join("  ")};
  }
  return {note,name,dotLabel,hand};
})();