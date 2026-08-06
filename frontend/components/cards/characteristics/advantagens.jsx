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

// Modal para adicionar vantagem
import AdvantageModal from "../../modals/advantagensModal";

// Puxar e enviar os dados para o controller
import { useCardStore } from "../../stores/cardStore";

// CSS
import "../../../styles/cards/sections.css"

export default function AdvantagensSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de filtragem
  const [filterAdvantage, setFilterAdvantage] = useState("");

  // Serve para ver se a lista de vantagens esta aparecendo ou não na tela
  const [showAdvantagens, setShowAdvantagens] = useState(false);

  // Serve para ver se o modal está ou não na tela
  const [showAdvantagensModal, setShowAdvantagensModal] = useState(false);
  
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
  const advantages = useCardStore((state) => state.advantages);
  const removeAdvantage = useCardStore((state) => state.removeAdvantage);

  // ──────────────────────────────────────────────
  // Buscar vantagens do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
  async function loadAdvantages() {
    try {
      
      const storedAdvantages = useCardStore.getState().advantages;
      
      onLoading(false);
      
    } catch (error) {
      console.error("Erro:", error);
      onLoading(false);
    }
  }

  loadAdvantages();
}, []);

  // Funções para abrir e fechar o modal de adicionar Vantagens
  function openAdvantagensModal() {
    setShowAdvantagensModal(true);
  }
  function closeAdvantagensModal() {
    setShowAdvantagensModal(false);
  }

  // Filtra a lista de vantagens já adicionadas pelo texto de busca
  const advantagensFilters = advantages.filter((adv) =>
    adv.name?.toLowerCase().includes(filterAdvantage.toLowerCase())
  );

  // Servirá para mostrar a lista de filtros
  function handleToggleAdvantagens() {
    setShowAdvantagens((prev) => !prev);
  }

  // Ativa ou desativa um filtro de tipo
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // Calcula o custo de uma vantagem considerando o nível atual
  function getCost(adv) {
    const level = adv.level ?? 1;

    const base = Number(adv.baseCost ?? 0);
    const variable = Number(adv.variableCost ?? 0);

    if (!adv.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(adv, typeName) {
    return adv.types?.some((type) => type.type?.name === typeName);
  }

  function getIcon(adv) {
    const icons = [];

    if (hasType(adv, "Physical"))
      icons.push(<Tooltip title="Físico" arrow key="Physical"><GiBiceps /></Tooltip>);

    if (hasType(adv, "Combat"))
      icons.push(<Tooltip title="Combate" arrow key="Combat"><GiCrossedSwords /></Tooltip>);

    if (hasType(adv, "Supernatural"))
      icons.push(<Tooltip title="Sobrenatural" arrow key="Supernatural"><TbGhost2 /></Tooltip>);

    if (hasType(adv, "Mental"))
      icons.push(<Tooltip title="Mental" arrow key="Mental"><PiBrainDuotone /></Tooltip>);

    if (hasType(adv, "Social"))
      icons.push(<Tooltip title="Social" arrow key="Social"><RiSpeakLine /></Tooltip>);

    if (hasType(adv, "Exotic"))
      icons.push(<Tooltip title="Exótico" arrow key="Exotic"><GiAngelWings /></Tooltip>);

    return icons;
  }


  return (
    <>
      {/* Esquerda da seção Características - Vantagens */}
      <div className="advantages-box">

        {/* Titulo junto com botão "+" para abrir o modal de vantagens */}
        <div className="box-header">
          <label>Buscar Vantagem:</label>

          <Tooltip title="Adicionar Vantagens" arrow>
            <AddIcon className="add-advantage" onClick={openAdvantagensModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-advantage">

          <input
            type="text"
            placeholder="Digite o nome da vantagem"
            value={filterAdvantage}
            onChange={(e) => setFilterAdvantage(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Vantagens" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={handleToggleAdvantagens} />
          </Tooltip>

        </div>


        {/* Botões dos filtros */}
        {showAdvantagens && (
          <div className="advantages-filters">
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
          </div>
        )}

        <div className="topics-information">
            <p id="topics-points">Custo</p>
            <p id="topics-name">Nome</p>
            <p id="topics-types">Tipos</p>
            <p id="topics-level">Nível</p>
            <p id="topics-remove"></p>
        </div>
        
        {/* Lista de vantagens */}
        <ul className="selected-advantagens-list">
          {advantagensFilters.length === 0 ? (
            <li className="empty-list-message">Nenhuma vantagem adicionada</li>
          ) : (
            advantagensFilters.map((adv) => (

              <li key={adv.id} className="selected-advantage-item">
                <div className="selected-advantage-info">

                  <span className="selected-advantage-cost">
                    {getCost(adv)} pts
                  </span>

                  <span className="selected-advantage-name">
                    {adv.name}
                    {adv.isAllowedLevel ? ` (Nível ${adv.level ?? 1})` : ""}
                  </span>

                  <span id="icons">
                    {getIcon(adv)}
                  </span>

                  <span className="selected-advantage-level">
                    {adv.level}
                  </span>

                  <button className="remove-advantage-btn" onClick={() => removeAdvantage(adv.id)} title="Remover vantagem">
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>

      {/* Modal para adicionar Vantagens */}
      {showAdvantagensModal && (
        <AdvantageModal onClose={closeAdvantagensModal} />
      )}
    </>
  );
}