import { useState, useEffect } from "react";

// Icons
import FilterAltTwoToneIcon from "@mui/icons-material/FilterAltTwoTone";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";
import {
  GiWindHole, GiMuscleUp, GiTalk, GiTeleport, GiStoneSphere, GiMagicSwirl, GiHealthNormal,
  GiSun, GiSpellBook, GiBrain, GiSkullCrossedBones, GiPortal, GiShield, GiEyeTarget, GiWaterDrop,
  GiFire
} from "react-icons/gi";

// Modal para dicionar mágia
import MagicModal from "../../modals/magicModal"

// Informação quando passar o cursor
import Tooltip from '@mui/material/Tooltip';

// CSS
import "../../../styles/cards/sections.css";

// Controller
import { useCardStore } from "../../../stores/cardStore";

export default function MagicSection({ onLoading }) {
  // Serve para quando ele clicar no icone de filtro mostrar os botões de filtragem
  const [filterMagic, setFilterMagic] = useState("");

  // Serve para mostrar a lista de ampliações
  const [showMagic, setShowMagic] = useState(false);

  // Serve para ver se o modal está ou não na tela
  const [showMagicModal, setShowMagicModal] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    Air: false,
    BodyControl: false,
    CommunicationandEmpathy: false,
    Displacement: false,
    Earth: false,
    Enchantment: false,
    Fire: false,
    Healing: false,
    LightandDark: false,
    Metamagic: false,
    MindControl: false,
    Necromancy: false,
    Portal: false,
    ProtectionandWarning: false,
    Recognition: false,
    Water: false,
  });

  // ──────────────────────────────────────────────
  // Store — ampliações já selecionadas pelo usuário
  // ──────────────────────────────────────────────
  const magic = useCardStore((state) => state.magics);
  const removeMagic = useCardStore((state) => state.removeMagic);

  // ──────────────────────────────────────────────
  // Buscar mágias do cardStore ao carregar a pagina
  // ──────────────────────────────────────────────
  useEffect(() => {
    async function loadMagics() {
      try {

        const storedMagics = useCardStore.getState().magics;

        onLoading(false);

      } catch (error) {
        console.error("Erro:", error);
        onLoading(false);
      }
    }

    loadMagics();
  }, []);

  // Funções para abrir e fechar o modal de adicionar ampliações
  function openMagicModal() {
    setShowMagicModal(true);
  }
  function closeMagicModal() {
    setShowMagicModal(false);
  }

  // Filtra a lista de ampliações já adicionadas pelo texto de busca
  const magicFilters = magic.filter((magic) =>
    magic.name?.toLowerCase().includes(filterMagic.toLowerCase())
  );

  function handleToggleMagic() {
    setShowMagic((prev) => !prev);
  }

  // Ativa ou desativa um filtro de tipo
  function toggleFilter(type) {
    setFilters((prev) => ({
      ...prev,
      [type]: !prev[type],
    }));
  }

  // Calcula o custo de uma ampliação considerando o nível atual
  function getCost(magic) {
    const level = magic.level ?? 1;

    const base = Number(magic.baseCost ?? 0);
    const variable = Number(magic.variableCost ?? 0);

    if (!magic.costIsVariable) return base;

    return base + level * variable;
  }

  function hasType(magic, typeName) {
    return magic.types?.some((item) => item.type?.name === typeName);
  }

  function getIcon(magic) {
    const icons = [];

    if (hasType(magic, "Air")) {
      icons.push(<Tooltip title="Ar" arrow key="Air"><GiWindHole /></Tooltip>);
    }
    if (hasType(magic, "BodyControl")) {
      icons.push(<Tooltip title="Controle do Corpo" arrow key="BodyContro"><GiMuscleUp /></Tooltip>);
    }
    if (hasType(magic, "CommunicationandEmpathy")) {
      icons.push(<Tooltip title="Comunicação e Empatia" arrow key="CommunicationandEmpathy"><GiTalk /></Tooltip>);
    }
    if (hasType(magic, "Displacement")) {
      icons.push(<Tooltip title="Deslocamento" arrow key="Displacement"><GiTeleport /></Tooltip>);
    }
    if (hasType(magic, "Earth")) {
      icons.push(<Tooltip title="Terra" arrow key="Earth"><GiStoneSphere /></Tooltip>);
    }
    if (hasType(magic, "Enchantment")) {
      icons.push(<Tooltip title="Encantamento" arrow key="Enchantment"><GiMagicSwirl /></Tooltip>);
    }
    if (hasType(magic, "Fire")) {
      icons.push(<Tooltip title="Fogo" arrow key="Fire"><GiFire /></Tooltip>);
    }
    if (hasType(magic, "Healing")) {
      icons.push(<Tooltip title="Cura" arrow key="Healing"><GiHealthNormal /></Tooltip>);
    }
    if (hasType(magic, "LightandDark")) {
      icons.push(<Tooltip title="Luz e Trevas" arrow key="LightandDark"><GiSun /></Tooltip>);
    }
    if (hasType(magic, "Metamagic")) {
      icons.push(<Tooltip title="Metamagia" arrow key="Metamagic"><GiSpellBook /></Tooltip>);
    }
    if (hasType(magic, "MindControl")) {
      icons.push(<Tooltip title="Controle Mental" arrow key="MindControl"><GiBrain /></Tooltip>);
    }
    if (hasType(magic, "Necromancy")) {
      icons.push(<Tooltip title="Necromancia" arrow key="Necromancy"><GiSkullCrossedBones /></Tooltip>);
    }
    if (hasType(magic, "Portal")) {
      icons.push(<Tooltip title="Portal" arrow key="Portal"><GiPortal /></Tooltip>);
    }
    if (hasType(magic, "ProtectionandWarning")) {
      icons.push(<Tooltip title="Proteção e Aviso" arrow key="ProtectionandWarning"><GiShield /></Tooltip>);
    }
    if (hasType(magic, "Recognition")) {
      icons.push(<Tooltip title="Reconhecimento" arrow key="Recognition"><GiEyeTarget /></Tooltip>);
    }
    if (hasType(magic, "Water")) {
      icons.push(<Tooltip title="Água" arrow key="Water"><GiWaterDrop /> </Tooltip>);
    }
    return icons;
  }


  return (
    <>
      {/* MAGIA */}
      
      <div className="magic-box">

        {/* Titulo junto com botão "+" para abrir o modal de mágias */}
        <div className="box-header">
          <label>Buscar Magia:</label>

          <Tooltip title="Adicionar Mágias" arrow>
            <AddIcon className="add-magic" onClick={openMagicModal} />
          </Tooltip>
        </div>

        {/* Input */}
        <div className="input-magic">
          <input
            type="text"
            placeholder="Digite o nome da magia"
            value={filterMagic}
            onChange={(e) => setFilterMagic(e.target.value)}
          />

          {/* Icone de filtro */}
          <Tooltip title="Filtrar Mágias" arrow>
            <FilterAltTwoToneIcon className="filter-icon" onClick={handleToggleMagic} />
          </Tooltip>
        </div>


        {showMagic && (
          <div className="magics-filters">
            <button id="btn-water" className={filters.Water ? "active" : ""} onClick={() => toggleFilter("Water")}>
              Água
            </button>

            <button id="btn-air" className={filters.Air ? "active" : ""} onClick={() => toggleFilter("Air")}>
              Ar
            </button>

            <button id="btn-communication" className={filters.CommunicationandEmpathy ? "active" : ""} onClick={() => toggleFilter("CommunicationandEmpathy")}>
              Comunicação e Empatia
            </button>

            <button id="btn-body" className={filters.BodyControl ? "active" : ""} onClick={() => toggleFilter("BodyControl")}>
              Controle do Corpo
            </button>

            <button id="btn-mind" className={filters.MindControl ? "active" : ""} onClick={() => toggleFilter("MindControl")}>
              Controle Mental
            </button>

            <button id="btn-healing" className={filters.Healing ? "active" : ""} onClick={() => toggleFilter("Healing")}>
              Cura
            </button>

            <button id="btn-displacement" className={filters.Displacement ? "active" : ""} onClick={() => toggleFilter("Displacement")}>
              Deslocamento
            </button>

            <button id="btn-enchantment" className={filters.Enchantment ? "active" : ""} onClick={() => toggleFilter("Enchantment")}>
              Encantamento
            </button>

            <button id="btn-fire" className={filters.Fire ? "active" : ""} onClick={() => toggleFilter("Fire")}>
              Fogo
            </button>

            <button id="btn-light" className={filters.LightandDark ? "active" : ""} onClick={() => toggleFilter("LightandDark")}>
              Luz e Trevas
            </button>

            <button id="btn-metamagic" className={filters.Metamagic ? "active" : ""} onClick={() => toggleFilter("Metamagic")}>
              Metamagia
            </button>

            <button id="btn-necromancy" className={filters.Necromancy ? "active" : ""} onClick={() => toggleFilter("Necromancy")}>
              Necromancia
            </button>

            <button id="btn-portal" className={filters.Portal ? "active" : ""} onClick={() => toggleFilter("Portal")}>
              Portal
            </button>

            <button id="btn-protection" className={filters.ProtectionandWarning ? "active" : ""} onClick={() => toggleFilter("ProtectionandWarning")}>
              Proteção e Aviso
            </button>

            <button id="btn-recognition" className={filters.Recognition ? "active" : ""} onClick={() => toggleFilter("Recognition")}>
              Reconhecimento
            </button>

            <button id="btn-earth" className={filters.Earth ? "active" : ""} onClick={() => toggleFilter("Earth")}>
              Terra
            </button>
          </div>
        )}

        <div className="topics-information-magic">
          <p id="topics-points">Custo</p>
          <p id="topics-name">Nome</p>
          <p id="topics-types">Tipos</p>
          <p id="topics-duration">Tempo Duração</p>
          <p id="topics-operation">Tempo Operação</p>
          <p id="topics-level">Nível</p>
          <p id="topics-remove"></p>
        </div>

        {/* Lista de mágias selecionadas */}
        <ul className="selected-magics-list">
          {magicFilters.length === 0 ? (
            <li className="empty-list-message">Nenhuma mágia adicionada</li>
          ) : (
            magicFilters.map((magic) => (
              <li key={magic.id} className="selected-magic-item">
                <div className="selected-magic-info">

                  <span className="selected-magic-cost">
                    {getCost(magic)} pts
                  </span>

                  <span className="selected-magic-name">
                    {magic.name}
                  </span>

                  <span id="icons">
                    {getIcon(magic)}
                  </span>

                  <span className="selected-magic-duration">
                    {magic.timeDuration}
                  </span>

                  <span className="selected-magic-operation">
                    {magic.timeOperating}
                  </span>

                  <span className="selected-magic-level">
                    {magic.level}
                  </span>



                  <button className="remove-magic-btn" onClick={() => removeMagic(magic.id)} title="Remover mágia">
                    <CloseIcon fontSize="small" />
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </div>
     

      {/* Modal para adicionar mágia */}
      {showMagicModal && (
        <MagicModal onClose={closeMagicModal} />
      )}
    </>
  );
}