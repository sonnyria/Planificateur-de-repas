import React from 'react';
import type { Tab } from '../App';
import { BookOpenIcon, ClipboardListIcon, ShoppingCartIcon } from './Icons';

type TabId = Tab['id'];

interface BottomNavBarProps {
  tabs: Tab[];
  activeTab: TabId;
  setActiveTab: (tabId: TabId) => void;
  hasSelectedMeals: boolean;
  selectedMealsCount: number;
}

const TabIcon: React.FC<{ tabId: TabId; className?: string }> = ({ tabId, className }) => {
    switch (tabId) {
        case 'recipes':
            return <BookOpenIcon className={className} />;
        case 'selected':
            return <ClipboardListIcon className={className} />;
        case 'shopping':
            return <ShoppingCartIcon className={className} />;
        default:
            return null;
    }
}

const BottomNavBar: React.FC<BottomNavBarProps> = ({ tabs, activeTab, setActiveTab, hasSelectedMeals, selectedMealsCount }) => {
  return (
    <nav className="bg-white border-b border-slate-200">
      <div className="max-w-4xl mx-auto flex justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const isDisabled = (tab.id === 'selected' || tab.id === 'shopping') && !hasSelectedMeals;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              disabled={isDisabled}
              className={`flex-1 flex flex-col items-center justify-center pt-2 pb-1 text-xs font-medium transition-colors duration-200 relative
                ${isActive ? 'text-indigo-600' : 'text-slate-500'}
                ${isDisabled ? 'text-slate-300 cursor-not-allowed' : 'hover:bg-slate-50'}
              `}
              aria-current={isActive ? 'page' : undefined}
            >
                <div className="relative">
                    <TabIcon tabId={tab.id} className="w-6 h-6 mb-1" />
                    {tab.id === 'selected' && hasSelectedMeals && (
                        <span className="absolute -top-1 -right-2.5 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white bg-indigo-500 rounded-full">
                            {selectedMealsCount}
                        </span>
                    )}
                </div>
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNavBar;