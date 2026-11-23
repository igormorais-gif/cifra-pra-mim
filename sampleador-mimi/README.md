# SAMPLEADOR MIMI — Visual panorâmico e lip sync (22/11/2026)

**Hub:** https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/

## Nova apresentação

O MIMI passou a usar um visual panorâmico, inspirado no mockup escolhido, mas com os **mesmos componentes musicais já existentes**. Em telas horizontais de celular/tablet/desktop, a escolha de acordes e os quatro pads vocais ficam à esquerda e o **montador de BEAT de 16 passos aberto** fica à direita. Harmonia e sons de bateria ficam logo abaixo. Em celular vertical a página permanece funcional, com um aviso discreto sugerindo rotação; a orientação de tela não é forçada por código.

A identidade visual nova está em `assets/studio-panorama.css`, carregada após os estilos anteriores, e não interfere nas rotinas de áudio.

## Rosto e lip sync

O retrato da imagem já autorizada permanece em `assets/lipsync-rosto.webp`. A boca agora é uma **sobreposição SVG sobre um único quadro do rosto**, com seis visemas distintos: repouso, IH, ON, fechamento M, vogal I, fechamento nasal N. Assim não depende do deslocamento de um spritesheet para trocar a boca e evita as antigas representações de círculo branco e linha. Os estados são trocados pelo mesmo agendamento de WebAudio usado pelos samples:

- IH: abertura lateral enquanto a voz sustenta.
- ON: lábios arredondados, fechando no fim.
- MI: fechamento M inicial seguido de abertura I durante a sustentação; o M não se repete quando a nota é alongada.
- Ao parar tudo: expressão volta ao repouso.

O sistema é **lip sync 2D por visemas e tempos de disparo**, não acompanhamento automático de fonemas via reconhecimento de voz. A eficácia visual final precisa ser verificada num iPhone real.

## Preservado

Ajuste manual do BPM, mudança harmônica durante o beat, PAD 6–3–5 apenas com liga/desliga, nomes das notas abaixo dos quatro botões, recorte ajustado de Bb6, harmonias vocais e edição de duração no piano roll. A função “Eu já estou pronta” e o acelerador permanecem ausentes.

**Privacidade:** o retrato e a gravação de voz continuam em um repositório público. Se desejar privacidade, será necessário mudar a hospedagem/visibilidade dos arquivos.

---


Endereço no Hub: https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/

## Interface atual — beat em primeiro plano

O **montador de BEAT agora aparece aberto e em destaque imediatamente depois dos botões IH, ON, MI, MI**, antes da harmonia e dos controles de bateria. É o item **03 / Monte seu BEAT** e não fica escondido em “Editar batida e andamento”.

A grade de 16 semicolcheias está visível imediatamente. É possível criar e apagar passos para as quatro sílabas e para bumbo, caixa e prato, alongar as notas manualmente, ajustar o BPM (50–220) com o ritmo tocando, trocar os acordes ao vivo e usar os padrões predefinidos. A duração inicial de uma nota continua sendo uma semicolcheia.

A ordem dos painéis visíveis agora é:
- 01 — Escolha o tom
- 02 — Toque as sílabas, com notas pequenas abaixo dos botões e liga/desliga do PAD
- 03 — Monte seu BEAT: grade aberta, BPM, Play e edição das notas
- 04 — Viva a harmonia
- 05 — Sons da bateria

O PAD continua ativo apenas quando marcado, com configurações sonoras preservadas sem painel separado. “Eu já estou pronta” permanece fora do aplicativo. O texto “Laboratório musical do Nilo” e a rampa de aceleração foram retirados.

## Beat e BPM

**Não existe mais aceleramento progressivo.** Há apenas um slider de **BPM (50–220)**, acessível diretamente no bloco **Beat ao vivo**, inclusive com o beat tocando. A mudança do valor não reinicia a sequência nem a bateria; o próximo passo usa o BPM atualizado. Swing e rampas de destino e compassos foram removidos da interface. A seleção do acorde durante a reprodução atualiza as próximas sílabas, as harmonias e o pad sem interromper o beat.

## Áudio / recorte Bb6

O recorte da primeira sílaba MI em Bb6 foi encurtado e reposicionado de 13,03–13,29 s para **13,08–13,22 s**, preservando a segunda sílaba MI de 13,24–13,42 s. O recorte deve ser escutado no celular para confirmar que não contém o ataque do próximo MI.

