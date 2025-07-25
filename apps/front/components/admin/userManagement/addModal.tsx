"use client";
import React, { useEffect, useRef, useState } from "react";

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormErrors {
  name?: string;
  price?: string;
  category?: string;
}

export default function addModal({ isOpen, onClose, onSubmit }: CrudModalProps) {
  const [show, setShow] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setClosing(false);
      setErrors({});
      setTouched(new Set());
      setIsSubmitting(false);
      // Reset form when opening
      if (formRef.current) {
        formRef.current.reset();
      }
    } else if (show) {
      setClosing(true);
      closeTimeout.current = setTimeout(() => {
        setShow(false);
        setClosing(false);
      }, 300); // match transition duration
    }
    return () => {
      if (closeTimeout.current) clearTimeout(closeTimeout.current);
    };
  }, [isOpen]);

  // Prevent background scroll when modal is open
  useEffect(() => {
    if (show) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [show]);

  // Focus the first input when modal opens
  useEffect(() => {
    if (show && firstInputRef.current) {
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 100);
    }
  }, [show]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && show && !isSubmitting) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, onClose, isSubmitting]);

  if (!show) return null;

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case 'name':
        if (!value.trim()) return 'Le nom est requis';
        if (value.trim().length < 3) return 'Le nom doit contenir au moins 3 caractères';
        break;
      case 'price':
        if (!value) return 'Le prix est requis';
        if (parseFloat(value) <= 0) return 'Le prix doit être supérieur à 0';
        break;
      case 'category':
        if (!value) return 'La catégorie est requise';
        break;
    }
    return undefined;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => new Set(prev).add(name));
    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (touched.has(name)) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Validate all fields
    const newErrors: FormErrors = {};
    const fieldsToValidate = ['name', 'price', 'category'];
    
    fieldsToValidate.forEach(field => {
      const value = formData.get(field) as string;
      const error = validateField(field, value);
      if (error) newErrors[field as keyof FormErrors] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      setTouched(new Set(fieldsToValidate));
      return;
    }

    setIsSubmitting(true);
    
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
      setIsSubmitting(false);
    }
  };

  // Overlay click closes modal, but clicking modal content does not
  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-4 transition-all duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={() => !isSubmitting && onClose()}
    >
      {/* Backdrop */}
      <div className={`absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`} />
      
      {/* Modal */}
      <div
        className={`relative w-full max-w-lg transition-all duration-300 transform ${
          closing
            ? 'scale-95 opacity-0 translate-y-4'
            : 'scale-100 opacity-100 translate-y-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl dark:bg-gray-800 overflow-hidden">
          {/* Modal header */}
          <div className="relative bg-gradient-to-r from-[#00A9E0] to-[#0033A0] px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">
                  Ajouter un Équipement
                </h3>
                <p className="mt-1 text-sm text-blue-100">
                  Remplissez les informations ci-dessous
                </p>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                className="text-white/80 hover:text-white bg-white/10 hover:bg-white/20 rounded-lg text-sm w-10 h-10 inline-flex justify-center items-center transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={onClose}
              >
                <svg className="w-5 h-5" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 14 14">
                  <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"/>
                </svg>
                <span className="sr-only">Fermer</span>
              </button>
            </div>
          </div>
          
          {/* Modal body */}
          <form ref={formRef} className="p-6" onSubmit={handleSubmit}>
            <div className="space-y-5">
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Nom de l'équipement <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    ref={firstInputRef}
                    type="text"
                    name="name"
                    id="name"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className={`bg-gray-50 border ${
                      errors.name && touched.has('name')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                    } text-gray-900 text-sm rounded-lg block w-full p-3 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                    placeholder="Ex: Ordinateur portable Dell"
                  />
                  {errors.name && touched.has('name') && (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                      <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
                {errors.name && touched.has('name') && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Price and Category row */}
              <div className="grid gap-5 grid-cols-1 sm:grid-cols-2">
                {/* Price field */}
                <div>
                  <label htmlFor="price" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Prix <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400">€</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      step="0.01"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={`bg-gray-50 border ${
                        errors.price && touched.has('price')
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                      } text-gray-900 text-sm rounded-lg block w-full pl-8 pr-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                      placeholder="299.99"
                    />
                  </div>
                  {errors.price && touched.has('price') && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.price}</p>
                  )}
                </div>

                {/* Category field */}
                <div>
                  <label htmlFor="category" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Catégorie <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="category"
                    name="category"
                    onBlur={handleBlur}
                    onChange={handleChange}
                    className={`bg-gray-50 border ${
                      errors.category && touched.has('category')
                        ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                        : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                    } text-gray-900 text-sm rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                  >
                    <option value="">Sélectionner une catégorie</option>
                    <option value="TV">TV/Moniteurs</option>
                    <option value="PC">Ordinateurs</option>
                    <option value="GA">Gaming/Console</option>
                    <option value="PH">Téléphones</option>
                  </select>
                  {errors.category && touched.has('category') && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                  )}
                </div>
              </div>

              {/* Description field */}
              <div>
                <label htmlFor="description" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Description
                  <span className="ml-2 text-xs font-normal text-gray-500">(Optionnel)</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  className="block p-3 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0] dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200 resize-none"
                  placeholder="Décrivez l'équipement en détail..."
                ></textarea>
              </div>
            </div>

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-4 focus:outline-none focus:ring-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="relative inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-[#00A9E0] to-[#0033A0] rounded-lg hover:from-[#0090C0] hover:to-[#002A80] focus:ring-4 focus:outline-none focus:ring-[#00A9E0]/50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Ajout en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                      <path fillRule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clipRule="evenodd"></path>
                    </svg>
                    Ajouter l'équipement
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}