import { create } from "zustand";
import { persist } from "zustand/middleware";

/*
──────────────────────────────────────────────
CARD STORE
──────────────────────────────────────────────
Ele controla tudo que tem a ver com a ficha do personagem, incluindo:
  - Pontos totais (editável pelo usuário)
  - Vantagens / Desvantagens / Limitações / Ampliações / Perícias / Técnicas / Mágias
  - Atributos (base e atual)
  - Cálculo automático de pontos restantes
  - Histórico de "onde os pontos foram gastos" (para o popup)
  - Carregamento de dados da ficha para edição
  - Reset geral (útil ao trocar de ficha)
  - Raça selecionada e aplicação de modificadores de atributos
──────────────────────────────────────────────
*/

const Attributes = [
  "strength",
  "life",
  "dexterity",
  "health",
  "fatigue",
  "intelligence",
  "perception",
  "willing",
];

const attributesLabels = {
  strength: "Força",
  life: "Vida",
  dexterity: "Destreza",
  health: "Saúde",
  fatigue: "Fadiga",
  intelligence: "Inteligência",
  perception: "Percepção",
  willing: "Vontade",
};

// Helper: calcula o custo de um item considerando nível
function calculateCost(item, level = 1) {
  const base = Number(item.baseCost ?? 0);
  const variable = Number(item.variableCost ?? 0);

  if (!item.costIsVariable) return base;

  return base + level * variable;
}

function mapRelation(items = [], relationName) {
  return items.map((item) => ({
    ...item[relationName],
    level: item.level,
    currentCost: item.currentCost,
  }));
}