A voz original 149 permanece no repositório. O G#6 continua derivado da última tomada por transposição.

## Disponibilidade e privacidade

A atualização foi enviada ao branch principal do GitHub. A sincronização do GitHub Pages pode levar algum tempo. A gravação de voz disponibilizada pelo Pages está em um repositório público.

## Rosto com lip sync (22/11/2026)

O rosto enviado nesta conversa foi recortado para um pequeno avatar circular (112 px no desktop, 78 px no celular) no canto superior direito do cabeçalho. A arte contém seis estados: repouso, IH (abertura lateral), ON (lábios arredondados), M (fechamento), I (abertura lateral) e N (fechamento leve).

A animação não é um GIF independente: `queueLip()` registra eventos quando cada sílaba da gravação 149 é agendada em `AudioContext.currentTime`, e `requestAnimationFrame` determina o visema correspondente pelo tempo real. Nos dois MI, o M aparece apenas no ataque; ao alongar a nota, a boca permanece na vogal I. A frase completa também registra os ataques das quatro sílabas. Bateria isolada, pad isolado e acordes sem voz não acionam a boca. O comando PARAR TUDO devolve a expressão ao repouso.

O ritmo do beat, as alterações de BPM, os padrões, a escolha de acorde e as harmonias não foram modificados. O projeto preserva os quatro botões IH/ON/MI/MI e o sequenciador aberto.

Recurso visual: `assets/lipsync-rosto.webp`. É uma animação 2D aproximada por visemas, não análise fonêmica quadro a quadro nem captura facial em vídeo. A precisão final da sincronização deve ser conferida auditivamente e visualmente no iPhone.

**Privacidade:** o retrato recortado está publicado no repositório público junto à voz do projeto.

## Catálogo de batidas e notas por acorde (novembro/2026)

O montador de BEAT mantém **16 semicolcheias e sete pistas**. Agora tem um seletor de **nove levadas**: MIMI clássico, samba, funk carioca, hip-hop, pop, rock, house, reggae e bossa nova. As levadas são **padrões estilizados**, não reproduções exatas de grooves tradicionais. Ao selecionar uma levada, as pistas de bumbo, caixa, prato e as quatro vozes IH, ON, MI 1 e MI 2 recebem eventos juntos. Todas as sete pistas podem ser modificadas livremente depois, e o padrão selecionado é salvo localmente.

As sílabas são **samples de percussão vocal adicional** e não exigem que o usuário toque a frase completa. Cada ocorrência é uma nota curta (um passo por padrão) que pode ser alongada pelo editor.

As quatro pistas vocais exibem **os nomes de notas do acorde selecionado** tanto nos rótulos quanto dentro dos blocos do beat. O editor de duração também exibe a altura atual. Exemplo: E6 = Mi5 / Mi4 / Ré♯5 / Dó♯5; Bb6 = Si♭4 / Si♭3 / Lá4 / Sol4. Quando se escolhe outro acorde, os nomes de **todos os blocos vocais existentes** são atualizados sem apagar o ritmo ou reiniciar o transporte; o som também segue as tomadas correspondentes. O botão antigo “Aplicar tom selecionado” foi retirado porque seria redundante.

A escolha de levada **não altera o BPM** e pode ser feita com o beat tocando; os próximos passos passam a seguir o novo padrão. A edição ou escolha de outra levada substitui as posições programadas no estado atual, mas a execução não reinicia.

**Rosto/lip sync:** nenhuma modificação nessa parte foi feita nesta atualização. A reclamação sobre a boca continua pendente de um teste auditivo/visual real no iPhone e não deve ser considerada corrigida por esta alteração.

## Lip sync e par MI–MI em semicolcheias (22/11/2026)

O personagem passou a usar o banco de imagem **`assets/rosto-lipsync-v2.webp`**, com estados visuais realmente distintos para repouso, **IH**, **ON**, **M fechado** e **I aberto**. O SVG com uma boca desenhada por cima do rosto foi retirado para evitar a aparência de “bolinha branca e traço”. Tanto MI 1 quanto MI 2 acionam a mesma articulação: M fechado → I aberto, sem mexer no áudio. Os visemas continuam agendados pelo relógio de Web Audio junto dos disparos da voz, tanto manuais quanto no beat. O estado volta a repouso quando a nota termina ou quando o transporte é parado.

