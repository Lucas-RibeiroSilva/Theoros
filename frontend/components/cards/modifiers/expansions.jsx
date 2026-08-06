import { useState, useEffect } from "react";

// Icons
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { GiBiceps, GiAngelWings, GiCrossedSwords } from "react-icons/gi";

// Serve para aparecer uma mensagem de explicacao para quando passa o cursor em cima
import Tooltip from '@mui/material/Tooltip';

// Modal para adicionar Ampliação
import ExpansionsModal from "../../modals/expansionsModal";

// Puxar e enviar os dados para o controller
import { useCardStore } from "../../stores/cardStore";

// CSS
import "../../../styles/cards/sections.css"

export default function ExpansionsSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de filtragem
  const [filterExpansions, setFilterExpansions] = useState("");

  // Serve para mostrar a lista de ampliações
  const [showExpansions, setShowExpansions] = useState(false);

  // Serve para ver se o modal está ou não na tela
  const [showExpansionsModal, setShowExpansionsModal] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    Physical: false,
    Mental: false,
    Social: false,
    Supernatural: false,
    Exotic: false,
  });

  // ──────────────────────────────────────────────
  // Store — ampliações já selecionadas pelo usuário
  // ──────────────────────────────────────────────
  const expansions = useCardStore((state) => state.expansions);
  const removeExpansion = useCardStore((state) => state.removeExpansion);

  // ──────────────────────────────────────────────
  // Buscar ampliações do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
    async function loadExpansions() {
      try {

        const storedExpansions = useCardStore.getState().expansions;

        onLoading(false);

      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    loadExpansions();
  }, []);

  // Funções para abrir e fechar o modal de adicionar ampliações
  function openExpansionsModal() {
    setShowExpansionsModal(true);
  }
  function closeExpansionsModal() {
    setShowExpansionsModal(false);
  }

  // Filtra a lista de ampliações já adicionadas pelo texto de busca
  const expansionsFilters = expansions.filter((expansion) =>
    expansion.name?.toLowerCase().includes(filterExpansions.toLowerCase())
  );

  function handleToggleExpansions() {
    setShowExpansions((prev) => !prev);
  }

  // Ativa ou desativa um filtro de tipo
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // Calcula o custo de uma ampliação considerando o nível atual
  function getCost(expansion) {
    const level = expansion.level ?? 1;

    const base = Number(expansion.baseCost ?? 0);
    const variable = Number(expansion.variableCost ?? 0);

    if (!expansion.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(exp, typeName) {
    return exp.types?.some((type) => type.type?.name === typeName);
  }

  // Buscar icones para cada tipo
  function getIcon(exp) {
      const icons = [];
  
      if (hasType(exp, "Physical"))
        icons.push(<Tooltip title="Físico" arrow key="Physical"><GiBiceps /></Tooltip>);
  
      if (hasType(exp, "Combat"))
        icons.push(<Tooltip title="Combate" arrow key="Combat"><GiCrossedSwords /></Tooltip>);
  
      if (hasType(exp, "Supernatural"))
        icons.push(<Tooltip title="Sobrenatural" arrow key="Supernatural"><TbGhost2 /></Tooltip>);
  
      if (hasType(exp, "Mental"))
        icons.push(<Tooltip title="Mental" arrow key="Mental"><PiBrainDuotone /></Tooltip>);
  
      if (hasType(exp, "Social"))
        icons.push(<Tooltip title="Social" arrow key="Social"><RiSpeakLine /></Tooltip>);
  
      if (hasType(exp, "Exotic"))
        icons.push(<Tooltip title="Exótico" arrow key="Exotic"><GiAngelWings /></Tooltip>);
  
      return icons;
    }


  return (
    <>
      {/* Direita da Seção Modificadores - Ampliações */}
      <div className="expansions-box">

        {/* Titulo junto com botão "+" para abrir o modal de ampliações */}
        <div className="box-header">
          <label>Buscar Ampliação:</label>

          <Tooltip title="Adicionar Ampliações" arrow>
            <AddIcon className="add-expansion" onClick={openExpansionsModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-expansion">
          <input
            type="text"
            placeholder="Digite nome da ampliação"
            value={filterExpansions}
            onChange={(e) => setFilterExpansions(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Ampliações" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={handleToggleExpansions} />
          </Tooltip>
        </div>


        {/* Botões dos filtros */}
        {showExpansions && (
          <div className="expansions-filters">
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

        {/* LISTA DE AMPLIAÇÕES SELECIONADAS */}
        <ul className="selected-expansions-list">
          {expansionsFilters.length === 0 ? (
            <li className="empty-list-message">Nenhuma ampliação adicionada</li>
          ) : (
            expansionsFilters.map((exp) => (
              <li key={exp.id} className="selected-expansion-item">
                <div className="selected-expansion-info">

                  <span className="selected-expansion-cost">
                    {getCost(exp)} pts
                  </span>

                  <span className="selected-expansion-name">
                    {exp.name}
                    {exp.isAllowedLevel ? ` (Nível ${exp.level ?? 1})` : ""}
                  </span>

                  <span id="icons">
                    {getIcon(exp)}
                  </span>

                  <span className="selected-expansion-level">
                    {exp.level}
                  </span>


                  <button
                    className="remove-expansion-btn"
                    onClick={() => removeExpansion(exp.id)}
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

      {showExpansionsModal && (
          <ExpansionsModal onClose={closeExpansionsModal} />
        )}
    </>
  );
}