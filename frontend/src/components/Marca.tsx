export function Marca() {
  return (
    <div className="marca">
      <div className="marca-avatar">
        <img src={`${import.meta.env.BASE_URL}icons/icon.svg`} alt="Barbearia Gilmar Fongaro" />
      </div>
      <span className="marca-nome">Gilmar Fongaro</span>
    </div>
  )
}
