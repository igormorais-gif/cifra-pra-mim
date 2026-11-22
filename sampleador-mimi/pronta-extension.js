(()=>{'use strict';
const core=window.mimiProntaCore;
if(!core)return;
const $=id=>document.getElementById(id), tones=['E6','Eb6','D6','Db6','C6','B6','Bb6','A6','G#6'], steps=[0,2,4,6,10];
const words=[[[0,0.23],[0.285,0.24],[0.58,0.21],[0.845,0.45],[1.35,0.25]],[[1.655,0.26],[1.97,0.28],[2.305,0.27],[2.63,0.48],[3.165,0.27]],[[3.49,0.26],[3.805,0.29],[4.15,0.26],[4.465,0.54],[5.06,0.31]],[[5.425,0.24],[5.72,0.26],[6.034,0.2],[6.289,0.47],[6.814,0.26]],[[7.129,0.26],[7.444,0.22],[7.719,0.19],[7.964,0.51],[8.529,0.28]],[[8.864,0.25],[9.169,0.23],[9.454,0.26],[9.769,0.5],[10.324,0.33]],[[10.709,0.24],[11.004,0.26],[11.319,0.26],[11.634,0.54],[12.229,0.36]],[[12.644,0.25],[12.949,0.32],[13.324,0.28],[13.659,0.67],[14.384,0.32]],[[14.759,0.3],[15.114,0.29],[15.459,0.42],[15.934,0.67],[16.659,0.36]]];
let buffer=null,ready=false,vol=82;
const row=Array(16).fill(0),pitches=Array(16).fill(0);
const style=document.createElement('style');
style.textContent='.pronta-intro{background:#3e3058;border:1px solid #8772ab;border-radius:15px;padding:15px;margin:16px 0}.pronta-intro h3{margin:0 0 8px;color:#f2d8ff}.pronta-intro p{font-size:.83rem;color:#e5dcef}.pronta-controls{display:flex;flex-wrap:wrap;align-items:center;gap:9px}.pronta-controls .btn{padding:11px 14px;font-size:.84rem}.pronta-intro input[type=file]{max-width:100%}.pronta-intro label{font-size:.78rem;color:#e7d4f4}.pronta-intro label input{display:block;margin-top:6px}.pronta-name{font-size:.61rem;color:#f2caff;line-height:1.14}.step[data-track="7"][aria-pressed=true]{background:#dfaced;color:#2b1936;border-color:#f2caff}.step[data-track="7"][aria-pressed=false]{background:#382b49;border-color:#77628c}.pronta-status{font-size:.76rem;color:#d4c0ec;margin:9px 0 0}#prontaManual{background:#e9ccfb;color:#271b37}';
document.head.append(style);
const panel=$('sequencer');if(!panel)return;
const intro=document.createElement('div');intro.className='pronta-intro';
intro.innerHTML='<h3>🎭 EU JÁ ESTOU PRONTA · 5–5–5–3–1</h3><p>Uma célula dispara as cinco palavras no tom escolhido! Nove tomadas cromáticas (E6 a G#6). Ritmo em 2/4: <b>EU (0) · JÁ (2) · ESTOU (4) · PRON (6) · TA (10)</b>.</p><div class="pronta-controls"><button class="btn secondary" type="button" id="insertPronta">+ Frase no início</button><button class="btn secondary" type="button" id="clearPronta">Apagar frases</button><label>Volume <input id="prontaVolume" type="range" min="0" max="100" value="82"></label></div><label style="display:block;margin-top:10px">Importar banco afinado (arquivo .m4a do pacote)<input id="prontaUpload" type="file" accept="audio/*,.m4a,.ogg"></label><p class="pronta-status" id="prontaStatus">Preparando as nove atuações...</p>';
const place=panel.querySelector('.rhythm-info');if(place)place.before(intro);else panel.prepend(intro);
const manual=document.createElement('button');manual.type='button';manual.id='prontaManual';manual.className='btn';manual.textContent='▶ EU JÁ ESTOU PRONTA';
$('phrase')?.after(manual);
const key='mimi-pronta-track-v1';
const save=()=>{try{localStorage.setItem(key,JSON.stringify({row,pitches,vol}));}catch{}};
try{let s=JSON.parse(localStorage.getItem(key)||'null');if(s){if(s.row?.length===16)s.row.forEach((v,i)=>row[i]=v?1:0);if(s.pitches?.length===16)s.pitches.forEach((v,i)=>pitches[i]=Math.min(8,Math.max(0,+v|0)));if(Number.isFinite(+s.vol))vol=Math.max(0,Math.min(100,+s.vol));}}catch{}
$('prontaVolume').value=vol;
function draw(){
const g=$('beatgrid');if(!g||g.querySelector('[data-track="7"]'))return;
const label=document.createElement('span');label.className='trname pronta-name';label.textContent='EU JÁ ESTOU PRONTA';label.style.gridColumn='1';label.style.gridRow='9';g.append(label);
for(let i=0;i<16;i++){const b=document.createElement('button');b.type='button';b.className='step';b.dataset.track='7';b.dataset.step=i;b.style.gridColumn=String(i+2);b.style.gridRow='9';b.textContent=row[i]?tones[pitches[i]].replace('6',''):'+';b.setAttribute('aria-pressed',String(!!row[i]));b.setAttribute('aria-label','EU JÁ ESTOU PRONTA passo '+(i+1)+(row[i]?', '+tones[pitches[i]]:''));b.onclick=()=>{let t=core.selectedTone();if(row[i]&&pitches[i]===t)row[i]=0;else{row[i]=1;pitches[i]=t;}save();redraw();};g.append(b);}
}
function redraw(){const g=$('beatgrid');if(!g)return;g.querySelectorAll('[data-track="7"],.pronta-name').forEach(e=>e.remove());draw();}
const grid=$('beatgrid');new MutationObserver(()=>{if(!grid.querySelector('[data-track="7"]'))draw();}).observe(grid,{childList:true});draw();
function play(tone,at,globalStep){
if(!buffer){$('prontaStatus').textContent='Importe o banco afinado do pacote para tocar.';return;}
const c=core.getAudio(),v=.88*Math.pow(vol/100,1.4),tk=words[Math.min(8,Math.max(0,tone))];if(v<.001)return;
for(let i=0;i<5;i++){
let off=0;for(let j=0;j<steps[i];j++)off+=globalStep==null?60/Math.max(50,+$('bpm').value)/4:core.stepDuration(globalStep+j);
const when=at+off,[start,len]=tk[i],fade=Math.min(.012,len*.13);
const node=c.createBufferSource(),gain=c.createGain();node.buffer=buffer;
gain.gain.setValueAtTime(.0001,when);gain.gain.linearRampToValueAtTime(v,when+fade);gain.gain.setValueAtTime(v,Math.max(when+fade,when+len-.025));gain.gain.linearRampToValueAtTime(.0001,when+len);
node.connect(gain).connect(c.destination);node.start(when,start,len);node.stop(when+len+.012);core.registerSource(node);
}
if($('padEnabled')?.checked&&$('padTrigger')?.value==='ih')core.playLofiPad(at,tone,1.5);
}
manual.onclick=()=>play(core.selectedTone(),core.getAudio().currentTime+.05,null);
$('insertPronta').onclick=()=>{row[0]=1;pitches[0]=core.selectedTone();save();redraw();};
$('clearPronta').onclick=()=>{row.fill(0);save();redraw();};
$('prontaVolume').oninput=e=>{vol=+e.target.value;save();};
for(const id of ['clearbeat','resetbeat','syncbeat'])$(id)?.addEventListener('click',()=>{row.fill(0);save();redraw();});
document.addEventListener('mimi-pronta-beat-step',e=>{const d=e.detail;if(row[d.index])play(pitches[d.index],d.at,d.globalStep);});
const dbName='mimi-pronta-bank',store='audios';
function db(){return new Promise((res,rej)=>{let r=indexedDB.open(dbName,1);r.onupgradeneeded=()=>r.result.createObjectStore(store);r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error);});}
async function decode(data,source){let b=await core.getAudio().decodeAudioData(data.slice(0));if(b.duration<16||b.duration>19)throw Error('O banco deve durar aproximadamente 17 segundos');buffer=b;ready=true;$('prontaStatus').textContent='✓ 9 atuações cromáticas · 45 palavras afinadas · '+source;}
async function startup(){
try{const conn=await db(),data=await new Promise(res=>{const r=conn.transaction(store,'readonly').objectStore(store).get('bank');r.onsuccess=()=>res(r.result||null);r.onerror=()=>res(null);});conn.close();if(data){await decode(data,'salvas neste aparelho');return;}}catch{}
for(const ext of ['m4a','ogg'])try{const r=await fetch('./assets/eu-ja-estou-pronta-bank.'+ext);if(!r.ok)continue;await decode(await r.arrayBuffer(),'incluídas no Hub');return;}catch{}
$('prontaStatus').textContent='Banco não encontrado no Hub. Importe o arquivo .m4a do pacote uma vez ou use o HTML autônomo.';
}
$('prontaUpload').onchange=async e=>{const f=e.target.files?.[0];if(!f)return;try{const bytes=await f.arrayBuffer();await decode(bytes,'importadas');try{const conn=await db();await new Promise((res,rej)=>{const tx=conn.transaction(store,'readwrite');tx.objectStore(store).put(bytes,'bank');tx.oncomplete=res;tx.onerror=()=>rej(tx.error);});conn.close();}catch{}}catch(err){buffer=null;ready=false;$('prontaStatus').textContent=err.message;}};
startup();
})();