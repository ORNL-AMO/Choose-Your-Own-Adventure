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
	electricityCostPerKWh: number;
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
	 * Total money spent, across the whole run.
	 */
	totalMoneySpent: number;
	/**
	 * current year, 1 through 10.
	 */
	year: number;
}

/**
 * The initial state of TrackedStats
 */
export const initialTrackedStats: TrackedStats = {
	naturalGasMMBTU: 1_000_000, 
	naturalGasCostPerMMBTU: 5,
	naturalGasEmissionsPerMMBTU: 53.06, // NG is 53.06 kgCO2/MMBTU
	
	electricityUseKWh: 2_000_000, 
	electricityCostPerKWh: 0.10,
	electricityEmissionsPerKWh: 0.40107, // electricity is 0.40107 kgCO2/kWh
	
	financesAvailable: 150_000,
	totalBudget: 150_000,
	carbonSavings: 0,
	carbonEmissions: -1, // auto calculated in the next line
	moneySpent: 0,
	totalMoneySpent: 0,
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
export function calculateAutoStats(newStats: TrackedStats) {
	newStats.carbonEmissions = calculateEmissions(newStats);
	let newSavings = (initialTrackedStats.carbonEmissions - newStats.carbonEmissions) / (initialTrackedStats.carbonEmissions); // might be wrong
	newStats.carbonSavings = newSavings;
	return newStats;
}

export function calculateYearSavings(oldStats: TrackedStats, newStats: TrackedStats) {
	let oldNgCost = oldStats.naturalGasCostPerMMBTU * oldStats.naturalGasMMBTU;
	let newNgCost = newStats.naturalGasCostPerMMBTU * newStats.naturalGasMMBTU;
	
	let oldElecCost = oldStats.electricityCostPerKWh * oldStats.electricityUseKWh;
	let newElecCost = newStats.electricityCostPerKWh * newStats.electricityUseKWh;
	
	return {
		naturalGas: oldNgCost - newNgCost,
		electricity: oldElecCost - newElecCost,
	};
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
 * @param label Italicized label to display under the gauge chart.
 * @param color Color of the chart.
 * @param textFontSize Relative font size for the displayed number.
 * @param maxValue Value the gauge chart goes up to. Can be updated when `updateStatsGaugeMaxValues` is called.
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
		color: '#c0a020',
		textFontSize: 0.85,
		maxValue: 2_000_000,
	},
	carbonSavings: {
		label: 'Carbon savings',
		color: '#000000',
		textFontSize: 1,
		maxValue: 1,
	}
};

/**
 * Update the maxValue property of `statsGaugeProperties` if any of the corresponding stats' value exceeds the existing maxValue.
 * For example, if an electrification project is selected, `electricityUseKWh.maxValue` might increase.
 */
export function updateStatsGaugeMaxValues(newStats: TrackedStats) {
	for (let key in statsGaugeProperties) {
		if (newStats[key] && newStats[key] > statsGaugeProperties[key].maxValue) {
			statsGaugeProperties[key].maxValue = newStats[key];
		}
	}
}