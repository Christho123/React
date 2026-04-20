import { Button } from '../Button/Button.jsx'
import { Input } from '../Input/Input.jsx'

export function RegisterForm({
  values,
  errors,
  onChange,
  onSubmit,
  loading = false,
  apiError = '',
}) {
  const handleSubmit = (event) => {
    event.preventDefault()
    onSubmit(event)
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      <div className="auth-form__body">
        <Input
          name="name"
          type="text"
          label="Nombre"
          placeholder="Juan Perez"
          value={values.name}
          onChange={onChange}
          error={errors.name}
          autoComplete="name"
          required
        />

        <Input
          name="email"
          type="email"
          label="Correo electronico"
          placeholder="juan@example.com"
          value={values.email}
          onChange={onChange}
          error={errors.email}
          autoComplete="email"
          required
        />

        <Input
          name="password"
          type="password"
          label="Contrasena"
          placeholder="Minimo 6 caracteres"
          value={values.password}
          onChange={onChange}
          error={errors.password}
          autoComplete="new-password"
          required
        />

        <Input
          name="password_confirmation"
          type="password"
          label="Confirmar contrasena"
          placeholder="Repite tu contrasena"
          value={values.password_confirmation}
          onChange={onChange}
          error={errors.password_confirmation}
          autoComplete="new-password"
          required
        />

        {apiError ? <div className="form-alert">{apiError}</div> : null}

        <Button type="submit" className="button--wide" disabled={loading}>
          {loading ? 'Creando cuenta...' : 'Registrar'}
        </Button>
      </div>
    </form>
  )
}
