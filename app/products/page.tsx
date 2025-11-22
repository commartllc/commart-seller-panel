'use client'

import { useState, useEffect } from 'react'
import { useLanguage } from '@/lib/i18n/LanguageContext'
import Sidebar from '@/components/ui/Sidebar'
import { Plus, Edit, Trash2, X, Search, ChevronDown, ChevronUp } from 'lucide-react'

interface ProductVariant {
  id: string
  product_id: string
  name: string
  stock: number
}

interface Product {
  id: string
  user_id: string
  title: string
  description: string
  price: number
  image_url: string
  image: string
  stock: number
  created_at: string
  variants?: ProductVariant[]
}

export default function ProductsPage() {
  const { t } = useLanguage()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showVariants, setShowVariants] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    price: '',
    stock: '',
    image_url: ''
  })
  const [variantStocks, setVariantStocks] = useState<Record<string, string>>({})

  const fetchProducts = async () => {
    try {
      const res = await fetch('/api/products')
      const json = await res.json()
      const items = json.data ?? json.products ?? []
      setProducts(Array.isArray(items) ? items : [])
    } catch (error) {
      console.error('Failed to fetch products:', error)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const showToast = (message: string) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProduct) {
        // Build update payload
        const updatePayload: any = {
          new_stock: parseInt(formData.stock),
          new_price: parseFloat(formData.price)
        }

        // Add variant updates if any
        if (editingProduct.variants && editingProduct.variants.length > 0) {
          updatePayload.variants = editingProduct.variants.map(v => ({
            variant_id: v.id,
            new_stock: parseInt(variantStocks[v.id] || v.stock.toString())
          }))
        }

        const res = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatePayload)
        })

        if (res.ok) {
          showToast(t.products.updateSuccess || 'Product updated successfully')
        }
      } else {
        // Create new product
        const productData = {
          title: formData.title,
          description: formData.description,
          price: parseFloat(formData.price),
          stock: parseInt(formData.stock),
          image_url: formData.image_url
        }

        await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
      }

      setShowModal(false)
      setEditingProduct(null)
      setShowVariants(false)
      setVariantStocks({})
      resetForm()
      fetchProducts()
    } catch (error) {
      console.error('Failed to save product:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.products.confirmDelete)) return

    try {
      await fetch(`/api/products/${id}`, { method: 'DELETE' })
      fetchProducts()
    } catch (error) {
      console.error('Failed to delete product:', error)
    }
  }

  const handleEdit = async (product: Product) => {
    try {
      // Fetch full product details including variants
      const res = await fetch(`/api/products/${product.id}`)
      const json = await res.json()
      const fullProduct = json.data || product

      setEditingProduct(fullProduct)
      setFormData({
        title: fullProduct.title,
        description: fullProduct.description || '',
        price: (fullProduct.base_price ?? fullProduct.price ?? 0).toString(),
        stock: (fullProduct.total_stock ?? fullProduct.stock ?? 0).toString(),
        image_url: fullProduct.image_url || fullProduct.featured_image || fullProduct.image || ''
      })

      // Initialize variant stocks
      if (fullProduct.variants && fullProduct.variants.length > 0) {
        const stocks: Record<string, string> = {}
        fullProduct.variants.forEach((v: ProductVariant) => {
          stocks[v.id] = v.stock.toString()
        })
        setVariantStocks(stocks)
      }

      setShowModal(true)
    } catch (error) {
      console.error('Failed to fetch product details:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      price: '',
      stock: '',
      image_url: ''
    })
  }

  const filteredProducts = products.filter(product =>
    product.title?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 ml-64 p-8">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Toast */}
          {toast && (
            <div className="fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-md shadow-lg z-50">
              {toast}
            </div>
          )}

          {/* Header */}
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">{t.products.title}</h1>
            <button
              onClick={() => {
                resetForm()
                setEditingProduct(null)
                setShowVariants(false)
                setVariantStocks({})
                setShowModal(true)
              }}
              className="flex items-center px-4 py-2 bg-coral-500 text-white rounded-md hover:bg-coral-600 transition-colors"
            >
              <Plus className="h-5 w-5 mr-2" />
              {t.products.addProduct}
            </button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder={t.products.searchProducts}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-coral-500 focus:border-transparent"
            />
          </div>

          {/* Products Table */}
          <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
            {loading ? (
              <div className="p-6 text-center text-gray-500">{t.common.loading}</div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-6 text-center text-gray-500">{t.products.noProducts}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.products.productName}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.products.price}</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{t.products.stock}</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"></th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            {(product.image_url || product.image) && (
                              <img
                                src={product.image_url || product.image}
                                alt={product.title}
                                className="h-10 w-10 rounded-md object-cover mr-3"
                              />
                            )}
                            <div>
                              <div className="text-sm font-medium text-gray-900">{product.title}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {t.common.currency}{product.price?.toFixed(2) || '0.00'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {product.stock ?? 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleEdit(product)}
                            className="text-coral-600 hover:text-coral-900 mr-3"
                          >
                            <Edit className="h-5 w-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(product.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Modal */}
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-md p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg font-semibold">
                    {editingProduct ? t.products.editProduct : t.products.addProduct}
                  </h2>
                  <button onClick={() => setShowModal(false)}>
                    <X className="h-5 w-5 text-gray-500" />
                  </button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Title - disabled when editing */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700">{t.products.productName}</label>
                    <input
                      type="text"
                      required={!editingProduct}
                      disabled={!!editingProduct}
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      className={`mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2 ${editingProduct ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                    />
                    {editingProduct && (
                      <p className="text-xs text-gray-500 mt-1">Product name cannot be changed</p>
                    )}
                  </div>

                  {!editingProduct && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.products.description}</label>
                      <textarea
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                        rows={3}
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.products.price}</label>
                      <input
                        type="number"
                        step="0.01"
                        required
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.products.stock}</label>
                      <input
                        type="number"
                        required
                        value={formData.stock}
                        onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                      />
                    </div>
                  </div>

                  {!editingProduct && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700">{t.products.image}</label>
                      <input
                        type="url"
                        value={formData.image_url}
                        onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                        className="mt-1 block w-full rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                      />
                    </div>
                  )}

                  {/* Variant Stock Management */}
                  {editingProduct && editingProduct.variants && editingProduct.variants.length > 0 && (
                    <div className="border border-gray-200 rounded-md">
                      <button
                        type="button"
                        onClick={() => setShowVariants(!showVariants)}
                        className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium text-gray-700 hover:bg-gray-50"
                      >
                        <span>Variant Stock Management ({editingProduct.variants.length})</span>
                        {showVariants ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                      </button>
                      {showVariants && (
                        <div className="px-4 pb-4 space-y-3 border-t border-gray-200">
                          {editingProduct.variants.map((variant) => (
                            <div key={variant.id} className="flex items-center justify-between pt-3">
                              <span className="text-sm text-gray-600">{variant.name || `Variant ${variant.id.slice(0, 8)}`}</span>
                              <input
                                type="number"
                                value={variantStocks[variant.id] || ''}
                                onChange={(e) => setVariantStocks({
                                  ...variantStocks,
                                  [variant.id]: e.target.value
                                })}
                                className="w-24 rounded-md border-gray-200 shadow-sm focus:border-coral-500 focus:ring-coral-500 sm:text-sm border p-2"
                              />
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex justify-end space-x-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                    >
                      {t.common.cancel}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 text-sm font-medium text-white bg-coral-500 rounded-md hover:bg-coral-600"
                    >
                      {t.common.save}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
