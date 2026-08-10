import { useState, useEffect } from "react";
import { getExpertises } from "../../services/api";
import { useCardStore } from "../../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";

import "../../styles/modals/modalAdd.css";

import Loading from "../loading";
import InfoModal from "./infoModal";

export default function ExpertiseModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [expertise, setExpertise] = useState([]);
  const [levels, setLevels] = useState({});
  const [showExpertisesFilters, setShowExpertisesFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedExpertiseId, setSelectedExpertiseId] = useState(null);

  const [filters, setFilters] = useState({
    Easy: false,
    Average: false,
    Hard: false,
    VeryHard: false,
  })
  // ──────────────────────────────────────────────
  // Store
  // ──────────────────────────────────────────────
  const selectedExpertise = useCardStore((state) => state.expertises);
  const addExpertise = useCardStore((state) => state.addExpertise);
  const removeExpertise = useCardStore((state) => state.removeExpertise);

  const selectedIds = new Set(selectedExpertise.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getExpertises();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setExpertise(data);

        const initial = {};
        data.forEach((ext) => {
          initial[ext.id] = 1;
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

  const filtered = expertise.filter((ext) => {
    const name = ext.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType =
      activeFilters.length === 0
        ? true
        : activeFilters.some((difficulty) => hasType(ext, difficulty));

    return matchesName && matchesType;
  });

  // ──────────────────────────────────────────────
  // Habilitar Filtro
  // ──────────────────────────────────────────────
  function toggleFilter(difficulty) {
    setFilters((prev) => ({
      ...prev,
      [difficulty]: !prev[difficulty],
    }));
  }

  // ──────────────────────────────────────────────
  // Mostrar Filtro
  // ──────────────────────────────────────────────
  function showFilters() {
    setShowExpertisesFilters((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(expertise, difficulty) {
    return expertise.difficulties.some((item) => item.difficulty?.name === difficulty);
  }

  // ──────────────────────────────────────────────
  // Inserir Nível
  // ──────────────────────────────────────────────
  function increaseLevel(ext) {
    if (!ext.isAllowedLevel) return;

    const current = levels[ext.id] ?? 1;

    if (current >= (ext.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [ext.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(ext.id)) {
      addExpertise(ext, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(ext) {
    if (!ext.isAllowedLevel) return;

    const current = levels[ext.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [ext.id]: newLevel }));

    if (selectedIds.has(ext.id)) {
      addExpertise(ext, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(ext) {
    const level = levels[ext.id] ?? 1;

    const base = Number(ext.baseCost ?? 0);
    const variable = Number(ext.variableCost ?? 0);

    if (!ext.costIsVariable) return base;

    return base + (level - 1) * variable;;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleExpertise(ext) {
    if (selectedIds.has(ext.id)) {
      removeExpertise(ext.id);
    } else {
      const level = levels[ext.id] ?? 1;
      addExpertise(ext, level);
    }
  }

  function openInfoModal(expertiseId) {
    setSelectedExpertiseId(expertiseId);
    setShowInfoModal(true);
  }

  function closeInfoModal() {
    setShowInfoModal(false);
    setSelectedExpertiseId(null);
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
          <h2>Adicionar Péricia</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar péricias"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar Péricia" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showExpertisesFilters && (
          <div className="filters">
            <button className={filters.Easy ? "active" : ""} onClick={() => toggleFilter("Easy")}>Fácil</button>
            <button className={filters.Average ? "active" : ""} onClick={() => toggleFilter("Average")}>Médio</button>
            <button className={filters.Hard ? "active" : ""} onClick={() => toggleFilter("Hard")}>Díficil</button>
            <button className={filters.VeryHard ? "active" : ""} onClick={() => toggleFilter("VeryHard")}>Muito Díficil</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((ext) => {
            const isSelected = selectedIds.has(ext.id);

            return (
              <li
                key={ext.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >

                <div className="top">
                  <h3>{ext.name}</h3>

                  <div className="types-container">
                    {ext.difficulties?.map((item) => (
                      <span key={item.id} className="type">
                        {item.difficulty.name}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleExpertise(ext)}
                    title={isSelected ? "Remover ampliação" : "Adicionar ampliação"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">
                    {getCost(ext)} pts
                  </div>

                  {ext.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(ext)}>-</button>
                      <span>{levels[ext.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(ext)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline className="info-icon" title={"Informações da ampliação"} onClick={() => openInfoModal(ext.id)} />
                </div>

                <p>{ext.shortDescription}</p>
              </li>
            );
          })}
        </ul>

      </div>
      {showInfoModal && <InfoModal onClose={closeInfoModal} Type="expertise" Id={selectedExpertiseId} />}
    </div>
  );
}