import React from 'react';
import { View, Text } from 'react-native';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return (
    <View className={cn('rounded-[2.5rem] bg-white shadow-xl overflow-hidden', className)}>
      {children}
    </View>
  );
};

export const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <View className={cn('p-6 pb-2', className)}>{children}</View>;
};

export const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <View className={cn('p-6', className)}>{children}</View>;
};

export const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <Text className={cn('text-lg font-bold text-slate-950', className)}>{children}</Text>;
};

export const CardDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <Text className={cn('text-sm text-slate-500', className)}>{children}</Text>;
};
