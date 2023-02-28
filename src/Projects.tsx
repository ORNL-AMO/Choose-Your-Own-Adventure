import React from 'react';
import type { AppState, NextAppState } from './App';
import type App from './App';
import type { ButtonGroupButton } from './components/Buttons';
import { closeDialogButton } from './components/Buttons';
import { infoButtonWithDialog, selectButtonCheckbox } from './components/Buttons';
import type { TrackedStats } from './trackedStats';
import type { Choice } from './components/GroupedChoices';
import type { DialogCardContent } from './components/InfoDialog';
import { theme } from './components/theme';
import FlameIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import FactoryIcon from '@mui/icons-material/Factory';
import Pages from './Pages';
import { Alert } from '@mui/material';
import TrafficConeIcon from './icons/TrafficConeIcon';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';

let st = performance.now();

// IMPORTANT: Keep Scope1Projects and Scope2Projects up to date as you add new projects!!!!!!
// These lists (Scope1Projects and Scope2Projects) keep track of WHICH projects are in WHICH scope. Currently, they are used to give a warning to the user
// 	when they click Proceed (to Year Recap) while only having selected projects from one scope.

/**
 * List of Page symbols for projects that are in the SCOPE 1 list.
 */
export const Scope1Projects = [
	Pages.wasteHeatRecovery, Pages.digitalTwinAnalysis, Pages.processHeatingUpgrades, Pages.hydrogenPoweredForklifts, Pages.processHeatingUpgrades, Pages.electricBoiler, Pages.airHandingUnitUpgrades, Pages.advancedEnergyMonitoring, Pages.condensingEconomizerInstallation, Pages.boilerControl, Pages.steamTrapsMaintenance, Pages.improvePipeInsulation
];
/**
 * List of Page symbols for projects that are in the SCOPE 2 list.
 */
export const Scope2Projects = [
	Pages.lightingUpgrades, Pages.greenPowerTariff, Pages.windVPPA, Pages.solarPanelsCarPort, Pages.solarFieldOnsite, Pages.airHandingUnitUpgrades, Pages.advancedEnergyMonitoring, Pages.compressedAirSystemImprovemnt, Pages.compressedAirSystemOptimization, Pages.chilledWaterMonitoringSystem, Pages.refrigerationUpgrade, Pages.loweringCompressorPressure, Pages.improveLightingSystems, Pages.startShutOff, Pages.installVFDs1, Pages.installVFDs2, Pages.installVFDs3, Pages.reduceFanSpeeds, Pages.lightingOccupancySensors
];

/**
 * Dictionary of ProjectControls. The key must be a `Page` symbol (see `Pages.tsx`), 
 * and make sure the associated ProjectControl's `pageId` is the same as that key.
 */
const Projects: ProjectControls = {};

export default Projects;

export declare interface CaseStudy {
	title: string;
	text: string | string[];
	url: string;
}

declare interface RecapAvatar {
	icon: JSX.Element;
	backgroundColor?: string;
	color?: string,
}

/**
 * Hidden surprise to appear on the year recap page.
 */
declare interface RecapSurprise {
	title: string;
	text: string | string[];
	avatar: {
		icon: JSX.Element,
		backgroundColor: string,
		color: string,
	}
	img?: string;
	imgObjectFit?: 'cover'|'contain';
	imgAlt?: string;
}

/**
 * Used for tracking completed project related state throughout the view/pages
 */
export interface CompletedProject {
	selectedYear: number,
	page: symbol
}

/**
 * Parameters to pass into a ProjectControl. See code definition in `projects.tsx` for all fields and params.
 */
declare interface ProjectControlParams {
	/**
	 * Page symbol associated with this project.
	 */
	pageId: symbol;
	/**
	 * Project cost, exclusing rebates.
	 */
	cost: number;
	/**
	 * Numbers that appear on the INFO CARD, before checking the checkbox.
	 */
	statsInfoAppliers: TrackedStatsApplier;
	/**
	 * Numbers that affect the dashboard charts AND that apply when "Proceed" is clicked.
	 */
	statsActualAppliers: TrackedStatsApplier;
	/**
	 * HIDDEN numbers that appear AFTER PROCEED is clicked (after they've committed to the selected projects). TODO IMPLEMENT
	 */
	statsHiddenAppliers?: TrackedStatsApplier;
	/**
	 * Full title of the project, displayed on the choice info popup and the recap page.
	 */
	title: string;
	/**
	 * Shorter title, displayed on the choice cards.
	 */
	shortTitle: string;
	/**
	 * Info text to display in the dialog when "INFO" is clicked on the choice card.
	 */
	choiceInfoText: string | string[];
	/**
	 * Image to display in the dialog when "INFO" is clicked on the choice card.
	 */
	choiceInfoImg?: string;
	/**
	 * "Alt text", i.e. image description, to display in the dialog when "INFO" is clicked on a choice card.
	 */
	choiceInfoImgAlt?: string;
	/**
	 * object-fit property in the image displayed in the dialog when "INFO" is clicked on the choice card.
	 * `'cover'` makes it stretch to the boundaries of the card, and `'contain'` makes the entire image visible.
	 * If `'contain'` is selected, then a larger, blurred version of the image will be visible behind the regular image (for visual appeal/interest)
	 */
	choiceInfoImgObjectFit?: 'cover' | 'contain';
	/**
	 * Extra text to display on the Year Recap page when the project has been selected.
	 */
	recapDescription: string | string[];
	/**
	 * Icon to be shown in the year recap page.
	 */
	recapAvatar?: RecapAvatar;
	rebateAvatar?: RecapAvatar;
	/**
	 * Button to go between "INFO" and "SELECT" on the project selection page. 
	 * 
	 * Recommended: Include a visual startIcon to represent the **type** of project (e.g. flame, smoke, CO2)
	 * and a number or percentage to represent the effect this project will have.
	 */
	previewButton?: ButtonGroupButton;
	utilityRebateValue?: number
	/**
	 * Surprises that appear AFTER PROCEED is clicked (after they've committed to the selected projects).
	 */
	recapSurprises?: RecapSurprise[];
	/**
	 * External case study for a project, i.e., example of a real company doing that project idea.
	 * @param {string} title
	 * @param {string|string[]} text
	 * @param {string} url 
	 */
	caseStudy?: CaseStudy;
	/**
	 * Whether the project will be visible. For example, only show if a PREVIOUS Project has been selected, or if the year is at least 3.
	 */
	visible?: Resolvable<boolean>;
	/**
	 * Whether the project card should appear disabled.
	 */
	disabled?: Resolvable<boolean>;
	/**
	 * tracks the year the project is selected 
	 */
	yearSelected?: number;
}

