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
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import {
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
} from "firebase/auth";
import {
  db,
  auth,
  googleProvider,
  handleFirestoreError,
  OperationType,
} from "../lib/firebase";

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
  loginWithGoogle: () => Promise<void>;
  loginWithEmailPassword: (email: string, pass: string) => Promise<void>;
  registerWithEmailPassword: (
    email: string,
    pass: string,
    userData: Omit<User, "id">
  ) => Promise<void>;
  updateUserProfileData: (updatedUser: User) => Promise<void>;
  logout: () => Promise<void>;
  firebaseUser: FirebaseUser | null;
  authModalOpen: boolean;
  setAuthModalOpen: (open: boolean) => void;
  claims: ItemClaim[];
  notifications: NotificationItem[];
  darkMode: boolean;
  toggleDarkMode: () => void;
  activeTab: "home" | "lost" | "found" | "register" | "dashboard" | "profile" | "image_analyzer";
  setActiveTab: (tab: "home" | "lost" | "found" | "register" | "dashboard" | "profile" | "image_analyzer") => void;
  prefilledItemFromAI: Partial<LostFoundItem> | null;
  setPrefilledItemFromAI: (data: Partial<LostFoundItem> | null) => void;
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

const LOCAL_STORAGE_THEME_KEY = "ifpr_achados_perdidos_theme";

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<LostFoundItem[]>([]);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Current User State
  const [currentUser, setCurrentUser] = useState<User>(() => MOCK_USERS[0]);

  // Claims state
  const [claims, setClaims] = useState<ItemClaim[]>([]);

  // Notifications state
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

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
    "home" | "lost" | "found" | "register" | "dashboard" | "profile" | "image_analyzer"
  >("home");

  const [prefilledItemFromAI, setPrefilledItemFromAI] = useState<Partial<LostFoundItem> | null>(null);

  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedItemForDetail, setSelectedItemForDetail] = useState<LostFoundItem | null>(null);
  const [qrScannerOpen, setQrScannerOpen] = useState(false);
  const [aiMatchAlert, setAiMatchAlert] = useState<{
    newItem: LostFoundItem;
    matches: AIMatchResult[];
  } | null>(null);
  const [registerTypeSelection, setRegisterTypeSelection] = useState<"PERDIDO" | "ENCONTRADO">("PERDIDO");
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = (text: string, type: "success" | "error" | "info" = "info") => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, text, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // Listen to Firebase Auth
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      setFirebaseUser(fbUser);
      if (fbUser) {
        try {
          const userSnap = await getDoc(doc(db, "users", fbUser.uid));
          const isAdminEmail =
            fbUser.email?.toLowerCase() === "paulocauan39@gmail.com" ||
            fbUser.email?.includes("carlos");

          if (userSnap.exists()) {
            const userData = userSnap.data() as User;
            if (isAdminEmail && userData.role !== "ADMIN") {
              userData.role = "ADMIN";
              await setDoc(doc(db, "users", fbUser.uid), { role: "ADMIN" }, { merge: true });
            }
            setCurrentUser(userData);
          } else {
            const userObj: User = {
              id: fbUser.uid,
              name: fbUser.displayName || (isAdminEmail ? "Paulo Cauan" : "Usuário IFPR"),
              email: fbUser.email || "",
              role: isAdminEmail ? "ADMIN" : fbUser.email?.includes("maria") ? "SERVIDOR" : "ALUNO",
              courseOrDept: isAdminEmail ? "Administração de TI & Campus Ivaiporã" : "Campus Ivaiporã",
              registrationNumber: fbUser.uid.substring(0, 10),
              avatarUrl: fbUser.photoURL || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
            };
            setCurrentUser(userObj);
            await setDoc(doc(db, "users", fbUser.uid), userObj, { merge: true });
          }
        } catch (e) {
          console.error("Erro ao carregar usuário no Firestore:", e);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  // Sync Items from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "items"),
      async (snapshot) => {
        if (snapshot.empty) {
          // Seed INITIAL_ITEMS
          try {
            for (const item of INITIAL_ITEMS) {
              await setDoc(doc(db, "items", item.id), item);
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, "items");
          }
        } else {
          const loadedItems: LostFoundItem[] = snapshot.docs.map((d) => d.data() as LostFoundItem);
          // Sort by creation date
          loadedItems.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setItems(loadedItems);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "items");
        setItems(INITIAL_ITEMS);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Claims from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "claims"),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            for (const claim of MOCK_CLAIMS) {
              await setDoc(doc(db, "claims", claim.id), claim);
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, "claims");
          }
        } else {
          const loadedClaims: ItemClaim[] = snapshot.docs.map((d) => d.data() as ItemClaim);
          setClaims(loadedClaims);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "claims");
        setClaims(MOCK_CLAIMS);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Notifications from Firestore
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, "notifications"),
      async (snapshot) => {
        if (snapshot.empty) {
          try {
            for (const notif of MOCK_NOTIFICATIONS) {
              await setDoc(doc(db, "notifications", notif.id), notif);
            }
          } catch (e) {
            handleFirestoreError(e, OperationType.WRITE, "notifications");
          }
        } else {
          const loadedNotifs: NotificationItem[] = snapshot.docs.map((d) => d.data() as NotificationItem);
          loadedNotifs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
          setNotifications(loadedNotifs);
        }
      },
      (error) => {
        handleFirestoreError(error, OperationType.GET, "notifications");
        setNotifications(MOCK_NOTIFICATIONS);
      }
    );
    return () => unsubscribe();
  }, []);

  // Sync Theme class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem(LOCAL_STORAGE_THEME_KEY, "light");
    }
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode((prev) => !prev);
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      addToast("Login realizado via Google com sucesso!", "success");
    } catch (e) {
      console.error("Erro no login via Google:", e);
      addToast("Falha ao realizar login no Google", "error");
      throw e;
    }
  };

  const loginWithEmailPassword = async (email: string, pass: string) => {
    try {
      const res = await signInWithEmailAndPassword(auth, email, pass);
      const userSnap = await getDoc(doc(db, "users", res.user.uid));
      if (userSnap.exists()) {
        setCurrentUser(userSnap.data() as User);
      }
      addToast(`Bem-vindo de volta! Login efetuado com sucesso.`, "success");
    } catch (e: any) {
      console.error("Erro no login por e-mail/senha:", e);
      addToast("Falha no login. Verifique e-mail e senha.", "error");
      throw e;
    }
  };

  const registerWithEmailPassword = async (
    email: string,
    pass: string,
    userData: Omit<User, "id">
  ) => {
    try {
      const res = await createUserWithEmailAndPassword(auth, email, pass);
      const isAdminEmail = email.toLowerCase() === "paulocauan39@gmail.com";
      const newUserObj: User = {
        id: res.user.uid,
        ...userData,
        email,
        role: isAdminEmail ? "ADMIN" : userData.role || "ALUNO",
        avatarUrl:
          userData.avatarUrl ||
          `https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80`,
      };
      setCurrentUser(newUserObj);
      await setDoc(doc(db, "users", res.user.uid), newUserObj);
      addToast("Cadastro realizado com sucesso! Dados salvos no Firestore.", "success");
    } catch (e: any) {
      console.error("Erro no cadastro por e-mail/senha:", e);
      addToast("Erro no cadastro. E-mail pode estar em uso ou dados inválidos.", "error");
      throw e;
    }
  };

  const updateUserProfileData = async (updatedUser: User) => {
    setCurrentUser(updatedUser);
    try {
      await setDoc(doc(db, "users", updatedUser.id), updatedUser, { merge: true });
      addToast("Perfil atualizado no banco de dados!", "success");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `users/${updatedUser.id}`);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(MOCK_USERS[0]);
      addToast("Sessão encerrada.", "info");
    } catch (e) {
      console.error("Erro ao sair:", e);
    }
  };

  const switchUserRole = (role: UserRole) => {
    const found = MOCK_USERS.find((u) => u.role === role);
    if (found) {
      setCurrentUser(found);
      addToast(`Sessão alterada para ${found.name} (${found.role})`, "info");
    }
  };

  // Add Item
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

    // Save item to Firestore
    try {
      await setDoc(doc(db, "items", newItem.id), newItem);
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `items/${newItem.id}`);
    }

    // AI Match check
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
      try {
        await setDoc(doc(db, "notifications", newNotif.id), newNotif);
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `notifications/${newNotif.id}`);
      }
      setAiMatchAlert({ newItem, matches: aiMatches });
    }

    addToast(`Objeto "${newItem.title}" cadastrado com sucesso no Firestore!`, "success");
    return { newItem, matches: aiMatches };
  };

  const updateItemStatus = async (id: string, status: ItemStatus) => {
    const isResolved = status === "DEVOLVIDO";
    const updates: Partial<LostFoundItem> = {
      status,
      resolutionDate: isResolved ? new Date().toISOString() : undefined,
    };
    try {
      await updateDoc(doc(db, "items", id), updates);
      addToast(`Status do objeto atualizado no Firestore para: ${status.replace("_", " ")}`, "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `items/${id}`);
    }
  };

  const deleteItem = async (id: string) => {
    try {
      await deleteDoc(doc(db, "items", id));
      addToast("Objeto removido do Firestore.", "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.DELETE, `items/${id}`);
    }
  };

  const submitClaim = async (itemId: string, verificationAnswer: string) => {
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

    try {
      await setDoc(doc(db, "claims", newClaim.id), newClaim);
      await updateItemStatus(itemId, "EM_ANALISE");

      const adminNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        userId: "u3",
        title: "Nova Solicitação de Devolução",
        message: `${currentUser.name} solicitou a devolução de "${item.title}".`,
        timestamp: new Date().toISOString(),
        read: false,
        type: "CLAIM_UPDATE",
        relatedItemId: itemId,
      };
      await setDoc(doc(db, "notifications", adminNotif.id), adminNotif);

      addToast("Solicitação salva no Firestore! A equipe do IFPR analisará a comprovação.", "success");
    } catch (e) {
      handleFirestoreError(e, OperationType.WRITE, `claims/${newClaim.id}`);
    }
  };

  const updateClaimStatus = async (claimId: string, status: ItemClaim["status"]) => {
    try {
      await updateDoc(doc(db, "claims", claimId), { status });
      addToast(`Solicitação marcada como ${status} no Firestore`, "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `claims/${claimId}`);
    }
  };

  const markNotificationRead = async (id: string) => {
    try {
      await updateDoc(doc(db, "notifications", id), { read: true });
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, `notifications/${id}`);
    }
  };

  const clearAllNotifications = async () => {
    try {
      for (const n of notifications) {
        if (!n.read) {
          await updateDoc(doc(db, "notifications", n.id), { read: true });
        }
      }
      addToast("Notificações marcadas como lidas.", "info");
    } catch (e) {
      handleFirestoreError(e, OperationType.UPDATE, "notifications");
    }
  };

  return (
    <AppContext.Provider
      value={{
        items,
        currentUser,
        setCurrentUser,
        switchUserRole,
        loginWithGoogle,
        loginWithEmailPassword,
        registerWithEmailPassword,
        updateUserProfileData,
        logout,
        firebaseUser,
        authModalOpen,
        setAuthModalOpen,
        claims,
        notifications,
        darkMode,
        toggleDarkMode,
        activeTab,
        setActiveTab,
        prefilledItemFromAI,
        setPrefilledItemFromAI,
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
