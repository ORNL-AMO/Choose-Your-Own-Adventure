import React from 'react';
import type { AppState, NextAppState } from './App';
import type App from './App';
import type { ButtonGroupButton} from './components/Buttons';
import { infoButtonWithDialog, selectButtonCheckbox } from './components/Buttons';
import type { DashboardTrackedStats } from './components/Dashboard';
import type { Choice } from './components/GroupedChoices';
import type { DialogCardContent, DialogControlProps} from './components/InfoDialog';
import { theme } from './components/theme';
import { co2SavingsButton } from './pageControls';
import Pages from './pages';
import { Alert } from '@mui/material';

const Projects: ProjectControls = {};

export default Projects;

// IMPORTANT: Keep Pages.scope1Projects and Pages.scope2Projects updated, so that the Proceed button click handler in App.tsx doesn't get confused
export const Scope1Projects = [
	Pages.wasteHeatRecovery, Pages.digitalTwinAnalysis, Pages.processHeatingUpgrades, Pages.hydrogenPoweredForklifts, Pages.processHeatingUpgrades, Pages.electricBoiler,
];
export const Scope2Projects = [
	Pages.lightingUpgrades, Pages.greenPowerTariff, Pages.windVPPA,
];

export declare interface CaseStudy {
	title: string;
	text: string|string[];
	url: string;
}

declare interface ProjectControlParams {
	pageId: symbol;
	/**
	 * Project cost, exclusing rebates.
	 */
	cost: number;
	/**
	 * Numbers that appear on the INFO CARD, before checking the checkbox.
	 */
	statsInfo: TrackedStatsApplier;
	/**
	 * Numbers that affect the dashboard charts AND that apply when "Proceed" is clicked.
	 */
	statsActual: TrackedStatsApplier;
	/**
	 * HIDDEN numbers that appear AFTER PROCEED is clicked (after they've committed to the selected projects). TODO IMPLEMENT
	 */
	statsHidden?: TrackedStatsApplier;
	title: string;
	choiceInfoTitle: string;
	choiceInfoText: string | string[];
	choiceInfoImg?: string;
	choiceInfoImgAlt?: string;
	choiceInfoImgObjectFit?: 'cover' | 'contain';
	recapDescription: string | string[];
	previewButton?: ButtonGroupButton;
	/**
	 * Surprises that appear once when SELECT is clicked.
	 */
	surprises?: DialogControlProps[];
	/**
	 * Surprises that appear AFTER PROCEED is clicked (after they've committed to the selected projects). TODO IMPLEMENT
	 */
	hiddenSurprises?: DialogControlProps[];
	caseStudy?: CaseStudy;
}

export class ProjectControl {
	
	pageId: symbol;
	cost: number;
	statsInfoAppliers: TrackedStatsApplier;
	statsActualAppliers: TrackedStatsApplier;
	statsHiddenAppliers?: TrackedStatsApplier;
	title: string;
	choiceInfoTitle: string;
	choiceInfoText: string | string[];
	choiceInfoImg?: string;
	choiceInfoImgAlt?: string;
	choiceInfoImgObjectFit?: 'cover' | 'contain';
	recapDescription: string | string[];
	previewButton?: ButtonGroupButton;
	surprises: DialogControlProps[];
	hiddenSurprises?: DialogControlProps[];
	caseStudy?: CaseStudy;
	/**
	 * Whether surprises have been displayed already. Only show them for the first time the user checks the checkbox (TODO CONFIRM IF THIS IS WHAT WE WANT)
	 */
	hasDisplayedSurprises = false;
	
	constructor(params: ProjectControlParams) {
		this.pageId = params.pageId;
		this.statsInfoAppliers = params.statsInfo;
		this.statsActualAppliers = params.statsActual;
		this.statsHiddenAppliers = params.statsHidden;
		this.title = params.title;
		this.choiceInfoTitle = params.choiceInfoTitle;
		this.choiceInfoText = params.choiceInfoText;
		this.choiceInfoImg = params.choiceInfoImg;
		this.choiceInfoImgAlt = params.choiceInfoImgAlt;
		this.choiceInfoImgObjectFit = params.choiceInfoImgObjectFit;
		this.recapDescription = params.recapDescription;
		this.previewButton = params.previewButton;
		this.caseStudy = params.caseStudy;
		if (params.surprises) this.surprises = params.surprises;
		else this.surprises = [];
		this.hiddenSurprises = params.hiddenSurprises;
		
		this.cost = params.cost;
	}
	
	applyStatChanges(state: AppState, nextState: NextAppState) {
		let newTrackedStats = {...state.trackedStats};
		for (let key in this.statsActualAppliers) {
			let thisApplier: NumberApplier = this.statsActualAppliers[key];
			newTrackedStats[key] = thisApplier.applyValue(state.trackedStats[key]);
		}
		// Now, apply the change to finances (DOES NOT SUPPORT RELATIVE VALUES ATM)
		newTrackedStats.financesAvailable = state.trackedStats.financesAvailable - this.cost;
		newTrackedStats.moneySpent = state.trackedStats.moneySpent + this.cost;
		
		nextState.trackedStats = newTrackedStats;
	}
	
