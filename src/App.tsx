import React from 'react';
import { Container, Box, ThemeProvider, Snackbar, Typography, Button, AppBar, IconButton, Toolbar, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

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
import type { ImplementedProject, RenewableProject} from './ProjectControl';
import type { CompletedProject, SelectedProject} from './ProjectControl';
import { resolveToValue, cloneAndModify, rightArrow } from './functions-and-types';
import { theme } from './components/theme';
import { closeDialogButton } from './components/Buttons';
import { YearRecap } from './components/YearRecap';
import ScopeTabs from './components/ScopeTabs';
import { CurrentPage } from './components/CurrentPage';
import { CapitalFundingState } from './capitalFunding';
import { InfoDialog, InfoDialogControlProps, InfoDialogStateProps, fillInfoDialogProps, getEmptyInfoDialogState } from './components/Dialogs/InfoDialog';
import { CompareDialog } from './components/Dialogs/CompareDialog';
import { ProjectDialog, ProjectDialogStateProps, fillProjectDialogProps, getEmptyProjectDialog } from './components/Dialogs/ProjectDialog';
import Projects from './Projects';
import { GameSettings, UserSettings } from './components/SelectGameSettings';
import { isProjectFullyFunded } from './Financing';


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
					isUsed: false,
					usedOnProjectId: Symbol('start'),
				},
				roundB: {
					isEarned: false,
					isUsed: false,
					usedOnProjectId: Symbol('start'),
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
				naturalGasUse: 4_000,
				electricityUse: 4_000_000,
				hydrogenUse: 2_000,
				financingStartYear: 3,
				energyCarryoverYears: 0,
				allowBudgetCarryover: 'no',
				financingOptions: {
					xaas: false,
					greenBond: false,
					loan: false
				}
			},
			defaultTrackedStats : { ...initialTrackedStats }
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
		} 
		else {
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
		let infoDialog: InfoDialogStateProps = getEmptyInfoDialogState();
		infoDialog = fillInfoDialogProps(props);
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
	displayProjectDialog(props: InfoDialogControlProps) {
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
		this.checkHasImplementedAllScopes();
		this.setPage(Pages.yearRecap);
	}

	checkHasImplementedAllScopes() {
		let someScope1 = Scope1Projects.some((page) => this.state.implementedProjectsIds.includes(page));
		let someScope2 = Scope2Projects.some((page) => this.state.implementedProjectsIds.includes(page));

		if (!someScope1 || !someScope2) {
			let warningDialogProps: InfoDialogControlProps = {
				title: 'Hold up!',
				text: '',
				buttons: [
					closeDialogButton(),
					{
						text: 'Proceed anyway',
						variant: 'text',
						endIcon: rightArrow(),
						onClick: () => {
							return Pages.yearRecap;
						}
					}
				],
				allowClose: true,
			};

			if (!someScope1) {
				warningDialogProps.text = 'You haven\'t selected any Scope 1 projects for this year. Do you want to go {BACK} and look at some of the possible Scope 1 projects?';
				this.displayDialog(warningDialogProps);
			}
			else if (!someScope2) {
				warningDialogProps.text = 'You haven\'t selected any Scope 2 projects for this year. Do you want to go {BACK} and look at some of the possible Scope 2 projects?';
				this.displayDialog(warningDialogProps);
			}
			return;
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
		let previousYear: number = this.state.trackedStats.currentGameYear > 1 ? this.state.trackedStats.currentGameYear - 1 : 0;
		previousYear--;
		let updatedCompletedProjects: CompletedProject[] = completedProjects.filter(project => project.completedYear !== previousYear);
		let previousimplementedProjectsIds: symbol[] = completedProjects.filter(project => project.completedYear === previousYear).map(previousYearProject => previousYearProject.page);
		
		let yearRangeInitialStats = [...this.state.yearRangeInitialStats];
		yearRangeInitialStats.pop();
		let previousYearStats: TrackedStats = yearRangeInitialStats[yearRangeInitialStats[previousYear].currentGameYear - 1];
		let newTrackedStats: TrackedStats = yearRangeInitialStats[previousYear];
		if (previousYearStats) {
			// * Only modify stats for display. YearRecap will handle yearRangeInitialStats updates
			let statsForResultDisplay = { ...previousYearStats };

			let implementedProjects: ImplementedProject[] = [...this.state.implementedFinancedProjects];
			previousimplementedProjectsIds.forEach((projectSymbol, index) => {
				let project = Projects[projectSymbol];
				project.applyStatChanges(statsForResultDisplay, implementedProjects[index].financingOption);
			});

			// started renewable projects
			renewableProjects.forEach(project => {
				if (project.yearStarted === previousYear) {
					let Project = Projects[project.page];
					Project.applyStatChanges(statsForResultDisplay, project.financingOption);
				}
			});
			newTrackedStats = setCarbonEmissionsAndSavings(statsForResultDisplay, this.state.defaultTrackedStats); 
			updateStatsGaugeMaxValues(newTrackedStats);
		}

		let onBackState = {
			completedProjects: updatedCompletedProjects,
			implementedProjectsIds: previousimplementedProjectsIds,
			trackedStats: newTrackedStats,
			yearRangeInitialStats: yearRangeInitialStats,
		};
		this.setState(onBackState);
	}

	/**
	 * Start new year/budget period
	 */
	setupNewYearOnProceed(currentYearStats: TrackedStats, capitalFundingState: CapitalFundingState) {
		let thisYearStart: TrackedStats = this.state.yearRangeInitialStats[currentYearStats.currentGameYear - 1];
		let implementedProjectsIds: symbol[] = [...this.state.implementedProjectsIds];
		let implementedFinancedProjects: ImplementedProject[] = [...this.state.implementedFinancedProjects];
		let implementedRenewableProjects: RenewableProject[] = [...this.state.implementedRenewableProjects];
		let newCapitalFundingState: CapitalFundingState = {...capitalFundingState}
		let newCompletedProjects: CompletedProject[] = [...this.state.completedProjects];

		// * has accurate RenewableProjects savings only in first year of implementation
		let yearCostSavings: YearCostSavings = getYearCostSavings(thisYearStart, currentYearStats);
		let newBudget: number = this.state.gameSettings.budget + currentYearStats.financesAvailable + yearCostSavings.electricity + yearCostSavings.naturalGas;
		console.log('settings budget', this.state.gameSettings.budget);
		console.log('finances available', currentYearStats.financesAvailable);
		console.log('yearCostSavings.electricity', yearCostSavings.electricity);
		console.log('yearCostSavings.naturalGas', yearCostSavings.naturalGas);
		let newYearTrackedStats: TrackedStats = { ...currentYearStats };
		newYearTrackedStats.yearBudget = newBudget;
		newYearTrackedStats.financesAvailable = newBudget;
		newYearTrackedStats.implementationSpending = 0;
		newYearTrackedStats.hiddenSpending = 0;
		newYearTrackedStats.currentGameYear = currentYearStats.currentGameYear + 1;
		newYearTrackedStats.gameYearDisplayOffset = currentYearStats.gameYearDisplayOffset + 2;
		
		// todo 143 why? instead of unapply get default value? create new single time applier? are we unapplying after year recap so it still shows in yearrecap?
		implementedProjectsIds.forEach((projectSymbol, index) => {
			if (Projects[projectSymbol].hasSingleYearStatAppliers) {
				Projects[projectSymbol].unApplyStatChanges(newYearTrackedStats, implementedFinancedProjects[index].financingOption, false);
			}
		});

		this.checkFinancedProjectsComplete(implementedFinancedProjects, newYearTrackedStats);
		newYearTrackedStats = setCarbonEmissionsAndSavings(newYearTrackedStats, this.state.defaultTrackedStats); 
		this.checkFinancedRenewablesComplete(implementedRenewableProjects, newYearTrackedStats);

		implementedProjectsIds.forEach((id, index) => {
			// We are checking existing in array instead of project.isRenewable in case it has NOT been renewed. For tracking previous/forward year movement
			if (!implementedRenewableProjects.some(project => project.page === id)) {
				const financingIndex = implementedFinancedProjects.findIndex(project => project.page === id);
				newCompletedProjects.push({ 
					completedYear: currentYearStats.currentGameYear, 
					gameYearsImplemented: [currentYearStats.currentGameYear],
					page: id,
					financingOption: implementedFinancedProjects[financingIndex]? implementedFinancedProjects[financingIndex].financingOption : undefined
				});
			}
		});
		
		let newYearRangeInitialStats = [...this.state.yearRangeInitialStats, { ...newYearTrackedStats }];
		console.log('new year range initial stats', newYearRangeInitialStats);
		console.log('new year financesAvailable', newYearTrackedStats.financesAvailable);
		const completedYears = this.state.completedYears < this.state.trackedStats.currentGameYear? this.state.completedYears + 1 : this.state.completedYears; 
		this.setState({
			completedProjects: newCompletedProjects,
			completedYears: completedYears,
			implementedProjectsIds: [],
			implementedRenewableProjects: implementedRenewableProjects,
			implementedFinancedProjects: implementedFinancedProjects,
			selectedProjectsForComparison: [],
			trackedStats: newYearTrackedStats,
			yearRangeInitialStats: newYearRangeInitialStats,
			capitalFundingState: newCapitalFundingState
		});

		if (newYearTrackedStats.carbonSavingsPercent >= 0.5) {
			this.setPage(Pages.winScreen);
		} else if (newYearTrackedStats.currentGameYear === this.state.gameSettings.totalGameYears + 1) {
			this.setPage(Pages.loseScreen);
		} else {
			this.setPage(Pages.scope1Projects);
		}

	}

	checkFinancedProjectsComplete(financedProjects: ImplementedProject[], newYearTrackedStats: TrackedStats) {
		let completedFinancedIndicies = [];
		financedProjects.forEach((project: ImplementedProject, index) => {
			if (isProjectFullyFunded(project, newYearTrackedStats.currentGameYear)) {
				completedFinancedIndicies.push(index);
			} else {
				Projects[project.page].applyCost(newYearTrackedStats, project.financingOption);
				project.gameYearsImplemented.push(newYearTrackedStats.currentGameYear);
			}
		});

		completedFinancedIndicies.forEach(completed => {
			financedProjects.splice(completed, 1);
		});
	}

	checkFinancedRenewablesComplete(financedRenewables: RenewableProject[], newYearTrackedStats: TrackedStats) {
		financedRenewables.map(project => {
			if (!isProjectFullyFunded(project, newYearTrackedStats.currentGameYear)) {
				Projects[project.page].applyCost(newYearTrackedStats, project.financingOption);
			}
			project.gameYearsImplemented.push(newYearTrackedStats.currentGameYear);
			return project;
		});
	}

	handleGameSettingsOnProceed(userSettings: UserSettings){
		let updatingInitialTrackedStats: TrackedStats = {...initialTrackedStats};
		let budget = 75_000;
		let naturalGas = 120_000;
		let hydrogen = 6_000;
		let electricity = 30_000_000;
		let totalGameYears = 10;

		if(userSettings.gameYearInterval == 2) {
			budget = 150_000;
			naturalGas = 240_000;
			electricity = 60_000_000;
			hydrogen = 120_000;
			totalGameYears = 5
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


		return (
			<>
				<ThemeProvider theme={theme}>
					<Container maxWidth='xl'>
						<Box className='row' sx={{ bgcolor: '#ffffff80', minHeight: '100vh' }}>
							{this.state.currentPage == Pages.yearRecap || this.state.showDashboard ?
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
									implementedProjectsIds={this.state.implementedProjectsIds} // note: if implementedProjectsIds is not passed into CurrentPage, then it will not update when the select buttons are clicked
									implementedRenewableProjects={this.state.implementedRenewableProjects} // note: if implementedProjectsIds is not passed into CurrentPage, then it will not update when the select buttons are clicked
									implementedFinancedProjects={this.state.implementedFinancedProjects} 
									availableProjectIds={this.state.availableProjectIds}
									selectedProjectsForComparison={this.state.selectedProjectsForComparison}
									completedProjects={this.state.completedProjects}
									handleClearProjectsClick={() => this.handleClearSelectedProjects}
									handleCompareProjectsClick={() => this.handleCompareDialogDisplay(true)}
									yearRangeInitialStats={this.state.yearRangeInitialStats}
									handleGameSettingsOnProceed={(userSettings) => this.handleGameSettingsOnProceed(userSettings)}
									handleNewYearSetupOnProceed={(yearFinalStats, capitalFundingState) => this.setupNewYearOnProceed(yearFinalStats, capitalFundingState)}
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
							onClose={() => this.handleDialogClose()}
						/>
						<CompareDialog
							{...this.state.infoDialog}
							{...controlCallbacks}
							isOpen={this.state.isCompareDialogOpen}
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
			</>
		);
	}
}

export default App;