**Todos os nove presets do catálogo agora garantem o par MI 1 → MI 2 com distância de exatamente uma semicolcheia** (passos vizinhos da grade de 16). O próprio aplicador de presets reforça essa regra para evitar variações inconsistentes nos próximos presets; a duração padrão é de um passo. O usuário continua livre para modificar o padrão depois, inclusive separar os MIs manualmente. Mudanças de BPM alteram a duração temporal entre os dois disparos, mas não sua distância de um passo. Padrões já salvos no navegador só recebem a nova disposição ao escolher novamente uma levada do catálogo, para não sobrescrever composições próprias.

Testes automatizados confirmaram todos os pares do catálogo, estados de boca e renderização de quadros distintos num avatar de 112 px no Chromium. A verificação final de percepção e compatibilidade de áudio/vídeo em um iPhone físico continua pendente.

## Regra permanente das levadas (22/11/2026)

A escolha de gênero no catálogo altera **somente as pistas de bateria (4, 5, 6): bumbo, caixa e prato**. As quatro pistas vocais **IH, ON, MI 1, MI 2** não são apagadas, reprogramadas ou alongadas ao selecionar samba, funk, hip-hop, pop, rock, house, reggae, bossa ou MIMI clássico. Qualquer edição manual de posição ou duração vocal continua preservada entre mudanças de gênero, inclusive durante a reprodução.

Uma criação nova recebe a célula-base de 16 semicolcheias: IH nos passos 1 e 9, ON nos passos 5 e 13, MI 1 nos passos 7 e 15, MI 2 nos passos 8 e 16 (numeração humana 1–16). Assim cada par de MIs é consecutivo por uma semicolcheia. O BPM e a seleção de acordes continuam independentes.

As levadas tradicionais aqui são estilizações simplificadas para três instrumentos de bateria, não transcrições históricas exatas. O catálogo descreve diferenças rítmicas na bateria, mantendo o vocal estável.

## Motivo vocal do tempo 3 (atualização de 22/11/2026)

A primeira metade do compasso continua com IH no passo 1, ON no passo 5, MI 1 no passo 7 e MI 2 no passo 8. A partir do **terceiro tempo**, a mesma ideia retorna: **IH no passo 9, ON no passo 11 (tempo 3&), MI 1 no passo 15 e MI 2 no passo 16**. Os dois MIs são consecutivos na resolução de semicolcheia.

Para instalações que já tinham o sequenciador salvo, há uma migração única que reorganiza **somente as quatro pistas vocais na segunda metade**, preservando integralmente a primeira metade e as três pistas de bateria. As modificações vocais feitas depois dessa atualização continuam editáveis e não são sobrescritas ao selecionar outro gênero. O catálogo segue alterando somente bumbo, caixa e prato.

**Correção pela imagem IMG_6290:** o ON do segundo grupo está no passo 11 (posição interna 10), e não no passo 13. A migração desta correção só modifica a pista ON: remove o evento antigo do passo 13 e garante o do passo 11; preserva IH, MI 1, MI 2, primeira metade e bateria.

## MIX POP — EQ, reverb, compressão e panorama (22/11/2026)

O aplicativo agora dispõe de uma mesa **MIX POP**, recolhida por padrão logo depois de IH/ON/MI/MI. Ela foi criada pensando em reprodução em caixa de som e preserva o banco de vozes e todas as programações do beat. Os efeitos são de **reprodução ao vivo no navegador**; o original permanece intacto.

**Cadeia por sílaba:** quatro canais independentes (IH, ON, MI 1, MI 2), cada um com correção automática conservadora de volume calculada do RMS das 32 tomadas (fator limitado a 0,76–1,34), trim manual de voz, pan discreto próximo ao centro, passa-altas de 95–120 Hz, corte de médio-graves em torno de 380 Hz, presença em 3 kHz, pequena redução acima de 6,9 kHz e compressor próprio. Os parâmetros padrão do compressor equivalem a aproximadamente -22,2 dB de threshold, 3,75:1, ataque de 10 ms e release de 135 ms. O EQ e a compressão têm ajustes globais rápidos na mesa, e cada voz tem um trim opcional.

**Reverb:** reverberação curta de cerca de 1,05 s por convolução, com pré-delay de 19 ms e retorno filtrado (430 Hz–5,6 kHz), compartilhada pelas vozes sem repetir as consoantes. O valor padrão é discreto; seu controle não altera a altura das notas.

