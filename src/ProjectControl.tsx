import React from 'react';
import type { AppState, NextAppState } from './App';
import type App from './App';
import { compareButton, deselectButton } from './components/Buttons';
import type { ButtonGroupButton } from './components/Buttons';
import { closeDialogButton } from './components/Buttons';
import { infoButtonWithProjectDialog, implementButtonCheckbox } from './components/Buttons';
import type { TrackedStats } from './trackedStats';
import type { Choice } from './components/GroupedChoices';
import { theme } from './components/theme';
import FactoryIcon from '@mui/icons-material/Factory';
import Pages from './Pages';
import { Alert } from '@mui/material';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import { setCarbonEmissionsAndSavings, calculateEmissions } from './trackedStats';
import { DialogCardContent } from './components/Dialogs/dialog-functions-and-types';
import { ProjectDialogControlProps, getEmptyProjectDialog } from './components/Dialogs/ProjectDialog';
import Projects from './Projects';


export class ProjectControl implements ProjectControlParams {
	pageId: symbol;
	isRenewable?: boolean;
	isCapitalFundsEligible?: boolean;
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
	energySavingsPreviewIcon?: ButtonGroupButton;
	utilityRebateValue?: number;
	recapSurprises?: RecapSurprise[];
	caseStudy?: CaseStudy;
	recapAvatar: RecapAvatar;
	rebateAvatar: RecapAvatar;
	visible: Resolvable<boolean>;
	disabled: Resolvable<boolean>;
	yearSelected?: number;
	projectDialogControl: ProjectDialogControlProps;
	hasImplementationYearAppliers?: boolean;
	relatedProjectSymbols?: symbol[] | undefined;
	isEnergyEfficiency: boolean;
	financingOpption: string;
	yearsToPayOff: number;

	/**
	 * Project Control constructor. See `ProjectControlParams` for details on each parameter.
	 * @param params 
	 */
	constructor(params: ProjectControlParams) {
		this.pageId = params.pageId;
		this.isRenewable = params.isRenewable;
		this.isCapitalFundsEligible = params.isCapitalFundsEligible;
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
		this.energySavingsPreviewIcon = params.energySavingsPreviewIcon;
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
		this.projectDialogControl = getEmptyProjectDialog();
		this.hasImplementationYearAppliers = params.hasImplementationYearAppliers;
		this.relatedProjectSymbols = params.relatedProjectSymbols;
		this.isEnergyEfficiency = params.isEnergyEfficiency;
		this.financingOpption = params.financingOpption;
		this.yearsToPayOff = params.yearsToPayOff;
	}