export const useCardStore = create(
  persist(
    (set, get) => ({
      // ──────────────────────────────────────────────
      // Pontos Totais (editável pelo usuário)
      // ──────────────────────────────────────────────
      totalPoints: 150,
      isEditing: false,

      setIsEditing: (value) => set({ isEditing: value }),

      setTotalPoints: (value) => set({ totalPoints: Number(value) || 0 }),

      //──────────────────────────────────────────────
      // Informações Básicas do personagem
      //──────────────────────────────────────────────

      name: "",
      age: "",
      height: "",
      history: "",
      race: "",
      raceId: null,
      gender: "",
      alignment: "",
      imageURL: "",
      imageBase64: "",
      imageFile: null,
      pendingCropImage: "",

      setName: (name) => set({ name }),
      setAge: (age) => set({ age }),
      setHeight: (height) => set({ height }),
      setHistory: (history) => set({ history }),
      setRace: (race, raceId) => set({ race, raceId }),
      setGender: (gender) => set({ gender }),
      setAlignment: (alignment) => set({ alignment }),
      setImageURL: (imageURL) => set({ imageURL }),
      setImageBase64: (imageBase64) => set({ imageBase64 }),
      setImageFile: (file) => set({ imageFile: file }),
      setPendingCropImage: (pendingCropImage) => set({ pendingCropImage }),

      //──────────────────────────────────────────────
      // ATRIBUTOS BASES (editável pelo usuário conforme a raça)
      //──────────────────────────────────────────────

      attributes: {
        strength: { base: 10, current: 10 },
        life: { base: 10, current: 10 },
        dexterity: { base: 10, current: 10 },
        health: { base: 10, current: 10 },
        fatigue: { base: 10, current: 10 },
        intelligence: { base: 10, current: 10 },
        perception: { base: 10, current: 10 },
        willing: { base: 10, current: 10 },
      },

      selectedRace: null,
      selectedRaceId: null,

      attributeMap: {
        ST: "strength",
        PV: "life",
        DX: "dexterity",
        HP: "health",
        HT: "fatigue",
        IQ: "intelligence",
        Per: "perception",
        Von: "willing",
      },

      applyRaceModifiers: (raceName, raceId, modifiers) => {
        const newAttributes = { ...useCardStore.getState().attributes };
        const attributeMap = useCardStore.getState().attributeMap;

        // Aplicar cada modificador
        modifiers.forEach((mod) => {
          const attributeKey = attributeMap[mod.attribute];
          if (attributeKey && newAttributes[attributeKey]) {
            newAttributes[attributeKey] = {
              ...newAttributes[attributeKey],
              base: mod.value,
              current: mod.value, // Atualiza também o current para o novo valor base
            };
          }
        });

        set({
          attributes: newAttributes,
          selectedRace: raceName,
          selectedRaceId: raceId,
        });
      },

      // Função para resetar atributos
      resetAttributes: () => {
        set({
          attributes: {
            strength: { base: 10, current: 10 },
            life: { base: 10, current: 10 },
            dexterity: { base: 10, current: 10 },
            health: { base: 10, current: 10 },
            fatigue: { base: 10, current: 10 },
            intelligence: { base: 10, current: 10 },
            perception: { base: 10, current: 10 },
            willing: { base: 10, current: 10 },
          },
          selectedRace: null,
          selectedRaceId: null,
        });
      },

      // Para alterar os atributos
      updateAttribute: (attribute, value) => {
        set((state) => ({
          attributes: {
            ...state.attributes,
            [attribute]: {
              ...state.attributes[attribute],
              current: Number(value),
            },
          },
        }));
      },

      // Para modificar os atributos base (as raças mudaram os atributos base)
      setAttributeBase: (attribute, value) => {
        set((state) => ({
          attributes: {
            ...state.attributes,
            [attribute]: {
              ...state.attributes[attribute],
              base: Number(value),
            },
          },
        }));
      },

      //──────────────────────────────────────────────
      // Carregar dados do card para quandor for editar
      //──────────────────────────────────────────────

      loadCard: (data) =>
        set({
          isEditing: true,

          // Informações básicas
          name: data.name ?? "",
          age: data.age ?? "",
          height: data.height ?? "",
          history: data.history ?? "",

          race: data.race?.name ?? "",
          raceId: data.race?.id ?? null,

          selectedRace: data.race?.name ?? null,
          selectedRaceId: data.race?.id ?? null,

          gender: data.gender ?? "masculino",
          alignment: data.alignment ?? "bom",

          imageURL: data.image ?? "",
          imageBase64: data.image ?? "",
          imageFile: null,
          pendingCropImage: "",

          totalPoints: data.totalPoints ?? 150,

          // Atributos
          attributes: {
            strength: {
              base: data.strength ?? 10,
              current: data.strength ?? 10,
            },
            life: {
              base: data.life ?? 10,
              current: data.life ?? 10,
            },
            dexterity: {
              base: data.dexterity ?? 10,
              current: data.dexterity ?? 10,
            },
            health: {
              base: data.health ?? 10,
              current: data.health ?? 10,
            },
            fatigue: {
              base: data.fatigue ?? 10,
              current: data.fatigue ?? 10,
            },
            intelligence: {
              base: data.intelligence ?? 10,
              current: data.intelligence ?? 10,
            },
            perception: {
              base: data.perception ?? 10,
              current: data.perception ?? 10,
            },
            willing: {
              base: data.willing ?? 10,
              current: data.willing ?? 10,
            },
          },

          // Vantagens
          advantages: (data.traits ?? [])
            .filter((item) => item.trait.isAdvantage)
            .map((item) => ({
              ...item.trait,
              level: item.level,
              currentCost: item.currentCost,
            })),

          // Desvantagens
          disadvantages: (data.traits ?? [])
            .filter((item) => !item.trait.isAdvantage)
            .map((item) => ({
              ...item.trait,
              level: item.level,
              currentCost: item.currentCost,
            })),

          // Demais listas
          limitations: mapRelation(data.limitations, "limitation"),
          expansions: mapRelation(data.expansions, "expansion"),
          expertises: mapRelation(data.expertises, "expertise"),
          techniques: mapRelation(data.techniques, "technique"),
          magics: mapRelation(data.magics, "magic"),
        }),

      // ──────────────────────────────────────────────
      // VANTAGENS
      // ──────────────────────────────────────────────
      advantages: [], // [{ id, name, baseCost, costIsVariable, variableCost, isAllowedLevel, maxLevel, level }]

      addAdvantage: (advantage, level = 1) => {
        const { advantages } = get();

        // Evita duplicar — se já existe, apenas atualiza o nível
        if (advantages.some((a) => a.id === advantage.id)) {
          get().updateAdvantageLevel(advantage.id, level);
          return;
        }

        set({
          advantages: [...advantages, { ...advantage, level }],
        });
      },

      removeAdvantage: (id) => {
        set((state) => ({
          advantages: state.advantages.filter((a) => a.id !== id),
        }));
      },

      updateAdvantageLevel: (id, level) => {
        set((state) => ({
          advantages: state.advantages.map((a) =>
            a.id === id ? { ...a, level } : a,
          ),
        }));
      },

      // ──────────────────────────────────────────────
      // DESVANTAGENS
      // ──────────────────────────────────────────────
      disadvantages: [],

      addDisadvantage: (disadvantage, level = 1) => {
        const { disadvantages } = get();

        if (disadvantages.some((d) => d.id === disadvantage.id)) {
          get().updateDisadvantageLevel(disadvantage.id, level);
          return;
        }

        set({
          disadvantages: [...disadvantages, { ...disadvantage, level }],
        });
      },

      removeDisadvantage: (id) => {
        set((state) => ({
          disadvantages: state.disadvantages.filter((d) => d.id !== id),
        }));
      },

      updateDisadvantageLevel: (id, level) => {
        set((state) => ({
          disadvantages: state.disadvantages.map((d) =>
            d.id === id ? { ...d, level } : d,
          ),
        }));
      },

      // ──────────────────────────────────────────────
      // LIMITAÇÕES
      // ──────────────────────────────────────────────
      limitations: [],

      addLimitation: (limitation, level = 1) => {
        const { limitations } = get();

        if (limitations.some((l) => l.id === limitation.id)) {
          get().updateLimitationLevel(limitation.id, level);
          return;
        }

        set({
          limitations: [...limitations, { ...limitation, level }],
        });
      },

      removeLimitation: (id) => {
        set((state) => ({
          limitations: state.limitations.filter((l) => l.id !== id),
        }));
      },

      updateLimitationLevel: (id, level) => {
        set((state) => ({
          limitations: state.limitations.map((l) =>
            l.id === id ? { ...l, level } : l,
          ),
        }));
      },

      // ──────────────────────────────────────────────
      // AMPLIAÇÕES
      // ──────────────────────────────────────────────
      expansions: [],

      addExpansion: (expansion, level = 1) => {
        const { expansions } = get();

        if (expansions.some((e) => e.id === expansion.id)) {
          get().updateExpansionLevel(expansion.id, level);
          return;
        }

        set({
          expansions: [...expansions, { ...expansion, level }],
        });
      },

      removeExpansion: (id) => {
        set((state) => ({
          expansions: state.expansions.filter((e) => e.id !== id),
        }));
      },

      updateExpansionLevel: (id, level) => {
        set((state) => ({
          expansions: state.expansions.map((e) =>
            e.id === id ? { ...e, level } : e,
          ),
        }));
      },

      // ──────────────────────────────────────────────
      // PERÍCIAS
      // ──────────────────────────────────────────────
      expertises: [],

      addExpertise: (expertise, level = 1) => {
        const { expertises } = get();

        if (expertises.some((e) => e.id === expertise.id)) {
          get().updateExpertiseLevel(expertise.id, level);
          return;
        }

        set({
          expertises: [...expertises, { ...expertise, level }],
        });
      },

      removeExpertise: (id) => {
        set((state) => ({
          expertises: state.expertises.filter((e) => e.id !== id),
        }));
      },

      updateExpertiseLevel: (id, level) => {
        set((state) => ({
          expertises: state.expertises.map((e) =>
            e.id === id ? { ...e, level } : e,
          ),
        }));
      },

      // ──────────────────────────────────────────────
      // Técnica
      // ──────────────────────────────────────────────
      techniques: [],

      addTechnique: (technique, level = 1) => {
        const { techniques } = get();

        if (techniques.some((e) => e.id === technique.id)) {
          get().updateTechniqueLevel(technique.id, level);
          return;
        }

        set({
          techniques: [...techniques, { ...technique, level }],
        });
      },

      removeTechnique: (id) => {
        set((state) => ({
          techniques: state.techniques.filter((e) => e.id !== id),
        }));
      },

      updateTechniqueLevel: (id, level) => {
        set((state) => ({
          techniques: state.techniques.map((e) =>
            e.id === id ? { ...e, level } : e,
          ),
        }));
      },

      // ──────────────────────────────────────────────
      // Mágias
      // ──────────────────────────────────────────────
      magics: [],

      addMagic: (magic, level = 1) => {
        const { magics } = get();

        if (magics.some((e) => e.id === magic.id)) {
          get().updateSpellLevel(magic.id, level);
          return;
        }

        set({
          magics: [...magics, { ...magic, level }],
        });
      },

      removeMagic: (id) => {
        set((state) => ({
          magics: state.magics.filter((e) => e.id !== id),
        }));
      },

      updateMagicLevel: (id, level) => {
        set((state) => ({
          magics: state.magics.map((e) => (e.id === id ? { ...e, level } : e)),
        }));
      },

      // ──────────────────────────────────────────────
      // RESET GERAL (útil ao trocar de ficha)
      // ──────────────────────────────────────────────
      resetCard: () =>
        set({
          isEditing: false,
          name: "",
          age: "",
          height: "",
          history: "",
          race: "",
          raceId: null,
          selectedRace: null,
          selectedRaceId: null,
          gender: "",
          alignment: "",
          imageURL: "",
          imageBase64: "",
          imageFile: null,
          pendingCropImage: "",
          totalPoints: 150,
          attributes: {
            strength: { base: 10, current: 10 },
            life: { base: 10, current: 10 },
            dexterity: { base: 10, current: 10 },
            health: { base: 10, current: 10 },
            fatigue: { base: 10, current: 10 },
            intelligence: { base: 10, current: 10 },
            perception: { base: 10, current: 10 },
            willing: { base: 10, current: 10 },
          },
          advantages: [],
          disadvantages: [],
          limitations: [],
          expansions: [],
          expertises: [],
          techniques: [],
          magics: [],
        }),
    }),

    {
      name: "card-storage",
      partialize: (state) => ({
        name: state.name,
        race: state.race,
        history: state.history,
        imageURL: state.imageURL,
        imageBase64: state.imageBase64,
        pendingCropImage: state.pendingCropImage,
        attributes: state.attributes,
        advantages: state.advantages,
        disadvantages: state.disadvantages,
        expansions: state.expansions,
        limitations: state.limitations,
        expertises: state.expertises,
        techniques: state.techniques,
        magics: state.magics,
      }),
    },
  ),
);

