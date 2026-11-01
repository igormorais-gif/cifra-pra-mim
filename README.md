## Partitura do Laboratório de Improvisação — critérios Larry Monroe (v12)

**Fonte primária:** arquivo enviado pelo usuário, Larry Monroe, *Workbook for Ear Training 1* (Berklee College of Music), **páginas 2–7 do PDF** / páginas impressas 1–6, **Lesson One**. O material é digitalização; as regras foram lidas nas páginas escaneadas, não inferidas por OCR.

**Aplicação das regras observadas:**
- Página 2: valores claros de notas e pausas — semínima, colcheia e semicolcheia com figuras distintas.
- Página 3: ponto de aumento somando metade do valor e ligadura entre notas da mesma altura, mantendo um único ataque.
- Página 4: fórmula **4/4** com quatro pulsações de semínima.
- Página 5 (*Beam* / *Imaginary Bar Line*): barras entre notas curtas consecutivas e respeito à divisão imaginária do 4/4 entre tempos 2 e 3; a divisão é editorial, não se deve colocar falsa barra real na pauta.
- Página 6: em sequências com semicolcheias, cada tempo permanece legível; barras não cruzam a unidade do tempo; pausas não atravessam os limites imaginários (exceto pausa de compasso inteiro). No gerador, adotamos a convenção conservadora de não atravessar nenhum tempo por barras e de dividir prolongamentos com ligaduras, sem alterar a duração real.
- Página 7: tempos **1** (apoio principal) e **3** (apoio secundário) são diferenciados discretamente nos números acima da pauta, enquanto 2 e 4 permanecem visualmente neutros. Isto não acrescenta acentos no áudio.

**Implementação:** `src/rhythm-notation.js` monta a pauta SVG a partir dos 16 ticks do áudio; separa silêncios e prolongamentos conforme as fronteiras de pulsação, agrupa colcheias/semicolcheias contíguas com barras primárias e secundárias, desenha bandeirolas apenas em notas isoladas, preserva pontos, acidentes e linhas suplementares, e mostra os tempos 1–4. As hastes em grupos de alturas distintas se ligam à mesma barra. Não há notas novas nem deslocamentos de ataque.

**Apresentação:** a pauta possui dois modos (melódico/rítmico) e duas escalas no celular: **Leitura ampliada** preserva o tamanho da notação com rolagem horizontal; **Ver compasso inteiro** mostra toda a pauta reduzida para orientação geral. Um painel recolhível apresenta os critérios. A grade do O Passo (`1 i e i`) permanece completamente visível e serve como referência posicional complementar. **Não confundir** a grade de semicolcheias com a escrita convencional da pauta.

**Testes:** `tests/rhythm-notation.test.cjs` verifica correspondência com 12 ritmos, agrupamento dentro dos tempos, visibilidade da separação 2|3, pausas, ligaduras, ponto, semicolcheias e acidentes; os demais testes validam 672 configurações modais e os controles móveis. A audição e a legibilidade em Safari/iPhone ainda dependem da revisão visual no dispositivo.

## Laboratório de Improvisação — interface móvel (v11)

O iPhone agora exibe a **grade rítmica inteira** (16 semicolcheias, `1 i e i | 2 i e i | 3 i e i | 4 i e i`) dentro da largura disponível, sem rolagem lateral na grade. A página preserva os ataques em seus ticks originais e as quatro divisões de tempo. Etiquetas de notas muito curtas permanecem acessíveis nos chips logo abaixo da grade. A partitura tradicional continua com rolagem própria para preservar legibilidade.

**Player flutuante:** em telas de até 740 px, a barra de reprodução torna-se fixa no rodapé com os controles Ouvir, Comparar, Parar, Loop e andamento/BPM. Só os controles essenciais ficam fixos; o metrônomo detalhado e o teste auditivo continuam no corpo da seção para evitar que a barra cubra os exercícios. A legenda flutuante mostra o nome da célula e BPM selecionados. O botão Loop expõe o mesmo `aria-pressed` de antes, com rótulo compacto no celular; não existe um segundo estado de Loop. O rodapé reserva espaço extra, inclusive `safe-area-inset-bottom` para a interface iOS. Desktop mantém player completo na posição original.

