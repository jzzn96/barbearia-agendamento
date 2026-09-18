// Camada de acesso baixo-nível às duas abas da planilha. Nenhuma regra de
// negócio aqui — isso fica em Agendamentos.js e Clientes.js.

const ABA_CLIENTES = 'Clientes'
const CABECALHO_CLIENTES = ['telefone', 'nome', 'mensal', 'cortesPagosMes', 'mesReferencia', 'criadoEm', 'atualizadoEm']

const ABA_AGENDAMENTOS = 'Agendamentos'
const CABECALHO_AGENDAMENTOS = ['id', 'eventoCalendarId', 'telefoneCliente', 'nomeCliente', 'data', 'horario', 'status', 'barbeiroId', 'criadoEm']

// Cria a aba com cabeçalho na primeira vez que for usada — não precisa
// preparar a planilha manualmente antes de rodar, só criar uma em branco.
function getAba(nome, cabecalho) {
  const planilha = SpreadsheetApp.openById(getConfig().sheetId)
  let aba = planilha.getSheetByName(nome)
  if (!aba) {
    aba = planilha.insertSheet(nome)
    aba.appendRow(cabecalho)
  }
  return aba
}

function linhasComoObjetos(aba, cabecalho) {
  const valores = aba.getDataRange().getValues()
  return valores.slice(1).map((linha) => objetoDaLinha(cabecalho, linha))
}

function objetoDaLinha(cabecalho, linha) {
  const obj = {}
  cabecalho.forEach((chave, i) => (obj[chave] = linha[i]))
  return obj
}
