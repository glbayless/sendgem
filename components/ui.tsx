// SendGem - UI Components
'use client';

import React from 'react';

// Button Component
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export function Button({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  loading,
  className = '',
  disabled,
  ...props 
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0a0a0a]';
  
  const variants = {
    primary: 'bg-indigo-600 hover:bg-indigo-700 text-white focus:ring-indigo-500',
    secondary: 'bg-[#1a1a1a] hover:bg-[#252525] text-white border border-[#333] focus:ring-gray-500',
    ghost: 'bg-transparent hover:bg-[#1a1a1a] text-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500',
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled || loading ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}

// Input Component
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className = '', ...props }: InputProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <input
        className={`w-full px-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Textarea Component
interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
}

export function Textarea({ label, error, className = '', ...props }: TextareaProps) {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-gray-300 mb-1.5">
          {label}
        </label>
      )}
      <textarea
        className={`w-full px-4 py-2.5 bg-[#111] border border-[#333] rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors resize-none ${error ? 'border-red-500' : ''} ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-sm text-red-500">{error}</p>}
    </div>
  );
}

// Card Component
interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export function Card({ children, className = '' }: CardProps) {
  return (
    <div className={`bg-[#111] border border-[#222] rounded-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

// Badge Component
interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gray-800 text-gray-300',
    success: 'bg-green-900/50 text-green-400',
    warning: 'bg-yellow-900/50 text-yellow-400',
    danger: 'bg-red-900/50 text-red-400',
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
}

export function StatCard({ label, value, change, changeType = 'neutral' }: StatCardProps) {
  const changeColors = {
    positive: 'text-green-400',
    negative: 'text-red-400',
    neutral: 'text-gray-400',
  };

  return (
    <Card>
      <p className="text-sm text-gray-400 mb-1">{label}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
      {change && (
        <p className={`text-sm mt-2 ${changeColors[changeType]}`}>
          {change}
        </p>
      )}
    </Card>
  );
}

// Modal Component
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Modal({ isOpen, onClose, title, children }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-[#111] border border-[#333] rounded-xl p-6 w-full max-w-lg mx-4 shadow-2xl">
        {title && (
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  );
}

// Table Component
interface TableProps {
  children: React.ReactNode;
}

export function Table({ children }: TableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children }: { children: React.ReactNode }) {
  return (
    <thead className="border-b border-[#333]">
      {children}
    </thead>
  );
}

export function TableBody({ children }: { children: React.ReactNode }) {
  return (
    <tbody className="divide-y divide-[#222]">
      {children}
    </tbody>
  );
}

export function TableRow({ children }: { children: React.ReactNode }) {
  return (
    <tr className="hover:bg-[#1a1a1a]/50 transition-colors">
      {children}
    </tr>
  );
}

export function TableHead({ children }: { children: React.ReactNode }) {
  return (
    <th className="px-4 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
      {children}
    </th>
  );
}

export function TableCell({ children }: { children: React.ReactNode }) {
  return (
    <td className="px-4 py-4 text-sm text-gray-300">
      {children}
    </td>
  );
}

// Empty State Component
interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-4 text-gray-500">{icon}</div>}
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      {description && <p className="text-gray-400 mb-6 max-w-md">{description}</p>}
      {action}
    </div>
  );
}

// Loading Spinner
export function Spinner({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <svg className={`animate-spin ${sizes[size]} text-indigo-500`} fill="none" viewBox="0 0 24 24">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
  );
}

// Toast Notification (simplified)
interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
}

export function Toast({ message, type = 'info' }: ToastProps) {
  const types = {
    success: 'bg-green-600',
    error: 'bg-red-600',
    info: 'bg-indigo-600',
  };

  return (
    <div className={`fixed bottom-4 right-4 ${types[type]} text-white px-4 py-3 rounded-lg shadow-lg`}>
      {message}
    </div>
  );
}