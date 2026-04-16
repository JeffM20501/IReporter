export default function LoadingOverlay() {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-white/80 dark:bg-slate-950/80 backdrop-blur-sm">
            <div className="animate-pulse">
            <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl">
                <span className="text-white font-black text-3xl">IR</span>
            </div>
            </div>
            <p className="absolute bottom-10 left-1/2 -translate-x-1/2 text-slate-500 dark:text-slate-400 text-sm font-medium">
            Loading your content...
            </p>
        </div>
    );
}