Trocar modo, registro, percurso ou célula ainda **interrompe a reprodução anterior** para evitar a sobreposição indevida de frases; o player continua ao alcance do dedo para ouvir a escolha atual sem voltar ao ponto original da página. A programação temporal do Loop contínuo não foi alterada.

Validação: `tests/improv-mobile-layout.test.cjs` verifica largura, responsividade, controles e espaçamento da barra; a simulação da interface verificou que a legenda acompanha seleção e BPM e que o Loop ligado/desligado altera o mesmo controle. O layout visual real no Safari/iPhone ainda requer conferência.

## Laboratório de Improvisação — eixos melódicos (versão 9)

O Laboratório combina **12 células rítmicas originais** em 4/4 (mesmos 16 ticks em áudio, grade e pauta) com uma coleção modal em Dó, uma disposição fechada de quatro vozes e um percurso ordenado de quatro graus. O material é gerado programaticamente em `src/melodic-axis.js`; nenhum lick de terceiros foi incorporado.

**Visualização didática de registro versus ordem (v9.1):** os seletores passaram a se chamar **Registro das quatro notas** e **Ordem melódica**. O primeiro desenha quatro alturas em sequência grave→agudo (independentemente de qual será o primeiro ataque); o segundo desenha a ordem real de execução, com ordinal e altura/oitava. Exemplo em Dó dórico, percurso 7–3–1–5: registro 1–3–5–7 → Si♭4, Mi♭4, Dó4, Sol4; registro 5–7–1–3 → Si♭4, Mi♭5, Dó5, Sol4. O ritmo permanece intacto. Esta distinção usa visualização para ensinar que a inversão define o conjunto de alturas e o percurso define como a melodia atravessa esse conjunto.

**Eixos ativos:**
- **Modo:** jônico, dórico, frígio, lídio, mixolídio, eólio ou lócrio, todos com Dó como centro. A coleção completa de sete graus é mostrada para contextualização.
- **Disposição fechada:** quatro conjuntos de alturas da tétrade (posição fundamental e três inversões), com oitavas reais independentes da ordem tocada.
- **Percurso:** as 24 permutações únicas dos graus estruturais 1–3–5–7 (seis ordens iniciadas em cada um dos quatro graus). Cada percurso pode ser percorrido por botões, sorteio ou seletor acessível no iPhone. São **24 × 4 = 96 configurações por modo**, ou **672 configurações rotuladas** entre os sete modos antes de combinar ritmos e ornamentos.
- **Ritmo:** cada uma das 12 células continua independente dos demais parâmetros, sem alterar ticks, pausas ou durações.
- **Partitura e Loop:** a posição na pauta, acidentes (♭), notas/oitavas e etiquetas acompanham o som; a contagem d’O Passo (`1 i e i`) e o agendamento contínuo via `src/seamless-loop.js` são preservados.

**Rigor modal:** este eixo toca **somente os graus 1, 3, 5 e 7 da coleção**. Logo, jônico e lídio compartilham a mesma tétrade; dórico, frígio e eólio compartilham outra. O modo não fica plenamente caracterizado pelo áudio até incorporarmos também graus 2, 4 e 6, ou os seus equivalentes alterados, em passos didáticos futuros. As quatro inversões alteram registro e saltos, mas não a identidade das notas. Não declarar 672 sonoridades únicas: há configurações diferentes com alturas idênticas entre modos.

**Próximo eixo ainda não implementado:** embelezamentos sobre notas-alvo, com regras específicas de aproximação/bordadura, ataques extras e correspondência explícita na partitura, sem corromper as células rítmicas originais.

