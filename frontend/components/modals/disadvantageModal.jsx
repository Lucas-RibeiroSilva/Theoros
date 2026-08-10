import { useState, useEffect } from "react";
import { getDisadvantages } from "../../services/api";
import { useCardStore } from "../../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";

import "../../styles/modals/modalAdd.css";

import Loading from "../loading";
import InfoModal from "./infoModal";

export default function DisadvantageModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [disadvantages, setDisadvantages] = useState([]);
  const [levels, setLevels] = useState({});
  const [showDisadvantagesFilters, setShowDisadvantagesFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedDisadvantageId, setSelectedDisadvantageId] = useState(null);

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
  const selectedDisadvantages = useCardStore((state) => state.disadvantages);
  const addDisadvantage = useCardStore((state) => state.addDisadvantage);
  const removeDisadvantage = useCardStore((state) => state.removeDisadvantage);

  const selectedIds = new Set(selectedDisadvantages.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getDisadvantages();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setDisadvantages(data);

        const initial = {};
        data.forEach((dis) => {
          initial[dis.id] = 1;
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

  const filtered = disadvantages.filter((dis) => {
    const name = dis.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType =
      activeFilters.length === 0
        ? true
        : activeFilters.some((type) => hasType(dis, type));

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
  // Mostrar Filtros
  // ──────────────────────────────────────────────
  function showFilters() {
    setShowDisadvantagesFilters((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(dis, typeName) {
    return dis.types?.some((type) => type.type?.name === typeName);
  }

  // ──────────────────────────────────────────────
  // Inserir Nível
  // ──────────────────────────────────────────────
  function increaseLevel(dis) {
    if (!dis.isAllowedLevel) return;

    const current = levels[dis.id] ?? 1;

    if (current >= (dis.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [dis.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(dis.id)) {
      addDisadvantage(dis, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(dis) {
    if (!dis.isAllowedLevel) return;

    const current = levels[dis.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [dis.id]: newLevel }));

    if (selectedIds.has(dis.id)) {
      addDisadvantage(dis, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(dis) {
    const level = levels[dis.id] ?? 1;

    const base = Number(dis.baseCost ?? 0);
    const variable = Number(dis.variableCost ?? 0);

    if (!dis.costIsVariable) return base;

    return base + (level - 1) * variable;;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleDisadvantage(dis) {
    if (selectedIds.has(dis.id)) {
      removeDisadvantage(dis.id);
    } else {
      const level = levels[dis.id] ?? 1;
      addDisadvantage(dis, level);
    }
  }

  function openInfoModal(disadvantageId) {
    setSelectedDisadvantageId(disadvantageId);
    setShowInfoModal(true);
  }

  function closeInfoModal() {
    setShowInfoModal(false);
    setSelectedDisadvantageId(null);
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
          <h2>Adicionar Desvantagem</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar desvantagem..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar Vantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showDisadvantagesFilters && (
          <div className="filters">
            <button className={filters.Physical ? "active" : ""} onClick={() => toggleFilter("Physical")}>Física</button>
            <button className={filters.Mental ? "active" : ""} onClick={() => toggleFilter("Mental")}>Mental</button>
            <button className={filters.Social ? "active" : ""} onClick={() => toggleFilter("Social")}>Social</button>
            <button className={filters.Supernatural ? "active" : ""} onClick={() => toggleFilter("Supernatural")}>Sobrenatural</button>
            <button className={filters.Exotic ? "active" : ""} onClick={() => toggleFilter("Exotic")}>Exótica</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((dis) => {
            const isSelected = selectedIds.has(dis.id);

            return (
              <li
                key={dis.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >

                <div className="top">
                  <h3>{dis.name}</h3>

                  <div className="types-container">
                    {dis.types?.map((type) => (
                      <span key={type.id} className="type">
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleDisadvantage(dis)}
                    title={isSelected ? "Remover desvantagem" : "Adicionar desvantagem"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">
                    {getCost(dis)} pts
                  </div>

                  {dis.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(dis)}>-</button>
                      <span>{levels[dis.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(dis)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline className="info-icon" title={"Informações da desvantagem"} onClick={() => openInfoModal(dis.id)} />
                </div>

                <p>{dis.shortDescription}</p>
              </li>
            );
          })}
        </ul>

      </div>

      {showInfoModal && <InfoModal onClose={closeInfoModal} Type="disadvantage" Id={selectedDisadvantageId} />}
    </div>
  );
}