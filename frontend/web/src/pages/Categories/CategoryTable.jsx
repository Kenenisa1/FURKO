import React from 'react';
import { Pencil, Trash, ToggleLeft, ToggleRight } from 'lucide-react';

export default function CategoryTable({ categories = [], onEdit, onDelete, onToggleActive }) {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Name</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden sm:table-cell">Slug</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 hidden md:table-cell">Default Priority</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600">Status</th>
            <th className="text-right px-4 py-3 font-medium text-gray-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {categories.map((c) => (
            <tr key={c.id} className="border-t last:border-b">
              <td className="px-4 py-3">
                <div className="font-medium text-gray-800">{c.name}</div>
                {c.description && <div className="text-xs text-gray-500 mt-1">{c.description}</div>}
              </td>

              <td className="px-4 py-3 hidden sm:table-cell text-gray-600">{c.slug}</td>
              <td className="px-4 py-3 hidden md:table-cell text-gray-600">{c.default_priority || 'medium'}</td>

              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${c.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                  {c.is_active ? 'Active' : 'Inactive'}
                </span>
              </td>

              <td className="px-4 py-3 text-right">
                <div className="inline-flex items-center gap-2">
                  <button
                    onClick={() => onToggleActive && onToggleActive(c)}
                    title={c.is_active ? 'Deactivate' : 'Activate'}
                    className="p-2 rounded-lg hover:bg-gray-50"
                  >
                    {c.is_active ? <ToggleRight className="w-4 h-4 text-green-600" /> : <ToggleLeft className="w-4 h-4 text-gray-500" />}
                  </button>

                  <button onClick={() => onEdit && onEdit(c)} title="Edit" className="p-2 rounded-lg hover:bg-gray-50">
                    <Pencil className="w-4 h-4 text-[#1a6b3c]" />
                  </button>

                  <button onClick={() => onDelete && onDelete(c)} title="Delete" className="p-2 rounded-lg hover:bg-gray-50">
                    <Trash className="w-4 h-4 text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}

          {categories.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-8 text-center text-gray-400">
                No categories found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}