	unApplyStatChanges(state: AppState, nextState: NextAppState) {
		let newTrackedStats = {...state.trackedStats};
		for (let key in this.statsActualAppliers) {
			let thisApplier: NumberApplier = this.statsActualAppliers[key];
			newTrackedStats[key] = thisApplier.unApplyValue(state.trackedStats[key]);
		}
		// Now, apply the change to finances
		newTrackedStats.financesAvailable = state.trackedStats.financesAvailable + this.cost;
		newTrackedStats.moneySpent = state.trackedStats.moneySpent - this.cost;
		
		nextState.trackedStats = newTrackedStats;
	}
	
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
		if (this.statsInfoAppliers.electricityCostKWh) {
			cards.push({
				text: `Electricity reduction: {${this.statsInfoAppliers.electricityCostKWh.toString(true)}}`,
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
			cards: cards
		}));
		// Preview button (e.g. co2 savings button)
		if (this.previewButton) buttons.push(this.previewButton);
		// Select checkbox button, with live preview of stats
		buttons.push(selectButtonCheckbox(function (state, nextState) {
			let selectedProjects = state.selectedProjects.slice();
			// IF PROJECT IS ALREADY SELECTED
			if (selectedProjects.includes(self.pageId)) {
				selectedProjects.splice(selectedProjects.indexOf(self.pageId), 1);
				self.unApplyStatChanges(state, nextState);
			}
			// IF PROJECT IS NOT ALREADY SELECTED
			else {
				// Figure out if this project can be afforded
				if (self.cost > state.trackedStats.financesAvailable + state.trackedStats.totalRebates) {
					this.summonSnackbar(<Alert severity='error'>You cannot afford this project with your current budget!</Alert>);
					return state.currentPage;
				}
				
				selectedProjects.push(self.pageId);
				self.applyStatChanges(state, nextState);
				
				if (!self.hasDisplayedSurprises) {
					displaySurprises.apply(this);
					self.hasDisplayedSurprises = true;
				}
			}
			nextState.selectedProjects = selectedProjects;
			return state.currentPage; // no page change
		}, undefined, (state) => state.selectedProjects.includes(this.pageId)));
		
		return {
			text: this.choiceInfoTitle,
			buttons: buttons,
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
			firstSurprise.buttonsDelay = 1000;
			
			this.summonInfoDialog(firstSurprise);
		}
	}
}

Projects[Pages.wasteHeatRecovery] = new ProjectControl({
	pageId: Pages.wasteHeatRecovery,
	cost: 65_000, // project cost, in dollars
	statsInfo: {
		naturalGasMMBTU: absolute(-50_000), // reduces natural gas usage
	},
	statsActual: {
		totalRebates: absolute(5_000),
		naturalGasMMBTU: absolute(-50_000),
	},
	title: 'Energy Efficiency - Waste Heat Recovery',
	choiceInfoTitle: 'Upgrade heat recovery on boiler/furnace system',
	choiceInfoText: [
		'Currently, your facility uses {inefficient, high-volume} furnace technology, where {combustion gases} are evacuated through a side take-off duct into the emission control system', 
		'You can invest in capital improvements to {maximize waste heat recovery} at your facility through new control system installation and piping upgrades.'
	],
	recapDescription: 'placeholder',
	choiceInfoImg: 'images/waste-heat-recovery.png',
	choiceInfoImgAlt: '', // What is this diagram from the PPT?
	choiceInfoImgObjectFit: 'contain',
	surprises: [
		// {
		// 	title: 'CONGRATULATIONS!',
		// 	text: 'Great choice! This project qualifies you for your local utility’s energy efficiency {rebate program}. You will receive a {$5,000 utility credit} for implementing energy efficiency measures.',
		// 	img: 'images/confetti.png'
		// },
	],
	caseStudy: {
		title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
		url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
		text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
	}
	// previewButton: co2SavingsButton(69420) // todo
});

Projects[Pages.digitalTwinAnalysis] = new ProjectControl({
	pageId: Pages.digitalTwinAnalysis,
	cost: 90_000,
	statsInfo: {
		naturalGasMMBTU: relative(-0.02),
	},
	statsActual: {
		naturalGasMMBTU: relative(-0.02),
	},
	title: 'Energy Efficiency - Digital Twin Analysis',
	choiceInfoTitle: 'Conduct digital twin analysis',
	choiceInfoText: [
		'A digital twin is the virtual representation of a physical object or system across its lifecycle.', 
		'You can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
	],
	recapDescription: 'placeholder',
	choiceInfoImg: 'images/chiller-systems-in-plant.png',
	choiceInfoImgAlt: 'A 3D model of the chiller systems in a plant',
	choiceInfoImgObjectFit: 'contain',
	caseStudy: {
		title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
		url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
		text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
	}
});

Projects[Pages.processHeatingUpgrades] = new ProjectControl({
	pageId: Pages.processHeatingUpgrades,
	cost: 80_000,
	statsInfo: {
		electricityUseKWh: relative(-0.025),
	},
	statsActual: {
		electricityUseKWh: relative(-0.025),
	},
	title: 'Energy Efficiency – Process Heating Upgrades',
	choiceInfoTitle: 'Explore efficient process heating upgrades',
	choiceInfoText: [
		'Currently, your facility has an {inefficient} body-on-frame paint process. The paint process is served by a variety of applications including compressed air, pumps and fans, as well as steam for hot water.',
		'You can invest in a new, upgraded paint process that is more {energy efficient}, {eliminates} steam to heat water, {re-circulates} air, and uses {lower temperatures}.'
	],
	choiceInfoImg: 'images/car-manufacturing.png',
	choiceInfoImgAlt: 'The frame of a car inside a manufacturing facility.',
	recapDescription: 'You have achieved 2.5% energy reduction',
	caseStudy: {
		title: 'Nissan North America: New Paint Plant',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/waupaca-foundry-cupola-waste-heat-recovery-upgrade-drives-deeper-energy-savings',
		text: 'In 2010, {Nissan’s Vehicle Assembly Plant} in Smyrna, Tennessee is {40%} more energy efficient than its predecessor, using an innovative “3-Wet” paint process that allows for the removal of a costly high temperature over bake step.'
	}
});

/**
 * todo better name
 */
declare interface NumberApplier {
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

type trackedStats = keyof DashboardTrackedStats;

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