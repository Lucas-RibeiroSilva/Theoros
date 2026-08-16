import { useState, useEffect } from "react";

// Icons
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import { RiEmotionHappyFill } from "react-icons/ri";
import { FaFaceMeh, FaFaceAngry, FaFaceDizzy } from "react-icons/fa6";

// Serve para aparecer uma mensagem de explicacao para quando passa o cursor em cima
import Tooltip from '@mui/material/Tooltip';

// Modal para adicionar perícia
import ExpertiseModal from "../../modals/expertiseModal";

// CSS
import "../../../styles/cards/sections.css"

// Puxar e enviar os dados para o controller
import { useCardStore } from "../../../stores/cardStore";

export default function ExpertiseSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de Perícia
  const [filterExpertise, setFilterExpertise] = useState("");

  // Serve para mostrar a lista de perícia
  const [showExpertise, setShowExpertise] = useState(false);

  // Serve para ver se o modal está ou não na tela
  const [showExpertiseModal, setShowExpertiseModal] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    Easy: false,
    Average: false,
    Hard: false,
    VeryHard: false,
  })

  // ──────────────────────────────────────────────
  // Store — perícia já selecionadas pelo usuário
  // ──────────────────────────────────────────────
  const expertises = useCardStore((state) => state.expertises);
  const removeExpertise = useCardStore((state) => state.removeExpertise);

  // ──────────────────────────────────────────────
  // Buscar perícias do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
    async function loadExpertises() {
      try {

        const storedExpertises = useCardStore.getState().expertises;

        onLoading(false);

      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    loadExpertises();
  }, []);

  // Funções para abrir e fechar o modal de adicionar Perícia
  function openExpertiseModal() {
    setShowExpertiseModal(true);
  }
  function closeExpertiseModal() {
    setShowExpertiseModal(false);
  }

  // Filtra a lista de perícia já adicionadas pelo texto de busca
  const filteredExpertises = expertises.filter((expertise) => {
    const matchesText = expertise.name?.toLowerCase().includes(filterExpertise.toLowerCase());

    const hasActiveFilters = Object.values(filters).some(value => value === true);
    if (!hasActiveFilters) return matchesText;

    const matchesType = Object.keys(filters).some(typeName => {
      if (!filters[typeName]) return false;
      return hasType(expertise, typeName);
    });


    return matchesText && matchesType;
  });

  function handleToggleExpertise() {
    setShowExpertise((prev) => !prev);
  }

  // Ativa ou perícia um filtro de tipo
  function toggleFilter(difficulty) {
    setFilters((prev) => ({
      ...prev,
      [difficulty]: !prev[difficulty],
    }));
  }

  // Calcula o custo de uma perícia considerando o nível atual
  function getCost(expertise) {
    const level = expertise.level ?? 1;

    const base = Number(expertise.baseCost ?? 0);
    const variable = Number(expertise.variableCost ?? 0);

    if (!expertise.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(expertise, difficulty) {
    return expertise.difficulties.some((item) => item.difficulty.name === difficulty);
  }

  function getIcon(expertise) {
    const icons = [];

    if (hasType(expertise, "Easy"))
      icons.push(<Tooltip title="Fácil" arrow key="Easy"><RiEmotionHappyFill /></Tooltip>);

    if (hasType(expertise, "Average"))
      icons.push(<Tooltip title="Médio" arrow key="Average"><FaFaceMeh /></Tooltip>);

    if (hasType(expertise, "Hard"))
      icons.push(<Tooltip title="Díficil" arrow key="Hard"><FaFaceAngry /></Tooltip>);

    if (hasType(expertise, "VeryHard"))
      icons.push(<Tooltip title="Muito Díficl" arrow key="VeryHard"><FaFaceDizzy /></Tooltip>);

    return icons;
  }

  return (
    <>
      {/* Esquerda da seção Expecializações - Perícias */}
      <div className="expertise-box">

        {/* Titulo junto com botão "+" para abrir o modal de perícia */}
        <div className="box-header">
          <label>Buscar Perícia:</label>

          <Tooltip title="Adicionar Perícias" arrow>
            <AddIcon className="add-expertise" onClick={openExpertiseModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-expertise">
          <input
            type="text"
            placeholder="Digite o nome da Perícia"
            value={filterExpertise}
            onChange={(e) => setFilterExpertise(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Perícias" arrow>
            <FilterAltTwoToneIcon
              className="filter-icon"
              onClick={handleToggleExpertise}
            />
          </Tooltip>
        </div>


        {/* Botões dos filtros */}
        {showExpertise && (
          <div className="expertises-filters">
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

        {/* LISTA DE PERÍCIAS SELECIONADAS */}
        <ul className="selected-expertises-list">
          {filteredExpertises.length === 0 ? (
            <li className="empty-list-message">Nenhuma perícia adicionada</li>
          ) : (
            filteredExpertises.map((expertise) => (
              <li key={expertise.id} className="selected-expertise-item">
                <div className="selected-expertise-info">
                  <span className="selected-expertise-cost">
                    {getCost(expertise)} pts
                  </span>

                  <span className="selected-expertise-name">
                    {expertise.name}
                    {expertise.isAllowedLevel ? ` (Nível ${expertise.level ?? 1})` : ""}
                  </span>

                  <span id="icons">
                    {getIcon(expertise)}
                  </span>

                  <span className="selected-expertise-level">
                    {expertise.level}
                  </span>

                  <button
                    className="remove-expertise-btn"
                    onClick={() => removeExpertise(expertise.id)}
                    title="Remover Perícia"
                  >
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>

        
      </div >

      {showExpertiseModal && (
          <ExpertiseModal onClose={closeExpertiseModal} />
        )}
    </>
  );
}