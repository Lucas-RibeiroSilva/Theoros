import { useState, useEffect, useRef } from "react";
import RaceModal from "../../modals/raceModal";
import { useCardStore } from "../../stores/cardStore";
import "../../../styles/sections/sectionsCreate.css";
import "../../../styles/cards/basic.css";
import Cropper from "react-easy-crop";

// Função para criar uma imagem a partir de uma URL
const createImage = (url) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });

// Função para gerar a imagem cortada
async function getCroppedImg(imageSrc, pixelCrop, mimeType = "image/jpeg") {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  canvas.width = pixelCrop.width;
  canvas.height = pixelCrop.height;
  const ctx = canvas.getContext("2d");

  if (!ctx) throw new Error("Não foi possível criar o canvas para o crop.");

  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    pixelCrop.width,
    pixelCrop.height
  );

  return canvas.toDataURL(mimeType);
}

export default function BasicSection({ onLoading, }) {

  useEffect(() => {
    async function load() {
      onLoading(true);

      if (!isEditing && !name && !race) {
        // Definir valores padrão
        setName('');
        setAge('');
        setHeight('');
        setHistory('');
        setRace('');
        setGender('masculine');
        setAlignment('good');

        // Atributos base
        updateAttribute('strength', 10);
        updateAttribute('dexterity', 10);
        updateAttribute('intelligence', 10);
        updateAttribute('health', 10);
        updateAttribute('life', 10);
        updateAttribute('fatigue', 10);
        updateAttribute('perception', 10);
        updateAttribute('willing', 10);
      }

      onLoading(false);
    }

    load();
  }, []);

  // Pegando tudo da store de uma vez
  const {
    isEditing,
    name,
    age,
    height,
    history,
    race,
    gender,
    alignment,
    imageURL,
    imageBase64,
    imageFile,
    pendingCropImage,
    setName,
    setAge,
    setHeight,
    setHistory,
    setRace,
    setGender,
    setAlignment,
    setImageURL,
    setImageBase64,
    setPendingCropImage,
    attributes,
    updateAttribute,
    setImageFile,
    applyRaceModifiers,
    selectedRace,
    // Adicionando a função de reset se precisar
    resetAttributes
  } = useCardStore();

  // Estado do modal de raça
  const [showRaceModal, setShowRaceModal] = useState(false);
  const main = document.querySelector('main');

  // Função para selecionar raça
  const handleSelectRace = (raceName, raceId, modifiers) => {
    // Aplica os modificadores da raça
    applyRaceModifiers(raceName, raceId, modifiers);
    // Atualiza o nome da raça no estado
    setRace(raceName, raceId);
    // Fecha o modal
    setShowRaceModal(false);
  };

  const inputImageRef = useRef(null);

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [imageToCrop, setImageToCrop] = useState(pendingCropImage || "");
  const [isProcessingCrop, setIsProcessingCrop] = useState(false);

  useEffect(() => {
    if (pendingCropImage) {
      setImageToCrop(pendingCropImage);
    }
  }, [pendingCropImage]);

  // Função para confirmar o corte da imagem
  async function handleCropConfirm() {
    if (!imageToCrop || !croppedAreaPixels) return;

    setIsProcessingCrop(true);

    try {
      const mimeType = imageFile?.type || "image/jpeg";
      const base64Image = await getCroppedImg(imageToCrop, croppedAreaPixels, mimeType);

      if (typeof setImageURL === "function") {
        setImageURL(base64Image);
      }
      if (typeof setImageBase64 === "function") {
        setImageBase64(base64Image);
      }
      if (typeof setPendingCropImage === "function") {
        setPendingCropImage("");
      }
      setImageToCrop("");
      setCroppedAreaPixels(null);
    } catch (error) {
      console.error("Erro ao gerar a imagem cortada:", error);
    } finally {
      setIsProcessingCrop(false);
    }
  }

  // Função para cancelar o corte da imagem
  function handleCropCancel() {
    setImageToCrop("");
    setPendingCropImage("");
    setImageBase64("");
    setImageURL("");
    setCroppedAreaPixels(null);
  }

  // Preview da imagem
  function handleImageChange(e) {
    const file = e.target.files?.[0];

    if (!file) return;

    if (typeof setImageFile === "function") {
      setImageFile(file);
    }
    if (typeof setImageBase64 === "function") {
      setImageBase64("");
    }
    if (typeof setPendingCropImage === "function") {
      setPendingCropImage("");
    }

    const blobURL = URL.createObjectURL(file);
    setImageToCrop(blobURL);
    if (typeof setPendingCropImage === "function") {
      setPendingCropImage(blobURL);
    }

    // permite selecionar a mesma imagem novamente
    e.target.value = "";
  }

  // Função para abrir o modal
  function openRaceModal() {
    setShowRaceModal(true);
  }

  // Função para fechar o modal
  function closeRaceModal() {
    setShowRaceModal(false);
  }

  // Função para buscar o ícone da raça
  function getIcon(raceName) {
    if (!raceName) return null;

    const raceImages = {
      "Elfo": "/races/elfo.png",
      "Humano": "/races/humano.png",
      "Anão": "/races/anão.png",
      "Orc": "/races/ogro.png",
      "Vampiro": "/races/vampiro.png",
      "Homem Fera": "/races/homem fera.png",
      "Morto Vivo": "/races/morto vivo.png"
    };

    const imagePath = raceImages[raceName];
    if (imagePath) {
      return <img src={imagePath} alt={raceName} />;
    }
    return null;
  }

  return (
    <main className="main">
      <div>
        <div className="section-create-grid">
          {/* Informações */}
          <div className="form-informations">
            {/* Imagem */}
            <div id="personagem-imagem">
              <input
                ref={inputImageRef}
                type="file"
                accept="image/*"
                id="personagem-input-imagem"
                name="personagem-imagem"
                style={{ display: "none" }}
                onChange={handleImageChange}
              />

              {!imageURL && !imageBase64 && !imageToCrop ? (

                <button className="btn-img-crop-select" type="button" onClick={() => inputImageRef.current?.click()}>
                  Selecionar imagem
                </button>

              ) : imageToCrop ? (

                <div className="crop-container">
                  <div
                    style={{
                      position: "relative",
                      width: "405px",
                      maxWidth: "100%",
                      height: "239px"
                    }}
                    onDoubleClick={() => inputImageRef.current?.click()}
                  >
                    <div style={{ width: "100%", height: "100%", overflow: "hidden", borderRadius: "10px" }}>
                      <Cropper
                        image={imageToCrop}
                        crop={crop}
                        zoom={zoom}
                        aspect={405 / 239}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={(_, croppedPixels) => setCroppedAreaPixels(croppedPixels)}
                      />
                    </div>
                  </div>

                  <div className="crop-buttons">
                    <button
                      type="button"
                      onClick={handleCropConfirm}
                      disabled={isProcessingCrop}
                      className="btn-img-crop-confirm"
                    >
                      {isProcessingCrop ? "Processando..." : "Aplicar corte"}
                    </button>
                    <button
                      type="button"
                      onClick={handleCropCancel}
                      disabled={isProcessingCrop}
                      className="btn-img-crop-cancel"
                      style={{ backgroundColor: "#8a1d1d" }}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>

              ) : (
                <div
                  style={{
                    position: "relative",
                    width: "405px",
                    height: "239px"
                  }}
                  onDoubleClick={() => inputImageRef.current?.click()}
                >
                  <img
                    src={imageBase64 || imageURL}
                    alt="Imagem do personagem"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />

                </div>
              )}
            </div>

            {/* Nome */}
            <label id="name">Nome:</label>
            <input
              type="text"
              id="input-name-card"
              placeholder="Digite o nome"
              autoComplete="off"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ0-9\s]/g, "");
              }}
            />

            {/* Gênero */}
            <label id="gender">Gênero:</label>
            <select
              id="gender-selection"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
            >
              <option value="masculino">Masculino</option>
              <option value="feminino">Feminino</option>
              <option value="outro">Outro</option>
            </select>

            {/* Altura */}
            <label id="altura">Altura:</label>
            <input
              type="number"
              id="input-height-card"
              placeholder="Digite a altura (centímetros)"
              value={height}
              maxLength={6}
              onChange={(e) => setHeight(e.target.value)}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9.,]/g, "");
              }}
            />

            {/* Idade */}
            <label id="age">Idade:</label>
            <input
              type="number"
              id="input-age-card"
              placeholder="Digite a idade"
              value={age}
              maxLength={6}
              onChange={(e) => setAge(e.target.value)}
              onInput={(e) => {
                e.target.value = e.target.value.replace(/[^0-9]/g, "");
              }}
            />

            {/* Raça */}
            <label id="raca">Raça:</label>
            <div className="race-selection">
              <p className="race-display">
                {getIcon(selectedRace || race)}
                {selectedRace || race || "Nenhuma raça selecionada"}
              </p>
              <button onClick={openRaceModal} className="btn-selected-race">
                Selecionar Raça
              </button>
            </div>
          </div>

          {/* Status */}
          <div className="form-stats">
            <label>Força (ST)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.strength.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("strength", value === "" ? 0 : Number(value));
              }}
            />
            <label>Vida (PV)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.life.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("life", value === "" ? 0 : Number(value));
              }}
            />
            <label>Destreza (DX)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.dexterity.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("dexterity", value === "" ? 0 : Number(value));
              }}
            />
            <label>Saúde (HP)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.health.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("health", value === "" ? 0 : Number(value));
              }}
            />
            <label>Fadiga (HT)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.fatigue.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("fatigue", value === "" ? 0 : Number(value));
              }}
            />
            <label>Inteligência (IQ)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.intelligence.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("intelligence", value === "" ? 0 : Number(value));
              }}
            />
            <label>Percepção (Per)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.perception.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("perception", value === "" ? 0 : Number(value));
              }}
            />
            <label>Vontade (Von)</label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={5}
              value={attributes.willing.current}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, "");
                updateAttribute("willing", value === "" ? 0 : Number(value));
              }}
            />
          </div>

          {/* Alinhamento */}
          <div className="form-history">
            <label id="alinhamento">Alinhamento:</label>
            <select
              id="select-alignment-card"
              value={alignment}
              onChange={(e) => setAlignment(e.target.value)}
            >
              <option value="Bom">Bom</option>
              <option value="Neutro">Neutro</option>
              <option value="Maligno">Maligno</option>
            </select>


            {/* História */}
            <label id="historia">História:</label>
            <textarea
              id="historia"
              name="historia"
              placeholder="Escreva a história do personagem"
              value={history}
              maxLength={10000}
              onChange={(e) => setHistory(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Modal de raça */}
      {showRaceModal && (
        <RaceModal
          onClose={closeRaceModal}
          onSelectRace={handleSelectRace}
        />
      )}
    </main>
  );
}