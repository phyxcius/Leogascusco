import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { playAndSpeak, playSuccessChime, playChimeSound } from '../utils/audio';
import {
  Lock,
  Unlock,
  KeyRound,
  RefreshCw,
  Trash2,
  ShieldAlert,
  Check,
  Eye,
  EyeOff,
  Save,
  Download,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Database,
  GitBranch,
  CheckCircle2,
  XCircle,
  Cloud,
  Smartphone,
  UploadCloud,
  Globe
} from 'lucide-react';

export const DeveloperAccordion: React.FC = () => {
  const {
    resetDesarrollador,
    resetPedidosYVentas,
    resetNegocio,
    productos,
    accesorios,
    telefonos,
    negocio,
    repartidores,
    empresasB2B,
    clientesVIP,
    pedidos,
    ventas,
    crmPlantillas,
    cotizaciones,
    isSyncingCloud,
    cloudSyncStatus,
    publicarCambiosEnLaNube,
    cargarDatosDeLaNube
  } = useApp();

  // Accordion & Direct Developer State (No password barrier as requested)
  const [isOpen, setIsOpen] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // GitHub Token State
  const [githubToken, setGithubToken] = useState<string>(() => {
    return localStorage.getItem('leogas_github_token') || '';
  });
  const [githubRepo, setGithubRepo] = useState<string>(() => {
    const stored = localStorage.getItem('leogas_github_repo');
    if (stored && stored !== 'phyxcius/Leogas') return stored;
    return 'phyxcius/Leogascusco';
  });
  const [githubBranch, setGithubBranch] = useState<string>(() => {
    return localStorage.getItem('leogas_github_branch') || 'main';
  });
  const [showToken, setShowToken] = useState(false);
  const [isTestingGitHub, setIsTestingGitHub] = useState(false);
  const [gitHubStatus, setGitHubStatus] = useState<{
    ok: boolean;
    msg: string;
    repoInfo?: { name: string; stars: number; visibility: string; defaultBranch: string };
  } | null>(null);

  const handleToggleAccordion = () => {
    setIsOpen((prev) => !prev);
  };

  // Save GitHub Token & Test Connection
  const handleSaveAndTestGitHub = async () => {
    const cleanToken = githubToken.trim();
    // Normalize repo: handles https://github.com/owner/repo or owner/repo/
    const normalizedRepo = githubRepo
      .trim()
      .replace(/^https?:\/\/github\.com\//i, '')
      .replace(/\/+$/, '');
    const cleanBranch = githubBranch.trim() || 'main';

    localStorage.setItem('leogas_github_token', cleanToken);
    localStorage.setItem('leogas_github_repo', normalizedRepo);
    localStorage.setItem('leogas_github_branch', cleanBranch);
    setGithubRepo(normalizedRepo);
    setGithubBranch(cleanBranch);

    if (!cleanToken) {
      setGitHubStatus({
        ok: false,
        msg: 'Token de GitHub guardado como vacío. Ingresa un Personal Access Token (PAT) de GitHub para validar la conexión con el repositorio.'
      });
      playChimeSound();
      return;
    }

    if (!normalizedRepo.includes('/')) {
      setGitHubStatus({
        ok: false,
        msg: 'El formato del repositorio debe ser "usuario/repositorio" (ejemplo: phyxcius/Leogas).'
      });
      playChimeSound();
      return;
    }

    setIsTestingGitHub(true);
    setGitHubStatus(null);

    try {
      // First try with appropriate prefix (classic ghp_ vs fine-grained github_pat_)
      let res = await fetch(`https://api.github.com/repos/${normalizedRepo}`, {
        headers: {
          Authorization: cleanToken.startsWith('ghp_') ? `token ${cleanToken}` : `Bearer ${cleanToken}`,
          Accept: 'application/vnd.github+json'
        }
      });

      // If 401, retry with alternative token header prefix
      if (res.status === 401 && !cleanToken.startsWith('ghp_')) {
        res = await fetch(`https://api.github.com/repos/${normalizedRepo}`, {
          headers: {
            Authorization: `token ${cleanToken}`,
            Accept: 'application/vnd.github+json'
          }
        });
      }

      if (res.ok) {
        const data = await res.json();
        setGitHubStatus({
          ok: true,
          msg: `¡Conexión verificada con éxito con el repositorio ${data.full_name}!`,
          repoInfo: {
            name: data.full_name,
            stars: data.stargazers_count,
            visibility: data.private ? 'Privado' : 'Público',
            defaultBranch: data.default_branch
          }
        });
        playSuccessChime();
        playAndSpeak(`Token de GitHub verificado exitosamente con el repositorio ${normalizedRepo}.`);
      } else {
        const errData = await res.json().catch(() => ({}));
        let humanMsg = errData.message || 'Error al conectar con la API de GitHub.';
        if (res.status === 401) {
          humanMsg = 'Credenciales no válidas. El Token PAT ha expirado o no tiene permisos suficientes.';
        } else if (res.status === 404) {
          humanMsg = `Repositorio "${normalizedRepo}" no encontrado o el token no tiene permisos para acceder a repositorios privados.`;
        }
        setGitHubStatus({
          ok: false,
          msg: `Error (${res.status}): ${humanMsg}`
        });
        playChimeSound();
      }
    } catch (err: any) {
      setGitHubStatus({
        ok: false,
        msg: `Error de red: ${err.message || 'No se pudo conectar a api.github.com. Revisa tu conexión.'}`
      });
      playChimeSound();
    } finally {
      setIsTestingGitHub(false);
    }
  };

  // Full Database Export Backup JSON
  const handleExportFullBackup = () => {
    const backupData = {
      timestamp: new Date().toISOString(),
      app: negocio.nombre || 'La Chuspa Tech',
      version: '2.0.0',
      githubRepo,
      negocio,
      telefonos,
      productos,
      accesorios,
      repartidores,
      empresasB2B,
      clientesVIP,
      pedidos,
      ventas,
      crmPlantillas,
      cotizaciones
    };

    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `leogas_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    playSuccessChime();
    alert('✔ Respaldo completo de la base de datos descargado con éxito.');
  };

  // Full Factory Reset
  const handleFullReset = () => {
    const confirmText = prompt(
      '⚠️ ATENCIÓN: Esta acción restablecerá TODOS los datos a los valores de fábrica (catálogo, repartidores, clientes y pedidos).\n\nPara confirmar, escribe "RESET" en mayúsculas:'
    );

    if (confirmText === 'RESET') {
      resetDesarrollador();
      playSuccessChime();
      playAndSpeak('Sistema restablecido exitosamente a valores de fábrica por el desarrollador.');
      alert('✔ Sistema restablecido completamente a valores de fábrica.');
    }
  };

  // Reset Orders & Sales only
  const handleResetOrdersOnly = () => {
    if (confirm('¿Deseas vaciar todos los pedidos y registros de ventas acumulados para iniciar una jornada desde cero?')) {
      resetPedidosYVentas();
      playSuccessChime();
      playAndSpeak('Historial de pedidos y ventas puesto a cero.');
      alert('✔ Historial de pedidos y ventas reseteado.');
    }
  };

  return (
    <div className="bg-white border-2 border-slate-300 rounded-3xl shadow-md overflow-hidden mt-6 transition duration-200">
      {/* Accordion Header */}
      <div
        onClick={handleToggleAccordion}
        className="p-4 sm:p-5 flex items-center justify-between cursor-pointer transition select-none bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs bg-amber-400 text-slate-950">
            <Unlock className="w-5 h-5" />
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                🛠️ Zona del Desarrollador (Token de GitHub & Reseteo del Sistema)
              </h3>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-500 text-white">
                Acceso Directo ✔
              </span>
            </div>
            <p className="text-[11px] mt-0.5 text-slate-300">
              Configuración de Token PAT de GitHub Pages, sincronización de repositorio y restablecimiento de fábrica.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="p-1 rounded-xl text-slate-300">
            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
          </div>
        </div>
      </div>

      {/* Accordion Body */}
      {isOpen && (
        <div className="p-4 sm:p-6 bg-slate-50/50 border-t border-slate-200 animate-in fade-in duration-200">
          <div className="space-y-6">
            {/* TOP STATUS BAR */}
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                <div>
                  <strong className="text-xs font-black block">Modo Desarrollador Habilitado</strong>
                  <span className="text-[11px] text-emerald-800">
                    Tienes control total sobre el token de GitHub, respaldos y reseteo general del sistema.
                  </span>
                </div>
              </div>
            </div>

              {/* GLOBAL CLOUD SYNC CARD (CROSS-DEVICE SYNC FOR ALL CELLPHONES) */}
              <div className="bg-gradient-to-br from-indigo-950 via-purple-950 to-slate-900 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-purple-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-purple-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center font-black shadow-md">
                      <Cloud className="w-5 h-5 text-slate-950" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Sincronización Global de Catálogo (Nube GitHub)
                        </h4>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          Todos los Celulares
                        </span>
                      </div>
                      <p className="text-[11px] text-purple-200/90 leading-tight">
                        Publica precios, fotos de balones, accesorios e identidad en el repositorio para que se vean en cualquier celular Android, iPhone, tablet o PC.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        let token = localStorage.getItem('leogas_github_token') || githubToken;
                        if (!token.trim()) {
                          const promptToken = prompt(
                            '🔑 Token de GitHub requerido:\n\nIngresa tu Personal Access Token (PAT) de GitHub para publicar el catálogo en la nube:'
                          );
                          if (promptToken && promptToken.trim()) {
                            token = promptToken.trim();
                            setGithubToken(token);
                            localStorage.setItem('leogas_github_token', token);
                          } else {
                            alert('⚠️ Se requiere el Token de GitHub para sincronizar con la nube.');
                            return;
                          }
                        }

                        const res = await publicarCambiosEnLaNube();
                        if (res.ok) {
                          alert('✅ ¡Publicado en la nube con éxito! Todos los celulares verán los cambios actualizados.');
                        } else {
                          alert(`⚠️ Atención: ${res.msg}`);
                        }
                      }}
                      disabled={isSyncingCloud}
                      className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <UploadCloud className={`w-4 h-4 ${isSyncingCloud ? 'animate-bounce' : ''}`} />
                      <span>{isSyncingCloud ? 'Subiendo a GitHub...' : '🚀 Publicar Catálogo en la Nube'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        const ok = await cargarDatosDeLaNube(true);
                        if (ok) {
                          playSuccessChime();
                          alert('✔ Datos descargados y sincronizados desde la nube de GitHub con éxito.');
                        } else {
                          alert('No se encontraron cambios pendientes en la nube o no se pudo conectar con GitHub.');
                        }
                      }}
                      className="bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-700/60 font-bold px-3 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer"
                      title="Forzar lectura del archivo store.json desde GitHub"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Recargar de Nube</span>
                    </button>
                  </div>
                </div>

                {/* Cloud Sync Status Feedback */}
                {cloudSyncStatus && (
                  <div
                    className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-2 ${
                      cloudSyncStatus.ok
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-200'
                        : 'bg-red-950/60 border-red-500/50 text-red-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {cloudSyncStatus.ok ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      ) : (
                        <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                      )}
                      <span className="font-semibold">{cloudSyncStatus.msg}</span>
                    </div>
                    {cloudSyncStatus.time && (
                      <span className="text-[10px] text-purple-300 font-mono whitespace-nowrap">
                        Hora: {cloudSyncStatus.time}
                      </span>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-[11px] bg-purple-950/40 p-3 rounded-2xl border border-purple-800/40 text-purple-200">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span><strong>Repositorio:</strong> {githubRepo || 'phyxcius/Leogascusco'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span><strong>Archivo central:</strong> public/data/store.json</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <span><strong>Alcance:</strong> Android, iPhone, PC y Tablets</span>
                  </div>
                </div>
              </div>

              {/* GRID 2 COLUMNS: GITHUB TOKEN & FACTORY RESET */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* ================= COLUMNA 1: GITHUB INTEGRATION & TOKEN ================= */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center text-sm font-black">
                        GH
                      </div>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-slate-900">
                          Token de GitHub & Repositorio
                        </h4>
                        <span className="text-[10px] text-slate-500">
                          Sincronización con GitHub Pages y GitHub API
                        </span>
                      </div>
                    </div>

                    <a
                      href={`https://github.com/${githubRepo}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-700 hover:text-purple-900 text-[11px] font-bold flex items-center gap-1 hover:underline"
                    >
                      <span>Abrir Repo</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>

                  {/* GitHub Inputs */}
                  <div className="space-y-3 text-xs">
                    <div>
                      <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                        Personal Access Token (PAT de GitHub):
                      </label>
                      <div className="relative">
                        <input
                          type={showToken ? 'text' : 'password'}
                          value={githubToken}
                          onChange={(e) => setGithubToken(e.target.value)}
                          placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxx o github_pat_..."
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2.5 pr-10 text-xs font-mono font-bold text-slate-800 focus:outline-purple-800"
                        />
                        <button
                          type="button"
                          onClick={() => setShowToken((prev) => !prev)}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                        >
                          {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-[10px] text-slate-400 mt-1">
                        Token personal con permisos <code>repo</code> o <code>contents:write</code>.
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Repositorio:
                        </label>
                        <input
                          type="text"
                          value={githubRepo}
                          onChange={(e) => setGithubRepo(e.target.value)}
                          placeholder="usuario/repositorio"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-600 block mb-1">
                          Rama (Branch):
                        </label>
                        <input
                          type="text"
                          value={githubBranch}
                          onChange={(e) => setGithubBranch(e.target.value)}
                          placeholder="main"
                          className="w-full bg-slate-50 border border-slate-300 rounded-xl p-2 text-xs font-mono font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    {/* GitHub Status Feedback */}
                    {gitHubStatus && (
                      <div
                        className={`p-3 rounded-xl border text-xs ${
                          gitHubStatus.ok
                            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                            : 'bg-red-50 border-red-300 text-red-900'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-bold">
                          {gitHubStatus.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-red-600" />}
                          <span>{gitHubStatus.msg}</span>
                        </div>
                        {gitHubStatus.repoInfo && (
                          <div className="mt-1.5 text-[10px] space-y-0.5 text-slate-700">
                            <div>• Visibilidad: <strong>{gitHubStatus.repoInfo.visibility}</strong></div>
                            <div>• Rama por defecto: <strong>{gitHubStatus.repoInfo.defaultBranch}</strong></div>
                            <div>• URL GitHub Pages: <a href={`https://${githubRepo.split('/')[0]}.github.io/${githubRepo.split('/')[1] || ''}`} target="_blank" rel="noopener noreferrer" className="text-blue-700 underline font-bold">https://{githubRepo.split('/')[0]}.github.io/{githubRepo.split('/')[1] || ''}</a></div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      <button
                        type="button"
                        onClick={handleSaveAndTestGitHub}
                        disabled={isTestingGitHub}
                        className="flex-1 bg-slate-900 hover:bg-slate-800 text-white font-black py-2.5 px-3 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs disabled:opacity-50"
                      >
                        <RefreshCw className={`w-3.5 h-3.5 ${isTestingGitHub ? 'animate-spin' : ''}`} />
                        <span>{isTestingGitHub ? 'Comprobando...' : 'Guardar y Probar Token'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={handleExportFullBackup}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-900 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center gap-1 transition cursor-pointer"
                        title="Exportar todos los datos locales en archivo JSON"
                      >
                        <Download className="w-3.5 h-3.5 text-purple-700" />
                        <span>Descargar Backup</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* ================= COLUMNA 2: RESETEO DEL DESARROLLADOR ================= */}
                <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4">
                  <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                    <div className="w-8 h-8 rounded-xl bg-red-100 text-red-700 flex items-center justify-center">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        Reseteo del Sistema (Opciones de Fábrica)
                      </h4>
                      <span className="text-[10px] text-slate-500">
                        Restablecer catálogo, pedidos, clientes o identidad
                      </span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Botón 1: Reset Fábrica Completo */}
                    <div className="p-3 bg-red-50/60 border border-red-200 rounded-xl space-y-2">
                      <div className="flex items-start gap-2">
                        <ShieldAlert className="w-4 h-4 text-red-600 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs font-black text-red-950 block">
                            Restablecer Todo a Valores de Fábrica Iniciales
                          </strong>
                          <p className="text-[10px] text-red-800 leading-tight">
                            Regresa catálogo de balones, accesorios, repartidores, empresas B2B, pedidos de demo y configuraciones a su estado limpio original.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleFullReset}
                        className="w-full bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                        <span>⚡ Restablecer Todo a Estado de Fábrica</span>
                      </button>
                    </div>

                    {/* Botón 2: Limpiar pedidos y ventas solamente */}
                    <div className="p-3 bg-amber-50/60 border border-amber-200 rounded-xl space-y-2">
                      <div className="flex items-start gap-2">
                        <Database className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-xs font-black text-amber-950 block">
                            Puesta a Cero de Pedidos y Ventas
                          </strong>
                          <p className="text-[10px] text-amber-800 leading-tight">
                            Conserva tu catálogo, choferes y precios, pero vacía pedidos y liquidaciones para iniciar un día limpio.
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={handleResetOrdersOnly}
                        className="w-full bg-amber-600 hover:bg-amber-700 text-white font-black py-2.5 rounded-xl text-xs flex items-center justify-center gap-1.5 transition shadow-xs cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>🧹 Vaciar Historial de Pedidos y Ventas</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };
