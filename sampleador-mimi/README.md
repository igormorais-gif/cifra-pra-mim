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
- Aéreo: 5–6–3–1 na região médio-aguda. E6 = Si3–Dó♯4–Sol♯4–Si4.

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