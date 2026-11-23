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