export class ProjectControl implements ProjectControlParams {

	pageId: symbol;
	cost: number;
	statsInfoAppliers: TrackedStatsApplier;
	statsActualAppliers: TrackedStatsApplier;
	statsHiddenAppliers?: TrackedStatsApplier;
	title: string;
	shortTitle: string;
	choiceInfoText: string | string[];
	choiceInfoImg?: string;
	choiceInfoImgAlt?: string;
	choiceInfoImgObjectFit?: 'cover' | 'contain';
	recapDescription: string | string[];
	previewButton?: ButtonGroupButton;
	utilityRebateValue?: number;
	recapSurprises?: RecapSurprise[]; //todo
	caseStudy?: CaseStudy;
	recapAvatar: RecapAvatar;
	rebateAvatar: RecapAvatar;
	visible: Resolvable<boolean>;
	disabled: Resolvable<boolean>;
	yearSelected?: number;

	/**
	 * Project Control constructor. See `ProjectControlParams` for details on each parameter.
	 * @param params 
	 */
	constructor(params: ProjectControlParams) {
		this.pageId = params.pageId;
		this.statsInfoAppliers = params.statsInfoAppliers;
		this.statsActualAppliers = params.statsActualAppliers;
		this.statsHiddenAppliers = params.statsHiddenAppliers;
		this.title = params.title;
		this.shortTitle = params.shortTitle;
		this.choiceInfoText = params.choiceInfoText;
		this.choiceInfoImg = params.choiceInfoImg;
		this.choiceInfoImgAlt = params.choiceInfoImgAlt;
		this.choiceInfoImgObjectFit = params.choiceInfoImgObjectFit;
		this.recapDescription = params.recapDescription;
		this.recapAvatar = params.recapAvatar || {
			backgroundColor: undefined,
			icon: <FactoryIcon />
		};
		this.rebateAvatar = params.rebateAvatar || {
			icon: <ThumbUpAltIcon />,
			backgroundColor: 'rgba(255,255,255,0.8)',
			color: 'rgba(63, 163, 0, 1)',
		};
		this.previewButton = params.previewButton;
		this.caseStudy = params.caseStudy;
		if (params.utilityRebateValue) this.utilityRebateValue = params.utilityRebateValue;
		else this.utilityRebateValue = 0;
		this.recapSurprises = params.recapSurprises;
		this.visible = params.visible || true; // Default to true
		this.disabled = params.disabled || false; // Default to false
		this.cost = params.cost;
		this.yearSelected = params.yearSelected;
	}

	/**
	 * Applies this project's stat changes by mutating the provided TrackedStats object.
	 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
	 */
	applyStatChanges(mutableStats: TrackedStats) {
		for (let key in this.statsActualAppliers) {
			let thisApplier = this.statsActualAppliers[key];
			if (!thisApplier) return;
			mutableStats[key] = thisApplier.applyValue(mutableStats[key]);
		}
		// Now, apply the change to finances
		this.applyCost(mutableStats);
	}

	/**
	 * Applies this project's cost & rebates by mutating the provided TrackedStats object.
	 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
	 */
	applyCost(mutableStats: TrackedStats) {
		let rebates = this.getRebates();
		mutableStats.financesAvailable -= this.cost - rebates;
		mutableStats.moneySpent += this.cost;
		mutableStats.totalBudget += rebates;
	}

	/**
	 * Un-applies this project's stat changes by mutating the provided TrackedStats object.
	 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
	 */
	unApplyStatChanges(mutableStats: TrackedStats) {
		for (let key in this.statsActualAppliers) {
			let thisApplier = this.statsActualAppliers[key];
			if (!thisApplier) return;
			mutableStats[key] = thisApplier.unApplyValue(mutableStats[key]);
		}
		// Now, apply the change to finances
		this.unApplyCost(mutableStats);
	}

	/**
	 * Un-applies this project's cost & rebates by mutating the provided TrackedStats object.
	 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
	 */
	unApplyCost(mutableStats: TrackedStats) {
		let rebates = this.getRebates();
		mutableStats.financesAvailable += this.cost - rebates;
		mutableStats.moneySpent -= this.cost;
		mutableStats.totalBudget -= rebates;
	}

	/**
	 * Returns the total amount of rebates of this project.
	 */
	getRebates(): number {
		return (this.statsActualAppliers.totalRebates) ? this.statsActualAppliers.totalRebates.modifier : 0;
	}

	/**
	 * Returns the extra hidden costs of the projects (via the `moneySpent` stat key)
	 */
	getHiddenCost(): number {
		return (this.statsHiddenAppliers && this.statsHiddenAppliers.moneySpent) ? this.statsHiddenAppliers.moneySpent.modifier : 0;
	}

	/**
	 * Returns the net cost of this project, including rebates (and in future, surprise hitches)
	 */
	getNetCost(): number {
		return this.cost - this.getRebates() + this.getHiddenCost();
	}

