# ARTEMIS — Lunar Landing Site Navigator (Incremento 1)

## Como abrir
Dê dois cliques em `index.html` (precisa de internet para carregar o three.js via cdnjs).

## Estrutura
- `index.html` — marcação da interface
- `css/style.css` — estilos (paleta azul/amarelo em variáveis CSS)
- `js/core.js` — núcleo científico (sem DOM): DEM sintético, horizonte por ray marching com curvatura, visibilidade do Sol e da Terra, janelas e métricas
- `js/procedural.js` — Lua (globo) e textura do terreno gerados por código
- `js/app.js` — cena 3D, câmera, linha do tempo e painéis
- `tests/core.test.js` — testes do núcleo (`npm test` ou `node tests/core.test.js`)

## O que é real e o que é demonstração
- Real: o algoritmo de horizonte e a visibilidade geométrica.
- Demonstração: o relevo, a Lua, o Sol e a Terra são sintéticos/simulados. Não são dados LOLA nem SPICE.

## Próximo passo
Trocar o DEM sintético por um recorte real do LOLA e o Sol/Terra simulados por efemérides SPICE.
