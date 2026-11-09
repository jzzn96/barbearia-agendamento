const MAX_BOLINHAS = 12

// Saldo só para leitura: o barbeiro não digita número. Bolinha cheia = corte
// já usado, vazia = ainda disponível.
export function SaldoCortes({ comprados, saldo }: { comprados: number; saldo: number }) {
  const usados = Math.max(0, comprados - saldo)
  const visiveis = Math.min(comprados, MAX_BOLINHAS)

  return (
    <div className="pacote">
      {comprados > 0 && (
        <div className="bolinhas" aria-hidden="true">
          {Array.from({ length: visiveis }, (_, i) => (
            <span key={i} className={i < usados ? 'bolinha usada' : 'bolinha'} />
          ))}
          {comprados > MAX_BOLINHAS && <span className="bolinhas-mais">+{comprados - MAX_BOLINHAS}</span>}
        </div>
      )}
      <p className={saldo === 0 ? 'restam zerado' : 'restam'}>
        {saldo === 0 ? 'Sem cortes no saldo' : `Saldo: ${saldo} corte${saldo === 1 ? '' : 's'}`}
      </p>
    </div>
  )
}
