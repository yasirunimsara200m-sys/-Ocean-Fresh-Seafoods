import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { Product, Category, Variant } from '../../types';
import {
  Plus,
  Search,
  Edit2,
  Trash2,
  CheckCircle2,
  X,
  AlertTriangle,
  Sparkles,
  ShoppingBag,
  RefreshCw
} from 'lucide-react';

export const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    category_id: '',
    short_description: '',
    description: '',
    base_price: 2500,
    original_price: '' as string | number,
    unit: '1 KG',
    in_stock: true,
    stock_quantity: 50,
    is_featured: false,
    is_best_seller: false,
    freshness_badge: 'Export Quality',
    image_url: '',
    variants: [] as Variant[],
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [prodRes, catRes] = await Promise.all([
        api.getProducts(),
        api.getCategories(),
      ]);
      setProducts(prodRes.products);
      setCategories(catRes.categories);
      if (catRes.categories.length > 0 && !formData.category_id) {
        setFormData((prev) => ({ ...prev, category_id: catRes.categories[0].id }));
      }
    } catch (err) {
      console.error('Failed to load products/categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      category_id: categories[0]?.id || '',
      short_description: '',
      description: '',
      base_price: 2500,
      original_price: '',
      unit: '1 KG',
      in_stock: true,
      stock_quantity: 50,
      is_featured: false,
      is_best_seller: false,
      freshness_badge: 'Export Quality',
      image_url: 'https://images.unsplash.com/photo-1534939561126-855b8675edd7?auto=format&fit=crop&w=800&q=80',
      variants: [
        { id: 'v1', name: '500g Portion', price: 1400, weight: '500g', cut: 'Cleaned' },
        { id: 'v2', name: '1 KG Portion', price: 2500, weight: '1 KG', cut: 'Cleaned' },
      ],
    });
    setFormError('');
    setModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormData({
      name: p.name,
      category_id: p.category_id,
      short_description: p.short_description || '',
      description: p.description || '',
      base_price: p.base_price,
      original_price: p.original_price || '',
      unit: p.unit || '1 KG',
      in_stock: p.in_stock,
      stock_quantity: p.stock_quantity,
      is_featured: p.is_featured,
      is_best_seller: p.is_best_seller,
      freshness_badge: p.freshness_badge || 'Export Quality',
      image_url: p.image_url,
      variants: p.variants || [],
    });
    setFormError('');
    setModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError('');

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
      } else {
        await api.createProduct(formData);
      }
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      setFormError(err.message || 'Failed to save product');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete "${name}"?`)) return;
    try {
      await api.deleteProduct(id);
      fetchData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete');
    }
  };

  // Add / remove variants in modal
  const addVariantField = () => {
    const newId = `v-${Date.now()}`;
    setFormData({
      ...formData,
      variants: [
        ...formData.variants,
        { id: newId, name: '1 KG Cut', price: formData.base_price, weight: '1 KG', cut: 'Cleaned' },
      ],
    });
  };

  const removeVariant = (idx: number) => {
    const updated = [...formData.variants];
    updated.splice(idx, 1);
    setFormData({ ...formData, variants: updated });
  };

  const updateVariantItem = (idx: number, field: string, value: any) => {
    const updated = [...formData.variants];
    updated[idx] = { ...updated[idx], [field]: value };
    setFormData({ ...formData, variants: updated });
  };

  const filtered = products.filter((p) => {
    if (selectedCat !== 'all' && p.category_id !== selectedCat && p.category_slug !== selectedCat) {
      return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return p.name.toLowerCase().includes(q) || (p.category_name || '').toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-white tracking-tight">
            Seafood Inventory & Cuts
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage fresh fish varieties, lagoon mud crabs, prawns, pricing, and portion cuts.
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs px-5 py-2.5 rounded-xl shadow-lg shadow-cyan-900/20 cursor-pointer flex items-center space-x-2 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Seafood Product</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search by product name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <select
            value={selectedCat}
            onChange={(e) => setSelectedCat(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-300 text-xs rounded-xl px-3 py-2 cursor-pointer focus:outline-none focus:border-cyan-500"
          >
            <option value="all">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>

          <button
            onClick={fetchData}
            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl border border-slate-700 cursor-pointer"
            title="Reload Products"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead>
              <tr className="text-[10px] text-slate-500 uppercase tracking-wider bg-slate-900/90 border-b border-slate-800">
                <th className="py-3 px-4">Item & Visual</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Base Price</th>
                <th className="py-3 px-4">Portions / Cuts</th>
                <th className="py-3 px-4">Stock Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filtered.length > 0 ? (
                filtered.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={p.image_url}
                          alt={p.name}
                          className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-white leading-tight">{p.name}</div>
                          <div className="text-[10px] text-cyan-400 font-medium mt-0.5">
                            {p.freshness_badge}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-400">{p.category_name || 'Seafood'}</td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">Rs. {p.base_price.toLocaleString()}</div>
                      <div className="text-[10px] text-slate-500">per {p.unit}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-[11px] bg-slate-900 border border-slate-800 text-slate-300 px-2 py-0.5 rounded-lg">
                        {p.variants?.length || 0} Cut Options
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                        p.in_stock
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                          : 'bg-rose-950 text-rose-400 border border-rose-800'
                      }`}>
                        {p.in_stock ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(p)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-cyan-400 hover:text-cyan-300 rounded-lg border border-slate-700 cursor-pointer"
                          title="Edit Seafood Product"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDeleteProduct(p.id, p.name)}
                          className="p-1.5 bg-slate-900 hover:bg-slate-800 text-rose-400 hover:text-rose-300 rounded-lg border border-slate-700 cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    No products found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 sm:p-6">
          <div
            onClick={() => setModalOpen(false)}
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs transition-opacity"
          />

          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-3xl w-full p-6 sm:p-8 z-10 space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white">
                {editingProduct ? 'Edit Seafood Product' : 'Add New Seafood Product'}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {formError && (
              <div className="p-3 bg-rose-950/60 border border-rose-800 text-rose-300 text-xs rounded-xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Product Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Yellowfin Tuna Steaks"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Category *</label>
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500 cursor-pointer"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Base Price (LKR) *</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={formData.base_price}
                    onChange={(e) => setFormData({ ...formData, base_price: Number(e.target.value) })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Original Price (Strikeout)</label>
                  <input
                    type="number"
                    placeholder="e.g. 3200"
                    value={formData.original_price}
                    onChange={(e) => setFormData({ ...formData, original_price: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-semibold mb-1">Unit</label>
                  <input
                    type="text"
                    placeholder="1 KG / 500g"
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Image URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://images.unsplash.com/..."
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Short Catch Summary</label>
                <input
                  type="text"
                  placeholder="Sashimi grade yellowfin tuna from day-boat fisheries..."
                  value={formData.short_description}
                  onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Detailed Description & Culinary Notes</label>
                <textarea
                  rows={3}
                  placeholder="Describe texture, flavor, cooking suggestions..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3.5 py-2 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              {/* Badges and toggles */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <label className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.in_stock}
                    onChange={(e) => setFormData({ ...formData, in_stock: e.target.checked })}
                    className="rounded-sm text-cyan-600 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">In Stock</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_best_seller}
                    onChange={(e) => setFormData({ ...formData, is_best_seller: e.target.checked })}
                    className="rounded-sm text-cyan-600 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Best Seller</span>
                </label>

                <label className="flex items-center space-x-2 bg-slate-800/60 p-3 rounded-xl border border-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.is_featured}
                    onChange={(e) => setFormData({ ...formData, is_featured: e.target.checked })}
                    className="rounded-sm text-cyan-600 focus:ring-0"
                  />
                  <span className="text-slate-300 font-medium">Featured</span>
                </label>

                <div>
                  <input
                    type="text"
                    placeholder="Badge e.g. Day-Boat Fresh"
                    value={formData.freshness_badge}
                    onChange={(e) => setFormData({ ...formData, freshness_badge: e.target.value })}
                    className="w-full h-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-white"
                  />
                </div>
              </div>

              {/* Cut / Portion Variations Manager */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-slate-200 font-bold block">Available Cuts & Portion Sizes</span>
                    <span className="text-[10px] text-slate-500">Allow customers to choose specific cuts (e.g. Slices, Cubes, Whole)</span>
                  </div>
                  <button
                    type="button"
                    onClick={addVariantField}
                    className="px-3 py-1 bg-cyan-950 text-cyan-400 border border-cyan-800 rounded-lg text-xs font-semibold hover:bg-cyan-900 cursor-pointer"
                  >
                    + Add Cut Option
                  </button>
                </div>

                <div className="space-y-2">
                  {formData.variants.map((v, idx) => (
                    <div key={v.id || idx} className="flex items-center space-x-2 bg-slate-800/40 p-2.5 rounded-xl border border-slate-700/60">
                      <input
                        type="text"
                        placeholder="Cut Name (e.g. 500g Sliced)"
                        value={v.name}
                        onChange={(e) => updateVariantItem(idx, 'name', e.target.value)}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                      />
                      <input
                        type="number"
                        placeholder="Price (LKR)"
                        value={v.price}
                        onChange={(e) => updateVariantItem(idx, 'price', Number(e.target.value))}
                        className="w-28 bg-slate-800 border border-slate-700 rounded-lg px-2.5 py-1 text-white text-xs"
                      />
                      <button
                        type="button"
                        onClick={() => removeVariant(idx)}
                        className="p-1 text-slate-500 hover:text-rose-400"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-6 py-2.5 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/30"
                >
                  {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Create Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
