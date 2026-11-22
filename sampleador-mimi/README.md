# Correção da frase “Eu já estou pronta” — 22/11/2026

**Correção principal:** a frase não é mais construída com os 45 fragmentos EU/JÁ/ESTOU/PRON/TA, que cortavam a última sílaba em algumas tomadas. As nove execuções completas foram novamente recortadas da gravação original `JA ESTOU PRONTA.m4a`, preservando começo, fim, dicção, duração interna e cauda do TA. Cada gravação corresponde a um tom E6, Eb6, D6, Db6, C6, B6, Bb6, A6 ou G#6. Nenhuma palavra é individualmente quantizada, e a afinação não é rigidamente modificada nesse novo banco.

A prévia toca a tomada inteira em um elemento de áudio próprio. Cada célula lilás do beat aciona o mesmo arquivo completo por Web Audio, sem limite de tempo imposto pelo próximo passo nem recorte por palavra. Os nove M4A estão embutidos no `index.html` para evitar erro de carregamento de arquivo separado. O ritmo do beat regula apenas o início da frase.

**Verificação técnica:** nove arquivos decodificados, de 1,8 a 2,32 segundos, com sinal na parte final das frases. Sintaxe JavaScript validada; reprodução ainda requer escuta final no iPhone do usuário.

---

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
