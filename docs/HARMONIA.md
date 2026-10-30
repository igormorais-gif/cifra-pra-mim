# Especificação harmônica inicial

## Teclado: Forma Original → Adaptando Pontas

Progressão de demonstração: C – Am – F – G (com C repetido opcionalmente).

A primeira forma é preservada. As vozes da mão direita do exemplo adaptado são:

| Acorde | M.E. | M.D. (grave → aguda) | Graus na M.D. | Ponta |
|---|---|---|---|---|
| C | C | C–E–G | 1–3–5 | G |
| Am | A | C–E–A | ♭3–5–1 | A |
| F | F | C–F–A | 5–1–3 | A |
| G | G | D–G–B | 5–1–3 | B |

As pontas G → A → A → B se deslocam +2, 0, +2 semitons, respectivamente. São apenas exemplos específicos de condução de vozes, não o resultado de um gerador implementado.

## Laboratório de Transições

Cada etapa mantém um acorde de quatro vozes com G no baixo. A voz alterada desce cromaticamente, destacada na interface.

| Acorde | Notas (grave → aguda) | Movimento de entrada |
|---|---|---|
| G | G–B–D–G | Forma de partida, com fundamental repetida |
| G7M | G–B–D–F♯ | 1 → 7 na voz superior |
| G7 | G–B–D–F | 7 → ♭7 |
| Gm7 | G–B♭–D–F | 3 → ♭3 |
| Gm7(♭5) | G–B♭–D♭–F | 5 → ♭5 |
| G°7 | G–B♭–D♭–E | ♭7 → 𝄫7 (enarmonicamente E) |

Na linguagem de cifras, **G° pode ser entendido como tríade** (G–B♭–D♭) ou como forma abreviada para uma tétrade diminuta em certos contextos. Aqui usamos **G°7** para tornar inequívoca a transformação final de uma única voz.

## Restrições de autoria

A implementação didática deverá evitar tratar escolhas provisórias como padrões universais. Na evolução para o método completo, identificar notas omitidas e controlar choques de segunda menor/nona menor entre baixo e mão direita.
