import React, { createContext } from 'react';
import { Container, Box, ThemeProvider, Snackbar, Typography, Button, AppBar, IconButton, Toolbar, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import '@fontsource/lato/400.css';
import '@fontsource/lato/700.css';
import '@fontsource/lato/900.css';

import type { ControlCallbacks } from './components/controls';
import { calculateEmissions } from './trackedStats';
import type { TrackedStats, YearCostSavings } from './trackedStats';
import { updateStatsGaugeMaxValues } from './trackedStats';
import { getYearCostSavings } from './trackedStats';
import { initialTrackedStats, setCarbonEmissionsAndSavings } from './trackedStats';
import { Dashboard } from './components/Dashboard';
import Pages, { PageError } from './Pages';
import { PageControls } from './PageControls';
import { Scope1Projects, Scope2Projects } from './ProjectControl';
import type { CostSavings, ImplementedProject, RenewableProject} from './ProjectControl';
import type { CompletedProject, SelectedProject} from './ProjectControl';
import { resolveToValue, cloneAndModify, rightArrow } from './functions-and-types';
import { theme } from './components/theme';
import { closeDialogButton } from './components/Buttons';
import { YearRecap, getHasActiveHiddenCost } from './components/YearRecap';
import ScopeTabs from './components/ScopeTabs';
import { CurrentPage } from './components/CurrentPage';
import { InfoDialog, InfoDialogControlProps, InfoDialogStateProps, fillInfoDialogProps, getDefaultWarningDialogProps, getEmptyInfoDialogState } from './components/Dialogs/InfoDialog';
import { CompareDialog } from './components/Dialogs/CompareDialog';
import { ProjectDialog, ProjectDialogControlProps, ProjectDialogStateProps, fillProjectDialogProps, getEmptyProjectDialog } from './components/Dialogs/ProjectDialog';
import Projects from './Projects';
import { GameSettings, UserSettings, getYearlyBudget } from './components/SelectGameSettings';
import { CapitalFundingState, FinancingOption, findFinancingOptionFromProject, getCanUseCapitalFunding, isProjectFullyFunded, resetCapitalFundingState, setCapitalFundingMilestone } from './Financing';
import WinGame from './components/WinGame';
import LoseGame from './components/LoseGame';


export type AppState = {
	currentPage: symbol;
	currentOnBack?: PageCallback; // onBack handler of current page
	companyName: string;
	// todo must we keep these always mounted
	infoDialog: InfoDialogStateProps,
	projectDialog: ProjectDialogStateProps,
	currentPageProps?: AnyDict;
	componentClass?: Component;
	completedYears: number,
	trackedStats: TrackedStats;
	// * initial stats for each year range. Currently looks like the first year never changes, though
	// * subsequent years are modified by any projects/stats applied. Each new yearRange is added at YearRecap
	/**
	 * Initial stats for each year range. The first year never changes. Subsequent 
	 * years are modified by any projects/stats applied. Each new yearRange is added at YearRecap
	 */
	yearRangeInitialStats: TrackedStats[];
	/**
	 * Track status of capital funding rewards
	 */
	capitalFundingState: CapitalFundingState;
	showDashboard: boolean;
	/**
	 * Projects that have been selected to implement in the current year
	 */
	implementedProjectsIds: symbol[];
	/**
	 * Projects that have been selected to implement
	 */
	implementedFinancedProjects: ImplementedProject[];
	/**
	 * Projects selected to implement whose cost is reapplied each year (savings applied once), and are automatically selected until unselected
	 */
	implementedRenewableProjects: RenewableProject[];
	availableProjectIds: symbol[];
	/**
	 * Implemented/selected projects from the previous year
	 */
	completedProjects: CompletedProject[];
	selectedProjectsForComparison: SelectedProject[];
	lastScrollY: number;
	snackbarOpen: boolean;
	isCompareDialogOpen: boolean;
	snackbarContent?: JSX.Element;
	gameSettings: GameSettings;
	defaultTrackedStats : TrackedStats;
	yearlyCostSavings: YearCostSavings[];
	endGamePage?: Component;
}

// JL note: I could try and do some fancy TS magic to make all the AppState whatsits optional, but
// 	realized that this is a much easier solution. TODO document

export interface NextAppState {
	currentPage?: symbol;
	currentOnBack?: PageCallback;
	companyName?: string;
	completedYears?: number,
	infoDialog?: InfoDialogStateProps,
	projectDialog?: ProjectDialogStateProps,
	currentPageProps?: AnyDict;
	componentClass?: Component;
	trackedStats?: TrackedStats;
	showDashboard?: boolean;
	implementedProjectsIds?: symbol[];
	capitalFundingState: CapitalFundingState;
	completedProjects?: CompletedProject[];
	availableProjectIds?: symbol[];
	implementedRenewableProjects?: RenewableProject[];
	implementedFinancedProjects: ImplementedProject[];
	selectedProjectsForComparison: SelectedProject[];
	yearRangeInitialStats?: TrackedStats[];
	snackbarOpen?: boolean;
	snackbarContent?: JSX.Element;
	isCompareDialogOpen?: boolean;
}

export class App extends React.PureComponent<unknown, AppState> {
	constructor(props: unknown) {
		super(props);

		this.state = this.getInitialAppState();
		// @ts-ignore - for debugging 
		window.app = this; window.Pages = Pages; window.PageControls = PageControls;
	}

	getInitialAppState(): AppState {
		let startPage = Pages.start; 
		if (process.env.REACT_APP_SERVER_ENV == 'development') {
			startPage = Pages.selectGameSettings;
		}
		let showDashboardAtStart = false;
		return {
			currentPage: startPage,
			companyName: 'Auto-Man, Inc.',
			infoDialog: getEmptyInfoDialogState(),
			projectDialog: getEmptyProjectDialog(),
			completedYears: 0,
			currentPageProps: PageControls[startPage].controlProps,
			componentClass: PageControls[startPage].componentClass,
			trackedStats: { ...initialTrackedStats },
			capitalFundingState: {
				roundA: {
					isEarned: false,
					isExpired: false, 
					eligibleYear: undefined,
					usedOnProjectId: undefined,
				},
				roundB: {
					isEarned: false,
					isExpired: false,
					eligibleYear: undefined,
					usedOnProjectId: undefined,
				}
			},
			yearRangeInitialStats: [
				{ ...initialTrackedStats } // This one stays constant
			],
			showDashboard: showDashboardAtStart,
			implementedProjectsIds: [],
			implementedRenewableProjects: [],
			implementedFinancedProjects: [],
			availableProjectIds: [],
			selectedProjectsForComparison: [],
			completedProjects: [],
			lastScrollY: -1,
			snackbarOpen: false,
			isCompareDialogOpen: false,
			gameSettings: {
				totalGameYears: 10,
				gameYearInterval: 1,
				budget: 150_000,
				devBudget: 10000000,
				naturalGasUse: 4_000,
				electricityUse: 4_000_000,
				hydrogenUse: 2_000,
				financingStartYear: 3,
				costSavingsCarryoverYears: 'oneYear',
				allowBudgetCarryover: 'no',
				useGodMode: false,
				financingOptions: {
					eaas: false,
					greenBond: false,
					loan: false
				}
			},
			defaultTrackedStats : { ...initialTrackedStats },
			yearlyCostSavings: []
		};
	}

	setPage(page: symbol) {
		let thisPageControl = PageControls[page];
		if (!thisPageControl)
			throw new PageError(`Page controls not defined for the symbol ${page.description}`);

		let componentClass = thisPageControl.componentClass;
		let controlProps = thisPageControl.controlProps;
		let controlOnBack = thisPageControl.onBack;
		let hideDashboard = thisPageControl.hideDashboard;

		const {infoDialog, projectDialog, currentPageProps} = this.checkDialogDisplay(componentClass, controlProps);
		this.setState({
			currentPage: page,
			infoDialog,
			projectDialog,
			componentClass,
			currentPageProps: currentPageProps,
			currentOnBack: controlOnBack,
		});

		// Hide/show dashboard UNLESS it's set to "initial" meaning keep it at its previous state
		if (hideDashboard !== 'initial') {
			this.setState({ showDashboard: !hideDashboard });
		}
		this.saveScrollY();
	}

	/**
	 * Set page as an info dialog, otherwise handle open info or project dialog close
	 */
	checkDialogDisplay(componentClass: Component, controlProps: AnyDict) {
		let infoDialog: InfoDialogStateProps = getEmptyInfoDialogState();
		let projectDialog: ProjectDialogStateProps = getEmptyProjectDialog(); 
		let currentPageProps;

		if (componentClass === InfoDialog) {
			infoDialog = fillInfoDialogProps(controlProps);
			infoDialog.isOpen = true;
		} else {
			// * If navigating back to project menu or other from a dialog, close dialog
			infoDialog = cloneAndModify(this.state.infoDialog, { isOpen: false });
			projectDialog = cloneAndModify(this.state.projectDialog, {isOpen: false});
			currentPageProps = controlProps;
		}

		return {
			infoDialog, 
			projectDialog,
			currentPageProps
		}
	}


	saveScrollY() {
		// Only save window.scrollY before loading the new page IF it's nonzero
		if (window.scrollY > 0) {
			this.setState({
				lastScrollY: window.scrollY,
			});
		}
	}

	handlePageCallback(callbackOrPage?: PageCallback) {
		let nextPage;
		if (typeof callbackOrPage === 'symbol') {
			nextPage = callbackOrPage;
		} else if (typeof callbackOrPage === 'function') {
			// Mutable params to update
			let newStateParams: Pick<AppState, never> = {};
			nextPage = resolveToValue(callbackOrPage, undefined, [this.state, newStateParams], this);
			if (newStateParams['trackedStats']) {
				let newTrackedStats = newStateParams['trackedStats'];
				newStateParams['trackedStats'] = newTrackedStats;
				// Update max values for gauges in case they increased
				updateStatsGaugeMaxValues(newTrackedStats);
			}
			this.setState(newStateParams);
		}
		else return;

		this.setPage(nextPage);
	}

	/**
	 * Handdle state changes without setting page (i.e. when in dialog avoid closing dialog)
	 */
	handleAppStateCallback(appStateCallback?: AppStateCallback) {
		let newStateParams: Pick<AppState, never> = {};
		let currentPage = resolveToValue(appStateCallback, undefined, [this.state, newStateParams], this);
		// Only setState on specific properties for now
		if (newStateParams['availableProjectIds']) {
			this.setState(newStateParams);
		}
	}

	/**
	 * Display an info dialog with the specified dialog props. Does not change the current page.
	 */
	displayDialog(props: InfoDialogControlProps) {
		let infoDialog = fillInfoDialogProps(props);
		infoDialog.isOpen = true;
		
		setTimeout(() => {
			this.setState({
				infoDialog,
			});
			this.saveScrollY();
		}, 50);
	}

	/**
	 * Display a project dialog with the specified dialog props. Does not change the current page.
	 */
	displayProjectDialog(props: ProjectDialogControlProps) {
		let projectDialog: ProjectDialogStateProps = getEmptyProjectDialog(); 
		projectDialog = fillProjectDialogProps(props);
		projectDialog.isOpen = true;

		setTimeout(() => {
			this.setState({
				projectDialog,
			});
			this.saveScrollY();
		}, 50);
	}


	handleDialogClose() {
		let infoDialog = cloneAndModify(this.state.infoDialog, {isOpen: false});
		let projectDialog = cloneAndModify(this.state.projectDialog, {isOpen: false});

		this.setState({
			infoDialog, 
			projectDialog,
		});
	}

	handleCompareDialogDisplay(isCompareDialogOpen: boolean) {
		setTimeout(() => {
			this.setState({ isCompareDialogOpen });
			this.saveScrollY();
		}, 50);
	}

	handleClearSelectedProjects() {
		let selectedProjectsForComparison = [];
		this.setState({ 
			selectedProjectsForComparison: selectedProjectsForComparison,
			isCompareDialogOpen: false
		});
	}


	summonSnackbar(content: JSX.Element) {
		this.setState({
			snackbarOpen: true,
			snackbarContent: content,
		});
	}
	/**
	 * Resolve an item of an unknown type to a value, binding the App object & providing the current state.
	 * 	setState / nextState is not available in this function.
	 * @param item Item to resolve.
	 */
	resolveToValue(item: unknown, whenUndefined?: unknown) {
		return resolveToValue(item, whenUndefined, [this.state], this);
	}

	componentDidUpdate(prevProps: AnyDict, prevState: AppState) {
		this.ignoreScrollHeightOnDialogClose(prevState)
	}
	
	// componentDidMount(): void {
	// 	window.addEventListener('scroll', this.handleScroll);
	// }

	// componentWillUnmount() {
	// 	window.removeEventListener('scroll', this.handleScroll);
	// }
	
	handleScroll(event) {
		let scrollTop = event.srcElement.body.scrollTop,
			itemTranslate = Math.min(0, scrollTop/3 - 60);
	
		// this.setState({
		//   transform: itemTranslate
		// });
	}
	

	ignoreScrollHeightOnDialogClose(prevState: AppState) {
		let infoDialogClosed: boolean = (prevState.infoDialog.isOpen && !this.state.infoDialog.isOpen);
		let projectdialogClosed: boolean = (prevState.projectDialog.isOpen && !this.state.projectDialog.isOpen);
		let compareDialogClosed: boolean = (prevState.isCompareDialogOpen && !this.state.isCompareDialogOpen)
		const isDialogStateClosedEvent = infoDialogClosed || projectdialogClosed || compareDialogClosed;
		if (isDialogStateClosedEvent) {
			scrollTo(0, this.state.lastScrollY);
		}
	}
	startNewGame() {
		location.href = String(location.href);
		this.setPage(Pages.start);
	}

	handleDashboardOnProceed() {
		this.setState({
			lastScrollY: -1,
		});
		let hasWarningDialog = this.displayWarningDialogs();
		if (hasWarningDialog) {
			return;
		}
		this.setPage(Pages.yearRecap);
	}

	displayWarningDialogs(): boolean {
		let warningDialogProps: InfoDialogControlProps = getDefaultWarningDialogProps();
		const gameSettings: GameSettings = JSON.parse(localStorage.getItem('gameSettings'));
		let hasScopesWarning = gameSettings.useGodMode? false : this.state.completedYears < 1;
		let canUseCapitalFunding = gameSettings.useGodMode? false : getCanUseCapitalFunding(this.state.capitalFundingState);
		
		if (hasScopesWarning) {
			let renewableProjectSymbols = [...this.state.implementedRenewableProjects].map(project => project.page);
			let hasSelectedScope1Projects = Scope1Projects.some((page) => {
				return this.state.implementedProjectsIds.includes(page) || renewableProjectSymbols.includes(page);
			});
			let hasSelectedScope2Projects = Scope2Projects.some((page) => {
				return this.state.implementedProjectsIds.includes(page) || renewableProjectSymbols.includes(page);
			});
			if (!hasSelectedScope1Projects) {
				warningDialogProps.text = 'You haven\'t selected any Scope 1 projects for this budget period. Do you want to go {BACK} and look at some of the possible Scope 1 projects?';
			} else if (!hasSelectedScope2Projects) {
				warningDialogProps.text = 'You haven\'t selected any Scope 2 projects for this budget period. Do you want to go {BACK} and look at some of the possible Scope 2 projects?';
			}
			hasScopesWarning = !hasSelectedScope1Projects || !hasSelectedScope2Projects;
		}
		
		if (canUseCapitalFunding) {
			warningDialogProps.text = 'Your Capital Funding reward must be used in this budget period or the funding will be lost.';
		}

		if (hasScopesWarning || canUseCapitalFunding) {
			this.displayDialog(warningDialogProps);
			return true;
		} else {
			return false;
		}
	}

	handleDashboardOnBack() {
		// * default back page
		let nextPage: symbol = this.state.currentPage;
		if (this.state.currentPage == Pages.scope1Projects || this.state.currentPage == Pages.scope2Projects ) {
			let year: number = this.state.trackedStats.currentGameYear;
			if (year == 1) {
				this.setState(this.getInitialAppState());
				nextPage = Pages.start;
			}
			else {
				this.setPreviousAppState();
			}
		}
		this.setPage(nextPage);
	}

	isBackButtonDisabled() {
		if (this.state.trackedStats.currentGameYear === 1) {
			return false;
		}
		return this.state.completedYears === this.state.trackedStats.currentGameYear;
	}

	isProceedButtonDisabled() {
		return this.state.componentClass === YearRecap;
	}

	/**
	 * Update state from previous selections and results when navigating back
	 * Only updates current stats ('trackedStats'), not those in yearRangeInitialStats
	 */
	setPreviousAppState() {
		let completedProjects: CompletedProject[] = [...this.state.completedProjects];
		let renewableProjects: RenewableProject[] = [...this.state.implementedRenewableProjects];

		// todo previousYear is actually currentYearIndex
		let previousYear: number = this.state.trackedStats.currentGameYear > 1 ? this.state.trackedStats.currentGameYear - 1 : 0;
		let previousYearIndex = previousYear - 1;
		let updatedCompletedProjects: CompletedProject[] = completedProjects.filter(project => project.completedYear !== previousYear);
		let previousimplementedProjects: ImplementedProject[] = completedProjects.filter(project => project.completedYear === previousYear);
		let previousimplementedProjectsIds: symbol[] = [...previousimplementedProjects].map(previousYearProject => previousYearProject.page);

		let mutableCapitalFundingState: CapitalFundingState = {...this.state.capitalFundingState};
		let yearRangeInitialStats = [...this.state.yearRangeInitialStats];
		yearRangeInitialStats.pop();
		let previousYearStats: TrackedStats = yearRangeInitialStats[yearRangeInitialStats[previousYearIndex].currentGameYear - 1];
		let newTrackedStats: TrackedStats = yearRangeInitialStats[previousYearIndex];
		let implementedFinancedProjects: ImplementedProject[] = [...this.state.implementedFinancedProjects];
		if (previousYearStats) {
			// * Only modify stats for display. YearRecap will handle yearRangeInitialStats updates
			let statsForResultDisplay = { ...previousYearStats };
			
			previousimplementedProjects.forEach((completedProject: ImplementedProject, index) => {
				let project = Projects[completedProject.page];
				project.applyStatChanges(statsForResultDisplay);
				project.applyCost(statsForResultDisplay, completedProject.financingOption);

				// only add completed projects back in
				let inFinancedProjects = implementedFinancedProjects.find(project => project.page === completedProject.page);
				if (!inFinancedProjects) {
					implementedFinancedProjects.push({
						page: project.pageId,
						gameYearsImplemented: [newTrackedStats.currentGameYear],
						yearStarted: newTrackedStats.currentGameYear,
						financingOption: completedProject.financingOption
					});
				}
			});

			renewableProjects.forEach(project => {
				if (project.yearStarted === previousYear) {
					let Project = Projects[project.page];
					Project.applyStatChanges(statsForResultDisplay);
					Project.applyCost(statsForResultDisplay, project.financingOption);

				}
			});
			newTrackedStats = setCarbonEmissionsAndSavings(statsForResultDisplay, this.state.defaultTrackedStats); 
			updateStatsGaugeMaxValues(newTrackedStats);
		}
		resetCapitalFundingState(mutableCapitalFundingState, newTrackedStats);

		let onBackState = {
			completedProjects: updatedCompletedProjects,
			implementedProjectsIds: previousimplementedProjectsIds,
			implementedFinancedProjects: implementedFinancedProjects,
			trackedStats: newTrackedStats,
			yearRangeInitialStats: yearRangeInitialStats,
		};
		this.setState(onBackState);
	}

	/**
	 * Start new year/budget period
	 */
	setupNewYearOnProceed(currentYearStats: TrackedStats, capitalFundingState: CapitalFundingState) {
		let implementedProjectsIds: symbol[] = [...this.state.implementedProjectsIds];
		let implementedFinancedProjects: ImplementedProject[] = [...this.state.implementedFinancedProjects];
		let implementedRenewableProjects: RenewableProject[] = [...this.state.implementedRenewableProjects];
		let newCapitalFundingState: CapitalFundingState = {...capitalFundingState}
		let newCompletedProjects: CompletedProject[] = [...this.state.completedProjects];
		let yearlyCostSavings: YearCostSavings[] = [...this.state.yearlyCostSavings];
		let newBudget: number = getYearlyBudget(currentYearStats.currentGameYear + 1, currentYearStats.gameYearInterval, currentYearStats.gameYearDisplayOffset);
		console.log('Finances available from last year:', currentYearStats.financesAvailable);
		console.log('New year awarded budget:', newBudget);
		newBudget = this.applyBudgetCarryover(newBudget, currentYearStats);
		newBudget = this.applyNewYearCostSavings(newBudget, implementedFinancedProjects, implementedRenewableProjects, newCompletedProjects, currentYearStats);

		let newYearTrackedStats: TrackedStats = { ...currentYearStats };
		this.setNewYearStats(newYearTrackedStats, newBudget, currentYearStats);

		implementedProjectsIds.forEach((id, index) => {
			const financingIndex = implementedFinancedProjects.findIndex(project => project.page === id);
			let financingsOption: FinancingOption;
			let costSavings: CostSavings;
			if (implementedFinancedProjects[financingIndex]) {
				financingsOption = implementedFinancedProjects[financingIndex].financingOption;
				costSavings = implementedFinancedProjects[financingIndex].costSavings;
			}
			newCompletedProjects.push({
				completedYear: currentYearStats.currentGameYear,
				gameYearsImplemented: [currentYearStats.currentGameYear],
				page: id,
				yearStarted: currentYearStats.currentGameYear,
				costSavings: costSavings,
				financingOption: financingsOption
			});
		});
		let preScope1Charges = newYearTrackedStats.financesAvailable;
		this.handleNewYearFinancedProjects(implementedFinancedProjects, newYearTrackedStats);
		console.log('Scope 1 Financed costs', preScope1Charges - newYearTrackedStats.financesAvailable);
		newYearTrackedStats = setCarbonEmissionsAndSavings(newYearTrackedStats, this.state.defaultTrackedStats); 
		let preScope2Charges = newYearTrackedStats.financesAvailable;
		this.applyRenewableCosts(implementedRenewableProjects, newYearTrackedStats);
		console.log('Scope 2 REC/Financed/PPA cost', preScope2Charges - newYearTrackedStats.financesAvailable);
		let newYearRangeInitialStats = [...this.state.yearRangeInitialStats, { ...newYearTrackedStats }];
		const completedYears = this.state.completedYears < this.state.trackedStats.currentGameYear? this.state.completedYears + 1 : this.state.completedYears; 
		console.log('New year carbon emissions', newYearTrackedStats.carbonEmissions)
		console.log('==============================');
		console.log('Total new year budget (financing/renewable costs applied)', newYearTrackedStats.financesAvailable);
		console.log('Game Total Spending', newYearTrackedStats.gameTotalSpending);
		console.log('======== END =================');

		let nextState = {
			completedProjects: newCompletedProjects,
			completedYears: completedYears,
			implementedProjectsIds: [],
			implementedRenewableProjects: implementedRenewableProjects,
			implementedFinancedProjects: implementedFinancedProjects,
			selectedProjectsForComparison: [],
			trackedStats: newYearTrackedStats,
			yearRangeInitialStats: newYearRangeInitialStats,
			capitalFundingState: newCapitalFundingState,
			yearlyCostSavings: yearlyCostSavings,
			endGamePage: undefined
		};

		const isGameWon = newYearTrackedStats.carbonSavingsPercent >= 0.5;
		const isEndOfGame = newYearTrackedStats.currentGameYear === this.state.gameSettings.totalGameYears + 1;
		
		if (isGameWon) {
			nextState.endGamePage = WinGame; 
			this.endGame(newYearTrackedStats, nextState);
		} else if (isEndOfGame) {
			nextState.endGamePage = LoseGame; 
			this.endGame(newYearTrackedStats, nextState);
		} else {
			this.setState(nextState);
			this.setPage(Pages.scope1Projects);
		}

	}

	endGame(newYearTrackedStats: TrackedStats, nextState) {
		// Game is over - don't advance year
		newYearTrackedStats.currentGameYear -= 1;
		nextState.trackedStats = newYearTrackedStats;
		this.setState(nextState);
		this.setPage(Pages.endGameDialog);
	}

	setNewYearStats(newYearTrackedStats: TrackedStats, newBudget: number, currentYearStats: TrackedStats) {
		newYearTrackedStats.yearBudget = newBudget;
		console.log('Total new year budget: ', newBudget);
		newYearTrackedStats.financesAvailable = newBudget;
		newYearTrackedStats.implementationSpending = 0;
		newYearTrackedStats.hiddenSpending = 0;
		newYearTrackedStats.currentGameYear = currentYearStats.currentGameYear + 1;
		newYearTrackedStats.gameYearDisplayOffset = currentYearStats.gameYearDisplayOffset + 2;
	}

	applyBudgetCarryover(newBudget: number, currentYearStats: TrackedStats) {
		if (this.state.gameSettings.allowBudgetCarryover == 'no') {
			if (currentYearStats.financesAvailable < 0 ) {				
				newBudget += currentYearStats.financesAvailable;
			} 
		} else if (this.state.gameSettings.allowBudgetCarryover == 'yes') {
			newBudget += currentYearStats.financesAvailable;
		}
		return newBudget
	}

	applyNewYearCostSavings(newBudget: number, implementedFinancedProjects: ImplementedProject[], implementedRenewableProjects: RenewableProject[], completedProjects, currentYearStats: TrackedStats) {
		let thisYearStart: TrackedStats = this.state.yearRangeInitialStats[currentYearStats.currentGameYear - 1];
		let yearCostSavings: YearCostSavings = getYearCostSavings(thisYearStart, currentYearStats);
		
		if (this.state.gameSettings.costSavingsCarryoverYears == 'always') {
			// todo
		} else if (this.state.gameSettings.costSavingsCarryoverYears == 'oneYear') {
			// todo are we incorporating hydrogen/landfill?
			let energyCostSavings: number = (yearCostSavings.electricity + yearCostSavings.naturalGas) * initialTrackedStats.projectCostSavingsMultiplier;
			newBudget += energyCostSavings;
		}

		// todo 275 this will break when 'always' is implemented
		// * remove applied costsavings from projects that should not get carryover
		let projectCostSavingsDeduction: number = implementedFinancedProjects.reduce((projectCostSavingsDeduction: number, project) => {
			let hasAppliedFirstYearSavings = project.yearStarted === currentYearStats.currentGameYear && (this.state.gameSettings.costSavingsCarryoverYears == 'oneYear' || this.state.gameSettings.costSavingsCarryoverYears == 'always');
			if (project.costSavings && project.costSavings.carryOver === 'never' && hasAppliedFirstYearSavings) {
				projectCostSavingsDeduction += project.costSavings.budgetPeriodCostSavings.electricity; 
				projectCostSavingsDeduction += project.costSavings.budgetPeriodCostSavings.naturalGas; 
				// projectCostSavingsDeduction += project.costSavings.budgetPeriodCostSavings.hydrogen; 
			}
			return projectCostSavingsDeduction;
		}, 0);
		
		projectCostSavingsDeduction *= initialTrackedStats.projectCostSavingsMultiplier;
		newBudget -= projectCostSavingsDeduction;

		let projectsAlwaysCostSavings: ImplementedProject[] = implementedFinancedProjects.filter(project => project.costSavings && project.costSavings.carryOver === 'always');
		projectsAlwaysCostSavings = projectsAlwaysCostSavings.concat(implementedRenewableProjects.filter(project => project.costSavings && project.costSavings.carryOver === 'always').map(project => project as ImplementedProject));		
		projectsAlwaysCostSavings = projectsAlwaysCostSavings.concat(completedProjects.filter(project => project.costSavings && project.costSavings.carryOver === 'always').map(project => project as ImplementedProject));		
		// * patch in 'always' cost savings from projects
		let projectSpecificCostSavings: number = projectsAlwaysCostSavings.reduce((projectSpecificCostSavings: number, project) => {
			let hasAppliedFirstYearSavings = project.yearStarted === currentYearStats.currentGameYear && (this.state.gameSettings.costSavingsCarryoverYears == 'oneYear' || this.state.gameSettings.costSavingsCarryoverYears == 'always');
			if (!hasAppliedFirstYearSavings) {
				projectSpecificCostSavings += project.costSavings.budgetPeriodCostSavings.electricity; 
				projectSpecificCostSavings += project.costSavings.budgetPeriodCostSavings.naturalGas; 
				// projectSpecificCostSavings += project.costSavings.budgetPeriodCostSavings.hydrogen;
				// todo renewedProjectCostSavingsMultiplier will yield different results than multiplier first applied to all projects above
			}
			return projectSpecificCostSavings;
		}, 0);

		projectSpecificCostSavings *= initialTrackedStats.projectCostSavingsMultiplier;
		newBudget += projectSpecificCostSavings;

		return newBudget; 
	}

	handleNewYearFinancedProjects(financedProjects: ImplementedProject[], newYearTrackedStats: TrackedStats) {
		let completedFinancedIndicies = [];
		financedProjects.forEach((project: ImplementedProject, index) => {
			if (isProjectFullyFunded(project, newYearTrackedStats)) {
				completedFinancedIndicies.push(index);
			} else {
				// console.log(`Apply ${String(project.page)} cost`);
				let hasActiveRebates = project.yearStarted === newYearTrackedStats.currentGameYear;
				Projects[project.page].applyCost(newYearTrackedStats, project.financingOption, hasActiveRebates);
				project.gameYearsImplemented.push(newYearTrackedStats.currentGameYear);
			}
		});

		completedFinancedIndicies.forEach(completed => {
			financedProjects.splice(completed, 1);
		});
	}

	applyRenewableCosts(renewableProjects: RenewableProject[], newYearTrackedStats: TrackedStats) {
		renewableProjects.map(project => {
			let projectControl = Projects[project.page];
			let isfullyFunded = isProjectFullyFunded(project, newYearTrackedStats);
			if (!isfullyFunded || projectControl.isPPA) {
				let hasActiveRebates = project.yearStarted === newYearTrackedStats.currentGameYear;
				// console.log(`Apply ${String(project.page)} cost`);
				projectControl.applyCost(newYearTrackedStats, project.financingOption, hasActiveRebates);
			}
			project.gameYearsImplemented.push(newYearTrackedStats.currentGameYear);
			return project;
		});
	}

	handleGameSettingsOnProceed(userSettings: UserSettings){
		let updatingInitialTrackedStats: TrackedStats = {...initialTrackedStats};
		let budget = 75_000;
		let naturalGas = 150_000;
		let hydrogen = 0;
		let electricity = 30_000_000;
		let totalGameYears = 10;

		if(userSettings.gameYearInterval == 2) {
			budget = 150_000;
			naturalGas = 300_000;
			electricity = 60_000_000;
			hydrogen = 0;
			totalGameYears = 5;
		}

		if (userSettings.useGodMode) {
			if (userSettings.devBudget !== undefined) {
				budget = userSettings.devBudget;
			} else {
				budget = 10_000_000;
			}
		}
		updatingInitialTrackedStats.yearBudget = budget;
		updatingInitialTrackedStats.financesAvailable = budget;
		updatingInitialTrackedStats.naturalGasMMBTU = naturalGas;
		updatingInitialTrackedStats.electricityUseKWh = electricity;
		updatingInitialTrackedStats.hydrogenMMBTU = hydrogen;
		updatingInitialTrackedStats.gameYearInterval = userSettings.gameYearInterval;
		updatingInitialTrackedStats.carbonEmissions = calculateEmissions(updatingInitialTrackedStats);

		let gameStartState = {
			trackedStats: updatingInitialTrackedStats,
			yearRangeInitialStats: [
				updatingInitialTrackedStats,
			],
			gameSettings: {
				...userSettings,
				totalGameYears: totalGameYears,
				budget: budget,
				naturalGasUse: naturalGas,
				electricityUse: electricity,
				hydrogenUse: hydrogen
			},
			defaultTrackedStats: updatingInitialTrackedStats
		}
		this.setState(gameStartState);
		localStorage.setItem('gameSettings', JSON.stringify(gameStartState.gameSettings));
		updateStatsGaugeMaxValues(updatingInitialTrackedStats);

		// this.setPage(Pages.endGameDialog);
		this.setPage(Pages.scope1Projects);
	}
	
	

	render() {
		// Standard callbacks to spread to each control.
		const controlCallbacks: ControlCallbacks = {
			doPageCallback: (callback) => this.handlePageCallback(callback),
			doAppStateCallback: (callback) => this.handleAppStateCallback(callback),
			displayProjectDialog: (props) => this.displayProjectDialog(props),
			resolveToValue: (item, whenUndefined?) => this.resolveToValue(item, whenUndefined),
		};

		// const NativeEventContext = createContext(null);


		return (
			<>
			{/* <NativeEventContext.Provider value={{}}> */}
				<ThemeProvider theme={theme}>
					<Container maxWidth='xl'>
						<Box className='row' sx={{ bgcolor: '#ffffff80', minHeight: '100vh' }}>
							{this.state.currentPage == Pages.yearRecap || this.state.currentPage == Pages.endGameReport || this.state.showDashboard ?
								<>
									<Box sx={{ flexGrow: 1 }}>
										<AppBar position='relative' 
										sx={{bgcolor: 'white', boxShadow: 'none', paddingBottom: '.5rem'}}
										>
										<Toolbar>
											<Typography variant='h4' fontWeight='800'
												textAlign='left' pl={2} component='div'
												// sx={{ flexGrow: 1 }}
												className='bp-font-color'>
												Choose Your Own Solution
											</Typography>
												<Button
													size='small'
													variant='contained'
													onClick={this.startNewGame}
													style={{ margin: '10px', marginLeft: '2rem' }}>
													New Game
												</Button>
											</Toolbar>
										</AppBar>
									</Box>
								</>
								: <></>}
							{this.state.showDashboard ?
							<>
								<Dashboard
									{...this.state.trackedStats}
									{...controlCallbacks}
									{...this.state.gameSettings}
									onBack={() => this.handleDashboardOnBack()}
									btnBackDisabled={this.isBackButtonDisabled()}
									onProceed={() => this.handleDashboardOnProceed()}
									btnProceedDisabled={this.isProceedButtonDisabled()}
								/>
								<ScopeTabs
									handleChangeScopeTabs={(selectedScope) => this.setPage(selectedScope)} 
								/>
							</>
								: <></>}
							{(this.state.currentPageProps && this.state.componentClass) ?
								<CurrentPage
									{...controlCallbacks}
									gameSettings={this.state.gameSettings}
									trackedStats={this.state.trackedStats}
									capitalFundingState={this.state.capitalFundingState}
									componentClass={this.state.componentClass}
									controlProps={this.state.currentPageProps}
									defaultTrackedStats ={this.state.defaultTrackedStats }
									implementedProjectsIds={this.state.implementedProjectsIds} 
									implementedRenewableProjects={this.state.implementedRenewableProjects} 
									implementedFinancedProjects={this.state.implementedFinancedProjects} 
									availableProjectIds={this.state.availableProjectIds}
									selectedProjectsForComparison={this.state.selectedProjectsForComparison}
									completedProjects={this.state.completedProjects}
									handleClearProjectsClick={() => this.handleClearSelectedProjects}
									handleCompareProjectsClick={() => this.handleCompareDialogDisplay(true)}
									yearRangeInitialStats={this.state.yearRangeInitialStats}
									handleGameSettingsOnProceed={(userSettings) => this.handleGameSettingsOnProceed(userSettings)}
									handleNewYearSetupOnProceed={(yearFinalStats, capitalFundingState) => this.setupNewYearOnProceed(yearFinalStats, capitalFundingState)}
									endGamePage={this.state.endGamePage}
								/>
								: <></>}
						</Box>

						{/* Dialogs are always "mounted" so MUI can smoothly animate its opacity */}
						<InfoDialog
							{...this.state.infoDialog}
							{...controlCallbacks}
							onClose={() => this.handleDialogClose()}
						/>
						<ProjectDialog
							{...this.state.projectDialog}
							{...controlCallbacks}
							capitalFundingState={this.state.capitalFundingState}
							currentGameYear={this.state.trackedStats.currentGameYear}
							onClose={() => this.handleDialogClose()}
							/>
						<CompareDialog
							{...this.state.infoDialog}
							{...controlCallbacks}
							isOpen={this.state.isCompareDialogOpen}
							capitalFundingState={this.state.capitalFundingState}
							currentGameYear={this.state.trackedStats.currentGameYear}
							selectedProjectsForComparison={this.state.selectedProjectsForComparison}
							onClearSelectedProjects={() => this.handleClearSelectedProjects()}
							onClose={() => this.handleCompareDialogDisplay(false)}
						/>

						<Snackbar
							open={this.state.snackbarOpen}
							autoHideDuration={6000}
							onClose={() => {
								this.setState({ snackbarOpen: false });
							}}
							anchorOrigin={{
								vertical: 'bottom',
								horizontal: 'center',
							}}
						>
							{this.state.snackbarContent || <></>}
						</Snackbar>
					</Container>
				</ThemeProvider>
			{/* </NativeEventContext.Provider> */}
			</>
		);
	}
}



export default App;
