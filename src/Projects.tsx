import React from 'react';
import type { AppState, NextAppState } from './App';
import type App from './App';
import { compareButton, deselectButton } from './components/Buttons';
import type { ButtonGroupButton } from './components/Buttons';
import { closeDialogButton } from './components/Buttons';
import { infoButtonWithDialog, implementButtonCheckbox } from './components/Buttons';
import type { TrackedStats } from './trackedStats';
import type { Choice } from './components/GroupedChoices';
import type { DialogCardContent, DialogControlProps } from './components/InfoDialog';
import { theme } from './components/theme';
import FlameIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import FactoryIcon from '@mui/icons-material/Factory';
import Pages from './Pages';
import { Alert } from '@mui/material';
import TrafficConeIcon from './icons/TrafficConeIcon';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import Co2Icon from '@mui/icons-material/Co2';
import { setCarbonEmissionsAndSavings, calculateEmissions } from './trackedStats';


// IMPORTANT: Keep Scope1Projects and Scope2Projects up to date as you add new projects!!!!!!
// These lists (Scope1Projects and Scope2Projects) keep track of WHICH projects are in WHICH scope. Currently, they are used to give a warning to the user
// 	when they click Proceed (to Year Recap) while only having selected projects from one scope.

/**
 * List of Page symbols for projects that are in the SCOPE 1 list.
 */

export const Scope1Projects = [
	Pages.advancedEnergyMonitoring, Pages.steamTrapsMaintenance, Pages.improvePipeInsulation, Pages.boilerControl,
	Pages.airHandingUnitUpgrades, Pages.processHeatingUpgrades, Pages.wasteHeatRecovery,
	Pages.electricBoiler
	//Pages.digitalTwinAnalysis, 
	//Pages.hydrogenPoweredForklifts, 
	//Pages.condensingEconomizerInstallation, 
]
/**
 * List of Page symbols for projects that are in the SCOPE 2 list.
 */

export const Scope2Projects = [
	Pages.advancedEnergyMonitoring,
	Pages.reduceFanSpeeds, Pages.lightingOccupancySensors, Pages.improveLightingSystems, Pages.startShutOff,
	Pages.airHandingUnitUpgrades, Pages.compressedAirSystemImprovemnt, Pages.loweringCompressorPressure,
	Pages.chilledWaterMonitoringSystem,
	Pages.installVFDs1, Pages.installVFDs2, Pages.installVFDs3,
	Pages.solarPanelsCarPort,
	Pages.solarPanelsCarPortMaintenance,
	Pages.midSolar,
	Pages.solarRooftop,
	Pages.largeWind,
	Pages.smallVPPA,
	Pages.midVPPA,
	Pages.largeVPPA,
	// Pages.solarFieldOnSite, 
	//Pages.lightingUpgrades, Pages.greenPowerTariff,
	//Pages.compressedAirSystemOptimization, 
	//Pages.refrigerationUpgrade, 
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
	imgObjectFit?: 'cover' | 'contain';
	imgAlt?: string;
}

/**
 * Used for tracking completed project related state throughout the view/pages
 */
export interface CompletedProject extends Project {
	selectedYear: number,
}

export interface SelectedProject extends Project {
	infoDialog: DialogControlProps
}

export interface RenewalProject extends Project {
	yearsImplemented: number[],
    yearStarted: number;
	yearlyFinancialSavings?: {
		naturalGas: number,
		electricity: number	
	}
}

export interface Project {
	page: symbol
}

/**
 * Used for tracking Game Settings  
 */
export interface GameSettings {
	totalIterations: number,
	budget: number,
	naturalGasUse: number,
	electricityUse: number,
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
	 * Project that has to be renewed (reimplemented) each year) - stat appliers are removed going into each year
	*/
	renewalRequired?: boolean;

	/**
	 * Numbers that appear on the INFO CARD, before checking the checkbox.
	 */
	statsInfoAppliers: TrackedStatsApplier;
	/**
	 * Numbers that affect the dashboard charts AND that apply when "Proceed" is clicked.
	 */
	statsActualAppliers: TrackedStatsApplier;
	/**
	 * Stats that are applied at year end (or year range) recap
	 */
	statsRecapAppliers?: TrackedStatsApplier;
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
	energySavingsPreviewButton?: ButtonGroupButton;
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
	projectDialogInfo?: DialogControlProps;
	hasSingleYearAppliers?: boolean;
	relatedProjectSymbols?: symbol[];
}

export class ProjectControl implements ProjectControlParams {

	pageId: symbol;
	renewalRequired?: boolean;
	cost: number;
	statsInfoAppliers: TrackedStatsApplier;
	statsActualAppliers: TrackedStatsApplier;
	statsRecapAppliers?: TrackedStatsApplier;
	title: string;
	shortTitle: string;
	choiceInfoText: string | string[];
	choiceInfoImg?: string;
	choiceInfoImgAlt?: string;
	choiceInfoImgObjectFit?: 'cover' | 'contain';
	recapDescription: string | string[];
	energySavingsPreviewButton?: ButtonGroupButton;
	utilityRebateValue?: number;
	recapSurprises?: RecapSurprise[];
	caseStudy?: CaseStudy;
	recapAvatar: RecapAvatar;
	rebateAvatar: RecapAvatar;
	visible: Resolvable<boolean>;
	disabled: Resolvable<boolean>;
	yearSelected?: number;
	projectDialogInfo: DialogControlProps;
	hasSingleYearAppliers?: boolean;
	relatedProjectSymbols?: symbol[] | undefined;

	/**
	 * Project Control constructor. See `ProjectControlParams` for details on each parameter.
	 * @param params 
	 */
	constructor(params: ProjectControlParams) {
		this.pageId = params.pageId;
		this.renewalRequired = params.renewalRequired;
		this.statsInfoAppliers = params.statsInfoAppliers;
		this.statsActualAppliers = params.statsActualAppliers;
		this.statsRecapAppliers = params.statsRecapAppliers;
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
		this.energySavingsPreviewButton = params.energySavingsPreviewButton;
		this.rebateAvatar = params.rebateAvatar || {
			icon: <ThumbUpAltIcon />,
			backgroundColor: 'rgba(255,255,255,0.8)',
			color: 'rgba(63, 163, 0, 1)',
		};
		this.caseStudy = params.caseStudy;
		if (params.utilityRebateValue) this.utilityRebateValue = params.utilityRebateValue;
		else this.utilityRebateValue = 0;
		this.recapSurprises = params.recapSurprises;
		this.visible = params.visible || true; // Default to true
		this.disabled = params.disabled || false; // Default to false
		this.cost = params.cost;
		this.yearSelected = params.yearSelected;
		this.projectDialogInfo = { title: '', text: '' };
		this.hasSingleYearAppliers = params.hasSingleYearAppliers;
		this.relatedProjectSymbols = params.relatedProjectSymbols;
	}

