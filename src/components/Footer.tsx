import { ShieldAlert } from "lucide-react";

export const Footer: React.FC = () => {
  const footerLinks = [
    { label: "Product", href: "#marketplace" },
    { label: "How It Works", href: "#how-it-works" },
    { label: "Wallet", href: "#wallet-preview" },
    { label: "Learn", href: "#toke-ease-guide" },
    { label: "Security", href: "#security" },
    { label: "Terms", href: "#" },
    { label: "Privacy", href: "#" },
  ];

  return (
    <footer className="border-t border-amber-900/20 bg-[#090706] pt-14 pb-12 text-[#8e887d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 pb-10 border-b border-white/5">
          {/* Logo & Tagline */}
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-amber-400 to-orange-500 p-[1px] flex items-center justify-center">
                <div className="w-full h-full bg-[#120f0d] rounded-[7px] flex items-center justify-center">
                  <span className="font-mono font-bold text-xs text-amber-400">
                    ½
                  </span>
                </div>
              </div>
              <span className="text-xl font-medium tracking-tight text-[#f6f5f0]">
                TokeEase
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded border border-amber-500/30 text-amber-400 bg-amber-500/10">
                Sandbox
              </span>
            </div>
            <p className="text-xs text-[#7d786e]">
              “Own more. Start smaller.”
            </p>
          </div>

          {/* Links */}
          <nav className="flex flex-wrap gap-x-6 gap-y-2">
            {footerLinks.map((link, idx) => (
              <a
                key={idx}
                href={link.href}
                className="text-xs text-[#a8a295] hover:text-[#f6f5f0] transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Global Mandatory Disclaimer & Copyright */}
        <div className="pt-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 text-xs">
          <div className="flex items-start gap-2.5 max-w-2xl text-[#787268]">
            <ShieldAlert className="w-4 h-4 text-amber-500/70 flex-shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              <strong className="text-[#9e988c]">Disclaimer:</strong> Prototype on Sepolia testnet. No real money. No real property, gold or bonds. Not financial advice.
            </p>
          </div>

          <div className="font-mono text-[#635e55] whitespace-nowrap">
            © 2026 TokeEase Protocol. Testnet Only.
          </div>
        </div>
      </div>
    </footer>
  );
};