**Imagem e saída:** a voz principal recebe pan sutil próximo do centro (para compatibilidade mono); as harmonias recebem abertura estéreo moderada. Bateria, acordes e PAD chegam a um mesmo barramento de mixagem, com compressor rápido no master para controlar picos. Isso **não** constitui masterização final com loudness/true peak medidos; os valores são um ponto de partida conservador que precisa de avaliação auditiva em caixa de som real.

A mesa inclui Presença/EQ, Compressão, Reverb, Abertura/PAN e trims de IH/ON/MI 1/MI 2, botão Restaurar mix pop e persistência no armazenamento local do navegador. Não há novos interruptores de pitch.

## Caixa pop com mais corpo e mesa invisível (22/11/2026)

Atendendo ao pedido de simplificação, a seção visual **MIX POP** foi completamente removida do aplicativo. Os filtros de EQ, compressores independentes, ajustes de panorama, reverb, trims por sílaba e compressor de saída **permanecem ativos internamente**, e os valores anteriores guardados no navegador são restaurados como antes. Não há sliders de mixagem novos na tela.

A caixa padrão agora usa o arquivo original `assets/caixa-pop-encorpada.wav`, um one-shot de 390 ms/44,1 kHz mono criado para esta versão, combinando ataque estalado, corpo de membrana na região de aproximadamente 170–310 Hz e esteira com decaimento curto e reflexões iniciais. O áudio é pré-carregado e disparado por AudioBufferSourceNode para cada hit do beat. O timbre padrão passou de "Macia" para **"Pop encorpada"**, com reforços suaves em 195 Hz e 2,65 kHz. "Estalada" também aproveita a amostra com EQ mais incisivo; "Aro" mantém seu som diferenciado. Se a amostra não carregar, há um som alternativo com reforço de corpo.

O one-shot é roteado ao barramento de bateria e pelo compressor de proteção do master, evitando bypass da mixagem aprovada. O volume geral de bateria continua independente. O padrão fixo IH (1,11), ON (5,13), MI 1 (7), MI 2 (8), os BPMs e o catálogo de gêneros não foram alterados.

Esta é uma atualização de timbre e níveis de reprodução, não uma masterização final validada em caixa de som real.

## Groove por gênero: caixa, bumbo e prato (22/11/2026)

O BEAT agora aplica nove perfis **internos** de bateria (MIMI clássico, samba, funk carioca, hip-hop, pop, rock, house, reggae e bossa nova) sem abrir controles de mixagem. O mesmo sample `caixa-pop-encorpada.wav` continua sendo a base, mas recebe EQ e compressão específicos em cada ritmo: passa-altas e low-pass, ajustes de corpo em 195 Hz, definição em 2,65 kHz, cauda entre 120 e 340 ms, envelopes curtos e compressão transitória de aproximadamente 2,3:1. Bumbo e prato recebem variações de volume/acento e pequenos deslocamentos de timing **determinísticos**, sem alterar o BPM.

- **MIMI clássico:** caixa pop equilibrada; bumbo e prato neutros.
- **Samba:** caixa curta, brilhante e com ataques fantasmas menos fortes; maior subdivisão e articulação no prato.
- **Funk carioca:** caixa contundente e grave-médio presente; bumbo forte e prato sincopado.
- **Hip-hop:** caixa mais cheia, escura e um pouco atrasada (14 ms); bumbo pesado e chimbal discreto.
- **Pop:** caixa seca, definida e controlada.
- **Rock:** maior sustentação e ataque da caixa, com bumbo firme.
- **House:** caixa curta e estalada; bumbo em quatro tempos e prato destacado nos contratempos.
- **Reggae:** caixa mais quente e ligeiramente atrasada; prato mais suave.
- **Bossa nova:** caixa curta, leve e filtrada, com eventos fracos menos intensos e percussão de apoio discreta.

Esses perfis são **interpretações estilizadas** sobre os sete canais existentes, não transcrições fielmente representativas de todas as variantes desses gêneros. Todos usam as mesmas posições programadas na grade (nenhuma nota nova é criada automaticamente além do preset já selecionado). A voz IH/ON/MI/MI permanece nos passos **IH 1 e 11, ON 5 e 13, MI 1 7 e MI 2 8**, reaplicados quando se troca de gênero. A mixagem vocal aprovada, o pad e os valores salvos do master não foram alterados.

