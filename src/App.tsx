import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { TrackingBar } from './components/TrackingBar';
import { Hero } from './components/Hero';
import { FlyerSection } from './components/FlyerSection';
import { CuscoMap } from './components/CuscoMap';
import { CatalogSection } from './components/CatalogSection';
import { CartModal } from './components/CartModal';
import { B2BModal } from './components/B2BModal';
import { TicketModal } from './components/TicketModal';
import { AlertPopups } from './components/AlertPopups';
import { AdminPanel } from './components/AdminPanel';
import { RepartidorPanel } from './components/RepartidorPanel';
import { ShoppingCart, Bell } from 'lucide-react';
import { playChimeSound } from './utils/audio';
import { getPageUrl } from './utils/assets';

const MainApp: React.FC = () => {
  const { activePortal, cartCount, negocio } = useApp();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isB2BOpen, setIsB2BOpen] = useState(false);
  const [isTicketOpen, setIsTicketOpen] = useState(false);
  const [notifActive, setNotifActive] = useState(false);

  const handleFloatingNotif = () => {
    playChimeSound();
    setNotifActive(true);
    if ('Notification' in window) {
      Notification.requestPermission().then((perm) => {
        if (perm === 'granted') {
          new Notification(`🦁 ${negocio.nombre}`, {
            body: '¡Alertas sonoras y notificaciones activadas con éxito!'
          });
        }
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#fafaf9] flex flex-col justify-between selection:bg-purple-200">
      <div>
        {/* Navigation Bar (Solo en portal Cliente) */}
        {activePortal === 'cliente' && (
          <Navbar onOpenCart={() => setIsCartOpen(true)} onOpenB2B={() => setIsB2BOpen(true)} />
        )}

        {/* Live Order Tracking Banner (Customer) */}
        {activePortal === 'cliente' && (
          <TrackingBar onOpenTicket={() => setIsTicketOpen(true)} />
        )}

        {/* Dynamic Portal View */}
        {activePortal === 'cliente' && (
          <main className="pb-24">
            <Hero />
            <FlyerSection />
            <CuscoMap />
            <CatalogSection onOpenCart={() => setIsCartOpen(true)} />

            {/* Floating Action Button: Cart */}
            <div
              onClick={() => setIsCartOpen(true)}
              className="fixed bottom-6 right-6 z-40 flex items-center gap-2 cursor-pointer group"
            >
              <div className="hidden sm:block bg-gradient-to-r from-yellow-100 to-yellow-200 border-2 border-purple-800 text-purple-900 font-black text-xs px-3.5 py-2 rounded-full shadow-lg group-hover:scale-105 transition">
                ¡Pide tu Balón Aquí! 🛵
              </div>

              <div className="relative w-14 h-14 rounded-full bg-gradient-to-br from-purple-700 to-purple-950 text-white flex items-center justify-center border-2 border-yellow-400 shadow-xl group-hover:scale-110 transition">
                <ShoppingCart className="w-6 h-6 text-yellow-300" />
                {cartCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-xs w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
            </div>

            {/* Floating Audio Notifications Button */}
            <button
              type="button"
              onClick={handleFloatingNotif}
              className={`fixed bottom-6 left-6 z-40 px-3.5 py-2 rounded-full text-xs font-black shadow-md flex items-center gap-2 transition cursor-pointer border ${
                notifActive
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-400'
                  : 'bg-white text-purple-900 border-purple-300 hover:bg-purple-50'
              }`}
            >
              <Bell className="w-4 h-4 text-purple-700" />
              <span>{notifActive ? 'Alertas Activas ✔️' : 'Activar Alertas 🔔'}</span>
            </button>
          </main>
        )}

        {activePortal === 'repartidor' && <RepartidorPanel />}

        {activePortal === 'admin' && <AdminPanel />}
      </div>

      {/* Client Modals & Popups (Strictly scoped to client portal) */}
      {activePortal === 'cliente' && (
        <>
          <CartModal
            isOpen={isCartOpen}
            onClose={() => setIsCartOpen(false)}
            onOpenTicket={() => {
              setIsCartOpen(false);
              setIsTicketOpen(true);
            }}
          />

          <B2BModal isOpen={isB2BOpen} onClose={() => setIsB2BOpen(false)} />

          <TicketModal isOpen={isTicketOpen} onClose={() => setIsTicketOpen(false)} />

          <AlertPopups onOpenTicket={() => setIsTicketOpen(true)} />

          {/* Footer */}
          <footer className="bg-slate-900 text-slate-400 text-xs py-8 px-4 border-t border-slate-800 no-print">
            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
              <div className="flex items-center gap-2">
                <span className="text-xl">🦁</span>
                <div>
                  <p className="font-bold text-white">{negocio.nombre} • {negocio.slogan}</p>
                  <p className="text-[11px] text-slate-500">
                    Balones de Gas GLP a Domicilio y Empresas B2B en {negocio.direccion || 'todo Cusco'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-[11px]">
                <a
                  href={negocio.enlaceChuspa || 'https://www.lachuspaanuncios.com'}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-yellow-400 hover:underline font-bold"
                >
                  La Chuspa Tech • www.lachuspaanuncios.com
                </a>
                <span>•</span>
                <span>Atención 24/7</span>
                <span>•</span>
                <a
                  href={getPageUrl('admin.html')}
                  className="text-slate-500 hover:text-slate-300 transition"
                  title="Acceso al Panel de Control del Negocio"
                >
                  ⚙️ Admin
                </a>
              </div>
            </div>
          </footer>
        </>
      )}
    </div>
  );
};

export { MainApp };

export default function App({ initialPortal }: { initialPortal?: 'cliente' | 'admin' | 'repartidor' }) {
  return (
    <AppProvider initialPortal={initialPortal}>
      <MainApp />
    </AppProvider>
  );
}

