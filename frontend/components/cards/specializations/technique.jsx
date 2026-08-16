import { useState, useEffect } from "react";

// Icons
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { RiEmotionHappyFill } from "react-icons/ri";
import { FaFaceMeh, FaFaceAngry, FaFaceDizzy } from "react-icons/fa6";

// Serve para aparecer uma mensagem de explicacao para quando passa o cursor em cima
import Tooltip from "@mui/material/Tooltip";

// Modal para adicionar técnica
import TechniqueModal from "../../modals/techniqueModal";

// CSS
import "../../../styles/cards/sections.css";

// Puxar e enviar os dados para o controller
import { useCardStore } from "../../../stores/cardStore";

export default function TechniqueSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de filtragem
  const [filterTechnique, setFilterTechnique] = useState("");

  // Serve para mostrar a lista de técnica
  const [showTechnique, setShowTechnique] = useState(false);

  // Serve para ver se o modal está ou não na tela
  const [showTechniqueModal, setShowTechniqueModal] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    Easy: false,
    Average: false,
    Hard: false,
    VeryHard: false,
  });

  // ──────────────────────────────────────────────
  // Store — técnica já selecionadas pelo usuário
  // ──────────────────────────────────────────────
  const techniques = useCardStore((state) => state.techniques);
  const removeTechnique = useCardStore((state) => state.removeTechnique);

  // ──────────────────────────────────────────────
  // Buscar técnicas do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
    async function loadTechniques() {
      try {
        const storedTechniques = useCardStore.getState().techniques;

        onLoading(false);
      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    loadTechniques();
  }, []);

  // Funções para abrir e fechar o modal de adicionar Técnica
  function openTechniqueModal() {
    setShowTechniqueModal(true);
  }
  function closeTechniqueModal() {
    setShowTechniqueModal(false);
  }

  // Filtra a lista de técnica já adicionadas pelo texto de busca
  const techniqueFilters = techniques.filter((technique) => {
    const matchesText = technique.name?.toLowerCase().includes(filterTechnique.toLowerCase());

    const hasActiveFilters = Object.values(filters).some(value => value === true);
    if (!hasActiveFilters) return matchesText;

    const matchesType = Object.keys(filters).some(typeName => {
      if (!filters[typeName]) return false;
      return hasType(technique, typeName);
    });


    return matchesText && matchesType;
  });

  function handleToggleTechnique() {
    setShowTechnique((prev) => !prev);
  }

  // Ativa ou desativa um filtro de tipo
  function toggleFilter(difficulty) {
    setFilters((prev) => ({
      ...prev,
      [difficulty]: !prev[difficulty],
    }));
  }

  // Calcula o custo de uma desvantagem considerando o nível atual
  function getCost(technique) {
    const level = technique.level ?? 1;

    const base = Number(technique.baseCost ?? 0);
    const variable = Number(technique.variableCost ?? 0);

    if (!technique.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(technique, difficulty) {
    return technique.difficulties.some(
      (item) => item.difficulty?.name === difficulty,
    );
  }

  function getIcon(technique) {
    const icons = [];

    if (hasType(technique, "Easy"))
      icons.push(
        <Tooltip title="Fácil" arrow key="Easy">
          <RiEmotionHappyFill />
        </Tooltip>,
      );

    if (hasType(technique, "Average"))
      icons.push(
        <Tooltip title="Médio" arrow key="Average">
          <FaFaceMeh />
        </Tooltip>,
      );

    if (hasType(technique, "Hard"))
      icons.push(
        <Tooltip title="Díficil" arrow key="Hard">
          <FaFaceAngry />
        </Tooltip>,
      );

    if (hasType(technique, "VeryHard"))
      icons.push(
        <Tooltip title="Muito Díficl" arrow key="VeryHard">
          <FaFaceDizzy />
        </Tooltip>,
      );

    return icons;
  }

  return (
    <>
      {/* Direita da seção Especializações - Técnicas */}
      <div className="technique-box">
        {/* Titulo junto com botão "+" para abrir o modal de técnica*/}
        <div className="box-header">
          <label>Buscar Técnica:</label>

          <Tooltip title="Adicionar Técnicas" arrow>
            <AddIcon className="add-technique" onClick={openTechniqueModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-technique">
          <input
            type="text"
            placeholder="Digite o nome da Técnica"
            value={filterTechnique}
            onChange={(e) => setFilterTechnique(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Técnicas" arrow>
            <FilterAltTwoToneIcon
              className="filter-icon"
              onClick={handleToggleTechnique}
            />
          </Tooltip>
        </div>

        {/* Botões dos filtros */}
        {showTechnique && (
          <div className="techniques-filters">
            <button
              className={filters.Easy ? "active" : ""}
              onClick={() => toggleFilter("Easy")}
            >
              Fácil
            </button>

            <button
              className={filters.Average ? "active" : ""}
              onClick={() => toggleFilter("Average")}
            >
              Médio
            </button>

            <button
              className={filters.Hard ? "active" : ""}
              onClick={() => toggleFilter("Hard")}
            >
              Díficil
            </button>

            <button
              className={filters.VeryHard ? "active" : ""}
              onClick={() => toggleFilter("VeryHard")}
            >
              Muito Díficil
            </button>
          </div>
        )}

        <div className="topics-information">
          <p id="topics-points">Custo</p>
          <p id="topics-name">Nome</p>
          <p id="topics-difficultie">Dificuldade</p>
          <p id="topics-level">Nível</p>
          <p id="topics-remove"></p>
        </div>

        {/* Lista de técnicas selecionadas */}
        <ul className="selected-techniques-list">
          {techniqueFilters.length === 0 ? (
            <li className="empty-list-message">Nenhuma técnica adicionada</li>
          ) : (
            techniqueFilters.map((technique) => (
              <li key={technique.id} className="selected-technique-item">
                <div className="selected-technique-info">
                  <span className="selected-technique-cost">
                    {getCost(technique)} pts
                  </span>

                  <span className="selected-technique-name">
                    {technique.name}
                    {technique.isAllowedLevel
                      ? ` (Nível ${technique.level ?? 1})`
                      : ""}
                  </span>

                  <span id="icons">{getIcon(technique)}</span>

                  <span className="selected-technique-level">
                    {technique.level}
                  </span>

                  <button
                    className="remove-technique-btn"
                    onClick={() => removeTechnique(technique.id)}
                    title="Remover Técnica"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {showTechniqueModal && <TechniqueModal onClose={closeTechniqueModal} />}
    </>
  );
}
