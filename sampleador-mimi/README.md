# SAMPLEADOR MIMI — afinação de estúdio

O MIMI usa 8 performances independentes do áudio 149. São 32 sílabas originais (8 × IH, ON, MI 1, MI 2), corrigidas individualmente por Praat/PSOLA. O original não foi sobrescrito.

## Notas previstas

Primeiro acorde: E6 (Mi com sexta). **IH: E5 / Mi5; ON: E4 / Mi4; MI 1: D#5 / Ré♯5; MI 2: C#5 / Dó♯5.** As 4 alturas descem um semitom a cada gravação: E6, Eb6, D6, Db6, C6, B6, Bb6 e A6. O G#6 continua derivado digitalmente do último arquivo, não é uma nona tomada real.

Acorreção foi gerada a partir de cada **performance individual**, não a partir de uma única gravação transposta para todas. O banco comprimido de áudio é `assets/mimi-studio-sustain.ogg`. O modo de estúdio é o padrão; desligar **Afinação de estúdio** permite comparar com o áudio original `assets/voz-original-149.m4a`.

## Duração MIDI sem "MIMIMI"

Cada nota tem um único ataque com consoante seguido de loop exclusivamente no trecho estável da **vogal final**. No MI a consoante M toca uma vez e apenas I continua: "Miiii". Os recortes de loop foram escolhidos para alinhar cruzamentos de zero/fase. O piano roll define o tempo de duração em semicolcheias, inclusive durante a rampa de BPM, sem alterar a altura original. Em alguns fonemas muito curtos ainda podem existir artefatos de loop e pequenas perdas de naturalidade.

## Harmonização

Até 3 vozes, com terças, quartas, quintas, sextas e oitavas diatônicas, incluindo intervalos abaixo e acima. No espaço das 8 gravações, o sistema escolhe a tomada individual correspondente já afinada. Fora da extensão disponível, é preciso transpor digitalmente a tomada mais próxima, o que pode mudar o timbre. Uma camada tonal senoidal opcional reforça a frequência, mas não regrava a sílaba; fica desligada por padrão para evitar batimentos.

## Validação e limites

O mapa das 32 notas foi verificado por estimativa automatizada de F0. Na região de sustentação o desvio mediano ficou aproximadamente em 1 cent em relação à nota alvo, com desvios pontuais maiores. Isso é precisão de frequência, não certificação auditiva de timbre perfeito. A versão para iPhone deve ser escutada no próprio dispositivo; ao desativar o estúdio, permanece o áudio original como alternativa.

Os arquivos de voz são públicos no GitHub/Pages. Ao disponibilizar a gravação de uma criança, considere a privacidade.

Endereço: https://igormorais-gif.github.io/cifra-pra-mim/sampleador-mimi/
