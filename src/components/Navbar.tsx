import React from 'react';
import { useApp } from '../context/AppContext';
import { ShoppingCart, Building2, Bell } from 'lucide-react';
import { playChimeSound } from '../utils/audio';
import { BrandBadge } from './BrandBadge';

interface NavbarProps {
  onOpenCart: () => void;
  onOpenB2B: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenCart, onOpenB2B }) => {
  const { cartCount } = useApp();

  const handleNotificationClick = () => {
    playChimeSound();
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification('🦁 LeoGas Cusco', {
            body: '¡Alertas sonoras y notificaciones activadas con éxito!'
          });
        }
      });
    }
  };

  const handleScrollToCatalogo = () => {
    const el = document.getElementById('catalogo') || document.getElementById('menu');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.location.hash = '#catalogo';
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        {/* Brand Group with synced business logo and Chuspa Tech logo */}
        <BrandBadge size="md" showChuspa={true} />

        {/* Client Action Buttons only (No admin/repartidor/ventanas shortcuts) */}
        <div className="flex items-center flex-wrap gap-2">
          {/* B2B Modal Trigger */}
          <button
            type="button"
            onClick={onOpenB2B}
            className="bg-slate-900 text-yellow-300 border border-yellow-500 hover:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <Building2 className="w-3.5 h-3.5 text-yellow-400" />
            <span className="hidden md:inline">Empresas /</span> B2B
          </button>

          {/* Sound/Alert Notifications button */}
          <button
            type="button"
            onClick={handleNotificationClick}
            className="bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200 p-2 rounded-full text-xs font-bold flex items-center justify-center transition cursor-pointer"
            title="Probar Alertas Sonoras"
          >
            <Bell className="w-4 h-4 text-purple-700" />
          </button>

          {/* Pedir Gas Anchor Button (Direct Scroll to Catalog, NO popup) */}
          <button
            type="button"
            onClick={handleScrollToCatalogo}
            className="bg-purple-800 hover:bg-purple-900 text-white px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <div className="relative">
              <ShoppingCart className="w-4 h-4" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </div>
            <span>Pedir Gas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
