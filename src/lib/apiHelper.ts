import { LostFoundItem, ItemCategory } from "../types";
import { IFPR_LOCATIONS } from "../data/mockData";

export interface AIAnalysisResult {
  title: string;
  category: ItemCategory | string;
  color: string;
  brand: string;
  condition: string;
  distinctiveFeatures: string[];
  suggestedSecretHint: string;
  description: string;
}

export interface AIExtractedObject {
  title: string;
  category: ItemCategory | string;
  color: string;
  brand: string;
  location: string;
  description: string;
}

// Helper to safely perform API fetch without throwing SyntaxError on 404/non-JSON responses
export async function safeFetchJson<T>(
  url: string,
  options: RequestInit,
  fallbackGenerator: () => T
): Promise<T> {
  try {
    const res = await fetch(url, options);
    const contentType = res.headers.get("content-type");
    if (res.ok && contentType && contentType.includes("application/json")) {
      const data = await res.json();
      return data;
    } else {
      console.warn(`[API Notice] Route ${url} returned status ${res.status}. Using smart client fallback.`);
      return fallbackGenerator();
    }
  } catch (err) {
    console.warn(`[API Notice] Network issue accessing ${url}. Using smart client fallback:`, err);
    return fallbackGenerator();
  }
}

// Client-Side Smart Fallback for Text Prompt Analysis
export function clientAnalyzeObject(promptText: string): AIExtractedObject {
  const lower = (promptText || "").toLowerCase();

  // Category detection
  let category: ItemCategory = "Outros";
  if (/\b(iphone|samsung|celular|smartphone|fone|headphone|notebook|carregador|tablet|mouse|pen drive|eletrônico)\b/.test(lower)) {
    category = "Eletrônicos";
  } else if (/\b(rg|cpf|cnh|documento|carteira de estudante|cartão|cartao|passe|crachá|passaporte)\b/.test(lower)) {
    category = "Documentos & Cartões";
  } else if (/\b(casaco|moletom|jaqueta|camisa|camiseta|calça|tênis|tenis|sapato|boné|chapéu|meia|blusa)\b/.test(lower)) {
    category = "Roupas & Calçados";
  } else if (/\b(chave|chaveiro|segredo|cadeado)\b/.test(lower)) {
    category = "Chaves";
  } else if (/\b(livro|caderno|estojo|caneta|lápis|lapis|apostila|régua|mochila|pasta)\b/.test(lower)) {
    category = "Material Escolar & Livros";
  } else if (/\b(relógio|relogio|anel|brinco|corrente|colar|pulseira|óculos|oculos)\b/.test(lower)) {
    category = "Acessórios & Bijuterias";
  } else if (/\b(garrafa|copo|squeeze|marmita|tupperware|térmica|termica|caneca)\b/.test(lower)) {
    category = "Garrafas & Marmitas";
  } else if (/\b(guarda-chuva|sombrinha|sombrinha)\b/.test(lower)) {
    category = "Guarda-chuvas";
  }

  // Color detection
  let color = "Não informada";
  const colors = ["preto", "preta", "azul", "vermelho", "vermelha", "verde", "amarelo", "amarela", "rosa", "prata", "dourado", "dourada", "branco", "branca", "cinza", "roxo", "roxa"];
  for (const c of colors) {
    if (lower.includes(c)) {
      color = c.charAt(0).toUpperCase() + c.slice(1);
      break;
    }
  }

  // Brand detection
  let brand = "Não identificada";
  const brands = ["apple", "samsung", "casio", "nike", "adidas", "jbl", "tupperware", "kouda", "stanley", "motorola", "xiaomi", "lenovo", "dell", "hp", "ifpr"];
  for (const b of brands) {
    if (lower.includes(b)) {
      brand = b.toUpperCase();
      break;
    }
  }

  // Location detection
  let location = "Campus IFPR Ivaiporã";
  for (const loc of IFPR_LOCATIONS) {
    if (lower.includes(loc.toLowerCase())) {
      location = loc;
      break;
    }
  }

  // Title cleanup
  let title = promptText.trim();
  if (title.length > 40) {
    const words = title.split(" ");
    title = words.slice(0, 5).join(" ") + "...";
  }
  if (!title) title = "Objeto Achado/Perdido";

  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    category,
    color,
    brand,
    location,
    description: promptText.trim() || "Objeto registrado no Achados e Perdidos do IFPR Campus Ivaiporã.",
  };
}

// Client-Side Smart Fallback for Vision/Image Analysis
export function clientAnalyzeImage(customContext?: string): AIAnalysisResult {
  const extracted = clientAnalyzeObject(customContext || "Objeto detectado na imagem");
  return {
    title: extracted.title !== "Objeto Achado/Perdido" ? extracted.title : "Objeto Identificado na Foto",
    category: extracted.category,
    color: extracted.color !== "Não informada" ? extracted.color : "Cores visíveis na foto",
    brand: extracted.brand,
    condition: "Bom estado de conservação",
    distinctiveFeatures: ["Objeto capturado em alta resolução", "Detalhes visíveis na foto cadastrada"],
    suggestedSecretHint: "Verificar marcas no fundo ou marcas de uso internas",
    description: customContext
      ? `Objeto identificado na foto enviada: ${customContext}`
      : "Objeto verificado e catalogado no sistema Achados e Perdidos do IFPR Campus Ivaiporã.",
  };
}

// Client-Side Smart Fallback for AI Item Matching
export function clientMatchSimilarity(newItem: Partial<LostFoundItem>, candidateItems: LostFoundItem[]) {
  const matches = candidateItems
    .map((candidate) => {
      let score = 0;
      const reasons: string[] = [];

      if (newItem.category && candidate.category === newItem.category) {
        score += 40;
        reasons.push(`Mesma categoria (${newItem.category})`);
      }

      if (
        newItem.color &&
        candidate.color &&
        newItem.color.toLowerCase() !== "não informada" &&
        candidate.color.toLowerCase().includes(newItem.color.toLowerCase())
      ) {
        score += 25;
        reasons.push(`Mesma cor (${newItem.color})`);
      }

      if (
        newItem.brand &&
        candidate.brand &&
        newItem.brand.toLowerCase() !== "não identificada" &&
        candidate.brand.toLowerCase().includes(newItem.brand.toLowerCase())
      ) {
        score += 25;
        reasons.push(`Mesma marca (${newItem.brand})`);
      }

      if (newItem.title && candidate.title) {
        const titleWords = newItem.title.toLowerCase().split(/\s+/);
        const matchWord = titleWords.find((w) => w.length > 3 && candidate.title.toLowerCase().includes(w));
        if (matchWord) {
          score += 20;
          reasons.push(`Palavras-chave em comum no título`);
        }
      }

      if (score >= 40) {
        return {
          itemId: candidate.id,
          matchedItem: candidate,
          matchScore: Math.min(score, 95),
          reason: reasons.join(", ") || "Semelhança nos detalhes do pertence",
          matchedFeatures: reasons,
        };
      }
      return null;
    })
    .filter((m): m is NonNullable<typeof m> => m !== null)
    .sort((a, b) => b.matchScore - a.matchScore);

  return { success: true, matches };
}
