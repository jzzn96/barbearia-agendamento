import { BARBEARIA } from '../lib/barbearia'

export function Marca() {
  const [primeiro, ...resto] = BARBEARIA.nome.split(' ')

  return (
    <div className="marca">
      <div className="marca-avatar">
        <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="" />
      </div>
      <span className="marca-nome">
        {primeiro.toUpperCase()} <span>{resto.join(' ').toUpperCase()}</span>
      </span>
    </div>
  )
}
