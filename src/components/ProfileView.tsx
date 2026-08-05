import React, { useState } from "react";
import { useApp } from "../context/AppContext";
import { ItemCard } from "./ItemCard";
import { formatDate, formatDateTime } from "../lib/utils";
import {
  User as UserIcon,
  GraduationCap,
  Mail,
  Building2,
  ShieldCheck,
  PackageSearch,
  CheckCircle2,
  Clock,
  IdCard,
  Edit,
  Phone,
} from "lucide-react";

export const ProfileView: React.FC = () => {
  const {
    currentUser,
    switchUserRole,
    items,
    claims,
    setSelectedItemForDetail,
    addToast,
  } = useApp();

  const [activeTab, setActiveTab] = useState<"my_items" | "claims">("my_items");

  // User registered items
  const userItems = items.filter((it) => it.registeredByUserId === currentUser.id);

  // User claims
  const userClaims = claims.filter((c) => c.claimerId === currentUser.id);

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      {/* Profile Header Card */}
      <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 sm:p-8 border border-neutral-200 dark:border-neutral-800 shadow-sm flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
        {/* Avatar */}
        <div className="relative">
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="w-24 h-24 rounded-2xl object-cover border-4 border-[#00843D] shadow-md"
          />
          <span className="absolute -bottom-2 -right-2 px-2.5 py-0.5 rounded-full bg-[#00843D] text-white text-[10px] font-bold uppercase tracking-wide border-2 border-white dark:border-[#1E1E1E]">
            {currentUser.role}
          </span>
        </div>

        {/* User Details */}
        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
            <div>
              <h1 className="text-2xl font-bold text-neutral-900 dark:text-white">
                {currentUser.name}
              </h1>
              <p className="text-xs text-neutral-500 dark:text-neutral-400">
                {currentUser.courseOrDept}
              </p>
            </div>

            {/* Role switch prompt */}
            <div className="flex items-center space-x-1 justify-center">
              <span className="text-xs text-neutral-400 mr-1 font-semibold">Perfil Ativo:</span>
              <button
                onClick={() => switchUserRole(currentUser.role === "ALUNO" ? "SERVIDOR" : "ALUNO")}
                className="px-3 py-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 text-xs font-bold text-[#00843D] dark:text-green-400 hover:bg-[#00843D] hover:text-white transition-colors"
              >
                Mudar Função
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-3 text-xs text-neutral-600 dark:text-neutral-300 border-t border-neutral-100 dark:border-neutral-800">
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Mail className="w-4 h-4 text-[#00843D]" />
              <span className="truncate">{currentUser.email}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <IdCard className="w-4 h-4 text-[#00843D]" />
              <span>Matrícula: {currentUser.registrationNumber}</span>
            </div>
            <div className="flex items-center justify-center md:justify-start space-x-2">
              <Phone className="w-4 h-4 text-[#00843D]" />
              <span>{currentUser.phone || "(41) 99999-0000"}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center space-x-2 border-b border-neutral-200 dark:border-neutral-800 pb-3">
        <button
          onClick={() => setActiveTab("my_items")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === "my_items"
              ? "bg-[#00843D] text-white shadow-xs"
              : "bg-white dark:bg-[#1E1E1E] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <PackageSearch className="w-4 h-4" />
          <span>Meus Cadastros ({userItems.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("claims")}
          className={`px-4 py-2.5 rounded-xl text-xs font-extrabold flex items-center space-x-2 transition-all ${
            activeTab === "claims"
              ? "bg-[#00843D] text-white shadow-xs"
              : "bg-white dark:bg-[#1E1E1E] text-neutral-600 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-800"
          }`}
        >
          <ShieldCheck className="w-4 h-4" />
          <span>Minhas Solicitações ({userClaims.length})</span>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === "my_items" ? (
        <div className="space-y-4">
          {userItems.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
              <PackageSearch className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h3 className="font-bold text-base text-neutral-800 dark:text-white">
                Nenhum objeto cadastrado por você ainda.
              </h3>
              <p className="text-xs text-neutral-500">
                Caso tenha perdido ou encontrado um pertence no campus, faça o registro.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {userItems.map((item) => (
                <ItemCard key={item.id} item={item} onSelect={setSelectedItemForDetail} />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {userClaims.length === 0 ? (
            <div className="text-center py-12 bg-white dark:bg-[#1E1E1E] rounded-3xl border border-neutral-200 dark:border-neutral-800 p-8 space-y-3">
              <ShieldCheck className="w-12 h-12 text-neutral-300 dark:text-neutral-600 mx-auto" />
              <h3 className="font-bold text-base text-neutral-800 dark:text-white">
                Nenhuma solicitação de devolução efetuada.
              </h3>
              <p className="text-xs text-neutral-500">
                Ao solicitar a posse de um objeto encontrado, o histórico ficará listado aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {userClaims.map((claim) => (
                <div
                  key={claim.id}
                  className="p-5 rounded-2xl bg-white dark:bg-[#1E1E1E] border border-neutral-200 dark:border-neutral-800 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-sm text-neutral-900 dark:text-white">
                        {claim.itemTitle}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-extrabold uppercase ${
                          claim.status === "PENDENTE"
                            ? "bg-amber-500/10 text-amber-600"
                            : "bg-green-500/10 text-green-600"
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-500">
                      Sua comprovação: &quot;{claim.verificationAnswer}&quot;
                    </p>
                    <span className="text-[11px] text-neutral-400 block">
                      Solicitado em: {formatDateTime(claim.createdAt)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
