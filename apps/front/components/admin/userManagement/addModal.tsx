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
  gender?: string;
  phone?: string;
  dateOfBirth?: string;
}

export default function AddModal({ isOpen, onClose, onSubmit }: CrudModalProps) {
  const [show, setShow] = useState(isOpen);
  const [closing, setClosing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<Set<string>>(new Set());
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>("");
  const closeTimeout = useRef<NodeJS.Timeout | null>(null);
  const firstInputRef = useRef<HTMLInputElement | null>(null);
  const formRef = useRef<HTMLFormElement | null>(null);
  const datePickerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      setShow(true);
      setClosing(false);
      setErrors({});
      setTouched(new Set());
      setIsSubmitting(false);
      setPasswordVisible(false);
      setConfirmPasswordVisible(false);
      setSelectedDate("");
      setShowDatePicker(false);
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

  // Close date picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (datePickerRef.current && !datePickerRef.current.contains(event.target as Node)) {
        setShowDatePicker(false);
      }
    };

    if (showDatePicker) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showDatePicker]);

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
      case 'gender':
        if (!value) return 'Le genre est requis';
        break;
      case 'phone':
        if (value && !/^(\+33|0)[1-9](\d{8})$/.test(value.replace(/\s/g, ''))) 
          return 'Format de téléphone invalide';
        break;
      case 'dateOfBirth':
        if (!value) return 'La date de naissance est requise';
        const birthDate = new Date(value);
        const today = new Date();
        const age = today.getFullYear() - birthDate.getFullYear();
        if (age < 13 || age > 120) return 'L\'âge doit être entre 13 et 120 ans';
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

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setShowDatePicker(false);
    setTouched(prev => new Set(prev).add('dateOfBirth'));
    const error = validateField('dateOfBirth', date);
    setErrors(prev => ({ ...prev, dateOfBirth: error }));
  };

  const generateCalendar = () => {
    const today = new Date();
    const currentYear = today.getFullYear();
    const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
    const months = [
      'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
      'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
    ];

    return (
      <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg p-4">
        <div className="flex gap-2 mb-3">
          <select 
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
            onChange={(e) => {
              const year = parseInt(e.target.value);
              const month = 0; // January
              const date = new Date(year, month, 1).toISOString().split('T')[0];
              handleDateSelect(date);
            }}
          >
            <option value="">Année</option>
            {years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
          <select 
            className="flex-1 p-2 border border-gray-300 rounded text-sm"
            onChange={(e) => {
              const month = parseInt(e.target.value);
              const year = new Date().getFullYear() - 25; // Default to 25 years ago
              const date = new Date(year, month, 1).toISOString().split('T')[0];
              handleDateSelect(date);
            }}
          >
            <option value="">Mois</option>
            {months.map((month, idx) => (
              <option key={idx} value={idx}>{month}</option>
            ))}
          </select>
        </div>
        <div className="grid grid-cols-7 gap-1 text-center text-sm">
          {['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'].map(day => (
            <div key={day} className="p-2 font-semibold text-gray-600">{day}</div>
          ))}
          {Array.from({ length: 31 }, (_, i) => (
            <button
              key={i + 1}
              type="button"
              className="p-2 hover:bg-blue-100 rounded transition-colors"
              onClick={() => {
                const year = new Date().getFullYear() - 25;
                const month = 0;
                const day = i + 1;
                const date = new Date(year, month, day).toISOString().split('T')[0];
                handleDateSelect(date);
              }}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </div>
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    // Add selected date to form data
    if (selectedDate) {
      formData.set('dateOfBirth', selectedDate);
    }
    
    // Validate all fields
    const newErrors: FormErrors = {};
    const fieldsToValidate = ['firstName', 'lastName', 'email', 'password', 'confirmPassword', 'gender', 'dateOfBirth', 'phone'];
    
    fieldsToValidate.forEach(field => {
      let value = formData.get(field) as string;
      if (field === 'dateOfBirth') {
        value = selectedDate;
      }
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
        className={`relative w-full max-w-4xl max-h-[calc(100vh-6rem)] transition-all duration-300 transform ${
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
                {/* Name fields - always in a row with proper spacing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* First Name */}
                  <div className="min-w-0 flex-1">
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
                        } text-gray-900 text-sm rounded-lg block w-full px-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="Ex: Jean"
                      />
                      {errors.firstName && touched.has('firstName') && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
                  <div className="min-w-0 flex-1">
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
                        } text-gray-900 text-sm rounded-lg block w-full px-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="Ex: Dupont"
                      />
                      {errors.lastName && touched.has('lastName') && (
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
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
                    <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
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
                      } text-gray-900 text-sm rounded-lg block w-full pl- 9 pr-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                      placeholder="jean.dupont@company.com"
                    />
                  </div>
                  {errors.email && touched.has('email') && (
                    <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.email}</p>
                  )}
                </div>

                {/* Password fields - proper spacing */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Password */}
                  <div className="min-w-0 flex-1">
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
                        } text-gray-900 text-sm rounded-lg block w-full pl-3 pr-10 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center justify-center w-10 h-full hover:bg-gray-100 rounded-r-lg transition-colors"
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
                  <div className="min-w-0 flex-1">
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
                        } text-gray-900 text-sm rounded-lg block w-full pl-3 pr-10 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200`}
                        placeholder="••••••••"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-3 flex items-center justify-center w-10 h-full hover:bg-gray-100 rounded-r-lg transition-colors"
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

                  {/* Gender, Date of Birth and Phone - three columns */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                      {/* Gender field */}   
                        <div className="min-w-0 flex-1">
                          <label htmlFor="gender" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                            Genre <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <select
                              id="gender"
                              name="gender"
                              onBlur={handleBlur}
                              onChange={handleChange}
                              className={`bg-gray-50 border ${
                                errors.gender && touched.has('gender')
                                  ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                  : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                              } text-gray-900 text-sm rounded-lg block w-full pl-3 pr-10 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200 appearance-none`}
                              style={{ 
                                WebkitAppearance: 'none',
                                MozAppearance: 'none',
                                backgroundImage: 'none'
                              }}
                            >
                              <option value="">Sélectionner le genre</option>
                              <option value="Homme">Homme</option>
                              <option value="Femme">Femme</option>
                            </select>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </div>
                          {errors.gender && touched.has('gender') && (
                            <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.gender}</p>
                          )}
                        </div>

                          {/* Date of Birth field with calendar */}
                            <div className="min-w-0 flex-1 relative" ref={datePickerRef}>
                              <label htmlFor="dateOfBirth" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                              Date de naissance <span className="text-red-500">*</span>
                                            </label>
                                            <div className="relative">
                                              <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                              </div>
                                              <input
                                                type="text"
                                                name="dateOfBirth"
                                                id="dateOfBirth"
                                                value={selectedDate ? new Date(selectedDate).toLocaleDateString('fr-FR') : ''}
                                                onClick={() => setShowDatePicker(!showDatePicker)}
                                                onBlur={(e) => {
                                                  if (!datePickerRef.current?.contains(e.relatedTarget as Node)) {
                                                    setTouched(prev => new Set(prev).add('dateOfBirth'));
                                                    const error = validateField('dateOfBirth', selectedDate);
                                                    setErrors(prev => ({ ...prev, dateOfBirth: error }));
                                                  }
                                                }}
                                                readOnly
                                                className={`bg-gray-50 border ${
                                                  errors.dateOfBirth && touched.has('dateOfBirth')
                                                    ? 'border-red-500 focus:ring-red-500 focus:border-red-500'
                                                    : 'border-gray-300 focus:ring-[#00A9E0] focus:border-[#00A9E0]'
                                                } text-gray-900 text-sm rounded-lg block w-full pl-10 pr-3 py-3 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white transition-all duration-200 cursor-pointer`}
                                                placeholder="Sélectionner la date"
                                              />
                                            </div>
                                            {showDatePicker && generateCalendar()}
                                            {errors.dateOfBirth && touched.has('dateOfBirth') && (
                                              <p className="mt-2 text-sm text-red-600 dark:text-red-400">{errors.dateOfBirth}</p>
                                            )}
                                          </div>

                                          {/* Phone field */}
                                          <div className="min-w-0 flex-1">
                                            <label htmlFor="phone" className="block mb-2 text-sm font-semibold text-gray-700 dark:text-gray-200">
                                              Téléphone
                                              <span className="ml-2 text-xs font-normal text-gray-500">(Optionnel)</span>
                                            </label>
                                            <div className="relative">
                                              <div className="absolute inset-y-0 left-0 flex items-center pl-1 pointer-events-none">
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