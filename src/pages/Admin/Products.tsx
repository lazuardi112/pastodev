import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

export const AdminProducts = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    sub_category_id: '',
    price: '',
  });
  const [files, setFiles] = useState({
    file: null,
    thumbnail: null,
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    try {
      // This would fetch products from the API
      // For now, showing the structure
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formDataObj = new FormData();
      Object.keys(formData).forEach(key => {
        formDataObj.append(key, formData[key]);
      });

      if (files.file) formDataObj.append('file', files.file);
      if (files.thumbnail) formDataObj.append('thumbnail', files.thumbnail);

      if (editingProduct) {
        // await adminService.updateProduct(editingProduct.id, formDataObj);
      } else {
        // await adminService.createProduct(formDataObj);
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({ name: '', description: '', category_id: '', sub_category_id: '', price: '' });
      setFiles({ file: null, thumbnail: null });
      fetchProducts();
    } catch (error) {
      console.error('Failed to save product', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Manage Products</h1>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
          Add Product
        </Button>
      </div>

      {/* Product Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingProduct ? 'Edit Product' : 'Add New Product'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                rows={3}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                >
                  <option value="">Select Category</option>
                  {/* Add categories from API */}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Price (Rp)</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Product File</label>
              <input
                type="file"
                onChange={(e) => setFiles({ ...files, file: e.target.files?.[0] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                accept=".zip,.pdf,.rar,.7z"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Thumbnail</label>
              <input
                type="file"
                onChange={(e) => setFiles({ ...files, thumbnail: e.target.files?.[0] })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                accept="image/*"
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save Product</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Products Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Product Name</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Category</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Price</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-slate-500">No products found</td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="hover:bg-slate-50">
                  <td className="px-6 py-4 text-sm text-slate-900">{product.name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">{product.category_name}</td>
                  <td className="px-6 py-4 text-sm text-slate-900">Rp{product.price.toLocaleString('id-ID')}</td>
                  <td className="px-6 py-4 text-sm space-x-2">
                    <button className="text-primary hover:text-primary">Edit</button>
                    <button className="text-red-600 hover:text-red-800">Delete</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
