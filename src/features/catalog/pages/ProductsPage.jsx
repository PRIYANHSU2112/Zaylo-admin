import React, { useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { Plus, Edit, Trash, Eye, AlertTriangle } from 'lucide-react'
import {
  addProduct,
  editProduct,
  deleteProduct,
  toggleProductStatus,
  bulkDeleteProducts,
  bulkToggleProductStatus
} from '../../../store/slices/productsSlice'
import Button from '../../../components/ui/Button'
import Badge from '../../../components/ui/Badge'
import { Input, Textarea } from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Modal from '../../../components/ui/Modal'
import AdminTable from '../../../components/shared/AdminTable'

export default function ProductsPage() {
  const dispatch = useDispatch()
  
  // Select state from store
  const products = useSelector(state => state.products.items)
  const categories = useSelector(state => state.categories.items)

  // Local Component States
  const [modalOpen, setModalOpen] = useState(false)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [isEditing, setIsEditing] = useState(false)

  // Filter States
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('all')
  const [selectedStockFilter, setSelectedStockFilter] = useState('all')

  // Form State
  const initialFormState = {
    name: '',
    category: '',
    price: 5.00,
    mrp: 5.00,
    weight: '1 Pack',
    image: 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?q=80&w=300&auto=format&fit=crop',
    tagline: '',
    description: '',
    flavor: '',
    isVeg: true,
    isNew: false,
    stock: 100,
    status: 'Active',
    ingredients: '',
    storage: '',
    calories: 450,
    fat: '20g',
    protein: '5g',
    carbs: '60g'
  }
  const [formValues, setFormValues] = useState(initialFormState)
  const [formErrors, setFormErrors] = useState({})

  // Apply filters at local selection level before passing to table
  const filteredProducts = products.filter(p => {
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter
    
    let matchesStock = true
    if (selectedStockFilter === 'instock') {
      matchesStock = p.stock > 15
    } else if (selectedStockFilter === 'lowstock') {
      matchesStock = p.stock > 0 && p.stock <= 15
    } else if (selectedStockFilter === 'outofstock') {
      matchesStock = p.stock === 0
    }

    return matchesCategory && matchesStock
  })

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
      ingredients: Array.isArray(product.ingredients) ? product.ingredients.join(', ') : product.ingredients || '',
      calories: product.nutrition?.calories || 450,
      fat: product.nutrition?.fat || '20g',
      protein: product.nutrition?.protein || '5g',
      carbs: product.nutrition?.carbs || '60g'
    })
    setFormErrors({})
    setIsEditing(true)
    setModalOpen(true)
  }

  const handleOpenDetailsModal = (product) => {
    setSelectedProduct(product)
    setDetailsModalOpen(true)
  }

  const handleToggleStatus = (id) => {
    dispatch(toggleProductStatus(id))
  }

  const handleDelete = (id) => {
    if (confirm('Are you sure you want to delete this product?')) {
      dispatch(deleteProduct(id))
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
    if (!formValues.name.trim()) errors.name = 'Product name is required'
    if (!formValues.category) errors.category = 'Category is required'
    if (formValues.price <= 0) errors.price = 'Price must be greater than 0'
    if (formValues.mrp <= 0) errors.mrp = 'MRP must be greater than 0'
    if (formValues.stock < 0) errors.stock = 'Stock cannot be negative'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSaveProduct = (e) => {
    e.preventDefault()
    if (!validateForm()) return

    const processedProduct = {
      ...formValues,
      price: parseFloat(formValues.price),
      mrp: parseFloat(formValues.mrp),
      stock: parseInt(formValues.stock, 10),
      ingredients: formValues.ingredients.split(',').map(i => i.trim()).filter(Boolean),
      nutrition: {
        calories: parseInt(formValues.calories, 10),
        fat: formValues.fat,
        protein: formValues.protein,
        carbs: formValues.carbs
      }
    }

    if (isEditing) {
      dispatch(editProduct(processedProduct))
    } else {
      dispatch(addProduct(processedProduct))
    }

    setModalOpen(false)
  }

  // Define table headers
  const headers = [
    {
      key: 'name',
      label: 'Product Details',
      sortable: true,
      render: (val, row) => (
        <div className="flex items-center gap-3">
          <img
            src={row.image || 'https://images.unsplash.com/photo-1599490659213-e2b9527bd08c?q=80&w=100&auto=format&fit=crop'}
            alt={row.name}
            className="w-10 h-10 object-cover rounded-lg border border-border"
          />
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
          <p className="font-bold text-foreground">${parseFloat(val).toFixed(2)}</p>
          <p className="text-xs text-muted-foreground line-through">MRP: ${parseFloat(row.mrp).toFixed(2)}</p>
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
          onClick={() => handleToggleStatus(row.id)}
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

  // Bulk Actions configs
  const bulkActions = [
    {
      label: 'Mark Active',
      action: (ids) => dispatch(bulkToggleProductStatus({ ids, status: 'Active' })),
      variant: 'outline'
    },
    {
      label: 'Mark Inactive',
      action: (ids) => dispatch(bulkToggleProductStatus({ ids, status: 'Inactive' })),
      variant: 'outline'
    },
    {
      label: 'Delete Selected',
      action: (ids) => {
        if (confirm(`Are you sure you want to delete these ${ids.length} products?`)) {
          dispatch(bulkDeleteProducts(ids))
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
          <option key={c.id} value={c.id}>
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
      </Select>
    </div>
  )

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
            <Select
              name="category"
              label="Category"
              value={formValues.category}
              onChange={handleFormChange}
              error={formErrors.category}
              required
            >
              <option value="">Select Category</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              name="price"
              label="Price ($)"
              type="number"
              step="0.01"
              value={formValues.price}
              onChange={handleFormChange}
              error={formErrors.price}
              required
            />
            <Input
              name="mrp"
              label="MRP ($)"
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
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              name="weight"
              label="Weight Descriptor"
              placeholder="e.g. 1 Pack, 250g, 50g"
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
            <Input
              name="image"
              label="Image URL"
              value={formValues.image}
              onChange={handleFormChange}
            />
            <Select
              name="status"
              label="Initial Status"
              value={formValues.status}
              onChange={handleFormChange}
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </Select>
          </div>

          {/* Nutritional Configs */}
          <div className="border-t border-border pt-3">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mb-2">Nutritional Values</p>
            <div className="grid grid-cols-4 gap-2">
              <Input name="calories" label="Calories" type="number" value={formValues.calories} onChange={handleFormChange} />
              <Input name="fat" label="Fat (g)" value={formValues.fat} onChange={handleFormChange} />
              <Input name="protein" label="Protein (g)" value={formValues.protein} onChange={handleFormChange} />
              <Input name="carbs" label="Carbs (g)" value={formValues.carbs} onChange={handleFormChange} />
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

          <div className="flex gap-2 justify-end border-t border-border pt-4 mt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Save Product
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
                  Price: ${parseFloat(selectedProduct.price).toFixed(2)}{' '}
                  <span className="text-xs text-muted-foreground font-normal line-through">
                    (MRP: ${parseFloat(selectedProduct.mrp).toFixed(2)})
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
                    <span className="block font-bold text-foreground">{selectedProduct.nutrition.protein}</span>
                    <span className="text-[10px] text-muted-foreground uppercase">Protein</span>
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
