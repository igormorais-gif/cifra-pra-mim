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