O código foi testado com nove perfis distintos e agendamento realista de eventos Web Audio; a percepção do groove, especialmente em caixas Bluetooth e Safari iOS, ainda requer escuta auditiva.

## Sequenciador único restaurado (23/11/2026)

A pedido do usuário, as variações **A/B** e as **viradas automáticas** foram retiradas da interface e do agendamento. Voltou o **montador original de 16 passos**, com um único conjunto de pistas de voz e bateria, edição por toque e BPM manual. O catálogo de nove gêneros e os tratamentos sonoros de caixa, bumbo e prato continuam presentes. A cadeia de mixagem pop não foi alterada.

Em navegadores que salvaram dados no formato antigo de A/B, o carregamento usa a grade de bateria **A** como ponto de partida, preservando as notas vocais e outros ajustes. Não são mostrados controles de A/B nem opções de virada.

## Nove kits sonoros específicos por gênero (23/11/2026)

A troca de estilo no catálogo agora seleciona automaticamente um **kit de áudio próprio**, não apenas uma regulagem do sample pop. Há **27 one-shots originais sintetizados** (bumbo, caixa e percussão aguda para cada um dos nove gêneros), armazenados em um único arquivo PCM WAV mono, 32 kHz e 16 bits:

`assets/kits/mimi-kits-9x3-v1.wav` — duração total 12,69 s, 27 células consecutivas de 470 ms (ordem de gêneros: mimi, samba, funk, hiphop, pop, rock, house, reggae, bossa; ordem de instrumentos por gênero: kick, snare, hat). O player usa `AudioBufferSourceNode.start(at,offset,duration)` e carrega o banco com `decodeAudioData` apenas uma vez. Caso o banco ainda não esteja disponível, a bateria anterior funciona como reserva.

Direção sonora dos kits: MIMI clássico (limpo e equilibrado), samba (surdo/caixa curta/percussão brilhante), funk carioca (kick marcado, caixa com ataque de clap e shaker), hip-hop (bumbo subgrave, caixa escura e prato empoeirado), pop (kick e caixa definidos, hi-hat nítido), rock (caixa mais aberta e prato brilhante), house (kick eletrônico, clap e prato mais longo), reggae (bumbo abafado, aro/caixa seca e prato suave) e bossa nova (baixo suave, caixa tipo rim/brush e shaker). Essas sonoridades são **sínteses estilizadas**, não gravações acústicas autênticas nem amostras licenciadas de terceiros.

As variações de dinâmica e microtiming dos nove gêneros continuam ativas, e todos os eventos passam pelo barramento de bateria e pela proteção de picos do master. O sample anterior `caixa-pop-encorpada.wav` e os antigos sintetizadores permanecem como fallback. Na seleção antiga da caixa, a opção padrão aparece agora como **Kit do gênero**; variantes manuais de aro, seco, madeira etc. atuam como colorações sem quebrar a seleção automática.

**Não houve mudanças** na grade única de 16 passos, no padrão fixo IH (passos 1,11), ON (5,13), MI 1 (7), MI 2 (8), no BPM manual, nas harmonias ou na mixagem vocal. Não foram adicionados novos controles à interface. A correspondência dos 27 offsets foi testada por simulação de Web Audio; escuta em caixa de som real/iOS ainda é uma etapa de avaliação artística.

## Humanização timbrística automática dos oito gêneros (23/11/2026)

A bateria passa a ter **três articulações sonoras por peça** — `accent` (forte), `normal` (média) e `ghost` (leve) — para bumbo, caixa e prato. Essas articulações não são apenas variações do controle de volume: o navegador **pré-renderiza buffers distintos de áudio** para cada combinação de kit, instrumento e articulação, a partir dos one-shots originais de `assets/kits/mimi-kits-9x3-v1.wav`. São 81 buffers em memória contando o kit MIMI legado interno (9 × 3 × 3), dos quais 72 correspondem aos oito estilos visíveis.

- **Acento:** ataque mais nítido, espectro com mais presença e cauda preservada.
- **Médio:** ataque atenuado, corpo mais arredondado, sustentação moderada.
- **Ghost:** execução curta e mais filtrada; nas caixas, parte da textura vem do sample interno de aro (reggae), distinguindo a articulação de uma simples redução de volume. O bumbo leve perde parte do subgrave e o prato leve tem decaimento menor.

