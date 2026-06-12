import React from 'react';
import Text from '@/components/Text';

interface InputFieldProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function InputField({
  label,
  error,
  type = "text",
  className = "",
  ...props
}: InputFieldProps) {
  return (
    <div className="flex flex-col space-y-1 w-full">
      
      {/* Replaced raw label with design system's Text component */}
      {label && (
        <Text 
          type="description" 
          color="secondary" 
          formatting="medium"
          className="mb-1 text-sm block"
        >
          {label}
        </Text>
      )}

      {/* The Custom Styled Input */}
      <input
        type={type}
        className={`bg-slate-700 text-white border px-4 py-2 rounded focus:outline-none transition-colors w-full font-mono
          ${error ? 'border-red-400 focus:border-red-400' : 'border-slate-600 focus:border-cyan-500'} 
          ${className}`}
        {...props}
      />

      {/* Replaced raw error block with Text layout system */}
      {error && (
        <div className="flex items-center space-x-1.5 mt-1">
          {/* Using 'important' variant to give the error high-contrast text rendering */}
          <Text 
            type="description" 
            color="important" 
            className="text-red-400 text-xs flex items-center gap-1"
          >
            <span className="font-bold">✕</span>
            {error}
          </Text>
        </div>
      )}
    </div>
  );
}