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
import { DialogFinancingOptionCard, ProjectDialogControlProps, getEmptyProjectDialog } from './components/Dialogs/ProjectDialog';
import Projects from './Projects';
import { CapitalFundingState, FinancingId, FinancingOption, FinancingType, findFinancingOptionFromProject, getCanUseCapitalFunding, getCapitalFundingOption, getDefaultFinancingOption, getIsAnnuallyFinanced, removeCapitalFundingRoundUsed, setCapitalFundingRoundUsed } from './Financing';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { resolveToValue } from './functions-and-types';
import { GameSettings } from './components/SelectGameSettings';

export class ProjectControl implements ProjectControlParams {
	pageId: symbol;
	isRenewable?: boolean;
	financingOptions: FinancingOption[];
	isCapitalFundsEligible?: boolean;
	isPPPA?: boolean;
	isOneTimePayment?: boolean;
	baseCost: number;
	customBudgetType?: FinancingType;
	financedAnnualCost: number;
	financedTotalCost: number;
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
	relatedProjectSymbols?: symbol[] | undefined;
	isEnergyEfficiency: boolean;
	/**
	 * Project Control constructor. See `ProjectControlParams` for details on each parameter.
	 * @param params 
	 */
	constructor(params: ProjectControlParams) {
		this.pageId = params.pageId;
		this.isRenewable = params.isRenewable;
		this.isPPPA = params.isPPPA;
		this.isOneTimePayment = params.isOneTimePayment;
		this.financingOptions = params.financingOptions;
		this.isCapitalFundsEligible = params.isCapitalFundsEligible;
		this.statsInfoAppliers = params.statsInfoAppliers;
		this.statsActualAppliers = params.statsActualAppliers;
		this.statsRecapAppliers = params.statsRecapAppliers;
		this.customBudgetType = params.customBudgetType,
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
		this.baseCost = params.baseCost;
		this.financedAnnualCost = params.financedAnnualCost;
		this.financedTotalCost = params.financedTotalCost;
		this.yearSelected = params.yearSelected;
		this.projectDialogControl = getEmptyProjectDialog();
		this.isEnergyEfficiency = params.isEnergyEfficiency;
	}

