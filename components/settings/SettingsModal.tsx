import React from 'react';
import { useWorkspace } from '../../hooks/useWorkspace';
import { EditorSettings } from '../../types';
import { X } from 'lucide-react';

const fonts = [
  { name: 'Inter (Sans-Serif)', value: "'Inter', sans-serif" },
  { name: 'Lora (Serif)', value: "'Lora', serif" },
  { name: 'JetBrains Mono (Mono)', value: "'JetBrains Mono', monospace" }
];

const SettingsModal: React.FC = () => {
  const { workspace, actions } = useWorkspace();
  const editorSettings = workspace?.settings.editor;

  if (!editorSettings) return null;

  const handleSettingChange = (key: keyof EditorSettings, value: string | number) => {
    actions.updateSettings({
      editor: {
        ...editorSettings,
        [key]: value
      }
    });
  };

  return (
    <div 
      className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center" 
      onClick={actions.toggleSettings}
    >
      <div
        className="w-full max-w-lg bg-zinc-900 border border-zinc-700 rounded-lg shadow-2xl overflow-hidden"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-zinc-700">
          <h2 className="text-lg font-semibold text-zinc-200">Settings</h2>
          <button 
            onClick={actions.toggleSettings} 
            className="p-1 rounded-full text-zinc-400 hover:bg-zinc-700"
            aria-label="Close Settings"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="p-6 space-y-6">
          <h3 className="text-base font-semibold uppercase tracking-wider text-zinc-400">Editor Appearance</h3>
          
          {/* Font Family */}
          <div className="flex items-center justify-between">
            <label htmlFor="font-family" className="text-sm text-zinc-300">Font Family</label>
            <select
              id="font-family"
              value={editorSettings.fontFamily}
              onChange={(e) => handleSettingChange('fontFamily', e.target.value)}
              className="bg-zinc-800 border border-zinc-600 rounded-md px-3 py-1 text-zinc-200 focus:outline-none focus:ring-1 focus:ring-sky-500 w-64"
            >
              {fonts.map(font => (
                <option key={font.value} value={font.value}>{font.name}</option>
              ))}
            </select>
          </div>

          {/* Font Size */}
          <div className="flex items-center justify-between">
            <label htmlFor="font-size" className="text-sm text-zinc-300">Font Size ({editorSettings.fontSize}px)</label>
            <div className="flex items-center gap-4 w-64">
                <input
                    id="font-size"
                    type="range"
                    min="12"
                    max="24"
                    step="1"
                    value={editorSettings.fontSize}
                    onChange={(e) => handleSettingChange('fontSize', Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          </div>
          
          {/* Line Height */}
          <div className="flex items-center justify-between">
            <label htmlFor="line-height" className="text-sm text-zinc-300">Line Height ({editorSettings.lineHeight.toFixed(1)})</label>
            <div className="flex items-center gap-4 w-64">
                <input
                    id="line-height"
                    type="range"
                    min="1.2"
                    max="2.2"
                    step="0.1"
                    value={editorSettings.lineHeight}
                    onChange={(e) => handleSettingChange('lineHeight', Number(e.target.value))}
                    className="w-full h-2 bg-zinc-700 rounded-lg appearance-none cursor-pointer"
                />
            </div>
          </div>
        </div>

        <div className="p-4 bg-zinc-950/50 border-t border-zinc-700 text-right">
             <button 
                onClick={actions.toggleSettings}
                className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-md hover:bg-sky-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-zinc-900 focus:ring-sky-500"
              >
                Done
            </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal;