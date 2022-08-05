/**
 * Symbols (enums) to represent each page. Used as indexes for pageControls as well as 
 * lists like app.state.selectedProjects.
 * 
 * To convert into a string, use the property `description`, e.g. `Pages.start.description`
 */
const Pages = {
	start: Symbol.for('start'),
	introduction: Symbol.for('introduction'),
	selectScope: Symbol.for('selectScope'),
	scope1Projects: Symbol.for('scope1Projects'),
	scope2Projects: Symbol.for('scope2Projects'),
	yearRecap: Symbol.for('year-recap'),
	winScreen: Symbol.for('win-screen'),
	loseScreen: Symbol.for('lose-screen'),
	// scope 1 pages
	wasteHeatRecovery: Symbol.for('waste-heat-recovery'),
	wasteHeatRecoveryRebate: Symbol.for('waste-heat-recovery-rebate'),
	digitalTwinAnalysis: Symbol.for('digital-twin-analysis'),
	processHeatingUpgrades: Symbol.for('process-heating-upgrades'),
	hydrogenPoweredForklifts: Symbol.for('hydrogen-powered-forklifts'),
	electricBoiler: Symbol.for('electric-boiler'),
	// scope 2 pages
	lightingUpgrades: Symbol.for('explore-lighting-upgrades'),
	greenPowerTariff: Symbol.for('green-power-tariff'),
	windVPPA: Symbol.for('wind-vppa'),
	solarPanelsCarPort: Symbol.for('solar-panels-car-port'),
};

export class PageError extends Error {
	constructor(message) {
		super(message);
	}
}

export default Pages;