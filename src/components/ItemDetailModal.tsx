import React, { useState } from "react";
import { LostFoundItem } from "../types";
import { useApp } from "../context/AppContext";
import { formatDate, formatDateTime } from "../lib/utils";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  MapPin,
  Calendar,
  Tag,
  ShieldCheck,
  User,
  QrCode,
  CheckCircle,
  AlertTriangle,
  Send,
  Download,
  Share2,
  Lock,
  MessageSquare,
  Building,
} from "lucide-react";

interface ItemDetailModalProps {
  item: LostFoundItem;
  onClose: () => void;
}

export const ItemDetailModal: React.FC<ItemDetailModalProps> = ({ item, onClose }) => {
  const { currentUser, submitClaim, updateItemStatus, addToast } = useApp();
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [verificationInput, setVerificationInput] = useState("");
  const [isSubmittingClaim, setIsSubmittingClaim] = useState(false);

  const allImages = [item.imageUrl, ...(item.additionalImages || [])];

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificationInput.trim()) {
      addToast("Por favor, descreva um detalhe que comprove que o objeto é seu.", "error");
      return;
    }
    setIsSubmittingClaim(true);
    setTimeout(() => {
      submitClaim(item.id, verificationInput);
      setIsSubmittingClaim(false);
      setClaimModalOpen(false);
      onClose();
    }, 600);
  };

  const handleMarkAsReturned = () => {
    updateItemStatus(item.id, "DEVOLVIDO");
    addToast(`Objeto "${item.title}" marcado como Devolvido com sucesso!`, "success");
    onClose();
  };

  const getStatusBadgeClass = (status: LostFoundItem["status"]) => {
    switch (status) {
      case "PERDIDO":
        return "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/30";
      case "ENCONTRADO":
        return "bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30";
      case "EM_ANALISE":
        return "bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/30";
      case "DEVOLVIDO":
        return "bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/30";
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-[#1E1E1E] rounded-3xl shadow-2xl border border-neutral-200 dark:border-neutral-800 overflow-hidden my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 dark:border-neutral-800 bg-neutral-50 dark:bg-[#181818]">
          <div className="flex items-center space-x-3">
            <span
              className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider border ${getStatusBadgeClass(
                item.status
              )}`}
            >
              {item.status.replace("_", " ")}
            </span>
            <span className="text-xs text-neutral-500 font-mono">ID: {item.id}</span>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full text-neutral-500 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Body */}
        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 max-h-[75vh] overflow-y-auto">
          {/* Left Column: Image Gallery & QR Code */}
          <div className="space-y-4">
            <div className="relative h-64 sm:h-80 w-full rounded-2xl bg-neutral-100 dark:bg-neutral-800 overflow-hidden border border-neutral-200 dark:border-neutral-800">
              <img
                src={allImages[activeImageIndex]}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Thumbnails if multiple */}
            {allImages.length > 1 && (
              <div className="flex space-x-2">
                {allImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      activeImageIndex === idx
                        ? "border-[#00843D] scale-105"
                        : "border-transparent opacity-60 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}

            {/* Campus Interactive Location Preview */}
            <div className="p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-200 dark:border-neutral-700/60 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-neutral-900 dark:text-white">
                <span className="flex items-center gap-1.5 text-[#00843D] dark:text-green-400">
                  <MapPin className="w-4 h-4" /> Mapa de Ocorrência no IFPR
                </span>
                <span className="text-[11px] text-neutral-500">Campus Ivaiporã</span>
              </div>
              <div className="relative h-32 rounded-xl bg-gradient-to-br from-green-50 to-emerald-100 dark:from-neutral-900 dark:to-neutral-800 border border-green-200/50 dark:border-neutral-700 flex flex-col items-center justify-center p-3 text-center overflow-hidden">
                {/* SVG Campus Building Pins visual simulation */}
                <div className="absolute inset-0 opacity-15 bg-[radial-[#00843D]_1px,transparent_1px] [background-size:12px_12px]" />
                <div className="z-10 bg-white dark:bg-neutral-900 px-3 py-1.5 rounded-xl shadow-md border border-[#00843D]/30 flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-[#00843D] animate-ping" />
                  <span className="font-bold text-xs text-neutral-900 dark:text-white">
                    {item.location}
                  </span>
                </div>
                <p className="z-10 text-[11px] text-neutral-500 dark:text-neutral-400 mt-2">
                  Ponto de entrega: Guarita Principal / Secretaria do Campus
                </p>
              </div>
            </div>

            {/* QR Code Container */}
            <div className="p-4 rounded-2xl bg-[#00843D]/5 dark:bg-[#00843D]/10 border border-[#00843D]/20 flex items-center space-x-4">
              <div className="p-2 bg-white rounded-xl shadow-xs shrink-0">
                <QRCodeSVG value={item.qrCodeId} size={72} level="H" />
              </div>
              <div>
                <h5 className="font-bold text-xs text-neutral-900 dark:text-white flex items-center gap-1">
                  <QrCode className="w-3.5 h-3.5 text-[#00843D]" /> Código Etiqueta QR
                </h5>
                <p className="text-[11px] text-neutral-600 dark:text-neutral-300 font-mono mt-0.5">
                  {item.qrCodeId}
                </p>
                <p className="text-[10px] text-neutral-500 mt-1">
                  Apresente este código no balcão de Achados e Perdidos do IFPR para liberação.
                </p>
              </div>
            </div>
          </div>

          {/* Right Column: Information & Actions */}
          <div className="space-y-5">
            <div>
              <div className="flex items-center space-x-2 text-xs font-bold text-[#00843D] dark:text-green-400 mb-1">
                <Tag className="w-3.5 h-3.5" />
                <span>{item.category}</span>
                <span>•</span>
                <span>{item.type}</span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 dark:text-white">
                {item.title}
              </h2>
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-400 block mb-0.5">Cor Predominante</span>
                <span className="font-bold text-neutral-900 dark:text-white">{item.color || "N/I"}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-400 block mb-0.5">Marca / Fabricante</span>
                <span className="font-bold text-neutral-900 dark:text-white">{item.brand || "N/I"}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-400 block mb-0.5">Data do Registro</span>
                <span className="font-bold text-neutral-900 dark:text-white">{formatDate(item.date)}</span>
              </div>
              <div className="p-3 rounded-xl bg-neutral-50 dark:bg-neutral-800">
                <span className="text-neutral-400 block mb-0.5">Cadastrado por</span>
                <span className="font-bold text-neutral-900 dark:text-white truncate block">
                  {item.registeredByName}
                </span>
              </div>
            </div>

            {/* Description Box */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500">
                Descrição Detalhada
              </h4>
              <p className="text-xs sm:text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed bg-neutral-50 dark:bg-neutral-800/80 p-3.5 rounded-xl border border-neutral-200 dark:border-neutral-700">
                {item.description}
              </p>
            </div>

            {/* Contact / Delivery instructions */}
            <div className="p-3.5 rounded-xl bg-blue-500/5 dark:bg-blue-500/10 border border-blue-500/20 space-y-1">
              <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400">
                <Building className="w-4 h-4" />
                <span>Instruções de Retirada / Contato</span>
              </div>
              <p className="text-xs text-neutral-600 dark:text-neutral-300">
                {item.contactInfo}
              </p>
            </div>

            {/* Timeline Progress */}
            <div className="space-y-2 pt-2 border-t border-neutral-200 dark:border-neutral-800">
              <h4 className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                Status de Tramitação no IFPR
              </h4>
              <div className="flex items-center justify-between text-[11px] font-semibold">
                <div className="flex items-center space-x-1 text-[#00843D] dark:text-green-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Cadastrado</span>
                </div>
                <div className={`flex items-center space-x-1 ${item.status === "DEVOLVIDO" ? "text-[#3B82F6]" : "text-neutral-400"}`}>
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Devolução Efetuada</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-4 space-y-2">
              {item.status !== "DEVOLVIDO" && (
                <button
                  onClick={() => setClaimModalOpen(true)}
                  className="w-full py-3 px-4 rounded-xl bg-[#00843D] hover:bg-[#006e33] text-white font-bold text-sm shadow-md shadow-[#00843D]/20 transition-all flex items-center justify-center space-x-2"
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span>Solicitar Este Objeto (Reclamar Posse)</span>
                </button>
              )}

              {/* Admin or Server privileges: Quick resolve button */}
              {(currentUser.role === "ADMIN" || currentUser.role === "SERVIDOR") && item.status !== "DEVOLVIDO" && (
                <button
                  onClick={handleMarkAsReturned}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs transition-colors flex items-center justify-center space-x-2"
                >
                  <CheckCircle className="w-4 h-4" />
                  <span>[Painel Admin] Marcar Automaticamente como Devolvido</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Claim Modal (Reclamar Posse) */}
      {claimModalOpen && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
          <div className="bg-white dark:bg-[#1E1E1E] rounded-3xl p-6 max-w-lg w-full border border-neutral-200 dark:border-neutral-800 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-200 dark:border-neutral-800 pb-3">
              <h3 className="font-bold text-base text-neutral-900 dark:text-white flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#00843D]" /> Comprovação de Posse
              </h3>
              <button
                onClick={() => setClaimModalOpen(false)}
                className="p-1.5 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-neutral-600 dark:text-neutral-300 leading-relaxed">
              Para evitar entregas indevidas, descreva detalhes específicos do objeto que somente você saberia (ex: conteúdo interno da mochila, marcação específica na capa, adesivo escondido, arranhão ou número de série).
            </p>

            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-neutral-700 dark:text-neutral-200 mb-1">
                  Sua Comprovação Detalhada *
                </label>
                <textarea
                  required
                  rows={4}
                  value={verificationInput}
                  onChange={(e) => setVerificationInput(e.target.value)}
                  placeholder="Exemplo: Na contracapa do caderno há uma anotação com a senha do Wi-Fi da biblioteca e o meu nome escrito à caneta azul..."
                  className="w-full p-3 rounded-xl border border-neutral-300 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800 text-neutral-900 dark:text-white text-xs focus:ring-2 focus:ring-[#00843D] outline-none"
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl text-[11px] text-amber-700 dark:text-amber-300 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Sua resposta será enviada para validação da Secretaria Acadêmica (SEBAC) do IFPR Campus Ivaiporã. Apresente seu documento com foto na retirada.
                </span>
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setClaimModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingClaim}
                  className="px-5 py-2 rounded-xl bg-[#00843D] hover:bg-[#006e33] text-white font-bold text-xs shadow-md flex items-center space-x-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmittingClaim ? "Enviando..." : "Confirmar Solicitação"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
