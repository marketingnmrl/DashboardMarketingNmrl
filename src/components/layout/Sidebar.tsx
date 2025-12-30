"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

// Navigation structure matching the PRD architecture
const navigation = [
  {
    section: "Dashboard",
    items: [
      { name: "Visão Geral", href: "/", icon: "dashboard" },
    ],
  },
  {
    section: "Análise",
    items: [
      { name: "Alcance & Exposição", href: "/analise/alcance", icon: "campaign" },
      { name: "Tráfego", href: "/analise/trafego", icon: "bar_chart" },
      { name: "Conteúdo", href: "/analise/conteudo", icon: "article" },
      { name: "Funil", href: "/analise/funil", icon: "filter_alt" },
      { name: "Eficiência", href: "/analise/eficiencia", icon: "speed" },
      { name: "Investimentos", href: "/analise/investimentos", icon: "payments" },
      { name: "Meus Funis", href: "/funis", icon: "conversion_path" },
    ],
  },
  {
    section: "Conversões",
    items: [
      { name: "Leads & Conversões", href: "/conversoes/leads", icon: "group_add" },
      { name: "Financeiro", href: "/conversoes/financeiro", icon: "attach_money" },
    ],
  },
  {
    section: "Gestão",
    items: [
      { name: "Campanhas", href: "/gestao/campanhas", icon: "ads_click" },
      { name: "Relatórios", href: "/gestao/relatorios", icon: "analytics" },
    ],
  },
];

const bottomNavigation = [
  { name: "Configurações", href: "/configuracoes", icon: "settings" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();

  const isActive = (href: string) => {
    if (href === "/") {
      return pathname === "/";
    }
    return pathname.startsWith(href);
  };

  const handleLogout = async () => {
    await signOut();
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.email) return "U";
    const parts = user.email.split("@")[0].split(/[._-]/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return user.email.slice(0, 2).toUpperCase();
  };

  return (
    <aside className="flex w-64 flex-col bg-[#F4F4F4] border-r border-gray-200 h-screen sticky top-0 shrink-0">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200/60">
        <div className="flex items-center justify-center">
          <Image
            src="/logo-namoral.png"
            alt="Marketing Na Moral"
            width={180}
            height={60}
            className="h-12 w-auto object-contain"
            priority
          />
        </div>
      </div>


      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-6">
        {navigation.map((group) => (
          <div key={group.section}>
            <p className="px-3 mb-2 text-xs font-bold uppercase tracking-wider text-gray-400">
              {group.section}
            </p>
            <div className="space-y-1">
              {group.items.map((item) => {
                const active = isActive(item.href);
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                      ${active
                        ? "bg-[#19069E] text-white shadow-lg"
                        : "text-gray-600 hover:bg-white hover:text-[#19069E] hover:shadow-sm"
                      }
                    `}
                  >
                    <span
                      className={`
                        material-symbols-outlined text-[22px] transition-colors
                        ${active ? "text-[#C2DF0C]" : "text-gray-400 group-hover:text-[#19069E]"}
                      `}
                      style={{ fontVariationSettings: active ? "'FILL' 1" : "'FILL' 0" }}
                    >
                      {item.icon}
                    </span>
                    <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                      {item.name}
                    </span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Bottom Navigation */}
      <div className="p-4 border-t border-gray-200/60">
        {bottomNavigation.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group
                ${active
                  ? "bg-[#19069E] text-white shadow-lg"
                  : "text-gray-600 hover:bg-white hover:text-[#19069E] hover:shadow-sm"
                }
              `}
            >
              <span
                className={`
                  material-symbols-outlined text-[22px] transition-colors
                  ${active ? "text-[#C2DF0C]" : "text-gray-400 group-hover:text-[#19069E]"}
                `}
              >
                {item.icon}
              </span>
              <span className={`text-sm ${active ? "font-bold" : "font-medium"}`}>
                {item.name}
              </span>
            </Link>
          );
        })}

        {/* User Profile */}
        <div className="mt-4 flex items-center gap-3 px-3 py-3 bg-white rounded-xl border border-gray-200 shadow-sm">
          <div className="w-9 h-9 rounded-full bg-[#19069E] flex items-center justify-center text-white text-sm font-bold">
            {getUserInitials()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-gray-900 truncate">
              {user?.email?.split("@")[0] || "Usuário"}
            </p>
            <p className="text-xs text-gray-500 truncate">{user?.email || ""}</p>
          </div>
          <button
            onClick={handleLogout}
            className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-500 transition-colors"
            title="Sair"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
