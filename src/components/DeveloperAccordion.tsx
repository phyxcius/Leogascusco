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
  Globe,
  FileCheck2
} from 'lucide-react';
import {
  consultarDni,
  consultarRuc,
  getStoredApisPeruToken,
  setStoredApisPeruToken,
  resetStoredApisPeruToken,
  getStoredFacturacionConfig,
  setStoredFacturacionConfig,
  FacturacionApisPeruConfig
} from '../utils/apisPeru';

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

  // Accordion & Master Developer Password Protection
  const [isOpen, setIsOpen] = useState(true);
  const [isUnlocked, setIsUnlocked] = useState<boolean>(() => {
    return sessionStorage.getItem('leogas_dev_unlocked') === 'true';
  });
  const [devPasswordInput, setDevPasswordInput] = useState('');
  const [showDevPassword, setShowDevPassword] = useState(false);
  const [devPasswordError, setDevPasswordError] = useState<string | null>(null);

  // Custom Master Password Change State
  const [isChangingPass, setIsChangingPass] = useState(false);
  const [newMasterPass, setNewMasterPass] = useState('');

  // Unlock with Master Developer Key
  const handleUnlockDeveloper = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const clean = devPasswordInput.trim();
    const customPass = localStorage.getItem('leogas_master_dev_password');
    // Valid passwords: custom developer set password, edwindev2026, EDWIN_DEV_2026, or leogas2026
    const valid =
      (customPass && clean === customPass) ||
      clean === 'edwindev2026' ||
      clean === 'EDWIN_DEV_2026' ||
      clean === 'leogas2026' ||
      clean === 'admin2026';

    if (valid) {
      setIsUnlocked(true);
      sessionStorage.setItem('leogas_dev_unlocked', 'true');
      setDevPasswordError(null);
      setDevPasswordInput('');
      playSuccessChime();
      playAndSpeak('Acceso concedido al Desarrollador.');
    } else {
      setDevPasswordError('❌ Clave de Desarrollador incorrecta. Acceso restringido al creador del software.');
      playChimeSound();
    }
  };

  // Lock developer module immediately
  const handleLockDeveloper = () => {
    setIsUnlocked(false);
    sessionStorage.removeItem('leogas_dev_unlocked');
    setDevPasswordInput('');
    setDevPasswordError(null);
    playChimeSound();
  };

  // Save new custom developer password
  const handleChangeMasterPass = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = newMasterPass.trim();
    if (clean.length < 6) {
      alert('La nueva clave de desarrollador debe tener al menos 6 caracteres.');
      return;
    }
    localStorage.setItem('leogas_master_dev_password', clean);
    setNewMasterPass('');
    setIsChangingPass(false);
    playSuccessChime();
    alert('✔ Clave maestra de desarrollador actualizada con éxito. Guárdala en un lugar seguro.');
  };

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

  // APIsPerú (RENIEC & SUNAT Consultas DNI/RUC) Configuration State
  const [apisPeruToken, setApisPeruTokenState] = useState<string>(() => getStoredApisPeruToken());
  const [showApisToken, setShowApisToken] = useState(false);
  const [isTestingApis, setIsTestingApis] = useState(false);
  const [apisTestResult, setApisTestResult] = useState<{
    ok: boolean;
    dniResult?: string;
    rucResult?: string;
    msg: string;
    isWrongServiceToken?: boolean;
  } | null>(null);

  // APIsPerú Facturación Electrónica (Beta / Producción - Token de Empresa)
  const [factConfig, setFactConfig] = useState<FacturacionApisPeruConfig>(() => getStoredFacturacionConfig());
  const [showFactToken, setShowFactToken] = useState(false);
  const [factSavedNotice, setFactSavedNotice] = useState(false);

  const handleSaveApisToken = () => {
    setStoredApisPeruToken(apisPeruToken);
    playSuccessChime();
    alert('✔ Token de API Consultas DNI/RUC guardado exitosamente.');
  };

  const handleRestoreDefaultApisToken = async () => {
    const restored = resetStoredApisPeruToken();
    setApisPeruTokenState(restored);
    setApisTestResult(null);
    playSuccessChime();
    // Auto-verify restored token
    setIsTestingApis(true);
    try {
      const dniRes = await consultarDni('42423549', restored, true);
      const rucRes = await consultarRuc('20100070970', restored, true);
      const ok = dniRes.success && rucRes.success;
      setApisTestResult({
        ok,
        dniResult: dniRes.success
          ? `✔ DNI 42423549: ${dniRes.nombreCompleto} [${dniRes.fuente}]`
          : `❌ DNI: ${dniRes.error}`,
        rucResult: rucRes.success
          ? `✔ RUC 20100070970: ${rucRes.razonSocial} (${rucRes.estado} - ${rucRes.condicion}) [${rucRes.fuente}]`
          : `❌ RUC: ${rucRes.error}`,
        msg: ok
          ? '¡Token base restaurado y verificado en vivo con RENIEC y SUNAT!'
          : 'Token restaurado, pero hubo un error al consultar.'
      });
    } finally {
      setIsTestingApis(false);
    }
  };

  const handleSaveFacturacionConfig = () => {
    setStoredFacturacionConfig({
      ...factConfig,
      tokenEmpresa: factConfig.tokenEmpresa.trim(),
      rucEmisor: factConfig.rucEmisor.trim(),
      razonSocialEmisor: factConfig.razonSocialEmisor.trim()
    });
    setFactSavedNotice(true);
    playSuccessChime();
    setTimeout(() => setFactSavedNotice(false), 3500);
  };

  const handleTestApisPeru = async () => {
    setIsTestingApis(true);
    setApisTestResult(null);
    try {
      // Test strictly with the token entered so admin knows right away if it's a Consultas token vs Facturación token
      const dniRes = await consultarDni('42423549', apisPeruToken, true);
      const rucRes = await consultarRuc('20100070970', apisPeruToken, true);

      const ok = dniRes.success && rucRes.success;
      const wrongService =
        !ok &&
        ((dniRes.error || '').includes('Facturación Electrónica') ||
          (rucRes.error || '').includes('Facturación Electrónica'));

      setApisTestResult({
        ok,
        isWrongServiceToken: wrongService,
        dniResult: dniRes.success
          ? `✔ DNI 42423549: ${dniRes.nombreCompleto} [${dniRes.fuente}]`
          : `❌ DNI: ${dniRes.error}`,
        rucResult: rucRes.success
          ? `✔ RUC 20100070970: ${rucRes.razonSocial} (${rucRes.estado} - ${rucRes.condicion}) [${rucRes.fuente}]`
          : `❌ RUC: ${rucRes.error}`,
        msg: ok
          ? '¡Sincronización Exitosa! Conexión en vivo con RENIEC y SUNAT activa (dniruc.apisperu.com).'
          : wrongService
          ? 'Ese token pertenece a "Facturación Electrónica (Beta/Prod)", no a "Consultas DNI/RUC". Usa el botón Restaurar Token Consultas o pega el Token de Facturación abajo.'
          : 'Atención: Revisa el token de Consultas DNI/RUC o tu conexión.'
      });
      if (ok) {
        playSuccessChime();
      } else {
        playChimeSound();
      }
    } catch (err: any) {
      setApisTestResult({
        ok: false,
        msg: `Error al probar APIsPerú: ${err.message || 'Sin conexión'}`
      });
      playChimeSound();
    } finally {
      setIsTestingApis(false);
    }
  };

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
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg flex-shrink-0 shadow-xs ${
            isUnlocked ? 'bg-amber-400 text-slate-950' : 'bg-red-500 text-white animate-pulse'
          }`}>
            {isUnlocked ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
          </div>

          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-sm sm:text-base font-black tracking-tight leading-tight">
                🛠️ Módulo Desarrollador Master (Token GitHub & Control Total)
              </h3>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                isUnlocked ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
              }`}>
                {isUnlocked ? 'Desbloqueado ✔' : 'Protegido con Clave 🔒'}
              </span>
            </div>
            <p className="text-[11px] mt-0.5 text-slate-300">
              {isUnlocked
                ? 'Acceso total concedido: GitHub Tokens, sincronización multi-dispositivo y reseteo general.'
                : 'Zona restringida exclusiva para el creador del software (alquiler seguro para empresas).'}
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
          {!isUnlocked ? (
            /* DEVELOPER PASSWORD CHALLENGE SHIELD */
            <div className="max-w-xl mx-auto my-4 bg-gradient-to-br from-slate-900 via-indigo-950 to-purple-950 text-white p-6 sm:p-8 rounded-3xl shadow-2xl border-2 border-indigo-500/50 text-center">
              <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-amber-400 to-yellow-500 text-slate-950 flex items-center justify-center mx-auto shadow-xl shadow-amber-400/20 mb-4 animate-bounce">
                <Lock className="w-8 h-8" />
              </div>

              <span className="bg-red-500/20 text-red-300 border border-red-500/40 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider">
                Acceso Exclusivo Desarrollador
              </span>

              <h4 className="text-lg sm:text-xl font-black mt-3 text-white">
                Módulo Blindado para Alquiler a Clientes
              </h4>
              <p className="text-xs sm:text-sm text-slate-300 mt-2 max-w-md mx-auto leading-relaxed">
                Este panel contiene el Token de GitHub, las credenciales maestras y el reseteo de fábrica del sistema. Los administradores del negocio alquilado <strong>no pueden acceder sin tu clave</strong>.
              </p>

              <form onSubmit={handleUnlockDeveloper} className="mt-6 max-w-sm mx-auto space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showDevPassword ? 'text' : 'password'}
                    value={devPasswordInput}
                    onChange={(e) => {
                      setDevPasswordInput(e.target.value);
                      if (devPasswordError) setDevPasswordError(null);
                    }}
                    placeholder="Clave Maestra de Desarrollador..."
                    className="w-full pl-10 pr-10 py-3 rounded-2xl bg-slate-800/90 border border-indigo-400/50 text-white text-sm font-semibold placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400 shadow-inner"
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowDevPassword(!showDevPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-white"
                  >
                    {showDevPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {devPasswordError && (
                  <div className="bg-red-500/20 border border-red-500/40 text-red-200 text-xs py-2 px-3 rounded-xl font-bold flex items-center justify-center gap-2 animate-shake">
                    <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                    <span>{devPasswordError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-amber-400 to-yellow-500 hover:from-amber-300 hover:to-yellow-400 text-slate-950 font-black text-sm shadow-lg shadow-amber-400/25 flex items-center justify-center gap-2 cursor-pointer transition transform active:scale-95"
                >
                  <Unlock className="w-4 h-4" />
                  <span>Desbloquear Módulo Desarrollador</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              {/* TOP STATUS BAR WITH LOCK & CHANGE PASS ACTIONS */}
              <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 text-emerald-950 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                  <div>
                    <strong className="text-xs font-black block">Modo Desarrollador Desbloqueado ✔</strong>
                    <span className="text-[11px] text-emerald-800">
                      Tienes control total sobre el token de GitHub, respaldos y reseteo general del sistema.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setIsChangingPass(!isChangingPass)}
                    className="px-3 py-1.5 rounded-xl bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <KeyRound className="w-3.5 h-3.5" />
                    <span>{isChangingPass ? 'Cancelar Clave' : 'Cambiar Clave'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLockDeveloper}
                    className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition cursor-pointer"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bloquear Módulo</span>
                  </button>
                </div>
              </div>

              {/* INLINE CHANGE MASTER PASSWORD FORM */}
              {isChangingPass && (
                <form
                  onSubmit={handleChangeMasterPass}
                  className="bg-indigo-950 text-white p-4 rounded-2xl border border-indigo-400/40 flex flex-wrap items-center gap-3 animate-in fade-in duration-200"
                >
                  <div className="flex-1 min-w-[220px]">
                    <label className="text-[11px] text-indigo-200 font-bold block mb-1">
                      Nueva Clave Maestra de Desarrollador:
                    </label>
                    <input
                      type="password"
                      value={newMasterPass}
                      onChange={(e) => setNewMasterPass(e.target.value)}
                      placeholder="Mínimo 6 caracteres..."
                      className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-indigo-300/40 text-white text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400"
                      required
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs shadow-md cursor-pointer transition"
                    >
                      Guardar Nueva Clave
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPass(false)}
                      className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold cursor-pointer"
                    >
                      Cancelar
                    </button>
                  </div>
                </form>
              )}

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

              {/* APISPERU OFFICIAL INTEGRATION CARD (DUAL TOKEN: CONSULTAS DNI/RUC + FACTURACION BETA/PROD) */}
              <div className="bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-950 text-white rounded-3xl p-5 sm:p-6 shadow-lg border border-blue-800/80 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-blue-800/60 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-400 to-blue-600 text-slate-950 flex items-center justify-center font-black shadow-md">
                      <FileCheck2 className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm sm:text-base font-black text-white">
                          Integración APIsPerú (Consultas RENIEC/SUNAT & Facturación Beta/Prod)
                        </h4>
                        <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-black px-2 py-0.5 rounded-full uppercase">
                          dniruc.apisperu.com • CORS Libre
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-200/90 leading-tight mt-0.5">
                        APIsPerú maneja 2 servicios separados: (1) <strong>API Consultas DNI/RUC</strong> para validar nombres reales en RENIEC y SUNAT, y (2) <strong>Token de Empresa</strong> para Facturación Electrónica (Beta/Producción).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleTestApisPeru}
                      disabled={isTestingApis}
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 transition cursor-pointer shadow-md disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isTestingApis ? 'animate-spin' : ''}`} />
                      <span>{isTestingApis ? 'Consultando RENIEC/SUNAT...' : '🧪 Probar Consultas en Vivo'}</span>
                    </button>
                  </div>
                </div>

                {/* BOX 1: Token API Consultas DNI/RUC */}
                <div className="space-y-3 bg-slate-900/60 p-4 rounded-2xl border border-blue-900/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label className="text-[11px] font-black uppercase text-cyan-300 block">
                      1. Token "API Consultas DNI/RUC" (dniruc.apisperu.com):
                    </label>
                    <button
                      type="button"
                      onClick={handleRestoreDefaultApisToken}
                      className="text-[10px] bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-black px-2.5 py-1 rounded-lg cursor-pointer transition w-fit"
                    >
                      ↺ Restaurar Token Funcional Base
                    </button>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        type={showApisToken ? 'text' : 'password'}
                        value={apisPeruToken}
                        onChange={(e) => setApisPeruTokenState(e.target.value)}
                        placeholder="Pega aquí el token de API Consultas DNI/RUC de apisperu.com..."
                        className="w-full bg-slate-950 border border-blue-700/60 rounded-xl p-2.5 pr-10 text-xs font-mono font-bold text-white focus:outline-blue-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApisToken(!showApisToken)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showApisToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={handleSaveApisToken}
                      className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Token</span>
                    </button>
                  </div>

                  {/* Test Feedback display */}
                  {apisTestResult && (
                    <div className={`p-3.5 rounded-xl border text-xs space-y-1.5 animate-in fade-in ${
                      apisTestResult.ok ? 'bg-emerald-950/80 border-emerald-500/80 text-emerald-100' : 'bg-red-950/80 border-red-500/80 text-red-100'
                    }`}>
                      <div className="font-black flex items-center gap-1.5 text-xs sm:text-sm">
                        {apisTestResult.ok ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-red-400 shrink-0" />}
                        <span>{apisTestResult.msg}</span>
                      </div>
                      {apisTestResult.dniResult && (
                        <div className="text-[11px] font-mono text-cyan-200">
                          {apisTestResult.dniResult}
                        </div>
                      )}
                      {apisTestResult.rucResult && (
                        <div className="text-[11px] font-mono text-cyan-200">
                          {apisTestResult.rucResult}
                        </div>
                      )}
                      {apisTestResult.isWrongServiceToken && (
                        <div className="pt-1">
                          <button
                            type="button"
                            onClick={handleRestoreDefaultApisToken}
                            className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                          >
                            ⚡ Restaurar y Probar Token Consultas DNI/RUC Ahora
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px] text-blue-200/80 pt-1">
                    <div>
                      <strong>📌 RENIEC (Boletas):</strong> Valida DNI real antes de imprimir boleta en carrito y administración.
                    </div>
                    <div>
                      <strong>🏢 SUNAT (Facturas):</strong> Valida RUC de 11 dígitos, Razón Social y condición Habido en vivo.
                    </div>
                  </div>
                </div>

                {/* BOX 2: API Facturación Electrónica (Token de Empresa - Beta / Producción) */}
                <div className="space-y-3 bg-indigo-950/70 p-4 rounded-2xl border border-indigo-700/50">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <label className="text-[11px] font-black uppercase text-amber-300 block">
                        2. API Facturación Electrónica — Token de Empresa ({factConfig.entorno.toUpperCase()}):
                      </label>
                      <span className="text-[10px] text-indigo-200/80">
                        Aquí va el <strong>Token de empresa</strong> de tu panel APIsPerú (modo Beta para pruebas o Producción al alquilar).
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-slate-950 p-1 rounded-xl border border-indigo-700/60 w-fit">
                      <button
                        type="button"
                        onClick={() => setFactConfig((prev) => ({ ...prev, entorno: 'beta' }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition ${
                          factConfig.entorno === 'beta' ? 'bg-amber-400 text-slate-950' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        🧪 Entorno BETA (Pruebas)
                      </button>
                      <button
                        type="button"
                        onClick={() => setFactConfig((prev) => ({ ...prev, entorno: 'produccion' }))}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-black cursor-pointer transition ${
                          factConfig.entorno === 'produccion' ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
                        }`}
                      >
                        🚀 PRODUCCIÓN
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div>
                      <label className="text-[10px] text-indigo-200 font-bold block mb-1">RUC Emisor (Empresa):</label>
                      <input
                        type="text"
                        maxLength={11}
                        value={factConfig.rucEmisor}
                        onChange={(e) => setFactConfig((prev) => ({ ...prev, rucEmisor: e.target.value.replace(/\D/g, '') }))}
                        placeholder="Ej: 10424235496"
                        className="w-full bg-slate-950 border border-indigo-700/60 rounded-xl p-2 text-xs font-mono font-bold text-white"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] text-indigo-200 font-bold block mb-1">Razón Social Emisor:</label>
                      <input
                        type="text"
                        value={factConfig.razonSocialEmisor}
                        onChange={(e) => setFactConfig((prev) => ({ ...prev, razonSocialEmisor: e.target.value }))}
                        placeholder="Ej: LA CHUSPA ANUNCIOS"
                        className="w-full bg-slate-950 border border-indigo-700/60 rounded-xl p-2 text-xs font-bold text-white"
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <div className="relative flex-1 min-w-[200px]">
                      <input
                        type={showFactToken ? 'text' : 'password'}
                        value={factConfig.tokenEmpresa}
                        onChange={(e) => setFactConfig((prev) => ({ ...prev, tokenEmpresa: e.target.value }))}
                        placeholder="Pega aquí el Token de empresa (Facturación Electrónica Beta/Prod)..."
                        className="w-full bg-slate-950 border border-indigo-700/60 rounded-xl p-2.5 pr-10 text-xs font-mono font-bold text-white focus:outline-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setShowFactToken(!showFactToken)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                      >
                        {showFactToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleSaveFacturacionConfig}
                      className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black px-4 py-2.5 rounded-xl text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Guardar Config SUNAT</span>
                    </button>
                  </div>

                  {factSavedNotice && (
                    <div className="text-[11px] font-bold text-emerald-300 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Configuración de Facturación Electrónica ({factConfig.entorno.toUpperCase()}) guardada correctamente.</span>
                    </div>
                  )}
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
          )}
        </div>
      )}
    </div>
  );
  };
