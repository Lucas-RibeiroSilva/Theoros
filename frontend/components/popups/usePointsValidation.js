// hooks/usePointsValidation.js
import { useCardStore } from "../stores/cardStore";
import { getRemainingPoints } from "../stores/cardStore";

export function usePointsValidation() {
  const state = useCardStore();
  const remainingPoints = getRemainingPoints(state);
  
  const canAddItem = (itemCost) => {
    return remainingPoints - itemCost >= 0;
  };
  
  const getPointsStatus = () => {
    return {
      remaining: remainingPoints,
      isNegative: remainingPoints < 0,
      isZero: remainingPoints === 0,
    };
  };
  
  return {
    remainingPoints,
    canAddItem,
    getPointsStatus,
    isNegative: remainingPoints < 0,
    isZero: remainingPoints === 0,
  };
}