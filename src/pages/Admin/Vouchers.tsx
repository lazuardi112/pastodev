import React, { useState, useEffect } from 'react';
import { adminService } from '@/services/api';
import { Button } from '@/components/ui/button';

export const AdminVouchers = () => {
  const [vouchers, setVouchers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    description: '',
    discount_type: 'percentage',
    discount_value: '',
    min_purchase: '0',
    max_discount: '',
    usage_limit: '',
    valid_from: '',
    valid_until: '',
  });

  useEffect(() => {
    fetchVouchers();
  }, []);

  const fetchVouchers = async () => {
    try {
      const { data } = await adminService.getVouchers();
      setVouchers(data);
    } catch (error) {
      console.error('Failed to fetch vouchers', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingVoucher) {
        await adminService.updateVoucher(editingVoucher.id, formData);
      } else {
        await adminService.createVoucher(formData);
      }

      setShowForm(false);
      setEditingVoucher(null);
      resetForm();
      fetchVouchers();
    } catch (error) {
      console.error('Failed to save voucher', error);
      alert('Failed to save voucher');
    }
  };

  const resetForm = () => {
    setFormData({
      code: '',
      description: '',
      discount_type: 'percentage',
      discount_value: '',
      min_purchase: '0',
      max_discount: '',
      usage_limit: '',
      valid_from: '',
      valid_until: '',
    });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this voucher?')) {
      try {
        await adminService.deleteVoucher(id);
        fetchVouchers();
      } catch (error) {
        console.error('Failed to delete voucher', error);
        alert('Failed to delete voucher');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-slate-900">Manage Vouchers</h1>
        <Button onClick={() => {
          setEditingVoucher(null);
          resetForm();
          setShowForm(true);
        }} className="bg-teal-600 hover:bg-teal-700">
          Create Voucher
        </Button>
      </div>

      {/* Voucher Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-bold mb-4">{editingVoucher ? 'Edit Voucher' : 'Create New Voucher'}</h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Voucher Code</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  placeholder="e.g., SAVE20"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount Type</label>
                <select
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="percentage">Percentage</option>
                  <option value="fixed">Fixed Amount</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                placeholder="e.g., Save 20% on all products"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Discount Value</label>
                <input
                  type="number"
                  value={formData.discount_value}
                  onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Minimum Purchase (Rp)</label>
                <input
                  type="number"
                  value={formData.min_purchase}
                  onChange={(e) => setFormData({ ...formData, min_purchase: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Max Discount (Rp)</label>
                <input
                  type="number"
                  value={formData.max_discount}
                  onChange={(e) => setFormData({ ...formData, max_discount: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Usage Limit</label>
                <input
                  type="number"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valid From</label>
                <input
                  type="datetime-local"
                  value={formData.valid_from}
                  onChange={(e) => setFormData({ ...formData, valid_from: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Valid Until</label>
                <input
                  type="datetime-local"
                  value={formData.valid_until}
                  onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              <Button type="submit" className="bg-teal-600 hover:bg-teal-700">Save Voucher</Button>
            </div>
          </form>
        </div>
      )}

      {/* Vouchers Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Code</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Discount</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Valid Until</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Usage</th>
              <th className="px-6 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {vouchers.map((voucher) => (
              <tr key={voucher.id} className="hover:bg-slate-50">
                <td className="px-6 py-4 text-sm font-medium text-slate-900">{voucher.code}</td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {voucher.discount_type === 'percentage'
                    ? `${voucher.discount_value}%`
                    : `Rp${voucher.discount_value.toLocaleString('id-ID')}`
                  }
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {voucher.valid_until ? new Date(voucher.valid_until).toLocaleDateString('id-ID') : '-'}
                </td>
                <td className="px-6 py-4 text-sm text-slate-900">
                  {voucher.used_count}{voucher.usage_limit ? `/${voucher.usage_limit}` : ''}
                </td>
                <td className="px-6 py-4 text-sm space-x-2">
                  <button
                    onClick={() => {
                      setEditingVoucher(voucher);
                      setFormData(voucher);
                      setShowForm(true);
                    }}
                    className="text-primary hover:text-primary"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(voucher.id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
