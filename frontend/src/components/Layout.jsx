import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import NewServiceModal from './NewServiceModal';
import CommandPaletteModal from './CommandPaletteModal';

export default function Layout() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newModalType, setNewModalType] = useState('web');
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  const handleOpenNewModal = (type = 'web') => {
    setNewModalType(type);
    setIsNewModalOpen(true);
  };

  return (
    <div className="app-container bg-ambient-grid">
      <Sidebar />
      <div className="main-wrapper">
        <Header
          onOpenNewModal={handleOpenNewModal}
          onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        />
        <main className="page-content">
          <Outlet context={{ openNewServiceModal: handleOpenNewModal }} />
        </main>
      </div>

      <NewServiceModal
        isOpen={isNewModalOpen}
        initialType={newModalType}
        onClose={() => setIsNewModalOpen(false)}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenNewModal={handleOpenNewModal}
      />
    </div>
  );
}
