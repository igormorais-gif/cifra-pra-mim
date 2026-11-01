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

Nos módulos C.I., D.I. e D.S. são mantidos somente **Ouvir aproximações** (toca as aproximações marcadas, uma a uma na ordem da forma) e **Ouvir com tríade** (apresenta a tríade e seu baixo, percorre os embelezamentos selecionados e conclui com a tríade), além de **Parar** e andamento. **Percorrer C.I./D.I./D.S.** foi removido por duplicar a reprodução das seleções. Nas Conexões Diatônica/Cromática fica apenas **Ouvir conexões** (toca uma ou as duas ligações que o aluno marcou) e **Parar**; o botão **Selecionar e ouvir ambas** foi removido, porque a seleção é independente. Os botões não alteram a seleção durante a reprodução.
