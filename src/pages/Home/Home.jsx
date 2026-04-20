import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <main className="public-page">
      <section className="hero-card">
        <span className="eyebrow">React + Laravel API</span>
        <h1>Un panel listo para consumir tu backend con JWT.</h1>
        <p>
          Login, registro, refresco de token y un dashboard inicial con
          categorias y analisis.
        </p>

        <div className="hero-card__actions">
          <Link className="button" to="/login">
            Ir al login
          </Link>
          <Link className="button button--ghost" to="/register">
            Crear cuenta
          </Link>
        </div>
      </section>

      <section className="feature-grid">
        <article className="feature-card">
          <span className="feature-card__tag">Auth</span>
          <h2>JWT completo</h2>
          <p>Guarda access y refresh token, y refresca automaticamente cuando haga falta.</p>
        </article>
        <article className="feature-card">
          <span className="feature-card__tag">API</span>
          <h2>Servicio centralizado</h2>
          <p>Las llamadas viven en `services/api.js` para escalar sin desorden.</p>
        </article>
        <article className="feature-card">
          <span className="feature-card__tag">UI</span>
          <h2>Arquitectura clara</h2>
          <p>Componentes por rol, paginas separadas y un layout de dashboard reutilizable.</p>
        </article>
      </section>
    </main>
  )
}