	/**
	 * Gets a Choice control for the GroupedChoices pages in PageControls.tsx
	 */
	getProjectChoiceControl(): Choice {

		const self = this; // for use in bound button handlers

		let hasFinancingOptions = self.financingOptions && self.financingOptions.length !== 0;
		let projectDialogStatCards: DialogCardContent[] = [];
		let financingOptionCards: DialogFinancingOptionCard[] = [];

		if (!self.isPPPA) {
			let defaultFinancingOptionCard: DialogFinancingOptionCard = getBudgetOptionCard(hasFinancingOptions);
			financingOptionCards.push(defaultFinancingOptionCard);
		}

		if (self.isCapitalFundsEligible) {
			let capitalFundingOption: FinancingOption = getCapitalFundingOption();
			let capitalFundingCard: DialogFinancingOptionCard = {
				...capitalFundingOption,
				implementButton: undefined
			}
			let implementCapitalFunding = getFinancingTypeImplementButton(capitalFundingCard);
			capitalFundingCard.implementButton = implementCapitalFunding;
			financingOptionCards.push(capitalFundingCard);
		}

		if (hasFinancingOptions) {
			self.financingOptions.forEach(option => {
				let implementButton = getFinancingTypeImplementButton(option);
				let financingOptionCard: DialogFinancingOptionCard = {
					financingType: option.financingType,
					financedTotalCost: self.financedTotalCost,
					financedAnnualCost: self.financedAnnualCost,
					implementButton: implementButton
				}
				financingOptionCards.push(financingOptionCard);
			});
		}

		let energySavingsPreviewIcons: ButtonGroupButton[] = [];

		let perYearAddOn: string = '';
		if (this.isRenewable == true) {
			perYearAddOn = 'per year';
		}

		if (this.statsInfoAppliers.naturalGasMMBTU) {
			projectDialogStatCards.push({
				text: `Natural gas reduction: {${this.statsInfoAppliers.naturalGasMMBTU.toString(true)} MMBtu ${perYearAddOn}}`,
				textColor: '#fff',
				backgroundColor: 'rgb(20, 48, 109, 0.60)',
			});
		}
		if (this.statsInfoAppliers.electricityUseKWh) {
			projectDialogStatCards.push({
				text: `Electricity reduction: {${this.statsInfoAppliers.electricityUseKWh.toString(true)} kWh ${perYearAddOn}}`,
				textColor: '#fff',
				backgroundColor: 'rgba(233, 188, 24, .60)',
			});
		}
		if (this.statsInfoAppliers.hydrogenMMBTU) {
			projectDialogStatCards.push({
				text: `Landfill Gas reduction: {${this.statsInfoAppliers.hydrogenMMBTU.toString(true)} MMBtu ${perYearAddOn}}`,
				textColor: '#fff',
				backgroundColor: 'rgb(20, 48, 109, 0.60)',
			});
		}
		if (this.statsInfoAppliers.absoluteCarbonSavings) {
			projectDialogStatCards.push({
				text: `GHG Reduction: {${this.statsInfoAppliers.absoluteCarbonSavings.toString(true)} kg CO<sub>2</sub>e ${perYearAddOn}}`,
				textColor: '#fff',
				backgroundColor: 'rgb(20, 48, 109, 0.60)',

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
			energyStatCards: projectDialogStatCards,
			financingOptionCards: financingOptionCards,
			handleProjectInfoViewed: function (state, nextState) {
				return setAllowImplementProject.apply(this, [state, nextState]);
			},
			buttons: [
				closeDialogButton(),
			],
		};

		addCompareProjectButton(choiceCardButtons);
		choiceCardButtons.push(infoButtonWithProjectDialog(this.projectDialogControl));
		addImplementProjectCheckedButton(choiceCardButtons, hasFinancingOptions);

		if (self.energySavingsPreviewIcon) {
			energySavingsPreviewIcons.push(self.energySavingsPreviewIcon);
		}

		comparisonDialogButtons.push(deselectButton(handleRemoveSelectedCompare));
		this.projectDialogControl.comparisonDialogButtons = comparisonDialogButtons;


		// todo 88 visible is set directly onto the project ref from the display button, should default to visible() if exists
		let projectControlChoice: Choice = {
			title: this.title,
			text: this.shortTitle,
			energySavingsPreviewIcons: energySavingsPreviewIcons,
			buttons: choiceCardButtons,
			visible: function (state) {
				let isRenewedProject = state.implementedRenewableProjects.some(project => project.page === self.pageId && project.yearStarted !== state.trackedStats.currentGameYear)
				if (isRenewedProject) {
					return false;
				} else if (state.completedProjects.some(project => project.page === self.pageId)) {
					return false;
				} else {
					return this.resolveToValue(self.visible, true);
				}

			},
			key: this.pageId.description,
			disabled: this.disabled,
		};


		return projectControlChoice;

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

		function getBudgetOptionCard(hasFinancingOptions: boolean): DialogFinancingOptionCard {
			let defaultFinancingOption: FinancingOption = getDefaultFinancingOption(self, hasFinancingOptions, self.baseCost);
			let defaultFinancingOptionCard: DialogFinancingOptionCard = {
				...defaultFinancingOption,
				implementButton: undefined
			}
			let implementButton = getFinancingTypeImplementButton(defaultFinancingOptionCard);
			defaultFinancingOptionCard.implementButton = implementButton;
			return defaultFinancingOptionCard;
		}

		function addImplementProjectCheckedButton(buttons: ButtonGroupButton[], hasFinancingOptions: boolean) {
			const isProjectImplemented = (props) => {
				if (self.isRenewable) {
					let isImplemented = props.implementedRenewableProjects.some((project: RenewableProject) => {
						if (project.page === self.pageId && project.gameYearsImplemented.includes(props.trackedStats.currentGameYear)) {
							return true
						}
						return false;
					});
					return isImplemented;
				}
				return props.implementedProjectsIds.includes(self.pageId);
			};

			const shouldDisable = (props) => {
				return !props.availableProjectIds.includes(self.pageId) || (hasFinancingOptions && !isProjectImplemented(props))
			};

			let defaultFinancingOption: FinancingOption = getDefaultFinancingOption(self, hasFinancingOptions, self.baseCost)
			let financedButton: ButtonGroupButton = {
					text: 'Implement Project',
					variant: 'contained',
					color: 'success',
					startIcon: function (...params) {
						if (resolveToValue(isProjectImplemented, false, params, this)) {
							return <CheckBoxIcon/>;
						}
						else {
							return <CheckBoxOutlineBlankIcon/>;
						}
					},
					onClick: function (state, nextState) {
						if (self.isRenewable) {
							return toggleRenewableProject.apply(this, [state, nextState, defaultFinancingOption]);
						} else {
							return toggleProjectImplemented.apply(this, [state, nextState, defaultFinancingOption]);
						}
					},
					disabled: shouldDisable
				}

			buttons.push(financedButton);
		}

		function getFinancingTypeImplementButton(financingOption: FinancingOption): ButtonGroupButton {
			return {
				text: 'Implement Project',
				variant: 'contained',
				color: 'success',
				onClick: function (state, nextState) {
					if (self.isRenewable) {
						let isProjectImplemented = state.implementedRenewableProjects.some((project: RenewableProject) => {
							if (project.page === self.pageId && project.gameYearsImplemented.includes(state.trackedStats.currentGameYear)) {
								return true
							}
							return false;
						});
						if (isProjectImplemented) {
							return state.currentPage;
						}

						return toggleRenewableProject.apply(this, [state, nextState, financingOption]);
					} else {
						return toggleProjectImplemented.apply(this, [state, nextState, financingOption]);
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
		function toggleProjectImplemented(this: App, state: AppState, nextState: NextAppState, financingOption?: FinancingOption) {
			let implementedProjectsIds = state.implementedProjectsIds.slice();
			let implementedFinancedProjects: ImplementedProject[] = [...this.state.implementedFinancedProjects];
			let newTrackedStats = { ...state.trackedStats };
			let hasAbsoluteCarbonSavings = self.statsActualAppliers.absoluteCarbonSavings !== undefined;
			let implementationFinancing: FinancingOption = {...financingOption};
			
			if (implementedProjectsIds.includes(self.pageId)) {
				removeImplementedProject(implementedProjectsIds, implementedFinancedProjects, state, nextState, newTrackedStats);
			} else {
				if (!checkCanImplementProject.apply(this, [state, implementationFinancing.financingType.id])) {
					return state.currentPage;
				}
				
				if (implementationFinancing.financingType.id === 'capital-funding') {
					let capitalFundingState: CapitalFundingState = this.state.capitalFundingState;
					setCapitalFundingRoundUsed(capitalFundingState, implementationFinancing, self.pageId);
					nextState.capitalFundingState = capitalFundingState;
				}
				implementedProjectsIds.push(self.pageId);
				implementedFinancedProjects.push({
					page: self.pageId,
					gameYearsImplemented: [newTrackedStats.currentGameYear],
					yearStarted: newTrackedStats.currentGameYear,
					financingOption: implementationFinancing
				});

				self.applyStatChanges(newTrackedStats);
				self.applyCost(newTrackedStats, implementationFinancing);
				
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
			nextState.implementedFinancedProjects = implementedFinancedProjects;
			nextState.trackedStats = newTrackedStats;

			return state.currentPage; // no page change
		}

		function removeImplementedProject(
			implementedProjectsIds: symbol[], 
			implementedFinancedProjects: ImplementedProject[], 
			state: AppState, 
			nextState: NextAppState, 
			newTrackedStats: TrackedStats) 
		{
			undoAllProjectStats(implementedProjectsIds, implementedFinancedProjects, newTrackedStats)
			
			implementedProjectsIds.splice(implementedProjectsIds.indexOf(self.pageId), 1);
			const deleteIndex = implementedFinancedProjects.findIndex(project => project.page === self.pageId);
			let implementedFinancingOption = implementedFinancedProjects[deleteIndex].financingOption;
			implementedFinancedProjects.splice(deleteIndex, 1);
			for (let i = 0; i < implementedProjectsIds.length; i++) {
				let pageId = implementedProjectsIds[i];
				let financingOption = findFinancingOptionFromProject(implementedFinancedProjects, pageId);
				Projects[pageId].applyStatChanges(newTrackedStats);
				Projects[pageId].applyCost(newTrackedStats, financingOption);

			}
			
			if (implementedFinancingOption.financingType.id === 'capital-funding') {
				let capitalFundingState: CapitalFundingState = {...state.capitalFundingState};
				nextState.capitalFundingState = removeCapitalFundingRoundUsed(capitalFundingState, implementedFinancingOption.financingType.isRoundA);
			} 
		}

		/**
		 * Since the order of projects matters, we can't simply unApplyChanges to ourself.
		 * We must first undo all the stat changes in REVERSE ORDER, then re-apply all but this one.
		 * IMPORTANT this is only needed due to relative project appliers
		 */
		function undoAllProjectStats(implementedProjectsIds: symbol[], implementedFinancedProjects: ImplementedProject[], newTrackedStats: TrackedStats) {
			for (let i = implementedProjectsIds.length - 1; i >= 0; i--) {
				let pageId = implementedProjectsIds[i];
				const financingOption: FinancingOption = findFinancingOptionFromProject(implementedFinancedProjects, pageId);
				Projects[pageId].unApplyStatChanges(newTrackedStats);
				Projects[pageId].unApplyCost(newTrackedStats, financingOption);

			}

		}

		function checkCanImplementProject(this: App, state: AppState, financingId: FinancingId): boolean {
			const gameSettings: GameSettings = JSON.parse(localStorage.getItem('gameSettings'));
			let canImplement = true;
			let projectImplementationLimit = gameSettings.useGodMode? 1000 : 4;
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

			let projectCost = self.getImplementationCost(financingId, state.trackedStats.gameYearInterval);
			console.log('financesAvailable', state.trackedStats.financesAvailable);
			console.log('cost', projectCost);
			if (projectCost > 0 && projectCost > state.trackedStats.financesAvailable) {
				this.summonSnackbar(<Alert severity='error'>You cannot afford this project with your current budget!</Alert>);
				canImplement = false;
			}
			return canImplement;
		}

		function toggleRenewableProject(this: App, state: AppState, nextState: NextAppState, financingOption?: FinancingOption) {
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
				if (!checkCanImplementProject.apply(this, [state, financingOption.financingType.id])) {
					return state.currentPage;
				}

				if (existingRenewableProjectIndex >= 0) {
					reImplementRenewable(implementedRenewableProjects, existingRenewableProjectIndex, yearRangeInitialStats, newTrackedStats)
				} else {
					implementedRenewableProjects.push({
						page: self.pageId,
						gameYearsImplemented: [newTrackedStats.currentGameYear],
						yearStarted: newTrackedStats.currentGameYear,
						financingOption: financingOption
					});
					self.applyStatChanges(newTrackedStats);
					self.applyCost(newTrackedStats, financingOption);
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

		// todo do better than indexing into array here
		/**
		 * Called if we've de-selected renewable implementation AND re-selected to implement in the same year, 
		 * yearRangeInitial stats must be reconciled with trackedStats
		 */
		function reImplementRenewable(implementedRenewableProjects: RenewableProject[], existingRenewableProjectIndex: number, yearRangeInitialStats: TrackedStats[], newTrackedStats: TrackedStats) {
			implementedRenewableProjects[existingRenewableProjectIndex].gameYearsImplemented.push(newTrackedStats.currentGameYear);
			self.applyStatChanges(newTrackedStats);
			let shouldApplyCosts = !Projects[implementedRenewableProjects[existingRenewableProjectIndex].page].isOneTimePayment;
			if (shouldApplyCosts) {
				self.applyCost(newTrackedStats, implementedRenewableProjects[existingRenewableProjectIndex].financingOption);
			}
			// * 22 if we've de-selected renewable implementation AND re-selected to implement in the same year, yearRangeInitial stats are out of sync with trackedStats
			const updatedCurrentStatsIndex = yearRangeInitialStats.findIndex(stats => stats.currentGameYear === newTrackedStats.currentGameYear);
			yearRangeInitialStats.splice(updatedCurrentStatsIndex, 1, newTrackedStats);
		}


		/**
		 * Remove implementation year or whole project
		 */
		function removeRenewableProject(implementedRenewableProjects: RenewableProject[], removeProjectIndex: number, newTrackedStats: TrackedStats, yearRangeInitialStats: TrackedStats[], isFullRemoval = false) {
			for (let i = implementedRenewableProjects.length - 1; i >= 0; i--) {
				const project: RenewableProject = implementedRenewableProjects[i];
				if (project.gameYearsImplemented.includes(newTrackedStats.currentGameYear)) {
					const projectControl = Projects[project.page];
					Projects[project.page].unApplyStatChanges(newTrackedStats);
					let shouldUnapplyCosts = !projectControl.isOneTimePayment || (projectControl.isOneTimePayment && project.yearStarted === newTrackedStats.currentGameYear);
					if (shouldUnapplyCosts) {
						Projects[project.page].unApplyCost(newTrackedStats, project.financingOption);
					}
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
					const projectControl = Projects[project.page];
					Projects[project.page].applyStatChanges(newTrackedStats);
					let shouldApplyCosts = !projectControl.isOneTimePayment || (projectControl.isOneTimePayment && project.yearStarted === newTrackedStats.currentGameYear);
					if (shouldApplyCosts) {
						Projects[project.page].applyCost(newTrackedStats, project.financingOption);
					}
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
	}

	/**
	 * Un-applies this project's stat changes by mutating the provided TrackedStats object.
	 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
	 */
	unApplyStatChanges(mutableStats: TrackedStats) {
		for (let key in this.statsActualAppliers) {
			let thisApplier = this.statsActualAppliers[key];
			if (!thisApplier) return;

			let yearMultiplier = 1;
			if (thisApplier.isAbsolute) {
				yearMultiplier = mutableStats.gameYearInterval;
			}
			mutableStats[key] = thisApplier.unApplyValue(mutableStats[key], yearMultiplier);
		}
	}

	/**
 * Applies this project's cost & rebates by mutating the provided TrackedStats object.
 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
 * @param financingOption will be undefined for a renewable project that is done financing
 */
	applyCost(mutableStats: TrackedStats, financingOption: FinancingOption, hasActiveRebates: boolean = true) {
		let rebates = 0
		if (hasActiveRebates){
			rebates = this.getRebates();
		}
		let financingId: FinancingId = financingOption? financingOption.financingType.id : 'budget';
		let cost = this.getImplementationCost(financingId, mutableStats.gameYearInterval);
		mutableStats.financesAvailable -= cost - rebates;
		mutableStats.implementationSpending += cost;
		mutableStats.yearBudget += rebates;
	}


	/**
	 * Un-applies this project's cost & rebates by mutating the provided TrackedStats object.
	 * @param mutableStats A mutable version of a TrackedStats object. Must be created first via a shallow copy of app.state.trackedStats
	 */
	unApplyCost(mutableStats: TrackedStats, financingOption: FinancingOption) {
		let rebates = this.getRebates();
		let cost = this.getImplementationCost(financingOption.financingType.id, mutableStats.gameYearInterval);
		if (this.isRenewable) {
			// todo 22 should get every year?
			rebates = rebates * mutableStats.gameYearInterval;
		}
		mutableStats.financesAvailable += cost - rebates;
		mutableStats.implementationSpending -= cost;
		mutableStats.yearBudget -= rebates;
	}

	/**
	 * Get project implementation cost by financing method and game year interval
	 */
	getImplementationCost(financingId: FinancingId, gameYearInterval: number) {
		let projectCost = this.baseCost;
		let isAnnuallyFinanced = getIsAnnuallyFinanced(financingId);
		let intervalMultiplier = this.isOneTimePayment && !isAnnuallyFinanced? 1 : gameYearInterval;
		if (financingId && financingId === 'capital-funding') {
			projectCost = 0;
		} else if (financingId && isAnnuallyFinanced) {
			projectCost = this.financedAnnualCost;
		}
		if (this.isRenewable || isAnnuallyFinanced) {
			projectCost *= intervalMultiplier;
		}

		return projectCost;
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
	getYearEndTotalSpending(financingOption: FinancingOption, gameYearInterval: number, calculateExtraCosts: boolean = true): number {
		let cost = this.getImplementationCost(financingOption.financingType.id, gameYearInterval);
		if (calculateExtraCosts) {
			const rebates = this.getYearEndRebates();
			const hiddenCosts = this.getHiddenCost();
			return cost - rebates + hiddenCosts;
		} else {
			return cost;
		}
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
	Pages.electricBoiler, Pages.blendedFuel, Pages.landfillGasForOven
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
	Pages.midSolar,
	Pages.solarRooftop,
	Pages.largeWind,
	Pages.smallVPPA,
	Pages.midVPPA,
	Pages.largeVPPA,
	Pages.communityWindProject,
	Pages.hydrogenPoweredForklifts
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
export interface CompletedProject extends ImplementedProject {
	completedYear: number,
}

export interface SelectedProject extends Project {
	projectDialog: ProjectDialogControlProps
}

/**
 * Project that must be renewed each year 
 * @param gameYearsImplemented - which game years was the project implemented
 */
export interface RenewableProject extends ImplementedProject {
	yearlyFinancialSavings?: {
		naturalGas: number,
		electricity: number
	}
}

/**
 * Parameters to pass into a ProjectControl. See code definition in `projects.tsx` for all fields and params.
 * @param gameYearsImplemented track years in implementation status for renewables and loan terms
 */
export interface ImplementedProject extends Project {
	gameYearsImplemented: number[],
	// todo 200 just get from gameYearsImpelmented?
	yearStarted?: number;
	financingOption?: FinancingOption;

}

export interface Project {
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
	baseCost: number;
	/**
	 * Financed project annual cost
	 */
	financedAnnualCost?: number;
	/**
	 * Financed project total cost, adjusted with interest
	 */
	financedTotalCost?: number;
	/**
	 * Project that has to be renewed (reimplemented) each year) - stat appliers are removed going into each year
	*/
	isRenewable?: boolean;
	customBudgetType?: FinancingType;
	isOneTimePayment?: boolean;
	financingOptions?: FinancingOption[]
	/**
	 * Project that only gets energy $ savings for 1 year
	*/
	isEnergyEfficiency?: boolean;
	/**
	 * PPPAs must finance, only show once financing has started
	*/
	isPPPA?: boolean;
	/**
	 * Project can be implemented using the Capital Funds Reward (awarded for GHG/carbon savings milestones)
	*/
	isCapitalFundsEligible?: boolean;
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
