import { useEffect, useState } from 'react'
import { Sidebar } from '../../components/layout/Sidebar/Sidebar.jsx'
import { DashboardLayout } from '../../components/layout/DashboardLayout/DashboardLayout.jsx'
import { Button } from '../../components/ui/Button/Button.jsx'
import { Input } from '../../components/ui/Input/Input.jsx'
import { Modal } from '../../components/ui/Modal/Modal.jsx'
import {
  createCategory,
  deleteCategory,
  getCategories,
  updateCategory,
} from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.js'
import './Dashboard.css'

const initialCategory = {
  name: '',
  description: '',
}

function normalizeCategories(payload) {
  const data = payload?.data ?? payload ?? []
  const items = Array.isArray(data) ? data : data?.data ?? []

  return {
    items,
    meta: payload?.meta ?? data?.meta ?? {},
  }
}

function DashboardWelcome({ user }) {
  return (
    <section className="panel panel--welcome">
      <div>
        <span className="panel__eyebrow">Dashboard</span>
        <h2>Bienvenido, {user?.name ?? 'Usuario'}</h2>
        <p>Tu cuenta ya está conectada. Aquí puedes administrar todo desde el sidebar.</p>
      </div>

      <div className="welcome-email">
        <span>Correo</span>
        <strong>{user?.email ?? 'Sin correo'}</strong>
      </div>
    </section>
  )
}

function AnalysisEmpty() {
  return (
    <section className="panel panel--analysis">
      <span className="panel__eyebrow">Analisis</span>
      <h2>En desarrollo</h2>
      <p>
        Esta sección se reservará para gráficas, KPIs y métricas cuando agregues
        los endpoints de reportes.
      </p>
    </section>
  )
}

