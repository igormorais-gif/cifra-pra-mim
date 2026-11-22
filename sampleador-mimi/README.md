# SAMPLEADOR MIMI — Nilo | BEAT & Aceleramento

Brinquedo musical interativo com a voz real da gravação 149, bateria programável e rampa de andamento. A gravação contém oito execuções de **IH – ON – MI – MI**. Cada uma é tratada como quatro sílabas tocáveis independentemente, com recorte e fades suaves, ou como frase completa. O áudio original (`assets/voz-original-149.m4a`) permanece intacto.

## Como brincar no Hub

1. **Escolher o tom** na fileira de botões E6, Eb6, D6, Db6, C6, B6, Bb6, A6 e G#6. O último é derivado da oitava tomada por transposição, não uma nona gravação.
2. **Montar o beat** na grade de **16 passos (semicolcheias) e 7 pistas**: IH, ON, MI 1, MI 2, bumbo, caixa e prato. Cada quadradinho corresponde a uma semicolcheia do 4/4. Na bateria, toque para ligar/desligar. Na voz, selecionar um tom e tocar a célula grava aquele tom; tocar uma célula ativa no mesmo tom a desliga; selecionando outro tom, tocar novamente muda a altura sem apagar.
3. **Acelerar**: escolha BPM inicial, BPM final e quantidade de compassos (2, 4, 8, 16 ou 32). A progressão do tempo é gradual, calculada passo a passo pelo relógio do Web Audio. Ao atingir a meta, mantém o BPM final até parar. Desmarcar “Aceleramento ligado” produz tempo constante.
4. **Padrão MIMI**, **Síncope!** e **Limpar grade** criam ou resetam padrões. O arranjo e os parâmetros ficam salvos localmente no navegador quando disponível.
5. **Voz curtinha** encurta os samples para reduzir sobreposição nas velocidades altas **sem mudar a afinação**. Sem essa opção, as sílabas têm a duração natural do recorte. Há swing, mistura de volumes e acorde opcional de sexta no início de cada compasso.

A frase manual e os pads IH–ON–MI–MI continuam funcionando independentemente do sequenciador. O botão **PARAR TUDO** interrompe os samples vocais e desativa o beat.

## Publicação no GitHub Pages

Local: `sampleador-mimi/` no projeto `igormorais-gif/cifra-pra-mim`.
Endereço: `https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/`.

A gravação deve estar junto em `assets/voz-original-149.m4a` para tocar automaticamente. Se o arquivo não carregar, a interface permite importar a gravação original e guardá-la localmente via IndexedDB, se o navegador permitir.

A variante `SAMPLEADOR-MIMI-AUTONOMO.html` incorpora o áudio em base64 no HTML e pode funcionar sem internet em navegadores que permitam abrir arquivos locais.

## Técnica musical

- 16 passos por compasso, grade 4/4, síncope e swing de semicolcheias.
- A rampa interpola BPM em cada passo e conserva o tempo absoluto de eventos de áudio, evitando *drift* causado por `setInterval` como relógio musical.
- A velocidade da grade **não modifica a velocidade de leitura das sílabas**, preservando seu tom; a opção “Voz curtinha” limita apenas sua duração.
- Os rótulos de acorde (E6 etc.) representam intenção musical; não são uma certificação de afinação absoluta da voz. G#6 é transposição digital da oitava tomada e pode alterar sua altura/timbre.
- Cada sílaba conserva as pequenas diferenças naturais da voz original; não há voz sintetizada por IA.

## Privacidade

Ao publicar `assets/voz-original-149.m4a` num repositório/Pages público, a gravação da criança poderá ser ouvida e baixada por qualquer pessoa. O aplicativo não faz upload da gravação escolhida pelo usuário, mas o arquivo distribuído com o site é público.