A escolha de articulação depende da **posição rítmica e do gênero**: caixa em contratempos síncopados do samba, aro/escovinha mais leve na bossa, dinâmica dos bumbos secundários e alternância entre toques fortes e fracos dos pratos. Há um ciclo determinístico de quatro compassos com pequenas variações de velocidade e microtiming controlado; não são criadas notas novas, não se altera a grade, e nenhum elemento depende de sorteios aleatórios.

**Preservado:** IH/ON/MI/MI com suas notas e durações, seleção harmônica, MIDI/piano roll de 16 passos, mixagem pop interna aprovada, BPM, oito estilos, ausência do A/B e ausência de mixadores extras. Se os buffers humanizados não puderem ser preparados, o banco anterior permanece como fallback.

**Testes concluídos:** sintaxe JavaScript; renderização simulada de 81 buffers distintos; três variantes com ataque/espectro/duração diferentes; 144 acionamentos simulados pelo motor Web Audio, cobrindo oito gêneros, três instrumentos e acentos distintos. A avaliação de naturalidade no Safari/iPhone e na caixa de som continua sendo uma verificação auditiva, não certificada por esses testes.

## PAD harmônico por gênero — apenas liga/desliga (23/11/2026)

O acompanhamento de sexta mantém em **todos os oito gêneros** o voicing fixo `6–3–5` da mão direita, sem introduzir fundamental, notas extras ou mudança de oitava. Ex.: E6 = Dó♯–Sol♯–Si. No Hub, o antigo painel visual de parâmetros/presets do PAD foi escondido; o único controle visível é o checkbox **PAD ligado**, junto aos botões IH–ON–MI–MI. Os IDs e valores legados internos foram mantidos para compatibilidade com projetos salvos, mas a síntese passa a ser comandada automaticamente pelo gênero; o disparo acompanha IH.

A implementação utiliza osciladores, envelopes, filtros e convolução Web Audio (síntese original no navegador, sem alegar samples acústicos reais). Os estilos são: **samba** (teclado acústico estilizado, percussivo e curto), **funk carioca** (synth percussivo filtrado), **hip-hop** (Rhodes lo-fi macio e longo), **pop** (synth pad com ataque gradual), **rock** (órgão elétrico discreto), **house** (synth brilhante com dois ataques ritmicamente sincronizados ao BPM), **reggae** (órgão bubble em dois contratempos curtos) e **bossa nova** (piano elétrico delicado).

A voz original continua na frente: o PAD é roteado ao barramento de instrumentos já existente, com ganho conservador, envelope por gênero, reverberação filtrada e limite de até cinco grupos simultâneos. O BPM só governa a distância entre os ataques duplicados de house/reggae, **nunca** a altura da nota nem a reprodução do sample vocal. A troca de gênero em reprodução aplica o próximo timbre automaticamente; não interrompe o sequenciador.

Teste de integração: sintaxe do JavaScript validada, 8 configurações verificadas, notas E6 `[61,68,71]` confirmadas, 9 osciladores por ataque simples ou 18 em house/reggae, e verificação do encerramento completo dos osciladores. A qualidade final do timbre requer escuta no Safari/iPhone e na caixa de som.

## Correção de audibilidade dos PADs por gênero (23/11/2026)

A primeira síntese por gênero saiu com nível demasiadamente baixo: o ganho dos osciladores continha `Math.pow(.24,1.55)`, além de reduções em envelope, retorno direto, ônibus de instrumentos e master. A atualização de audibilidade remove a atenuação exponencial desnecessária, eleva de maneira conservadora o nível de entrada do PAD e preserva a proteção contra picos no master. A diferença nominal antes dos barramentos externos é de aproximadamente **+23,3 dB**; isso é uma comparação das constantes de ganho, não uma medição de loudness percebido.

Sem acrescentar nenhum botão, ativar **PAD ligado** agora reproduz imediatamente uma demonstração curta do acorde 6–3–5. Escolher outro gênero com o BEAT parado também apresenta o timbre respectivo (quando o PAD estiver ligado). O preview ignora apenas os deslocamentos rítmicos especiais para ter som imediato, enquanto a execução normal do reggae e house continua sincronizada aos contratempos definidos para cada gênero. As notas, os kits de bateria, o beat, as gravações vocais e o MIDI não foram alterados. O volume dos PADs é fixado internamente: não foi reintroduzido o painel de mixagem.

