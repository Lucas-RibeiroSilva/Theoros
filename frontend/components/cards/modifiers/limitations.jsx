import { useState, useEffect } from "react";

// Icons
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { PiBrainDuotone } from "react-icons/pi";
import { TbGhost2 } from "react-icons/tb";
import { GiBiceps, GiAngelWings, GiCrossedSwords } from "react-icons/gi";
import { RiSpeakLine } from "react-icons/ri";

// Serve para aparecer uma mensagem de explicacao para quando passa o cursor em cima
import Tooltip from '@mui/material/Tooltip';

// MOdal para adicionar limitação
import LimitationsModal from "../../modals/limitationsModal"

// CSS
import "../../../styles/cards/sections.css"

// Puxar e enviar os dados para o controller
import { useCardStore } from "../../stores/cardStore";

export default function LimitationsSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de filtragem
  const [filterLimitations, setFilterLimitations] = useState("");

  // Serve para mostrar a lista de desvantagens
  const [showLimitations, setShowLimitations] = useState(false);

  // Serve para ver se o modal está ou não na tela
  const [showLimitationsModal, setShowLimitationsModal] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    Physical: false,
    Mental: false,
    Social: false,
    Supernatural: false,
    Exotic: false,
  });

  // ──────────────────────────────────────────────
  // Store — vantagens já selecionadas pelo usuário
  // ──────────────────────────────────────────────
  const limitations = useCardStore((state) => state.limitations);
  const removeLimitations = useCardStore((state) => state.removeLimitation);

  // ──────────────────────────────────────────────
  // Buscar limitações do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
    async function loadLimitations() {
      try {

        const storedLimitations = useCardStore.getState().limitations;

        onLoading(false);

      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    loadLimitations();
  }, []);

  // Funções para abrir e fechar o modal de adicionar Desvantagens
  function openLimitationsModal() {
    setShowLimitationsModal(true);
  }
  function closeLimitationsModal() {
    setShowLimitationsModal(false);
  }

  // Filtra a lista de desvantagens já adicionadas pelo texto de busca
  const limitationsFilters = limitations.filter((limitations) =>
    limitations.name?.toLowerCase().includes(filterLimitations.toLowerCase())
  );

  function handleToggleLimitations() {
    setShowLimitations((prev) => !prev);
  }

  // Ativa ou desativa um filtro de tipo
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // Calcula o custo de uma desvantagem considerando o nível atual
  function getCost(limitation) {
    const level = limitation.level ?? 1;

    const base = Number(limitation.baseCost ?? 0);
    const variable = Number(limitation.variableCost ?? 0);

    if (!limitation.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(limitation, typeName) {
    return limitation.types?.some((type) => type.type?.name === typeName);
  }

  function getIcon(limitation) {
      const icons = [];
  
      if (hasType(limitation, "Physical"))
        icons.push(<Tooltip title="Físico" arrow key="Physical"><GiBiceps /></Tooltip>);
  
      if (hasType(limitation, "Combat"))
        icons.push(<Tooltip title="Combate" arrow key="Combat"><GiCrossedSwords /></Tooltip>);
  
      if (hasType(limitation, "Supernatural"))
        icons.push(<Tooltip title="Sobrenatural" arrow key="Supernatural"><TbGhost2 /></Tooltip>);
  
      if (hasType(limitation, "Mental"))
        icons.push(<Tooltip title="Mental" arrow key="Mental"><PiBrainDuotone /></Tooltip>);
  
      if (hasType(limitation, "Social"))
        icons.push(<Tooltip title="Social" arrow key="Social"><RiSpeakLine /></Tooltip>);
  
      if (hasType(limitation, "Exotic"))
        icons.push(<Tooltip title="Exótico" arrow key="Exotic"><GiAngelWings /></Tooltip>);
  
      return icons;
    }

  return (
    <>
      {/* Direita da seção Modificadores - Limitações */}
      <div className="limitation-box">

        {/* Titulo junto com botão "+" para abrir o modal de limitação */}
        <div className="box-header">
          <label>Buscar Limitação:</label>

          <Tooltip title="Adicionar Limitações" arrow>
            <AddIcon className="add-limitation" onClick={openLimitationsModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-limitation">
          <input
            type="text"
            placeholder="Digite nome da limitação"
            value={filterLimitations}
            onChange={(e) => setFilterLimitations(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Limitações" arrow>
            <FilterAltTwoToneIcon
              className="filter-icon"
              onClick={handleToggleLimitations}
            />
          </Tooltip>
        </div>


        {/* Botões dos filtros */}
        {showLimitations && (
          <div className="limitations-filters">
            <button
              className={filters.Physical ? "active" : ""}
              onClick={() => toggleFilter("Physical")}
            >
              Física
            </button>

            <button
              className={filters.Mental ? "active" : ""}
              onClick={() => toggleFilter("Mental")}
            >
              Mental
            </button>

            <button
              className={filters.Social ? "active" : ""}
              onClick={() => toggleFilter("Social")}
            >
              Social
            </button>

            <button
              className={filters.Supernatural ? "active" : ""}
              onClick={() => toggleFilter("Supernatural")}
            >
              Sobrenatural
            </button>

            <button
              className={filters.Exotic ? "active" : ""}
              onClick={() => toggleFilter("Exotic")}
            >
              Exótica
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

        {/* LISTA DE LIMITAÇÃO SELECIONADAS */}
        <ul className="selected-limitations-list">
          {limitationsFilters.length === 0 ? (
            <li className="empty-list-message">Nenhuma limitação adicionada</li>
          ) : (
            limitationsFilters.map((limitation) => (
              <li key={limitation.id} className="selected-limitation-item">
                <div className="selected-limitation-info">

                  <span className="selected-limitation-cost">
                    {getCost(limitation)} pts
                  </span>

                  <span className="selected-limitation-name">
                    {limitation.name}
                    {limitation.isAllowedLevel ? ` (Nível ${limitation.level ?? 1})` : ""}
                  </span>

                  <span id="icons">
                    {getIcon(limitation)}
                  </span>

                  <span className="selected-limitation-level">
                    {limitation.level}
                  </span>

                  <button
                    className="remove-limitation-btn"
                    onClick={() => removeLimitations(limitation.id)}
                    title="Remover ampliação"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        
      </div >

      {showLimitationsModal && (
          <LimitationsModal onClose={closeLimitationsModal} />
        )}
    </>
  );
}