import React from 'react';
import type { AppState, NextAppState } from './App';
import type App from './App';
import type { ButtonGroupButton} from './components/Buttons';
import { closeDialogButton} from './components/Buttons';
import { infoButtonWithDialog, selectButtonCheckbox } from './components/Buttons';
import type { TrackedStats } from './trackedStats';
import type { Choice } from './components/GroupedChoices';
import type { DialogCardContent, DialogControlProps} from './components/InfoDialog';
import { theme } from './components/theme';
import { co2SavingsButton } from './PageControls';
import FlameIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import FactoryIcon from '@mui/icons-material/Factory';
import Pages from './Pages';
import { Alert } from '@mui/material';
import TrafficConeIcon from './icons/TrafficConeIcon';

let st = performance.now();

// IMPORTANT: Keep Scope1Projects and Scope2Projects up to date as you add new projects!!!!!!
// These lists (Scope1Projects and Scope2Projects) keep track of WHICH projects are in WHICH scope. Currently, they are used to give a warning to the user
// 	when they click Proceed (to Year Recap) while only having selected projects from one scope.

/**
 * List of Page symbols for projects that are in the SCOPE 1 list.
 */
export const Scope1Projects = [
	Pages.wasteHeatRecovery, Pages.digitalTwinAnalysis, Pages.processHeatingUpgrades, Pages.hydrogenPoweredForklifts, Pages.processHeatingUpgrades, Pages.electricBoiler, Pages.emptyScope1P1, Pages.emptyScope1P2, Pages.emptyScope1P3, Pages.emptyScope1P4, Pages.emptyScope1P5
];
/**
 * List of Page symbols for projects that are in the SCOPE 2 list.
 */
export const Scope2Projects = [
	Pages.lightingUpgrades, Pages.greenPowerTariff, Pages.windVPPA, Pages.solarPanelsCarPort, Pages.solarFieldOnsite, Pages.emptyScope2P1, Pages.emptyScope2P2, Pages.emptyScope2P3, Pages.emptyScope2P4, Pages.emptyScope2P5
];

/**
 * Dictionary of ProjectControls. The key must be a `Page` symbol (see `Pages.tsx`), 
 * and make sure the associated ProjectControl's `pageId` is the same as that key.
 */
const Projects: ProjectControls = {};

export default Projects;

export declare interface CaseStudy {
	title: string;
	text: string|string[];
	url: string;
}

declare interface RecapAvatar {
	icon: JSX.Element;
	backgroundColor?: string;
}

/**
 * Hidden surprise to appear on the year recap page.
 */
declare interface HiddenSurprise {
	title: string;
	text: string | string[];
	avatar: {
		icon: JSX.Element,
		backgroundColor: string,
		color: string,
	}
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
	/**
	 * Button to go between "INFO" and "SELECT" on the project selection page. 
	 * 
	 * Recommended: Include a visual startIcon to represent the **type** of project (e.g. flame, smoke, CO2)
	 * and a number or percentage to represent the effect this project will have.
	 */
	previewButton?: ButtonGroupButton;
	/**
	 * Surprises that appear once when SELECT is clicked.
	 */
	surprises?: DialogControlProps[];
	/**
	 * Surprises that appear AFTER PROCEED is clicked (after they've committed to the selected projects). TODO IMPLEMENT
	 */
	hiddenSurprises?: HiddenSurprise[]; // TODO
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
}