	/**
	 * Gets a Choice control for the GroupedChoices pages in PageControls.tsx
	 */
	getChoiceControl(): Choice {

		const self = this; // for use in bound button handlers

		let cards: DialogCardContent[] = [];

		cards.push({
			text: `Total project cost: {$${(this.cost).toLocaleString('en-US')}}`,
			color: theme.palette.secondary.dark, // todo change?
		});

		if (this.statsInfoAppliers.naturalGasMMBTU) {
			cards.push({
				text: `Natural gas reduction: {${this.statsInfoAppliers.naturalGasMMBTU.toString(true)}}`,
				color: theme.palette.primary.light, // todo change?
			});
		}
		if (this.statsInfoAppliers.electricityUseKWh) {
			cards.push({
				text: `Electricity reduction: {${this.statsInfoAppliers.electricityUseKWh.toString(true)}}`,
				color: theme.palette.warning.light, // todo change?
			});
		}
		// todo more stats

		let buttons: ButtonGroupButton[] = [];
		// Info button
		buttons.push(infoButtonWithDialog({
			title: this.title,
			text: this.choiceInfoText,
			img: this.choiceInfoImg,
			imgAlt: this.choiceInfoImgAlt,
			imgObjectFit: this.choiceInfoImgObjectFit,
			cards: cards,
			buttons: [
				closeDialogButton(),
				{
					text: 'Select',
					variant: 'text',
					onClick: function (state, nextState) {
						// If the project is already selected, do nothing.
						if (state.selectedProjects.includes(self.pageId)) {
							return state.currentPage;
						}
						// if the project is NOT selected, run the toggle function to select the project.
						return toggleProjectSelect.apply(this, [state, nextState]);
					},
					// disabled when the project is selected
					disabled: (state) => state.selectedProjects.includes(self.pageId)
				}
			]
		}));
		// Preview button (e.g. co2 savings button)
		if (this.previewButton) buttons.push(this.previewButton);
		// Select checkbox button, with live preview of stats
		buttons.push(selectButtonCheckbox(toggleProjectSelect, undefined, (state) => state.selectedProjects.includes(this.pageId)));

		return {
			text: this.shortTitle,
			buttons: buttons,
			visible: function (state) {
				// Hide the project if it's already been completed
				if (state.completedProjects.some(project => project.page === self.pageId)) return false;
				// otherwise, use the visible attribute provided by the project props (Default true)
				else return this.resolveToValue(self.visible, true);
			},
			key: this.pageId.description,
			disabled: this.disabled,
		};


		/**
		 * Action to toggle whether the project is selected, after a select button is clicked.
		 */
		function toggleProjectSelect(this: App, state: AppState, nextState: NextAppState) {
			let selectedProjects = state.selectedProjects.slice();
			let newTrackedStats = { ...state.trackedStats };
			// IF PROJECT IS ALREADY SELECTED
			if (selectedProjects.includes(self.pageId)) {
				// Since the order of projects matters, we can't simply unApplyChanges to ourself.
				// 	We must first undo all the stat changes in REVERSE ORDER, then re-apply all but this one.
				for (let i = selectedProjects.length - 1; i >= 0; i--) {
					let pageId = selectedProjects[i];
					Projects[pageId].unApplyStatChanges(newTrackedStats);
				}

				selectedProjects.splice(selectedProjects.indexOf(self.pageId), 1);

				for (let i = 0; i < selectedProjects.length; i++) {
					let pageId = selectedProjects[i];
					Projects[pageId].applyStatChanges(newTrackedStats);
				}
			}
			// IF PROJECT IS NOT ALREADY SELECTED
			else {
				let rebates = self.getRebates();
				// Figure out if this project can be afforded
				if ((self.cost - rebates) > state.trackedStats.financesAvailable) {
					this.summonSnackbar(<Alert severity='error'>You cannot afford this project with your current budget!</Alert>);
					return state.currentPage;
				}

				selectedProjects.push(self.pageId);
				self.applyStatChanges(newTrackedStats);

			}
			nextState.selectedProjects = selectedProjects;
			nextState.trackedStats = newTrackedStats;

			return state.currentPage; // no page change
		}
	}
}

/* -======================================================- */
//                   PROJECT CONTROLS
/* -======================================================- */

Projects[Pages.wasteHeatRecovery] = new ProjectControl({
	// Page symbol associated with the project. MUST BE THE SAME AS WHAT APPEARS IN Projects[...]
	pageId: Pages.wasteHeatRecovery,
	// project cost, in dollars
	cost: 65_000,
	// Stats that appear in the CARDS inside the INFO DIALOG.
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-250), // reduces natural gas usage by a flat 50,000
	},
	// Stats that 
	statsActualAppliers: {
		totalRebates: absolute(5_000),
		naturalGasMMBTU: absolute(-250),
	},
	// Stats that are HIDDEN until AFTER the user commits to the next year. 
	statsHiddenAppliers: {},
	title: 'Energy Efficiency - Waste Heat Recovery',
	shortTitle: 'Upgrade heat recovery on boiler/furnace system',
	choiceInfoText: [
		'Currently, your facility uses {inefficient, high-volume} furnace technology, where {combustion gases} are evacuated through a side take-off duct into the emission control system',
		'You can invest in capital improvements to {maximize waste heat recovery} at your facility through new control system installation and piping upgrades.'
	],
	recapDescription: 'Insert flavor text here!',
	choiceInfoImg: 'images/waste-heat-recovery.png',
	choiceInfoImgAlt: '', // What is this diagram from the PPT?
	choiceInfoImgObjectFit: 'contain',
	// List of surprise dialogs to show to the user when the hit select THE FIRST TIME.
	utilityRebateValue: 5000,
	// Case study to show in the year recap
	caseStudy: {
		title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
		url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
		text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
	},
	// Bit of text to preview what to expect from the project.
	previewButton: {
		text: '250',
		variant: 'text',
		startIcon: <FlameIcon />
	},
	// SEE BELOW: EXAMPLE FOR CONDITIONAL PROJECT VISIBILITY - you can also do something like state.completedProjects.includes(Pages.myOtherProject)
	// visible: function (state: AppState) {
	// 	return state.trackedStats.year >= 2;
	// }
});

