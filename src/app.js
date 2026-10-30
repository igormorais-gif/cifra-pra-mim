// Protótipo pedagógico: exemplos específicos, ainda não há gerador de acordes.
const examples = [
  {name:'C', bass:'Dó', right:'Dó – Mi – Sol', degrees:'1 – 3 – 5', top:'Sol'},
  {name:'Am', bass:'Lá', right:'Dó – Mi – Lá', degrees:'♭3 – 5 – 1', top:'Lá'},
  {name:'F', bass:'Fá', right:'Dó – Fá – Lá', degrees:'5 – 1 – 3', top:'Lá'},
  {name:'G', bass:'Sol', right:'Ré – Sol – Si', degrees:'5 – 1 – 3', top:'Si'}
];
const keyboardDemo = document.querySelector('#keyboard-demo');
keyboardDemo.innerHTML = examples.map((chord, index) => `<article class="chord-card"><h3>${chord.name}</h3><span>M.E.</span><p>${chord.bass}</p><span>M.D. · ${chord.degrees}</span><p>${chord.right}</p><span>PONTA</span><p><strong>${chord.top}</strong>${index === 0 ? ' · forma original' : ''}</p></article>`).join('');

const steps = [
  {name:'G', notes:['Sol','Si','Ré','Sol'], midi:[55,59,62,67], changed:3, move:'Forma inicial', detail:'Ouça o acorde de partida com a fundamental repetida na voz aguda.'},
  {name:'G7M', notes:['Sol','Si','Ré','Fá♯'], midi:[55,59,62,66], changed:3, move:'1 → 7 · −1 semitom', detail:'Na voz superior, a fundamental Sol desce uma casa para Fá♯ (sétima maior).'},
  {name:'G7', notes:['Sol','Si','Ré','Fá'], midi:[55,59,62,65], changed:3, move:'7 → ♭7 · −1 semitom', detail:'A sétima maior Fá♯ desce para a sétima menor Fá.'},
  {name:'Gm7', notes:['Sol','Si♭','Ré','Fá'], midi:[55,58,62,65], changed:1, move:'3 → ♭3 · −1 semitom', detail:'A terça Si desce para Si♭, transformando o acorde em menor.'},
  {name:'Gm7(♭5)', notes:['Sol','Si♭','Ré♭','Fá'], midi:[55,58,61,65], changed:2, move:'5 → ♭5 · −1 semitom', detail:'A quinta Ré desce para Ré♭; o acorde torna-se meio-diminuto.'},
  {name:'G°7', notes:['Sol','Si♭','Ré♭','Mi'], midi:[55,58,61,64], changed:3, move:'♭7 → 𝄫7 · −1 semitom', detail:'A sétima menor Fá desce para Mi, que aqui representa a sétima diminuta (Fá♭ enarmônico).'}
];
let selected = 0;
const buttons = document.querySelector('#transition-buttons');
steps.forEach((step, index) => {const button = document.createElement('button');button.type = 'button';button.textContent = step.name;button.addEventListener('click', () => selectStep(index));buttons.append(button)});
function selectStep(index){selected = index;const step = steps[index];document.querySelector('#chord-name').textContent=step.name;document.querySelector('#movement').textContent=step.move;document.querySelector('#movement-detail').textContent=step.detail;document.querySelector('#notes').innerHTML=step.notes.map((note,i)=>`<span class="note${i===step.changed?' changed':''}">${note}</span>`).join('');[...buttons.children].forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)))}
selectStep(0);

let ctx;
document.querySelector('#play').addEventListener('click', async () => {
  const Context = window.AudioContext || window.webkitAudioContext;
  if(!Context){alert('Seu navegador não suporta reprodução de áudio sintetizado.');return}
  ctx ??= new Context();
  if(ctx.state==='suspended') await ctx.resume();
  const notes = steps[selected].midi;
  const start = ctx.currentTime + 0.02;
  notes.forEach((midi, i) => {
    const osc = ctx.createOscillator();const gain = ctx.createGain();const t=start+i*.22;
    osc.type='sine';osc.frequency.value=440*Math.pow(2,(midi-69)/12);
    gain.gain.setValueAtTime(.0001,t);gain.gain.exponentialRampToValueAtTime(.10,t+.018);gain.gain.exponentialRampToValueAtTime(.0001,t+.45);
    osc.connect(gain);gain.connect(ctx.destination);osc.start(t);osc.stop(t+.48);
  });
});
