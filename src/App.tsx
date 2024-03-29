import React from 'react';
import { Container, Box, ThemeProvider, Snackbar, Typography, Button, AppBar, IconButton, Toolbar, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { PageControlProps, ControlCallbacks } from './components/controls';
import { StartPage } from './components/StartPage';
import type { StartPageProps } from './components/StartPage';
import { calculateEmissions } from './trackedStats';
import type { TrackedStats } from './trackedStats';
import { updateStatsGaugeMaxValues } from './trackedStats';
import { calculateYearSavings } from './trackedStats';
import { initialTrackedStats, setCarbonEmissionsAndSavings } from './trackedStats';
import { Dashboard } from './components/Dashboard';
import Pages, { PageError } from './Pages';
import { PageControls } from './PageControls';
import Projects, { Scope1Projects, Scope2Projects } from './Projects';
import type { RenewalProject} from './Projects';
import type { CompletedProject, SelectedProject, GameSettings} from './Projects';
import { resolveToValue, PureComponentIgnoreFuncs, cloneAndModify, rightArrow } from './functions-and-types';
import { theme } from './components/theme';
import { GroupedChoices } from './components/GroupedChoices';
import type { GroupedChoicesProps } from './components/GroupedChoices';
import type { DialogControlProps, DialogStateProps } from './components/InfoDialog';
import { fillDialogProps, InfoDialog } from './components/InfoDialog';
import { closeDialogButton } from './components/Buttons';
import { YearRecap } from './components/YearRecap';
import { CompareDialog } from './components/CompareDialog';
import { SelectGameSettings } from './components/SelectGameSettings';
import ScopeTabs from './components/ScopeTabs';

export type AppState = {
	currentPage: symbol;
	currentOnBack?: PageCallback; // onBack handler of current page
	companyName: string;
	dialog: DialogStateProps,
	currentPageProps?: AnyDict; // todo
	componentClass?: Component;
	/**
	 * Year / years
	 */
	completedYears: number,
	trackedStats: TrackedStats;
	// * initial stats for each year range. Currently looks like the first year never changes, though
	// * subsequent years are modified by any projects/stats applied. Each new yearRange is added at YearRecap
	yearRangeInitialStats: TrackedStats[];
	showDashboard: boolean;
	// * Projects that have been selected to implement
	implementedProjects: symbol[];
	// * Projects selected to implement whose cost is reapplied each year (savings applied once), and are automatically selected until unselected
	projectsRequireRenewal: RenewalProject[];
	allowImplementProjects: symbol[];
	// * Implemented/selected projects from the previous year
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
	dialog?: DialogStateProps,
	currentPageProps?: AnyDict;
	componentClass?: Component;
	trackedStats?: TrackedStats;
	showDashboard?: boolean;
	implementedProjects?: symbol[];
	completedProjects?: CompletedProject[];
	allowImplementProjects?: symbol[];
	projectsRequireRenewal?: RenewalProject[];
	selectedProjectsForComparison: SelectedProject[];
	yearRangeInitialStats?: TrackedStats[];
	snackbarOpen?: boolean;
	snackbarContent?: JSX.Element;
	isCompareDialogOpen?: boolean;
}

interface CurrentPageProps extends ControlCallbacks, PageControlProps {
	implementedProjects: symbol[];
	projectsRequireRenewal: RenewalProject[];
	allowImplementProjects: symbol[];
	selectedProjectsForComparison: SelectedProject[];
	completedProjects: CompletedProject[];
	trackedStats: TrackedStats;
	handleCompareProjectsClick: () => void;
	handleClearProjectsClick: () => void;
	yearRangeInitialStats: TrackedStats[];
	gameSettings: GameSettings;	
	defaultTrackedStats :TrackedStats;
	handleYearRecapOnProceed: (yearFinalStats: TrackedStats) => void;
	handleGameSettingsOnProceed: (totalYearIterations: number) => void;
}

class CurrentPage extends PureComponentIgnoreFuncs<CurrentPageProps> {
	render() {
		const controlCallbacks: ControlCallbacks = {
			doPageCallback: this.props.doPageCallback,
			doAppStateCallback: this.props.doAppStateCallback,
			summonInfoDialog: this.props.summonInfoDialog,
			resolveToValue: this.props.resolveToValue,
		};

		switch (this.props.componentClass) {
			case StartPage: {
				const startPageProps = {
					...this.props.controlProps,
					...controlCallbacks
				} as StartPageProps;

				return <StartPage
					{...startPageProps}
				/>;
			}
			case SelectGameSettings:
				return <SelectGameSettings
					{...this.props.gameSettings}
					{...controlCallbacks}
					onProceed={this.props.handleGameSettingsOnProceed}
                />;
			case GroupedChoices: {
				const groupedChoicesControlProps = {
					...this.props.controlProps,
					...controlCallbacks,
				} as GroupedChoicesProps;
				
				return <GroupedChoices
				{...groupedChoicesControlProps}
				handleCompareProjectsClick={this.props.handleCompareProjectsClick}
				handleClearProjectsClick={this.props.handleClearProjectsClick}
				selectedProjectsForComparison={this.props.selectedProjectsForComparison}
				/>;
			}
			case YearRecap:
				return <YearRecap
					{...this.props.trackedStats}
					{...controlCallbacks}
					{...this.props.gameSettings}					
					defaultTrackedStats ={this.props.defaultTrackedStats }
					implementedProjects={this.props.implementedProjects}
					projectsRequireRenewal={this.props.projectsRequireRenewal}
					completedProjects={this.props.completedProjects}
					yearRangeInitialStats={this.props.yearRangeInitialStats}
					handleYearRecap={this.props.handleYearRecapOnProceed}
				/>;
			default:
				return <></>;
		}
	}
}

/**
 * Main application.
 */
export class App extends React.PureComponent<unknown, AppState> {
	constructor(props: unknown) {
		super(props);

		this.state = this.getInitialAppState()
		// @ts-ignore - for debugging 
		window.app = this; window.Pages = Pages; window.PageControls = PageControls;
	}

	getInitialAppState() {
		let startPage = Pages.start; 
		let showDashboardAtStart = false;
		return {
			currentPage: startPage,
			companyName: 'Auto-Man, Inc.',
			dialog: {
				open: false,
				title: '',
				text: '',
				cardText: undefined
			},
			completedYears: 0,
			currentPageProps: PageControls[startPage].controlProps,
			componentClass: PageControls[startPage].componentClass,
			trackedStats: { ...initialTrackedStats },
			yearRangeInitialStats: [
				{ ...initialTrackedStats } // This one stays constant
			],
			showDashboard: showDashboardAtStart,
			implementedProjects: [],
			projectsRequireRenewal: [],
			allowImplementProjects: [],
			selectedProjectsForComparison: [],
			completedProjects: [],
			lastScrollY: -1,
			snackbarOpen: false,
			isCompareDialogOpen: false,
			gameSettings: {
				totalIterations: 10,
				budget: 150_000,
				naturalGasUse: 4_000,
				electricityUse: 4_000_000,
			},
			defaultTrackedStats : { ...initialTrackedStats }
		};
	}

	getThisPageControl() {
		let thisPageControl = PageControls[this.state.currentPage];
		if (!thisPageControl)
			throw new PageError(`Page controls not defined for the symbol ${this.state.currentPage.description}`);
		return thisPageControl;
	}

	setPage(page: symbol) {
		let thisPageControl = PageControls[page];
		if (!thisPageControl)
			throw new PageError(`Page controls not defined for the symbol ${page.description}`);

		let componentClass = thisPageControl.componentClass;
		let controlProps = thisPageControl.controlProps;
		let controlOnBack = thisPageControl.onBack;
		let hideDashboard = thisPageControl.hideDashboard;

		let dialog, currentPageProps;

		if (componentClass === InfoDialog) {
			dialog = fillDialogProps(controlProps);
			dialog.open = true;
		}
		// this happens, for example, when you do app.setPage(app.state.currentPage) after an info dialog 
		//	has been summoned via summonInfoDialog
		else {
			dialog = cloneAndModify(this.state.dialog, { open: false });
			currentPageProps = controlProps;
		}

		this.setState({
			currentPage: page,
			dialog,
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
	 * Hnalde state changes without setting page (i.e. when in dialog avoid closing dialog)
	 */
	handleAppStateCallback(appStateCallback?: AppStateCallback) {
		let currentPage;
		let newStateParams: Pick<AppState, never> = {};
		currentPage = resolveToValue(appStateCallback, undefined, [this.state, newStateParams], this);
		// Only setState on specific properties for now
		if (newStateParams['allowImplementProjects']) {
			this.setState(newStateParams);
		}
	}

	/**
	 * Summon an info dialog with the specified dialog props. Does not change the current page.
	 */
	summonInfoDialog(props: DialogControlProps) {
		let dialog = fillDialogProps(props);
		dialog.open = true;
		setTimeout(() => {
			this.setState({ dialog });
			this.saveScrollY();
		}, 50);
	}

	/**
	 * Close the dialog.
	 */
	handleDialogClose() {
		let dialog = cloneAndModify(this.state.dialog, {open: false});
		this.setState({dialog});
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
		// Ignore scroll height reset after dialog close
		const isDialogStateClosedEvent = (prevState.dialog.open && !this.state.dialog.open) ||  (prevState.isCompareDialogOpen && !this.state.isCompareDialogOpen);
		if (isDialogStateClosedEvent) {
			scrollTo(0, this.state.lastScrollY);
		}
	}

	handleDashboardOnRestart() {
		location.href = String(location.href);
		this.setPage(Pages.start);
	}

	handleDashboardOnProceed() {
		let someScope1 = Scope1Projects.some((page) => this.state.implementedProjects.includes(page));
		let someScope2 = Scope2Projects.some((page) => this.state.implementedProjects.includes(page));

		// Show warning if user hasn't tried both scopes
		if (!someScope1 || !someScope2) {
			let warningDialogProps: DialogControlProps = {
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
				this.summonInfoDialog(warningDialogProps);
			}
			else if (!someScope2) {
				warningDialogProps.text = 'You haven\'t selected any Scope 2 projects for this year. Do you want to go {BACK} and look at some of the possible Scope 2 projects?';
				this.summonInfoDialog(warningDialogProps);
			}
			return;
		}

		// Proceed to recap
		this.setPage(Pages.yearRecap);
	}

	handleDashboardOnBack() {
		// * default back page
		let nextPage: symbol = this.state.currentPage;
		if (this.state.currentPage == Pages.scope1Projects || this.state.currentPage == Pages.scope2Projects ) {
			let year: number = this.state.trackedStats.year;
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
		if (this.state.trackedStats.year === 1) {
			return false;
		}
		return this.state.completedYears === this.state.trackedStats.year;
	}
	

	/**
	 * Update state from previous selections and results when navigating back
	 * Only updates current stats ('trackedStats'), not those in yearRangeInitialStats
	 */
	setPreviousAppState() {
		let previousYear: number = this.state.trackedStats.year > 1 ? this.state.trackedStats.year - 1 : 0;
		let yearRangeInitialStats = [...this.state.yearRangeInitialStats];
		let completedProjects: CompletedProject[] = [...this.state.completedProjects];
		let renewalProjects: RenewalProject[] = [...this.state.projectsRequireRenewal];
		let updatedCompletedProjects: CompletedProject[] = completedProjects.filter(project => project.selectedYear !== previousYear);
		let previousimplementedProjects: symbol[] = completedProjects.filter(project => project.selectedYear === previousYear).map(previousYearProject => previousYearProject.page);
		let startedRenewalProjects: symbol[] = renewalProjects.filter(project => project.yearStarted === previousYear).map(renewalProject => renewalProject.page);

		yearRangeInitialStats.pop();
		previousYear--;
		let previousYearStats: TrackedStats = yearRangeInitialStats[yearRangeInitialStats[previousYear].year - 1];
		let newTrackedStats: TrackedStats = yearRangeInitialStats[previousYear];
		if (previousYearStats) {
			// * Only modify stats for display. YearRecap will handle yearRangeInitialStats updates
			let statsForResultDisplay = { ...previousYearStats };
			let implementedProjects = [...previousimplementedProjects];
			startedRenewalProjects = [...startedRenewalProjects];
			implementedProjects.forEach(projectSymbol => {
				let project = Projects[projectSymbol];
				project.applyStatChanges(statsForResultDisplay);
			});

			// Renewal projects need to be applied again if we're going back to the year they were started
			startedRenewalProjects.forEach(projectSymbol => {
				let project = Projects[projectSymbol];
				project.applyStatChanges(statsForResultDisplay);
			});
			newTrackedStats = setCarbonEmissionsAndSavings(statsForResultDisplay, this.state.defaultTrackedStats); 
			updateStatsGaugeMaxValues(newTrackedStats);
		}

		let onBackState = {
			completedProjects: updatedCompletedProjects,
			implementedProjects: previousimplementedProjects,
			trackedStats: newTrackedStats,
			yearRangeInitialStats: yearRangeInitialStats,
		};
		this.setState(onBackState);
	}

	handleYearRecapOnProceed(currentYearStats: TrackedStats) {
		let thisYearStart: TrackedStats = this.state.yearRangeInitialStats[currentYearStats.year - 1];
		if (!thisYearStart) throw new TypeError(`thisYearStart not defined - year=${currentYearStats.year}`);

		let implementedProjects: symbol[] = [...this.state.implementedProjects];
		let projectsRequireRenewal: RenewalProject[] = [...this.state.projectsRequireRenewal];

		// * has accurate renewalprojects savings only in first year of implementation
		let savings: { naturalGas: number; electricity: number; } = calculateYearSavings(thisYearStart, currentYearStats);
		let newBudget: number = this.state.gameSettings.budget + currentYearStats.financesAvailable + savings.electricity + savings.naturalGas;
		console.log('settings budget', this.state.gameSettings.budget);
		console.log('finances available', currentYearStats.financesAvailable);
		console.log('savings.electricity', savings.electricity);
		console.log('savings.naturalGas', savings.naturalGas);
		let newYearTrackedStats: TrackedStats = { ...currentYearStats };
		newYearTrackedStats.totalBudget = newBudget;
		newYearTrackedStats.financesAvailable = newBudget;
		newYearTrackedStats.moneySpent = 0;
		newYearTrackedStats.year = currentYearStats.year + 1;
		newYearTrackedStats.yearInterval = currentYearStats.yearInterval + 2;
		
		implementedProjects.forEach(projectSymbol => {
			if (Projects[projectSymbol].hasImplementationYearAppliers) {
				Projects[projectSymbol].unApplyStatChanges(newYearTrackedStats, false);
			}
		})
		console.log('new year financesAvailable', newYearTrackedStats.financesAvailable);
		
		
		newYearTrackedStats = setCarbonEmissionsAndSavings(newYearTrackedStats, this.state.defaultTrackedStats); 
		
		
		// * if project was renewed our current year, apply to next
		projectsRequireRenewal.map(project => {
			Projects[project.page].applyCost(newYearTrackedStats);
			project.yearsImplemented.push(newYearTrackedStats.year);
			return project;
		});


		let newCompletedProjects: CompletedProject[] = [...this.state.completedProjects];
		implementedProjects.forEach(implementedProjectSymbol => {
			if (!projectsRequireRenewal.some(project => project.page === implementedProjectSymbol)) {
				return newCompletedProjects.push({ selectedYear: currentYearStats.year, page: implementedProjectSymbol });
			}
		});
		
		let newYearRangeInitialStats = [...this.state.yearRangeInitialStats, { ...newYearTrackedStats }];
		console.log('new year range initial stats', newYearRangeInitialStats);
		console.log('new year financesAvailable', newYearTrackedStats.financesAvailable);
		const completedYears = this.state.completedYears < this.state.trackedStats.year? this.state.completedYears + 1 : this.state.completedYears; 
		this.setState({
			completedProjects: newCompletedProjects,
			completedYears: completedYears,
			implementedProjects: [],
			projectsRequireRenewal: projectsRequireRenewal,
			selectedProjectsForComparison: [],
			trackedStats: newYearTrackedStats,
			yearRangeInitialStats: newYearRangeInitialStats,
		});

		if (newYearTrackedStats.carbonSavingsPercent >= 0.5) {
			this.setPage(Pages.winScreen);
		} else if (newYearTrackedStats.year === this.state.gameSettings.totalIterations + 1) {
			this.setPage(Pages.loseScreen);
		} else {
			this.setPage(Pages.scope1Projects);
		}

	}

	handleGameSettingsOnProceed(totalYearIterations: number){
		let budget = 0;
		let naturalGas = 0;
		let electricity = 0;
		let gameYears = 1;
		if(totalYearIterations == 5) {
			budget = 150_000;
			naturalGas = 240_000;
			electricity = 60_000_000;
			gameYears = 2;
		}
		if ( totalYearIterations == 10) {
			budget = 75_000;
			naturalGas = 120_000;
			electricity = 30_000_000;
		}
		let updatingInitialTrackedStats: TrackedStats = {...initialTrackedStats};
		updatingInitialTrackedStats.totalBudget = budget;
		updatingInitialTrackedStats.financesAvailable = budget;
		updatingInitialTrackedStats.naturalGasMMBTU = naturalGas;
		updatingInitialTrackedStats.electricityUseKWh = electricity;
		updatingInitialTrackedStats.gameYears = gameYears;
		updatingInitialTrackedStats.carbonEmissions = calculateEmissions(updatingInitialTrackedStats);
		this.setState({
			trackedStats: updatingInitialTrackedStats,
			yearRangeInitialStats: [
				updatingInitialTrackedStats,
			],
			gameSettings: {
				totalIterations: totalYearIterations,
				budget: budget,
				naturalGasUse: naturalGas,
				electricityUse: electricity,
			},
			defaultTrackedStats : updatingInitialTrackedStats
		});
		updateStatsGaugeMaxValues(updatingInitialTrackedStats);
		this.setPage(Pages.scope1Projects);
	}
	
	

	render() {
		// Standard callbacks to spread to each control.
		const controlCallbacks: ControlCallbacks = {
			doPageCallback: (callback) => this.handlePageCallback(callback),
			doAppStateCallback: (callback) => this.handleAppStateCallback(callback),
			summonInfoDialog: (props) => this.summonInfoDialog(props),
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
													onClick={this.handleDashboardOnRestart}
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
									btnProceedDisabled={this.state.componentClass === YearRecap}
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
									componentClass={this.state.componentClass}
									controlProps={this.state.currentPageProps}
									defaultTrackedStats ={this.state.defaultTrackedStats }
									implementedProjects={this.state.implementedProjects} // note: if implementedProjects is not passed into CurrentPage, then it will not update when the select buttons are clicked
									projectsRequireRenewal={this.state.projectsRequireRenewal} // note: if implementedProjects is not passed into CurrentPage, then it will not update when the select buttons are clicked
									allowImplementProjects={this.state.allowImplementProjects}
									selectedProjectsForComparison={this.state.selectedProjectsForComparison}
									completedProjects={this.state.completedProjects}
									handleClearProjectsClick={() => this.handleClearSelectedProjects}
									handleCompareProjectsClick={() => this.handleCompareDialogDisplay(true)}
									// handleCompareProjectsClick={() => this.openCompareDialog}
									yearRangeInitialStats={this.state.yearRangeInitialStats}
									handleYearRecapOnProceed={(yearFinalStats) => this.handleYearRecapOnProceed(yearFinalStats)}
									handleGameSettingsOnProceed={(totalYearIterations) => this.handleGameSettingsOnProceed(totalYearIterations)}
								/>
								: <></>}
						</Box>
						{/* InfoDialog is always "mounted" so MUI can smoothly animate its opacity */}
						<InfoDialog
							{...this.state.dialog}
							{...controlCallbacks}
							onClose={() => this.handleDialogClose()}
						/>
						<CompareDialog
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
