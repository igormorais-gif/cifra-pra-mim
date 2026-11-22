# SAMPLEADOR MIMI — Teclado Lo-fi Pad e reverb

Versão do Hub: https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/

## Novo: acorde de teclado PAD

Ative **PAD ligado** no painel “03 / Teclado lo-fi · PAD de sexta”.
Escolha **Quando o PAD deve começar**:
- **A cada IH:** acompanha o tom do IH manual ou de cada nota IH no piano roll. É o modo inicial.
- **No começo de cada compasso do beat:** um acorde por compasso, seguindo o tom programado no primeiro IH do compasso ou o tom selecionado se não houver IH nesse passo.
- **Somente ao tocar o botão PAD:** o sequenciador e as sílabas não acionam automaticamente o pad; use **OUVIR PAD** para experimentar.

O PAD tem controles independentes de **volume**, **ataque/bloom**, **sustentação mínima**, **nível de reverb**, **duração da cauda reverberada** e **calor lo-fi**. Presets **Nuvem de reverb** e **Suave e próximo**. Há três distribuições:

- Aberto e envolvente: 1–5–6–3 no registro do teclado. E6 = **Mi3–Si3–Dó♯4–Sol♯4**.
- Próximo: 1–3–5–6. E6 = Mi3–Sol♯3–Si3–Dó♯4.
- Aéreo: 1–6–3–5, aberto na região médio-aguda. E6 = Mi3–Dó♯4–Sol♯4–Si4.

O acorde contém **1, 3, 5 e 6** em todas as formas. Não pressupõe que a mão direita deva ter quatro notas no método pedagógico geral — aqui o objetivo é construir uma cama sonora de teclado. Ao escolher outro tom, as notas do PAD são transpostas com a fundamental do acorde escolhido.

### Como o som é produzido

O PAD é sintetizado no navegador (triângulo + pequena camada dente-de-serra filtrada), com ataque gradual, filtro escuro, desafinação estéreo sutil e reverb de convolução com cauda controlável. Não é uma gravação de piano nem um sample vocal. O próprio MIMI continua preservado: 32 sílabas vocais corrigidas por tomada e sustain da vogal, sem alterar a voz com o reverb do pad.

O modo manual funciona mesmo com o pad desligado: **OUVIR PAD** faz prévia isolada. **PARAR TUDO** interrompe osciladores e a cauda. Evite volumes muito altos no iPhone.

Os controles do PAD ficam salvos localmente no navegador (quando esse recurso é permitido), juntamente com as notas, harmonias e andamento do beat. A nova versão conserva os padrões e seus formatos anteriores.

### Conteúdo do pacote

- `index.html`: aplicação web para colocar na pasta `sampleador-mimi/` do Hub.
- `assets/voz-original-149.m4a`: gravação original 149.
- `assets/mimi-studio-sustain.m4a` + `.ogg`: biblioteca vocal afinada com sustain de vogal, em formatos alternativos.
- `assets/studio-atlas.json`: informações técnicas dos cortes.
- `SAMPLEADOR-MIMI-LOFI-PAD-AUTONOMO.html`: aplicativo com a voz já incluída, para abrir individualmente num navegador compatível.

### Privacidade

A versão do Hub utiliza arquivos de uma gravação vocal infantil hospedados em repositório público. Isso significa que terceiros podem acessar e baixar esses áudios.

## Arpejador EU JÁ ESTOU PRONTA (9 tomadas, 5–5–5–3–1)

A gravação fornecida pelo autor contém nove execuções cromáticas, de **E6 até G#6**. O banco corrigido contém 45 fragmentos: **EU, JÁ, ESTOU, PRON, TA**, cada um afinado individualmente. O motivo parte de **Si4–Si4–Si4–Sol#4–Mi4** (graus 5–5–5–3–1 em Mi maior), descendo um semitom a cada tomada. A célula usa ataques nas posições 0, 2, 4, 6, 10 da malha de 16 semicolcheias, formando um ciclo de dois compassos de 2/4, organizado como a referência de marchinha solicitada.

A **pista lilás EU JÁ ESTOU PRONTA** permite colocar um único quadradinho para tocar a frase inteira. Cada quadradinho guarda seu próprio tom. O botão manual permite ouvir sem o beat. Na reprodução, o relógio muda os instantes de entrada das palavras, sem alterar a velocidade da gravação, de modo a priorizar a inteligibilidade. Em BPM muito alto, as palavras podem se sobrepor.

**Situação do áudio no site:** a pista e os controles foram publicados, mas o banco processado da frase ainda **não está hospedado** no repositório. Baixe o pacote do projeto, extraia o arquivo assets/eu-ja-estou-pronta-bank.m4a e importe esse arquivo no campo da pista lilás **uma vez por dispositivo/navegador**. O aplicativo salva-o localmente no IndexedDB quando permitido. A versão HTML autônoma distribuída no pacote já inclui o banco e funciona sem importação. Quando esse arquivo for adicionado ao repositório, o app poderá carregá-lo automaticamente.

A afinação usa análise de fundamental por fragmento e transposição com preservação de formantes. As inflexões vocais internas continuam naturais; a precisão não é absoluta durante glissandos. A gravação vocal original não foi substituída por voz gerada por IA.

A referência musical consultada é a partitura de *Mamãe Eu Quero* da Casa do Choro (marcha em 2/4). O encaixe 0–2–4–6–10 é uma **adaptação de quantização** da nova frase, não uma transcrição certificada de cada ataque da gravação histórica.

Privacidade: caso o banco vocal seja adicionado ao GitHub público, ele também se tornará publicamente acessível.
