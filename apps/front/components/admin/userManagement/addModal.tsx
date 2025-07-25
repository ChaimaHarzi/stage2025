"use client";
import React, { useEffect, useRef, useState } from "react";

interface CrudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: FormData) => void;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
  role?: string;
  phone?: string;
}

export default function AddModal({ isOpen, onClose, onSubmit }: CrudModalProps) {
  const [show, setShow] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
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
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
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

  const validateField = (name: string, value: string, formData?: FormData): string | undefined => {
    switch (name) {
      case 'firstName':
        if (!value.trim()) return 'Le prénom est requis';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        break;
      case 'lastName':
        if (!value.trim()) return 'Le nom est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        break;
      case 'email':
        if (!value.trim()) return 'L\'email est requis';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Format d\'email invalide';
        break;
      case 'password':
        if (!value) return 'Le mot de passe est requis';
        if (value.length < 8) return 'Le mot de passe doit contenir au moins 8 caractères';
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(value)) 
          return 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre';
        break;
      case 'confirmPassword':
        if (!value) return 'La confirmation du mot de passe est requise';
        const password = formData?.get('password') as string;
        if (value !== password) return 'Les mots de passe ne correspondent pas';
        break;
      case 'role':
        if (!value) return 'Le rôle est requis';
        break;
      case 'phone':
        if (value && !/^(\+33|0)[1-9](\d{8})$/.test(value.replace(/\s/g, ''))) 
          return 'Format de téléphone invalide';
        break;
    }
    return undefined;
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setTouched(prev => new Set(prev).add(name));
    
    let formData;
    if (name === 'confirmPassword' && formRef.current) {
      formData = new FormData(formRef.current);
    }
    
    const error = validateField(name, value, formData);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (touched.has(name)) {
      let formData;
      if (name === 'confirmPassword' || name === 'password') {
        formData = new FormData(formRef.current!);
        if (name === 'password') {
          formData.set('password', value);
        }
      }
      
      const error = validateField(name, value, formData);
      setErrors(prev => ({ ...prev, [name]: error }));
      
      // Also revalidate confirm password if password changed
      if (name === 'password' && touched.has('confirmPassword') && formRef.current) {
        const confirmPassword = formData?.get('confirmPassword') as string;
        if (confirmPassword) {
          const confirmError = validateField('confirmPassword', confirmPassword, formData);
          setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Validate all fields
    const newErrors: FormErrors = {};
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'role', 'phone'];
    
    fieldsToValidate.forEach(field => {
      const value = formData.get(field) as string;
      if (field !== 'phone' || value) { // phone is optional
        const error = validateField(field, value, formData);
        if (error) newErrors[field as keyof FormErrors] = error;
      }
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
        className={`relative w-full max-w-2xl max-h-[calc(100vh-6rem)] transition-all duration-300 transform ${
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
                  Ajouter un Utilisateur
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
              <div className="space-y-6">
                {/* Name fields - in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* First Name */}
                  <div>
                    <label htmlFor="firstName" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Prénom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        ref={firstInputRef}
                        type="text"
                        name="firstName"
                        id="firstName"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${
                          errors.firstName && touched.has('firstName')
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                        } text-gray-900 text-sm rounded-lg block w-full p-3 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="Ex: Jean"
                      />
                      {errors.firstName && touched.has('firstName') && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.firstName && touched.has('firstName') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.firstName}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label htmlFor="lastName" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Nom <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        name="lastName"
                        id="lastName"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${
                          errors.lastName && touched.has('lastName')
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                        } text-gray-900 text-sm rounded-lg block w-full p-3 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="Ex: Dupont"
                      />
                      {errors.lastName && touched.has('lastName') && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                          <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                      )}
                    </div>
                    {errors.lastName && touched.has('lastName') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Email field */}
                <div>
                  <label htmlFor="email" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <input
                      type="email"
                      name="email"
                      id="email"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={`bg-gray-50 border ${
                        errors.email && touched.has('email')
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                      } text-gray-900 text-sm rounded-lg block w-full pl-10 pr-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                      placeholder="jean.dupont@company.com"
                    />
                  </div>
                  {errors.email && touched.has('email') && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password fields - in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Mot de passe <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={passwordVisible ? 'text' : 'password'}
                        name="password"
                        id="password"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${
                          errors.password && touched.has('password')
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                        } text-gray-900 text-sm rounded-lg block w-full p-3 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setPasswordVisible(!passwordVisible)}
                      >
                        {passwordVisible ? (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.password && touched.has('password') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.password}</p>
                    )}
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Confirmer <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={confirmPasswordVisible ? 'text' : 'password'}
                        name="confirmPassword"
                        id="confirmPassword"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${
                          errors.confirmPassword && touched.has('confirmPassword')
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                        } text-gray-900 text-sm rounded-lg block w-full p-3 pr-10 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center pr-3"
                        onClick={() => setConfirmPasswordVisible(!confirmPasswordVisible)}
                      >
                        {confirmPasswordVisible ? (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                    {errors.confirmPassword && touched.has('confirmPassword') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                    )}
                  </div>
                </div>

                {/* Role and Phone - in a row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Role field */}
                  <div>
                    <label htmlFor="role" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Rôle <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="role"
                      name="role"
                      onBlur={handleBlur}
                      onChange={handleChange}
                      className={`bg-gray-50 border ${
                        errors.role && touched.has('role')
                          ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                          : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                      } text-gray-900 text-sm rounded-lg block w-full p-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                    >
                      <option value="">Sélectionner un rôle</option>
                      <option value="Admin">Administrateur</option>
                      <option value="Gestionnaire">Gestionnaire</option>
                      <option value="Utilisateur">Utilisateur</option>
                    </select>
                    {errors.role && touched.has('role') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.role}</p>
                    )}
                  </div>

                  {/* Phone field */}
                  <div>
                    <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                      Téléphone
                      <span className="ml-2 text-xs font-normal text-gray-500">(Optionnel)</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                        </svg>
                      </div>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        onBlur={handleBlur}
                        onChange={handleChange}
                        className={`bg-gray-50 border ${
                          errors.phone && touched.has('phone')
                            ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                            : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                        } text-gray-900 text-sm rounded-lg block w-full pl-10 pr-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="06 12 34 56 78"
                      />
                    </div>
                    {errors.phone && touched.has('phone') && (
                      <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.phone}</p>
                    )}
                  </div>
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
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      Ajouter l'utilisateur
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