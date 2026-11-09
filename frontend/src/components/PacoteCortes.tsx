const MAX_BOLINHAS = 12

// Steppers (+/-) em vez de digitar número — o barbeiro só toca. As bolinhas
// mostram o pacote de relance: cheia = corte já usado, vazia = ainda disponível.
export function PacoteCortes({
  pagos,
  usados,
  onChangePagos,
  onChangeUsados,
}: {
  pagos: number
  usados: number
  onChangePagos: (valor: number) => void
  onChangeUsados: (valor: number) => void
}) {
  const restam = Math.max(0, pagos - usados)
  const visiveis = Math.min(pagos, MAX_BOLINHAS)

  // Usados nunca pode passar de pagos — nem digitando +1 nele, nem
  // baixando pagos pra menos do que já tinha sido usado.
  function alterarPagos(novoPagos: number) {
    const pagosClamped = Math.max(0, novoPagos)
    onChangePagos(pagosClamped)
    if (usados > pagosClamped) onChangeUsados(pagosClamped)
  }

  function alterarUsados(novoUsados: number) {
    onChangeUsados(Math.min(pagos, Math.max(0, novoUsados)))
  }

  return (
    <div className="pacote">
      {pagos > 0 && (
        <div className="bolinhas" aria-hidden="true">
          {Array.from({ length: visiveis }, (_, i) => (
            <span key={i} className={i < usados ? 'bolinha usada' : 'bolinha'} />
          ))}
          {pagos > MAX_BOLINHAS && <span className="bolinhas-mais">+{pagos - MAX_BOLINHAS}</span>}
        </div>
      )}

      <div className="pacote-linha">
        <span>Cortes pagos</span>
        <div className="stepper">
          <button type="button" aria-label="Diminuir cortes pagos" onClick={() => alterarPagos(pagos - 1)}>
            −
          </button>
          <strong>{pagos}</strong>
          <button type="button" aria-label="Aumentar cortes pagos" onClick={() => alterarPagos(pagos + 1)}>
            +
          </button>
        </div>
      </div>

      <div className="pacote-linha">
        <span>Cortes usados</span>
        <div className="stepper">
          <button type="button" aria-label="Diminuir cortes usados" onClick={() => alterarUsados(usados - 1)}>
            −
          </button>
          <strong>{usados}</strong>
          <button type="button" aria-label="Aumentar cortes usados" disabled={usados >= pagos} onClick={() => alterarUsados(usados + 1)}>
            +
          </button>
        </div>
      </div>

      <p className={restam === 0 ? 'restam zerado' : 'restam'}>
        Restam {restam} corte{restam === 1 ? '' : 's'}
      </p>
    </div>
  )
}