    /**
     * Applies this project's stat changes by mutating the provided TrackedStats object.
     * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
     */
    applyStatChanges(mutableStats: TrackedStats) {
        for (let key in this.statsActualAppliers) {
            let thisApplier = this.statsActualAppliers[key];
            if (!thisApplier) return;
			let yearMultiplier = 1;
			if (thisApplier.isAbsolute && !this.hasSingleYearAppliers) {
				yearMultiplier = mutableStats.gameYears;
			}
            mutableStats[key] = thisApplier.applyValue(mutableStats[key], yearMultiplier);
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
		let cost = this.cost;
		if (this.renewalRequired) {
			cost = cost * mutableStats.gameYears;
			// todo 22 should get every year?
			rebates = rebates * mutableStats.gameYears;
		}
        mutableStats.financesAvailable -= cost - rebates;
        mutableStats.moneySpent += cost;
        mutableStats.totalBudget += rebates;
    }

    /**
     * Un-applies this project's stat changes by mutating the provided TrackedStats object.
     * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
     */
    unApplyStatChanges(mutableStats: TrackedStats, shouldUnapplyCosts: boolean = true) {
        for (let key in this.statsActualAppliers) {
            let thisApplier = this.statsActualAppliers[key];
            if (!thisApplier) return;

			let yearMultiplier = 1;
			if (thisApplier.isAbsolute && !this.hasSingleYearAppliers) {
				yearMultiplier = mutableStats.gameYears;
			}
            mutableStats[key] = thisApplier.unApplyValue(mutableStats[key], yearMultiplier);
        }
		if (shouldUnapplyCosts) {
			this.unApplyCost(mutableStats);
		}
    }

    /**
     * Un-applies this project's cost & rebates by mutating the provided TrackedStats object.
     * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
     */
    unApplyCost(mutableStats: TrackedStats) {
        let rebates = this.getRebates();
		let cost = this.cost;
		if (this.renewalRequired) {
			cost = cost * mutableStats.gameYears;
			// todo 22 should get every year?
			rebates = rebates * mutableStats.gameYears;
		}
        mutableStats.financesAvailable += cost - rebates;
        mutableStats.moneySpent -= cost;
        mutableStats.totalBudget -= rebates;
    }

    /**
     * Returns the total amount of rebates of this project.
     */
    getRebates(): number {
        return (this.statsActualAppliers.totalRebates) ? this.statsActualAppliers.totalRebates.modifier : 0;
    }

    /**
     * Returns the total amount of in-year and end-of-year rebates of this project.
     */
    getYearEndRebates(): number {
        let total = 0;
        if (this.statsActualAppliers.totalRebates) {
            total += this.statsActualAppliers.totalRebates.modifier;
        }
        if (this.statsRecapAppliers?.totalRebates) {
            total += this.statsRecapAppliers.totalRebates.modifier;
        }
        return total;
    }

    /**
     * Returns the extra hidden costs of the projects (via the `moneySpent` stat key)
     */
    getHiddenCost(): number {
        return (this.statsRecapAppliers && this.statsRecapAppliers.moneySpent) ? this.statsRecapAppliers.moneySpent.modifier : 0;
    }

    /**
     * Returns the net cost of this project, including rebates (and in future, surprise hitches)
     */
    getYearEndNetCost(gameYears?: number): number {
		let cost = this.cost;
		let rebates = this.getYearEndRebates();
		let hiddenCosts = this.getHiddenCost();
		if (gameYears !== undefined) {
			cost = gameYears * cost;
			rebates = gameYears * rebates;
			hiddenCosts = hiddenCosts * gameYears;
		}
        return cost - rebates + hiddenCosts;
    }

    /**
     * Gets a Choice control for the GroupedChoices pages in PageControls.tsx
     */
    getProjectChoiceControl(): Choice {

        const self = this; // for use in bound button handlers

        let infoDialogStatCards: DialogCardContent[] = [];
        let choiceStats: ButtonGroupButton[] = [];

        infoDialogStatCards.push({
            text: `Total project cost: {$${(this.cost).toLocaleString('en-US')}}`,
            color: theme.palette.secondary.dark,
        });

        if (this.statsInfoAppliers.naturalGasMMBTU) {
            infoDialogStatCards.push({
                text: `Natural gas reduction: {${this.statsInfoAppliers.naturalGasMMBTU.toString(true)}}`,
                color: theme.palette.primary.light,
            });
        }
        if (this.statsInfoAppliers.electricityUseKWh) {
            infoDialogStatCards.push({
                text: `Electricity reduction: {${this.statsInfoAppliers.electricityUseKWh.toString(true)}}`,
                color: theme.palette.warning.light,
            });
        }
        if (this.statsInfoAppliers.absoluteCarbonSavings) {
            infoDialogStatCards.push({
                text: `Carbon Reduction: {${this.statsInfoAppliers.absoluteCarbonSavings.toString(true)}}`,
                color: theme.palette.primary.main,
            });
        }

        let choiceCardButtons: ButtonGroupButton[] = [];
        let comparisonDialogButtons: ButtonGroupButton[] = [];

        this.projectDialogInfo = {
            title: self.title,
            text: self.choiceInfoText,
            img: self.choiceInfoImg,
            imgAlt: self.choiceInfoImgAlt,
            imgObjectFit: self.choiceInfoImgObjectFit,
            cards: infoDialogStatCards,
            handleProjectInfoViewed: function (state, nextState) {
                return setAllowImplementProject.apply(this, [state, nextState]);
            },
            buttons: [
                closeDialogButton(),
                {
                    text: 'Implement Project',
                    variant: 'contained',
                    color: 'success',
                    onClick: function (state, nextState) {
                        let isProjectImplemented: boolean = state.implementedProjects.includes(self.pageId);
                        if (self.renewalRequired) {
                            isProjectImplemented = state.projectsRequireRenewal.some((project: RenewalProject) => {
                                if (project.page === self.pageId && project.yearsImplemented.includes(state.trackedStats.year)) {
                                    return true
                                }
                                return false;
                            });
                            if (isProjectImplemented) {
                                return state.currentPage;
                            }
                            return toggleRenewalRequiredProject.apply(this, [state, nextState]);
                        } else {
                            return toggleProjectImplemented.apply(this, [state, nextState]);
                        }
                    },
                    // disabled when the project is implemented
                    disabled: (state) => {
                        if (self.renewalRequired) {
                            return state.projectsRequireRenewal.some(project => project.page === self.pageId);
                        } else {
                            return state.implementedProjects.includes(self.pageId);
                        }
                    }
                }
            ],
        };

        addCompareProjectButton(choiceCardButtons);
        choiceCardButtons.push(infoButtonWithDialog(this.projectDialogInfo));
        addImplementProjectButton(choiceCardButtons);

        if (self.energySavingsPreviewButton) {
            choiceStats.push(self.energySavingsPreviewButton);
        }

        comparisonDialogButtons.push(deselectButton(handleRemoveSelectedCompare));
        addImplementProjectButton(comparisonDialogButtons);
        this.projectDialogInfo.comparisonDialogButtons = comparisonDialogButtons;


		// todo 88 visible is set directly onto the project ref from the display button, should default to visible() if exists
        let projectControlChoice: Choice = {
            title: this.title,
            text: this.shortTitle,
            choiceStats: choiceStats,
            buttons: choiceCardButtons,
            visible: function (state) {
				if (self.pageId === Pages.solarPanelsCarPortMaintenance) {
					// todo 88 bit of a bandaid until re-working visible()
					return this.resolveToValue(getSolarCarportMaintenanceVisible(state));
				} else if (state.projectsRequireRenewal.some(project => project.page === self.pageId)) {
                    return true;
                } else if (state.completedProjects.some(project => project.page === self.pageId)) {
                    return false;
                } else {
					// todo 88 this block should be before all others for projects with visible() defined,
					// except visible is resolved and assigned to itself so it falls through and ignores defaults
					// keep original else block here and adding if bandaids for dependant projects above
					return this.resolveToValue(self.visible, true);
				} 
               
            },
            key: this.pageId.description,
            disabled: this.disabled,
        };


		return projectControlChoice;

		function getSolarCarportMaintenanceVisible(state) {
			const isCarportCompleted = state.completedProjects.some(project => project.page === Pages.solarPanelsCarPort);
			// hide if maintenance has been implemented and user navigates back to year carport implemented 
			const carportImplementedYear = state.implementedProjects.find(project => project === Pages.solarPanelsCarPort);
			const maintenanceImplemented = state.projectsRequireRenewal.some(project => {
				return project.page === Pages.solarPanelsCarPortMaintenance;
			})
			// if going to previous year, project can be in both completed and implemented
			return isCarportCompleted || (maintenanceImplemented && !carportImplementedYear);
		}

        function addCompareProjectButton(buttons: ButtonGroupButton[]) {
            const isSelectedForCompare = (props) => {
                return props.selectedProjectsForComparison.some(project => project.page == self.pageId);
            };

            const isDisabled = (props) => {
                return props.selectedProjectsForComparison.length >= 3 && !isSelectedForCompare(props);
            };

            const getButtonText = (props) => {
                let selected = isSelectedForCompare(props);
                return selected ? 'Select another to compare' : 'Compare';
            };

            buttons.push(compareButton(
                toggleSelectedProjectToCompare,
                (props) => isSelectedForCompare(props),
                (props) => isDisabled(props),
                (props) => getButtonText(props)
            ));
        }

        function addImplementProjectButton(buttons: ButtonGroupButton[]) {
            // const shouldDisplayImplementButton = (props) => {
            // 	return props.allowImplementProjects.includes(this.pageId);
            // };
            const shouldDisableImplementButton = (props) => {
                return !props.allowImplementProjects.includes(self.pageId);
            };
            const isProjectImplemented = (props) => {
                if (self.renewalRequired) {
                    return props.projectsRequireRenewal.some((project: RenewalProject) => {
                        if (project.page === self.pageId && project.yearsImplemented.includes(props.trackedStats.year)) {
                            return true
                        }
                        return false;
                    });
                }
                return props.implementedProjects.includes(self.pageId);
            };
            
            buttons.push(implementButtonCheckbox(
                self.renewalRequired? toggleRenewalRequiredProject : toggleProjectImplemented,
                (props) => shouldDisableImplementButton(props),
                (props) => isProjectImplemented(props),
                // (props) => shouldDisplayImplementButton(props)
            ));
        }

        function setAllowImplementProject(this: App, state: AppState, nextState: NextAppState) {
            let allowImplementProjects = [...state.allowImplementProjects];
            const existingIndex: number = allowImplementProjects.findIndex(projectPageId => projectPageId === self.pageId);
            if (existingIndex === -1) {
                allowImplementProjects.push(self.pageId);
                nextState.allowImplementProjects = [...allowImplementProjects];
            }
        }

        function removeSelectedForCompare(state): Array<SelectedProject> {
            let selectedProjectsForComparison = [...state.selectedProjectsForComparison];
            const removeProjectIndex: number = selectedProjectsForComparison.findIndex(project => project.page === self.pageId);
            if (removeProjectIndex !== -1) {
                selectedProjectsForComparison.splice(removeProjectIndex, 1);
            }
            return selectedProjectsForComparison;
        }

        function handleRemoveSelectedCompare(this: App, state: AppState, nextState: NextAppState) {
            nextState.selectedProjectsForComparison = removeSelectedForCompare(state);
            if (nextState.selectedProjectsForComparison.length === 0) {
                nextState.isCompareDialogOpen = false;
            }
            return state.currentPage;
        }

        function toggleSelectedProjectToCompare(this: App, state: AppState, nextState: NextAppState) {
            let selectedProjectsForComparison = [...state.selectedProjectsForComparison];
            let isSelectingCompare = !selectedProjectsForComparison.some(project => project.page === self.pageId);
            if (isSelectingCompare && selectedProjectsForComparison.length < 3) {
                selectedProjectsForComparison.push({
                    page: self.pageId,
                    infoDialog: self.projectDialogInfo
                });
            } else {
                selectedProjectsForComparison = removeSelectedForCompare(state);
            }

            let isCompareDialogOpen = false;
            // Auto open when 3 selected
            if (selectedProjectsForComparison.length == 3) {
                isCompareDialogOpen = isSelectingCompare ? true : false;
                this.handleCompareDialogDisplay(isCompareDialogOpen);
            } else if (selectedProjectsForComparison.length < 2) {
                isCompareDialogOpen = false;
            }


            nextState.isCompareDialogOpen = isCompareDialogOpen;
            nextState.selectedProjectsForComparison = selectedProjectsForComparison;
            return state.currentPage;
        }
        /**
         * Action to toggle whether the project is selected, after a select button is clicked.
         */
        function toggleProjectImplemented(this: App, state: AppState, nextState: NextAppState) {
            let implementedProjects = state.implementedProjects.slice();
            let newTrackedStats = { ...state.trackedStats };
            // IF PROJECT IS ALREADY SELECTED
            let hasAbsoluteCarbonSavings = self.statsActualAppliers.absoluteCarbonSavings !== undefined;
            if (implementedProjects.includes(self.pageId)) {
                // Since the order of projects matters, we can't simply unApplyChanges to ourself.
                // 	We must first undo all the stat changes in REVERSE ORDER, then re-apply all but this one.
                for (let i = implementedProjects.length - 1; i >= 0; i--) {
                    let pageId = implementedProjects[i];
                    Projects[pageId].unApplyStatChanges(newTrackedStats);
                }

                implementedProjects.splice(implementedProjects.indexOf(self.pageId), 1);


				// * 88 check if associated maintenance project is implemented, remove then reset stats

				let projectsRequireRenewal: RenewalProject[] = [...this.state.projectsRequireRenewal];
				if (self.relatedProjectSymbols) {
					const dependantChildProjectIndex = projectsRequireRenewal.findIndex(project => self.relatedProjectSymbols && self.relatedProjectSymbols.includes(project.page));	
					if (dependantChildProjectIndex >= 0) {
						let yearRangeInitialStats: TrackedStats[] = [...state.yearRangeInitialStats];
						removeRenewalProject(projectsRequireRenewal, dependantChildProjectIndex, newTrackedStats, yearRangeInitialStats, true);

						nextState.projectsRequireRenewal = projectsRequireRenewal;
						nextState.yearRangeInitialStats = yearRangeInitialStats;
					}
				}


                for (let i = 0; i < implementedProjects.length; i++) {
                    let pageId = implementedProjects[i];
                    Projects[pageId].applyStatChanges(newTrackedStats);
                }
            }
            // IF PROJECT IS NOT ALREADY SELECTED
            else {
                let projectImplementationLimit = 4;
				let overLimitMsg = `Due to manpower limitations, you cannot select more than ${projectImplementationLimit} projects per year`;
				if (state.gameSettings.totalIterations === 5) {
					projectImplementationLimit = 6;
					overLimitMsg = `Due to manpower limitations, you cannot select more than ${projectImplementationLimit} projects per budget period`;
				}
				if (implementedProjects.length >= projectImplementationLimit) {
					this.summonSnackbar(<Alert severity='error'>{overLimitMsg}</Alert>);
					return state.currentPage;
				}
				
                if (self.cost > state.trackedStats.financesAvailable) {
                    this.summonSnackbar(<Alert severity='error'>You cannot afford this project with your current budget!</Alert>);
                    return state.currentPage;
                }

                implementedProjects.push(self.pageId);
                self.applyStatChanges(newTrackedStats);
                if (!hasAbsoluteCarbonSavings) {
                    newTrackedStats.carbonEmissions = calculateEmissions(newTrackedStats);
                }
                nextState.selectedProjectsForComparison = removeSelectedForCompare(state);
            }

            newTrackedStats = setCarbonEmissionsAndSavings(newTrackedStats, this.state.defaultTrackedStats);
            nextState.implementedProjects = implementedProjects;
            nextState.trackedStats = newTrackedStats;

            return state.currentPage; // no page change
        }


        function toggleRenewalRequiredProject(this: App, state: AppState, nextState: NextAppState) {
            let projectsRequireRenewal: RenewalProject[] = [...this.state.projectsRequireRenewal];
            let newTrackedStats: TrackedStats = { ...state.trackedStats };
            let yearRangeInitialStats: TrackedStats[] = [...state.yearRangeInitialStats];
            let hasAbsoluteCarbonSavings = self.statsActualAppliers.absoluteCarbonSavings !== undefined;

            const existingRenewalProjectIndex = projectsRequireRenewal.findIndex(project => project.page === self.pageId);
            let implementedInCurrentYear = false;
            if (existingRenewalProjectIndex >= 0) {
                implementedInCurrentYear = projectsRequireRenewal[existingRenewalProjectIndex].yearsImplemented.includes(newTrackedStats.year);
            } 

            if (implementedInCurrentYear) {
                // * 22 removes stats AND costs from current year
				removeRenewalProject(projectsRequireRenewal, existingRenewalProjectIndex, newTrackedStats, yearRangeInitialStats);


            } else if (!implementedInCurrentYear) {
                if (self.cost > state.trackedStats.financesAvailable) {
					console.log('project cost', self.cost)
					console.log('state.trackedStats.financesAvailable', state.trackedStats.financesAvailable)
                    this.summonSnackbar(<Alert severity='error'>You cannot afford this project with your current budget!</Alert>);
                    return state.currentPage;
                }

                if (existingRenewalProjectIndex >= 0) {
                    projectsRequireRenewal[existingRenewalProjectIndex].yearsImplemented.push(newTrackedStats.year);
                    self.applyStatChanges(newTrackedStats);
                    // * 22 if we've de-selected renewal implementation AND re-selected to implement in the same year, yearRangeInitial stats are out of sync with trackedStats
                    yearRangeInitialStats = [...state.yearRangeInitialStats];
                    const updatedCurrentStatsIndex = yearRangeInitialStats.findIndex(stats => stats.year === newTrackedStats.year);
                    yearRangeInitialStats.splice(updatedCurrentStatsIndex, 1, newTrackedStats);
                } else {
                    projectsRequireRenewal.push({
                        page: self.pageId,
                        yearsImplemented: [newTrackedStats.year],
                        yearStarted: newTrackedStats.year,
                    });
                    self.applyStatChanges(newTrackedStats);
                }

                if (!hasAbsoluteCarbonSavings) {
                    newTrackedStats.carbonEmissions = calculateEmissions(newTrackedStats);
                }
                nextState.selectedProjectsForComparison = removeSelectedForCompare(state);

            }

            newTrackedStats = setCarbonEmissionsAndSavings(newTrackedStats, this.state.defaultTrackedStats);
            nextState.projectsRequireRenewal = projectsRequireRenewal;
            nextState.trackedStats = newTrackedStats;
            nextState.yearRangeInitialStats = yearRangeInitialStats;
            return state.currentPage;
        }

		/**
         * Remove implementation year are whole project
         */
		function removeRenewalProject(projectsRequireRenewal: RenewalProject[], removeProjectIndex: number, newTrackedStats: TrackedStats, yearRangeInitialStats: TrackedStats[], isFullRemoval = false) {
			for (let i = projectsRequireRenewal.length - 1; i >= 0; i--) {
				const project = projectsRequireRenewal[i];
				if (project.yearsImplemented.includes(newTrackedStats.year)) {
					Projects[project.page].unApplyStatChanges(newTrackedStats);
				}
			}
			
			const removeProject = projectsRequireRenewal[removeProjectIndex];
			if (removeProject) {
				if (isFullRemoval || removeProject.yearStarted === newTrackedStats.year) {
					projectsRequireRenewal.splice(removeProjectIndex, 1);
				} else {
						const implementedYear = removeProject.yearsImplemented.findIndex(year => year === newTrackedStats.year);
						removeProject.yearsImplemented.splice(implementedYear, 1);
				}

			}

			for (let i = 0; i < projectsRequireRenewal.length; i++) {
				const project = projectsRequireRenewal[i];
				if (project.yearsImplemented.includes(newTrackedStats.year)) {
					Projects[project.page].applyStatChanges(newTrackedStats);
				}
			}

			// * 22 update current stat year (necessary because we apply renewal at year recap of previous year) 
            const currentYearEndIndex = yearRangeInitialStats.findIndex(stats => stats.year === newTrackedStats.year);
			if (currentYearEndIndex !== 0) {
				yearRangeInitialStats.splice(currentYearEndIndex, 1, newTrackedStats);
			}
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
	cost: 210_000,
	// Stats that appear in the CARDS inside the INFO DIALOG. These should mirror ActualAppliers 
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-14_400),
	},
	// statsActualAppliers should mirror 
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-14_400),
	},
	// Stats / Surprises that are applied in Year Recap. 
	statsRecapAppliers: {
		totalRebates: absolute(5_000),
	},
	title: 'Waste Heat Recovery',
	shortTitle: 'Install waste heat recovery to preheat boiler water',
	// bracketed words show as bold emphasis in the app 
	choiceInfoText: [
		'Your plant’s boilers currently pull water in directly from the plant water inlet.',
		'Installing a waste heat recovery system to preheat the water would reduce the amount of natural gas required by the system.'
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
	energySavingsPreviewButton: {
		text: '12%',
		variant: 'text',
		startIcon: <FlameIcon />
	},
	// SEE BELOW: EXAMPLE FOR CONDITIONAL PROJECT VISIBILITY - you can also do something like state.completedProjects.includes(Pages.myOtherProject)
	// visible: function (state: AppState) {
	//  return state.trackedStats.year >= 2;
	// }
});
// Projects[Pages.digitalTwinAnalysis] = new ProjectControl({
//  pageId: Pages.digitalTwinAnalysis,
//  cost: 90_000,
//  statsInfoAppliers: {
//      naturalGasMMBTU: absolute(-2_400),
//  },
//  statsActualAppliers: {
//      naturalGasMMBTU: absolute(-2_400),
//  },
//  title: 'Energy Efficiency - Digital Twin Analysis',
//  shortTitle: 'Conduct digital twin analysis',
//  choiceInfoText: [
//      'A digital twin is the virtual representation of a physical object or system across its lifecycle.',
//      'You can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
//  ],
//  recapDescription: 'Insert flavor text here!',
//  choiceInfoImg: 'images/chiller-systems-in-plant.png',
//  choiceInfoImgAlt: 'A 3D model of the chiller systems in a plant',
//  choiceInfoImgObjectFit: 'contain',
//  caseStudy: {
//      title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
//      text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
//  },
//  energySavingsPreviewButton: {
//      text: '2.0%',
//      variant: 'text',
//      startIcon: <FlameIcon />,
//  }
// });
Projects[Pages.processHeatingUpgrades] = new ProjectControl({
	pageId: Pages.processHeatingUpgrades,
	cost: 80_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-300_000),
		naturalGasMMBTU: absolute(-3000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-300_000),
		naturalGasMMBTU: absolute(-3000),
	},
	title: 'Paint Booth Upgrades',
	shortTitle: 'Explore upgrades for entire paint process system',
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
	energySavingsPreviewButton: {
		text: '1.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
// Projects[Pages.hydrogenPoweredForklifts] = new ProjectControl({
//  pageId: Pages.hydrogenPoweredForklifts,
//  cost: 100_000,
//  statsInfoAppliers: {
//      // I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
//  },
//  statsActualAppliers: {
//      // I don't know what this'll actually affect! It's not natural gas but it's also not the electrical grid
//  },
//  title: 'Fuel Switching – Hydrogen Powered Forklifts',
//  shortTitle: 'Switch to hydrogen powered forklifts',
//  choiceInfoText: [
//      'Currently, your facility uses {lead acid} batteries to power your mobile forklifts, which yields {high} maintenance costs and {low} battery life for each forklift.',
//      'You can replace these batteries with {hydrogen fuel cell} batteries, which will result in {lower} maintenance costs, {longer} battery life, and contribute to your facility’s {reduced} emissions.',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'Spring Hill Pioneers Hydrogen Fuel Cell Technology For GM',
//      url: 'https://www.wheelermaterialhandling.com/blog/spring-hill-pioneers-hydrogen-fuel-cell-technology-for-gm',
//      text: 'In 2019, General Motors began piloting a program in which hydrogen is turned into electricity to fuel forklifts, resulting in a {38%} decrease in fleet maintenance costs and a {5-year increase} in average battery life for each forklift.'
//  },
//  energySavingsPreviewButton: {
//      text: '??%',
//      variant: 'text',
//      startIcon: <BoltIcon />,
//  },
// });
// Projects[Pages.lightingUpgrades] = new ProjectControl({
//  pageId: Pages.lightingUpgrades,
//  cost: 12_000,
//  statsInfoAppliers: {
//      electricityUseKWh: relative(-0.125),
//  },
//  statsActualAppliers: {
//      electricityUseKWh: relative(-0.125),
//  },
//  statsRecapAppliers: {
//      totalRebates: absolute(7_500),
//  },
//  title: 'Energy Efficiency – Lighting Upgrades',
//  shortTitle: 'Explore lighting upgrades',
//  choiceInfoText: [
//      'Your plant currently uses {inefficient} T12 lighting. The lighting level in certain areas in the facility is {low} and affects the productivity of workers in those areas.',
//      'You could replace this lighting with LED lighting, which provides {reduced} energy consumption, a {longer} lifespan, and lighting control.'
//  ],
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'Lennox International: LED Project At New Regional Distribution Leased Location',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/lennox-international-led-project-at-new-regional-distribution-leased-location',
//      text: 'In 2016, {Lennox International} in Richardson, Texas implemented LED lighting throughout their warehouse, which resulted in annual energy savings of {$35,000.}'
//  },
//  utilityRebateValue: 5000,
// });
Projects[Pages.electricBoiler] = new ProjectControl({
	pageId: Pages.electricBoiler,
	cost: 500_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(200_000),
		naturalGasMMBTU: absolute(-20_000), // since the flavor text says No. 2 oil... maybe add a new stat later
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(200_000),
		naturalGasMMBTU: absolute(-20_000),
	},
	title: 'Fossel Fuel to Electric Boiler',
	shortTitle: 'Replace old fossil fuel boiler with an electric boiler',
	choiceInfoText: [
		'The smaller of your two boilers is {older} and near ready for replacement.  You can replace that boiler with an {electric boiler} providing the same steam pressure, temperature and rate. ',
		'As the boiler needs replacing soon, corporate has agreed to pay for half of this project out of capital funds, leaving you with about half the total installed cost.'
	],
	recapDescription: 'Insert flavor text here!',
	// add case study
});
Projects[Pages.solarPanelsCarPort] = new ProjectControl({
	pageId: Pages.solarPanelsCarPort,
	cost: 150_000,
	hasSingleYearAppliers: true,
	relatedProjectSymbols: [Pages.solarPanelsCarPortMaintenance],
	statsInfoAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	statsRecapAppliers: {
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
	title: 'Small Carport Solar Installation',
	shortTitle: 'Install solar panels on new facility carport',
	choiceInfoText: [
		`You decided to look into installing a small covered carport with a solar electricity generation system. Given the sizing of your parking lot and available room, you decide on a {0.25 MW system} and using 
		parking in the carport as an incentive to well performing or energy saving employees. You decide to pay for the carport outright and not via a power purchase agreement.
	    You will recieve {CREDITs} to your budget for the energy generated (and not purchased).`
	],
	choiceInfoImg: 'images/solar-panels.png',
	choiceInfoImgAlt: 'Solar panels on the roof top of a car parking lot.',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Lockheed Martin 2.25 Megawatts Solar Carport',
		url: 'https://www.agt.com/portfolio-type/lockheed-martin-solar-carport/',
		text: 'In 2017, {Lockheed Martin} installed a 4-acre solar carport and was able to provide {3,595,000} kWh/year, or enough electricity to power almost {500 homes} annually.',
	},
	energySavingsPreviewButton: {
		text: '1.8%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => {
		const isCarportCompleted = state.completedProjects.some(project => project.page === Pages.solarPanelsCarPort);
		return !isCarportCompleted;
	}
});
Projects[Pages.solarPanelsCarPortMaintenance] = new ProjectControl({
	pageId: Pages.solarPanelsCarPortMaintenance,
	renewalRequired: true,
	cost: 10_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	title: 'Carport Solar - Maintenance',
	shortTitle: 'Continue receiving energy from your solar generation.{YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['You have installed and paid for your carport solar but need to perform small maintenance tasks for it. {YOU MUST RENEW THIS PROJECT ANNUALLY} to continue recieving the energy credits.'],
	choiceInfoImg: '',
	choiceInfoImgAlt: '',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewButton: {
		text: '1.8%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.solarRooftop] = new ProjectControl({
	pageId: Pages.solarRooftop,
	renewalRequired: true,
	cost: 375_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-5_365_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-5_365_000),
	},
	//   statsRecapAppliers: {
	//       financesAvailable: absolute(-30_000),
	//        moneySpent: absolute(30_000),
	//    },
	//    recapSurprises: [{
	//        title: 'Uh oh - Bad Asphalt!',
	//        text: 'While assessing the land in person, the contractor found that the parking lot\'s {asphalt needs replacement}. This will require an {additional $30,000} for the carport’s installation.',
	//        avatar: {
	//           icon: <TrafficConeIcon />,
	//            backgroundColor: 'rgba(54,31,6,0.6)',
	//           color: 'rgb(255 135 33)',
	//        }
	//    }],
	title: 'Mid-sized solar with storage via PACE loan',
	shortTitle: 'Use a PACE loan to build a 2MW rooftop solar array, with storage. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: [
		'To meet aggressive decarbonization goals, you have looked into installing solar panels on your roof. You have you have arranged for a {PACE loan} and you will pay off the equipment over 10 years.',
		'You believe you can install a 2MW system with storage for 0.5MW without interfering with your existing roof infrastructure.   Your budget will be responsible for paying for this loan over the next 10 years, so {YOU MUST RENEW THIS PROJECT ANNUALLY}, but a {CREDIT} for the grid electricity payment is added to your budget for the next year.'
	],
	choiceInfoImg: 'images/solar-panels.png',
	choiceInfoImgAlt: 'Solar panels on the roof top of a car parking lot.',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Financing Carbon Projects Factsheet',
		url: 'https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/External_Financing_Carbon_Projects_Factsheet.pdf',
		text: '',
	},
	energySavingsPreviewButton: {
		text: '18%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

//Empty Projects Scope 1 yr1-yr5
Projects[Pages.airHandingUnitUpgrades] = new ProjectControl({
	pageId: Pages.airHandingUnitUpgrades,
	cost: 175_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-1_165_000),
		naturalGasMMBTU: absolute(-3600),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-1_165_000),
		naturalGasMMBTU: absolute(-3600),
	},
	title: 'Install automated controls for Air Handing Units',
	shortTitle: 'Install automated AHU controls to manage airflow without requiring the plant operator to manage the settings.',
	choiceInfoText: [
		'Your facilities has 20 AHUs that deliver over 1.2 million cubic feet per minute of conditioned air to maintain temperature, humidity, and air quality.',
		'Upgrading the controls system will lower the speed of the AHU motors once set points are met, enabling the temperature and humidity to be maintained while running the motors at a lower kilowatt (kW) load.',
		'Additionally, the controls include CO2 sensors to monitor air quality and adjust outdoor air ventilation accordingly. '
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
	energySavingsPreviewButton: {
		text: '3.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
Projects[Pages.advancedEnergyMonitoring] = new ProjectControl({
	pageId: Pages.advancedEnergyMonitoring,
	cost: 60_000,
	statsInfoAppliers: {
		// electricityUseKWh: absolute(-0.03),
		// naturalGasMMBTU: relative(-0.03),
	},
	statsActualAppliers: {
		// electricityUseKWh: relative(-0.03),
		// naturalGasMMBTU: relative(-0.03),
	},
	title: 'Advanced Energy monitoring with Wireless Submetering',
	shortTitle: 'Installing submeters and an energy monitoring system will allow for the identification of future projects.',
	choiceInfoText: [
		`Your plant has {no monitoring} of its electrical and natural gas load beyond their monthly utility bills. However, installing submeters at every electrical and natural gas load in the plant is not economical or necessary. It was determined that you only need enough submeters installed so that the modeled energy consumption mimics the site’s actual energy curve. 
		This project would first determine which loads the plant would benefit from determining the energy consumption of.
	    The loads resulting in savings greater than the cost of a sensor were chosen as metering points. Sites for {50 sensors} were identified, covering over 75% of the facility load. While this project has {no direct energy savings}, it will allow for other projects to be identified. `
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
	energySavingsPreviewButton: {
		text: '0.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
// Projects[Pages.condensingEconomizerInstallation] = new ProjectControl({
//  pageId: Pages.condensingEconomizerInstallation,
//  cost: 95_000,
//  statsInfoAppliers: {
//      naturalGasMMBTU: relative(-0.07),
//  },
//  statsActualAppliers: {
//      naturalGasMMBTU: relative(-0.07),
//  },
//  title: 'Condensing Economizer Installation',
//  shortTitle: 'Condensing Economizer Installation ',
//  choiceInfoText: [
//      'The project involved recovering heat from the boiler exhaust via a direct contact condensing economizer. Exhaust is vented to the economizer in conjunction with the steam from each of the site’s deaerators and condensate return tanks.',
//      'Dampers (a valve or plate that regulates the flow of air inside a duct) installed at each broiler stack ensure proper draft and combustion flow to the economizer. This allows water in direct contact with the boiler exhaust to be heated and piped throughout the facility to the heat sinks (a temperature regulator).',
//      ' As a result, the hot water is used to pre-heat boiler water andfacility product through air gap plate and frame heat exchangers. Hot water flow is then regulated via control valves set to certain temperatures at an extremely steady state. Overall, the heat recovery system is monitored by a programmable logic control (PLC) system.',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'PEPSICO: CONDENSING ECONOMIZER INSTALLATION',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/pepsico-condensing-economizer-installation',
//      text: 'As part of the company’s 2025 25% greenhouse gas (GHG) reduction goal, it set out to reduce the energy usage of the Gatorade pasteurization process. Pasteurization is a process in which certain foods, such as milk and fruit juice, are treated with heat to eliminate pathogens and extend shelf life.'
//  },
//  energySavingsPreviewButton: {
//      text: '7.0%',
//      variant: 'text',
//      startIcon: <FlameIcon />,
//  },
// });
Projects[Pages.boilerControl] = new ProjectControl({
	pageId: Pages.boilerControl,
	cost: 100_000,
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-9600),
	},
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-9600),
	},
	title: 'Installing boiler monitors and control',
	shortTitle: 'Install a combustion controller to monitor and optimize the fuel-to-air ratio to maximize the efficiency of the combustion process. ',
	choiceInfoText: [
		`Your larger boiler is older, but still well within its expected lifetime. Adding a combustion controller to monitor the fuel-to-air ratio and allow you to optimize excess oxygen to maximize the efficiency of the combustion process while maintaining safe and stable boiler operation.
	    In addition, the flue gas recirculation fan can be installed to improve performance by lowering the maximum flame temperature to the minimum required level and reduces nitrogen oxide emissions by lowering the average oxygen content of the air. Together this will also minimize O&M costs, and extend the useful lifetime of the boiler.`
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
	energySavingsPreviewButton: {
		text: '8.0%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
Projects[Pages.steamTrapsMaintenance] = new ProjectControl({
	pageId: Pages.steamTrapsMaintenance,
	cost: 15_000,
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-1800),
	},
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-1800),
	},
	title: 'Treasure Hunt - Steam Trap Maintenance',
	shortTitle: 'Repair faulty steam traps and implement a steam trap program.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found that 35% of your steam traps were faulty.',
		'You can repair these traps and {institute a steam trap maintenance program} to reduce energy use and help operate the steam system more efficiently. ',
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
	energySavingsPreviewButton: {
		text: '1.5%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
Projects[Pages.improvePipeInsulation] = new ProjectControl({
	pageId: Pages.improvePipeInsulation,
	cost: 7_000,
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-900),
	},
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-900),
	},
	title: 'Treasure Hunt - Improve Pipe Insulation ',
	shortTitle: 'Insulate exterior steam pipes.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several exterior steam lines that are uninsulated.',
		'Adding {insultation} can be a cheap way to improve steam system efficiency and reliability.',
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
	energySavingsPreviewButton: {
		text: '0.75%',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
//Empty Projects Scope 2 yr6-yr10
Projects[Pages.compressedAirSystemImprovemnt] = new ProjectControl({
	pageId: Pages.compressedAirSystemImprovemnt,
	cost: 210_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-2_250_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-2_250_000),
	},
	statsRecapAppliers: {
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Replace old compressors',
	shortTitle: 'Replace an old, inefficient compressor system with new compressors to increase reliability and reduce energy waste.',
	choiceInfoText: [
		'Your compressor system is three, older, inefficient compressors that operate in different combinations to achieve the required air capacity.',
		'These can collectively be replaced with two new, more efficient compressors and heat of compression dryers. This new configuration will allow the plant to run on fewer compressors and provides some redundancy. The heat of compression dryers added to the drying capacity of the system and replaced refrigerated dryers, providing improved moisture control.',
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
	energySavingsPreviewButton: {
		text: '7.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
// Projects[Pages.compressedAirSystemOptimization] = new ProjectControl({
//  pageId: Pages.compressedAirSystemOptimization,
//  cost: 30_000,
//  statsInfoAppliers: {
//      electricityUseKWh: relative(-0.04),
//  },
//  statsActualAppliers: {
//      electricityUseKWh: relative(-0.04),
//  },
//  title: 'Compressed Air System Optimization',
//  shortTitle: 'The facility was experiencing pressure drops throughout their compressed air delivery pipe system and decided on investigating thei pipe sizing to solve the issue.',
//  choiceInfoText: [
//      'They replaced an existing 4” header pipe running from the compressors to a storage tank with a 6” header. The shorter pipe diameter hadn’t sufficiently served the system, as engineers recorded air pressure losses starting in the compressor room.',
//      'They also added a second 4” header pipe parallel to an existing 4” header leading out of the storage tank to supply separate parts of the plant and form a complete loop.',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'DARIGOLD: COMPRESSED AIR SYSTEM OPTIMIZATION',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/darigold-compressed-air-system-optimization',
//      text: 'Americas fifth-largest dairy co-op, Darigold has 11 plants in the northwestern United States that produce milk, butter, sour cream, milk powder, and other dairy products. The Sunnyside plant is the company’s largest facility and each day it produces about 530,000 pounds of cheese and 615,000 pounds of powdered dairy products. Compressed air supports production at this plant through control valves, cylinders, positioners, dampers, and pulsing for bag houses. An inefficient distribution system compelled the partner to upgrade its air piping to enable stable system pressure.'
//  },
//  energySavingsPreviewButton: {
//      text: '4.0%',
//      variant: 'text',
//      startIcon: <BoltIcon />,
//  },
// });
Projects[Pages.chilledWaterMonitoringSystem] = new ProjectControl({
	pageId: Pages.chilledWaterMonitoringSystem,
	cost: 40_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-900_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-900_000),
	},
	title: 'Chilled Water System Improvements after Advanced Energy Monitoring System ',
	shortTitle: 'Implement several changes to the chilled water system identified by the advanced energy monitoring system',
	choiceInfoText: [
		'Your facility identified their {chilled water system} as a Significant Energy Use (SEU) while installing the {advanced energy monitoring system}.',
		'Since then, you have identified {several} specific projects to improve the operations of the system such as modifying VFD controls, adjust water flows to maximize temperatures based on outside weather, adjust cooling tower fans, and more.',
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
	energySavingsPreviewButton: {
		text: '3.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
// Projects[Pages.refrigerationUpgrade] = new ProjectControl({
//  pageId: Pages.refrigerationUpgrade,
//  cost: 10_000,
//  statsInfoAppliers: {
//      electricityUseKWh: relative(-0.05),
//  },
//  statsActualAppliers: {
//      electricityUseKWh: relative(-0.05),
//  },
//  title: 'Refrigeration Upgrade',
//  shortTitle: 'Increasing ammonia suction pressure reduces system lift, which is the difference between suction and discharge pressures within the system which help in reducing load on the comrpessor and increasing overall system effieicny.',
//  choiceInfoText: [
//      'The plant commissioned a study in June of 2017 to identify areas to improve energy efficiency. Previously, suction pressure was being run at 20.4 PSI to build the ice in the ice bank to optimal levels. In order to increase the efficiency of the system, it was decided to increase the ammonia suction pressure to 35.6 PSI, which is the pressure going into the compression step of the refrigeration cycle. Increasing ammonia suction pressure reduces system lift, which is the difference between suction and discharge pressures within the system. A reduction in lift accomplishes the following:',
//      'Reduces the overall work required by the compressors',
//      'Increases compressor capacity',
//      'Increases overall system efficiency',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'AGROPUR: REFRIGERATION UPGRADES',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/agropur-refrigeration-upgrades',
//      text: 'Le Sueur Cheese is one of seven Agropur cheese and whey protein drying plants in the United States. In 2010, Le Sueur Cheese joined the Better Buildings, Better Plants program and set a goal to reduce its energy intensity by 25% over a 10-year period.'
//  },
//  energySavingsPreviewButton: {
//      text: '5.0%',
//      variant: 'text',
//      startIcon: <BoltIcon />,
//  },
// });
Projects[Pages.loweringCompressorPressure] = new ProjectControl({
	pageId: Pages.loweringCompressorPressure,
	cost: 3_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	title: 'Treasure Hunt - Lower compressed air system pressure',
	shortTitle: 'Gradually lower compressed air pressure to reduce compressor load.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and discovered that the supply pressure for compressed air was {10psig higher} than what is required for the equipment downstream.',
		'Over a few weeks, they can lower the pressure a few psi at a time while monitoring equipment performance and productivity.',
		'Lowering the compressor pressure can have an immediate impact on energy use with very little associated cost. ',
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'COMPRESSED AIR - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/compressed-air',
		text: 'Compressed air provides a safe and reliable source of pneumatic pressure for a wide range of industrial processes. However, with over 80% of its input energy being lost as heat, air compressors are naturally inefficient. Energy-Efficient process design should opt for alternatives wherever possible and isolate compressed air usage to only processes that mandate it.'
	},
	energySavingsPreviewButton: {
		text: '0.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.improveLightingSystems] = new ProjectControl({
	pageId: Pages.improveLightingSystems,
	cost: 50_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsRecapAppliers: {
		totalRebates: absolute(10_000),
	},
	utilityRebateValue: 10000,
	title: 'Treasure Hunt - Lighting Upgrade',
	shortTitle: 'Install LED lighting in main production building',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found that the older lighting in the main production building could be replaced with LED lighting.',
		'While you are hoping to get a rebate for the fixture cost, it is not known if you qualify at this point. '
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'LIGHTING - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/lighting',
		text: 'A good place to start investigating for energy savings is in your plant’s lighting system. In the industrial sector, lighting accounts for less than 5% of the overall energy footprint, but in some sectors it can be higher.'
	},
	energySavingsPreviewButton: {
		text: '1.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.startShutOff] = new ProjectControl({
	pageId: Pages.startShutOff,
	cost: 5_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-225_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-225_000),
	},
	title: 'Treasure Hunt - Implement Shut-off Program',
	shortTitle: 'Design and implement a program to shut off equipment when not in use',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several equipment that could be shut off during weekends or low production times.',
		'You can develop a {systematic program} to identify equipment to be turned off, create turn on and shut down procedures, and enforce shutdowns which can save electricity with very little cost.'
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
	energySavingsPreviewButton: {
		text: '0.75%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.installVFDs1] = new ProjectControl({
	pageId: Pages.installVFDs1,
	cost: 30_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsRecapAppliers: {
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs on small motors',
	shortTitle: 'Install VFDs on small motors with high use variability',
	choiceInfoText: [
		'Thanks to the {Advanced Energy Monitoring System}, your plant has identified several motors with {high use variability} that would benefit from VFDs.',
		'You can install VFDs on a few smaller motors for this project.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	energySavingsPreviewButton: {
		text: '1.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
Projects[Pages.installVFDs2] = new ProjectControl({
	pageId: Pages.installVFDs2,
	cost: 40_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-600_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-600_000),
	},
	statsRecapAppliers: {
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs on mid-sized motors',
	shortTitle: 'Install VFDs on mid-sized motors with high use variability',
	choiceInfoText: [
		'Thanks to the {Advanced Energy Monitoring System}, your plant has identified several motors with {high use variability} that would benefit from VFDs.',
		'You can install VFDs on a few moderately sized motors for this project.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	energySavingsPreviewButton: {
		text: '2.0%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
Projects[Pages.installVFDs3] = new ProjectControl({
	pageId: Pages.installVFDs3,
	cost: 100_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-1_050_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-1_050_000),
	},
	statsRecapAppliers: {
		totalRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs on large motors',
	shortTitle: 'Install VFDs on large motors with high use variability',
	choiceInfoText: [
		'Thanks to the {Advanced Energy Monitoring System}, your plant has identified several motors with {high use variability} that would benefit from VFDs.',
		'You can install VFD on a large motor for this project.'
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	energySavingsPreviewButton: {
		text: '3.5%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
Projects[Pages.reduceFanSpeeds] = new ProjectControl({
	pageId: Pages.reduceFanSpeeds,
	cost: 1_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-75_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-75_000),
	},
	title: 'Treasure Hunt - Reduce fan speeds',
	shortTitle: 'Run interior fans at slightly lower speeds',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several fans that can be run at slightly lower speeds without substantially changing airflow.'
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
	energySavingsPreviewButton: {
		text: '0.25%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.lightingOccupancySensors] = new ProjectControl({
	pageId: Pages.lightingOccupancySensors,
	cost: 3_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	title: 'Treasure Hunt - Lighting Occupancy Sensors',
	shortTitle: 'Install occupancy sensors to turn off lights in unoccupied areas of facility.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several areas where lights are not turned off when no one is in the area.',
		'Installing occupancy sensors in these areas would automatically turn off the lights when the area is unoccupied and turn them on when work has resumed.'
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
	energySavingsPreviewButton: {
		text: '0.50%',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.smallVPPA] = new ProjectControl({
	pageId: Pages.smallVPPA,
	renewalRequired: true,
	cost: 75_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-1_200_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-1_200_000)
	},
	title: 'Invest in wind VPPA',
	shortTitle: 'Invest in wind VPPA to offset {10%} of your electricity emissions. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['You decided to look into entering a virtual power purchase agreement for a wind farm a few states away. You can pay $0.05/kWh to offset your electricity emissions, this project costs offsetting {10%} of your electricity emissions.  Working with upper management, you work out a deal where {half of the project costs} come from your budget and the other half from a corporate budget. {YOU MUST RENEW THIS PROJECT ANNUALLY}.'],
	choiceInfoImg: '',
	choiceInfoImgAlt: '',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewButton: {
		text: '6.5%',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});

Projects[Pages.midVPPA] = new ProjectControl({
	pageId: Pages.midVPPA,
	renewalRequired: true,
	cost: 150_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-2_400_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-2_400_000)
	},
	title: 'Invest in wind VPPA',
	shortTitle: 'Invest in wind VPPA to offset {20%} of your electricity emissions. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['You decided to look into entering a virtual power purchase agreement for a wind farm a few states away. You can pay $0.05/kWh to offset your electricity emissions, this project costs offsetting {20%} of your electricity emissions.  Working with upper management, you work out a deal where {half of the project costs} come from your budget and the other half from a corporate budget. {YOU MUST RENEW THIS PROJECT ANNUALLY}.'],
	choiceInfoImg: '',
	choiceInfoImgAlt: '',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewButton: {
		text: '13%',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});

Projects[Pages.largeVPPA] = new ProjectControl({
	pageId: Pages.largeVPPA,
	renewalRequired: true,
	cost: 225_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-3_600_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-3_600_000)
	},
	title: 'Invest in wind VPPA',
	shortTitle: 'Invest in wind VPPA to offset {30%} of your electricity emissions. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['You decided to look into entering a virtual power purchase agreement for a wind farm a few states away. You can pay $0.05/kWh to offset your electricity emissions, this project costs offsetting {30%} of your electricity emissions.  Working with upper management, you work out a deal where {half of the project costs} come from your budget and the other half from a corporate budget. {YOU MUST RENEW THIS PROJECT ANNUALLY}.'],
	choiceInfoImg: '',
	choiceInfoImgAlt: '',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewButton: {
		text: '20%',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});


Projects[Pages.midSolar] = new ProjectControl({
	pageId: Pages.midSolar,
	renewalRequired: true,
	cost: 100_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-1_717_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-1_717_000)
	},
	title: 'Mid-sized Solar PPPA',
	shortTitle: 'Enter a PPPA with your local utility to build a 2MW solar array. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['To meet aggressive decarbonization goals, you have looked into leasing some neighboring land to your utility for solar panels and receiving the electricity as a physical power purchase agreement (PPPA). You will continuing paying your utility provider for electricity, at a higher rate than previously, but not be responsible for the capital investment or maintenance of the system.  You believe you can install a 2MW system. You have worked out a deal with your corporate management team and they will pay for half the difference in additional electricity cost. You will be in this contract for the next 10 years, so {YOU MUST RENEW THIS PROJECT ANNUALLY}. '],
	choiceInfoImg: '',
	choiceInfoImgAlt: '',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewButton: {
		text: '9.3%',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});

Projects[Pages.largeWind] = new ProjectControl({
	pageId: Pages.largeWind,
	renewalRequired: true,
	cost: 269_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-4_292_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-4_292_000)
	},
	title: 'Large Wind PPPA',
	shortTitle: 'Enter a PPPA with a local wind farm to help them expand into a neighboring field. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['To meet aggressive decarbonization goals, you have looked into selling an empty field next to your facility to a local wind farm company and receiving the electricity as part of a 15 year contract to source a large portion of your electricity use. You will continuing paying your utility provider for electricity, at a higher rate than previously, but not be responsible for the capital investment or maintenance of the system.  They think they can install a {5MW system} on the site. You have worked out a deal with your corporate management team and they will pay for half the difference in additional electricity cost. You will be in this contract for the next {15 years}, so {YOU MUST RENEW THIS PROJECT ANNUALLY}.  '],
	choiceInfoImg: '',
	choiceInfoImgAlt: '',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewButton: {
		text: '23%',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});

/**
 * A "class" that can apply or un-apply a numerical modifier with a custom formula.
 */
export declare interface NumberApplier {
	applyValue: (previous: number, gameYears?: number) => number;
	unApplyValue: (previous: number, gameYears?: number) => number;
	/**
	 * Returns the original modifier.
	 */
	modifier: number;
	isAbsolute?: boolean;

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
		applyValue: function (previous: number, gameYears?: number) {
			let modifier = this.modifier;
			if (gameYears) {
				modifier = gameYears * (this.modifier);
			}
			return round(previous + modifier);
		},
		unApplyValue: function (previous: number, gameYears?: number) {
			let modifier = this.modifier;
			if (gameYears) {
				modifier = gameYears * (this.modifier);
			}
			return round(previous - modifier);
		},
		modifier: modifier,
		isAbsolute: true,
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
