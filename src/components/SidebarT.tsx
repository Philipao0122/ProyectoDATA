import React from 'react';
import { 
  BookOpen, 
  Users, 
  Shield, 
  FileText, 
  Zap, 
  TrendingUp,
  ChevronRight
} from 'lucide-react';

export type SectionId = 'concepts' | 'actors' | 'tactics' | 'cases' | 'defense' | 'future';

interface SidebarProps {
  activeSection: SectionId;
  onSectionChange: (section: SectionId) => void;
  isCollapsed?: boolean; // Made optional
}

const sidebarItems = [
  { id: 'concepts' as const, label: 'Conceptos Clave', icon: BookOpen, color: 'text-blue-600' },
  { id: 'actors' as const, label: 'Actores Principales', icon: Users, color: 'text-red-600' },
  { id: 'tactics' as const, label: 'Tácticas de Guerra Híbrida', icon: Shield, color: 'text-orange-600' },
  { id: 'cases' as const, label: 'Casos de Estudio', icon: FileText, color: 'text-green-600' },
  { id: 'defense' as const, label: 'Estrategias de Defensa', icon: Zap, color: 'text-purple-600' },
  { id: 'future' as const, label: 'Futuro de la Guerra de Información', icon: TrendingUp, color: 'text-indigo-600' },
];

export const Sidebar: React.FC<SidebarProps> = ({ activeSection, onSectionChange, isCollapsed }) => {
  return (
    <div className={`bg-white border-r border-secondary-200 h-full transition-all duration-300 ${isCollapsed ? 'w-16' : 'w-80'}`}>
      <div className="p-4">
        {!isCollapsed && (
          <div className="mb-6">
            <h2 className="text-lg font-bold text-secondary-900">Navegación</h2>
            <p className="text-sm text-secondary-600 mt-1">Explora los elementos de la guerra híbrida</p>
          </div>
        )}
        
        <nav className="space-y-2">
          {sidebarItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={`w-full flex items-center px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                  isActive 
                    ? 'bg-primary-50 border border-primary-200 text-primary-900' 
                    : 'hover:bg-secondary-50 text-secondary-700 hover:text-secondary-900'
                }`}
              >
                <Icon className={`h-5 w-5 ${isActive ? 'text-primary-600' : item.color} transition-colors`} />
                {!isCollapsed && (
                  <>
                    <span className="ml-3 font-medium text-sm">{item.label}</span>
                    <ChevronRight className={`ml-auto h-4 w-4 transition-transform ${isActive ? 'rotate-90' : 'group-hover:translate-x-0.5'}`} />
                  </>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
};