import { useState, useEffect } from "react";
import { getExpansions } from "../../services/api";
import { useCardStore } from "../../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";

import "../../styles/modals/modalAdd.css";

import Loading from "../loading";
import InfoModal from "./infoModal";

export default function ExpansionsModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [expansions, setExpansions] = useState([]);
  const [levels, setLevels] = useState({});
  const [showExpansionsFilters, setShowExpansionsFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedExpansionId, setSelectedExpansionId] = useState(null);


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
  const selectedExpansions = useCardStore((state) => state.expansions);
  const addExpansions = useCardStore((state) => state.addExpansion);
  const removeExpansions = useCardStore((state) => state.removeExpansion);

  const selectedIds = new Set(selectedExpansions.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getExpansions();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setExpansions(data);

        const initial = {};
        data.forEach((exp) => {
          initial[exp.id] = 1;
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

  const filtered = expansions.filter((exp) => {
    const name = exp.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType =
      activeFilters.length === 0
        ? true
        : activeFilters.some((type) => hasType(exp, type));

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
    setShowExpansionsFilters((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(exp, typeName) {
    return exp.types?.some((type) => type.type?.name === typeName);
  }

  // ──────────────────────────────────────────────
  // Aumentar Nível
  // ──────────────────────────────────────────────
  function increaseLevel(exp) {
    if (!exp.isAllowedLevel) return;

    const current = levels[exp.id] ?? 1;

    if (current >= (exp.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [exp.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(exp.id)) {
      addExpansions(exp, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(exp) {
    if (!exp.isAllowedLevel) return;

    const current = levels[exp.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [exp.id]: newLevel }));

    if (selectedIds.has(exp.id)) {
      addExpansions(exp, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(exp) {
    const level = levels[exp.id] ?? 1;

    const base = Number(exp.baseCost ?? 0);
    const variable = Number(exp.variableCost ?? 0);

    if (!exp.costIsVariable) return base;

    return base + (level - 1) * variable;;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleExpansions(exp) {
    if (selectedIds.has(exp.id)) {
      removeExpansions(exp.id);
    } else {
      const level = levels[exp.id] ?? 1;
      addExpansions(exp, level);
    }
  }

  function openInfoModal(expansionId) {
    setSelectedExpansionId(expansionId);
    setShowInfoModal(true);
  }

  function closeInfoModal() {
    setShowInfoModal(false);
    setSelectedExpansionId(null);
  }

  function typeName(name){
    if (name === "Physical"){
      return "Física";
    }else if(name === "Supernatural"){
      return "Sobrenatural";
    }else if(name === "Exotic"){
      return "Exótica"
    }
    return name;
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
          <h2>Adicionar Ampliação</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar ampliações..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar Vantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showExpansionsFilters && (
          <div className="filters">
            <button className={filters.Physical ? "active" : ""} onClick={() => toggleFilter("Physical")}>Física</button>
            <button className={filters.Mental ? "active" : ""} onClick={() => toggleFilter("Mental")}>Mental</button>
            <button className={filters.Social ? "active" : ""} onClick={() => toggleFilter("Social")}>Social</button>
            <button className={filters.Supernatural ? "active" : ""} onClick={() => toggleFilter("Supernatural")}>Sobrenatural</button>
            <button className={filters.Exotic ? "active" : ""} onClick={() => toggleFilter("Exotic")}>Exótica</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((exp) => {
            const isSelected = selectedIds.has(exp.id);

            return (
              <li
                key={exp.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >

                <div className="top">
                  <h3>{exp.name}</h3>

                  <div className="types-container">
                    {exp.types?.map((type) => (
                      <span key={type.id} className="type">
                        {typeName(type.type.name)}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleExpansions(exp)}
                    title={isSelected ? "Remover ampliação" : "Adicionar ampliação"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">
                    {getCost(exp)} pts
                  </div>

                  {exp.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(exp)}>-</button>
                      <span>{levels[exp.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(exp)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline className="info-icon" title={"Informações da ampliação"} onClick={() => openInfoModal(exp.id)} />
                </div>

                <p>{exp.shortDescription}</p>
              </li>
            );
          })}
        </ul>

      </div>

      {showInfoModal && <InfoModal onClose={closeInfoModal} Type="expansion" Id={selectedExpansionId} />}
    </div>
  );
}