export function DashboardPage() {
  const auth = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')
  const [categories, setCategories] = useState([])
  const [meta, setMeta] = useState({})
  const [loadingCategories, setLoadingCategories] = useState(false)
  const [tableError, setTableError] = useState('')
  const [tableMessage, setTableMessage] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [perPage, setPerPage] = useState(10)
  const [submitting, setSubmitting] = useState(false)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [categoryForm, setCategoryForm] = useState(initialCategory)

  useEffect(() => {
    if (activeSection !== 'categories') {
      return
    }

    const loadCategories = async () => {
      setLoadingCategories(true)
      setTableError('')

      try {
        const response = await getCategories({
          perPage,
          search: searchTerm,
        })

        const normalized = normalizeCategories(response)
        setCategories(normalized.items)
        setMeta(normalized.meta)
      } catch (error) {
        setTableError(error.message)
      } finally {
        setLoadingCategories(false)
      }
    }

    loadCategories()
  }, [activeSection, perPage, searchTerm])

  const handleSectionChange = (section) => {
    setActiveSection(section)
    setTableError('')
    setTableMessage('')
  }

  const openCreateModal = () => {
    setEditingCategoryId(null)
    setCategoryForm(initialCategory)
    setModalOpen(true)
  }

  const openEditModal = (category) => {
    setEditingCategoryId(category.id)
    setCategoryForm({
      name: category.name ?? '',
      description: category.description ?? '',
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (submitting) {
      return
    }

    setModalOpen(false)
    setEditingCategoryId(null)
    setCategoryForm(initialCategory)
  }

  const handleCategoryChange = (event) => {
    const { name, value } = event.target
    setCategoryForm((current) => ({ ...current, [name]: value }))
  }

  const refreshCategories = async () => {
    const response = await getCategories({
      perPage,
      search: searchTerm,
    })

    const normalized = normalizeCategories(response)
    setCategories(normalized.items)
    setMeta(normalized.meta)
  }

  const handleCategorySubmit = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setTableError('')
    setTableMessage('')

    try {
      if (editingCategoryId) {
        await updateCategory(editingCategoryId, categoryForm)
        setTableMessage('Categoria actualizada correctamente.')
      } else {
        await createCategory(categoryForm)
        setTableMessage('Categoria creada correctamente.')
      }

      setModalOpen(false)
      setEditingCategoryId(null)
      setCategoryForm(initialCategory)
      await refreshCategories()
    } catch (error) {
      setTableError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCategory = async (category) => {
    const confirmed = window.confirm(
      `Deseas eliminar la categoria "${category.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setSubmitting(true)
    setTableError('')
    setTableMessage('')

    try {
      await deleteCategory(category.id)
      setTableMessage('Categoria eliminada correctamente.')
      await refreshCategories()
    } catch (error) {
      setTableError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          activeSection={activeSection}
          onSectionChange={handleSectionChange}
          onLogout={auth.logout}
          user={auth.user}
        />
      }
    >
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Panel de administracion</h1>
          <p>Sidebar fijo, secciones limpias y CRUD de categorías por AJAX.</p>
        </div>
      </div>

      {activeSection === 'dashboard' ? (
        <DashboardWelcome user={auth.user} />
      ) : null}

      {activeSection === 'analytics' ? <AnalysisEmpty /> : null}

      {activeSection === 'categories' ? (
        <section className="dashboard-content">
          <div className="panel panel--toolbar panel--categories">
            <div className="panel__toolbar">
              <div>
                <span className="panel__eyebrow">Categorias</span>
                <h2>Administracion</h2>
              </div>

              <Button onClick={openCreateModal}>Crear categoria</Button>
            </div>

            <div className="panel__filters">
              <form
                className="inline-form"
                onSubmit={(event) => {
                  event.preventDefault()
                  setSearchTerm(searchDraft.trim())
                }}
              >
                <Input
                  name="search"
                  label="Buscar"
                  placeholder="Escribe un nombre"
                  value={searchDraft}
                  onChange={(event) => setSearchDraft(event.target.value)}
                />

                <Button type="submit" variant="secondary">
                  Buscar
                </Button>
              </form>

              <label className="select-field">
                <span>Por pagina</span>
                <select
                  value={perPage}
                  onChange={(event) => setPerPage(Number(event.target.value))}
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                </select>
              </label>
            </div>
          </div>

          {tableMessage ? (
            <div className="form-alert form-alert--success">{tableMessage}</div>
          ) : null}
          {tableError ? <div className="form-alert">{tableError}</div> : null}

          <div className="panel panel--table">
            <div className="table-shell">
              {loadingCategories ? (
                <div className="empty-state">Cargando categorias...</div>
              ) : categories.length ? (
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th>
                      <th>Descripcion</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.name}</td>
                        <td>{category.description ?? '-'}</td>
                        <td>
                          <div className="table-actions">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(category)}
                            >
                              Editar
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="button--danger"
                              onClick={() => handleDeleteCategory(category)}
                            >
                              Eliminar
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="empty-state">
                  No hay categorias registradas. Crea la primera con el boton
                  superior.
                </div>
              )}
            </div>

            <div className="pagination-hint">
              Mostrando {categories.length} de {meta.total ?? categories.length}{' '}
              categorias.
            </div>
          </div>
        </section>
      ) : null}

      <Modal
        open={modalOpen}
        title={editingCategoryId ? 'Editar categoria' : 'Crear categoria'}
        onClose={closeModal}
      >
        <form className="stack-form" onSubmit={handleCategorySubmit}>
          <Input
            name="name"
            label="Nombre"
            placeholder="Tecnologia"
            value={categoryForm.name}
            onChange={handleCategoryChange}
            required
          />

          <Input
            name="description"
            label="Descripcion"
            placeholder="Productos electronicos"
            value={categoryForm.description}
            onChange={handleCategoryChange}
            textarea
            rows={5}
          />

          <div className="stack-form__actions">
            <Button type="submit" disabled={submitting}>
              {submitting
                ? 'Guardando...'
                : editingCategoryId
                  ? 'Guardar cambios'
                  : 'Crear categoria'}
            </Button>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </DashboardLayout>
  )
}