Verificação: 16 combinações de disparo em simulação de Web Audio (oito gêneros × automático/preview) conferiram quantidades de osciladores, três notas do voicing, envelopes com ganho não nulo, e ataques imediatos na escuta de confirmação. Ainda é necessária escuta na caixa de som real/Safari.

## Baixo inteligente integrado ao PAD (23/11/2026)

O único checkbox de acompanhamento passa a se chamar **PAD + BAIXO**: ao desativá-lo, tanto o teclado quanto o baixo deixam de tocar. Não foi acrescentada pista, painel de mixagem, slider ou efeito vocal.

- **Harmonia:** o PAD mantém 6–3–5, e o baixo usa exclusivamente a **fundamental (1)** e a **quinta justa (5)** no registro grave. Ex.: E6 -> baixo Mi2 (MIDI 40) e Si2 (MIDI 47); a progressão cromática segue os nove acordes E6 até G#6. A troca de tom é aplicada às próximas notas durante o BEAT, sem reiniciar a bateria nem alterar a voz.
- **Estilos:** samba (baixo sincopado de ataque redondo), funk carioca (subgrave curto e acentuado), hip-hop (baixo profundo com sustentação), pop (synth-bass definido), rock (baixo de ataque mais incisivo), house (subgrave pulsante), reggae (notas longas e espaçadas) e bossa (baixo delicado, alternando 1 e 5). São **sínteses estilizadas no Web Audio**, não samples gravados de instrumentos reais.
- **Groove:** as entradas do baixo normalmente seguem as casas programadas de bumbo; o reggae e a bossa também podem criar pequenas respostas harmônicas complementares. Ao editar ou trocar o gênero, o baixo se reajusta sem modificar a grade de 16 passos.
- **Mixagem:** passa-altas ~31 Hz, low-pass ~1,7 kHz, compressão interna e duas camadas harmônicas para audibilidade em alto-falantes pequenos. Um ducker automático reduz brevemente o volume do baixo nos ataques do bumbo, com recuperação própria do gênero (house mais acentuado). Os instrumentos seguem pelo barramento de master e seu controle de picos já existente.
- **Audição imediata:** ligar o PAD ou escolher um gênero com o beat parado agora apresenta o acorde 6–3–5 e uma curta sequência de baixo **1→5**. Tocar um IH individualmente com o BEAT parado também apresenta o baixo. O STOP, a troca de tom e o desligamento do PAD encerram o baixo sem deixar notas pendentes.

O seletor do gênero e os parâmetros do BPM continuam como antes, sem A/B, viradas ou controles extras. Testes de código confirmaram oito gêneros com linhas de baixo, transposições para os nove acordes, a quinta a sete semitons da fundamental, o roteamento ao master, a articulação/sidechain e o desligamento. O balanço final depende de escuta real no Safari/iPhone e na caixa de som.

## Texturas vocais por sílaba, automáticas e sem pitching (23/11/2026)

As quatro vozes originais passam a ter **camadas paralelas discretas**, derivadas do próprio sample original de cada sílaba, processadas inteiramente no Web Audio, sem gerar nenhuma voz nova, repetir consoantes, inserir notas ou modificar a afinação natural:
- **IH:** dobramento muito macio, filtrado (passa-altas 420 Hz e passa-baixas 4,7 kHz), atrasado apenas 19 ms, com abertura lateral sutil (-0,16) e nível de send moderado. Não é uma segunda pronúncia de IH.
- **ON:** calor na região grave-média, com filtro de 110 Hz–1,72 kHz, saturação suave em onda (tanh) e um pequeno componente paralelo centralizado. Não é um novo ON.
- **MI 1:** reforço de ataque durante no máximo 62 ms, com filtro de 340 Hz–5,3 kHz e presença discreta na região de 1,05 kHz.
- **MI 2:** reforço ainda mais curto durante no máximo 57 ms, com filtro de 390 Hz–5 kHz e presença em 1,25 kHz.

O caminho principal de áudio permanece **intacto**: o tratamento é uma derivação do mesmo `AudioBufferSourceNode`, sem qualquer alteração no playbackRate. O sinal paralelo é misturado no barramento vocal já existente, antes da proteção do master, sem duplicar reverb geral nem aumentar o volume principal.

