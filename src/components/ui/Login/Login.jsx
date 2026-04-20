import { Button } from '../Button/Button.jsx'

export function LoginForm({ values, errors, apiError, loading, onChange, onSubmit }) {
  return (
    <form className="auth-form" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
      
      {/* Error Global de la API */}
      {apiError && (
        <div className="form-alert">
          <span style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
            ⚠️ {apiError}
          </span>
        </div>
      )}

      <div className="auth-form__body">
        {/* Campo Email */}
        <div className="field">
          <label htmlFor="email" className="field__label">Correo Electrónico</label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="ejemplo@correo.com"
            className={`field__control ${errors.email ? 'field__control--error' : ''}`}
            value={values.email}
            onChange={onChange}
          />
          {errors.email && <span className="field__error">{errors.email}</span>}
        </div>

        {/* Campo Password */}
        <div className="field">
          <label htmlFor="password" className="field__label">Contraseña</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className={`field__control ${errors.password ? 'field__control--error' : ''}`}
            value={values.password}
            onChange={onChange}
          />
          {errors.password && <span className="field__error">{errors.password}</span>}
        </div>
      </div>

      <div className="auth-form__actions" style={{ marginTop: '1.5rem' }}>
        <Button 
          type="submit" 
          className="button--wide" 
          disabled={loading}
        >
          {loading ? 'Verificando...' : 'Iniciar Sesión'}
        </Button>
      </div>
    </form>
  )
}