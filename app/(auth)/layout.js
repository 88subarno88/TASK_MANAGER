export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-void bg-grid noise relative flex items-center justify-center p-4">
      {/* Ambient glow top */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] 
                      bg-gradient-radial from-cyan/10 to-transparent rounded-full 
                      blur-3xl pointer-events-none" 
           style={{ background: 'radial-gradient(ellipse, rgba(0,212,255,0.08) 0%, transparent 70%)' }} />
      {/* Ambient glow bottom right */}
      <div className="fixed bottom-0 right-0 w-[500px] h-[500px] pointer-events-none"
           style={{ background: 'radial-gradient(ellipse at 100% 100%, rgba(0,212,255,0.05) 0%, transparent 70%)' }} />
      
      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-10 animate-slide-up">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-cyan/10 border border-cyan/30 flex items-center justify-center glow-cyan-sm">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                <path d="M9 11l3 3L22 4"/>
                <path d="M21 12v7a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2h11"/>
              </svg>
            </div>
            <span className="font-display text-2xl font-bold tracking-tight">
              Task<span className="text-cyan">Flow</span>
            </span>
          </div>
          <p className="text-slate-text text-sm font-mono">
            <span className="text-cyan/60">// </span>end-to-end encrypted workspace
          </p>
        </div>
        {children}
      </div>
    </div>
  );
}