Projects[Pages.digitalTwinAnalysis] = new ProjectControl({
	pageId: Pages.digitalTwinAnalysis,
	cost: 90_000,
	statsInfoAppliers: {
		naturalGasMMBTU: relative(-0.02),
	},
	statsActualAppliers: {
		naturalGasMMBTU: relative(-0.02),
	},
	title: 'Energy Efficiency - Digital Twin Analysis',
	shortTitle: 'Conduct digital twin analysis',
	choiceInfoText: [
		'A digital twin is the virtual representation of a physical object or system across its lifecycle.',
		'You can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
	],
	recapDescription: 'Insert flavor text here!',
	choiceInfoImg: 'images/chiller-systems-in-plant.png',
	choiceInfoImgAlt: 'A 3D model of the chiller systems in a plant',
	choiceInfoImgObjectFit: 'contain',
	caseStudy: {
		title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
		url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
		text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
	},
	previewButton: {
		text: '2.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	}
});

Projects[Pages.processHeatingUpgrades] = new ProjectControl({
	pageId: Pages.processHeatingUpgrades,
	cost: 80_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.025),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.025),
	},
	title: 'Energy Efficiency – Process Heating Upgrades',
	shortTitle: 'Explore efficient process heating upgrades',
	choiceInfoText: [
		'Currently, your facility has an {inefficient} body-on-frame paint process. The paint process is served by a variety of applications including compressed air, pumps and fans, as well as steam for hot water.',
		'You can invest in a new, upgraded paint process that is more {energy efficient}, {eliminates} steam to heat water, {re-circulates} air, and uses {lower temperatures}.'
	],
	choiceInfoImg: 'images/car-manufacturing.png',
	choiceInfoImgAlt: 'The frame of a car inside a manufacturing facility.',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Nissan North America: New Paint Plant',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/waupaca-foundry-cupola-waste-heat-recovery-upgrade-drives-deeper-energy-savings',
		text: 'In 2010, {Nissan’s Vehicle Assembly Plant} in Smyrna, Tennessee is {40%} more energy efficient than its predecessor, using an innovative “3-Wet” paint process that allows for the removal of a costly high temperature over bake step.'
	},
	previewButton: {
		text: '2.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.hydrogenPoweredForklifts] = new ProjectControl({
	pageId: Pages.hydrogenPoweredForklifts,
	cost: 100_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Fuel Switching – Hydrogen Powered Forklifts',
	shortTitle: 'Switch to hydrogen powered forklifts',
	choiceInfoText: [
		'Currently, your facility uses {lead acid} batteries to power your mobile forklifts, which yields {high} maintenance costs and {low} battery life for each forklift.',
		'You can replace these batteries with {hydrogen fuel cell} batteries, which will result in {lower} maintenance costs, {longer} battery life, and contribute to your facility’s {reduced} emissions.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Spring Hill Pioneers Hydrogen Fuel Cell Technology For GM',
		url: 'https://www.wheelermaterialhandling.com/blog/spring-hill-pioneers-hydrogen-fuel-cell-technology-for-gm',
		text: 'In 2019, General Motors began piloting a program in which hydrogen is turned into electricity to fuel forklifts, resulting in a {38%} decrease in fleet maintenance costs and a {5-year increase} in average battery life for each forklift.'
	},
	previewButton: {
		text: '??%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.lightingUpgrades] = new ProjectControl({
	pageId: Pages.lightingUpgrades,
	cost: 12_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.125),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.125),
		totalRebates: absolute(7500),
	},
	title: 'Energy Efficiency – Lighting Upgrades',
	shortTitle: 'Explore lighting upgrades',
	choiceInfoText: [
		'Your plant currently uses {inefficient} T12 lighting. The lighting level in certain areas in the facility is {low} and affects the productivity of workers	in those areas.',
		'You could replace this lighting with LED lighting, which provides {reduced} energy consumption, a {longer} lifespan, and lighting control.'
	],
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Lennox International: LED Project At New Regional Distribution Leased Location',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/lennox-international-led-project-at-new-regional-distribution-leased-location',
		text: 'In 2016, {Lennox International} in Richardson, Texas implemented LED lighting throughout their warehouse, which resulted in annual energy savings of {$35,000.}'
	},
});

Projects[Pages.electricBoiler] = new ProjectControl({
	pageId: Pages.electricBoiler,
	cost: 50_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(200_000),
		naturalGasMMBTU: absolute(-20_000), // since the flavor text says No. 2 oil... maybe add a new stat later
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(200_000),
		naturalGasMMBTU: absolute(-20_000),
	},
	title: 'Fuel Switching - Fossel Fuel to Electric Boiler',
	shortTitle: 'Change fossil fuel boiler to an electric boiler',
	choiceInfoText: [
		'Currently, your facility operates two 700-hp firetube boilers that burn {No. 2 oil}, which releases CO_{2} into the atmosphere.',
		'You have the opportunity to replace your oil-firing boiler with an {electric} one, which will {prevent} direct carbon emissions, {minimize} noise pollution, and {reduce} air contaminants.',
	],
	recapDescription: 'Insert flavor text here!',
	// add case study
});


Projects[Pages.solarPanelsCarPort] = new ProjectControl({
	pageId: Pages.solarPanelsCarPort,
	cost: 150_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.125),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.125),
	},
	statsHiddenAppliers: {
		financesAvailable: absolute(-30_000),
		moneySpent: absolute(30_000),
	},
	recapSurprises: [{
		title: 'Uh oh - Bad Asphalt!',
		text: 'While assessing the land in person, the contractor found that the parking lot\'s {asphalt needs replacement}. This will require an {additional $30,000} for the carport’s installation.',
		avatar: {
			icon: <TrafficConeIcon />,
			backgroundColor: 'rgba(54,31,6,0.6)',
			color: 'rgb(255 135 33)',
		}
	}],
	title: 'Bundled RECs - Install Solar Panels to Facility\'s Carport',
	shortTitle: 'Install solar panels to facility\'s carport',
	choiceInfoText: [
		'You have the opportunity to add solar panels to your facility’s carport, which could yield significant {utility savings}, while providing {clean energy} to your facility.',
		'This project would include under-canopy LED lighting system installation and installation of a custom-designed carport structure.'
	],
	choiceInfoImg: 'images/solar-panels.png',
	choiceInfoImgAlt: 'Solar panels on the roof top of a car parking lot.',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Lockheed Martin 2.25 Megawatts Solar Carport',
		url: 'https://www.agt.com/portfolio-type/lockheed-martin-solar-carport/',
		text: 'In 2017, {Lockheed Martin} installed a 4-acre solar carport and was able to provide {3,595,000} kWh/year, or enough electricity to power almost {500 homes} annually.',
	},
});

