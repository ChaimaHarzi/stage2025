"use client";
import React, { useEffect, useRef, useState } from "react";

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormErrors {
  name?: string;
  reference?: string;
  status?: string;
  famille?: string;
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
      case 'reference':
        if (!value.trim()) return 'La référence est requise';
        break;
      case 'status':
        if (!value) return 'Le statut est requis';
        break;
      case 'famille':
        if (!value) return 'La famille est requise';
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
    const fieldsToValidate = ['name', 'reference', 'status', 'famille', 'category'];
    
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
      className={`fixed inset-0 z-[99999] flex items-center justify-center p-4 pt-20 transition-all duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`}
      onClick={() => !isSubmitting && onClose()}
      style={{ zIndex: 99999 }}
    >
      {/* Backdrop - reduced blur and opacity */}
      <div className={`absolute inset-0 bg-black/40 transition-opacity duration-300 ${
        closing ? 'opacity-0' : 'opacity-100'
      }`} />
      
      {/* Modal */}
      <div
        className={`relative w-full max-w-lg max-h-[calc(100vh-6rem)] transition-all duration-300 transform ${
          closing
            ? 'scale-95 opacity-0 translate-y-4'
            : 'scale-100 opacity-100 translate-y-0'
        }`}
        onClick={e => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl dark:bg-gray-800 overflow-hidden">
          <style jsx>{`
            .scrollbar-hide::-webkit-scrollbar {
              display: none;
            }
            .scrollbar-hide {
              -ms-overflow-style: none;
              scrollbar-width: none;
            }
          `}</style>
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
          <div className="max-h-[calc(100vh-12rem)] overflow-y-auto scrollbar-hide" style={{
            scrollbarWidth: 'none',
            msOverflowStyle: 'none'
          }}>
            <form ref={formRef} className="p-6" onSubmit={handleSubmit}>
              <div className="space-y-8">
              {/* Name field */}
              <div>
                <label htmlFor="name" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Nom <span className="text-red-500">*</span>
                </label>
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
                  } text-gray-900 text-sm rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                  placeholder="Ex: Ordinateur portable Dell"
                />
                {errors.name && touched.has('name') && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.name}</p>
                )}
              </div>

              {/* Reference field */}
              <div>
                <label htmlFor="reference" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Référence <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="reference"
                  id="reference"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  className={`bg-gray-50 border ${
                    errors.reference && touched.has('reference')
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                  } text-gray-900 text-sm rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                  placeholder="Ex: REF-001"
                />
                {errors.reference && touched.has('reference') && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.reference}</p>
                )}
              </div>

              {/* Status field */}
              <div>
                <label htmlFor="status" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Status <span className="text-red-500">*</span>
                </label>
                <select
                  id="status"
                  name="status"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  className={`bg-gray-50 border ${
                    errors.status && touched.has('status')
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                  } text-gray-900 text-sm rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                >
                  <option value="">Sélectionner un statut</option>
                  <option value="STOCKAGE">STOCKAGE</option>
                  <option value="PRODUCTION">PRODUCTION</option>
                  <option value="REPERATION">REPERATION</option>
                </select>
                {errors.status && touched.has('status') && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.status}</p>
                )}
              </div>

              {/* Famille field */}
              <div>
                <label htmlFor="famille" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Famille <span className="text-red-500">*</span>
                </label>
                <select
                  id="famille"
                  name="famille"
                  onBlur={handleBlur}
                  onChange={handleChange}
                  className={`bg-gray-50 border ${
                    errors.famille && touched.has('famille')
                      ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                      : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                  } text-gray-900 text-sm rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                >
                  <option value="">Sélectionner une famille</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                {errors.famille && touched.has('famille') && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.famille}</p>
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
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
                {errors.category && touched.has('category') && (
                  <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.category}</p>
                )}
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
              <div className="flex items-center justify-end gap-3 mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
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
    </div>
  );
}