    /**
     * Gets a Choice control for the GroupedChoices pages in PageControls.tsx
     */
    getProjectChoiceControl(): Choice {

        const self = this; // for use in bound button handlers

        let projectDialogStatCards: DialogCardContent[] = [];
        let energySavingsPreviewIcons: ButtonGroupButton[] = [];

		let perYearAddOn: string = '';
		if(this.isRenewable == true){
			perYearAddOn = 'per year';
		}

        projectDialogStatCards.push({
            text: `Total project cost: {$${(this.cost).toLocaleString('en-US')} ${perYearAddOn}}`,
            color: theme.palette.secondary.dark,
        });

        if (this.statsInfoAppliers.naturalGasMMBTU) {
            projectDialogStatCards.push({
                text: `Natural gas reduction: {${this.statsInfoAppliers.naturalGasMMBTU.toString(true)} MMBtu ${perYearAddOn}}`,
                color: theme.palette.primary.dark,
            });
        }
        if (this.statsInfoAppliers.electricityUseKWh) {
            projectDialogStatCards.push({
                text: `Electricity reduction: {${this.statsInfoAppliers.electricityUseKWh.toString(true)} kWh ${perYearAddOn}}`,
                color: theme.palette.warning.light,
            });
        }
		if (this.statsInfoAppliers.hydrogenMMBTU) {
            projectDialogStatCards.push({
                text: `Hydrogen reduction: {${this.statsInfoAppliers.hydrogenMMBTU.toString(true)} MMBtu ${perYearAddOn}}`,
                color: theme.palette.primary.light,
            });
        }
        if (this.statsInfoAppliers.absoluteCarbonSavings) {
            projectDialogStatCards.push({
                text: `GHG Reduction: {${this.statsInfoAppliers.absoluteCarbonSavings.toString(true)} kg CO<sub>2</sub>e ${perYearAddOn}}`,
                color: theme.palette.primary.main,
            });
        }

        let choiceCardButtons: ButtonGroupButton[] = [];
        let comparisonDialogButtons: ButtonGroupButton[] = [];

        this.projectDialogControl = {
			discriminator: 'project',
            title: self.title,
            text: self.choiceInfoText,
            img: self.choiceInfoImg,
            imgAlt: self.choiceInfoImgAlt,
            imgObjectFit: self.choiceInfoImgObjectFit,
            cards: projectDialogStatCards,
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
                        let isProjectImplemented: boolean = state.implementedProjectsIds.includes(self.pageId);
                        if (self.isRenewable) {
							isProjectImplemented = state.implementedRenewableProjects.some((project: RenewableProject) => {
								if (project.page === self.pageId && project.gameYearsImplemented.includes(state.trackedStats.currentGameYear)) {
									return true
								}
								return false;
							});
                            if (isProjectImplemented) {
                                return state.currentPage;
                            }
                            return toggleRenewableProject.apply(this, [state, nextState]);
                        } else {
                            return toggleProjectImplemented.apply(this, [state, nextState]);
                        }
                    },
                    // disabled when the project is implemented
                    disabled: (state) => {
                        if (self.isRenewable) {
                            return state.implementedRenewableProjects.some(project => project.page === self.pageId);
                        } else {
                            return state.implementedProjectsIds.includes(self.pageId);
                        }
                    }
                }
            ],
        };

        addCompareProjectButton(choiceCardButtons);
        choiceCardButtons.push(infoButtonWithProjectDialog(this.projectDialogControl));
        addImplementProjectButton(choiceCardButtons);

        if (self.energySavingsPreviewIcon) {
            energySavingsPreviewIcons.push(self.energySavingsPreviewIcon);
        }

        comparisonDialogButtons.push(deselectButton(handleRemoveSelectedCompare));
        addImplementProjectButton(comparisonDialogButtons);
        this.projectDialogControl.comparisonDialogButtons = comparisonDialogButtons;


		// todo 88 visible is set directly onto the project ref from the display button, should default to visible() if exists
        let projectControlChoice: Choice = {
            title: this.title,
            text: this.shortTitle,
            energySavingsPreviewIcons: energySavingsPreviewIcons,
            buttons: choiceCardButtons,
            visible: function (state) {
				if (self.pageId === Pages.solarPanelsCarPortMaintenance) {
					// todo 88 bit of a bandaid until re-working visible()
					return this.resolveToValue(getSolarCarportMaintenanceVisible(state));
				} else if (state.implementedRenewableProjects.some(project => project.page === self.pageId)) {
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
			const carportImplementedYear = state.implementedProjectsIds.find(project => project === Pages.solarPanelsCarPort);
			const maintenanceImplemented = state.implementedRenewableProjects.some(project => {
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
            // 	return props.availableProjectIds.includes(this.pageId);
            // };
            const shouldDisableImplementButton = (props) => {
                return !props.availableProjectIds.includes(self.pageId);
            };
            const isProjectImplemented = (props) => {
                if (self.isRenewable) {
                    return props.implementedRenewableProjects.some((project: RenewableProject) => {
                        if (project.page === self.pageId && project.gameYearsImplemented.includes(props.trackedStats.year)) {
                            return true
                        }
                        return false;
                    });
                }
                return props.implementedProjectsIds.includes(self.pageId);
            };
            
            buttons.push(implementButtonCheckbox(
                self.isRenewable? toggleRenewableProject : toggleProjectImplemented,
                (props) => shouldDisableImplementButton(props),
                (props) => isProjectImplemented(props),
                // (props) => shouldDisplayImplementButton(props)
            ));
        }

        function setAllowImplementProject(this: App, state: AppState, nextState: NextAppState) {
            let availableProjectIds = [...state.availableProjectIds];
            const existingIndex: number = availableProjectIds.findIndex(projectPageId => projectPageId === self.pageId);
            if (existingIndex === -1) {
                availableProjectIds.push(self.pageId);
                nextState.availableProjectIds = [...availableProjectIds];
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
                    projectDialog: self.projectDialogControl
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
            let implementedProjectsIds = state.implementedProjectsIds.slice();
            let newTrackedStats = { ...state.trackedStats };
            // IF PROJECT IS ALREADY SELECTED
            let hasAbsoluteCarbonSavings = self.statsActualAppliers.absoluteCarbonSavings !== undefined;
            if (implementedProjectsIds.includes(self.pageId)) {
                // Since the order of projects matters, we can't simply unApplyChanges to ourself.
                // 	We must first undo all the stat changes in REVERSE ORDER, then re-apply all but this one.
                for (let i = implementedProjectsIds.length - 1; i >= 0; i--) {
                    let pageId = implementedProjectsIds[i];
                    Projects[pageId].unApplyStatChanges(newTrackedStats);
                }

                implementedProjectsIds.splice(implementedProjectsIds.indexOf(self.pageId), 1);


				// * 88 check if associated maintenance project is implemented, remove then reset stats

				let implementedRenewableProjects: RenewableProject[] = [...this.state.implementedRenewableProjects];
				if (self.relatedProjectSymbols) {
					const dependantChildProjectIndex = implementedRenewableProjects.findIndex(project => self.relatedProjectSymbols && self.relatedProjectSymbols.includes(project.page));	
					if (dependantChildProjectIndex >= 0) {
						let yearRangeInitialStats: TrackedStats[] = [...state.yearRangeInitialStats];
						removeRenewableProject(implementedRenewableProjects, dependantChildProjectIndex, newTrackedStats, yearRangeInitialStats, true);

						nextState.implementedRenewableProjects = implementedRenewableProjects;
						nextState.yearRangeInitialStats = yearRangeInitialStats;
					}
				}


                for (let i = 0; i < implementedProjectsIds.length; i++) {
                    let pageId = implementedProjectsIds[i];
                    Projects[pageId].applyStatChanges(newTrackedStats);
                }
            }
			// IF PROJECT IS NOT ALREADY SELECTED
            else {
                if (!checkCanImplementProject.apply(this, [state])) {
					return state.currentPage;
				}

                implementedProjectsIds.push(self.pageId);
                self.applyStatChanges(newTrackedStats);
                if (!hasAbsoluteCarbonSavings) {
                    newTrackedStats.carbonEmissions = calculateEmissions(newTrackedStats);
                }
                nextState.selectedProjectsForComparison = removeSelectedForCompare(state);
				if (nextState.selectedProjectsForComparison.length === 0) {
					nextState.isCompareDialogOpen = false;
				}
            }

            newTrackedStats = setCarbonEmissionsAndSavings(newTrackedStats, this.state.defaultTrackedStats);
            nextState.implementedProjectsIds = implementedProjectsIds;
            nextState.trackedStats = newTrackedStats;

            return state.currentPage; // no page change
        }

		function checkCanImplementProject(this: App, state: AppState): boolean {
			let canImplement = true;
			let projectImplementationLimit = 4;
			let overLimitMsg = `Due to manpower limitations, you cannot select more than ${projectImplementationLimit} projects per year`;
			if (state.gameSettings.totalGameYears === 5) {
				projectImplementationLimit = 6;
				overLimitMsg = `Due to manpower limitations, you cannot select more than ${projectImplementationLimit} projects per budget period`;
			}

			const startedRenewableProjects = state.implementedRenewableProjects.filter(project => {
				return project.yearStarted === state.trackedStats.currentGameYear;
			}).length;

			const currentProjectCount = startedRenewableProjects + state.implementedProjectsIds.length;
			const projectCounts = `year ${state.trackedStats.currentGameYear} - reg projects: ${state.implementedProjectsIds.length}, started renewables: ${startedRenewableProjects}`;
			console.log(projectCounts);
			if (currentProjectCount >= projectImplementationLimit) {
				this.summonSnackbar(<Alert severity='error'>{overLimitMsg}</Alert>);
				canImplement = false;
			}
			
			console.log('cost', self.cost);
			console.log('financesAvailable', state.trackedStats.financesAvailable);
			let projectCost = self.cost;
			// * renewable project self.costs are applied with gameYears multiplier elsewhere
			if (self.isRenewable) {
				projectCost *= state.trackedStats.gameYearInterval;
			}
			if (projectCost > state.trackedStats.financesAvailable) {
				this.summonSnackbar(<Alert severity='error'>You cannot afford this project with your current budget!</Alert>);
				canImplement = false;
			}
			console.log('canImplement', canImplement);
			return canImplement;
		}


        function toggleRenewableProject(this: App, state: AppState, nextState: NextAppState) {
            let implementedRenewableProjects: RenewableProject[] = [...this.state.implementedRenewableProjects];
            let newTrackedStats: TrackedStats = { ...state.trackedStats };
            let yearRangeInitialStats: TrackedStats[] = [...state.yearRangeInitialStats];
            let hasAbsoluteCarbonSavings = self.statsActualAppliers.absoluteCarbonSavings !== undefined;

            const existingRenewableProjectIndex = implementedRenewableProjects.findIndex(project => project.page === self.pageId);
            let implementedInCurrentYear = false;
            if (existingRenewableProjectIndex >= 0) {
                implementedInCurrentYear = implementedRenewableProjects[existingRenewableProjectIndex].gameYearsImplemented.includes(newTrackedStats.currentGameYear);
            } 

            if (implementedInCurrentYear) {
                // * 22 removes stats AND costs from current year
				removeRenewableProject(implementedRenewableProjects, existingRenewableProjectIndex, newTrackedStats, yearRangeInitialStats);
            } else if (!implementedInCurrentYear) {
				if (!checkCanImplementProject.apply(this, [state])) {
					return state.currentPage;
				}

                if (existingRenewableProjectIndex >= 0) {
                    implementedRenewableProjects[existingRenewableProjectIndex].gameYearsImplemented.push(newTrackedStats.currentGameYear);
                    self.applyStatChanges(newTrackedStats);
                    // * 22 if we've de-selected renewable implementation AND re-selected to implement in the same year, yearRangeInitial stats are out of sync with trackedStats
                    yearRangeInitialStats = [...state.yearRangeInitialStats];
                    const updatedCurrentStatsIndex = yearRangeInitialStats.findIndex(stats => stats.currentGameYear === newTrackedStats.currentGameYear);
                    yearRangeInitialStats.splice(updatedCurrentStatsIndex, 1, newTrackedStats);
                } else {
                    implementedRenewableProjects.push({
                        page: self.pageId,
                        gameYearsImplemented: [newTrackedStats.currentGameYear],
                        yearStarted: newTrackedStats.currentGameYear,
                    });
                    self.applyStatChanges(newTrackedStats);
                }

                if (!hasAbsoluteCarbonSavings) {
                    newTrackedStats.carbonEmissions = calculateEmissions(newTrackedStats);
                }
                nextState.selectedProjectsForComparison = removeSelectedForCompare(state);

            }

            newTrackedStats = setCarbonEmissionsAndSavings(newTrackedStats, this.state.defaultTrackedStats);
            nextState.implementedRenewableProjects = implementedRenewableProjects;
            nextState.trackedStats = newTrackedStats;
            nextState.yearRangeInitialStats = yearRangeInitialStats;
            return state.currentPage;
        }

		/**
         * Remove implementation year are whole project
         */
		function removeRenewableProject(implementedRenewableProjects: RenewableProject[], removeProjectIndex: number, newTrackedStats: TrackedStats, yearRangeInitialStats: TrackedStats[], isFullRemoval = false) {
			for (let i = implementedRenewableProjects.length - 1; i >= 0; i--) {
				const project = implementedRenewableProjects[i];
				if (project.gameYearsImplemented.includes(newTrackedStats.currentGameYear)) {
					Projects[project.page].unApplyStatChanges(newTrackedStats);
				}
			}
			
			const removeProject = implementedRenewableProjects[removeProjectIndex];
			if (removeProject) {
				if (isFullRemoval || removeProject.yearStarted === newTrackedStats.currentGameYear) {
					implementedRenewableProjects.splice(removeProjectIndex, 1);
				} else {
						const implementedYear = removeProject.gameYearsImplemented.findIndex(year => year === newTrackedStats.currentGameYear);
						removeProject.gameYearsImplemented.splice(implementedYear, 1);
				}

			}

			for (let i = 0; i < implementedRenewableProjects.length; i++) {
				const project = implementedRenewableProjects[i];
				if (project.gameYearsImplemented.includes(newTrackedStats.currentGameYear)) {
					Projects[project.page].applyStatChanges(newTrackedStats);
				}
			}

			// * 22 update current stat year (necessary because we apply renewable at year recap of previous year) 
            const currentYearEndIndex = yearRangeInitialStats.findIndex(stats => stats.currentGameYear === newTrackedStats.currentGameYear);
			if (currentYearEndIndex !== 0) {
				yearRangeInitialStats.splice(currentYearEndIndex, 1, newTrackedStats);
			}
		}
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
			if (thisApplier.isAbsolute) {
				yearMultiplier = mutableStats.gameYearInterval;
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
		if (this.isRenewable) {
			cost = cost * mutableStats.gameYearInterval;
			// * giving renewbles rebates every year
			rebates = rebates * mutableStats.gameYearInterval;
		}
        mutableStats.financesAvailable -= cost - rebates;
        mutableStats.implementationSpending += cost;
        mutableStats.yearBudget += rebates;
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
			if (thisApplier.isAbsolute) {
				yearMultiplier = mutableStats.gameYearInterval;
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
		if (this.isRenewable) {
			cost = cost * mutableStats.gameYearInterval;
			// todo 22 should get every year?
			rebates = rebates * mutableStats.gameYearInterval;
		}
        mutableStats.financesAvailable += cost - rebates;
        mutableStats.implementationSpending -= cost;
        mutableStats.yearBudget -= rebates;
    }

    /**
     * Returns the total amount of rebates of this project.
     */
    getRebates(): number {
        return (this.statsActualAppliers.yearRebates) ? this.statsActualAppliers.yearRebates.modifier : 0;
    }

    /**
     * Returns the total amount of in-year and end-of-year rebates of this project.
     */
    getYearEndRebates(): number {
        let total = 0;
        if (this.statsActualAppliers.yearRebates) {
            total += this.statsActualAppliers.yearRebates.modifier;
        }
        if (this.statsRecapAppliers?.yearRebates) {
            total += this.statsRecapAppliers.yearRebates.modifier;
        }
        return total;
    }

    /**
     * Returns the extra hidden costs of the projects (via the `hiddenSpending` stat key)
     */
    getHiddenCost(): number {
        return (this.statsRecapAppliers && this.statsRecapAppliers.hiddenSpending) ? this.statsRecapAppliers.hiddenSpending.modifier : 0;
    }
	
    /**
     * Returns the net cost of this project, including rebates (and in future, surprise hitches)
     */
    getYearEndTotalSpending(gameYears?: number): number {
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
}


// IMPORTANT: Keep Scope1Projects and Scope2Projects up to date as you add new projects!!!!!!
// These lists (Scope1Projects and Scope2Projects) keep track of WHICH projects are in WHICH scope. Currently, they are used to give a warning to the user
// 	when they click Proceed (to Year Recap) while only having selected projects from one scope.

/**
 * List of Page symbols for projects that are in the SCOPE 1 list.
 */

export const Scope1Projects = [
	Pages.advancedEnergyMonitoring, Pages.steamTrapsMaintenance, Pages.improvePipeInsulation, Pages.boilerControl,
	Pages.airHandingUnitUpgrades, Pages.processHeatingUpgrades, Pages.wasteHeatRecovery,
	Pages.electricBoiler, Pages.hydrogenFuel, Pages.hydrogenPoweredForklifts, Pages.h2InjectionIntoHRSG
	//Pages.digitalTwinAnalysis, 
	
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
export interface RecapSurprise {
	title: string;
	text: string | string[];
	subHeader?: string,
	className?: string,
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
	projectDialog: ProjectDialogControlProps
}

/**
 * gameYearsImplemented - which game years was the project implemented
 */
export interface RenewableProject extends Project {
	
	gameYearsImplemented: number[],
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
	gameYearInterval: number,
	totalGameYears: number,
	budget: number,
	financingStartYear: number,
	naturalGasUse: number,
	electricityUse: number,
	hydrogenUse: number,
}

export interface UserSettings {
	gameYearInterval: number,
	financingStartYear: number,
	energyCarryoverYears: number,
	allowBudgetCarryover: string
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
	isRenewable?: boolean;
	/**
	 * Project that only gets energy $ savings for 1 year
	*/
	isEnergyEfficiency?: boolean;
	/**
	 * Project can be implemented using the Capital Funds Reward (awarded for GHG/carbon savings milestones)
	*/
	isCapitalFundsEligible?: boolean;
	/**
	 * Xaas, Loan, or Green Bond
	*/
	financingOpption: string;
	/**
	 * Number of years until financing paid off: options are 1 (no financing), 4 (EE financing), 10 (RE financing)
	*/
	yearsToPayOff: number;
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
	energySavingsPreviewIcon?: ButtonGroupButton;
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
	projectDialogControl?: ProjectDialogControlProps;
	/**
	 * tracks the year the project is selected 
	 */
	hasImplementationYearAppliers?: boolean;
	relatedProjectSymbols?: symbol[];
}


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

/**
 * Generates an object for applying/unapplying a RELATIVE modifier, such as reducing natural gas usage by 3%.
 * @param modifier 
 * @returns Object for applying/unapplying the specified modifier.
 */
export function relative(modifier: number): NumberApplier {
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
export function absolute(modifier: number): NumberApplier {
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
