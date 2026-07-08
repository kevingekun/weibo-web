import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import Header from './components/Header';
import { WeiboListPage } from './pages/WeiboListPage';

const AppRoutes: React.FC = () => {
    return(
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col">
            <Header />
            <main className="container mx-auto p-4 sm:p-6 lg:p-8 flex-grow">
                <Routes>
                    <Route path="/weibo" element={<WeiboListPage />} />
                    <Route path="/" element={<Navigate to="/weibo" />} />
                </Routes>
            </main>
        </div>
    );
};

const App: React.FC = () => {
  return (
    <LanguageProvider>
        <HashRouter>
            <AppRoutes />
        </HashRouter>
    </LanguageProvider>
  );
};

export default App;
