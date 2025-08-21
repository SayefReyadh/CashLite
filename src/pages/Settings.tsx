import React from 'react';
import { Settings as SettingsIcon, User, Database, Palette, Shield, Bell, Download, Upload } from 'lucide-react';

export const Settings: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <User className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Account</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Your name"
                disabled
              />
              <p className="text-xs text-gray-500 mt-1">Feature coming soon</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Currency
              </label>
              <select
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                disabled
              >
                <option>USD ($)</option>
                <option>EUR (€)</option>
                <option>BDT (৳)</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Feature coming soon</p>
            </div>
          </div>
        </div>

        {/* Appearance Settings */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Palette className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Theme
              </label>
              <div className="space-y-2">
                <label className="flex items-center">
                  <input type="radio" name="theme" value="light" className="mr-2" defaultChecked disabled />
                  <span className="text-sm text-gray-700">Light</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="theme" value="dark" className="mr-2" disabled />
                  <span className="text-sm text-gray-700">Dark</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="theme" value="system" className="mr-2" disabled />
                  <span className="text-sm text-gray-700">System</span>
                </label>
              </div>
              <p className="text-xs text-gray-500 mt-1">Theme switching coming soon</p>
            </div>
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Database className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Data Management</h3>
          </div>
          <div className="space-y-3">
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              disabled
            >
              <Download className="h-4 w-4 mr-2" />
              Export Data
            </button>
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
              disabled
            >
              <Upload className="h-4 w-4 mr-2" />
              Import Data
            </button>
            <button
              className="w-full flex items-center justify-center px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
              disabled
            >
              <Database className="h-4 w-4 mr-2" />
              Clear All Data
            </button>
            <p className="text-xs text-gray-500">Data management features coming soon</p>
          </div>
        </div>

        {/* Notifications */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center mb-4">
            <Bell className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
          </div>
          <div className="space-y-3">
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Budget alerts</span>
              <input type="checkbox" className="toggle" disabled />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Monthly summaries</span>
              <input type="checkbox" className="toggle" disabled />
            </label>
            <label className="flex items-center justify-between">
              <span className="text-sm text-gray-700">Large transactions</span>
              <input type="checkbox" className="toggle" disabled />
            </label>
            <p className="text-xs text-gray-500">Notification settings coming soon</p>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white rounded-lg shadow p-6 lg:col-span-2">
          <div className="flex items-center mb-4">
            <Shield className="h-6 w-6 text-gray-600 mr-2" />
            <h3 className="text-lg font-medium text-gray-900">Security & Privacy</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Data Storage</h4>
              <p className="text-sm text-gray-600 mb-2">
                Your data is stored locally in your browser using IndexedDB. No data is sent to external servers.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-2">Backup Recommendations</h4>
              <p className="text-sm text-gray-600">
                Regular exports are recommended to prevent data loss. Use the export feature to backup your financial data.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* App Information */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center mb-4">
          <SettingsIcon className="h-6 w-6 text-gray-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">About CashLite</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
          <div>
            <p className="font-medium text-gray-900">Version</p>
            <p>1.0.0</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Data Storage</p>
            <p>Local IndexedDB</p>
          </div>
          <div>
            <p className="font-medium text-gray-900">Platform</p>
            <p>Progressive Web App</p>
          </div>
        </div>
      </div>
    </div>
  );
};