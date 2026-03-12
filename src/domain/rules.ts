import { TrackedStats } from "../trackedStats";

export const GAME_WINNING_ENERGY_USE_PERCENT = 0.25;

export const getIsGameWon = (newYearTrackedStats: TrackedStats) => {
    return newYearTrackedStats.operationEnergyUsePercent >= GAME_WINNING_ENERGY_USE_PERCENT;
};