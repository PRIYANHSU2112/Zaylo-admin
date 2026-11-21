import React, { useMemo, useState } from 'react'
import { Plus, Edit, Trash, Eye, AlertTriangle } from 'lucide-react'
import {
  useGetProductsQuery,
  useGetCategoriesQuery,
  useCreateProductMutation,
  useUpdateProductMutation,
  useSetProductStatusMutation,
  useDeleteProductMutation,
  useBulkProductsMutation,
} from '../../../store/api/catalog.api'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input, Textarea } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import GalleryField from '../../../components/ui/GalleryField'
import AdminTable from '../../../components/shared/AdminTable'
import PageSkeleton from '../../../components/shared/PageSkeleton'

export default function ProductsPage() {
  const { data: productsEnv, isLoading, isError, error } = useGetProductsQuery({ limit: 100 })
  const { data: categoriesEnv } = useGetCategoriesQuery({ limit: 100 })
  const [createProduct, { isLoading: creating }] = useCreateProductMutation()
  const [updateProduct, { isLoading: updating }] = useUpdateProductMutation()
  const [setProductStatus] = useSetProductStatusMutation()
  const [deleteProductMut] = useDeleteProductMutation()
  const [bulkProducts] = useBulkProductsMutation()

  const products = productsEnv?.data || []
  const categories = categoriesEnv?.data || []
  const saving = creating || updating

  // Local Component States
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Filter States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [selectedStockFilter, setSelectedStockFilter] = useState('all')

  // Form State
  // Blank by default — never pre-fill prices, stock, weight or nutrition.
  const initialFormState = {
    name: '',
    sku: '',
    category: '',
    price: '',
    mrp: '',
    weight: '',
    images: [],
    tagline: '',
    description: '',
    flavor: '',
    isVeg: true,
    isNew: false,
    isPopular: false,
    isFeatured: false,
    homePosition: 0,
    stock: '',
    status: 'Inactive',
    ingredients: '',
    storage: '',
    calories: '',
    fat: '',
    carbs: '',
    seoTitle: '',
    seoDescription: '',
  }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  const filteredProducts = useMemo(() => products.filter((p) => {
    const matchesCategory =
      selectedCategoryFilter === 'all' ||
      p.category === selectedCategoryFilter ||
      p.category === categories.find((c) => c.id === selectedCategoryFilter)?.slug

    let matchesStock = true
    if (selectedStockFilter === 'instock') matchesStock = p.stock > 15
    else if (selectedStockFilter === 'lowstock') matchesStock = p.stock > 0 && p.stock <= 15
    else if (selectedStockFilter === 'outofstock') matchesStock = p.stock === 0
    else if (selectedStockFilter === 'drafts') matchesStock = p.status !== 'Active'
    else if (selectedStockFilter === 'featured') matchesStock = Boolean(p.isFeatured)

    return matchesCategory && matchesStock
  }), [products, categories, selectedCategoryFilter, selectedStockFilter])

  // CRUD actions handlers
  const handleOpenAddModal = () => {
    setFormValues(initialFormState)
    setFormErrors({})
    setIsEditing(false)
    setModalOpen(true)
  }

  const handleOpenEditModal = (product) => {
    setFormValues({
      ...product,
      sku: product.sku || '',
      images: product.images?.length ? product.images : [product.image].filter(Boolean),
      seoTitle: product.seoTitle || '',
      seoDescription: product.seoDescription || '',
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients || '',
      calories: product.nutrition?.calories ?? '',
      fat: product.nutrition?.fat || '',
      carbs: product.nutrition?.carbs || '',
    })
    setFormErrors({})
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleOpenDetailsModal = (product) => {
    setSelectedProduct(product)
    setDetailsModalOpen(true)
  }

  const handleToggleStatus = async (id, current) => {
    await setProductStatus({ id, status: current === 'Active' ? 'Inactive' : 'Active' })
  }

  const handleDelete = async (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      await deleteProductMut(id)
    }
  }

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormValues(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    // Clear validation error when user types
    if (formErrors[name]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  const validateForm = () => {
    const errors = {}
    const publishing = formValues.status === 'Active'
    if (!formValues.name.trim()) errors.name = 'Product name is required'
    if (formValues.price === '' || Number(formValues.price) < 0) errors.price = 'Enter the selling price'
    if (formValues.mrp === '' || Number(formValues.mrp) < 0) errors.mrp = 'Enter the MRP'
    if (Number(formValues.price) > Number(formValues.mrp)) errors.price = 'Selling price cannot exceed MRP'
    if (formValues.stock !== '' && Number(formValues.stock) < 0) errors.stock = 'Stock cannot be negative'
    if (publishing && !formValues.category) errors.category = 'Choose a category before publishing'
    if (publishing && Number(formValues.price) <= 0) errors.price = 'Price must be above 0 to publish'
    if (publishing && !formValues.images.length) errors.images = 'Upload at least one image before publishing'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProduct = async (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const processedProduct = {
      name: formValues.name,
      category: formValues.category,
      sku: formValues.sku.trim(),
      price: parseFloat(formValues.price),
      mrp: parseFloat(formValues.mrp),
      stock: parseInt(formValues.stock, 10) || 0,
      images: formValues.images,
      isFeatured: formValues.isFeatured,
      seoTitle: formValues.seoTitle.trim(),
      seoDescription: formValues.seoDescription.trim(),
      weight: formValues.weight,
      flavor: formValues.flavor,
      tagline: formValues.tagline,
      description: formValues.description,
      status: formValues.status,
      isVeg: formValues.isVeg,
      isNew: formValues.isNew,
      isPopular: formValues.isPopular,
      homePosition: parseInt(formValues.homePosition, 10) || 0,
      storage: formValues.storage,
      ingredients: formValues.ingredients.split(',').map((i) => i.trim()).filter(Boolean),
      nutrition: {
        calories: formValues.calories === '' ? null : parseInt(formValues.calories, 10),
        fat: formValues.fat,
        carbs: formValues.carbs,
      },
    }

    try {
      if (isEditing) {
        await updateProduct({ id: formValues.id, ...processedProduct }).unwrap()
      } else {
        await createProduct(processedProduct).unwrap()
      }
      setModalOpen(false)
    } catch (err) {
      const details = err?.data?.error?.details
      setFormErrors({ name: Array.isArray(details) && details.length ? details.join(', ') : err?.data?.message || 'Failed to save product' })
    }
  }

  // Define table headers
  const headers = [
    {
      key: 'name',
      label: 'Product Details',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          {row.image ? (
            <img src={row.image} alt={row.name} className="w-10 h-10 object-cover rounded-lg border border-border" />
          ) : (
            <span
              className="w-10 h-10 rounded-lg border border-dashed border-border flex items-center justify-center text-[9px] font-bold text-muted-foreground"
              title="No image uploaded"
            >
              NO IMG
            </span>
          )}
          <div>
            <p className="font-semibold text-foreground">{row.name}</p>
            <p className="text-xs text-muted-foreground">Slug: {row.slug}</p>
          </div>
        </div>
      )
    },
    {
      key: 'category',
      label: 'Category',
      sortable: true,
      render: (val) => (
        <span className="capitalize px-2.5 py-1 rounded-lg bg-muted text-xs font-bold text-muted-foreground border border-border">
          {val}
        </span>
      )
    },
    {
      key: 'price',
      label: 'Pricing',
      sortable: true,
      render: (val, row) => (
        <div>
          <p className="font-bold text-foreground">₹{parseFloat(val).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground line-through">MRP: ₹{parseFloat(row.mrp).toFixed(2)}</p>
        </div>
      )
    },
    {
      key: 'stock',
      label: 'Stock Quantity',
      sortable: true,
      render: (val) => {
        const isOutOfStock = val === 0
        const isLowStock = val > 0 && val <= 15
        
        return (
          <div>
            <p className={`font-semibold ${isOutOfStock ? 'text-red-500' : isLowStock ? 'text-amber-500' : 'text-foreground'}`}>
              {val} <span className="text-xs font-normal text-muted-foreground">units</span>
            </p>
            {isOutOfStock ? (
              <span className="text-[10px] text-red-500 font-bold flex items-center gap-1 mt-0.5">
                <AlertTriangle size={10} /> Out of Stock
              </span>
            ) : isLowStock ? (
              <span className="text-[10px] text-amber-500 font-bold flex items-center gap-1 mt-0.5">
                <AlertTriangle size={10} /> Low Stock
              </span>
            ) : (
              <span className="text-[10px] text-emerald-500 font-bold mt-0.5">Optimal</span>
            )}
          </div>
        )
      }
    },
    {
      key: 'status',
      label: 'Status',
      sortable: true,
      render: (val, row) => (
        <button
          onClick={() => handleToggleStatus(row.id, val)}
          className="cursor-pointer transition-transform active:scale-95 block"
          title="Click to toggle status"
        >
          <Badge variant={val}>{val}</Badge>
        </button>
      )
    },
    {
      key: 'actions',
      label: 'Actions',
      align: 'right',
      render: (val, row) => (
        <div className="flex justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => handleOpenDetailsModal(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => handleOpenEditModal(row)}
            className="p-1.5 text-muted-foreground hover:text-primary hover:bg-primary-light rounded-lg transition-colors cursor-pointer"
            title="Edit Product"
          >
            <Edit size={16} />
          </button>
          <button
            onClick={() => handleDelete(row.id)}
            className="p-1.5 text-muted-foreground hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-colors cursor-pointer"
            title="Delete Product"
          >
            <Trash size={16} />
          </button>
        </div>
      )
    }
  ]

  const bulkActions = [
    {
      label: 'Mark Active',
      action: (ids) => bulkProducts({ action: 'status', ids, status: 'Active' }),
      variant: 'outline'
    },
    {
      label: 'Mark Inactive',
      action: (ids) => bulkProducts({ action: 'status', ids, status: 'Inactive' }),
      variant: 'outline'
    },
    {
      label: 'Delete Selected',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} products?`)) {
          bulkProducts({ action: 'delete', ids })
        }
      },
      variant: 'danger'
    }
  ]

  // Filters JSX element
  const FiltersMarkup = (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        value={selectedCategoryFilter}
        onChange={(e) => setSelectedCategoryFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.slug || c.id}>
            {c.name}
          </option>
        ))}
      </Select>
      <Select
        value={selectedStockFilter}
        onChange={(e) => setSelectedStockFilter(e.target.value)}
        className="py-2.5 px-3 min-w-[140px] text-xs h-10"
      >
        <option value="all">All Stocks</option>
        <option value="instock">In Stock (&gt;15)</option>
        <option value="lowstock">Low Stock (1-15)</option>
        <option value="outofstock">Out of Stock (0)</option>
        <option value="drafts">Drafts (inactive)</option>
        <option value="featured">Featured</option>
      </Select>
    </div>
  )

  if (isLoading) return <PageSkeleton />
  if (isError) {
    return (
      <div className="text-sm font-bold text-rose-600">
        {error?.data?.message || 'Failed to load products'}
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500 h-full flex flex-col">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-border pb-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground font-display">Products Catalog</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage packaged snack SKUs, retail pricing, images, and inventory levels.</p>
        </div>
        <Button onClick={handleOpenAddModal} className="flex items-center gap-2">
          <Plus size={18} /> Add New Product
        </Button>
      </div>

      {/* Dynamic Data Table */}
      <AdminTable
        headers={headers}
        data={filteredProducts}
        searchPlaceholder="Search products by name, slug, tagline, ingredients..."
        filters={FiltersMarkup}
        bulkActions={bulkActions}
        idField="id"
        itemsPerPage={6}
      />

      {/* ADD / EDIT MODAL */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Product' : 'Add New Snack Product'}
        className="max-w-2xl"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="name"
              label="Product Name"
              placeholder="e.g. Moon Lite"
              value={formValues.name}
              onChange={handleFormChange}
              error={formErrors.name}
              required
            />
            <Input
              name="sku"
              label="SKU (optional)"
              placeholder="e.g. ZL-ZIGZAC-01"
              value={formValues.sku}
              onChange={handleFormChange}
              error={formErrors.sku}
            />
            <Select
              name="category"
              label="Category"
              value={formValues.category}
              onChange={handleFormChange}
              error={formErrors.category}
            >
              <option value="">Select Category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.slug || c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="price"
              label="Selling price (₹)"
              type="number"
              step="0.01"
              value={formValues.price}
              onChange={handleFormChange}
              error={formErrors.price}
              required
            />
            <Input
              name="mrp"
              label="MRP (₹)"
              type="number"
              step="0.01"
              value={formValues.mrp}
              onChange={handleFormChange}
              error={formErrors.mrp}
              required
            />
            <Input
              name="stock"
              label="Stock Qty"
              type="number"
              value={formValues.stock}
              onChange={handleFormChange}
              error={formErrors.stock}
            />
          </div>
          {Number(formValues.mrp) > Number(formValues.price) && Number(formValues.price) > 0 && (
            <p className="-mt-2 text-xs font-bold text-emerald-600">
              Discount: {Math.round(((formValues.mrp - formValues.price) / formValues.mrp) * 100)}% off MRP
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="weight"
              label="Weight / pack size"
              placeholder="As printed on the pack, e.g. 18 g"
              value={formValues.weight}
              onChange={handleFormChange}
            />
            <Input
              name="flavor"
              label="Flavor"
              placeholder="e.g. Tomato Masala, Spicy"
              value={formValues.flavor}
              onChange={handleFormChange}
            />
          </div>

          <Input
            name="tagline"
            label="Tagline / Short Feature"
            placeholder="e.g. Crispy Delight, Swad Jo Dil Jeet Le"
            value={formValues.tagline}
            onChange={handleFormChange}
          />

          <Textarea
            name="description"
            label="Product Description"
            placeholder="Detailed description of the snack product..."
            value={formValues.description}
            onChange={handleFormChange}
            rows={2}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
            <GalleryField
              value={formValues.images}
              onChange={(images) => {
                setFormValues((prev) => ({ ...prev, images }))
                if (formErrors.images) setFormErrors((prev) => ({ ...prev, images: '' }))
              }}
              error={formErrors.images}
            />
            <Select
              name="status"
              label="Status"
              value={formValues.status}
              onChange={handleFormChange}
            >
              <option value="Inactive">Draft (hidden from website)</option>
              <option value="Active">Active (published)</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
            <label className="flex items-center gap-2 text-sm font-semibold self-end pb-2">
              <input
                type="checkbox"
                name="isPopular"
                checked={!!formValues.isPopular}
                onChange={handleFormChange}
              />
              Show on homepage (Popular Products)
            </label>
            <label className="flex items-center gap-2 text-sm font-semibold self-end pb-2">
              <input type="checkbox" name="isFeatured" checked={!!formValues.isFeatured} onChange={handleFormChange} />
              Featured product (hero + Featured section)
            </label>
            <Input
              name="homePosition"
              label="Home position"
              type="number"
              min={0}
              value={formValues.homePosition}
              onChange={handleFormChange}
            />
          </div>

          {/* Nutritional Configs */}
          <div className="border-t border-border pt-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">
              Nutrition (optional — copy exactly from the pack label, leave blank if unknown)
            </p>
            <div className="grid grid-cols-3 gap-2">
              <Input name="calories" label="Energy (kcal)" type="number" min={0} value={formValues.calories} onChange={handleFormChange} />
              <Input name="fat" label="Fat" value={formValues.fat} onChange={handleFormChange} />
              <Input name="carbs" label="Carbohydrates" value={formValues.carbs} onChange={handleFormChange} />
            </div>
          </div>

          {/* Ingredients & Storage */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 border-t border-border pt-3">
            <Input
              name="ingredients"
              label="Ingredients (comma separated)"
              placeholder="Corn Grits, Salt, Spices"
              value={formValues.ingredients}
              onChange={handleFormChange}
            />
            <Input
              name="storage"
              label="Storage Guidelines"
              placeholder="Store in cool, dry place."
              value={formValues.storage}
              onChange={handleFormChange}
            />
          </div>

          {/* SEO */}
          <div className="grid grid-cols-1 gap-3 border-t border-border pt-3">
            <Input
              name="seoTitle"
              label="SEO title (optional, ≤ 70 chars)"
              maxLength={70}
              value={formValues.seoTitle}
              onChange={handleFormChange}
            />
            <Textarea
              name="seoDescription"
              label="SEO description (optional, ≤ 170 chars)"
              maxLength={170}
              rows={2}
              value={formValues.seoDescription}
              onChange={handleFormChange}
            />
          </div>

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? 'Saving…' : 'Save Product'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DETAIL VIEW MODAL */}
      <Modal
        open={detailsModalOpen}
        onClose={() => setDetailsModalOpen(false)}
        title={selectedProduct?.name}
      >
        {selectedProduct && (
          <div className="space-y-4">
            <div className="flex justify-center bg-muted/30 p-4 rounded-xl border border-border">
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                className="max-h-[160px] object-contain rounded-lg shadow-sm"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Category</p>
                <p className="font-bold text-foreground capitalize">{selectedProduct.category}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground font-semibold">Flavor Profile</p>
                <p className="font-bold text-foreground">{selectedProduct.flavor || 'N/A'}</p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground font-semibold">Pricing Structure</p>
                <p className="font-bold text-foreground">
                  Price: ₹{parseFloat(selectedProduct.price).toFixed(2)}{' '}
                  <span className="text-xs text-muted-foreground font-normal line-through">
                    (MRP: ₹{parseFloat(selectedProduct.mrp).toFixed(2)})
                  </span>
                </p>
              </div>
              <div className="mt-2">
                <p className="text-xs text-muted-foreground font-semibold">Inventory</p>
                <p className="font-bold text-foreground">{selectedProduct.stock} units ({selectedProduct.status})</p>
              </div>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground font-semibold">Tagline</p>
              <p className="font-semibold italic text-primary font-display mt-0.5">"{selectedProduct.tagline}"</p>
            </div>

            <div className="border-t border-border pt-3">
              <p className="text-xs text-muted-foreground font-semibold">Description</p>
              <p className="text-xs leading-relaxed text-foreground mt-1">{selectedProduct.description}</p>
            </div>

            {/* Nutrition details card */}
            {selectedProduct.nutrition && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground font-semibold mb-1">Nutrition Information (Per Pack)</p>
                <div className="grid grid-cols-4 gap-2 bg-muted/40 p-2 rounded-xl text-center text-xs">
                  <div>
                    <span className="block font-bold text-foreground">{selectedProduct.nutrition.calories}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Calories</span>
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">{selectedProduct.nutrition.fat}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Fat</span>
                  </div>
                  <div>
                    <span className="block font-bold text-foreground">{selectedProduct.nutrition.carbs}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Carbs</span>
                  </div>
                </div>
              </div>
            )}

            {selectedProduct.ingredients && selectedProduct.ingredients.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground font-semibold">Key Ingredients</p>
                <div className="flex flex-wrap gap-1.5 mt-1.5">
                  {selectedProduct.ingredients.map((ing, idx) => (
                    <span key={idx} className="text-[11px] font-semibold bg-primary-light text-primary px-2 py-0.5 rounded-md">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {selectedProduct.storage && (
              <div className="border-t border-border pt-3">
                <p className="text-xs text-muted-foreground font-semibold">Storage Recommendation</p>
                <p className="text-xs text-foreground mt-0.5">{selectedProduct.storage}</p>
              </div>
            )}

            <div className="flex justify-end border-t border-border pt-4 mt-2">
              <Button onClick={() => setDetailsModalOpen(false)}>Close</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
