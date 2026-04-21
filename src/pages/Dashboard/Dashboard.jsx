import { useEffect, useMemo, useRef, useState } from 'react'
import { Sidebar } from '../../components/layout/Sidebar/Sidebar.jsx'
import { DashboardLayout } from '../../components/layout/DashboardLayout/DashboardLayout.jsx'
import { Button } from '../../components/ui/Button/Button.jsx'
import { Input } from '../../components/ui/Input/Input.jsx'
import { Modal } from '../../components/ui/Modal/Modal.jsx'
import {
  Area,
  AreaChart,
  Bar,
  BarChart as RechartsBarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  createBrand,
  createCategory,
  createProduct,
  createPurchase,
  createSale,
  createSupplier,
  applyPurchasePriceUpdate,
  deleteBrand,
  deleteCategory,
  deleteProduct,
  deleteSupplier,
  getBrands,
  getCategories,
  getLowStockAlerts,
  getProducts,
  getPurchase,
  getPurchases,
  getSale,
  getSales,
  getSuppliers,
  getStockMovements,
  getPurchaseStats,
  getSalesStats,
  getStockInflowStats,
  getStockMovementStats,
  updateBrand,
  updateCategory,
  updateProduct,
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

function buildProductConfig({ brandOptions = [], categoryOptions = [] }) {
  return {
    title: 'Productos',
    entityLabel: 'producto',
    pluralLabel: 'productos',
    createLabel: 'Crear producto',
    createSuccess: 'Producto creado correctamente.',
    updateSuccess: 'Producto actualizado correctamente.',
    deleteSuccess: 'Producto eliminado correctamente.',
    emptyLabel: 'No hay productos registrados.',
    listFn: getProducts,
    createFn: createProduct,
    updateFn: updateProduct,
    deleteFn: deleteProduct,
    initialForm: {
      name: '',
      description: '',
      brand_id: '',
      category_id: '',
      price_purchase: 0,
      price_sale: 0,
      stock: 0,
    },
    fields: [
      { name: 'name', label: 'Nombre', type: 'text', placeholder: 'Camisa Classic' },
      {
        name: 'description',
        label: 'Descripcion',
        type: 'textarea',
        placeholder: 'Camisa de algodon',
      },
      {
        name: 'brand_id',
        label: 'Marca',
        type: 'select',
        placeholder: 'Selecciona una marca',
        options: brandOptions,
        coerce: 'number',
      },
      {
        name: 'category_id',
        label: 'Categoria',
        type: 'select',
        placeholder: 'Selecciona una categoria',
        options: categoryOptions,
        coerce: 'number',
      },
      {
        name: 'price_purchase',
        label: 'Precio compra',
        type: 'number',
        placeholder: '20',
        coerce: 'number',
      },
      {
        name: 'price_sale',
        label: 'Precio venta',
        type: 'number',
        placeholder: '30.68',
        coerce: 'number',
      },
      {
        name: 'stock',
        label: 'Stock',
        type: 'number',
        placeholder: '0',
        coerce: 'number',
      },
    ],
    columns: [
      { key: 'name', label: 'Nombre' },
      { key: 'brand.name', label: 'Marca' },
      { key: 'category.name', label: 'Categoria' },
      { key: 'price_purchase', label: 'Compra' },
      { key: 'price_sale', label: 'Venta' },
      { key: 'stock', label: 'Stock' },
    ],
  }
}

function normalizeList(payload) {
  const data = payload?.data ?? payload ?? []
  const items = Array.isArray(data) ? data : data?.data ?? []

  return {
    items,
    meta: payload?.meta ?? data?.meta ?? {},
  }
}

function getColumnValue(item, key) {
  if (!key) {
    return '-'
  }

  return key.split('.').reduce((current, part) => current?.[part], item) ?? '-'
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

function useLookupOptions(loader, enabled) {
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!enabled) {
      setOptions([])
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)

      try {
        const response = await loader()
        const normalized = normalizeList(response)
        const nextOptions = normalized.items.map((item) => ({
          value: item.id,
          label: item.name ?? `#${item.id}`,
          raw: item,
        }))

        if (!cancelled) {
          setOptions(nextOptions)
        }
      } catch {
        if (!cancelled) {
          setOptions([])
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [enabled, loader])

  return { options, loading }
}

function useResourceList({ listFn, detailFn, enabled }) {
  const [items, setItems] = useState([])
  const [meta, setMeta] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchDraft, setSearchDraft] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [selectedId, setSelectedId] = useState(null)
  const [selectedItem, setSelectedItem] = useState(null)

  const reload = async (nextPage = page, nextPageSize = pageSize, nextSearch = searchTerm) => {
    setLoading(true)
    setError('')

    try {
      const response = await listFn({
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

  const loadDetail = async (id) => {
    if (!detailFn || id == null) {
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await detailFn(id)
      const payload = response?.data ?? response ?? null
      setSelectedItem(payload)
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

    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, page, pageSize, searchTerm])

  useEffect(() => {
    if (!enabled) {
      setSelectedId(null)
      setSelectedItem(null)
    }
  }, [enabled])

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

  const selectItem = (id) => {
    setSelectedId(id)
    loadDetail(id)
  }

  return {
    items,
    meta,
    loading,
    error,
    searchDraft,
    setSearchDraft,
    page,
    pageSize,
    selectedId,
    selectedItem,
    submitSearch,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
    selectItem,
    reload,
    setSelectedItem,
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

function AnalysisSection({ workspace }) {
  if (!workspace) {
    return null
  }

  const { loading, error, stats } = workspace
  const inflowSeries = useMemo(() => stats.inflow?.series ?? [], [stats.inflow])
  const purchasesSeries = useMemo(() => stats.purchases?.series ?? [], [stats.purchases])
  const salesSeries = useMemo(() => stats.sales?.series ?? [], [stats.sales])
  const movementsSeries = useMemo(() => stats.movements?.series ?? [], [stats.movements])
  const lowStockItems = useMemo(() => stats.lowStock?.items ?? [], [stats.lowStock])

  return (
    <section className="dashboard-content section-fade analytics-page">
      <div className="panel panel--analysis analytics-hero">
        <div>
          <span className="panel__eyebrow">Analisis</span>
          <h2>Graficos Analiticos</h2>
          <p>
            Monitoreo de ingreso de stock, compras, ventas, movimientos y alertas
            de productos con inventario bajo.
          </p>
        </div>
        <div className="analytics-hero__stats">
          <div>
            <span>Total entradas</span>
            <strong>{stats.inflow?.summary?.total_quantity ?? 0}</strong>
          </div>
          <div>
            <span>Total compras</span>
            <strong>{stats.purchases?.summary?.total_purchases ?? 0}</strong>
          </div>
          <div>
            <span>Total ventas</span>
            <strong>{stats.sales?.summary?.total_sales ?? 0}</strong>
          </div>
        </div>
      </div>

      {error ? <div className="form-alert">{error}</div> : null}
      {loading ? <div className="form-alert form-alert--success">Cargando estadisticas...</div> : null}

      <div className="analytics-grid">
        <StatsCard
          eyebrow="Stock"
          title="Ingreso de stock"
          value={stats.inflow?.summary?.total_quantity ?? 0}
          description={`Periodo ${stats.inflow?.period?.start ?? '-'} al ${stats.inflow?.period?.end ?? '-'}`}
        >
          <LineChart series={inflowSeries} valueKey="quantity" stroke="#7c5cff" />
        </StatsCard>

        <StatsCard
          eyebrow="Compras"
          title="Compras registradas"
          value={stats.purchases?.summary?.total_purchases ?? 0}
          description={`Periodo ${stats.purchases?.period?.start ?? '-'} al ${stats.purchases?.period?.end ?? '-'}`}
        >
          <BarChart series={purchasesSeries} valueKey="count" barColor="#00d4ff" />
        </StatsCard>

        <StatsCard
          eyebrow="Ventas"
          title="Ventas registradas"
          value={stats.sales?.summary?.total_sales ?? 0}
          description={`Periodo ${stats.sales?.period?.start ?? '-'} al ${stats.sales?.period?.end ?? '-'}`}
        >
          <BarChart series={salesSeries} valueKey="count" barColor="#67e8a5" />
        </StatsCard>

        <StatsCard
          eyebrow="Movimientos"
          title="Entradas y salidas"
          value={stats.movements?.summary?.total_movements ?? 0}
          description={`Entradas: ${stats.movements?.summary?.entries_count ?? 0} | Salidas: ${stats.movements?.summary?.exits_count ?? 0}`}
        >
          <LineChart series={movementsSeries} valueKey="entries_quantity" stroke="#7c5cff" />
        </StatsCard>
      </div>

      <div className="analytics-grid analytics-grid--bottom">
        <article className="panel analytics-card analytics-card--dual">
          <div className="analytics-card__header">
            <span className="panel__eyebrow">Stock</span>
            <div>
              <h3>Movimientos de stock</h3>
              <strong>{stats.movements?.summary?.total_movements ?? 0}</strong>
            </div>
          </div>

          <div className="analytics-dual">
            <div className="analytics-dual__chart">
              <BarChart series={movementsSeries} valueKey="entries_quantity" barColor="#00d4ff" />
            </div>
            <div className="analytics-dual__chart">
              <BarChart series={movementsSeries} valueKey="exits_quantity" barColor="#ff6b7f" />
            </div>
          </div>

          <div className="analytics-dual__legend">
            <span>
              Entradas: {stats.movements?.summary?.entries_quantity ?? 0}
            </span>
            <span>
              Salidas: {stats.movements?.summary?.exits_quantity ?? 0}
            </span>
          </div>
        </article>

        <article className="panel analytics-card analytics-card--alerts">
          <div className="analytics-card__header">
            <span className="panel__eyebrow">Alertas</span>
            <div>
              <h3>Productos con stock bajo</h3>
              <strong>{stats.lowStock?.total ?? 0}</strong>
            </div>
          </div>

          <div className="analytics-alerts">
            {lowStockItems.length ? (
              lowStockItems.map((item) => (
                <div key={item.product_id} className="analytics-alerts__item">
                  <div>
                    <strong>{item.name}</strong>
                    <span>Stock actual: {item.stock}</span>
                  </div>
                  <div>
                    <span>Compra: {formatMoney(item.price_purchase)}</span>
                    <span>Venta: {formatMoney(item.price_sale)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="empty-state">No hay alertas de stock bajo.</div>
            )}
          </div>
        </article>
      </div>
    </section>
  )
}

function RecordTable({
  items,
  columns,
  loading,
  emptyLabel,
  onSelect,
  selectedId,
  actionLabel = 'Ver detalle',
}) {
  return (
    <div className="panel panel--table">
      <div className="entity-table-shell">
        {loading ? (
          <div className="empty-state">Cargando...</div>
        ) : items.length ? (
          <table className="table">
            <thead>
              <tr>
                {columns.map((column) => (
                  <th key={column.key}>{column.label}</th>
                ))}
                {onSelect ? <th>Acciones</th> : null}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} className={selectedId === item.id ? 'is-selected' : ''}>
                  {columns.map((column) => (
                    <td key={column.key}>{getColumnValue(item, column.key)}</td>
                  ))}
                  {onSelect ? (
                    <td>
                      <div className="table-actions">
                        <Button type="button" variant="secondary" onClick={() => onSelect(item.id)}>
                          {actionLabel}
                        </Button>
                      </div>
                    </td>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">{emptyLabel}</div>
        )}
      </div>
    </div>
  )
}

function todayDateInput() {
  return new Date().toISOString().slice(0, 10)
}

function createLineItem() {
  return {
    product_id: '',
    quantity: 1,
    unit_price: '',
  }
}

function normalizeLedgerItem(item) {
  return {
    product_id: Number(item.product_id),
    quantity: Number(item.quantity),
    unit_price: Number(item.unit_price),
  }
}

function normalizePriceUpdateItem(item, index) {
  const currentPrice = Number(
    item.current_price ?? item.currentPrice ?? item.price_purchase ?? item.old_price ?? 0,
  )
  const newPrice = Number(item.new_price ?? item.newPrice ?? item.unit_price ?? 0)

  return {
    id: item.id ?? `${item.product_id ?? 'item'}-${index}`,
    name: item.product?.name ?? item.product_name ?? item.name ?? `Producto ${index + 1}`,
    currentPrice: Number.isFinite(currentPrice) ? currentPrice : 0,
    newPrice: Number.isFinite(newPrice) ? newPrice : 0,
  }
}

function formatMoney(value) {
  const amount = Number(value)
  return Number.isFinite(amount) ? amount.toFixed(2) : '0.00'
}

function formatAnalyticsDate(value) {
  return new Intl.DateTimeFormat('es-PE', {
    month: 'short',
    day: 'numeric',
  }).format(new Date(`${value}T00:00:00`))
}

function normalizeAnalyticsSeries(series = [], valueKey = 'quantity') {
  return series.map((item, index) => ({
    label: formatAnalyticsDate(item.date ?? `${index}`),
    rawLabel: item.date ?? `${index}`,
    value: Number(item[valueKey] ?? 0),
    item,
  }))
}

function AnalyticsTooltip({ active, payload, label }) {
  if (!active || !payload?.length) {
    return null
  }

  return (
    <div className="analytics-tooltip">
      <strong>{label}</strong>
      {payload.map((entry) => (
        <span key={entry.dataKey}>
          {entry.name}: {entry.value}
        </span>
      ))}
    </div>
  )
}

function LineChart({ series, valueKey = 'quantity', stroke = '#7c5cff' }) {
  const data = normalizeAnalyticsSeries(series, valueKey)
  if (!data.length) {
    return <div className="empty-state">Sin datos para mostrar.</div>
  }

  return (
    <div className="analytics-chart">
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <Tooltip content={<AnalyticsTooltip />} />
          <defs>
            <linearGradient id={`area-fill-${stroke.replace('#', '')}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.35" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0.03" />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            name="Cantidad"
            stroke={stroke}
            fill={`url(#area-fill-${stroke.replace('#', '')})`}
            strokeWidth={3}
            dot={{ r: 3, strokeWidth: 2, fill: 'var(--bg-soft)' }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function BarChart({ series, valueKey = 'count', barColor = '#00d4ff' }) {
  const data = normalizeAnalyticsSeries(series, valueKey)
  if (!data.length) {
    return <div className="empty-state">Sin datos para mostrar.</div>
  }

  return (
    <div className="analytics-chart">
      <ResponsiveContainer width="100%" height={260}>
        <RechartsBarChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }}
            axisLine={{ stroke: 'var(--border)' }}
            tickLine={false}
          />
          <Tooltip content={<AnalyticsTooltip />} />
          <Bar dataKey="value" name="Cantidad" fill={barColor} radius={[8, 8, 0, 0]} />
        </RechartsBarChart>
      </ResponsiveContainer>
    </div>
  )
}

function StatsCard({ eyebrow, title, value, description, children }) {
  return (
    <article className="panel analytics-card">
      <div className="analytics-card__header">
        <span className="panel__eyebrow">{eyebrow}</span>
        <div>
          <h3>{title}</h3>
          <strong>{value}</strong>
        </div>
      </div>
      {description ? <p className="analytics-card__description">{description}</p> : null}
      {children}
    </article>
  )
}

function useAnalyticsWorkspace(enabled) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [stats, setStats] = useState({
    inflow: null,
    purchases: null,
    sales: null,
    movements: null,
    lowStock: null,
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const [inflow, purchases, sales, movements, lowStock] = await Promise.all([
          getStockInflowStats({ range: 'week' }),
          getPurchaseStats({ range: 'month' }),
          getSalesStats({ range: 'month' }),
          getStockMovementStats({ range: 'month' }),
          getLowStockAlerts({ threshold: 15 }),
        ])

        if (!cancelled) {
          setStats({
            inflow: inflow?.data ?? null,
            purchases: purchases?.data ?? null,
            sales: sales?.data ?? null,
            movements: movements?.data ?? null,
            lowStock: lowStock?.data ?? null,
          })
        }
      } catch (requestError) {
        if (!cancelled) {
          setError(requestError.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    load()

    return () => {
      cancelled = true
    }
  }, [enabled])

  return { loading, error, stats }
}

function useLowStockNotice(enabled) {
  const [notice, setNotice] = useState(null)
  const lastSeenSignature = useRef('')
  const dismissedSignature = useRef('')

  useEffect(() => {
    if (!enabled) {
      return
    }

    let cancelled = false

    const load = async () => {
      try {
        const response = await getLowStockAlerts({ threshold: 15 })
        if (cancelled) {
          return
        }

        const data = response?.data ?? {}
        const items = data.items ?? []

        if (!items.length) {
          setNotice(null)
          lastSeenSignature.current = ''
          return
        }

        const signature = items
          .map((item) => `${item.product_id}:${item.stock}`)
          .join('|')

        if (signature !== lastSeenSignature.current && signature !== dismissedSignature.current) {
          lastSeenSignature.current = signature
          setNotice({
            signature,
            total: data.total ?? items.length,
            items,
          })
        }
      } catch {
        // Silently ignore background polling errors.
      }
    }

    load()
    const intervalId = window.setInterval(load, 120000)

    return () => {
      cancelled = true
      window.clearInterval(intervalId)
    }
  }, [enabled])

  const dismiss = () => {
    if (notice?.signature) {
      dismissedSignature.current = notice.signature
    }
    setNotice(null)
  }

  return { notice, dismiss }
}

function usePurchaseWorkspace(enabled) {
  const list = useResourceList({
    listFn: getPurchases,
    detailFn: getPurchase,
    enabled,
  })
  const supplierLookup = useLookupOptions(getSuppliers, enabled)
  const productLookup = useLookupOptions(getProducts, enabled)
  const [submitting, setSubmitting] = useState(false)
  const [statusMessage, setStatusMessage] = useState('')
  const [submitError, setSubmitError] = useState('')
  const [priceUpdatePrompt, setPriceUpdatePrompt] = useState(null)
  const [priceUpdateLoading, setPriceUpdateLoading] = useState(false)
  const [priceUpdateError, setPriceUpdateError] = useState('')
  const [form, setForm] = useState({
    supplier_id: '',
    date: todayDateInput(),
    items: [createLineItem()],
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    setForm({
      supplier_id: '',
      date: todayDateInput(),
      items: [createLineItem()],
    })
  }, [enabled])

  const updateLineItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const addLineItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, createLineItem()],
    }))
  }

  const removeLineItem = (index) => {
    setForm((current) => {
      const nextItems = current.items.filter((_, itemIndex) => itemIndex !== index)
      return {
        ...current,
        items: nextItems.length ? nextItems : [createLineItem()],
      }
    })
  }

  const resetForm = () => {
    setForm({
      supplier_id: '',
      date: todayDateInput(),
      items: [createLineItem()],
    })
  }

  const submitForm = async (event) => {
    event.preventDefault()
    setSubmitting(true)
    setPriceUpdateError('')
    setStatusMessage('')
    setSubmitError('')
    list.setSelectedItem(null)

    try {
      const response = await createPurchase({
        supplier_id: Number(form.supplier_id),
        date: form.date,
        items: form.items.map(normalizeLedgerItem),
      })

      const purchase = response?.data ?? response ?? null
      const flags = response?.flags ?? {}
      const purchaseId = purchase?.id ?? null

      resetForm()
      try {
        await list.reload()
      } catch (reloadError) {
        setSubmitError(reloadError.message)
      }

      if (flags.required && purchaseId) {
        setPriceUpdatePrompt({
          purchaseId,
          message:
            flags.message ??
            'El precio de costo ha cambiado. ¿Deseas actualizar el precio base del producto?',
          items: (flags.items ?? []).map(normalizePriceUpdateItem),
        })
        setStatusMessage('La compra se registró correctamente. Revisa la confirmación de precios.')
      } else {
        setStatusMessage(response?.message ?? 'Compra registrada correctamente.')
      }
    } catch (requestError) {
      setStatusMessage('')
      setSubmitError(requestError.message)
    } finally {
      setSubmitting(false)
    }
  }

  const cancelPriceUpdate = () => {
    if (priceUpdateLoading) {
      return
    }

    setPriceUpdatePrompt(null)
    setPriceUpdateError('')
  }

  const confirmPriceUpdate = async () => {
    if (!priceUpdatePrompt?.purchaseId) {
      return
    }

    setPriceUpdateLoading(true)
    setPriceUpdateError('')
    setStatusMessage('')

    try {
      const response = await applyPurchasePriceUpdate(priceUpdatePrompt.purchaseId)
      setStatusMessage(response?.message ?? 'Precio base actualizado correctamente.')
      setPriceUpdatePrompt(null)
      try {
        await list.reload()
      } catch (reloadError) {
        setSubmitError(reloadError.message)
      }
    } catch (requestError) {
      setPriceUpdateError(requestError.message)
    } finally {
      setPriceUpdateLoading(false)
    }
  }

  return {
    ...list,
    supplierOptions: supplierLookup.options,
    productOptions: productLookup.options,
    suppliersLoading: supplierLookup.loading,
    productsLoading: productLookup.loading,
    form,
    setForm,
    submitting,
    statusMessage,
    submitError,
    priceUpdatePrompt,
    priceUpdateLoading,
    priceUpdateError,
    updateLineItem,
    addLineItem,
    removeLineItem,
    resetForm,
    submitForm,
    cancelPriceUpdate,
    confirmPriceUpdate,
  }
}

function useSalesWorkspace(enabled) {
  const list = useResourceList({
    listFn: getSales,
    detailFn: getSale,
    enabled,
  })
  const productLookup = useLookupOptions(getProducts, enabled)
  const [form, setForm] = useState({
    date: todayDateInput(),
    tipo_comprobante: 'boleta',
    items: [createLineItem()],
  })

  useEffect(() => {
    if (!enabled) {
      return
    }

    setForm({
      date: todayDateInput(),
      tipo_comprobante: 'boleta',
      items: [createLineItem()],
    })
  }, [enabled])

  const updateLineItem = (index, field, value) => {
    setForm((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    }))
  }

  const addLineItem = () => {
    setForm((current) => ({
      ...current,
      items: [...current.items, createLineItem()],
    }))
  }

  const removeLineItem = (index) => {
    setForm((current) => {
      const nextItems = current.items.filter((_, itemIndex) => itemIndex !== index)
      return {
        ...current,
        items: nextItems.length ? nextItems : [createLineItem()],
      }
    })
  }

  const resetForm = () => {
    setForm({
      date: todayDateInput(),
      tipo_comprobante: 'boleta',
      items: [createLineItem()],
    })
  }

  const submitForm = async (event) => {
    event.preventDefault()

    await createSale({
      date: form.date,
      tipo_comprobante: form.tipo_comprobante,
      items: form.items.map(normalizeLedgerItem),
    })

    resetForm()
    await list.reload()
  }

  return {
    ...list,
    productOptions: productLookup.options,
    productsLoading: productLookup.loading,
    form,
    setForm,
    updateLineItem,
    addLineItem,
    removeLineItem,
    resetForm,
    submitForm,
  }
}

function useInventoryWorkspace(enabled) {
  return useResourceList({
    listFn: getStockMovements,
    detailFn: null,
    enabled,
  })
}

function PurchaseSection({ activeSubsection, workspace }) {
  if (!workspace) {
    return null
  }

  const {
    items,
    meta,
    loading,
    error,
    searchDraft,
    setSearchDraft,
    page,
    pageSize,
    selectedId,
    selectedItem,
    supplierOptions,
    productOptions,
    form,
    submitting,
    statusMessage,
    submitError,
    priceUpdatePrompt,
    priceUpdateLoading,
    priceUpdateError,
    updateLineItem,
    addLineItem,
    removeLineItem,
    submitSearch,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
    selectItem,
    submitForm,
    cancelPriceUpdate,
    confirmPriceUpdate,
  } = workspace

  const listColumns = [
    { key: 'supplier.name', label: 'Proveedor' },
    { key: 'date', label: 'Fecha' },
    { key: 'subtotal', label: 'Subtotal' },
    { key: 'igv', label: 'IGV' },
    { key: 'total', label: 'Total' },
  ]

  return (
    <section className="dashboard-content section-fade">
      <div className="panel panel--toolbar">
        <div className="panel__toolbar">
          <div>
            <span className="panel__eyebrow">Compras</span>
            <h2>{activeSubsection === 'detail' ? 'Detalle de compra' : 'Registrar compra'}</h2>
          </div>
        </div>

        <div className="panel__filters">
          <form className="inline-form" onSubmit={submitSearch}>
            <Input
              name="search-purchases"
              label="Buscar"
              placeholder="Escribe un proveedor"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>

          <div className="panel__filters-right">
            <label className="select-field">
              <span>Por pagina</span>
              <select value={pageSize} onChange={(event) => changePageSize(Number(event.target.value))}>
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {activeSubsection === 'create' ? (
        <div className="panel section-pane section-pane--active">
          <div className="panel__toolbar">
            <div>
              <span className="panel__eyebrow">Compra</span>
              <h2>Registrar compra</h2>
            </div>
          </div>

          <form className="stack-form" onSubmit={submitForm}>
            <label className="field">
              <span className="field__label">Proveedor</span>
              <select
                className="field__control"
                value={form.supplier_id}
                onChange={(event) =>
                  workspace.setForm((current) => ({
                    ...current,
                    supplier_id: event.target.value,
                  }))
                }
              >
                <option value="">Selecciona un proveedor</option>
                {supplierOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <Input
              name="purchase-date"
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(event) =>
                workspace.setForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />

            {form.items.map((item, index) => (
              <div key={index} className="purchase-line">
                <label className="field">
                  <span className="field__label">Producto</span>
                  <select
                    className="field__control"
                    value={item.product_id}
                    onChange={(event) => updateLineItem(index, 'product_id', event.target.value)}
                  >
                    <option value="">Selecciona un producto</option>
                    {productOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <Input
                  name={`quantity-${index}`}
                  label="Cantidad"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => updateLineItem(index, 'quantity', event.target.value)}
                />

                <Input
                  name={`unit-price-${index}`}
                  label="Precio unitario"
                  type="number"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(event) => updateLineItem(index, 'unit_price', event.target.value)}
                />

                <Button type="button" variant="ghost" onClick={() => removeLineItem(index)}>
                  Quitar
                </Button>
              </div>
            ))}

            <div className="stack-form__actions">
              <Button type="button" variant="secondary" onClick={addLineItem}>
                Agregar producto
              </Button>
              <Button type="submit" disabled={submitting}>
                {submitting ? 'Guardando...' : 'Guardar compra'}
              </Button>
            </div>
          </form>
        </div>
      ) : null}

      {activeSubsection === 'detail' ? (
        <div className="panel section-pane section-pane--active">
          <div className="panel__toolbar">
            <div>
              <span className="panel__eyebrow">Detalle compra</span>
              <h2>Selecciona una compra</h2>
            </div>
          </div>

          {selectedItem ? (
            <div className="detail-card">
              <div className="detail-card__grid">
                <div>
                  <span>Proveedor</span>
                  <strong>{selectedItem.supplier?.name ?? '-'}</strong>
                </div>
                <div>
                  <span>Fecha</span>
                  <strong>{selectedItem.date ?? '-'}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{selectedItem.total ?? '-'}</strong>
                </div>
              </div>

              <div className="detail-card__list">
                {(selectedItem.details ?? []).map((detail) => (
                  <div key={detail.id} className="detail-card__row">
                    <strong>{detail.product?.name ?? 'Producto'}</strong>
                    <span>
                      {detail.quantity} x {detail.unit_price}
                    </span>
                    <span>Subtotal {detail.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">Selecciona una compra para ver el detalle.</div>
          )}
        </div>
      ) : null}

      {statusMessage ? <div className="form-alert form-alert--success">{statusMessage}</div> : null}
      {submitError ? <div className="form-alert">{submitError}</div> : null}
      {error ? <div className="form-alert">{error}</div> : null}

      <RecordTable
        items={items}
        columns={listColumns}
        loading={loading}
        emptyLabel="No hay compras registradas."
        onSelect={selectItem}
        selectedId={selectedId}
        actionLabel="Ver detalle"
      />

      <div className="pagination-bar">
        <span>
          Pagina {meta.current_page ?? page} de {meta.last_page ?? 1} | {meta.total ?? items.length} registros
        </span>
        <div className="pagination-actions">
          <Button type="button" variant="secondary" onClick={goToPreviousPage} disabled={(meta.current_page ?? page) <= 1}>
            Anterior
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={goToNextPage}
            disabled={(meta.current_page ?? page) >= (meta.last_page ?? 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <Modal
        open={Boolean(priceUpdatePrompt)}
        title="Actualizar precio base"
        eyebrow="Compras"
        onClose={cancelPriceUpdate}
      >
        <div className="price-update-modal">
          <p className="price-update-modal__message">
            {priceUpdatePrompt?.message ??
              'El precio de costo ha cambiado. ¿Deseas actualizar el precio base del producto?'}
          </p>

          <div className="price-update-modal__list">
            {(priceUpdatePrompt?.items ?? []).length ? (
              priceUpdatePrompt.items.map((item) => {
                const difference = item.newPrice - item.currentPrice

                return (
                  <div key={item.id} className="price-update-modal__item">
                    <div>
                      <strong>{item.name}</strong>
                      <span>Precio actual: {formatMoney(item.currentPrice)}</span>
                    </div>
                    <div>
                      <span>Nuevo precio: {formatMoney(item.newPrice)}</span>
                      <span>Diferencia: {formatMoney(difference)}</span>
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="empty-state">No hay productos para actualizar.</div>
            )}
          </div>

          {priceUpdateError ? <div className="form-alert">{priceUpdateError}</div> : null}

          <div className="stack-form__actions">
            <Button type="button" variant="secondary" onClick={cancelPriceUpdate} disabled={priceUpdateLoading}>
              Cancelar
            </Button>
            <Button type="button" onClick={confirmPriceUpdate} disabled={priceUpdateLoading}>
              {priceUpdateLoading ? 'Actualizando...' : 'Actualizar precios'}
            </Button>
          </div>
        </div>
      </Modal>
    </section>
  )
}

function SalesSection({ activeSubsection, workspace }) {
  if (!workspace) {
    return null
  }

  const {
    items,
    meta,
    loading,
    error,
    searchDraft,
    setSearchDraft,
    page,
    pageSize,
    selectedId,
    selectedItem,
    productOptions,
    form,
    updateLineItem,
    addLineItem,
    removeLineItem,
    submitSearch,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
    selectItem,
    submitForm,
  } = workspace

  const listColumns = [
    { key: 'date', label: 'Fecha' },
    { key: 'tipo_comprobante', label: 'Comprobante' },
    { key: 'total', label: 'Total' },
  ]

  return (
    <section className="dashboard-content section-fade">
      <div className="panel panel--toolbar">
        <div className="panel__toolbar">
          <div>
            <span className="panel__eyebrow">Ventas</span>
            <h2>{activeSubsection === 'detail' ? 'Detalle de venta' : 'Registrar venta'}</h2>
          </div>
        </div>

        <div className="panel__filters">
          <form className="inline-form" onSubmit={submitSearch}>
            <Input
              name="search-sales"
              label="Buscar"
              placeholder="Escribe una boleta"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>

          <div className="panel__filters-right">
            <label className="select-field">
              <span>Por pagina</span>
              <select value={pageSize} onChange={(event) => changePageSize(Number(event.target.value))}>
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {activeSubsection === 'create' ? (
        <div className="panel section-pane section-pane--active">
          <div className="panel__toolbar">
            <div>
              <span className="panel__eyebrow">Venta</span>
              <h2>Registrar venta</h2>
            </div>
          </div>

          <form className="stack-form" onSubmit={submitForm}>
            <Input
              name="sale-date"
              label="Fecha"
              type="date"
              value={form.date}
              onChange={(event) =>
                workspace.setForm((current) => ({
                  ...current,
                  date: event.target.value,
                }))
              }
            />

            <label className="field">
              <span className="field__label">Tipo comprobante</span>
              <select
                className="field__control"
                value={form.tipo_comprobante}
                onChange={(event) =>
                  workspace.setForm((current) => ({
                    ...current,
                    tipo_comprobante: event.target.value,
                  }))
                }
              >
                <option value="boleta">Boleta</option>
                <option value="factura">Factura</option>
                <option value="nota">Nota</option>
              </select>
            </label>

            {form.items.map((item, index) => (
              <div key={index} className="purchase-line">
                <label className="field">
                  <span className="field__label">Producto</span>
                  <select
                    className="field__control"
                    value={item.product_id}
                    onChange={(event) => updateLineItem(index, 'product_id', event.target.value)}
                  >
                    <option value="">Selecciona un producto</option>
                    {productOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </label>

                <Input
                  name={`sale-quantity-${index}`}
                  label="Cantidad"
                  type="number"
                  value={item.quantity}
                  onChange={(event) => updateLineItem(index, 'quantity', event.target.value)}
                />

                <Input
                  name={`sale-unit-price-${index}`}
                  label="Precio unitario"
                  type="number"
                  step="0.01"
                  value={item.unit_price}
                  onChange={(event) => updateLineItem(index, 'unit_price', event.target.value)}
                />

                <Button type="button" variant="ghost" onClick={() => removeLineItem(index)}>
                  Quitar
                </Button>
              </div>
            ))}

            <div className="stack-form__actions">
              <Button type="button" variant="secondary" onClick={addLineItem}>
                Agregar producto
              </Button>
              <Button type="submit">Guardar venta</Button>
            </div>
          </form>
        </div>
      ) : null}

      {activeSubsection === 'detail' ? (
        <div className="panel section-pane section-pane--active">
          <div className="panel__toolbar">
            <div>
              <span className="panel__eyebrow">Detalle venta</span>
              <h2>Selecciona una venta</h2>
            </div>
          </div>

          {selectedItem ? (
            <div className="detail-card">
              <div className="detail-card__grid">
                <div>
                  <span>Comprobante</span>
                  <strong>{selectedItem.tipo_comprobante ?? '-'}</strong>
                </div>
                <div>
                  <span>Fecha</span>
                  <strong>{selectedItem.date ?? '-'}</strong>
                </div>
                <div>
                  <span>Total</span>
                  <strong>{selectedItem.total ?? '-'}</strong>
                </div>
              </div>

              <div className="detail-card__list">
                {(selectedItem.details ?? []).map((detail) => (
                  <div key={detail.id} className="detail-card__row">
                    <strong>{detail.product?.name ?? 'Producto'}</strong>
                    <span>
                      {detail.quantity} x {detail.unit_price}
                    </span>
                    <span>Subtotal {detail.subtotal}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="empty-state">Selecciona una venta para ver el detalle.</div>
          )}
        </div>
      ) : null}

      {error ? <div className="form-alert">{error}</div> : null}

      <RecordTable
        items={items}
        columns={listColumns}
        loading={loading}
        emptyLabel="No hay ventas registradas."
        onSelect={selectItem}
        selectedId={selectedId}
        actionLabel="Ver detalle"
      />

      <div className="pagination-bar">
        <span>
          Pagina {meta.current_page ?? page} de {meta.last_page ?? 1} | {meta.total ?? items.length} registros
        </span>
        <div className="pagination-actions">
          <Button type="button" variant="secondary" onClick={goToPreviousPage} disabled={(meta.current_page ?? page) <= 1}>
            Anterior
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={goToNextPage}
            disabled={(meta.current_page ?? page) >= (meta.last_page ?? 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  )
}

function InventorySection({ workspace }) {
  if (!workspace) {
    return null
  }

  const {
    items,
    meta,
    loading,
    error,
    searchDraft,
    setSearchDraft,
    page,
    pageSize,
    submitSearch,
    changePageSize,
    goToPreviousPage,
    goToNextPage,
  } = workspace

  const columns = [
    { key: 'product.name', label: 'Producto' },
    { key: 'type', label: 'Tipo' },
    { key: 'quantity', label: 'Cantidad' },
    { key: 'reference_type', label: 'Referencia' },
    { key: 'reference_id', label: 'ID Ref.' },
    { key: 'date', label: 'Fecha' },
  ]

  return (
    <section className="dashboard-content section-fade">
      <div className="panel panel--toolbar">
        <div className="panel__toolbar">
          <div>
            <span className="panel__eyebrow">Inventory</span>
            <h2>Movimientos de stock</h2>
          </div>
        </div>

        <div className="panel__filters">
          <form className="inline-form" onSubmit={submitSearch}>
            <Input
              name="search-stock"
              label="Buscar"
              placeholder="Escribe un movimiento"
              value={searchDraft}
              onChange={(event) => setSearchDraft(event.target.value)}
            />
            <Button type="submit" variant="secondary">
              Buscar
            </Button>
          </form>

          <div className="panel__filters-right">
            <label className="select-field">
              <span>Por pagina</span>
              <select value={pageSize} onChange={(event) => changePageSize(Number(event.target.value))}>
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      </div>

      {error ? <div className="form-alert">{error}</div> : null}

      <RecordTable
        items={items}
        columns={columns}
        loading={loading}
        emptyLabel="No hay movimientos de stock."
      />

      <div className="pagination-bar">
        <span>
          Pagina {meta.current_page ?? page} de {meta.last_page ?? 1} | {meta.total ?? items.length} registros
        </span>
        <div className="pagination-actions">
          <Button type="button" variant="secondary" onClick={goToPreviousPage} disabled={(meta.current_page ?? page) <= 1}>
            Anterior
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={goToNextPage}
            disabled={(meta.current_page ?? page) >= (meta.last_page ?? 1)}
          >
            Siguiente
          </Button>
        </div>
      </div>
    </section>
  )
}

function PurchaseWorkspace({ workspace, activeSubsection }) {
  return <PurchaseSection workspace={workspace} activeSubsection={activeSubsection} />
}

function SalesWorkspace({ workspace, activeSubsection }) {
  return <SalesSection workspace={workspace} activeSubsection={activeSubsection} />
}

function InventoryWorkspace({ workspace }) {
  return <InventorySection workspace={workspace} />
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

          <div className="panel__filters-right">
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
                      <td key={column.key}>{getColumnValue(item, column.key)}</td>
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
            field.type === 'select' ? (
              <label key={field.name} className="field">
                {field.label ? <span className="field__label">{field.label}</span> : null}
                <select
                  className="field__control"
                  value={form[field.name] ?? ''}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      [field.name]:
                        field.coerce === 'number'
                          ? Number(event.target.value)
                          : event.target.value,
                    }))
                  }
                >
                  <option value="">{field.placeholder ?? 'Selecciona una opcion'}</option>
                  {(field.options ?? []).map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
            ) : field.type === 'textarea' ? (
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
                    [field.name]:
                      field.coerce === 'number'
                        ? Number(event.target.value)
                        : event.target.value,
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
  const [activeSubsection, setActiveSubsection] = useState(null)

  const brandsLookup = useLookupOptions(getBrands, activeSection === 'products')
  const categoriesLookup = useLookupOptions(getCategories, activeSection === 'products')

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

  const products = useEntityCrud({
    config: buildProductConfig({
      brandOptions: brandsLookup.options,
      categoryOptions: categoriesLookup.options,
    }),
    enabled: activeSection === 'products',
  })

  const purchases = usePurchaseWorkspace(activeSection === 'purchases')
  const sales = useSalesWorkspace(activeSection === 'sales')
  const inventory = useInventoryWorkspace(activeSection === 'inventory')
  const analytics = useAnalyticsWorkspace(activeSection === 'analytics')
  const lowStockNotice = useLowStockNotice(true)

  const sectionState = {
    products,
    categories,
    brands,
    suppliers,
  }

  const handleSectionChange = (section, subsection = null) => {
    setActiveSection(section)
    setActiveSubsection(
      subsection ??
        (section === 'purchases' || section === 'sales' ? 'create' : null),
    )
  }

  return (
    <DashboardLayout
      sidebar={
        <Sidebar
          activeSection={activeSection}
          activeSubsection={activeSubsection}
          onSectionChange={handleSectionChange}
          onLogout={auth.logout}
          user={auth.user}
        />
      }
      notice={lowStockNotice.notice}
      onNoticeClose={lowStockNotice.dismiss}
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
        {activeSection === 'analytics' ? <AnalysisSection workspace={analytics} /> : null}
        {activeSection === 'products' ? <EntityTable state={sectionState.products} /> : null}

        {activeSection === 'categories' ? <EntityTable state={sectionState.categories} /> : null}
        {activeSection === 'brands' ? <EntityTable state={sectionState.brands} /> : null}
        {activeSection === 'suppliers' ? <EntityTable state={sectionState.suppliers} /> : null}

        {activeSection === 'purchases' ? (
          <PurchaseWorkspace
            workspace={purchases}
            activeSubsection={activeSubsection ?? 'create'}
          />
        ) : null}

        {activeSection === 'sales' ? (
          <SalesWorkspace
            workspace={sales}
            activeSubsection={activeSubsection ?? 'create'}
          />
        ) : null}

        {activeSection === 'inventory' ? (
          <InventoryWorkspace workspace={inventory} />
        ) : null}
      </DashboardLayout>
    )
}

