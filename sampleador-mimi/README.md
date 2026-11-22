# MIMI — Voz natural, frase audível e beat

## Atualização de 22/11/2026

- Ouvindo **EU JÁ ESTOU PRONTA**: o botão manual usa o reprodutor de áudio nativo do navegador, com o arquivo M4A das nove tomadas embutido diretamente no HTML e também hospedado em `assets/eu-ja-estou-pronta-bank.m4a`. A prévia toca **a frase inteira de uma tomada**, sem remontar sílabas em ataques separados. Na pista do sequenciador, cada célula dispara a mesma frase de uma só vez.
- **IH ON MI MI**: a interpretação original é a base. Retirados os botões de afinação processada e de camada tonal; fica apenas um reforço senoidal sutil e automático da nota central, sem alterar a prosódia, as formantes ou a velocidade da gravação. Isso é um reforço tonal leve, não autotune rígido.
- **Piano roll**: as notas começam com uma semicolcheia e só se prolongam quando editadas.
- **Pad lo-fi**: segue a formação discreta 6–3–5 já estabelecida, com reverb curto.
- **iPhone**: o botão manual usa reprodução nativa para evitar depender exclusivamente de WebAudio e apresenta uma mensagem em caso de falha. Os testes em navegador desktop e em viewport de celular confirmaram reprodução e avanço do tempo; Safari físico ainda necessita de escuta.

## Acesso

Hub: https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/

O projeto permanece no diretório `sampleador-mimi/`, dentro de `igormorais-gif/cifra-pra-mim`. O arquivo `assets/voz-original-149.m4a` e os bancos de voz anteriores permanecem preservados. A gravação vocal publicada é acessível publicamente no repositório e no Pages.
