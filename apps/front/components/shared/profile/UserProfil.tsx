"use client";

import React, { useState } from 'react';
import { User, Edit3, Mail, Phone, Save, X, Camera, Calendar } from 'lucide-react';

interface FormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  birthDate: string;
  joinDate: string;
}

interface InputFieldProps {
  label: string;
  value: string;
  field: keyof FormData;
  type?: string;
  placeholder?: string;
  disabled?: boolean;
}

const UserProfile = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    firstName: 'Musharof',
    lastName: 'Chowdhury',
    email: 'randomuser@pimjo.com', 
    phone: '+09 363 398 46',
    birthDate: '1990-05-15',
    joinDate: '2019-03-15'
  });

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    console.log('Saving profile data:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const InputField = ({ label, value, field, type = "text", placeholder, disabled = false }: InputFieldProps) => (
    <div className="group space-y-2">
      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 transition-colors group-focus-within:text-blue-600 dark:group-focus-within:text-blue-400">
        {label}
      </label>
      {isEditing && !disabled ? (
        <input
          type={type}
          value={value}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={placeholder}
          className="w-full px-4 py-3 text-sm border-2 border-gray-200 dark:border-gray-700 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:bg-gray-800 dark:text-white dark:focus:ring-blue-400/20 dark:focus:border-blue-400 transition-all duration-200"
        />
      ) : (
        <div className="relative">
          <div className="text-sm text-gray-900 dark:text-gray-100 bg-gray-50 dark:bg-gray-800/50 px-4 py-3 rounded-xl border border-transparent hover:border-gray-200 dark:hover:border-gray-700 transition-all duration-200">
            {type === 'date' && value ? formatDate(value) : (value || (
              <span className="text-gray-400 italic">Not provided</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        
        {/* Header Section with Enhanced Gradient */}
        <div className="relative bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 px-8 py-10">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-black/10">
            <div 
              className="absolute inset-0" 
              style={{
                backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 40% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`
              }}
            ></div>
          </div>

          <div className="relative flex flex-col lg:flex-row items-center gap-8">
            {/* Enhanced Avatar */}
            <div className="relative group">
              <div className="w-32 h-32 bg-white/20 backdrop-blur-sm rounded-3xl flex items-center justify-center border-4 border-white/30 shadow-2xl transition-transform duration-300 group-hover:scale-105">
                <span className="text-4xl font-bold text-white">
                  {getInitials(formData.firstName, formData.lastName)}
                </span>
              </div>
              {/* Status Indicator */}
              <div className="absolute -bottom-2 -right-2 flex items-center gap-2 bg-green-500 px-3 py-1 rounded-full border-4 border-white dark:border-gray-900">
                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                <span className="text-xs font-semibold text-white">Online</span>
              </div>
              {/* Camera Overlay */}
              <div className="absolute inset-0 bg-black/50 rounded-3xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 cursor-pointer">
                <Camera className="text-white" size={24} />
              </div>
            </div>

            {/* Enhanced User Info */}
            <div className="text-center lg:text-left flex-1 space-y-4">
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">
                  {formData.firstName} {formData.lastName}
                </h1>
              </div>
              
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4 text-blue-100">
                <div className="flex items-center gap-2">
                  <Calendar size={16} />
                  <span className="text-sm">Joined March 2019</span>
                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-4 mt-6 lg:max-w-sm">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">127</div>
                  <div className="text-xs text-blue-200">Projects</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">5+</div>
                  <div className="text-xs text-blue-200">Years</div>
                </div>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex flex-col gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-2xl transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl font-semibold"
                  >
                    <Save size={18} />
                    Save Changes
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl transition-all duration-200 border border-white/30"
                  >
                    <X size={18} />
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-2xl transition-all duration-200 transform hover:scale-105 border border-white/30 font-semibold shadow-lg"
                >
                  <Edit3 size={18} />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Content Section */}
      <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
        <div className="p-8">
          <div className="space-y-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl">
                <User size={20} className="text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Personal Information</h2>
                <p className="text-gray-500 dark:text-gray-400">Manage your personal details</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <InputField
                label="First Name"
                value={formData.firstName}
                field="firstName"
                placeholder="Enter your first name"
              />
              <InputField
                label="Last Name"
                value={formData.lastName}
                field="lastName"
                placeholder="Enter your last name"
              />
              <InputField
                label="Email Address"
                value={formData.email}
                field="email"
                type="email"
                placeholder="Enter your email address"
              />
              <InputField
                label="Phone Number"
                value={formData.phone}
                field="phone"
                type="tel"
                placeholder="Enter your phone number"
              />
              <InputField
                label="Birth Date"
                value={formData.birthDate}
                field="birthDate"
                type="date"
                placeholder="Select your birth date"
              />
              <InputField
                label="Join Date"
                value={formData.joinDate}
                field="joinDate"
                type="date"
                disabled={true}
              />
            </div>

            {/* Contact Cards */}
            {!isEditing && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                <div className="group bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 p-6 rounded-2xl border border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Mail size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Email Address</p>
                      <p className="text-blue-600 dark:text-blue-400 font-medium">{formData.email}</p>
                    </div>
                  </div>
                </div>
                
                <div className="group bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 p-6 rounded-2xl border border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-12 h-12 bg-green-600 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                      <Phone size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">Phone Number</p>
                      <p className="text-green-600 dark:text-green-400 font-medium">{formData.phone}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;