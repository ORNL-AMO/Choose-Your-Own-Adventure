import { theme } from './components/theme';

/**
 * Stats that are tracked throughout gameplay.
 */
export interface TrackedStats {
	/**
	 * Natural gas, in millions of British Thermal Units (MMBTU, for reasons)
	 */
	naturalGasMMBTU: number;
	/**
	 * Cost of natural gas, per MMBTU.
	 */
	naturalGasCostPerMMBTU: number;
	/**
	 * Emissions of natural gas, per MMBTU.
	 */
	naturalGasEmissionsPerMMBTU: number;
	
	/**
	 * Amount of electricity used, in kilowatt-hours (kWh).
	 */
	electricityUseKWh: number;
	/**
	 * Cost of electricity, per kWh.
	 */
	electricityCostKWh: number;
	/**
	 * Emissions of electricity production, per MMBTU.
	 */
	electricityEmissionsPerKWh: number;
	/**
	 * Keeps track of rebates from projects.
	 */
	totalRebates: number;
	
	totalBudget: number;
	financesAvailable: number;
	carbonSavings: number;
	carbonEmissions: number;
	moneySpent: number;
	/**
	 * current year, 1 through 10.
	 */
	year: number;
}

export const initialTrackedStats: TrackedStats = {
	naturalGasMMBTU: 1_000_000, 
	naturalGasCostPerMMBTU: 5,
	naturalGasEmissionsPerMMBTU: 53.06, // NG is 53.06 kgCO2/MMBTU
	
	electricityUseKWh: 1_000_000, 
	electricityCostKWh: 0.10,
	electricityEmissionsPerKWh: 0.40107, // electricity is 0.40107 kgCO2/kWh
	
	financesAvailable: 150_000,
	totalBudget: 1_000_000,
	carbonSavings: 0,
	carbonEmissions: -1, // auto calculated in the next line
	moneySpent: 0,
	totalRebates: 0,
	year: 1,
};

initialTrackedStats.carbonEmissions = calculateEmissions(initialTrackedStats);

function calculateEmissions(stats: TrackedStats): number {
	let ngEmissions = stats.naturalGasMMBTU * stats.naturalGasEmissionsPerMMBTU;
	let elecEmissions = stats.electricityUseKWh * stats.electricityEmissionsPerKWh;
	return ngEmissions + elecEmissions;
}

/**
 * Mutates the provided newStats object with the new auto-calculated stat changes. Currently automatically handled:
 * 	- carbonSavings
 * 	- carbonEmissions
 */
export function calculateAutoStats(oldStats: TrackedStats, newStats: TrackedStats) {
	newStats.carbonEmissions = calculateEmissions(newStats);
	let newSavings = (initialTrackedStats.carbonEmissions - newStats.carbonEmissions) / (initialTrackedStats.carbonEmissions); // might be wrong
	newStats.carbonSavings = newSavings;
	return newStats;
}

/**
 * exclusively for dashboardStatsGaugeProperties
 */
declare interface StatsGaugeProperties {
	label: string;
	color: string;
	textFontSize: number;
	maxValue: number;
}

/**
 * Labels and colors and stuff for some tracked stats.
 */
export const statsGaugeProperties: Dict<StatsGaugeProperties> = {
	naturalGasMMBTU: {
		label: 'Natural gas use (MMBTU)',
		color: theme.palette.primary.dark,
		textFontSize: 0.85,
		maxValue: 1_000_000,
	},
	electricityUseKWh: {
		label: 'Electricity use (kWh)',
		color: theme.palette.warning.main,
		textFontSize: 0.85,
		maxValue: 1_000_000,
	}
};