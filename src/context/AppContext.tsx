import React, { createContext, useContext, useState, useEffect } from "react";
import {
  LostFoundItem,
  User,
  NotificationItem,
  ItemClaim,
  ItemStatus,
  AIMatchResult,
  UserRole,
} from "../types";
import { INITIAL_ITEMS, MOCK_USERS, MOCK_NOTIFICATIONS, MOCK_CLAIMS } from "../data/mockData";

interface Toast {
  id: string;
  type: "success" | "error" | "info";
  text: string;
}

interface AppContextType {
  items: LostFoundItem[];
  currentUser: User;
  setCurrentUser: (user: User) => void;
  switchUserRole: (role: UserRole) => void;
  claims: ItemClaim[];
  notifications: NotificationItem[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: "home" | "lost" | "found" | "register" | "dashboard" | "profile";
  setActiveTab: (tab: "home" | "lost" | "found" | "register" | "dashboard" | "profile") => void;
  selectedItemForDetail: LostFoundItem | null;
  setSelectedItemForDetail: (item: LostFoundItem | null) => void;
  addItem: (
    itemData: Omit<LostFoundItem, "id" | "createdAt" | "qrCodeId" | "registeredByUserId" | "registeredByName" | "registeredByRole">
  ) => Promise<{ newItem: LostFoundItem; matches: AIMatchResult[] }>;
  updateItemStatus: (id: string, status: ItemStatus) => void;
  deleteItem: (id: string) => void;
  submitClaim: (itemId: string, verificationAnswer: string) => void;
  updateClaimStatus: (claimId: string, status: ItemClaim["status"]) => void;
  markNotificationRead: (id: string) => void;
  clearAllNotifications: () => void;
  qrScannerOpen: boolean;
  setQrScannerOpen: (open: boolean) => void;
  aiMatchAlert: { newItem: LostFoundItem; matches: AIMatchResult[] } | null;
  setAiMatchAlert: (val: { newItem: LostFoundItem; matches: AIMatchResult[] } | null) => void;
  toasts: Toast[];
  addToast: (text: string, type?: "success" | "error" | "info") => void;
  registerTypeSelection: "PERDIDO" | "ENCONTRADO";
  setRegisterTypeSelection: (type: "PERDIDO" | "ENCONTRADO") => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const LOCAL_STORAGE_ITEMS_KEY = "ifpr_achados_perdidos_items";
const LOCAL_STORAGE_THEME_KEY = "ifpr_achados_perdidos_theme";
const LOCAL_STORAGE_USER_KEY = "ifpr_achados_perdidos_user";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Items State
  const [items, setItems] = useState<LostFoundItem[]>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Erro ao carregar itens do localStorage:", e);
      }
    }
    return INITIAL_ITEMS;
  });

  // Current User State
  const [currentUser, setCurrentUser] = useState<User>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_USER_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {}
    }
    return MOCK_USERS[0]; // Default Aluno
  });

  // Claims state
  const [claims, setClaims] = useState<ItemClaim[]>(MOCK_CLAIMS);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>(MOCK_NOTIFICATIONS);

  // Theme State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(LOCAL_STORAGE_THEME_KEY);
    if (saved !== null) {
      return saved === "dark";
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches;
  });

  // Active view tab
  const [activeTab, setActiveTab] = useState<
    "home" | "lost" | "found" | "register" | "dashboard" | "profile"
  >("home");

  // Selected item modal details
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<LostFoundItem | null>(null);

  // QR Code Scanner modal state
  const [qrScannerOpen, setQrScannerOpen] = useState(false);

  // AI Match alert popup modal
  const [aiMatchAlert, setAiMatchAlert] = useState<{
    newItem: LostFoundItem;
    matches: AIMatchResult[];
  } | null>(null);

  // Register form type pre-selection
  const [registerTypeSelection, setRegisterTypeSelection] = useState<"PERDIDO" | "ENCONTRADO">("PERDIDO");

  // Toasts
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (text: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Sync Items to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  }, [items]);

  // Sync Theme class to document root element & localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, "light");
    }
  }, [darkMode]);

  // Sync User to localStorage
  useEffect(() => {
    localStorage.setItem(LOCAL_STORAGE_USER_KEY, JSON.stringify(currentUser));
  }, [currentUser]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const switchUserRole = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      addToast(`Sessão alterada para ${found.name} (${found.role})`, "info");
    }
  };

  // Add Item with automatic server-side AI similarity comparison
  const addItem = async (
    itemData: Omit<LostFoundItem, "id" | "createdAt" | "qrCodeId" | "registeredByUserId" | "registeredByName" | "registeredByRole">
  ): Promise<{ newItem: LostFoundItem; matches: AIMatchResult[] }> => {
    const uniqueNum = Math.floor(100 + Math.random() * 900);
    const newItemId = `ifpr-${uniqueNum}`;
    const qrCodeId = `QR-IFPR-${uniqueNum}-${itemData.title.substring(0, 10).toUpperCase().replace(/\s+/g, "")}`;

    const newItem: LostFoundItem = {
      ...itemData,
      id: newItemId,
      createdAt: new Date().toISOString(),
      qrCodeId,
      registeredByUserId: currentUser.id,
      registeredByName: currentUser.name,
      registeredByRole: currentUser.role,
      status: itemData.type === "PERDIDO" ? "PERDIDO" : "ENCONTRADO",
    };

    // Find candidate counterpart items in memory (e.g., if new item is PERDIDO, search ENCONTRADO)
    const counterpartType = newItem.type === "PERDIDO" ? "ENCONTRADO" : "PERDIDO";
    const candidates = items.filter(
      (it) => it.type === counterpartType && it.status !== "DEVOLVIDO"
    );

    let aiMatches: AIMatchResult[] = [];

    if (candidates.length > 0) {
      try {
        const res = await fetch("/api/ai/match-similarity", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ newItem, candidateItems: candidates }),
        });
        const data = await res.json();
        if (data.matches && Array.isArray(data.matches)) {
          aiMatches = data.matches
            .map((m: any) => {
              const matchedItem = items.find((it) => it.id === m.itemId);
              if (!matchedItem) return null;
              return {
                matchScore: m.matchScore,
                matchedItem,
                reason: m.reason,
                matchedFeatures: m.matchedFeatures || [],
              };
            })
            .filter((m: any): m is AIMatchResult => m !== null && m.matchScore >= 50);
        }
      } catch (err) {
        console.error("Erro no teste de IA de similaridade:", err);
      }
    }

    setItems((prev) => [newItem, ...prev]);

    // If matches found, add a notification for the user
    if (aiMatches.length > 0) {
      const topMatch = aiMatches[0];
      const newNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: currentUser.id,
        title: "Correspondência de IA Identificada!",
        message: `A IA encontrou ${topMatch.matchScore}% de similaridade com: ${topMatch.matchedItem.title}`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "MATCH",
        relatedItemId: topMatch.matchedItem.id,
      };
      setNotifications((prev) => [newNotif, ...prev]);
      setAiMatchAlert({ newItem, matches: aiMatches });
    }

    addToast(`Objeto "${newItem.title}" cadastrado com sucesso!`, "success");
    return { newItem, matches: aiMatches };
  };

  const updateItemStatus = (id: string, status: ItemStatus) => {
    setItems((prev) =>
      prev.map((it) => {
        if (it.id === id) {
          const isResolved = status === "DEVOLVIDO";
          return {
            ...it,
            status,
            resolutionDate: isResolved ? new Date().toISOString() : it.resolutionDate,
          };
        }
        return it;
      })
    );
    addToast(`Status do objeto atualizado para: ${status.replace("_", " ")}`, "info");
  };

  const deleteItem = (id: string) => {
    setItems((prev) => prev.filter((it) => it.id !== id));
    addToast("Objeto removido do sistema.", "info");
  };

  const submitClaim = (itemId: string, verificationAnswer: string) => {
    const item = items.find((i) => i.id === itemId);
    if (!item) return;

    const newClaim: ItemClaim = {
      id: `claim-${Date.now()}`,
      itemId,
      itemTitle: item.title,
      claimerId: currentUser.id,
      claimerName: currentUser.name,
      claimerEmail: currentUser.email,
      claimerRole: currentUser.role,
      verificationAnswer,
      status: "PENDENTE",
      createdAt: new Date().toISOString(),
    };

    setClaims((prev) => [newClaim, ...prev]);

    // Update item status to EM_ANALISE
    updateItemStatus(itemId, "EM_ANALISE");

    // Add notification for admins and finder
    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: "u3", // Admin
      title: "Nova Solicitação de Devolução",
      message: `${currentUser.name} solicitou a devolução de "${item.title}".`,
      timestamp: new Date().toISOString(),
      read: false,
      type: "CLAIM_UPDATE",
      relatedItemId: itemId,
    };
    setNotifications((prev) => [adminNotif, ...prev]);

    addToast("Solicitação enviada com sucesso! A equipe do IFPR analisará a comprovação.", "success");
  };

  const updateClaimStatus = (claimId: string, status: ItemClaim["status"]) => {
    setClaims((prev) =>
      prev.map((c) => (c.id === claimId ? { ...c, status } : c))
    );
    addToast(`Solicitação marcada como ${status}`, "info");
  };

  const markNotificationRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAllNotifications = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    addToast("Notificações marcadas como lidas.", "info");
  };

  return (
    <AppContext.Provider
      value={{
        items,
        currentUser,
        setCurrentUser,
        switchUserRole,
        claims,
        notifications,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        selectedItemForDetail,
        setSelectedItemForDetail,
        addItem,
        updateItemStatus,
        deleteItem,
        submitClaim,
        updateClaimStatus,
        markNotificationRead,
        clearAllNotifications,
        qrScannerOpen,
        setQrScannerOpen,
        aiMatchAlert,
        setAiMatchAlert,
        toasts,
        addToast,
        registerTypeSelection,
        setRegisterTypeSelection,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("useApp deve ser usado dentro de AppProvider");
  }
  return context;
};
