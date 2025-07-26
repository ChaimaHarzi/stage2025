"use client";
import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Tag, X, Search, Filter, Grid, List, AlertTriangle } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  description?: string;
  color: string;
  itemCount?: number;
  createdAt?: Date;
}

const CategorieCards = () => {
  const [categories, setCategories] = useState<Category[]>([
    { id: '1', name: 'Technologie', description: 'Tous les sujets et discussions liés à la technologie', color: 'blue', itemCount: 24 },
    { id: '2', name: 'Affaires', description: 'Stratégies commerciales, gestion et opérations', color: 'green', itemCount: 18 },
    { id: '3', name: 'Design', description: 'Design UI/UX, design graphique et travail créatif', color: 'purple', itemCount: 32 },
    { id: '4', name: 'Développement', description: 'Développement logiciel et programmation', color: 'orange', itemCount: 41 },
    { id: '5', name: 'Marketing', description: 'Marketing digital, SEO et stratégie de contenu', color: 'pink', itemCount: 15 },
    { id: '6', name: 'Finance', description: 'Planification financière, investissements et comptabilité', color: 'indigo', itemCount: 9 },
  ]);

  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [closing, setClosing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    color: 'blue'
  });

  const colorOptions = [
    { name: 'blue', class: 'bg-blue-500', lightClass: 'bg-blue-100', textClass: 'text-blue-600' },
    { name: 'green', class: 'bg-green-500', lightClass: 'bg-green-100', textClass: 'text-green-600' },
    { name: 'purple', class: 'bg-purple-500', lightClass: 'bg-purple-100', textClass: 'text-purple-600' },
    { name: 'orange', class: 'bg-orange-500', lightClass: 'bg-orange-100', textClass: 'text-orange-600' },
    { name: 'pink', class: 'bg-pink-500', lightClass: 'bg-pink-100', textClass: 'text-pink-600' },
    { name: 'indigo', class: 'bg-indigo-500', lightClass: 'bg-indigo-100', textClass: 'text-indigo-600' },
  ];

  const getColorClasses = (color: string) => {
    return colorOptions.find(c => c.name === color) || colorOptions[0];
  };

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    category.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const openAddModal = () => {
    setEditingCategory(null);
    setFormData({ name: '', description: '', color: 'blue' });
    setClosing(false);
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      color: category.color
    });
    setClosing(false);
    setShowModal(true);
  };

  const closeModal = () => {
    setClosing(true);
    setTimeout(() => {
      setShowModal(false);
      setClosing(false);
    }, 300);
  };

  const closeDeleteModal = () => {
    setClosing(true);
    setTimeout(() => {
      setShowDeleteModal(false);
      setCategoryToDelete(null);
      setClosing(false);
    }, 300);
  };

  const handleSubmit = () => {
    if (!formData.name.trim()) return;

    if (editingCategory) {
      setCategories(prev => prev.map(cat =>
        cat.id === editingCategory.id
          ? { ...cat, ...formData }
          : cat
      ));
    } else {
      const newCategory: Category = {
        id: Date.now().toString(),
        ...formData,
        itemCount: 0,
        createdAt: new Date()
      };
      setCategories(prev => [...prev, newCategory]);
    }

    closeModal();
    setFormData({ name: '', description: '', color: 'blue' });
  };

  const openDeleteModal = (id: string) => {
    setCategoryToDelete(id);
    setClosing(false);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      setCategories(prev => prev.filter(cat => cat.id !== categoryToDelete));
    }
    closeDeleteModal();
  };

  const CategoryCard = ({ category }: { category: Category }) => {
    const colorClasses = getColorClasses(category.color);
    
    return (
      <div className="group relative bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-xl hover:shadow-black/5 dark:hover:shadow-black/20 transition-all duration-300 hover:-translate-y-1 overflow-visible min-h-[180px]">
        {/* Gradient overlay */}
        <div className={`absolute inset-0 bg-gradient-to-br from-${category.color}-50/50 to-transparent dark:from-${category.color}-900/20 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
        
        <div className="relative p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 pr-16"> {/* Added pr-16 for icon space */}
              <div className={`p-3 ${colorClasses.lightClass} dark:bg-${category.color}-900/30 rounded-xl group-hover:scale-110 transition-transform duration-200`}>
                <Tag className={`w-5 h-5 ${colorClasses.textClass} dark:text-${category.color}-400`} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white text-lg group-hover:text-${category.color}-600 dark:group-hover:text-${category.color}-400 transition-colors">
                  {category.name}
                </h3>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {category.itemCount} éléments
                  </span>
                  <div className={`w-2 h-2 ${colorClasses.class} rounded-full`} />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 absolute right-4 top-4">
              <button
                onClick={() => openEditModal(category)}
                className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                title="Modifier"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => openDeleteModal(category.id)}
                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                title="Supprimer"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {category.description && (
            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed">
              {category.description.length > 80
                ? `${category.description.slice(0, 80)}...`
                : category.description}
            </p>
          )}

          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>ID: {category.id}</span>
              <div className={`px-2 py-1 ${colorClasses.lightClass} dark:bg-${category.color}-900/30 ${colorClasses.textClass} dark:text-${category.color}-400 rounded-full font-medium`}>
                {category.color}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const CategoryListItem = ({ category }: { category: Category }) => {
    const colorClasses = getColorClasses(category.color);
    
    return (
      <div className="group bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-all duration-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <div className={`p-2 ${colorClasses.lightClass} dark:bg-${category.color}-900/30 rounded-lg`}>
              <Tag className={`w-4 h-4 ${colorClasses.textClass} dark:text-${category.color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-3 mb-1">
                <h3 className="font-medium text-gray-900 dark:text-white">
                  {category.name}
                </h3>
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                  {category.itemCount} éléments
                </span>
                <div className={`w-2 h-2 ${colorClasses.class} rounded-full`} />
              </div>
              {category.description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 truncate">
                  {category.description}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => openEditModal(category)}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
              title="Modifier"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => openDeleteModal(category.id)}
              className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
              title="Supprimer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen dark:bg-gray-900 p-4 md:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                Catégories
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2 text-base">
                Organisez votre contenu avec {categories.length} catégories
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-blue-600 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher des catégories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:h-20"
                />
              </div>

              {/* View Toggle */}
              <div className="flex bg-gray-100 dark:bg-gray-800 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  title="Vue grille"
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${
                    viewMode === 'list'
                      ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                      : 'text-gray-600 dark:text-gray-400'
                  }`}
                  title="Vue liste"
                >
                  <List className="w-4 h-4" />
                </button>
              </div>

              {/* Add Button */}
              <button
                onClick={openAddModal}
                className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25"
              >
                <Plus className="w-4 h-4" />
                Ajouter une catégorie
              </button>
            </div>
          </div>
        </div>

        {/* Categories Display */}
        {filteredCategories.length > 0 ? (
          viewMode === 'grid' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCategories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredCategories.map((category) => (
                <CategoryListItem key={category.id} category={category} />
              ))}
            </div>
          )
        ) : searchTerm ? (
          <div className="text-center py-20">
            <div className="mx-auto w-20 h-20 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucune catégorie trouvée</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto">
              Aucune catégorie ne correspond à votre recherche pour "{searchTerm}". Essayez un autre terme.
            </p>
          </div>
        ) : (
          <div className="text-center py-20 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 rounded-full flex items-center justify-center mb-4">
              <Tag className="w-10 h-10 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Aucune catégorie pour le moment</h3>
            <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-6">
              Commencez par créer votre première catégorie pour organiser efficacement votre contenu.
            </p>
            <button
              onClick={openAddModal}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105 hover:shadow-lg"
            >
              <Plus className="w-4 h-4" />
              Ajouter votre première catégorie
            </button>
          </div>
        )}

        {/* Enhanced Modal */}
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - reduced blur and opacity */}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              closing ? 'opacity-0' : 'opacity-100'
            }`} onClick={closeModal} />
            
            <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 relative z-10 ${
              closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}>
              <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {editingCategory ? 'Modifier la catégorie' : 'Ajouter une nouvelle catégorie'}
                  </h2>
                  <button
                    onClick={closeModal}
                    className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Nom de la catégorie
                    </label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="Entrez le nom de la catégorie"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Description
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                      placeholder="Entrez la description de la catégorie"
                      rows={3}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Couleur
                    </label>
                    <div className="flex gap-3">
                      {colorOptions.map((color) => (
                        <button
                          key={color.name}
                          type="button"
                          onClick={() => setFormData({ ...formData, color: color.name })}
                          className={`w-8 h-8 ${color.class} rounded-full transition-all hover:scale-110 ${
                            formData.color === color.name
                              ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-900 ring-gray-400'
                              : ''
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                    >
                      Annuler
                    </button>
                    <button
                      type="button"
                      onClick={handleSubmit}
                      className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-xl transition-all font-medium hover:scale-105"
                    >
                      {editingCategory ? 'Mettre à jour' : 'Créer'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop - reduced blur and opacity */}
            <div className={`absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
              closing ? 'opacity-0' : 'opacity-100'
            }`} onClick={closeDeleteModal} />
            
            <div className={`bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 relative z-10 ${
              closing ? 'scale-95 opacity-0' : 'scale-100 opacity-100'
            }`}>
              <div className="p-6">
                <div className="flex items-center gap-4 mb-6">
                  <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full">
                    <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      Confirmer la suppression
                    </h2>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                      Cette action est irréversible
                    </p>
                  </div>
                </div>

                <p className="text-gray-700 dark:text-gray-300 mb-6">
                  Êtes-vous sûr de vouloir supprimer cette catégorie ? Tous les éléments associés seront également supprimés.
                </p>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={closeDeleteModal}
                    className="flex-1 px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-xl transition-colors font-medium"
                  >
                    Annuler
                  </button>
                  <button
                    type="button"
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl transition-all font-medium hover:scale-105"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CategorieCards;