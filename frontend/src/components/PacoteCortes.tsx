// Steppers (+/-) em vez de digitar número — o barbeiro só toca, sem
// precisar acertar o teclado numérico no celular pra editar um cliente.
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

  return (
    <div className="pacote-cortes">
      <div className="pacote-linha">
        <span>Cortes pagos</span>
        <div className="stepper">
          <button type="button" onClick={() => onChangePagos(Math.max(0, pagos - 1))}>
            −
          </button>
          <strong>{pagos}</strong>
          <button type="button" onClick={() => onChangePagos(pagos + 1)}>
            +
          </button>
        </div>
      </div>

      <div className="pacote-linha">
        <span>Cortes usados</span>
        <div className="stepper">
          <button type="button" onClick={() => onChangeUsados(Math.max(0, usados - 1))}>
            −
          </button>
          <strong>{usados}</strong>
          <button type="button" onClick={() => onChangeUsados(usados + 1)}>
            +
          </button>
        </div>
      </div>

      <p className={restam === 0 ? 'pacote-restam pacote-restam-zerado' : 'pacote-restam'}>
        Restam {restam} corte{restam === 1 ? '' : 's'}
      </p>
    </div>
  )
}
