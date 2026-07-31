import { useState, useEffect } from "react";
import { getMagics } from "../../services/api";
import { useCardStore } from "../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';


import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";

import "../../styles/modals/modalAdd.css";
import Loading from "../loading";

export default function MagicModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [filterMagics, setFilterMagics] = useState("");
  const [magic, setMagic] = useState([]);
  const [levels, setLevels] = useState({});
  const [showMagics, setShowMagics] = useState(false);
  const [loading, setLoading] = useState(true);


  const [filters, setFilters] = useState({
    Air: false,
    BodyControl: false,
    CommunicationandEmpathy: false,
    Displacement: false,
    Earth: false,
    Enchantment: false,
    Fire: false,
    Healing: false,
    LightandDark: false,
    Metamagic: false,
    MindControl: false,
    Necromancy: false,
    Portal: false,
    ProtectionandWarning: false,
    Recognition: false,
    Water: false,
  });
  // ──────────────────────────────────────────────
  // Store
  // ──────────────────────────────────────────────
  const selectedMagic = useCardStore((state) => state.magics);
  const addMagic = useCardStore((state) => state.addMagic);
  const removeMagic = useCardStore((state) => state.removeMagic);

  const selectedIds = new Set(selectedMagic.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getMagics();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setMagic(data);

        const initial = {};
        data.forEach((mag) => {
          initial[mag.id] = 1;
        });

        setLevels(initial);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const activeFilters = Object.entries(filters)
    .filter(([, active]) => active)
    .map(([key]) => key);

  const filtered = magic.filter((mag) => {
    const name = mag.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType =
      activeFilters.length === 0
        ? true
        : activeFilters.some((type) => hasType(mag, type));

    return matchesName && matchesType;
  });

  // ──────────────────────────────────────────────
  // Habilitar Filtro
  // ──────────────────────────────────────────────
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // ──────────────────────────────────────────────
  // Mostrar Filtro
  // ──────────────────────────────────────────────
  function showFilters() {
    setShowMagics((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(mag, typeName) {
    return mag.types?.some((type) => type.type?.name === typeName);
  }

  // ──────────────────────────────────────────────
  // Inserir Nível
  // ──────────────────────────────────────────────
  function increaseLevel(mag) {
    if (!mag.isAllowedLevel) return;

    const current = levels[mag.id] ?? 1;

    if (current >= (mag.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [mag.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(mag.id)) {
      addMagic(mag, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(mag) {
    if (!mag.isAllowedLevel) return;

    const current = levels[mag.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [mag.id]: newLevel }));

    if (selectedIds.has(mag.id)) {
      addMagic(mag, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(mag) {
    const level = levels[mag.id] ?? 1;

    const base = Number(mag.baseCost ?? 0);
    const variable = Number(mag.variableCost ?? 0);

    if (!mag.costIsVariable) return base;

    return base + (level - 1) * variable;;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleMagic(mag) {
    if (selectedIds.has(mag.id)) {
      removeMagic(mag.id);
    } else {
      const level = levels[mag.id] ?? 1;
      addMagic(mag, level);
    }
  }

  // ──────────────────────────────────────────────
  // Tela de carregamento
  // ──────────────────────────────────────────────
  if (loading) {
    return (
      <Loading />
    );
  }

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adicionar Mágia</h2>
          <button className="close-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar Mágias..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar Vantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showMagics && (
          <div className="filters-magic">
            <button className={filters.Air ? "active" : ""} onClick={() => toggleFilter("Air")}>Ar</button>
            <button className={filters.Water ? "active" : ""} onClick={() => toggleFilter("Water")}>Água</button>
            <button className={filters.CommunicationandEmpathy ? "active" : ""} onClick={() => toggleFilter("CommunicationandEmpathy")}>Comunicação e Empatia</button>
            <button className={filters.BodyControl ? "active" : ""} onClick={() => toggleFilter("BodyControl")}>Controle Corporal</button>
            <button className={filters.MindControl ? "active" : ""} onClick={() => toggleFilter("MindControl")}>Controle Mental</button>
            <button className={filters.Healing ? "active" : ""} onClick={() => toggleFilter("Healing")}>Cura</button>
            <button className={filters.Displacement ? "active" : ""} onClick={() => toggleFilter("Displacement")}>Deslocamento</button>
            <button className={filters.Enchantment ? "active" : ""} onClick={() => toggleFilter("Enchantment")}>Encantamento</button>
            <button className={filters.Fire ? "active" : ""} onClick={() => toggleFilter("Fire")}>Fogo</button>
            <button className={filters.LightandDark ? "active" : ""} onClick={() => toggleFilter("LightandDark")}>Luz e Trevas</button>
            <button className={filters.Metamagic ? "active" : ""} onClick={() => toggleFilter("Metamagic")}>Metamagia</button>
            <button className={filters.Necromancy ? "active" : ""} onClick={() => toggleFilter("Necromancy")}>Necromancia</button>
            <button className={filters.Portal ? "active" : ""} onClick={() => toggleFilter("Portal")}>Portal</button>
            <button className={filters.ProtectionandWarning ? "active" : ""} onClick={() => toggleFilter("ProtectionandWarning")}>Proteção e Aviso</button>
            <button className={filters.Recognition ? "active" : ""} onClick={() => toggleFilter("Recognition")}>Reconhecimento</button>
            <button className={filters.Earth ? "active" : ""} onClick={() => toggleFilter("Earth")}>Terra</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((mag) => {
            const isSelected = selectedIds.has(mag.id);

            return (
              <li
                key={mag.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >
                <div className="top">
                  <h3>{mag.name}</h3>

                  <div className="types-container">
                    {mag.types?.map((type) => (
                      <span key={type.id} className="type">
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleMagic(mag)}
                    title={isSelected ? "Remover mágia" : "Adicionar mágia"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">{getCost(mag)} pts</div>

                  {mag.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(mag)}>-</button>
                      <span>{levels[mag.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(mag)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline
                    className="info-icon"
                    title={"Informações da mágia"}
                  />
                </div>

                <p>{mag.shortDescription}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