Projects[Pages.solarFieldOnsite] = new ProjectControl({
	pageId: Pages.solarFieldOnsite,
	cost: 150_000,
	statsInfoAppliers: {},
	statsActualAppliers: {},
	title: 'Bundled RECs – Build Solar Field Onsite',
	shortTitle: 'Build solar field onsite',
	choiceInfoText: [
		'There is {suitable, unused} land next to your facility where weather conditions are ideal for installing ground-mounted solar panels.',
		'These solar panels could generate around {1 MWh} of electricity per year, which would {reduce} your facility’s carbon footprint by generating {zero-emission} renewable electricity.'
	],
	choiceInfoImg: 'images/solar-field.jpg',
	choiceInfoImgAlt: 'A field of solar panels.',
	recapDescription: 'Insert flavor text here!',
	// todo case study
	visible: state => state.completedProjects.some(project => project.page === Pages.solarPanelsCarPort)
});

//Empty Projects Scope 1 yr1-yr5
Projects[Pages.airHandingUnitUpgrades] = new ProjectControl({
	pageId: Pages.airHandingUnitUpgrades,
	cost: 45_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.05),
		naturalGasMMBTU: relative(-0.05),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.05),
		naturalGasMMBTU: relative(-0.05),
	},
	title: 'Air Handing Unit Upgrades',
	shortTitle: 'Auntomated AHU controls to manage airflow without ongoing plant operator managing the settings',
	choiceInfoText: [
		'Facility funded a project to upgrade 35 more AHUs throughout the area of the plant.  The 35 AHUs deliver over 2.1 million cubic feet per minute of conditioned air to maintain temperature, humidity, and air quality. The controls system will lower the speed of the AHU motors once set points are met.',
		'This enables the temperature and humidity to be maintained while running the motors at a lower kilowatt (kW) load. Additionally, the controls include CO2 sensors to monitor air quality and adjust outdoor air ventilation accordingly. If the air quality is low based on higher CO2 levels, the dampers modulate open to bring in more outside air.',
		'The AHU controls upgrade lowered the power demand of the 35 AHUs resulting in 480 kW of total load shed. The project is estimated to reduce the energy usage of the plant by over 4.8 million kWh or the equivalent of 1,800 metric tons of CO2 emissions. The success of the project has led the company to invest in AHU units in other facilities.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'NISSAN NORTH AMERICA: AIR HANDLING UNITS CONTROL UPGRADE DELIVERS MASSIVE ENERGY SAVINGS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/nissan-north-america-air-handling-units-control-upgrade-delivers-massive-energy',
		text: 'Nissan’s Canton, Mississippi plant is one of four of the company’s manufacturing facilities in the United States. Opened in 2003, the Canton plant is a 4.5 million square foot plant that can produce up to 410,000 vehicles annually.'
	},
	previewButton: {
		text: '5.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.advancedEnergyMonitoring] = new ProjectControl({
	pageId: Pages.advancedEnergyMonitoring,
	cost: 35_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.03),
		naturalGasMMBTU: relative(-0.03),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.03),
		naturalGasMMBTU: relative(-0.03),
	},
	title: 'Advanced Energy monitoring with Wireless Submetering',
	shortTitle: 'Reducing peak demand to reduced electricity use and cost',
	choiceInfoText: [
		'Installing submeters at every electrical and natural gas load in the plant is beneficial, but not economical or necessary. Enough submeters are installed so that the modeled energy consumption mimics the site’s actual energy curve. ',
		'To determine which electrical loads the plant would benefit from determining the energy consumption of, a load profile that showed each electrical load and operational hours with the subsequent electricity consumption, cost, and savings if electricity consumption could be decreased by an assumed 5%. The loads resulting in savings that were more than the cost of a sensor were chosen as metering points.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'SAINT-GOBAIN CORPORATION: ADVANCED ENERGY MONITORING WITH WIRELESS SUBMETERING',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/saint-gobain-corporation-advanced-energy-monitoring-wireless-submetering',
		text: 'Saint-Gobain North America’s current goal in energy monitoring is to gain more granular data on energy usage within its manufacturing sites to accelerate the achievement of its sustainability goals; namely reducing carbon emissions and lowering energy intensity.'
	},
	previewButton: {
		text: '3.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.condensingEconomizerInstallation] = new ProjectControl({
	pageId: Pages.condensingEconomizerInstallation,
	cost: 95_000,
	statsInfoAppliers: {
		naturalGasMMBTU: relative(-0.07),
	},
	statsActualAppliers: {
		naturalGasMMBTU: relative(-0.07),
	},
	title: 'Condensing Economizer Installation',
	shortTitle: 'Condensing Economizer Installation ',
	choiceInfoText: [
		'The project involved recovering heat from the boiler exhaust via a direct contact condensing economizer. Exhaust is vented to the economizer in conjunction with the steam from each of the site’s deaerators and condensate return tanks.',
		'Dampers (a valve or plate that regulates the flow of air inside a duct) installed at each broiler stack ensure proper draft and combustion flow to the economizer. This allows water in direct contact with the boiler exhaust to be heated and piped throughout the facility to the heat sinks (a temperature regulator).',
		' As a result, the hot water is used to pre-heat boiler water andfacility product through air gap plate and frame heat exchangers. Hot water flow is then regulated via control valves set to certain temperatures at an extremely steady state. Overall, the heat recovery system is monitored by a programmable logic control (PLC) system.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'PEPSICO: CONDENSING ECONOMIZER INSTALLATION',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/pepsico-condensing-economizer-installation',
		text: 'As part of the company’s 2025 25% greenhouse gas (GHG) reduction goal, it set out to reduce the energy usage of the Gatorade pasteurization process. Pasteurization is a process in which certain foods, such as milk and fruit juice, are treated with heat to eliminate pathogens and extend shelf life.'
	},
	previewButton: {
		text: '7.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});

Projects[Pages.boilerControl] = new ProjectControl({
	pageId: Pages.boilerControl,
	cost: 25_000,
	statsInfoAppliers: {
		naturalGasMMBTU: relative(-0.03),
	},
	statsActualAppliers: {
		naturalGasMMBTU: relative(-0.03),
	},
	title: 'Boiler Control',
	shortTitle: 'A combustion controller monitors the fuel-to-air ratio and optimizes excess oxygen in such a way as to maximize the efficiency of the combustion process while maintaining safe and stable boiler operation. ',
	choiceInfoText: [
		'A combustion controller monitors the fuel-to-air ratio and optimizes excess oxygen in such a way as to maximize the efficiency of the combustion process while maintaining safe and stable boiler operation. In addition, the flue gas recirculation fan improves performance by lowering the maximum flame temperature to the minimum required level.',
		'The recirculation fan also reduces nitrogen oxide emissions by lowering the average oxygen content of the air. Optimizing the exhaust gas composition and minimizing the stack temperature reduces energy losses, minimizes O&M costs, and extends the useful lifetime of the boiler  Once implemented, the upgraded boiler controls yielded annual energy and energy cost savings of 11,000 MMBtu/year and $53,000. The boiler’s energy intensity also improved by 15.2%. With project implementation costs of $104,000 the project yielded a simple payback of just under 2 years ',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'BENTLEY MILLS: BOILER CONTROL SYSTEM UPGRADES',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/bentley-mills-boiler-control-system-upgrades',
		text: 'Bentley Mills uses a large quantity of steam throughout their manufacturing process chain. In 2014, Bentley Mills began implementing a project to upgrade the control system for one of its largest natural gas fired boilers (Boiler #1) at its facility in the City of Industry, Los Angeles. Bentley Mills has been operating the facility since 1979 and employs over 300 people. The facility makes commercial modular carpet tile, broadloom and area rugs in its 280,000 square feet of manufacturing space.'
	},
	previewButton: {
		text: '3.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});

Projects[Pages.steamTrapsMaintenance] = new ProjectControl({
	pageId: Pages.steamTrapsMaintenance,
	cost: 15_000,
	statsInfoAppliers: {
		naturalGasMMBTU: relative(-0.05),
	},
	statsActualAppliers: {
		naturalGasMMBTU: relative(-0.05),
	},
	title: 'Steam Traps Maintenance',
	shortTitle: 'During a treasure hunt the facility realized that 35% of their steam traps were not operating correctly.',
	choiceInfoText: [
		'The facility deployed a steam trap maintenance program which helped them reduce energy use and help operate their steam system more efiiciently. ',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'STEAM',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/steam',
		text: 'Due to the wide array of industrial uses and performance advantages of using steam, steam is an indispensable means of delivering energy in the manufacturing sector. As a result, steam accounts for a significant amount of industrial energy consumption. In 2006, U.S. manufacturers used about 4,762 trillion Btu of steam energy, representing approximately 40% of the total energy used in industrial process applications for product output.'
	},
	previewButton: {
		text: '5.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});

Projects[Pages.improvePipeInsulation] = new ProjectControl({
	pageId: Pages.improvePipeInsulation,
	cost: 10_000,
	statsInfoAppliers: {
		naturalGasMMBTU: relative(-0.03),
	},
	statsActualAppliers: {
		naturalGasMMBTU: relative(-0.03),
	},
	title: 'Improve Pipe Insulation ',
	shortTitle: 'Insulate exterior steam pipes.',
	choiceInfoText: [
		'Insulate exterior steam pipes.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'STEAM',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/steam',
		text: 'Due to the wide array of industrial uses and performance advantages of using steam, steam is an indispensable means of delivering energy in the manufacturing sector. As a result, steam accounts for a significant amount of industrial energy consumption. In 2006, U.S. manufacturers used about 4,762 trillion Btu of steam energy, representing approximately 40% of the total energy used in industrial process applications for product output.'
	},
	previewButton: {
		text: '3.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});


//Empty Projects Scope 2 yr6-yr10

Projects[Pages.compressedAirSystemImprovemnt] = new ProjectControl({
	pageId: Pages.compressedAirSystemImprovemnt,
	cost: 85_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.08),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.08),
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Compressed Air system Improvement',
	shortTitle: 'Replacing old inefficienct compressor with new more efficient compressor can help increase reliability and reduce energy waste.',
	choiceInfoText: [
		'The project consisted of replacing three inefficient compressors with two new, more efficient compressors and heat of compression dryers. The new configuration allowed the plant to run with fewer compressors and provided some redundancy. The redundancy will allow the plant to avoid downtime and continue operating through periods of unexpected equipment malfunctions. Due to the installed redundancy, the plant expects to gain additional cost savings from increased runtime and from eliminating the need for short-term rental compressors.',
		'The heat of compression dryers added to the drying capacity of the system and replaced refrigerated dryers, providing improved moisture control. Improved moisture control yielded some process benefits that aided the financial justification of the project. In conjunction with the compressor installation, the company replaced an older cooling tower to gain greater efficiency. An updated central compressor control system was installed to control all compressors, dryers and cooling towers. The new control system now manages all of the components of the compressed air system to maximize efficiency under varying demands and conditions.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'SAINT-GOBAIN CORPORATION: MILFORD COMPRESSED AIR SYSTEM IMPROVEMENT',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/saint-gobain-corporation-milford-compressed-air-system-improvement',
		text: 'As part of its commitment to reducing its energy intensity, Saint-Gobain undertook a large compressed air system retrofit project at its Milford, Massachusetts glass plant. Upon completion, the compressed air system improvement is expected to deliver energy savings of 15% compared to the system it is replacing.'
	},
	previewButton: {
		text: '8.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.compressedAirSystemOptimization] = new ProjectControl({
	pageId: Pages.compressedAirSystemOptimization,
	cost: 30_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.04),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.04),
	},
	title: 'Compressed Air System Optimization',
	shortTitle: 'The facility was experiencing pressure drops throughout their compressed air delivery pipe system and decided on investigating thei pipe sizing to solve the issue.',
	choiceInfoText: [
		'They replaced an existing 4” header pipe running from the compressors to a storage tank with a 6” header. The shorter pipe diameter hadn’t sufficiently served the system, as engineers recorded air pressure losses starting in the compressor room.',
		'They also added a second 4” header pipe parallel to an existing 4” header leading out of the storage tank to supply separate parts of the plant and form a complete loop.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'DARIGOLD: COMPRESSED AIR SYSTEM OPTIMIZATION',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/darigold-compressed-air-system-optimization',
		text: 'Americas fifth-largest dairy co-op, Darigold has 11 plants in the northwestern United States that produce milk, butter, sour cream, milk powder, and other dairy products. The Sunnyside plant is the company’s largest facility and each day it produces about 530,000 pounds of cheese and 615,000 pounds of powdered dairy products. Compressed air supports production at this plant through control valves, cylinders, positioners, dampers, and pulsing for bag houses. An inefficient distribution system compelled the partner to upgrade its air piping to enable stable system pressure.'
	},
	previewButton: {
		text: '4.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.chilledWaterMonitoringSystem] = new ProjectControl({
	pageId: Pages.chilledWaterMonitoringSystem,
	cost: 35_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.02),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.02),
	},
	title: 'Chilled Water System and Monitoring System ',
	shortTitle: 'The facility identified their chilled water system as a Significant Energy Use (SEU) pursuing ISO 50001 certification. The chilled water system accounted for 15% of the plant’s total electrical consumption. The upgrades consisted of installing an online, real-time dashboard platform to monitor the four main areas of the system. This online dashboard tracks year-to-date and month-to-date system efficiency (kW/ton) of the project, and allows multiple persons to view the progress of upgrades.',
	choiceInfoText: [
		'Installation of submetering helped the plant reduce 40,800 MMBtu in energy savings during the first year that the upgrades went into place. Originally, the chilled water system efficiency was rated and measured at 1 kW/ton; however, after the upgrades, the system efficiency improved to 0.65 kW/ton. This change represented a 35% improvement in system efficiency and resulted in a 3.4% reduction in site electricity consumption.  Overall, these savings translated to a 29% reduction in system-level operating costs.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'NISSAN NORTH AMERICA: CHILLED WATER SYSTEM UPGRADES AND DASHBOARD',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/nissan-north-america-chilled-water-system-upgrades-and-dashboard',
		text: 'During the process of pursuing ISO 50001 certification for Nissan’s vehicle assembly plant in Canton, Mississippi, Nissan’s Energy Team identified their chilled water system as a Significant Energy Use (SEU). Based on the facility’s 2014 energy baseline, the chilled water system accounted for 15% of the plant’s total electrical consumption.'
	},
	previewButton: {
		text: '2.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.refrigerationUpgrade] = new ProjectControl({
	pageId: Pages.refrigerationUpgrade,
	cost: 10_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.05),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.05),
	},
	title: 'Refrigeration Upgrade',
	shortTitle: 'Increasing ammonia suction pressure reduces system lift, which is the difference between suction and discharge pressures within the system which help in reducing load on the comrpessor and increasing overall system effieicny.',
	choiceInfoText: [
		'The plant commissioned a study in June of 2017 to identify areas to improve energy efficiency. Previously, suction pressure was being run at 20.4 PSI to build the ice in the ice bank to optimal levels. In order to increase the efficiency of the system, it was decided to increase the ammonia suction pressure to 35.6 PSI, which is the pressure going into the compression step of the refrigeration cycle. Increasing ammonia suction pressure reduces system lift, which is the difference between suction and discharge pressures within the system. A reduction in lift accomplishes the following:',
		'Reduces the overall work required by the compressors',
		'Increases compressor capacity',
		'Increases overall system efficiency',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'AGROPUR: REFRIGERATION UPGRADES',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/agropur-refrigeration-upgrades',
		text: 'Le Sueur Cheese is one of seven Agropur cheese and whey protein drying plants in the United States. In 2010, Le Sueur Cheese joined the Better Buildings, Better Plants program and set a goal to reduce its energy intensity by 25% over a 10-year period.'
	},
	previewButton: {
		text: '5.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.loweringCompressorPressure] = new ProjectControl({
	pageId: Pages.loweringCompressorPressure,
	cost: 5_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.02),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.02),
	},
	title: 'Lowering Compressor Pressure',
	shortTitle: 'Lowering compressd air pressure results in energy savings',
	choiceInfoText: [
		'The company did a treasure hunt and discovered that the supply pressure for compressed air was about 10psig higher than what is required for the equipments downstream. They decided to reduce the supply pressure by 4 psig.',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'COMPRESSED AIR',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/compressed-air',
		text: 'Compressed air provides a safe and reliable source of pneumatic pressure for a wide range of industrial processes. However, with over 80% of its input energy being lost as heat, air compressors are naturally inefficient. Energy-Efficient process design should opt for alternatives wherever possible and isolate compressed air usage to only processes that mandate it.'
	},
	previewButton: {
		text: '2.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.improveLightingSystems] = new ProjectControl({
	pageId: Pages.improveLightingSystems,
	cost: 50_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.04),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.04),
		totalRebates: absolute(10_000),
	},
	utilityRebateValue: 10000,
	title: 'Lighting',
	shortTitle: 'Improve Lighting Systems',
	choiceInfoText: [
		'Install LED lighting in the main building.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'LIGHTING',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/lighting',
		text: 'A good place to start investigating for energy savings is in your plant’s lighting system. In the industrial sector, lighting accounts for less than 5% of the overall energy footprint, but in some sectors it can be higher.'
	},
	previewButton: {
		text: '4.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.startShutOff] = new ProjectControl({
	pageId: Pages.startShutOff,
	cost: 5_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.03),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.03),
	},
	title: 'Start Shut-off Program',
	shortTitle: 'Start program to shut-off equipment when not in use.',
	choiceInfoText: [
		'Treasure Hunts often find low-to-no cost projects for facilities. A very common project is to shut of equipemnt when not in use. A systematic program to identify equipment, create turn on and shut down procedures, and enforce shutdown can save electricity with very little cost.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'ENERGY TREASURE HUNTS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/energy-treasure-hunts',
		text: 'One of the best tools at an energy managers disposal is whats known as an Energy Treasure Hunt; an onsite three-day event that engages cross-functional teams of employees in the process of identifying operational and maintenance (O&M) energy efficiency improvements.'
	},
	previewButton: {
		text: '3.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.installVFDs1] = new ProjectControl({
	pageId: Pages.installVFDs1,
	cost: 20_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.04),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.04),
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs',
	shortTitle: '1 Install VFDs on motors with high use variablity.',
	choiceInfoText: [
		'Intall VFDs in two motors with high use variablity.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	previewButton: {
		text: '4.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.installVFDs2] = new ProjectControl({
	pageId: Pages.installVFDs2,
	cost: 20_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.04),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.04),
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs',
	shortTitle: '2 Install VFDs on motors with high use variablity.',
	choiceInfoText: [
		'Intall VFDs in two motors with high use variablity.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	previewButton: {
		text: '4.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.installVFDs1)
});

