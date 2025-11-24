"use client";

interface LoadingSpinnerProps {
  color?: 'blue' | 'purple' | 'green' | 'orange' | 'red' | 'pink' | 'indigo' | 'teal';
  message?: string;
}

const colorVariants = {
  blue: {
    gradient: 'from-blue-500 via-blue-600 to-cyan-500',
    bg: 'from-slate-900 via-blue-900 to-slate-900',
    text: 'text-blue-300'
  },
  purple: {
    gradient: 'from-purple-500 via-purple-600 to-pink-500',
    bg: 'from-slate-900 via-purple-900 to-slate-900',
    text: 'text-purple-300'
  },
  green: {
    gradient: 'from-green-500 via-emerald-600 to-teal-500',
    bg: 'from-slate-900 via-green-900 to-slate-900',
    text: 'text-green-300'
  },
  orange: {
    gradient: 'from-orange-500 via-amber-600 to-yellow-500',
    bg: 'from-slate-900 via-orange-900 to-slate-900',
    text: 'text-orange-300'
  },
  red: {
    gradient: 'from-red-500 via-rose-600 to-pink-500',
    bg: 'from-slate-900 via-red-900 to-slate-900',
    text: 'text-red-300'
  },
  pink: {
    gradient: 'from-pink-500 via-rose-600 to-fuchsia-500',
    bg: 'from-slate-900 via-pink-900 to-slate-900',
    text: 'text-pink-300'
  },
  indigo: {
    gradient: 'from-indigo-500 via-blue-600 to-purple-500',
    bg: 'from-slate-900 via-indigo-900 to-slate-900',
    text: 'text-indigo-300'
  },
  teal: {
    gradient: 'from-teal-500 via-cyan-600 to-blue-500',
    bg: 'from-slate-900 via-teal-900 to-slate-900',
    text: 'text-teal-300'
  }
};

export default function LoadingSpinner({ color = 'blue', message = 'Chargement...' }: LoadingSpinnerProps) {
  const colors = colorVariants[color];

  return (
    <div className={`flex flex-col items-center justify-center min-h-screen bg-gradient-to-br ${colors.bg}`}>
      <div className="relative">
        {/* Effet glow */}
        <div className={`absolute inset-0 bg-gradient-to-r ${colors.gradient} rounded-full blur-xl opacity-50 animate-pulse`}></div>
        
        {/* Spinner principal */}
        <div className={`relative animate-spin rounded-full h-20 w-20 border-4 border-transparent bg-gradient-to-r ${colors.gradient} bg-clip-border`}>
          <div className="absolute inset-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-full"></div>
        </div>
        
        {/* Point central */}
        <div className={`absolute inset-0 flex items-center justify-center`}>
          <div className={`w-3 h-3 bg-gradient-to-r ${colors.gradient} rounded-full animate-pulse`}></div>
        </div>
      </div>
      
      {/* Message de chargement */}
      <p className={`mt-8 ${colors.text} text-xl font-semibold animate-pulse flex items-center gap-2`}>
        {message}
        <span className="flex gap-1">
          <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-[0ms]"></span>
          <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-[150ms]"></span>
          <span className="w-2 h-2 bg-current rounded-full animate-bounce delay-[300ms]"></span>
        </span>
      </p>
    </div>
  );
}
