import { theme } from './components/theme';

/**
 * Stats that are tracked throughout gameplay. 
 * 
 * 
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
	 * Hydrogen, in millions of British Thermal Units (MMBTU, for reasons)
	 */
	hydrogenMMBTU: number;
	/**
	 * Cost of Hydrogen, per MMBTU.
	 */
	hydrogenCostPerMMBTU: number;
	/**
	 * Emissions of Hydrogen, per MMBTU.
	 */
	hydrogenEmissionsPerMMBTU: number;

	/**
	 * Serves as rebate applier for statsRecapAppliers
	 */
	yearRebates?: number;
	/**
	 * Budget for the year
	 */
	yearBudget: number;
	/**
	 * Available finances at any time 
	 */
	financesAvailable: number;
	/**
	 * 
	 */
	carbonSavingsPercent: number;
	/**
	 * 
	 */
	carbonEmissions: number;
	/**
	 * 
	 */
	carbonSavingsPerKg: number;
	/**
	 * Emissions savings in kg coming from projects with absolute/static savings
	 */
	absoluteCarbonSavings: number;
	/**
	 * Cost per carbon kg savings
	 */
	costPerCarbonSavings: number;
	/**
	 * Year Costs applied IN-YEAR from project implementation. Does NOT include hidden costs or rebates
	 */
	implementationSpending: number;
	/**
	 * Year Hidden costs applied at Year Recap 
	 */
	hiddenSpending: number;
	/**
	 * End of year total spending, adusted for hidden costs and  rebates
	 */
	yearEndTotalSpending: number;
	/**
	 * Current year of game
	 */
	currentGameYear: number;
	/**
	 * When in shortened game: apply value to curent year for display
	 */
	gameYearDisplayOffset: number;
	/**
	 * Game years are playable in increments of 1 or 2
	 */
	gameYearInterval: number;
}

export interface YearCostSavings {
	naturalGas: number,
	electricity: number,
	hydrogen: number
}

/**
 * The initial state of TrackedStats
 */
export const initialTrackedStats: TrackedStats = {
	naturalGasMMBTU: 4_000, 
	naturalGasCostPerMMBTU: 5,
	naturalGasEmissionsPerMMBTU: 53.06, // NG is 53.06 kgCO2/MMBTU
	electricityUseKWh: 4_000_000, 
	electricityCostPerKWh: 0.10,
	electricityEmissionsPerKWh: 0.40107, // electricity is 0.40107 kgCO2/kWh
	hydrogenMMBTU: 2_000,
	hydrogenCostPerMMBTU: 40,
	hydrogenEmissionsPerMMBTU: 0,
	carbonSavingsPercent: 0,
	financesAvailable: 150_000,
	yearBudget: 150_000,
	carbonEmissions: -1, // auto calculated in the next line
	carbonSavingsPerKg: 0, 
	absoluteCarbonSavings: 0,
	costPerCarbonSavings: 0,
	implementationSpending: 0,
	hiddenSpending: 0,
	yearEndTotalSpending: 0,
	currentGameYear: 1,
	gameYearDisplayOffset: 1,
	gameYearInterval: 1
};

initialTrackedStats.carbonEmissions = calculateEmissions(initialTrackedStats);

export function calculateEmissions(stats: TrackedStats): number {
	let ngEmissions = stats.naturalGasMMBTU * stats.naturalGasEmissionsPerMMBTU;
	let elecEmissions = stats.electricityUseKWh * stats.electricityEmissionsPerKWh;
	return ngEmissions + elecEmissions;
}

export function setCarbonEmissionsAndSavings(newStats: TrackedStats, defaultTrackedStats: TrackedStats) {
	let newEmissions;
	if (newStats.absoluteCarbonSavings) {
		// WARNING - calculation assumes that projects with absoluteCarbonSavings will never have other emissions modifiers (nat gas, electricity)
		newEmissions = calculateEmissions(newStats) + newStats.absoluteCarbonSavings;
	} else {
		newEmissions = calculateEmissions(newStats);
	}

	let carbonSavingsPercent = (defaultTrackedStats.carbonEmissions - newEmissions) / (defaultTrackedStats.carbonEmissions);
	// * % CO2 saved * total initial emissions;
	newStats.carbonSavingsPerKg = carbonSavingsPercent * defaultTrackedStats.carbonEmissions;
	newStats.carbonSavingsPercent = carbonSavingsPercent;
	return newStats;
}

export function getYearCostSavings(oldStats: TrackedStats, newStats: TrackedStats): YearCostSavings {
	let oldNgCost = oldStats.naturalGasCostPerMMBTU * oldStats.naturalGasMMBTU;
	let newNgCost = newStats.naturalGasCostPerMMBTU * newStats.naturalGasMMBTU;
	
	let oldElecCost = oldStats.electricityCostPerKWh * oldStats.electricityUseKWh;
	let newElecCost = newStats.electricityCostPerKWh * newStats.electricityUseKWh;

	
	let oldHCost = oldStats.hydrogenCostPerMMBTU * oldStats.hydrogenMMBTU;
	let newHCost = newStats.hydrogenCostPerMMBTU * newStats.hydrogenMMBTU;
	
	return {
		naturalGas: oldNgCost - newNgCost,
		electricity: oldElecCost - newElecCost,
		hydrogen: oldHCost - newHCost
	};
}

/**
 * User has obtained savings milestone A and can receive a Capital Funds Reward to implement a free project
 */
export function getHasCapitalRewardMilestoneA(stats: TrackedStats): boolean {
	const capitalFundsMilestone = .15;
	return stats.carbonSavingsPercent >= capitalFundsMilestone;
}

/**
 * User has obtained savings milestone B and can receive a Capital Funds Reward to implement a free project
 */
export function getHasCapitalRewardMilestoneB(stats: TrackedStats): boolean {
	const capitalFundsMilestone = .35;
	return stats.carbonSavingsPercent >= capitalFundsMilestone;
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
		maxValue: 2_000,
	},
	electricityUseKWh: {
		label: 'Electricity use (kWh)',
		color: '#c0a020',
		textFontSize: 0.85,
		maxValue: 2_000_000,
	},
	hydrogenMMBTU: {
		label: 'Hydrogen use (MMBTU)',
		color: theme.palette.primary.light,
		textFontSize: 0.85,
		maxValue: 2_000,
	},
	carbonSavings: {
		label: 'GHG Reduction',
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