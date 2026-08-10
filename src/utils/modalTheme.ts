export type ColorTheme = 'slate' | 'light' | 'amoled' | 'retro' | 'cyber';

export interface ModalThemeClasses {
  backdrop: string;
  window: string;
  header: string;
  headerTitle: string;
  footer: string;
  card: string;
  input: string;
  textPrimary: string;
  textMuted: string;
  textSecondary: string;
  btnSecondary: string;
  btnPrimary: string;
  tabActive: string;
  tabInactive: string;
  closeBtn: string;
  borderColor: string;
  bannerBg: string;
  codeBg: string;
}

export function getModalThemeClasses(theme: ColorTheme | string = 'light'): ModalThemeClasses {
  switch (theme) {
    case 'light':
    default:
      return {
        backdrop: 'bg-slate-900/40 backdrop-blur-sm',
        window: 'bg-slate-50 border border-slate-300 text-slate-900 shadow-2xl',
        header: 'bg-slate-200/90 border-b border-slate-300 text-slate-900',
        headerTitle: 'text-slate-900 font-bold',
        footer: 'bg-slate-200/90 border-t border-slate-300 text-slate-700',
        card: 'bg-white border border-slate-300 text-slate-800 shadow-sm',
        input: 'bg-white border border-slate-300 text-slate-900 placeholder-slate-400 focus:border-indigo-600',
        textPrimary: 'text-slate-900',
        textMuted: 'text-slate-500',
        textSecondary: 'text-slate-700',
        btnSecondary: 'bg-slate-200 hover:bg-slate-300/80 border border-slate-300 text-slate-800',
        btnPrimary: 'bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-sm',
        tabActive: 'bg-indigo-600 text-white font-bold shadow-sm',
        tabInactive: 'bg-slate-200 text-slate-700 hover:bg-slate-300/70 hover:text-slate-900',
        closeBtn: 'text-slate-500 hover:text-slate-900 hover:bg-slate-300/70',
        borderColor: 'border-slate-300',
        bannerBg: 'bg-indigo-50 border border-indigo-200 text-indigo-950',
        codeBg: 'bg-slate-100 text-slate-900 border border-slate-300',
      };
    case 'amoled':
      return {
        backdrop: 'bg-black/80 backdrop-blur-sm',
        window: 'bg-black border border-zinc-800 text-zinc-100 shadow-2xl',
        header: 'bg-zinc-950 border-b border-zinc-900 text-zinc-100',
        headerTitle: 'text-zinc-100 font-bold',
        footer: 'bg-zinc-950 border-t border-zinc-900 text-zinc-400',
        card: 'bg-zinc-950 border border-zinc-800 text-zinc-200',
        input: 'bg-black border border-zinc-800 text-zinc-100 placeholder-zinc-500 focus:border-zinc-600',
        textPrimary: 'text-zinc-100',
        textMuted: 'text-zinc-400',
        textSecondary: 'text-zinc-300',
        btnSecondary: 'bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200',
        btnPrimary: 'bg-zinc-100 hover:bg-white text-black font-bold',
        tabActive: 'bg-zinc-800 text-white font-bold border border-zinc-700',
        tabInactive: 'bg-zinc-950 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900',
        closeBtn: 'text-zinc-400 hover:text-white hover:bg-zinc-900',
        borderColor: 'border-zinc-800',
        bannerBg: 'bg-zinc-900/80 border border-zinc-700 text-zinc-100',
        codeBg: 'bg-zinc-950 text-zinc-200 border border-zinc-800',
      };
    case 'retro':
      return {
        backdrop: 'bg-slate-900/60 backdrop-blur-sm',
        window: 'bg-slate-300 border-2 border-slate-400 text-slate-900 shadow-2xl font-sans',
        header: 'bg-gradient-to-r from-blue-900 to-indigo-900 border-b border-slate-400 text-white',
        headerTitle: 'text-white font-bold',
        footer: 'bg-slate-300 border-t-2 border-slate-400 text-slate-800',
        card: 'bg-slate-200 border border-slate-400 text-slate-900',
        input: 'bg-white border-2 border-slate-400 text-slate-900 placeholder-slate-500',
        textPrimary: 'text-slate-900',
        textMuted: 'text-slate-700',
        textSecondary: 'text-slate-800',
        btnSecondary: 'bg-slate-200 hover:bg-slate-100 border-2 border-slate-400 text-slate-900 font-semibold',
        btnPrimary: 'bg-blue-800 hover:bg-blue-700 text-white font-bold border border-blue-950',
        tabActive: 'bg-blue-800 text-white font-bold border border-blue-950',
        tabInactive: 'bg-slate-200 text-slate-800 hover:bg-slate-100 border border-slate-400',
        closeBtn: 'text-slate-200 hover:text-white hover:bg-blue-950/60',
        borderColor: 'border-slate-400',
        bannerBg: 'bg-slate-200 border-2 border-slate-400 text-slate-900',
        codeBg: 'bg-white text-slate-900 border border-slate-400',
      };
    case 'cyber':
      return {
        backdrop: 'bg-purple-950/60 backdrop-blur-md',
        window: 'bg-zinc-950 border border-purple-500/50 text-purple-100 shadow-purple-900/30 shadow-2xl',
        header: 'bg-purple-950/80 border-b border-purple-800 text-purple-100',
        headerTitle: 'text-purple-100 font-bold',
        footer: 'bg-purple-950 border-t border-purple-900 text-purple-300',
        card: 'bg-purple-950/40 border border-purple-900 text-purple-200',
        input: 'bg-zinc-950 border border-purple-900 text-purple-100 placeholder-purple-500 focus:border-purple-500',
        textPrimary: 'text-purple-100',
        textMuted: 'text-purple-300/80',
        textSecondary: 'text-purple-200',
        btnSecondary: 'bg-purple-950/80 hover:bg-purple-900 border border-purple-800 text-purple-200',
        btnPrimary: 'bg-purple-600 hover:bg-purple-500 text-white font-bold shadow-lg shadow-purple-600/30',
        tabActive: 'bg-purple-800 text-white font-bold border border-purple-500',
        tabInactive: 'bg-purple-950/80 text-purple-300 hover:bg-purple-900',
        closeBtn: 'text-purple-300 hover:text-white hover:bg-purple-900/60',
        borderColor: 'border-purple-900',
        bannerBg: 'bg-purple-900/40 border border-purple-700 text-purple-100',
        codeBg: 'bg-zinc-950 text-purple-200 border border-purple-900',
      };
    case 'slate':
      return {
        backdrop: 'bg-black/70 backdrop-blur-sm',
        window: 'bg-slate-900 border border-slate-700/80 text-slate-100 shadow-2xl',
        header: 'bg-slate-800/90 border-b border-slate-700 text-slate-100',
        headerTitle: 'text-slate-100 font-bold',
        footer: 'bg-slate-950 border-t border-slate-800 text-slate-300',
        card: 'bg-slate-950/70 border border-slate-800 text-slate-200',
        input: 'bg-slate-950 border border-slate-800 text-slate-100 placeholder-slate-500 focus:border-indigo-500',
        textPrimary: 'text-slate-100',
        textMuted: 'text-slate-400',
        textSecondary: 'text-slate-300',
        btnSecondary: 'bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200',
        btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/20',
        tabActive: 'bg-indigo-600 text-white font-bold shadow-sm',
        tabInactive: 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-slate-200',
        closeBtn: 'text-slate-400 hover:text-white hover:bg-slate-800',
        borderColor: 'border-slate-800',
        bannerBg: 'bg-gradient-to-r from-indigo-950/80 via-slate-900 to-orange-950/80 border border-indigo-500/30 text-slate-100',
        codeBg: 'bg-slate-950 text-slate-200 border border-slate-800',
      };
  }
}