Projects[Pages.installVFDs3] = new ProjectControl({
	pageId: Pages.installVFDs3,
	cost: 20_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.04),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.04),
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs',
	shortTitle: '3 Install VFDs on motors with high use variablity.',
	choiceInfoText: [
		'Intall VFDs in two motors with high use variablity.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	previewButton: {
		text: '4.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.installVFDs2)

});

Projects[Pages.reduceFanSpeeds] = new ProjectControl({
	pageId: Pages.reduceFanSpeeds,
	cost: 1_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.005),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.005),
	},
	title: 'Reduce Fan Speeds',
	shortTitle: 'Run interior fans at a slightly lower speed.',
	choiceInfoText: [
		'Treasure Hunts often find low-to-no cost projects for facilities. A very common project is to reduce fan speeds.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'ENERGY TREASURE HUNTS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/energy-treasure-hunts',
		text: 'One of the best tools at an energy managers disposal is whats known as an Energy Treasure Hunt; an onsite three-day event that engages cross-functional teams of employees in the process of identifying operational and maintenance (O&M) energy efficiency improvements.'
	},
	previewButton: {
		text: '0.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.lightingOccupancySensors] = new ProjectControl({
	pageId: Pages.lightingOccupancySensors,
	cost: 3_000,
	statsInfoAppliers: {
		electricityUseKWh: relative(-0.02),
	},
	statsActualAppliers: {
		electricityUseKWh: relative(-0.02),
	},
	title: 'Lighting Occupancy Sensors',
	shortTitle: 'Turn off lights in unoccupied areas of facility',
	choiceInfoText: [
		'Treasure Hunts often find low-to-no cost projects for facilities. A very common project is to turn off lights in unoccupied areas of the facility.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'ENERGY TREASURE HUNTS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/energy-treasure-hunts',
		text: 'One of the best tools at an energy managers disposal is whats known as an Energy Treasure Hunt; an onsite three-day event that engages cross-functional teams of employees in the process of identifying operational and maintenance (O&M) energy efficiency improvements.'
	},
	previewButton: {
		text: '2.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});



/**
 * A "class" that can apply or un-apply a numerical modifier with a custom formula.
 */
export declare interface NumberApplier {
	applyValue: (previous: number) => number;
	unApplyValue: (previous: number) => number;
	/**
	 * Returns the original modifier.
	 */
	modifier: number;
	/**
	 * Turns the NumberApplier into a string, optionally multiplying it by -1 first.
	 */
	toString: (negative: boolean) => string;
}

type trackedStats = keyof TrackedStats;

/**
 * Optional NumberApplier for any stat in DashboardTrackedStats
 */
type TrackedStatsApplier = {
	[key in trackedStats]?: NumberApplier;
}

declare interface ProjectControls {
	[key: symbol]: ProjectControl;
}

/**
 * Generates an object for applying/unapplying a RELATIVE modifier, such as reducing natural gas usage by 3%.
 * @param modifier 
 * @returns Object for applying/unapplying the specified modifier.
 */
function relative(modifier: number): NumberApplier {
	const thisApplier: NumberApplier = {
		applyValue: function (previous: number) {
			// y = x * (1 + n);
			return round(previous * (1 + this.modifier));
		},
		unApplyValue: function (previous: number) {
			// x = y / (1 + n);
			return round(previous / (1 + this.modifier));
		},
		modifier: modifier,
		toString: function (negative: boolean) {
			if (negative)
				return (100 * -this.modifier).toLocaleString('en-US') + '%';
			else
				return (100 * this.modifier).toLocaleString('en-US') + '%';
		}
	};

	return thisApplier;
}

// todo projects taking more than 1 year

/**
 * Generates an object for applying/unaplying an ABSOLUTE modifier, such as reducing budget by $50,000.
 * @param modifier 
 * @returns Object for applying/unapplying the specified modifier.
 */
function absolute(modifier: number): NumberApplier {
	const thisApplier: NumberApplier = {
		applyValue: function (previous: number) {
			return round(previous + this.modifier);
		},
		unApplyValue: function (previous: number) {
			return round(previous - this.modifier);
		},
		modifier: modifier,
		toString: function (negative: boolean) {
			if (negative)
				return (-1 * this.modifier).toLocaleString('en-US');
			else
				return this.modifier.toLocaleString('en-US');
		}
	};

	return thisApplier;
}

/**
 * Round a number to the nearest hundred-thousandth, to help with floating point precision errors.
 */
function round(number: number) {
	return (Math.round(number * 100000)) / 100000;
}
