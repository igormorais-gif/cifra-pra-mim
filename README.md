# Cifra pra Mim — Arranja pra mim

Gerador de arranjos para teclado baseado no método autoral **Adaptando Pontas**, de Igor Morais.

**Status: primeira versão funcional para progressões digitadas.** A importação por URL, os diagramas de cavaquinho e a publicação como site público ainda estão em desenvolvimento.

## O que funciona agora

Abra index.html em um navegador, acompanhado dos arquivos da pasta src.

1. Digite uma progressão, como F#m7 Bm7 E7, C Am F G ou C7M/B Dm7 G7.
2. Clique em **Gerar arranjo**.
3. Consulte as quatro seções: **Formas Originais**, **Adaptando Pontas I**, **Adaptando Pontas II** e **Adaptando Pontas III**.
4. Visualize teclados SVG, cifras, notas das mãos esquerda e direita e graus.
5. Clique em **Imprimir / Salvar PDF** para imprimir em A4, com dois teclados por linha.

A primeira seção apresenta três variantes de forma de origem, correspondentes às três adaptações. A primeira forma de cada adaptação repete exatamente o primeiro voicing da variante correspondente. A partir do segundo acorde o programa prioriza a proximidade das pontas, sinalizando saltos acima de dois semitons.

O exemplo C7M/B usa baixo B na mão esquerda e E–G–B na direita, sem dobrar C. O motor procura evitar intervalos de segunda ou nona menor entre as mãos; quando precisa omitir alguma nota, indica a omissão.

## O que ainda não existe

- Importação automática a partir de URL do Cifra Club: precisa de integração de servidor e verificação das condições de uso.
- Gerador de diagramas de posições de cavaquinho.
- Cobertura de todos os tipos de acorde, voicings e exceções melódicas. **Conferir musicalmente as saídas.**
- Publicação online: visitar o repositório GitHub mostra o código, não abre um aplicativo rodando.

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
- src/editor.css — Edição de Autor, responsivo e impressão A4.
- laboratorio.html — protótipo anterior de Laboratório de Transições.
- src/app.js e src/styles.css — comportamento e estilo do protótipo anterior.
- docs/HARMONIA.md e docs/ROADMAP.md — regras e roteiro.
- tests/engine.test.cjs — testes.

## Publicação

No GitHub Free, o GitHub Pages exige repositório público. Em planos GitHub Pro e superiores, também aceita repositórios privados, mas o site publicado pode continuar acessível publicamente. O repositório foi mantido privado deliberadamente. Nenhuma configuração de visibilidade foi alterada.

A fonte de publicação, quando disponível, pode ser configurada em Settings → Pages → Deploy from a branch → main → / (root).

## Direitos e autoria

Projeto de Igor Morais. Ainda não há licença definida. Não adicionar letras, partituras, áudios ou bases de terceiros sem verificar as permissões de uso.
