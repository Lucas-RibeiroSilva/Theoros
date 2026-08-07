import { useState, useEffect } from "react";
import { getAdvantages } from "../../services/api";
import { useCardStore } from "../stores/cardStore";

import Tooltip from '@mui/material/Tooltip';

import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CheckIcon from "@mui/icons-material/Check";
import { IoMdInformationCircleOutline } from "react-icons/io";


import "../../styles/modals/modalAdd.css";

import Loading from "../loading";
import InfoModal from "./infoModal";

export default function AdvantageModal({ onClose }) {
  const [filterText, setFilterText] = useState("");
  const [showAdvantage, setShowAdvantagens] = useState(false);
  const [advantages, setAdvantages] = useState([]);
  const [levels, setLevels] = useState({});
  const [showAdvantagesFilters, setShowAdvantagesFilters] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [selectedAdvantageId, setSelectedAdvantageId] = useState(null);


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
  const selectedAdvantages = useCardStore((state) => state.advantages);
  const addAdvantage = useCardStore((state) => state.addAdvantage);
  const removeAdvantage = useCardStore((state) => state.removeAdvantage);

  const selectedIds = new Set(selectedAdvantages.map((a) => a.id));

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await getAdvantages();

        if (data?.error) {
          console.error(data.error);
          return;
        }

        setAdvantages(data);

        const initial = {};
        data.forEach((adv) => {
          initial[adv.id] = 1;
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

  const filtered = advantages.filter((adv) => {
    const name = adv.name?.toLowerCase() ?? "";
    const matchesName = name.includes(filterText.toLowerCase());

    const matchesType = activeFilters.length === 0 ? true : activeFilters.some((type) => hasType(adv, type));

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
    setShowAdvantagesFilters((prev) => !prev);
  }

  // ──────────────────────────────────────────────
  // Definir Tipo
  // ──────────────────────────────────────────────
  function hasType(adv, typeName) {
    return adv.types?.some((type) => type.type?.name === typeName);
  }

  // ──────────────────────────────────────────────
  // Inserir Nível
  // ──────────────────────────────────────────────
  function increaseLevel(adv) {
    if (!adv.isAllowedLevel) return;

    const current = levels[adv.id] ?? 1;

    if (current >= (adv.maxLevel ?? 1)) return;

    const newLevel = current + 1;

    setLevels((prev) => ({ ...prev, [adv.id]: newLevel }));

    // Se já está selecionado, atualiza o nível no store também
    if (selectedIds.has(adv.id)) {
      addAdvantage(adv, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Diminuir Nível
  // ──────────────────────────────────────────────
  function decreaseLevel(adv) {
    if (!adv.isAllowedLevel) return;

    const current = levels[adv.id] ?? 1;

    if (current <= 1) return;

    const newLevel = current - 1;

    setLevels((prev) => ({ ...prev, [adv.id]: newLevel }));

    if (selectedIds.has(adv.id)) {
      addAdvantage(adv, newLevel);
    }
  }

  // ──────────────────────────────────────────────
  // Adquirir Custo
  // ──────────────────────────────────────────────
  function getCost(adv) {
    const level = levels[adv.id] ?? 1;

    const base = Number(adv.baseCost ?? 0);
    const variable = Number(adv.variableCost ?? 0);

    if (!adv.costIsVariable) return base;

    return base + (level - 1) * variable;
  }

  // ──────────────────────────────────────────────
  // Adicionar / Remover
  // ──────────────────────────────────────────────
  function handleToggleAdvantage(adv) {
    if (selectedIds.has(adv.id)) {
      removeAdvantage(adv.id);
    } else {
      const level = levels[adv.id] ?? 1;
      addAdvantage(adv, level);
    }
  }

  function openInfoModal(advantageId) {
    setSelectedAdvantageId(advantageId);
    setShowInfoModal(true);
  }

  function closeInfoModal() {
    setShowInfoModal(false);
    setSelectedAdvantageId(null);
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
          <h2>Adicionar Vantagem</h2>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="modal-search">
          <input
            type="text"
            placeholder="Buscar vantagem..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />

          <Tooltip title="Filtrar Vantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={showFilters} />
          </Tooltip>
        </div>

        {showAdvantagesFilters && (
          <div className="filters">
            <button className={filters.Physical ? "active" : ""} onClick={() => toggleFilter("Physical")}>Física</button>
            <button className={filters.Mental ? "active" : ""} onClick={() => toggleFilter("Mental")}>Mental</button>
            <button className={filters.Social ? "active" : ""} onClick={() => toggleFilter("Social")}>Social</button>
            <button className={filters.Supernatural ? "active" : ""} onClick={() => toggleFilter("Supernatural")}>Sobrenatural</button>
            <button className={filters.Exotic ? "active" : ""} onClick={() => toggleFilter("Exotic")}>Exótica</button>
          </div>
        )}

        <ul className="list-modal">
          {filtered.map((adv) => {
            const isSelected = selectedIds.has(adv.id);
            return (
              <li
                key={adv.id}
                className={`item-modal ${isSelected ? "selected" : ""}`}
              >

                <div className="top">
                  <h3>{adv.name}</h3>

                  <div className="types-container">
                    {adv.types?.map((type) => (
                      <span key={type.id} className="type">
                        {type.type.name}
                      </span>
                    ))}
                  </div>

                  <button
                    className={`add-btn ${isSelected ? "selected" : ""}`}
                    onClick={() => handleToggleAdvantage(adv)}
                    title={isSelected ? "Remover vantagem" : "Adicionar vantagem"}
                  >
                    {isSelected ? <CheckIcon /> : <AddIcon />}
                  </button>
                </div>

                <div className="info">
                  <div className="cost-badge">
                    {getCost(adv)} pts
                  </div>

                  {adv.isAllowedLevel ? (
                    <div className="level-control">
                      <span id="span-level">Nível:</span>
                      <button onClick={() => decreaseLevel(adv)}>-</button>
                      <span id="level">{levels[adv.id] ?? 1}</span>
                      <button onClick={() => increaseLevel(adv)}>+</button>
                    </div>
                  ) : (
                    <div className="level-disabled">Nível: --</div>
                  )}

                  <IoMdInformationCircleOutline className="info-icon" title={"Informações da vantagem"} onClick={() => openInfoModal(adv.id)} />
                </div>

                <p>{adv.shortDescription}</p>
              </li>
            );
          })}
        </ul>
      </div>

      {showInfoModal && <InfoModal onClose={closeInfoModal} Type="advantage" Id={selectedAdvantageId} />}
    </div>
  );
}