# Sampleador MIMI — atualizações de voz, ritmo e harmonia

**Hub:** https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/

## Correções de usabilidade

**EU JÁ ESTOU PRONTA.** O banco M4A das nove tomadas não estava hospedado; agora está em `assets/eu-ja-estou-pronta-bank.m4a`. O botão e a pista lilás disparam a frase completa, dividida em cinco ataques (5–5–5–3–1), na sequência rítmica configurada. Para falha de carregamento, há “Recarregar voz” e um controle de importação M4A/OGG, que pode salvar uma cópia local.

**IH · ON · MI · MI.** A **voz natural** é o ponto de partida. O antigo banco de afinação muito rígida continua disponível como comparação opcional. O sampler natural preserva melhor a articulação e a flutuação original das notas. Essa escolha significa que a afinação temperada exata não é garantida. A camada tonal e as vozes de harmonia adicionais não entram por padrão. No modo de estúdio, só notas que o usuário alongar entram no loop da vogal.

**Piano roll.** Cada nota nasce com apenas **1 passo/semicolcheia**. Ela só ganha duração com a alça, os botões +/− ou a escolha consciente de tamanho inicial. Presets padrão e síncope também criam notas curtas. Há um botão **Todas curtas** para normalizar a composição sem apagar notas ou alturas. Projetos salvos são migrados da chave v3 para v4; durações maiores que três passos podem ser preservadas.

**PAD discreto.** O acorde de teclado passa a ter voicing fixo **6–3–5**, sem a fundamental na camada do pad. No E6: **Dó♯4–Sol♯4–Si4**. Padrão: volume 24%, ataque 0,12 s, sustentação mínima 0,6 s, reverb 18%, cauda 1,1 s. O sustain é limitado para não deixar acordes acumularem. O pad segue o IH, pode tocar por compasso ou manualmente; a frase “EU JÁ ESTOU PRONTA” não o dispara automaticamente.

## Conteúdo técnico e arquivos

O código está em `sampleador-mimi/index.html`; os arquivos públicos necessários são:
- `assets/voz-original-149.m4a`: 8 tomadas originais, recortadas em quatro sílabas cada;
- `assets/mimi-studio-sustain.m4a` e `.ogg`: banco opcional de afinação processada;
- `assets/eu-ja-estou-pronta-bank.m4a`: 9 tomadas da frase, agora presente no repositório.

O HTML autônomo oferecido no chat incorpora os áudios e funciona sem depender de hospedagem, em navegador compatível.

**Privacidade:** as vozes publicadas em GitHub Pages público podem ser acessadas e copiadas por terceiros. A afinação natural preserva expressividade, mas pode divergir das frequências-alvo; a processada pode gerar artefatos nas correções maiores.
