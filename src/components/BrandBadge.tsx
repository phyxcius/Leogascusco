import React from 'react';
import { useApp } from '../context/AppContext';
import { getAssetUrl } from '../utils/assets';

interface BrandBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showChuspa?: boolean;
  centered?: boolean;
}

export const BrandBadge: React.FC<BrandBadgeProps> = ({
  size = 'md',
  showChuspa = true,
  centered = false
}) => {
  const { negocio } = useApp();
  const [imgError, setImgError] = React.useState(false);

  // Reset img error if logo changes
  React.useEffect(() => {
    setImgError(false);
  }, [negocio.logoUrl]);

  const chuspaUrl = negocio.enlaceChuspa || 'https://www.lachuspaanuncios.com';

  const logoDimension =
    size === 'lg' ? 'w-16 h-16' : size === 'sm' ? 'w-8 h-8' : 'w-11 h-11';
  const nameSize =
    size === 'lg' ? 'text-2xl' : size === 'sm' ? 'text-sm' : 'text-lg';
  const sloganSize =
    size === 'lg' ? 'text-xs' : size === 'sm' ? 'text-[9px]' : 'text-[11px]';

  return (
    <div
      className={`flex items-center gap-3 flex-wrap ${
        centered ? 'justify-center text-center' : 'justify-start text-left'
      }`}
    >
      {/* Business Logo & Name Container */}
      <div className="flex items-center gap-2.5">
        {negocio.logoUrl && !imgError ? (
          <img
            src={
              negocio.logoUrl.startsWith('data:') || negocio.logoUrl.startsWith('http')
                ? negocio.logoUrl
                : getAssetUrl(negocio.logoUrl)
            }
            alt={negocio.nombre}
            className={`${logoDimension} rounded-xl object-cover shadow-md border-2 border-amber-400 bg-white`}
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`${logoDimension} rounded-xl bg-purple-700 text-amber-400 flex items-center justify-center font-black text-2xl shadow-md border-2 border-amber-400`}
          >
            🦁
          </div>
        )}

        <div>
          <h1 className={`${nameSize} font-black leading-tight text-purple-950 tracking-wide`}>
            {negocio.nombre}
          </h1>
          <p className={`${sloganSize} uppercase font-bold tracking-wider text-slate-600`}>
            {negocio.slogan}
          </p>
        </div>
      </div>

      {/* La Chuspa Tech Badge alongside Business Logo */}
      {showChuspa && (
        <a
          href={chuspaUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 bg-yellow-50 hover:bg-yellow-100 border border-yellow-400 py-1 px-2.5 rounded-full text-xs transition shadow-xs cursor-pointer group"
          title="Desarrollado con La Chuspa Tech • Visitar www.lachusoaanuncios.com"
        >
          <img
            src={getAssetUrl('CHUSPITA-circulo.png')}
            alt="La Chuspa Tech"
            className="w-7 h-7 rounded-full object-cover border border-amber-600 bg-white group-hover:scale-105 transition"
            onError={(e) => {
              (e.target as HTMLImageElement).src =
                'https://lachuspaanuncios.com/wp-content/uploads/2023/10/cropped-logo-la-chuspa.png';
            }}
          />
          <div className="flex flex-col text-[10px] leading-tight text-left">
            <span className="font-black text-purple-900 group-hover:text-purple-950">
              La Chuspa Tech
            </span>
            <span className="text-amber-700 font-bold group-hover:underline">
              www.lachusoaanuncios.com ↗
            </span>
          </div>
        </a>
      )}
    </div>
  );
};
