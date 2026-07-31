import { useState, useEffect } from "react";
import { getTechniques } from "../../services/api";
import { useCardStore } from "../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";

import "../../styles/modals/modalAdd.css";
import Loading from "../loading";

export default function TechniqueModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [technique, setTechnique] = useState([]);
  const [levels, setLevels] = useState({});
  const [showTechniquesFilters, setShowTechniquesFilters] = useState(false);
  const [loading, setLoading] = useState(true);

  const [filters, setFilters] = useState({
    Easy: false,
    Average: false,
    Hard: false,
    VeryHard: false,
  })

  // ──────────────────────────────────────────────
  // Store
  // ──────────────────────────────────────────────
  const selectedTechnique = useCardStore((state) => state.techniques);
  const addTechnique = useCardStore((state) => state.addTechnique);
  const removeTechnique = useCardStore((state) => state.removeTechnique);

  const selectedIds = new Set(selectedTechnique.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getTechniques();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setTechnique(data);

        const initial = {};
        data.forEach((tec) => {
          initial[tec.id] = 1;
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

  const filtered = technique.filter((tec) => {
    const name = tec.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType =
      activeFilters.length === 0
        ? true
        : activeFilters.some((difficulty) => hasType(tec, difficulty));

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
    setShowTechniquesFilters((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(tec, difficulty) {
    return tec.difficulties.some((item) => item.difficulty?.name === difficulty);
  }

  // ──────────────────────────────────────────────
  // Inserir Nível
  // ──────────────────────────────────────────────
  function increaseLevel(tec) {
    if (!tec.isAllowedLevel) return;

    const current = levels[tec.id] ?? 1;

    if (current >= (tec.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [tec.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(tec.id)) {
      addTechnique(tec, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(tec) {
    if (!tec.isAllowedLevel) return;

    const current = levels[tec.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [tec.id]: newLevel }));

    if (selectedIds.has(tec.id)) {
      addTechnique(tec, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(tec) {
    const level = levels[tec.id] ?? 1;

    const base = Number(tec.baseCost ?? 0);
    const variable = Number(tec.variableCost ?? 0);

    if (!tec.costIsVariable) return base;

    return base + (level - 1) * variable;;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleTechnique(tec) {
    if (selectedIds.has(tec.id)) {
      removeTechnique(tec.id);
    } else {
      const level = levels[tec.id] ?? 1;
      addTechnique(tec, level);
    }
  }

  // ──────────────────────────────────────────────
  // Tela de Carregamento
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
          <h2>Adicionar Técnica</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar técnicas"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar técnica" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showTechniquesFilters && (
          <div className="filters">
            <button className={filters.Easy ? "active" : ""} onClick={() => toggleFilter("Easy")}>Fácil</button>
            <button className={filters.Average ? "active" : ""} onClick={() => toggleFilter("Average")}>Médio</button>
            <button className={filters.Hard ? "active" : ""} onClick={() => toggleFilter("Hard")}>Díficil</button>
            <button className={filters.VeryHard ? "active" : ""} onClick={() => toggleFilter("VeryHard")}>Muito Díficil</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((tec) => {
            const isSelected = selectedIds.has(tec.id);

            return (
              <li
                key={tec.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >

                <div className="top">
                  <h3>{tec.name}</h3>

                  <div className="types-container">
                    {tec.difficulties?.map((item) => (
                      <span key={item.id} className="type">
                        {item.difficulty.name}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleTechnique(tec)}
                    title={isSelected ? "Remover técnica" : "Adicionar técnica"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">
                    {getCost(tec)} pts
                  </div>

                  {tec.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(tec)}>-</button>
                      <span>{levels[tec.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(tec)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline className="info-icon" title={"Informações da técnica"} />
                </div>

                <p>{tec.shortDescription}</p>
              </li>
            );
          })}
        </ul>

      </div>
    </div>
  );
}