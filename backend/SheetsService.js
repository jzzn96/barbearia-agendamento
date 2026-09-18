// Camada de acesso baixo-nível às duas abas da planilha. Nenhuma regra de
// negócio aqui — isso fica em Agendamentos.js e Clientes.js.

const ABA_CLIENTES = 'Clientes'
const CABECALHO_CLIENTES = ['telefone', 'nome', 'mensal', 'cortesPagosMes', 'mesReferencia', 'criadoEm', 'atualizadoEm']

const ABA_AGENDAMENTOS = 'Agendamentos'
const CABECALHO_AGENDAMENTOS = ['id', 'eventoCalendarId', 'telefoneCliente', 'nomeCliente', 'data', 'horario', 'servico', 'duracaoMin', 'status', 'barbeiroId', 'criadoEm']

// Cria a aba com cabeçalho na primeira vez que for usada — não precisa
// preparar a planilha manualmente antes de rodar, só criar uma em branco.
function getAba(nome, cabecalho) {
  const planilha = SpreadsheetApp.openById(getConfig().sheetId)
  let aba = planilha.getSheetByName(nome)
  if (!aba) {
    aba = planilha.insertSheet(nome)
    aba.appendRow(cabecalho)

    // Trava colunas que parecem número/data como texto puro, senão o
    // Sheets autoconverte sozinho (ver objetoDaLinha() pra por que importa).
    ;['data', 'horario', 'telefone', 'telefoneCliente'].forEach((chave) => {
      const idx = cabecalho.indexOf(chave)
      if (idx !== -1) aba.getRange(1, idx + 1, 1000, 1).setNumberFormat('@')
    })
  }
  return aba
}

function linhasComoObjetos(aba, cabecalho) {
  const valores = aba.getDataRange().getValues()
  return valores.slice(1).map((linha) => objetoDaLinha(cabecalho, linha))
}

// O Sheets converte sozinho um texto tipo "2026-09-18" ou "09:00" pra um
// valor de Data/Hora de verdade — isso quebra toda comparação de string
// feita no resto do código (ex: `l.data === data` em listarAgendamentosPorData).
// Normaliza de volta pra string na leitura, não importa como foi gravado.
function objetoDaLinha(cabecalho, linha) {
  const obj = {}
  cabecalho.forEach((chave, i) => {
    let valor = linha[i]
    if (chave === 'data' && valor instanceof Date) {
      valor = Utilities.formatDate(valor, 'America/Sao_Paulo', 'yyyy-MM-dd')
    }
    if (chave === 'horario' && valor instanceof Date) {
      valor = Utilities.formatDate(valor, 'America/Sao_Paulo', 'HH:mm')
    }
    if (chave === 'mesReferencia' && valor instanceof Date) {
      valor = Utilities.formatDate(valor, 'America/Sao_Paulo', 'yyyy-MM')
    }
    // Telefone "só número" (ex: 5511987654321) também vira Number sozinho no
    // Sheets — se voltar assim pro front, quebra o .replace() de normalizePhone().
    if ((chave === 'telefone' || chave === 'telefoneCliente') && typeof valor === 'number') {
      valor = String(valor)
    }
    obj[chave] = valor
  })
  return obj
}
