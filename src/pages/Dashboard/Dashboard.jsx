import { useEffect, useState } from 'react'
import { Sidebar } from '../../components/layout/Sidebar/Sidebar.jsx'
import { DashboardLayout } from '../../components/layout/DashboardLayout/DashboardLayout.jsx'
import { Button } from '../../components/ui/Button/Button.jsx'
import { Input } from '../../components/ui/Input/Input.jsx'
import { Modal } from '../../components/ui/Modal/Modal.jsx'
import {
  createBrand,
  createCategory,
  createSupplier,
  deleteBrand,
  deleteCategory,
  deleteSupplier,
  getBrands,
  getCategories,
  getSuppliers,
  updateBrand,
  updateCategory,
  updateSupplier,
} from '../../services/api.js'
import { useAuth } from '../../hooks/useAuth.js'
import './Dashboard.css'

const PAGE_SIZES = [10, 20, 50]

const entityConfigs = {
  categories: {
    title: 'Categorias',
    entityLabel: 'categoria',
    pluralLabel: 'categorias',
    createLabel: 'Crear categoria',
    createSuccess: 'Categoria creada correctamente.',
    updateSuccess: 'Categoria actualizada correctamente.',
    deleteSuccess: 'Categoria eliminada correctamente.',
    emptyLabel: 'No hay categorias registradas.',
    listFn: getCategories,
    createFn: createCategory,
    updateFn: updateCategory,
    deleteFn: deleteCategory,
    initialForm: {
      name: '',
      description: '',
    },
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Tecnologia' },
      {
        name: 'description',
        label: 'Descripcion',
        type: 'textarea',
        placeholder: 'Productos electronicos',
      },
    ],
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripcion' },
    ],
  },
  brands: {
    title: 'Brands',
    entityLabel: 'brand',
    pluralLabel: 'brands',
    createLabel: 'Crear brand',
    createSuccess: 'Brand creada correctamente.',
    updateSuccess: 'Brand actualizada correctamente.',
    deleteSuccess: 'Brand eliminada correctamente.',
    emptyLabel: 'No hay brands registradas.',
    listFn: getBrands,
    createFn: createBrand,
    updateFn: updateBrand,
    deleteFn: deleteBrand,
    initialForm: {
      name: '',
      description: '',
    },
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Nike' },
      {
        name: 'description',
        label: 'Descripcion',
        type: 'textarea',
        placeholder: 'Marca deportiva',
      },
    ],
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'description', label: 'Descripcion' },
    ],
  },
  suppliers: {
    title: 'Suppliers',
    entityLabel: 'supplier',
    pluralLabel: 'suppliers',
    createLabel: 'Crear supplier',
    createSuccess: 'Supplier creado correctamente.',
    updateSuccess: 'Supplier actualizado correctamente.',
    deleteSuccess: 'Supplier eliminado correctamente.',
    emptyLabel: 'No hay suppliers registrados.',
    listFn: getSuppliers,
    createFn: createSupplier,
    updateFn: updateSupplier,
    deleteFn: deleteSupplier,
    initialForm: {
      name: '',
      email: '',
      phone: '',
      address: '',
    },
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Proveedor Central' },
      {
        name: 'email',
        label: 'Correo',
        type: 'email',
        placeholder: 'proveedor@example.com',
      },
      { name: 'phone', label: 'Telefono', type: 'text', placeholder: '999999999' },
      {
        name: 'address',
        label: 'Direccion',
        type: 'text',
        placeholder: 'Av. Principal 123',
      },
    ],
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Correo' },
      { key: 'phone', label: 'Telefono' },
      { key: 'address', label: 'Direccion' },
    ],
  },
}

function normalizeList(payload) {
  const data = payload?.data ?? payload ?? []
  const items = Array.isArray(data) ? data : data?.data ?? []

  return {
    items,
    meta: payload?.meta ?? data?.meta ?? {},
  }
}

