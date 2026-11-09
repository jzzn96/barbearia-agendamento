// Campo de valor em reais, usado no plano mensal e no valor pago do pacote.
export function CampoValorMensal({
  valor,
  onChange,
  rotulo = 'Valor mensal',
}: {
  valor: number
  onChange: (valor: number) => void
  rotulo?: string
}) {
  return (
    <div className="pacote-linha">
      <span>{rotulo}</span>
      <div className="input-moeda">
        <span>R$</span>
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          aria-label={`${rotulo} em reais`}
          value={valor === 0 ? '' : valor}
          placeholder="0,00"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
    </div>
  )
}
