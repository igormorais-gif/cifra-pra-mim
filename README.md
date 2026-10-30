# Cifra pra Mim

**Aprender harmonia enxergando o que muda de um acorde para outro.**

Projeto autoral de ensino musical com percursos para **teclado**, **cavaquinho** e um **Laboratório de Transições**. A proposta é conectar cifras, formas, graus e movimentos entre vozes, em vez de apresentar acordes como figuras isoladas.

> Status: estrutura inicial e protótipo de navegação. Os exemplos musicais são didáticos; ainda não há gerador completo de cifras ou digitações de cavaquinho.

## Módulos

### Teclado
- Tríades maiores e menores; graus 1–3–5 e 1–♭3–5.
- **Formas Originais → Adaptando Pontas**, com a primeira forma preservada.
- Estudo do movimento da voz mais aguda, inicialmente com deslocamento de até dois semitons entre acordes consecutivos.
- Evolução para tétrades, sétimas e extensões.

### Cavaquinho
- Leitura de formas em graus e associação com a cifra.
- Progressões organizadas pela **forma de origem**.
- Representação visual de mudanças cromáticas e dos arpejos correspondentes.
- Digitações só entrarão no protótipo depois de validação das posições reais no instrumento.

### Laboratório de Transições
- Cadeia experimental: **G → G7M → G7 → Gm7 → Gm7(♭5) → G°7**.
- O passo inicial mostra a troca de uma fundamental (1) pela sétima maior (7) na voz superior: **1 → 7, desça 1 semitom**.
- A última etapa é grafada **G°7** por representar a tétrade diminuta (com sétima diminuta). A cifra **G°**, sem outra indicação, também é usada para uma tríade diminuta; essa ambiguidade deve ser esclarecida ao aluno.
- Protótipo inclui um arpejo sintetizado simples para cada acorde, acionado pelo usuário.

## Abrir localmente

Não é necessário instalar dependências. Basta abrir `index.html` em um navegador moderno. O protótipo é composto por HTML, CSS e JavaScript, sem backend.

## Publicação

Como é um site estático, poderá ser publicado com GitHub Pages quando o repositório atender aos requisitos do seu plano (no GitHub Free, é necessário que seja **público**).

## Planejamento

Veja [docs/ROADMAP.md](docs/ROADMAP.md) para a sequência de desenvolvimento e [docs/HARMONIA.md](docs/HARMONIA.md) para a especificação inicial dos exemplos.

## Autoria e direitos

Projeto de Igor Morais. **Ainda não há licença de software definida.** Não adicionar letras, áudios, partituras ou bases de dados de terceiros sem verificar as permissões de uso. Uma eventual integração ao Cifra Club precisará observar os termos e os direitos sobre o conteúdo.