function useEntityCrud({ config, enabled }) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [modalOpen, setModalOpen] = useState(false)
  const [editingId, setEditingId] = useState(null)
  const [form, setForm] = useState(config.initialForm)
  const [saving, setSaving] = useState(false)

  const reload = async (nextPage = page, nextPageSize = pageSize, nextSearch = searchTerm) => {
    setLoading(true)
    setError('')

    try {
      const response = await config.listFn({
        page: nextPage,
        pageSize: nextPageSize,
        search: nextSearch,
      })

      const normalized = normalizeList(response)
      setItems(normalized.items)
      setMeta(normalized.meta)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) {
      return
    }

    // eslint-disable-next-line react-hooks/set-state-in-effect
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, page, pageSize, searchTerm])

  const openCreate = () => {
    setEditingId(null)
    setForm(config.initialForm)
    setModalOpen(true)
  }

  const openEdit = (item) => {
    setEditingId(item.id)
    setForm({
      ...config.initialForm,
      ...item,
    })
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) {
      return
    }

    setModalOpen(false)
    setEditingId(null)
    setForm(config.initialForm)
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setMessage('')

    try {
      if (editingId) {
        await config.updateFn(editingId, form)
        setMessage(config.updateSuccess)
      } else {
        await config.createFn(form)
        setMessage(config.createSuccess)
      }

      setModalOpen(false)
      setEditingId(null)
      setForm(config.initialForm)
      await reload(1, pageSize, searchTerm)
      setPage(1)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const deleteItem = async (item) => {
    const confirmed = window.confirm(
      `Deseas eliminar ${config.entityLabel} "${item.name}"?`,
    )

    if (!confirmed) {
      return
    }

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await config.deleteFn(item.id)
      setMessage(config.deleteSuccess)
      await reload(page, pageSize, searchTerm)
    } catch (requestError) {
      setError(requestError.message)
    } finally {
      setSaving(false)
    }
  }

  const submitSearch = (event) => {
    event.preventDefault()
    setPage(1)
    setSearchTerm(searchDraft.trim())
  }

  const changePageSize = (nextSize) => {
    setPage(1)
    setPageSize(nextSize)
  }

  const goToPreviousPage = () => {
    setPage((current) => Math.max(current - 1, 1))
  }

  const goToNextPage = () => {
    const lastPage = meta.last_page ?? page
    setPage((current) => Math.min(current + 1, lastPage))
  }

  return {
    items,
    meta,
    loading,
    error,
    message,
    searchDraft,
    setSearchDraft,
    page,
    pageSize,
    modalOpen,
    editingId,
    form,
    saving,
    openCreate,
    openEdit,
    closeModal,
    submitForm,
    deleteItem,
    submitSearch,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
    setForm,
    setMessage,
    config,
  }
}

function DashboardWelcome({ user }) {
  return (
    <section className="panel panel--welcome">
      <div>
        <span className="panel__eyebrow">Dashboard</span>
        <h2>Bienvenido, {user?.name ?? 'Usuario'}</h2>
        <p>Tu cuenta ya esta conectada. Aqui puedes administrar todo desde el sidebar.</p>
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
        Esta seccion se reservan para graficas, KPIs y metricas cuando agregues
        los endpoints de reportes.
      </p>
    </section>
  )
}

