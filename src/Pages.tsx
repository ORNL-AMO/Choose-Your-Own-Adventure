/**
 * Symbols (enums) to represent each page. Used as indexes for pageControls as well as 
 * lists like app.state.selectedProjects. Any time "Page symbol" is mentioned in documentation,
 * it means one of the symbols declared inside the `Pages` object.
 * 
 * To convert into a string, use the property `description`, e.g. `Pages.start.description`
 */
const Pages = {
	start: Symbol('start'),
	introduction: Symbol('introduction'),
	selectGameSettings: Symbol('selectGameSettings'),
	selectScope: Symbol('selectScope'),
	scope1Projects: Symbol('scope1Projects'),
	scope2Projects: Symbol('scope2Projects'),
	yearRecap: Symbol('year-recap'),
	winGame: Symbol('win-game'),
	loseGame: Symbol('lose-game'),
	endGameDialog: Symbol('end-game-dialog'),
	endGameReport: Symbol('end-game-report'),
	submitScoreForm: Symbol('submit-score-form'),
	scoreBoard: Symbol('score-board'),
	// below: scope 1 projects
	wasteHeatRecovery: Symbol('waste-heat-recovery'),
	wasteHeatRecoveryRebate: Symbol('waste-heat-recovery-rebate'),
	digitalTwinAnalysis: Symbol('digital-twin-analysis'),
	processHeatingUpgrades: Symbol('process-heating-upgrades'),
	hydrogenPoweredForklifts: Symbol('hydrogen-powered-forklifts'),
	electricBoiler: Symbol('electric-boiler'),
	blendedFuel: Symbol('blended-fuel'),
	landfillGasForOven: Symbol('landfill-gas-for-oven'),
	heatPumpForOffice: Symbol('heat-pump-for-office'),
	solarThermalHotWater: Symbol('solar-thermal-for-hot-water'),
	// below: scope 2 projects
	lightingUpgrades: Symbol('explore-lighting-upgrades'),
	greenPowerTariff: Symbol('green-power-tariff'),
	smallVPPA: Symbol('wind-vppa'),
	midVPPA: Symbol('mid-vppa'),
	largeVPPA: Symbol('large-vppa'),
	largeWind: Symbol('large-wind'),
	communityWindProject: Symbol('community-wind-project'),
	midSolar: Symbol('mid-solar'),
	solarPanelsCarPort: Symbol('solar-panels-car-port'),
	solarRooftop: Symbol('solar-rooftop'),
	// solarFieldOnSite: Symbol('solar-field-on-site'),
	airHandingUnitUpgrades: Symbol('air-handing-unit-upgrades'),
	advancedEnergyMonitoring: Symbol('advanced-energy-monitoring'),
	condensingEconomizerInstallation: Symbol('condensing-economizer-installation'),
	boilerControl: Symbol('boiler-control'),
	steamTrapsMaintenance: Symbol('steam-traps-maintenance'),
	improvePipeInsulation: Symbol('improve-pipe-insulation'), 
	compressedAirSystemImprovemnt: Symbol('compressed-air-system-improvemnt'),
	compressedAirSystemOptimization: Symbol('compressed-air-system-optimization'),
	chilledWaterMonitoringSystem: Symbol('chilled-water-monitoring-system'),
	refrigerationUpgrade: Symbol('refrigeration-upgrade'),
	loweringCompressorPressure : Symbol('lowering-compressor-pressure'),
	improveLightingSystems: Symbol('improve-lighting-systems'),
	startShutOff: Symbol('start-shut-off'),
	installVFDs1: Symbol('install-VFDs-1'),
	installVFDs2: Symbol('install-VFDs-2'),
	installVFDs3: Symbol('install-VFDs-3'),
	reduceFanSpeeds: Symbol('reduce-fan-speeds'),
	lightingOccupancySensors: Symbol('lighting-occupancy-sensors'),
	thProgramableHVAC: Symbol('th-programable-HVAC'),
	thAirCurtainDoors: Symbol('th-air-curtain-doors'),
	turnOffOneRTO: Symbol('turn-off-one-RTO'),
	thReduceCombustionAirFlow: Symbol('th-reduce-combustion-air-flow'),
	thRunDriersOnly: Symbol('th-run-driers-only'),
};

/**
 * Custom error class related to Pages.
 */
export class PageError extends Error {
	constructor(message) {
		super(message);
	}
}

export default Pages;