import { useState, useEffect } from "react";

//Icons
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { PiBrainDuotone } from "react-icons/pi";
import { TbGhost2 } from "react-icons/tb";
import { GiBiceps, GiAngelWings, GiCrossedSwords } from "react-icons/gi";
import { RiSpeakLine } from "react-icons/ri";

import { usePointsValidation } from "../../popups/usePointsValidation";

// Serve para aparecer uma mensagem de explicacao para quando passa o cursor em cima
import Tooltip from '@mui/material/Tooltip';

//Modal
import DisadvantageModal from "../../modals/disadvantageModal";

// CSS
import "../../../styles/cards/sections.css"
// Controller
import { useCardStore } from "../../../stores/cardStore";

export default function DisadvantageSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de filtragem
  const [filterDisadvantage, setFilterDisadvantage] = useState("");
  // Serve para mostrar a lista de desvantagens
  const [showDisadvantage, setShowDisadvantage] = useState(false);
  // Serve para ver se o modal está ou não na tela
  const [showDisadvantageModal, setShowDisadvantageModal] = useState(false);
  // Filtros
  const [filters, setFilters] = useState({
    Physical: false,
    Mental: false,
    Social: false,
    Supernatural: false,
    Exotic: false,
    Combat: false,
  });
  // ──────────────────────────────────────────────
  // Store — desvantagens já selecionadas pelo usuário
  // ──────────────────────────────────────────────
  const disadvantages = useCardStore((state) => state.disadvantages);
  const removeDisadvantage = useCardStore((state) => state.removeDisadvantage);

  // Funções para abrir e fechar o modal de adicionar Desvantagens
  function openDisadvantageModal() {
    setShowDisadvantageModal(true);
  }
  function closeDisadvantageModal() {
    setShowDisadvantageModal(false);
  }

  // ──────────────────────────────────────────────
  // Buscar desvantagens do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
    async function loadDisadvantages() {
      try {

        const storedDisadvantages = useCardStore.getState().disadvantages;

        onLoading(false);
      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    loadDisadvantages();
  }, []);

  // Filtra a lista de desvantagens já adicionadas pelo texto de busca
  const disadvantagensFilters = disadvantages.filter((disadv) => {
    const matchesText = disadv.name?.toLowerCase().includes(filterDisadvantage.toLowerCase());

    const hasActiveFilters = Object.values(filters).some(value => value === true);
    if (!hasActiveFilters) return matchesText;

    const matchesType = Object.keys(filters).some(typeName => {
      if (!filters[typeName]) return false;
      return hasType(disadv, typeName);
    });


    return matchesText && matchesType;
  });

  function handleToggleDisadvantage() {
    setShowDisadvantage((prev) => !prev);
  }

  // Ativa ou desativa um filtro de tipo
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // Calcula o custo de uma desvantagem considerando o nível atual
  function getCost(disadv) {
    const level = disadv.level ?? 1;

    const base = Number(disadv.baseCost ?? 0);
    const variable = Number(disadv.variableCost ?? 0);

    if (!disadv.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(disadv, typeName) {
    return disadv.types?.some((type) => type.type?.name === typeName);
  }

  function getIcon(disadv) {
      const icons = [];
  
      if (hasType(disadv, "Physical"))
        icons.push(<Tooltip title="Físico" arrow key="Physical"><GiBiceps /></Tooltip>);
  
      if (hasType(disadv, "Combat"))
        icons.push(<Tooltip title="Combate" arrow key="Combat"><GiCrossedSwords /></Tooltip>);
  
      if (hasType(disadv, "Supernatural"))
        icons.push(<Tooltip title="Sobrenatural" arrow key="Supernatural"><TbGhost2 /></Tooltip>);
  
      if (hasType(disadv, "Mental"))
        icons.push(<Tooltip title="Mental" arrow key="Mental"><PiBrainDuotone /></Tooltip>);
  
      if (hasType(disadv, "Social"))
        icons.push(<Tooltip title="Social" arrow key="Social"><RiSpeakLine /></Tooltip>);
  
      if (hasType(disadv, "Exotic"))
        icons.push(<Tooltip title="Exótico" arrow key="Exotic"><GiAngelWings /></Tooltip>);
  
      return icons;
    }

  return (
    <>
      {/* DIREITA - DESVANTAGENS */}
      <div className="disadvantages-box">

        {/* Titulo junto com botão "+" para abrir o modal de desvantagens */}
        <div className="box-header">
          <label>Buscar Desvantagem:</label>

          <Tooltip title="Adicionar Desvantagens" arrow>
            <AddIcon className="add-disadvantage" onClick={openDisadvantageModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-disadvantage">
          <input
            type="text"
            placeholder="Digite o nome da desvantagem"
            value={filterDisadvantage}
            onChange={(e) => setFilterDisadvantage(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Desvantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={handleToggleDisadvantage} />
          </Tooltip>
        </div>


        {/* Botões dos filtros */}
        {showDisadvantage && (
          <div className="disadvantages-filters">
            <button className={filters.Physical ? "active" : ""} onClick={() => toggleFilter("Physical")}>
              Física
            </button>

            <button className={filters.Mental ? "active" : ""} onClick={() => toggleFilter("Mental")}>
              Mental
            </button>

            <button className={filters.Social ? "active" : ""} onClick={() => toggleFilter("Social")}>
              Social
            </button>

            <button className={filters.Supernatural ? "active" : ""} onClick={() => toggleFilter("Supernatural")}>
              Sobrenatural
            </button>

            <button className={filters.Exotic ? "active" : ""} onClick={() => toggleFilter("Exotic")}>
              Exótica
            </button>

            <button className={filters.Combat ? "active" : ""} onClick={() => toggleFilter("Combat")}>
              Combate
            </button>
          </div>
        )}

        <div className="topics-information">
          <p id="topics-points">Custo</p>
          <p id="topics-name">Nome</p>
          <p id="topics-types">Tipos</p>
          <p id="topics-level">Nível</p>
          <p id="topics-remove"></p>
        </div>

        {/* Lista de desvantagens selecionadas */}
        <ul className="selected-disadvantagens-list">
          {disadvantagensFilters.length === 0 ? (
            <li className="empty-list-message">Nenhuma desvantagem adicionada</li>
          ) : (
            disadvantagensFilters.map((disadv) => (
              <li key={disadv.id} className="selected-disadvantage-item">
                <div className="selected-disadvantage-info">

                  <span className="selected-disadvantage-cost">
                    {getCost(disadv)} pts
                  </span>

                  <span className="selected-disadvantage-name">
                    {disadv.name}
                    {disadv.isAllowedLevel ? ` (Nível ${disadv.level ?? 1})` : ""}
                  </span>

                  <span id="icons">
                    {getIcon(disadv)}
                  </span>

                  <span className="selected-disadvantage-level">
                    {disadv.level}
                  </span>

                  <button className="remove-disadvantage-btn" onClick={() => removeDisadvantage(disadv.id)} title="Remover desvantagem">
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>  
      </div >

      {/* Modal para adicionar Desvantagem */}
        {showDisadvantageModal && (
          <DisadvantageModal onClose={closeDisadvantageModal} />
        )}
    </>
  );
}