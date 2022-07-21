import App, { AppState, NextAppState } from "./App";
import { ButtonGroupButton, infoButtonWithDialog, selectButtonCheckbox } from "./components/Buttons";
import { DashboardTrackedStats } from "./components/Dashboard";
import { Choice } from "./components/GroupedChoices";
import { DialogCardContent, DialogControlProps, newInfoDialogControl } from "./components/InfoDialog";
import { theme } from "./components/theme";
import { co2SavingsButton } from "./pageControls";
import Pages from "./pages";
import React from 'react';

const Projects: ProjectControls = {};

export default Projects;

// IMPORTANT: Keep Pages.scope1Projects and Pages.scope2Projects updated, so that the Proceed button click handler in App.tsx doesn't get confused
export const Scope1Projects = [
	Pages.wasteHeatRecovery, Pages.digitalTwinAnalysis, Pages.processHeatingUpgrades, Pages.hydrogenPoweredForklifts, Pages.processHeatingUpgrades, Pages.electricBoiler,
];
export const Scope2Projects = [
	Pages.lightingUpgrades, Pages.greenPowerTariff, Pages.windVPPA,
];

declare interface ProjectControlParams {
	pageId: symbol;
	preview: TrackedStatsApplier;
	actual: TrackedStatsApplier;
	title: string;
	choiceInfoTitle: string;
	choiceInfoText: string | string[];
	choiceInfoImg?: string;
	choiceInfoImgAlt?: string;
	choiceInfoImgObjectFit?: "cover" | "contain";
	previewButton?: ButtonGroupButton;
	surprises?: DialogControlProps[];
}

export class ProjectControl {
	
	pageId: symbol;
	previewAppliers: TrackedStatsApplier;
	actualAppliers: TrackedStatsApplier;
	title: string;
	choiceInfoTitle: string;
	choiceInfoText: string | string[];
	choiceInfoImg?: string;
	choiceInfoImgAlt?: string;
	choiceInfoImgObjectFit?: "cover" | "contain";
	previewButton?: ButtonGroupButton;
	surprises: DialogControlProps[];
	/**
	 * Whether surprises have been displayed already. Only show them for the first time the user checks the checkbox (TODO CONFIRM IF THIS IS WHAT WE WANT)
	 */
	hasDisplayedSurprises = false;
	
	constructor(params: ProjectControlParams) {
		this.pageId = params.pageId;
		this.previewAppliers = params.preview;
		this.actualAppliers = params.actual;
		this.title = params.title;
		this.choiceInfoTitle = params.choiceInfoTitle;
		this.choiceInfoText = params.choiceInfoText;
		this.choiceInfoImg = params.choiceInfoImg;
		this.choiceInfoImgAlt = params.choiceInfoImgAlt;
		this.choiceInfoImgObjectFit = params.choiceInfoImgObjectFit;
		this.previewButton = params.previewButton;
		if (params.surprises) this.surprises = params.surprises;
		else this.surprises = [];
	}
	
	applyPreview(state: AppState, nextState: NextAppState) {
		let newTrackedStats = {...state.trackedStats};
		for (let key in this.previewAppliers) {
			let thisApplier: NumberApplier = this.previewAppliers[key];
			newTrackedStats[key] = thisApplier.applyValue(state.trackedStats[key]);
		}
		nextState.trackedStats = newTrackedStats;
	}
	
	unApplyPreview(state: AppState, nextState: NextAppState) {
		let newTrackedStats = {...state.trackedStats};
		for (let key in this.previewAppliers) {
			let thisApplier: NumberApplier = this.previewAppliers[key];
			newTrackedStats[key] = thisApplier.unApplyValue(state.trackedStats[key]);
		}
		nextState.trackedStats = newTrackedStats;
	}
	
	getChoiceControl(): Choice {
		
		const self = this; // for use in bound button handlers
		
		let cards: DialogCardContent[] = [];
		
		// todo maybe add a field just called "project cost", dunno
		if (this.previewAppliers.financesAvailable) {
			cards.push({
				text: `Total project cost: {$${(-this.previewAppliers.financesAvailable.modifier).toLocaleString('en-US')}}`,
				color: theme.palette.secondary.dark, // todo change?
			});
		}
		if (this.previewAppliers.naturalGasMMBTU) {
			cards.push({
				text: `Natural gas reduction: {${(-this.previewAppliers.naturalGasMMBTU.modifier).toLocaleString('en-US')}}`,
				color: theme.palette.primary.light, // todo change?
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
				self.unApplyPreview(state, nextState);
			}
			// IF PROJECT IS NOT ALREADY SELECTED
			else {
				selectedProjects.push(self.pageId);
				self.applyPreview(state, nextState);
				
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
	preview: {
		financesAvailable: absolute(-65_000), // project cost, in dollars
		naturalGasMMBTU: absolute(-50_000), // reduces natural gas usage
	},
	actual: {
		financesAvailable: absolute(-60_000),
		totalBudget: absolute(5_000), // rebate (Should I make the rebates automatic?? or should I include it in financesAvailable?)
		totalRebates: absolute(5_000),
	},
	title: 'Energy Efficiency - Waste Heat Recovery',
	choiceInfoTitle: 'Upgrade heat recovery on boiler/furnace system',
	choiceInfoText: [
		'Currently, your facility uses {inefficient, high-volume} furnace technology, where {combustion gases} are evacuated through a side take-off duct into the emission control system', 
		'You can invest in capital improvements to {maximize waste heat recovery} at your facility through new control system installation and piping upgrades.'
	],
	choiceInfoImg: 'images/waste-heat-recovery.png',
	choiceInfoImgAlt: '', // What is this diagram from the PPT?
	choiceInfoImgObjectFit: 'contain',
	surprises: [
		{
			title: 'CONGRATULATIONS!',
			text: 'Great choice! This project qualifies you for your local utility’s energy efficiency {rebate program}. You will receive a {$5,000 utility credit} for implementing energy efficiency measures.',
			img: 'images/confetti.png'
		},
	]
	// previewButton: co2SavingsButton(69420) // todo
});

Projects[Pages.digitalTwinAnalysis] = new ProjectControl({
	pageId: Pages.digitalTwinAnalysis,
	preview: {
		financesAvailable: absolute(-90_000),
		naturalGasMMBTU: relative(-0.02),
	},
	actual: {
		financesAvailable: absolute(-90_000),
		naturalGasMMBTU: relative(-0.02),
	},
	title: 'Energy Efficiency - Digital Twin Analysis',
	choiceInfoTitle: 'Conduct digital twin analysis',
	choiceInfoText: [
		'A digital twin is the virtual representation of a physical object or system across its lifecycle.', 
		'You can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
		
	],
	choiceInfoImg: 'images/chiller-systems-in-plant.png',
	choiceInfoImgAlt: 'A 3D model of the chiller systems in a plant',
	choiceInfoImgObjectFit: 'contain',
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
	};
	
	return thisApplier;
}

/**
 * Round a number to the nearest hundred-thousandth, to help with floating point precision errors.
 */
 function round(number: number) {
	return (Math.round(number * 100000)) / 100000;
}