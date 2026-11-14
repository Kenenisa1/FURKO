import React, { useEffect, useState } from 'react';
import CategoryTable from './CategoryTable.jsx';
import CategoryFormModal from './CategoryFormModal.jsx';
import * as categoryService from '../../services/categoryService.js';
import { useApp } from '../../context/AppContext.jsx';

export default function CategoriesPage() {
  const { showToast } = useApp();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function refresh() {
    setLoading(true);
    try {
      const data = await categoryService.getCategories();
      setCategories(data);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      showToast && showToast('Failed to load categories', 'error');
    } finally {
      setLoading(false);
    }
  }

  function openCreate() {
    setEditing(undefined);
    setModalOpen(true);
  }

  function openEdit(c) {
    setEditing(c);
    setModalOpen(true);
  }

  async function handleSave(payload) {
    setSaving(true);
    try {
      if (editing && editing.id) {
        await categoryService.updateCategory(editing.id, payload);
        showToast && showToast('Category updated');
      } else {
        await categoryService.createCategory(payload);
        showToast && showToast('Category created');
      }
      setModalOpen(false);
      await refresh();
    } catch (err) {
      // bubble up to modal to show error
      // eslint-disable-next-line no-console
      console.error(err);
      throw err;
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleActive(c) {
    try {
      await categoryService.updateCategory(c.id, { is_active: !c.is_active });
      showToast && showToast(`${c.name} ${c.is_active ? 'deactivated' : 'activated'}`);
      await refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      showToast && showToast('Failed to update status', 'error');
    }
  }

  async function handleDelete(c) {
    try {
      // Safe-delete: check usage first
      const usageCount = await categoryService.checkCategoryUsage(c.id);
      if (usageCount > 0) {
        // Block deletion — inform admin and suggest deactivation
        showToast && showToast(`Cannot delete "${c.name}" — it is used by ${usageCount} existing report(s).`, 'error');
        return;
      }

      // Confirm deletion
      const confirmed = window.confirm(`Delete category "${c.name}"? This action cannot be undone.`);
      if (!confirmed) return;

      await categoryService.deleteCategory(c.id);
      showToast && showToast('Category deleted');
      await refresh();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(err);
      showToast && showToast((err && err.message) || 'Deletion failed', 'error');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Problem Categories</h2>
          <p className="text-sm text-gray-500 mt-1">Manage categories used to route and classify citizen reports.</p>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={refresh} className="px-3 py-2 rounded-lg border text-sm bg-white">Refresh</button>
          <button onClick={openCreate} className="px-4 py-2 rounded-lg text-white bg-[#1a6b3c] hover:bg-[#15502a]">Create Category</button>
        </div>
      </div>

      <div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading categories…</div>
        ) : (
          <CategoryTable
            categories={categories}
            onEdit={(c) => openEdit(c)}
            onDelete={(c) => handleDelete(c)}
            onToggleActive={(c) => handleToggleActive(c)}
          />
        )}
      </div>

      <CategoryFormModal
        open={modalOpen}
        initial={editing}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        saving={saving}
      />
    </div>
  );
}