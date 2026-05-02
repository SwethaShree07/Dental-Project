import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps {
  onPress: () => void;
  title?: string;
  variant?: 'primary' | 'secondary' | 'ghost' | 'outline';
  className?: string;
  loading?: boolean;
  disabled?: boolean;
  children?: React.ReactNode;
}

export const Button = ({
  onPress,
  title,
  variant = 'primary',
  className,
  loading,
  disabled,
  children,
}: ButtonProps) => {
  const baseStyles = 'flex-row items-center justify-center rounded-2xl h-12 px-6';
  const variants = {
    primary: 'bg-blue-600',
    secondary: 'bg-slate-950',
    ghost: 'bg-transparent',
    outline: 'bg-transparent border border-slate-200',
  };

  const textStyles = 'font-semibold text-base';
  const textVariants = {
    primary: 'text-white',
    secondary: 'text-white',
    ghost: 'text-slate-600',
    outline: 'text-slate-900',
  };

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={disabled || loading}
      onPress={onPress}
      className={cn(baseStyles, variants[variant], className, (disabled || loading) && 'opacity-50')}
    >
      {loading ? (
        <ActivityIndicator color="white" />
      ) : (
        <>
          {title ? (
            <Text className={cn(textStyles, textVariants[variant])}>{title}</Text>
          ) : (
            children
          )}
        </>
      )}
    </TouchableOpacity>
  );
};
