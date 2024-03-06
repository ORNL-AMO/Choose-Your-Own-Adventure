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
	winScreen: Symbol('win-screen'),
	loseScreen: Symbol('lose-screen'),
	endGameReport: Symbol('end-game-report'),
	// below: scope 1 projects
	wasteHeatRecovery: Symbol('waste-heat-recovery'),
	wasteHeatRecoveryRebate: Symbol('waste-heat-recovery-rebate'),
	digitalTwinAnalysis: Symbol('digital-twin-analysis'),
	processHeatingUpgrades: Symbol('process-heating-upgrades'),
	hydrogenPoweredForklifts: Symbol('hydrogen-powered-forklifts'),
	electricBoiler: Symbol('electric-boiler'),
	blendedFuel: Symbol('blended-fuel'),
	landfillGasForOven: Symbol('landfill-gas-for-oven'),
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