No **piano roll**, o efeito só é disparado com o ataque original da nota principal. Se o usuário alongar um MI, os grãos de sustentação da vogal não recebem outro ataque de M: portanto, não criam o efeito `MIMIMIMIMI`. As harmonias opcionais de terça etc. não recebem essas camadas de textura, evitando embolar a inteligibilidade. No botão de **frase completa**, o áudio original permanece contínuo e pequenas camadas são colocadas nos momentos de cada sílaba, sem recortar nem rearticular a frase.

**Interface:** nenhum novo seletor, controle ou painel. Todos os gêneros, o PAD, o baixo independente, o BPM e a mixagem pop anterior continuam como estavam.

**Validação técnica:** verificação da sintaxe do JS; nós Web Audio usados por cada perfil (delay apenas em IH; saturação apenas em ON); 12 cenários de disparo (quatro sílabas em nota curta, nota longa e harmonia), incluindo apenas um disparo de textura mesmo quando há dezenas de grãos no prolongamento. Qualidade auditiva final e compatibilidade com Safari iOS ainda requerem escuta real.

## Correção suave da afinação da VOZ humana original 149 (23/11/2026)

O usuário observou que a **voz original IH–ON–MI–MI** apresentava desafinações em relação à nota instrumental discreta que a dobra. A análise da gravação original `Nova Gravação 149.m4a` (16,96 s, 8 tomadas) confirmou, por exemplo, que em E6 o **IH** tinha fundamental predominante perto de 554 Hz (Dó♯5), embora o objetivo fosse 659 Hz (Mi5), e o **MI 1** perto de 538 Hz (Dó5), contra o objetivo de 622 Hz (Ré♯5). Portanto, reforçar o senoide instrumental não afinaria a fonte humana.

O navegador agora aplica a **correção PSOLA somente à parte vocálica da própria voz original**, antes do sampler tocar. Os trechos de ataque e a consoante M continuam originais; a duração e o número de sílabas são mantidos. O algoritmo usa centros de pulsos detectados no sinal filtrado, reposicionamento temporal suave e crossfade nas bordas, preservando aproximadamente o timbre/formantes e um pouco da variação humana de altura. A nova camada de texturas (IH dobrado, ON quente, MI percussivo) se aplica ao resultado corrigido.

**Segurança sonora:** o áudio 149 original é preservado na memória como `originalVoiceBuffer`; a correção é criada separadamente como `voiceBuffer` sem reescrever o arquivo. A calibração medida só é aplicada quando o arquivo corresponde ao tamanho conhecido da gravação 149 (151.567 bytes), para não afinar um arquivo de outra gravação usando medições indevidas. A nota instrumental de referência `exactTone`, os pads, a bateria e o baixo são preservados sem alteração.

No **ON**, cuja fundamental é baixa e pouco estável nas gravações, a correção só atua se for moderada, escolhendo a mesma classe de altura na oitava natural da voz, em vez de forçar mecanicamente um salto de oitava. Algumas tomadas de ON não são corrigidas. Para obter todos os ON precisamente na oitava E4–A3 originalmente especificada, ainda pode ser necessária outra tomada cantada ou um processamento vocal especializado.

**Testes:** a reprodução do buffer corrigido foi validada por processamento equivalente em Python sobre a gravação original: 24 trechos efetivamente processados, com desvio mediano pós-correção em torno de 0,02 semitom nas notas com altura estável. Teste de JavaScript/Web Audio confirmou que o ataque original é preservado, o sinal da vogal muda e o motor compila. Ainda é indispensável ouvir no iPhone e na caixa de som para avaliar os artefatos de mudança de altura, especialmente quando a correção ultrapassa dois semitons.

Sem novos controles visíveis, sem mudanças de BPM, padrão rítmico ou acompanhamento instrumental.

## Reversão da afinação vocal (23/11/2026)

Por solicitação do usuário, a correção automática PSOLA das vogais foi **totalmente desfeita**. A gravação **voz-original-149.m4a** voltou a tocar sem alteração de pitch (salvo transposições já existentes para casos fora das tomadas). A seção anterior sobre PSOLA registra uma tentativa histórica e **não corresponde à versão atual**. Texturas vocais, mixagem, grooves, kits, PAD e baixo foram preservados.
