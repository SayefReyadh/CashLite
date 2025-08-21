import React, { useEffect } from 'react';
import { Sun, Moon, Monitor, Globe, Calendar } from 'lucide-react';
import { useStore } from '../store';

const currencyOptions = [
  'BDT', 'USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL'
];

const dateFormatOptions = [
  { value: 'dd/MM/yyyy', label: 'DD/MM/YYYY (31/12/2023)' },
  { value: 'MM/dd/yyyy', label: 'MM/DD/YYYY (12/31/2023)' },
  { value: 'yyyy-MM-dd', label: 'YYYY-MM-DD (2023-12-31)' },
];

const themeOptions = [
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
  { value: 'system', label: 'System', icon: Monitor },
];

export const Settings: React.FC = () => {
  const { settings, updateSettings } = useStore();

  // Apply theme to document
  useEffect(() => {
    const applyTheme = () => {
      const { theme } = settings;
      const root = document.documentElement;
      
      if (theme === 'system') {
        const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        root.classList.toggle('dark', systemPrefersDark);
      } else {
        root.classList.toggle('dark', theme === 'dark');
      }
    };

    applyTheme();

    // Listen for system theme changes when using system theme
    if (settings.theme === 'system') {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      mediaQuery.addEventListener('change', applyTheme);
      return () => mediaQuery.removeEventListener('change', applyTheme);
    }
  }, [settings.theme]);

  const handleThemeChange = (theme: 'light' | 'dark' | 'system') => {
    updateSettings({ theme });
  };

  const handleCurrencyChange = (currency: string) => {
    updateSettings({ currency });
  };

  const handleDateFormatChange = (dateFormat: 'dd/MM/yyyy' | 'MM/dd/yyyy' | 'yyyy-MM-dd') => {
    updateSettings({ dateFormat });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h1>
      </div>

      <div className="grid gap-6">
        {/* Theme Settings */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Sun className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Appearance</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose how CashLite looks to you. Select a single theme, or sync with your system and automatically switch between day and night themes.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isActive = settings.theme === option.value;
              
              return (
                <button
                  key={option.value}
                  onClick={() => handleThemeChange(option.value as any)}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all duration-200
                    ${isActive 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                    }
                  `}
                >
                  <div className="flex flex-col items-center space-y-2">
                    <Icon className="h-6 w-6" />
                    <span className="text-sm font-medium">{option.label}</span>
                  </div>
                  {isActive && (
                    <div className="absolute top-2 right-2 w-2 h-2 bg-primary rounded-full"></div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Currency Settings */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Globe className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Currency</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Set your default currency for new books and transactions.
          </p>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Default Currency
            </label>
            <select
              value={settings.currency}
              onChange={(e) => handleCurrencyChange(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {currencyOptions.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Format Settings */}
        <div className="card p-6">
          <div className="flex items-center mb-4">
            <Calendar className="h-5 w-5 text-gray-500 mr-2" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Date Format</h2>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
            Choose how dates are displayed throughout the application.
          </p>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date Format
            </label>
            <select
              value={settings.dateFormat}
              onChange={(e) => handleDateFormatChange(e.target.value as any)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm 
                         focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent
                         bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              {dateFormatOptions.map(format => (
                <option key={format.value} value={format.value}>{format.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};