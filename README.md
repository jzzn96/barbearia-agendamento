# Barbearia — agendamento (PWA + Google Agenda/Sheets, custo zero)

Sistema de agendamento pra teste numa barbearia real: cliente marca
horário direto na Agenda do barbeiro (sem furo de horário duplicado),
lead cai numa planilha, barbeiro controla plano mensal/combo e manda
lembrete pelo WhatsApp dele (sem API paga).

Arquitetura completa e as decisões por trás dela: ver a conversa que
gerou este projeto. Resumo:

```
GitHub Pages (front-end estático)  →  Google Apps Script (back-end grátis)  →  Google Agenda + Sheets
```

## Estrutura

- **`frontend/`** — PWA em React + Vite + TypeScript. Página pública de
  agendamento + painel do barbeiro (agenda do dia, clientes, lembrete
  WhatsApp). Ver `frontend/src/pages/`.
- **`backend/`** — código do Google Apps Script (não roda sozinho, precisa
  ser colado no editor do Apps Script — passo a passo em
  [`backend/README.md`](backend/README.md)).

## Rodando o front-end localmente

```bash
cd frontend
npm install
cp .env.example .env   # depois de implantar o backend, cola a URL aqui
npm run dev
```

Sem `VITE_APPS_SCRIPT_URL` configurada, a tela pública mostra o erro
("configuração incompleta") em vez de travar silenciosamente — é
esperado até o backend estar implantado.

## Ordem recomendada pra colocar no ar

1. Seguir [`backend/README.md`](backend/README.md) — criar a Planilha, a
   Agenda, implantar o Apps Script como Web App, anotar a URL.
2. Colar a URL em `frontend/.env` (`VITE_APPS_SCRIPT_URL`).
3. Testar local (`npm run dev`) — marcar um horário de teste, conferir se
   apareceu na Agenda e na Planilha.
4. Publicar `frontend/` no GitHub Pages (repositório público, Pages
   apontando pra branch de build). Esse passo ainda não foi feito — avisar
   quando quiser seguir pra ele.

## Decisões que valem lembrar

- **PIN do painel é proteção leve, não autenticação de verdade.** Serve
  pra afastar visitante casual da página pública, não resiste a alguém
  tentando de propósito. OK pro piloto com um amigo; se virar produto de
  verdade (multi-barbearia, pago), precisa virar login de verdade.
- **Lembrete de WhatsApp é sempre manual.** O botão só monta o link
  `wa.me` com a mensagem pronta — o barbeiro tem que clicar "enviar" no
  WhatsApp dele. Não dá pra automatizar isso sem entrar numa API paga do
  WhatsApp, e foi decisão consciente não fazer isso agora.
- **Agenda é a fonte de verdade do horário; Planilha é o CRM.** Se o
  barbeiro cancelar algo direto no app do Google Agenda, isso não reflete
  sozinho na planilha — só quando o próximo agendamento pra aquele
  cliente for criado ou o painel recarregar a lista (que reconfere contra
  a Agenda).