function EntityTable({ state }) {
  const {
    items,
    meta,
    loading,
    error,
    message,
    searchDraft,
    setSearchDraft,
    page,
    pageSize,
    modalOpen,
    editingId,
    form,
    saving,
    openCreate,
    openEdit,
    closeModal,
    submitForm,
    deleteItem,
    submitSearch,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
    setForm,
    config,
  } = state

  const total = meta.total ?? items.length
  const currentPage = meta.current_page ?? page
  const lastPage = meta.last_page ?? 1

  return (
    <section className="dashboard-content">
      <div className="panel panel--toolbar panel--categories">
        <div className="panel__filters">
          <form className="inline-form" onSubmit={submitSearch}>
            <Input
              name={`search-${config.title}`}
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
              value={pageSize}
              onChange={(event) => changePageSize(Number(event.target.value))}
            >
              {PAGE_SIZES.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </label>

          <Button onClick={openCreate}>{config.createLabel}</Button>
        </div>
      </div>

      {message ? <div className="form-alert form-alert--success">{message}</div> : null}
      {error ? <div className="form-alert">{error}</div> : null}

      <div className="panel panel--table">
        <div className="entity-table-shell">
          {loading ? (
            <div className="empty-state">Cargando {config.pluralLabel}...</div>
          ) : items.length ? (
            <table className="table">
              <thead>
                <tr>
                  {config.columns.map((column) => (
                    <th key={column.key}>{column.label}</th>
                  ))}
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id}>
                    {config.columns.map((column) => (
                      <td key={column.key}>{item[column.key] ?? '-'}</td>
                    ))}
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="secondary" onClick={() => openEdit(item)}>
                          Editar
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          onClick={() => deleteItem(item)}
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
            <div className="empty-state">{config.emptyLabel}</div>
          )}
        </div>

        <div className="pagination-bar">
          <span>
            Pagina {currentPage} de {lastPage} | {total} registros
          </span>

          <div className="pagination-actions">
            <Button
              type="button"
              variant="secondary"
              onClick={goToPreviousPage}
              disabled={currentPage <= 1}
            >
              Anterior
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={goToNextPage}
              disabled={currentPage >= lastPage}
            >
              Siguiente
            </Button>
          </div>
        </div>
      </div>

      <Modal
        open={modalOpen}
        title={editingId ? `Editar ${config.entityLabel}` : config.createLabel}
        onClose={closeModal}
      >
        <form className="stack-form" onSubmit={submitForm}>
          {config.fields.map((field) =>
            field.type === 'textarea' ? (
              <Input
                key={field.name}
                name={field.name}
                label={field.label}
                placeholder={field.placeholder}
                value={form[field.name] ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
                textarea
                rows={5}
              />
            ) : (
              <Input
                key={field.name}
                name={field.name}
                type={field.type}
                label={field.label}
                placeholder={field.placeholder}
                value={form[field.name] ?? ''}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    [field.name]: event.target.value,
                  }))
                }
              />
            ),
          )}

          <div className="stack-form__actions">
            <Button type="submit" disabled={saving}>
              {saving
                ? 'Guardando...'
                : editingId
                  ? 'Guardar cambios'
                  : 'Crear'}
            </Button>
            <Button type="button" variant="ghost" onClick={closeModal}>
              Cancelar
            </Button>
          </div>
        </form>
      </Modal>
    </section>
  )
}

export function DashboardPage() {
  const auth = useAuth()
  const [activeSection, setActiveSection] = useState('dashboard')

  const categories = useEntityCrud({
    config: entityConfigs.categories,
    enabled: activeSection === 'categories',
  })

  const brands = useEntityCrud({
    config: entityConfigs.brands,
    enabled: activeSection === 'brands',
  })

  const suppliers = useEntityCrud({
    config: entityConfigs.suppliers,
    enabled: activeSection === 'suppliers',
  })

  const sectionState = {
    categories,
    brands,
    suppliers,
  }

  const handleSectionChange = (section) => {
    setActiveSection(section)
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
        {activeSection === 'dashboard' ? (
          <div className="dashboard-topbar">
            <div>
              <span className="eyebrow">Dashboard</span>
              <h1>Panel de administracion</h1>
            </div>
          </div>
        ) : null}

        {activeSection === 'dashboard' ? <DashboardWelcome user={auth.user} /> : null}
        {activeSection === 'analytics' ? <AnalysisEmpty /> : null}

        {activeSection === 'categories' ? <EntityTable state={sectionState.categories} /> : null}
        {activeSection === 'brands' ? <EntityTable state={sectionState.brands} /> : null}
        {activeSection === 'suppliers' ? <EntityTable state={sectionState.suppliers} /> : null}
      </DashboardLayout>
    )
}
