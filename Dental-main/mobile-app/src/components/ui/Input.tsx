import React from 'react';
import { View, TextInput, Text, type TextInputProps } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InputProps extends TextInputProps {
  label?: string;
  className?: string;
  error?: string;
  icon?: React.ReactNode;
}

export const Input = ({ label, className, error, icon, ...props }: InputProps) => {
  return (
    <View className="space-y-1.5 w-full">
      {label && <Text className="text-sm font-medium text-slate-700 ml-1">{label}</Text>}
      <View className="relative">
        {icon && (
          <View className="absolute left-3.5 top-1/2 -translate-y-[10px] z-10">
            {icon}
          </View>
        )}
        <TextInput
          className={cn(
            'h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-base text-slate-900',
            icon && 'pl-11',
            error && 'border-red-500',
            className
          )}
          placeholderTextColor="#94a3b8"
          {...props}
        />
      </View>
      {error && <Text className="text-xs text-red-500 ml-1">{error}</Text>}
    </View>
  );
};