export class ProjectControl implements ProjectControlParams{
	
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
	surprises: DialogControlProps[];
	hiddenSurprises?: HiddenSurprise[]; //todo
	caseStudy?: CaseStudy;
	recapAvatar: RecapAvatar;
	/**
	 * Whether surprises have been displayed already. Only show them for the first time the user checks the checkbox (TODO CONFIRM IF THIS IS WHAT WE WANT)
	 */
	hasDisplayedSurprises = false;
	visible: Resolvable<boolean>;
	disabled: Resolvable<boolean>;
	
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
			icon: <FactoryIcon/>
		};
		this.previewButton = params.previewButton;
		this.caseStudy = params.caseStudy;
		if (params.surprises) this.surprises = params.surprises;
		else this.surprises = [];
		this.hiddenSurprises = params.hiddenSurprises;
		this.visible = params.visible || true; // Default to true
		this.disabled = params.disabled || false; // Default to false
		this.cost = params.cost;
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
				if (state.completedProjects.includes(self.pageId)) return false;
				// otherwise, use the visible attribute provided by the project props (Default true)
				else return this.resolveToValue(self.visible, true);
			},
			key: this.pageId.description,
			disabled: this.disabled,
		};
		
		function displaySurprises(this: App) {
			let firstSurprise = self.surprises[0];
			if (!firstSurprise) return;
			
			firstSurprise.buttons = [{
				text: 'Continue',
				variant: 'text',
				onClick: () => {
					return this.state.currentPage;
				}
			}];
			
			this.summonInfoDialog(firstSurprise);
		}
		
		/**
		 * Action to toggle whether the project is selected, after a select button is clicked.
		 */
		function toggleProjectSelect(this: App, state: AppState, nextState: NextAppState) {
			let selectedProjects = state.selectedProjects.slice();
			let newTrackedStats = {...state.trackedStats};
			// IF PROJECT IS ALREADY SELECTED
			if (selectedProjects.includes(self.pageId)) {
				// Since the order of projects matters, we can't simply unApplyChanges to ourself.
				// 	We must first undo all the stat changes in REVERSE ORDER, then re-apply all but this one.
				for (let i = selectedProjects.length-1; i >= 0; i--) {
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
				
				if (!self.hasDisplayedSurprises) {
					displaySurprises.apply(this);
					self.hasDisplayedSurprises = true;
				}
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
		naturalGasMMBTU: absolute(-50_000), // reduces natural gas usage by a flat 50,000
	},
	// Stats that 
	statsActualAppliers: {
		totalRebates: absolute(5_000),
		naturalGasMMBTU: absolute(-50_000),
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
	surprises: [
		{
			title: 'CONGRATULATIONS!',
			text: 'Great choice! This project qualifies you for your local utility’s energy efficiency {rebate program}. You will receive a {$5,000 utility credit} for implementing energy efficiency measures.',
			img: 'images/confetti.png'
		},
	],
	// Case study to show in the year recap
	caseStudy: {
		title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
		url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
		text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
	},
	// Bit of text to preview what to expect from the project.
	previewButton: {
		text: '50k',
		variant: 'text',
		startIcon: <FlameIcon/>
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
		startIcon: <FlameIcon/>,
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
		startIcon: <BoltIcon/>,
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
		startIcon: <BoltIcon/>,
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
	surprises: [
		{
			title: 'CONGRATULATIONS!',
			text: 'Great choice! This project qualifies you for your local utility’s energy efficiency {rebate program}. You will receive a {$5,000 utility credit} for implementing energy efficiency measures.',
			img: 'images/confetti.png'
		},
	],
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
	hiddenSurprises: [{
		title: 'Uh oh - Bad Asphalt!',
		text: 'While assessing the land in person, the contractor found that the parking lot\'s {asphalt needs replacement}. This will require an {additional $30,000} for the carport’s installation.',
		avatar: {
			icon: <TrafficConeIcon/>,
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
	visible: state => state.completedProjects.includes(Pages.solarPanelsCarPort),
});

//Empty Projects Scope 1 yr1-yr5
Projects[Pages.emptyScope1P1] = new ProjectControl({
	pageId: Pages.emptyScope1P1,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 1 yr1 prj1',
	shortTitle: 'Empty Scope 1 yr1 prj1',
	choiceInfoText: [
		'Empty Scope 1 yr1 prj1',
		'Empty Scope 1 yr1 prj1',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope1P2] = new ProjectControl({
	pageId: Pages.emptyScope1P2,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 1 yr2 prj2',
	shortTitle: 'Empty Scope 1 yr2 prj2',
	choiceInfoText: [
		'Empty Scope 1 yr2 prj2',
		'Empty Scope 1 yr2 prj2',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope1P3] = new ProjectControl({
	pageId: Pages.emptyScope1P3,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 1 yr3 prj3',
	shortTitle: 'Empty Scope 1 yr3 prj3',
	choiceInfoText: [
		'Empty Scope 1 yr3 prj3',
		'Empty Scope 1 yr3 prj3',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope1P4] = new ProjectControl({
	pageId: Pages.emptyScope1P4,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 1 yr4 prj4',
	shortTitle: 'Empty Scope 1 yr4 prj4',
	choiceInfoText: [
		'Empty Scope 1 yr4 prj4',
		'Empty Scope 1 yr4 prj4',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope1P5] = new ProjectControl({
	pageId: Pages.emptyScope1P5,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 1 yr5 prj5',
	shortTitle: 'Empty Scope 1 yr5 prj5',
	choiceInfoText: [
		'Empty Scope 1 yr5 prj5',
		'Empty Scope 1 yr5 prj5',
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
		startIcon: <BoltIcon/>,
	},
});


//Empty Projects Scope 2 yr6-yr10

Projects[Pages.emptyScope2P1] = new ProjectControl({
	pageId: Pages.emptyScope2P1,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 2 yr1 prj1',
	shortTitle: 'Empty Scope 1 yr1 prj1',
	choiceInfoText: [
		'Empty Scope 2 yr1 prj1',
		'Empty Scope 2 yr1 prj1',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope2P2] = new ProjectControl({
	pageId: Pages.emptyScope2P2,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 2 yr2 prj2',
	shortTitle: 'Empty Scope 2 yr2 prj2',
	choiceInfoText: [
		'Empty Scope 2 yr2 prj2',
		'Empty Scope 2 yr2 prj2',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope2P3] = new ProjectControl({
	pageId: Pages.emptyScope2P3,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 2 yr3 prj3',
	shortTitle: 'Empty Scope 2 yr3 prj3',
	choiceInfoText: [
		'Empty Scope 2 yr3 prj3',
		'Empty Scope 2 yr3 prj3',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope2P4] = new ProjectControl({
	pageId: Pages.emptyScope2P4,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 2 yr4 prj4',
	shortTitle: 'Empty Scope 2 yr4 prj4',
	choiceInfoText: [
		'Empty Scope 2 yr4 prj4',
		'Empty Scope 2 yr4 prj4',
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
		startIcon: <BoltIcon/>,
	},
});

Projects[Pages.emptyScope2P5] = new ProjectControl({
	pageId: Pages.emptyScope2P5,
	cost: 150_000,
	statsInfoAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	statsActualAppliers: {
		// I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
	},
	title: 'Empty Scope 2 yr5 prj5',
	shortTitle: 'Empty Scope 2 yr5 prj5',
	choiceInfoText: [
		'Empty Scope 2 yr5 prj5',
		'Empty Scope 2 yr5 prj5',
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
		startIcon: <BoltIcon/>,
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

console.log('Projects', performance.now() - st);