// ──────────────────────────────────────────────
// SELETORES DERIVADOS
// ──────────────────────────────────────────────
// Esses não fazem parte do estado bruto — são calculados
// a partir dele. Use-os nos componentes que precisam dos
// totais e do extrato de gastos.
// ──────────────────────────────────────────────

/*──────────────────────────────────────────────
 Retorna um array unificado de "gastos": cada vantagem, desvantagem, limitação e etc. vira uma linha com { label, cost, level }.
 Desvantagens e limitações têm baseCost negativo, então o cálculo de soma já funciona naturalmente.
 ──────────────────────────────────────────────*/
export function getSpendingBreakdown(state) {
  const breakdown = [];

  state.advantages.forEach((adv) => {
    breakdown.push({
      id: adv.id,
      label: adv.name,
      cost: calculateCost(adv, adv.level),
      level: adv.level,
      isAllowedLevel: adv.isAllowedLevel,
    });
  });

  state.disadvantages.forEach((dis) => {
    breakdown.push({
      id: dis.id,
      label: dis.name,
      cost: calculateCost(dis, dis.level),
      level: dis.level,
      isAllowedLevel: dis.isAllowedLevel,
    });
  });

  state.expansions.forEach((exp) => {
    breakdown.push({
      id: exp.id,
      label: exp.name,
      cost: calculateCost(exp, exp.level),
      level: exp.level,
      isAllowedLevel: exp.isAllowedLevel,
    });
  });

  state.limitations.forEach((lim) => {
    breakdown.push({
      id: lim.id,
      label: lim.name,
      cost: calculateCost(lim, lim.level),
      level: lim.level,
      isAllowedLevel: lim.isAllowedLevel,
    });
  });

  state.techniques.forEach((tec) => {
    breakdown.push({
      id: tec.id,
      label: tec.name,
      cost: calculateCost(tec, tec.level),
      level: tec.level,
      isAllowedLevel: tec.isAllowedLevel,
    });
  });

  state.expertises.forEach((ext) => {
    breakdown.push({
      id: ext.id,
      label: ext.name,
      cost: calculateCost(ext, ext.level),
      level: ext.level,
      isAllowedLevel: ext.isAllowedLevel,
    });
  });

  state.magics.forEach((mag) => {
    breakdown.push({
      id: mag.id,
      label: mag.name,
      cost: calculateCost(mag, mag.level),
      level: mag.level,
      isAllowedLevel: mag.isAllowedLevel,
    });
  });

  // ──────────────────────────────────────────────
  // ATRIBUTOS
  // ──────────────────────────────────────────────
  Object.entries(state.attributes).forEach(([key, attr]) => {
    const difference = attr.current - attr.base;

    if (difference !== 0) {
      breakdown.push({
        id: key,
        label: `${attributesLabels[key]} (${attr.base} → ${attr.current})`,
        cost: difference * 10,
        value: difference,
        type: "attribute",
      });
    }
  });

  return breakdown;
}

//──────────────────────────────────────────────
// Soma de todos os gastos em atributos (positivos e negativos).
//──────────────────────────────────────────────
export function getAttributesSpent(state) {
  return Object.values(state.attributes).reduce(
    (total, attr) => total + (attr.current - attr.base) * 0,
    0,
  );
}

//──────────────────────────────────────────────
// Soma de todos os gastos (vantagens, desvantagens, atributos, etc).
//──────────────────────────────────────────────
export function getTotalSpent(state) {
  // Gastos em vantagens/desvantagens/perícias e etc...
  const normalSpent = getSpendingBreakdown(state).reduce(
    (sum, item) => sum + item.cost,
    0,
  );

  // Gastos em Atributos
  const attributesSpent = getAttributesSpent(state);

  // Retorna o total gasto somando os atributos + vantagens/desvantagens
  return normalSpent + attributesSpent;
}

/*──────────────────────────────────────────────
 Pontos restantes = totalPoints - gastos.
 Como desvantagens têm custo negativo, elas "devolvem" pontos
 naturalmente (ex: -50 de "Cego" vira +50 disponíveis).
 ──────────────────────────────────────────────*/
export function getRemainingPoints(state) {
  return state.totalPoints - getTotalSpent(state);
}
