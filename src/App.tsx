import React from 'react';
import { Container, Box, ThemeProvider, Snackbar, Typography, Button, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { PageControlProps, ControlCallbacks } from './components/controls';
import { StartPage } from './components/StartPage';
import type { TrackedStats} from './trackedStats';
import { updateStatsGaugeMaxValues } from './trackedStats';
import { calculateYearSavings } from './trackedStats';
import { calculateAutoStats } from './trackedStats';
import { initialTrackedStats } from './trackedStats';
import { Dashboard } from './components/Dashboard';
import Pages, { PageError } from './Pages';
import { PageControls } from './PageControls';
import { Scope1Projects, Scope2Projects } from './Projects';
import type {CompletedProject} from './Projects';
import { resolveToValue, PureComponentIgnoreFuncs, cloneAndModify, rightArrow } from './functions-and-types';
import { theme } from './components/theme';
import { GroupedChoices } from './components/GroupedChoices';
import type { DialogControlProps, DialogStateProps} from './components/InfoDialog';
import { fillDialogProps, InfoDialog } from './components/InfoDialog';
import { closeDialogButton } from './components/Buttons';
import { YearRecap } from './components/YearRecap';

export type AppState = {
	currentPage: symbol;
	currentOnBack?: PageCallback; // onBack handler of current page
	companyName: string;
	dialog: DialogStateProps,
	currentPageProps?: AnyDict; // todo
	componentClass?: Component;
	trackedStats: TrackedStats;
	yearlyTrackedStats: TrackedStats[]; // to be pushed at the end of each year; does not change
	showDashboard: boolean;
	selectedProjects: symbol[];
	completedProjects: CompletedProject[];
	lastScrollY: number;
	snackbarOpen: boolean;
	snackbarContent?: JSX.Element;
}

// JL note: I could try and do some fancy TS magic to make all the AppState whatsits optional, but
// 	realized that this is a much easier solution. TODO document

export interface NextAppState {
	currentPage?: symbol;
	currentOnBack?: PageCallback;
	companyName?: string;
	dialog?: DialogStateProps,
	currentPageProps?: AnyDict;
	componentClass?: Component;
	trackedStats?: TrackedStats;
	showDashboard?: boolean;
	selectedProjects?: symbol[];
	completedProjects?: CompletedProject[];
	snackbarOpen?: boolean;
	snackbarContent?: JSX.Element;
}

interface CurrentPageProps extends ControlCallbacks, PageControlProps { 
	selectedProjects: symbol[];
	completedProjects: CompletedProject[];
	trackedStats: TrackedStats;
	yearlyTrackedStats: TrackedStats[];
	handleYearRecapOnProceed: (yearFinalStats: TrackedStats) => void;
}

class CurrentPage extends PureComponentIgnoreFuncs <CurrentPageProps> {
	render() {
		
		const controlCallbacks = {
			doPageCallback: this.props.doPageCallback,
			summonInfoDialog: this.props.summonInfoDialog,
			resolveToValue: this.props.resolveToValue,
		};
		
		switch (this.props.componentClass) {
			case StartPage:
			case GroupedChoices:
				if (!this.props.controlProps) throw new Error('currentPageProps not defined'); 
				return (<this.props.componentClass
					{...this.props.controlProps} // Pass everything into the child
					{...controlCallbacks}
				/>);
			case YearRecap:
				return <YearRecap
					{...this.props.trackedStats}
					{...controlCallbacks}
					selectedProjects={this.props.selectedProjects}
					completedProjects={this.props.completedProjects}
					yearlyTrackedStats={this.props.yearlyTrackedStats}
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
export class App extends React.PureComponent <unknown, AppState> {
	constructor(props: unknown) { 
		super(props);
		
		let startPage = Pages.start; let showDashboardAtStart = false;
		// startPage = Pages.selectScope; showDashboardAtStart = true; // temporary, for debugging
		// startPage = Pages.yearRecap; showDashboardAtStart = false; // also temporary
		
		// For info on state, see https://reactjs.org/docs/state-and-lifecycle.html
		this.state = {
			currentPage: startPage,
			companyName: 'Auto-Man, Inc.',
			dialog: {
				open: false,
				title: '',
				text: '',
				cardText: undefined
			},
			currentPageProps: PageControls[startPage].controlProps,
			componentClass: PageControls[startPage].componentClass,
			trackedStats: {...initialTrackedStats},
			yearlyTrackedStats: [
				{...initialTrackedStats} // This one stays constant
			],
			showDashboard: showDashboardAtStart,
			selectedProjects: [],
			// selectedProjects: [Pages.wasteHeatRecovery, Pages.digitalTwinAnalysis, Pages.solarPanelsCarPort, ], // temporary, for debugging
			completedProjects: [],
			lastScrollY: -1,
			snackbarOpen: false,
		};
		
		// @ts-ignore - for debugging
		window.app = this; window.Pages = Pages; window.PageControls = PageControls;
		
		// window.onbeforeunload = () => 'Are you sure you want to exit?'; TODO enable later
		
		// todo
		// addEventListener('popstate', this.handleHistoryPopState.bind(this));
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
			dialog = cloneAndModify(this.state.dialog, {open: false});
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
			this.setState({showDashboard: !hideDashboard});
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
		}
		else if (typeof callbackOrPage === 'function') {
			// Mutable params to update
			let newStateParams: Pick<AppState, never> = {};
			nextPage = resolveToValue(callbackOrPage, undefined, [this.state, newStateParams], this);
			
			if (newStateParams['trackedStats']) {
				let newTrackedStats = calculateAutoStats(newStateParams['trackedStats']);
				newStateParams['trackedStats'] = newTrackedStats;
				// Sanity check!
				if (newTrackedStats.financesAvailable + newTrackedStats.moneySpent !== newTrackedStats.totalBudget) {
					console.error(`Error with finances sanity check! financesAvailable=${newTrackedStats.financesAvailable}, moneySpent=${newTrackedStats.moneySpent} totalBudget=${newTrackedStats.totalBudget}`);
				}
				// Update max values for gauges in case they increased
				updateStatsGaugeMaxValues(newTrackedStats);
			}
			
			this.setState(newStateParams);
		}
		else return;
		
		this.setPage(nextPage);
	}
	
	// todo
	handleHistoryPopState() {
		// console.log(event);
		// if (!event.state) return;
		
		// let lastPage: symbol = Symbol.for(event.state.page);
		// if (!lastPage) return console.log('lastpage');
		
		// let lastPageControl = pageControls[lastPage];
		// this.setPage(resolveToValue(lastPageControl.onBack));
	}
	
	/**
	 * Summon an info dialog with the specified dialog props. Does not change the current page.
	 */
	summonInfoDialog(props: DialogControlProps) {
		let dialog = fillDialogProps(props);
		dialog.open = true;
		setTimeout(() => {
			this.setState({dialog});
			this.saveScrollY();
		}, 50);
	}
	
	summonSnackbar(content: JSX.Element) {
		this.setState({
			snackbarOpen: true,
			snackbarContent: content,
		});
	}
	
	/**
	 * Close the dialog.
	 */
	handleDialogClose() {
		let dialog = cloneAndModify(this.state.dialog, {open: false});
		this.setState({dialog});
	}
	
	/**
	 * Resolve an item of an unknown type to a value, binding the App object & providing the current state.
	 * 	setState / nextState is not available in this function.
	 * @param item Item to resolve.
	 */
	resolveToValue(item: unknown, whenUndefined?: unknown) {
		return resolveToValue(item, whenUndefined, [this.state], this);
	}
	
	componentDidUpdate() {
		// On a thin screen, user has to scroll down in the project selection page. It can be very annoying if 
		// 	the window scroll resets every time a dialog pops up. This will scroll the page back down when the dialog closes.
		scrollTo(0, this.state.lastScrollY);
	}

	handleDashboardOnRestart() {
		location.href = String(location.href);
		this.setPage(Pages.start);
	}
	
	handleDashboardOnProceed() {
		let someScope1 = Scope1Projects.some((page) => this.state.selectedProjects.includes(page));
		let someScope2 = Scope2Projects.some((page) => this.state.selectedProjects.includes(page));
		
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
		// * set default back page
		let nextPage: symbol = Pages.selectScope;
		if (this.state.currentPage == Pages.selectScope) {
			let year: number = this.state.trackedStats.year;
			if (year == 1) {
				nextPage = Pages.start;
			}
			else {
				// * remove last completed project && reset selected projects
				const previousYear: number = this.state.trackedStats.year > 1 ? this.state.trackedStats.year - 1 : 0;
				let yearlyTrackedStats = [...this.state.yearlyTrackedStats];
				let completedProjects: CompletedProject[] = [...this.state.completedProjects];
				
				let updatedCompletedProjects: CompletedProject[] = completedProjects.filter(project => project.selectedYear !== previousYear);
				let previousSelectedProjects: symbol[] = completedProjects.filter(project => project.selectedYear === previousYear).map(previousYearProject => previousYearProject.page);

				let previousYearlyTrackedStats: TrackedStats = yearlyTrackedStats[previousYear - 1];
				yearlyTrackedStats.pop();
				
				this.setState({
					completedProjects: updatedCompletedProjects,
					selectedProjects: previousSelectedProjects,
					trackedStats: previousYearlyTrackedStats,
					yearlyTrackedStats: yearlyTrackedStats,
				});
			}
		}

		this.setPage(nextPage);
	}
	
	/**
	 * Proceed to the next year.\
	 * JL note: I know it's spaghetti.... but i only had a few hours to add the hidden surprise stuff
	 * @param yearFinalStats The final stats for the year, including calculated hidden surprises.
	 */
	handleYearRecapOnProceed(yearFinalStats: TrackedStats) {
		let thisYearStart: TrackedStats = this.state.yearlyTrackedStats[yearFinalStats.year - 1];
		if (!thisYearStart) throw new TypeError(`thisYearStart not defined - year=${yearFinalStats.year}`);

		// Add this year's savings to the budget, INCLUDING unused budget from last year
		let savings: { naturalGas: number; electricity: number; } = calculateYearSavings(thisYearStart, yearFinalStats);
		let newBudget: number = 75_000 + yearFinalStats.financesAvailable + savings.electricity + savings.naturalGas;
		// New tracked stats -- Clear or reset or modify stats as necessary for a new fiscal year
		let newTrackedStats: TrackedStats = { ...yearFinalStats };
		newTrackedStats.totalBudget = newBudget;
		newTrackedStats.financesAvailable = newBudget;
		newTrackedStats.totalMoneySpent += newTrackedStats.moneySpent;
		newTrackedStats.moneySpent = 0;
		newTrackedStats.year = yearFinalStats.year + 1;

		// Move selectedProjects into completedProjects
		let newCompletedProjects: CompletedProject[] = [...this.state.completedProjects];
		let selectedProjects: symbol[] = [...this.state.selectedProjects];
		selectedProjects.forEach(selected => newCompletedProjects.push({ selectedYear: yearFinalStats.year, page: selected }));
		// Update yearlyTrackedStats
		let newYearlyTrackedStats = [...this.state.yearlyTrackedStats, { ...newTrackedStats }];
		newYearlyTrackedStats[yearFinalStats.year - 1] = yearFinalStats;

		this.setState({
			completedProjects: newCompletedProjects,
			selectedProjects: [],
			trackedStats: newTrackedStats,
			yearlyTrackedStats: newYearlyTrackedStats,
		});

		// Endgame
		if (newTrackedStats.year === 10) {
			// Win
			if (newTrackedStats.carbonSavings >= 0.5) {
				this.setPage(Pages.winScreen);
			}
			// Lose
			else {
				this.setPage(Pages.loseScreen);
			}
		}
		else {
			this.setPage(Pages.selectScope);
		}
	}
	
	render() {
		
		// Standard callbacks to spread to each control.
		const controlCallbacks = {
			doPageCallback: (callback) => this.handlePageCallback(callback),
			summonInfoDialog: (props) => this.summonInfoDialog(props),
			resolveToValue: (item, whenUndefined?) => this.resolveToValue(item, whenUndefined),
		};
		
		return (
			<>
				<ThemeProvider theme={theme}>
					<Container maxWidth='xl'>
						<Box className='row' sx={{ bgcolor: '#ffffff80', minHeight: '100vh' }}>
							{this.state.currentPage == Pages.yearRecap || this.state.showDashboard ?
								<Typography variant='h3'>
									Choose Your Own Solution
								</Typography> 
							: <></>}
							{this.state.currentPage == Pages.yearRecap || this.state.showDashboard ?
								<Button
									size='small'
									variant='contained'
									onClick={this.handleDashboardOnRestart}
									style={{ margin: '10px' }}>
									New Game
								</Button>
							: <></>}
							{this.state.showDashboard ? 
								<Dashboard 
									{...this.state.trackedStats} 
									{...controlCallbacks} 
									onBack={() => this.handleDashboardOnBack()} 
									onProceed={() => this.handleDashboardOnProceed()}
									btnProceedDisabled={this.state.componentClass === YearRecap}
								/> 
							: <></>}
							{(this.state.currentPageProps && this.state.componentClass) ?
								<CurrentPage
									{...controlCallbacks}
									trackedStats={this.state.trackedStats}
									componentClass={this.state.componentClass}
									controlProps={this.state.currentPageProps}
									selectedProjects={this.state.selectedProjects} // note: if selectedProjects is not passed into CurrentPage, then it will not update when the select buttons are clicked
									completedProjects={this.state.completedProjects}									
									yearlyTrackedStats={this.state.yearlyTrackedStats}
									handleYearRecapOnProceed={(yearFinalStats) => this.handleYearRecapOnProceed(yearFinalStats)}
								/>
							: <></>}
						</Box>
						{/* InfoDialog is always "mounted" so MUI can smoothly animate its opacity */}
						<InfoDialog
							{...this.state.dialog}
							{...controlCallbacks}
							onClose={() => this.handleDialogClose()}
						/>
						<Snackbar 
							open={this.state.snackbarOpen}
							autoHideDuration={6000}
							onClose={() => {
								this.setState({snackbarOpen: false});
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
