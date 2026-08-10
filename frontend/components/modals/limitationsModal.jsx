import { useState, useEffect } from "react";
import { getLimitations } from "../../services/api";
import { useCardStore } from "../../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";


import "../../styles/modals/modalAdd.css";

import Loading from "../loading";
import InfoModal from "./infoModal";

export default function LimitationsModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [limitations, setLimitations] = useState([]);
  const [levels, setLevels] = useState({});
  const [showLimitationsFilters, setShowLimitationsFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedLimitationId, setSelectedLimitationId] = useState(null);

  const [filters, setFilters] = useState({
    Physical: false,
    Mental: false,
    Social: false,
    Supernatural: false,
    Exotic: false,
  });

  // ──────────────────────────────────────────────
  // Store
  // ──────────────────────────────────────────────
  const selectedLimitations = useCardStore((state) => state.limitations);
  const addLimitations = useCardStore((state) => state.addLimitation);
  const removeLimitations = useCardStore((state) => state.removeLimitation);

  const selectedIds = new Set(selectedLimitations.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getLimitations();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setLimitations(data);

        const initial = {};
        data.forEach((lim) => {
          initial[lim.id] = 1;
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

  const activeFilters = Object.entries(filters).filter(([, active]) => active).map(([key]) => key);

  const filtered = limitations.filter((lim) => {
    const name = lim.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType =
      activeFilters.length === 0
        ? true
        : activeFilters.some((type) => hasType(lim, type));

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
    setShowLimitationsFilters((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(lim, typeName) {
    return lim.types?.some((type) => type.type?.name === typeName);
  }

  // ──────────────────────────────────────────────
  // Inserir Nível
  // ──────────────────────────────────────────────
  function increaseLevel(lim) {
    if (!lim.isAllowedLevel) return;

    const current = levels[lim.id] ?? 1;

    if (current >= (lim.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [lim.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(lim.id)) {
      addLimitations(lim, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(lim) {
    if (!lim.isAllowedLevel) return;

    const current = levels[lim.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [lim.id]: newLevel }));

    if (selectedIds.has(lim.id)) {
      addLimitations(lim, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(lim) {
    const level = levels[lim.id] ?? 1;

    const base = Number(lim.baseCost ?? 0);
    const variable = Number(lim.variableCost ?? 0);

    if (!lim.costIsVariable) return base;

    return base + (level - 1) * variable;;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleLimitations(lim) {
    if (selectedIds.has(lim.id)) {
      removeLimitations(lim.id);
    } else {
      const level = levels[lim.id] ?? 1;
      addLimitations(lim, level);
    }
  }


  function openInfoModal(limitationId) {
    setSelectedLimitationId(limitationId);
    setShowInfoModal(true);
  }

  function closeInfoModal() {
    setShowInfoModal(false);
    setSelectedLimitationId(null);
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
          <h2>Adicionar Limitação</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar limitações..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar Vantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showLimitationsFilters && (
          <div className="filters">
            <button className={filters.Physical ? "active" : ""} onClick={() => toggleFilter("Physical")}>Física</button>
            <button className={filters.Mental ? "active" : ""} onClick={() => toggleFilter("Mental")}>Mental</button>
            <button className={filters.Social ? "active" : ""} onClick={() => toggleFilter("Social")}>Social</button>
            <button className={filters.Supernatural ? "active" : ""} onClick={() => toggleFilter("Supernatural")}>Sobrenatural</button>
            <button className={filters.Exotic ? "active" : ""} onClick={() => toggleFilter("Exotic")}>Exótica</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((lim) => {
            const isSelected = selectedIds.has(lim.id);

            return (
              <li
                key={lim.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >

                <div className="top">
                  <h3>{lim.name}</h3>

                  <div className="types-container">
                    {lim.types?.map((type) => (
                      <span key={type.id} className="type">
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleLimitations(lim)}
                    title={isSelected ? "Remover limitação" : "Adicionar limitação"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">
                    {getCost(lim)} pts
                  </div>

                  {lim.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(lim)}>-</button>
                      <span>{levels[lim.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(lim)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline className="info-icon" title={"Informações da limitação"} onClick={() => openInfoModal(lim.id)} />
                </div>

                <p>{lim.shortDescription}</p>
              </li>
            );
          })}
        </ul>

      </div>
      {showInfoModal && <InfoModal onClose={closeInfoModal} Type="limitation" Id={selectedLimitationId} />}
    </div>
  );
}