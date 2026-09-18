# Backend (Google Apps Script)

Esse código não roda sozinho — precisa ser colado dentro de um projeto do
Apps Script e implantado como "Web App". Passo a passo:

## 1. Preparar a Planilha e a Agenda

1. Crie uma **Google Sheets em branco** (pode ficar vazia — as abas
   `Clientes` e `Agendamentos` são criadas sozinhas na primeira execução).
   Copie o **ID da planilha** a partir da URL:
   `docs.google.com/spreadsheets/d/`**`ESSE_PEDAÇO_AQUI`**`/edit`
2. No **Google Agenda** do barbeiro, confirme qual calendário vai receber
   os agendamentos (pode ser o principal dele). Em
   "Configurações e compartilhamento" desse calendário, copie o
   **ID do calendário** (geralmente é o próprio e-mail do Google, ou um
   ID terminado em `@group.calendar.google.com` se for uma agenda extra).

## 2. Criar o projeto no Apps Script

1. Acesse [script.google.com](https://script.google.com) → **Novo projeto**.
2. Apague o `Code.gs` padrão. Recrie um arquivo de script pra cada arquivo
   desta pasta (`Code.js`, `Config.js`, `SheetsService.js`,
   `CalendarService.js`, `Clientes.js`, `Agendamentos.js`) e cole o
   conteúdo correspondente. Não precisa manter a extensão `.js` — o editor
   usa `.gs` internamente, o nome é só rótulo.
3. Em **Configurações do projeto** (ícone de engrenagem) → marque
   "Mostrar arquivo de manifesto `appsscript.json`" → cole o conteúdo de
   `appsscript.json` desta pasta por cima do que já existe lá.

## 3. Configurar os segredos (Propriedades do Script)

Em **Configurações do projeto → Propriedades do Script → Adicionar
propriedade do script**, crie estas três:

| Propriedade | Valor |
|---|---|
| `CALENDAR_ID` | o ID copiado no passo 1 |
| `SHEET_ID` | o ID da planilha copiado no passo 1 |
| `BARBER_PIN` | um PIN numérico simples que o barbeiro vai digitar no painel |

Nada disso fica no código — só aqui, dentro do projeto do Apps Script.

## 4. Implantar como Web App

1. **Implantar → Nova implantação**.
2. Tipo: **App da Web**.
3. "Executar como": **Eu** (sua conta — é ela que fica autorizada a mexer
   na Agenda/Planilha).
4. "Quem tem acesso": **Qualquer pessoa** (precisa ser público pra página
   de agendamento funcionar sem exigir login do cliente).
5. Implantar → autorize as permissões pedidas (Agenda + Planilha) na
   primeira vez.
6. Copie a URL gerada (termina em `/exec`) — ela vai no `.env` do
   front-end, em `VITE_APPS_SCRIPT_URL`.

**Importante:** toda vez que você editar o código depois de já ter
implantado, precisa ir em **Implantar → Gerenciar implantações → editar
(ícone de lápis) → Nova versão → Implantar** pra publicar a mudança. Só
salvar o arquivo não atualiza a versão pública.

## Endpoints expostos

| `action` | Método | Autenticação |
|---|---|---|
| `horariosDisponiveis` | GET | pública |
| `criarAgendamento` | POST | pública |
| `listarAgendamentos` | GET | `pin` |
| `listarClientes` | GET | `pin` |
| `atualizarStatusCliente` | POST | `pin` |
| `cancelarAgendamento` | POST | `pin` |

## TODOs conhecidos (não bloqueiam o piloto)

- Sem intervalo de almoço no expediente (`Config.js`) — se a barbearia
  fechar meio-dia, ajustar `gerarSlots()` em `CalendarService.js`.
- `rejeitarSpam` é uma checagem simples (mesmo telefone, 5 min) — não é
  CAPTCHA. Suficiente pro piloto, revisar se abuso real aparecer.
- PIN é proteção leve, não é autenticação de verdade — ver ressalva no
  README raiz do projeto.
