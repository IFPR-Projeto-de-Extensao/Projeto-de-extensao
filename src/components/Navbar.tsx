import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import {
  Search,
  PlusCircle,
  Home,
  PackageSearch,
  CheckCircle2,
  LayoutDashboard,
  UserCheck,
  Moon,
  Sun,
  Bell,
  QrCode,
  Menu,
  X,
  ShieldAlert,
  GraduationCap,
  Building2,
} from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    darkMode,
    toggleDarkMode,
    currentUser,
    switchUserRole,
    notifications,
    setQrScannerOpen,
    clearAllNotifications,
    setRegisterTypeSelection,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const unreadCount = notifications.filter((n) => !n.read).length;

  const handleNavClick = (tab: "home" | "lost" | "found" | "register" | "dashboard" | "profile") => {
    setActiveTab(tab);
    setMobileMenuOpen(false);
  };

  const handleRegisterClick = (type: "PERDIDO" | "ENCONTRADO") => {
    setRegisterTypeSelection(type);
    setActiveTab("register");
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-gray-200 dark:border-neutral-800 bg-white/95 dark:bg-[#181818]/95 backdrop-blur-md transition-colors duration-200">
      {/* Top green accent border bar IFPR */}
      <div className="h-1 w-full bg-gradient-to-r from-[#00843D] via-[#00843D] to-[#C8102E]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNavClick("home")}>
            <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-[#00843D] text-white font-bold shadow-md shadow-[#00843D]/20 hover:scale-105 transition-transform">
              <span className="text-xl tracking-tighter font-extrabold">IF</span>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-[#C8102E] rounded-full border-2 border-white dark:border-[#181818]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-bold text-lg tracking-tight text-neutral-900 dark:text-white">
                  Achados & Perdidos
                </span>
                <span className="px-1.5 py-0.5 text-[10px] font-bold rounded bg-[#00843D]/10 dark:bg-[#00843D]/20 text-[#00843D] dark:text-green-400 border border-[#00843D]/20">
                  IFPR
                </span>
              </div>
              <p className="text-[11px] text-neutral-500 dark:text-neutral-400 hidden sm:block">
                Campus Ivaiporã • Instituto Federal do Paraná
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1">
            <button
              onClick={() => handleNavClick("home")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "home"
                  ? "bg-[#00843D]/10 dark:bg-[#00843D]/20 text-[#00843D] dark:text-green-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </button>

            <button
              onClick={() => handleNavClick("lost")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "lost"
                  ? "bg-[#EF4444]/10 text-[#EF4444] dark:text-red-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <PackageSearch className="w-4 h-4 text-[#EF4444]" />
              <span>Perdidos</span>
            </button>

            <button
              onClick={() => handleNavClick("found")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "found"
                  ? "bg-[#22C55E]/10 text-[#22C55E] dark:text-green-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
              <span>Encontrados</span>
            </button>

            <button
              onClick={() => handleNavClick("register")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "register"
                  ? "bg-[#00843D] text-white shadow-sm font-semibold"
                  : "text-[#00843D] dark:text-green-400 hover:bg-[#00843D]/10 dark:hover:bg-[#00843D]/20 font-semibold"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar</span>
            </button>

            <button
              onClick={() => handleNavClick("dashboard")}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                activeTab === "dashboard"
                  ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 font-semibold"
                  : "text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </button>
          </nav>

          {/* Right Action Icons & Profile Switcher */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Quick QR Code Scanner Shortcut */}
            <button
              onClick={() => setQrScannerOpen(true)}
              title="Escanear QR Code de Devolução"
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
            >
              <QrCode className="w-5 h-5 text-[#00843D] dark:text-green-400" />
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors relative"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 bg-[#C8102E] text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown Drawer */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-[#1E1E1E] rounded-2xl shadow-xl border border-neutral-200 dark:border-neutral-800 z-50 p-4">
                  <div className="flex items-center justify-between pb-3 border-b border-neutral-200 dark:border-neutral-800">
                    <h3 className="font-bold text-sm text-neutral-900 dark:text-white flex items-center gap-2">
                      <Bell className="w-4 h-4 text-[#00843D]" /> Notificações do IFPR
                    </h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={clearAllNotifications}
                        className="text-xs text-[#00843D] dark:text-green-400 hover:underline font-medium"
                      >
                        Marcar todas lidas
                      </button>
                    )}
                  </div>

                  <div className="mt-3 space-y-2.5 max-h-72 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-center py-6 text-neutral-500">
                        Nenhuma notificação recente.
                      </p>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 rounded-xl text-xs transition-colors border ${
                            !n.read
                              ? "bg-[#00843D]/5 border-[#00843D]/20 dark:bg-[#00843D]/10"
                              : "bg-neutral-50 dark:bg-neutral-800/50 border-neutral-200 dark:border-neutral-800"
                          }`}
                        >
                          <div className="flex justify-between items-start font-semibold text-neutral-900 dark:text-white mb-1">
                            <span>{n.title}</span>
                            {!n.read && (
                              <span className="w-2 h-2 rounded-full bg-[#00843D]" />
                            )}
                          </div>
                          <p className="text-neutral-600 dark:text-neutral-300 leading-relaxed">
                            {n.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              title={darkMode ? "Mudar para Modo Claro" : "Mudar para Modo Escuro"}
              className="p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            >
              {darkMode ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-neutral-700" />
              )}
            </button>

            {/* Role Switcher Pill (Quick Switch Demo User) */}
            <div className="hidden sm:flex items-center space-x-1 p-1 bg-neutral-100 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
              <button
                onClick={() => switchUserRole("ALUNO")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 ${
                  currentUser.role === "ALUNO"
                    ? "bg-white dark:bg-neutral-700 text-[#00843D] dark:text-green-400 shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900"
                }`}
                title="Simular Aluno"
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>Aluno</span>
              </button>
              <button
                onClick={() => switchUserRole("SERVIDOR")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 ${
                  currentUser.role === "SERVIDOR"
                    ? "bg-white dark:bg-neutral-700 text-[#00843D] dark:text-green-400 shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900"
                }`}
                title="Simular Servidor/Professor"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Servidor</span>
              </button>
              <button
                onClick={() => switchUserRole("ADMIN")}
                className={`px-2 py-1 rounded-lg text-[11px] font-bold transition-colors flex items-center space-x-1 ${
                  currentUser.role === "ADMIN"
                    ? "bg-[#00843D] text-white shadow-xs"
                    : "text-neutral-500 dark:text-neutral-400 hover:text-neutral-900"
                }`}
                title="Simular Administrador"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin</span>
              </button>
            </div>

            {/* Profile Avatar Trigger */}
            <button
              onClick={() => handleNavClick("profile")}
              className="flex items-center space-x-2 pl-2 cursor-pointer focus:outline-none"
            >
              <img
                src={currentUser.avatarUrl}
                alt={currentUser.name}
                className="w-8 h-8 rounded-full object-cover border-2 border-[#00843D]"
              />
            </button>

            {/* Mobile menu hamburger button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-neutral-200 dark:border-neutral-800 bg-white dark:bg-[#181818] px-4 pt-3 pb-6 space-y-2">
          <button
            onClick={() => handleNavClick("home")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "home"
                ? "bg-[#00843D]/10 text-[#00843D] font-bold"
                : "text-neutral-700 dark:text-neutral-200"
            }`}
          >
            <Home className="w-5 h-5 text-[#00843D]" />
            <span>Início</span>
          </button>

          <button
            onClick={() => handleNavClick("lost")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "lost"
                ? "bg-[#EF4444]/10 text-[#EF4444] font-bold"
                : "text-neutral-700 dark:text-neutral-200"
            }`}
          >
            <PackageSearch className="w-5 h-5 text-[#EF4444]" />
            <span>Objetos Perdidos</span>
          </button>

          <button
            onClick={() => handleNavClick("found")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "found"
                ? "bg-[#22C55E]/10 text-[#22C55E] font-bold"
                : "text-neutral-700 dark:text-neutral-200"
            }`}
          >
            <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
            <span>Objetos Encontrados</span>
          </button>

          <div className="grid grid-cols-2 gap-2 pt-2">
            <button
              onClick={() => handleRegisterClick("PERDIDO")}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#EF4444]/10 text-[#EF4444] font-bold text-xs border border-[#EF4444]/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Perdido</span>
            </button>
            <button
              onClick={() => handleRegisterClick("ENCONTRADO")}
              className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-[#00843D] text-white font-bold text-xs shadow-xs"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Cadastrar Encontrado</span>
            </button>
          </div>

          <button
            onClick={() => handleNavClick("dashboard")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "dashboard"
                ? "bg-amber-500/10 text-amber-600 font-bold"
                : "text-neutral-700 dark:text-neutral-200"
            }`}
          >
            <LayoutDashboard className="w-5 h-5 text-amber-500" />
            <span>Dashboard Administrativo</span>
          </button>

          <button
            onClick={() => handleNavClick("profile")}
            className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
              activeTab === "profile"
                ? "bg-[#00843D]/10 text-[#00843D] font-bold"
                : "text-neutral-700 dark:text-neutral-200"
            }`}
          >
            <UserCheck className="w-5 h-5 text-[#00843D]" />
            <span>Meu Perfil ({currentUser.role})</span>
          </button>

          {/* Role switcher for mobile */}
          <div className="pt-3 border-t border-neutral-200 dark:border-neutral-800">
            <p className="text-xs font-semibold text-neutral-400 mb-2">Simular Usuário:</p>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => switchUserRole("ALUNO")}
                className={`py-1.5 text-center text-xs font-bold rounded-lg ${
                  currentUser.role === "ALUNO"
                    ? "bg-[#00843D] text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Aluno
              </button>
              <button
                onClick={() => switchUserRole("SERVIDOR")}
                className={`py-1.5 text-center text-xs font-bold rounded-lg ${
                  currentUser.role === "SERVIDOR"
                    ? "bg-[#00843D] text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Servidor
              </button>
              <button
                onClick={() => switchUserRole("ADMIN")}
                className={`py-1.5 text-center text-xs font-bold rounded-lg ${
                  currentUser.role === "ADMIN"
                    ? "bg-[#00843D] text-white"
                    : "bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300"
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
