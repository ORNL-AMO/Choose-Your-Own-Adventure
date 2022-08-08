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
	selectScope: Symbol('selectScope'),
	scope1Projects: Symbol('scope1Projects'),
	scope2Projects: Symbol('scope2Projects'),
	yearRecap: Symbol('year-recap'),
	winScreen: Symbol('win-screen'),
	loseScreen: Symbol('lose-screen'),
	// below: scope 1 projects
	wasteHeatRecovery: Symbol('waste-heat-recovery'),
	wasteHeatRecoveryRebate: Symbol('waste-heat-recovery-rebate'),
	digitalTwinAnalysis: Symbol('digital-twin-analysis'),
	processHeatingUpgrades: Symbol('process-heating-upgrades'),
	hydrogenPoweredForklifts: Symbol('hydrogen-powered-forklifts'),
	electricBoiler: Symbol('electric-boiler'),
	// below: scope 2 projects
	lightingUpgrades: Symbol('explore-lighting-upgrades'),
	greenPowerTariff: Symbol('green-power-tariff'),
	windVPPA: Symbol('wind-vppa'),
	solarPanelsCarPort: Symbol('solar-panels-car-port'),
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