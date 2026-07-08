import React from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';

const Header: React.FC = () => {
  const { t } = useLanguage();

  return (
    <header className="bg-gray-800 shadow-md">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-3 text-2xl font-bold text-white tracking-tight">
            <span>内容展示</span>
          </Link>
          <nav>
            <div className="flex items-center space-x-4">
              
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