Cobertura: `tests/melodic-axis.test.cjs` examina as 672 combinações, a nomenclatura dos modos, os 96 percursos distintos de cada modo, a posição real na partitura e a independência rítmica.

## Regra geral dos players — Loop contínuo (versão 8)

Todos os laboratórios com reprodução de áudio compartilham o botão **↻ Loop: desligado / ↻ Loop: ligado**. O controle começa desligado e é acessível por toque, teclado e `aria-pressed`. Quando ligado, **a reprodução escolhida** (arpejo, acorde, sequência, conexões ou célula) reinicia automaticamente ao chegar ao fim. Quando desligado durante a reprodução, a passagem atual termina sem recomeçar. **■ Parar** cancela o ciclo e os próximos ataques programados, sem apagar a preferência de Loop. Trocar o exercício, a forma, o instrumento ou a seleção interrompe a reprodução anterior, evitando tocar frases de dois exercícios ao mesmo tempo.

**Correção de fluidez (v8):** na implementação inicial, o reinício das frases dependia de esperas assíncronas de 130–390 ms e/ou de temporizadores com margem extra, causando a sensação de que cada volta parava para começar de novo. Agora os sete players usam o mesmo sequenciador `src/seamless-loop.js` com o relógio `AudioContext.currentTime`: cada ataque e cada primeira nota do próximo ciclo são posicionados antecipadamente numa linha de tempo contínua, sem acrescentar pausa na borda da volta. A interface visual pode usar temporizadores apenas para destacar notas e etapas; eles não determinam o instante de início do áudio. O ciclo preserva o BPM, as figuras e o decaimento natural das notas. Pausas que pertencem à própria célula rítmica continuam existindo, mas não há pausa artificial entre duas voltas. No Laboratório de Improvisação, a comparação de células também deixou de inserir o antigo tempo de espera. O Loop desligado termina a passagem atual; o botão Parar cancela próximas notas agendadas, inclusive em sequências.

Os módulos contemplados são:
- `laboratorio-cavaquinho/` — arpejo atual ou sequência;
- `laboratorio-violao/` — arpejo atual ou sequência de acordes;
- `laboratorio-violao/jogo-4321/` — voicing atual ou percurso;
- `laboratorio-piano/` — acorde, M.E. → M.D. ou sequência;
- `laboratorio-embelezamento/` — sequência com aproximações, apresentação com tríade ou conexões; os dois players usam a mesma preferência de Loop;
- `laboratorio-improviso/` — célula selecionada, comparação da família visível ou metrônomo isolado;
- `laboratorio.html` — demonstração anterior, agora com Loop e Parar.

A repetição respeita o BPM e a ordem de notas existentes e não modifica o material harmônico. Nos laboratórios modernos, os ciclos usam o token de reprodução para evitar reinício após Parar ou troca de contexto. Nos players com Web Audio que programam muitas notas de uma vez, o próximo ciclo só é agendado ao terminar o anterior, evitando programar loops indefinidos antecipadamente. O som em decaimento do último ataque pode terminar naturalmente após Parar, mas novos ataques não são iniciados. O player fixo do celular foi reorganizado para incluir o botão sem esconder o andamento.

Os testes incluem `tests/loop-controls.test.cjs` e os testes específicos de cada laboratório. A implementação foi conferida por sintaxe JavaScript, testes de períodos exatos no relógio de áudio simulado e teste de reprodução repetida no Laboratório de Improvisação. A audição real em iPhone/Safari ainda precisa ser verificada.

# Cifra pra Mim — Arranja pra mim

Gerador de arranjos para teclado baseado no método autoral **Adaptando Pontas**, de Igor Morais.

**Status: gerador de teclado com entrada por progressão, colagem de letra/cifra e importação de PDF/TXT.** A importação por URL e os diagramas de cavaquinho ainda não estão disponíveis.

## O que funciona agora

Abra index.html em um navegador, acompanhado dos arquivos da pasta src.

1. Digite uma progressão (como F#m7 Bm7 E7), **cole uma letra cifrada completa** no quadro superior ou **selecione um PDF/TXT**. PDFs são processados no próprio navegador pela biblioteca PDF.js; somente PDFs com texto selecionável são suportados, sem OCR.
2. Ao colar uma música, clique em **Extrair acordes e gerar**. Revise a sequência reconhecida; para uma progressão digitada, clique em **Gerar arranjo**.
3. Consulte as quatro seções: **Formas Originais**, **Adaptando Pontas I**, **Adaptando Pontas II** e **Adaptando Pontas III**.
4. Visualize teclados SVG, cifras, notas das mãos esquerda e direita e graus.
5. Clique em **Gerar PDF para salvar**. O site cria um PDF A4 diretamente no navegador, sem usar a janela de impressão. Em seguida escolha **Abrir PDF**, **Baixar PDF** ou **Compartilhar / Salvar em Arquivos** (quando o celular disponibilizar o compartilhamento). A letra e cifra originais podem ser incluídas antes dos diagramas.

**Os diagramas agora compartilham uma referência fixa C3–B5** e cada ponta preserva a oitava real. Há **uma única seção Formas Originais**: tríades de base em posição fundamental **1–3–5**, ou **1–♭3–5** nos menores. As três seções Adaptando Pontas partem, respectivamente, do primeiro acorde nas disposições **1–3–5**, **3–5–1** e **5–1–3** (com ♭3 nos menores). A primeira adaptação repete exatamente a primeira Forma Original; a segunda e a terceira são inversões do primeiro acorde, não novas coleções de Formas Originais. Só a partir do segundo acorde começam as escolhas de condução. Nas tétrades a sétima substitui o 1 da mão direita e fica imediatamente abaixo da fundamental original, que permanece na M.E. Saltos superiores a dois semitons são sinalizados.

O exemplo C7M/B usa baixo B na mão esquerda e E–G–B na direita, sem dobrar C. O motor procura evitar intervalos de segunda ou nona menor entre as mãos; quando precisa omitir alguma nota, indica a omissão.

## O que ainda não existe

- Importação automática a partir de URL do Cifra Club: precisa de integração de servidor e verificação das condições de uso.
- OCR de PDFs digitalizados como imagens: PDFs precisam conter texto selecionável. 
- Reconhecimento perfeito da disposição de acordes na letra: conferir a sequência após a extração, especialmente PDFs com colunas, repetições e diagramas.
- Gerador de diagramas de posições de cavaquinho.
- Cobertura de todos os tipos de acorde, voicings e exceções melódicas. **Conferir musicalmente as saídas.**
- Para abrir o aplicativo hospedado, quando o GitHub Pages estiver ativado: https://igormorais-gif.github.io/cifra-pra-mim/. Visitar o repositório GitHub mostra o código, não executa o site.

## Rodar e testar

Baixe os arquivos mantendo a estrutura de pastas e abra index.html em um navegador moderno. Em um computador com Python, também é possível iniciar um servidor local com:

    python3 -m http.server 8000

E abrir http://localhost:8000 no navegador.

Para conferir o motor com Node.js 22:

    node --test tests/*.test.cjs

Existe um fluxo de testes em .github/workflows/test.yml.

## Arquivos principais

- index.html — gerador de arranjos.
- src/engine.js — parser de cifras e motor de conduções.
- src/generator.js — campos, resultados e teclados SVG.
- src/import.js — leitura local de PDF/TXT e extração de acordes de texto cifrado.
- src/pdf-export.js — gera PDF A4 multipágina diretamente no aparelho usando canvas e JPEG, sem serviços externos de exportação e sem `window.print()`.
- src/editor.css — Edição de Autor, responsivo e impressão A4.
- laboratorio.html — protótipo anterior de Laboratório de Transições.
- src/app.js e src/styles.css — comportamento e estilo do protótipo anterior.
- docs/HARMONIA.md e docs/ROADMAP.md — regras e roteiro.
- tests/engine.test.cjs e tests/import.test.cjs — testes.

## Publicação

No GitHub Free, o GitHub Pages exige repositório público. Em planos GitHub Pro e superiores, também aceita repositórios privados, mas o site publicado pode continuar acessível publicamente. A visibilidade pode variar conforme as configurações atuais da conta: confirme no GitHub antes de alterar a publicação.

A fonte de publicação, quando disponível, pode ser configurada em Settings → Pages → Deploy from a branch → main → / (root).

## Direitos e autoria

Projeto de Igor Morais. Ainda não há licença definida. Não adicionar letras, partituras, áudios ou bases de terceiros sem verificar as permissões de uso.

## Exportar PDF no iPhone

Use a versão do site aberta no Safari. Depois de gerar os acordes, toque em **Gerar PDF para salvar** e, quando terminar, em **Compartilhar / Salvar em Arquivos**. Caso o navegador não ofereça compartilhamento de arquivos, tente **Abrir PDF** e use o menu de compartilhamento do Safari; alternativamente, toque em **Baixar PDF**. A opção **Imprimir pelo navegador (alternativa)** continua disponível, mas não é exigida para exportar.

O arquivo PDF é criado localmente; nenhum trecho da letra ou cifra é enviado a serviços de exportação. O PDF contém imagens das páginas para manter a grafia e os diagramas consistentes no iOS (por isso seu texto não é selecionável no arquivo exportado).

## Padrão visual do material didático

As cartelas do teclado voltaram ao molde editorial do material **CIFRA PRA MIM (3 Adaptações)**, utilizado em *Equalize — Pitty*: cifra centralizada acima; nome do acorde por extenso em português imediatamente abaixo; identificação **M.E. | M.D.** antes de uma linha horizontal; teclado logo abaixo, com **bolinhas e graus escritos nas teclas**, também nas teclas pretas. Duas figuras por linha nos documentos A4. Não há mais mensagens longas sobre a ponta ocupando o espaço das figuras; exceções de condução continuam disponíveis na interface, e o motor preserva as oitavas reais.

**Apenas uma coleção de Formas Originais**, seguida de três percursos de Adaptando Pontas. A quantidade de folhas aumenta quando há muitos acordes; o gerador não deve cortar figuras para forçar uma página.

## Laboratório de Embelezamentos — aproximações

Além das conexões diatônicas e cromáticas entre notas da tríade, o laboratório oferece três ornamentos independentes:

- **C.I. (Cromático Inferior):** 1 semitom abaixo do alvo, independentemente da escala. Ex.: em C maior, Ré♯ → Mi.
- **D.I. (Diatônico Inferior):** nota imediatamente anterior ao alvo na escala maior ou menor natural. Ex.: Ré → Mi em C maior.
- **D.S. (Diatônico Superior):** nota imediatamente posterior ao alvo na escala maior ou menor natural, resolvendo de cima para baixo. Ex.: Fá → Mi em C maior.

Em cada módulo é possível marcar independentemente as aproximações dos graus **1, 3 (♭3 na tríade menor) e 5**. O desenho mostra todas as marcadas simultaneamente, mas não altera as três vozes estruturais da forma. A reprodução respeita a ordem 135/351/513 e somente os graus selecionados. No violão, a aproximação acontece na mesma corda do grau de chegada; se a posição escolhida não comportar a nota vizinha, busca-se outra posição compacta e tocável. O localizador 1B é calculado separadamente e acompanha a região da forma. O modelo da tríade menor utiliza a escala **menor natural** para D.I./D.S.; alterações da menor harmônica/melódica não estão habilitadas.

### Players simplificados após a seleção independente

Nos módulos C.I., D.I. e D.S. são mantidos somente **Ouvir sequência** (percorre **todas as três notas** da forma 135, 351 ou 513: insere a nota vizinha apenas antes dos graus marcados e toca normalmente os demais) e **Ouvir com tríade** (apresenta a tríade e o baixo, executa exatamente a mesma sequência com graus ornamentados e não ornamentados e conclui com a tríade), além de **Parar** e andamento. Sem nenhuma seleção, os dois players continuam disponíveis e executam a tríade original, para comparação. **Percorrer C.I./D.I./D.S.** foi removido por duplicar a reprodução das seleções. Nas Conexões Diatônica/Cromática fica apenas **Ouvir conexões** (toca uma ou as duas ligações que o aluno marcou) e **Parar**; o botão **Selecionar e ouvir ambas** foi removido, porque a seleção é independente. Os botões não alteram a seleção durante a reprodução.

### Exemplo da execução completa dos embelezamentos

Na forma original 1–3–5 de **C maior**, marcar apenas **C.I.1** produz **Si → Dó → Mi → Sol** (não omite a terça e a quinta). Marcar apenas **C.I.3** produz **Dó → Ré♯ → Mi → Sol**. Marcar ambos produz **Si → Dó → Ré♯ → Mi → Sol**. No violão, as formas 3–5–1 e 5–1–3 respeitam a ordem própria das cordas/vozes e a oitava real. A audição com tríade difere por adicionar a apresentação do acorde, baixo e acorde final; nunca por suprimir notas não selecionadas.

### Eixo de Combinações

A aba **Combinações** funciona sem eliminar os módulos de estudo isolado. Cada grau estrutural da forma original (1, 3 ou ♭3, 5) recebe duas escolhas independentes:

- **Material ornamental**: nenhum, C.I., D.I. ou D.S.
- **Figura melódica**: aproximação (nota vizinha → alvo) ou bordadura (alvo → vizinha → alvo).

Assim, em C maior, 135, é possível definir **C.I.1 por aproximação**, **D.S.3 por bordadura** e **D.I.5 por aproximação**. A sequência resultante é **Si → Dó → Mi → Fá → Mi → Fá → Sol**. Os dois players percorrem sempre as três notas da tríade na ordem original; **Ouvir com tríade** também apresenta o acorde e o baixo e encerra com o acorde. É possível deixar qualquer grau sem embelezamento; não existem notas fixas extras no acorde.

No violão, as notas ornamentais permanecem na mesma corda de sua voz estrutural. As formas são escolhidas de modo a comportar as casas superiores/inferiores necessárias, e o localizador 1B acompanha a posição. O seletor 4–3–2 / 3–2–1 permanece disponível. Os modos C.I., D.I., D.S. e as duas conexões continuam independentes e preservam suas próprias seleções.

## Laboratório de Improvisação · Ritmo e intervalos (v6)

Página: [laboratorio-improviso/](laboratorio-improviso/). Protótipo separado e navegável, com acesso na página inicial e no Laboratório de Embelezamentos.

**Hipótese pedagógica:** aprender o vocabulário rítmico e a distribuição dos ataques sem reproduzir frases melódicas de licks consagrados. Neste experimento, as quatro notas da tétrade C7M em posição fechada (Dó4–Mi4–Sol4–Si4, graus 1–3–5–7) permanecem fixas. As **12 células são exemplos originais**, não transcrições dos três livros fornecidos. Cada célula tem quatro ataques em um compasso 4/4, distribuídos na grade de 16 semicolcheias, podendo incluir pausas, síncopes, semicolcheias e durações pontuadas.

**Famílias:** Fundamentos (2), Síncopes (4), Pausas (3) e Densidade (3). O botão **Comparar visíveis** toca somente a família filtrada, ou as 12 células se estiver em **Todas**, sem pausa artificial entre os compassos. Metrônomo opcional e BPM de 50 a 160. O áudio é produzido por Web Audio no navegador.

**Grade corrigida:** `1 i e i | 2 i e i | 3 i e i | 4 i e i`. Os 16 rótulos e os blocos de notas ocupam as **mesmas colunas de uma única CSS grid**, corrigindo o desalinhamento posicional causado por usar uma régua e uma grade separadas. Cada ataque tem início, duração e índice definidos pelo mesmo evento que programa o áudio.

**Partitura 4/4:** alternar entre **Ritmo puro** (pauta rítmica de uma linha, cabeças em X) e **Com alturas** (pentagrama com clave de sol e as quatro notas). Ambas exibem figuras, pausas, durações pontuadas e ligaduras das notas que atravessam tempos; as pausas ocupam os silêncios sem criar ataques adicionais. A pauta SVG é gerada localmente pelo módulo `src/rhythm-notation.js`, sem biblioteca externa ou fonte musical baixada; depende apenas do navegador. O plano `plan(id)` e o SVG são derivados dos mesmos eventos de `src/rhythm-lab.js`.

**Metrônomo por subdivisão (v5 — controle iPhone):** opções **Tempos** (4 cliques), **Colcheias** (8 cliques, `1 e`) e **Semicolcheias** (16 cliques, `1 i e i`). Cada clique usa os mesmos ticks inteiros e a mesma conversão de BPM que os eventos melódicos, de forma que 2i₁, 3e e 4e coincidam exatamente com os cliques correspondentes quando a subdivisão estiver ativa. Timbres e volumes diferenciam o tempo 1, os demais tempos, os contratempos e as subdivisões intermediárias. A grade destaca a subdivisão em curso. O controle liga/desliga do metrônomo permanece disponível. A escolha dos modos agora usa um seletor nativo (Tempos, Colcheias, Semicolcheias), e há um botão **Ouvir só o metrônomo** para conferir os 4, 8 ou 16 cliques sem as notas. Os arquivos de motor e partitura recebem novas versões na URL para evitar cache de JavaScript desatualizado no Safari/iPhone. No teste auditivo A/B, os botões Ouvir 2i₁ / Ouvir 2e acompanham a subdivisão escolhida, sem reescrever nem deslocar os ataques da célula. A simulação confirma, a 80 BPM, uma distância de 187,5 ms entre o primeiro i e o e. A reprodução real no Safari do iPhone ainda não foi validada.

**Testes:** `tests/rhythm-lab.test.cjs` e `tests/rhythm-notation.test.cjs` verificam quantidades, famílias, durações, 4/4, soma de 16 ticks por pauta, coincidência entre os eventos escritos e os de áudio, pausas, ligaduras e modos de visualização. A interface também foi verificada em simulação de DOM/Web Audio. Ainda não foi testada diretamente no Safari de um iPhone.

**A desenvolver:** integração com combinações de embelezamentos, inclusão didática de notas modais características (2, 4 e 6), extração/catalogação de padrões rítmicos presentes nos livros e outras possibilidades de compassos. O site não reproduz nem incorpora exemplos protegidos desses materiais.

A publicação no GitHub Pages pode levar algum tempo a refletir o commit mais recente.

**Convenção única de leitura (v6):** o Laboratório usa exclusivamente a contagem brasileira de O Passo, associada a Lucas Ciavatta. As quatro posições dentro de cada tempo são `número – i – e – i`; o `e` coincide com o contratempo da colcheia. Os dois `i` são distinguidos nas etiquetas detalhadas como `i₁` (primeiro i) e `i₂` (segundo i); essa numeração é apenas uma legenda de desambiguação do aplicativo, não uma nova forma de pronunciar a contagem. Os ataques (ticks), durações e sons continuam idênticos à versão anterior. Os rótulos da grade, os chips, o metrônomo, o teste auditivo A/B e os textos do site seguem essa convenção. Consulte as Folhas de Números, E e I do Instituto d’O Passo: https://www.institutodopasso.org/folhas.
