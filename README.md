# ProAtleta

Site e app que ajudam atletas a achar peneiras e ajudam escolinhas e clubes a desenvolver seus atletas.

## Estrutura

| Pasta | O que é |
|---|---|
| `Website/` | Site institucional (HTML, CSS e JS puros). Home com bola 3D (Three.js), animações de scroll (GSAP + ScrollTrigger), micro-interações (Motion) e rolagem suave (Lenis). Páginas: `index.html`, `peneiras.html`, `instituicoes.html`. |
| `proatleta/` | App (Cordova + Framework7). Rotas em `js/routes.js`. Telas novas: `peneiras.html` e `instituicao.html`. |
| `api/` | API PHP de peneiras publicadas por escolinhas, clubes e instituições (MySQL na Hostinger, SQLite em localhost). |
| `scripts/` | Servidor local para ver tudo rodando e dados de exemplo. |

As bibliotecas ficam dentro do projeto (`Website/lib`, `proatleta/lib/vendor`), sem CDN: funciona offline no app e o site não depende de terceiros.

## Rodar em localhost

Precisa de Node.js 18+ e PHP 8.

```bash
php scripts/dev/popular-exemplos.php   # cria 6 peneiras de exemplo (login: bola@exemplo.com / Exemplo123)
node scripts/servidor-local.mjs         # sobe tudo
```

- Site: http://localhost:5500
- App (no navegador, use o modo celular do DevTools): http://localhost:5501
- API: http://localhost:8000/peneiras.php

Em localhost o site e o app usam a API local sozinhos. Em produção usam `https://proatleta.site/api`.

## Publicar a API na Hostinger

1. Envie a pasta `api/` para `public_html/api/`.
2. Rode `api/schema.mysql.sql` no phpMyAdmin.
3. Copie `api/config.exemplo.php` para `api/config.php` no servidor e preencha os dados do banco.
4. Faça o mesmo com `Website/php/config.exemplo.php` → `Website/php/config.php`.

`config.php` está no `.gitignore`: senha de banco nunca vai para o GitHub.

## De onde vêm as peneiras

1. **Instituições** publicam pelo site (`instituicoes.html`) ou pelo app (Cadastro → Escolinha ou clube).
2. **Notícias** vêm da API no Render (`https://api-proatleta.onrender.com/peneiras`). O Render dorme sem uso, então a primeira chamada pode levar até 1 minuto; site e app mostram o que está salvo e atualizam por trás.

"Melhores peneiras" usa uma nota calculada na API (`pontuar()` em `api/peneiras.php`): destaque manual, instituição verificada, data próxima e informação completa. Para verificar uma instituição ou destacar uma peneira, mude `verificada` ou `destaque` para 1 no banco.
