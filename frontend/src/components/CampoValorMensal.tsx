// Preço do pacote mensal do cliente — fica logo abaixo do toggle "Cliente
// mensal", antes dos steppers de cortes pagos/usados.
export function CampoValorMensal({ valor, onChange }: { valor: number; onChange: (valor: number) => void }) {
  return (
    <div className="pacote-linha">
      <span>Valor mensal</span>
      <div className="input-moeda">
        <span>R$</span>
        <input
          type="number"
          min={0}
          step="0.01"
          inputMode="decimal"
          value={valor === 0 ? '' : valor}
          placeholder="0,00"
          onChange={(e) => onChange(Math.max(0, Number(e.target.value) || 0))}
        />
      </div>
    </div>
  )
}
