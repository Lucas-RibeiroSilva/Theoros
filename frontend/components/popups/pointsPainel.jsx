import { useMemo, useState } from "react";

import {
    useCardStore,
    getSpendingBreakdown,
    getTotalSpent,
    getRemainingPoints,
} from "../stores/cardStore";

import "../../styles/popups/pointsPainel.css";
import { FiEdit2 } from "react-icons/fi";

export default function PointsPainel() {


    const state = useCardStore();
    const [isEditing, setIsEditing] = useState(false);
    const [tempPoints, setTempPoints] = useState(state.totalPoints);

    const breakdown = useMemo(
        () => getSpendingBreakdown(state),
        [state]
    );

    const totalSpent = useMemo(
        () => getTotalSpent(state),
        [state]
    );

    const remainingPoints = useMemo(
        () => getRemainingPoints(state),
        [state]
    );

    function savePoints() {
        state.setTotalPoints(tempPoints);
        setIsEditing(false);
    }

    return (
        <div id="points-popup">
            <div className="points-box">
                <span className="points-label">Pontos:</span>

                {isEditing ? (
                    <input
                        className="points-input"
                        type="number"
                        value={tempPoints}
                        onChange={(e) => {
                            const value = Number(e.target.value);
                            const limitedValue = Math.min(Math.max(value, 1), 800000);
                            setTempPoints(limitedValue);
                        }}
                        onBlur={savePoints}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                savePoints();
                            }
                        }}
                        autoFocus
                    />
                ) : (
                    <span className="points-total">
                        {remainingPoints}
                    </span>
                )}

                <FiEdit2
                    className="points-edit"
                    onClick={() => {
                        setTempPoints(state.totalPoints);
                        setIsEditing(true);
                    }}
                    title={"Editar quantidade de pontos base"}
                />

                <span
                    className={`points-delta ${totalSpent > 0 ? "negative" : "positive"
                        }`}
                >
                    ({totalSpent > 0 ? "-" : "+"}
                    {Math.abs(totalSpent)})
                </span>

                <div className="points-tooltip">
                    <div className="tooltip-title">
                        Gastos de Pontos
                    </div>

                    <div className="tooltip-row">
                        <span>Pontos Base</span>
                        <span>{state.totalPoints}</span>
                    </div>

                    <div className="tooltip-divider" />

                    {breakdown.length === 0 ? (
                        <div className="tooltip-empty">
                            Nenhum gasto registrado
                        </div>
                    ) : (
                        <>
                            {breakdown.map((item) => (
                                <div
                                    key={item.id}
                                    className="tooltip-row"
                                >
                                    <span>{item.label}</span>

                                    <span>
                                        {item.cost > 0 ? "-" : "+"}
                                        {Math.abs(item.cost)}
                                    </span>
                                </div>
                            ))}

                            <div className="tooltip-divider" />

                            <div className="tooltip-row total">
                                <span>Disponível</span>
                                <span>{remainingPoints}</span>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}