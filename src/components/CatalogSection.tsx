import React from 'react';
import { useApp } from '../context/AppContext';
import { Plus, Check, Flame, Wrench } from 'lucide-react';
import { getAssetUrl } from '../utils/assets';

interface CatalogSectionProps {
  onOpenCart: () => void;
}

export const CatalogSection: React.FC<CatalogSectionProps> = ({ onOpenCart }) => {
  const { productos, accesorios, addToCart, carrito } = useApp();

  const handleAddAndOpen = (item: { id: string; nombre: string; precio: number }) => {
    addToCart(item);
  };

  return (
    <section id="catalogo" className="max-w-6xl mx-auto my-8 px-4 scroll-mt-24">
      {/* 1. Balones de Gas */}
      <div className="mb-10">
        <div className="flex items-center justify-between gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
              <Flame className="w-5 h-5 text-purple-700" />
            </div>
            <div>
              <h3 className="text-lg sm:text-xl font-black text-slate-900">
                Balones de Gas GLP Sellados
              </h3>
              <p className="text-xs text-slate-500">
                Garantía Llamagas con válvula sellada y precinto de seguridad anti-fugas.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {productos.map((item) => {
            const countInCart = carrito[item.id]?.cantidad || 0;
            return (
              <div
                key={item.id}
                className="bg-white rounded-2xl overflow-hidden shadow-xs border border-slate-200 hover:shadow-md transition-shadow flex flex-col"
              >
                {/* Image & Tag */}
                <div className="relative h-44 bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={getAssetUrl(item.imagen || '1791513590376.jpg')}
                    alt={item.nombre}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = getAssetUrl('1791513590376.jpg');
                    }}
                  />
                  {item.tag && (
                    <span className="absolute top-3 left-3 bg-purple-900/90 text-white text-[11px] font-black px-2.5 py-0.5 rounded-full shadow-xs">
                      {item.tag}
                    </span>
                  )}
                  {countInCart > 0 && (
                    <span className="absolute top-3 right-3 bg-amber-500 text-slate-900 text-xs font-black px-2 py-0.5 rounded-full shadow-md">
                      {countInCart} en carrito
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-base mb-1">
                      {item.nombre}
                    </h4>
                    <p className="text-xs text-slate-500 mb-4 leading-relaxed line-clamp-2">
                      {item.descripcion}
                    </p>
                  </div>

                  {/* Footer & Action */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-slate-400 block">
                        Precio
                      </span>
                      <span className="text-xl font-black text-purple-800">
                        S/ {item.precio.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => handleAddAndOpen(item)}
                        className="bg-purple-800 hover:bg-purple-900 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Pedir Balón</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Válvulas y Accesorios */}
      {accesorios.length > 0 && (
        <div>
          <div className="flex items-center justify-between gap-3 mb-6 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Wrench className="w-5 h-5 text-blue-700" />
              </div>
              <div>
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Válvulas, Mangueras y Accesorios
                </h3>
                <p className="text-xs text-slate-500">
                  Repuestos certificados y reguladores de alta seguridad para instalación inmediata.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {accesorios.map((acc) => {
              const inCart = carrito[acc.id]?.cantidad || 0;
              return (
                <div
                  key={acc.id}
                  className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-xs hover:shadow-md transition flex flex-col justify-between"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 overflow-hidden flex-shrink-0">
                      <img
                        src={getAssetUrl(acc.imagen || '1791513590376.jpg')}
                        alt={acc.nombre}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = getAssetUrl('1791513590376.jpg');
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h5 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-tight">
                        {acc.nombre}
                      </h5>
                      <span className="text-purple-800 font-black text-sm">
                        S/ {acc.precio.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleAddAndOpen(acc)}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    {inCart > 0 ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        <span>Agregado ({inCart})</span>
                      </>
                    ) : (
                      <>
                        <Plus className="w-3.5 h-3.5" />
                        <span>Agregar</span>
                      </>
                    )}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </section>
  );
};
