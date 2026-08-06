import { useState, useEffect } from "react";

import { getAdvantageById, getDisadvantageById, getLimitationById, getExpansionById, getExpertiseById, getTechniqueById, getMagicById } from "../../services/api";

import "../../styles/modals/infoModal.css";

export default function InfoModal({ onClose, Type, Id }) {
    const [information, setInformation] = useState(null);

    useEffect(() => {
        async function load() {
            try {
                await verifeType(Type, Id);
            }
            catch (error) {
                console.error(error);
                return;
            } finally {
            }
        }
        load();
    }, []);


    async function verifeType(type, id) {
        if (type === "advantage") {
            const advantage = await getAdvantageById(id);
            setInformation(advantage);
        } else if (type === "disadvantage") {
            const disadvantage = await getDisadvantageById(id);
            setInformation(disadvantage);
        } else if (type === "limitation") {
            const limitation = await getLimitationById(id);
            setInformation(limitation);
        } else if (type === "expansion") {
            const expansion = await getExpansionById(id);
            setInformation(expansion);
        } else if (type === "expertise") {
            const expertise = await getExpertiseById(id);
            setInformation(expertise);
        } else if (type === "technique") {
            const technique = await getTechniqueById(id);
            setInformation(technique);
        } else if (type === "magic") {
            const magic = await getMagicById(id);
            setInformation(magic);
        } else {
            return;
        }
    }


    return (
        <div className="overlay-info-modal" onClick={onClose}>
            <div className="modal-info" onClick={(e) => e.stopPropagation()}>

                <div className="modal-info-header">
                    <h2>{information?.name || "Erro ao carregar"}</h2>
                    <button className="close-btn-modal-info" onClick={onClose}>✕</button>
                </div>

                <div className="modal-info-subheader">
                    <h3>Descrição Completa</h3>
                    <p>{information?.fullDescription || "Erro ao carregar"}</p>
                </div>

                <div className="modal-info-variable-cost">
                    <h3>Custo Variável:</h3>
                    <p>{information?.variableCost || "Erro ao carregar"}</p>
                </div>

                <div className="modal-info-max-level">
                    <h3>Max Level:</h3>
                    <p>{information?.maxLevel || "Erro ao carregar"}</p>
                </div>

                <div className="modal-info-formula">
                    <h3>Formula:</h3>
                    <p>{information?.formula || "Erro ao carregar"}</p>
                </div>

                <div className="modal-info-formula-description">
                    <h3>Descrição da Fórmula</h3>
                    <p>{information?.formulaDescription || "Erro ao carregar"}</p>
                </div>

                <div className="modal-info-effect">
                    <h3>Efeitos:</h3>
                    <ul>
                        {information?.effects?.map((effect) => (
                            <li key={effect.id}>
                                {effect.display}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
}