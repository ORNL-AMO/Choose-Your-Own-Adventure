import React from 'react';
import { Container, Box, ThemeProvider, Snackbar, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import type { PageControl, ControlCallbacks } from './components/controls';
import { StartPage } from './components/controls';
import type { DashboardTrackedStats } from './components/Dashboard';
import { Dashboard } from './components/Dashboard';
import Pages from './pages';
import { pageControls, PageError } from './pageControls';
import { Scope1Projects, Scope2Projects } from './projects';
import { resolveToValue, PureComponentIgnoreFuncs, cloneAndModify, rightArrow } from './functions-and-types';
import { theme } from './components/theme';
import { GroupedChoices } from './components/GroupedChoices';
import type { DialogControlProps, DialogStateProps} from './components/InfoDialog';
import { fillDialogProps, InfoDialog } from './components/InfoDialog';
import { closeDialogButton } from './components/Buttons';

export interface AppState {
	currentPage: symbol;
	currentOnBack?: PageCallback; // onBack handler of current page
	companyName: string;
	dialog: DialogStateProps,
	currentPageProps?: AnyDict; // todo
	controlClass?: Component;
	trackedStats: DashboardTrackedStats;
	showDashboard: boolean;
	selectedProjects: symbol[];
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
	controlClass?: Component;
	trackedStats?: DashboardTrackedStats;
	showDashboard?: boolean;
	selectedProjects?: symbol[];
	snackbarOpen?: boolean;
	snackbarContent?: JSX.Element;
}

interface CurrentPageProps extends ControlCallbacks, PageControl { 
	selectedProjects: symbol[];
 }

class CurrentPage extends PureComponentIgnoreFuncs <CurrentPageProps> {
	render() {
		switch (this.props.controlClass) {
			case StartPage:
			case GroupedChoices:
				if (!this.props.controlProps) throw new Error('currentPageProps not defined'); 
				return (<this.props.controlClass
					{...this.props.controlProps} // Pass everything into the child
					doPageCallback={this.props.doPageCallback}
					summonInfoDialog={this.props.summonInfoDialog}
					resolveToValue={this.props.resolveToValue}
				/>);
			default:
				return <></>;
		}
	}
}

export class App extends React.PureComponent <unknown, AppState> {
	constructor(props: unknown) { 
		super(props);
		
		let startPage = Pages.start; let showDashboardAtStart = false;
		startPage = Pages.scope1Projects; showDashboardAtStart = true; // temporary, for debugging
		
		this.state = {
			currentPage: startPage,
			companyName: 'Auto-Man, Inc.',
			dialog: {
				open: false,
				title: '',
				text: '',
				cardText: undefined
			},
			currentPageProps: pageControls[startPage].controlProps,
			controlClass: pageControls[startPage].controlClass,
			trackedStats: {
				naturalGasMMBTU: 1_000_000, 
				naturalGasCostPerMMBTU: 5, 
				electricityUseKWh: 1_000_000, 
				electricityCostKWh: 0.10,
				financesAvailable: 100_000,
				totalBudget: 1_000_000,
				carbonSavings: 0,
				carbonEmissions: 69_420,
				moneySpent: 0,
				totalRebates: 0,
				year: 1,
			},
			showDashboard: showDashboardAtStart,
			selectedProjects: [],
			lastScrollY: -1,
			snackbarOpen: false,
		};
		// eslint-disable-next-line @typescript-eslint/ban-ts-comment
		// @ts-ignore --- writing to state is fine in constructor
		this.state.currentPageProps = this.fillTemplateText(this.state.currentPageProps);
		
		// @ts-ignore - for debugging
		window.app = this;
		// @ts-ignore - for debugging
		window.Pages = Pages; 
		// window.onbeforeunload = () => 'Are you sure you want to exit?'; TODO enable later
		
		// todo
		// addEventListener('popstate', this.handleHistoryPopState.bind(this));
	}
	
	/**
	 * Replaces variables from the app state, such as "$companyName" -> this.state.companyName, $trackedStats.year -> this.state.trackedStats.year
	 */
	fillTemplateText<T=AnyDict>(obj: T): T{
		const regex = /\$([a-zA-Z]\w*?)(\.([a-zA-Z]\w*?))?(\W)/g;
		
		for (let key of Object.keys(obj)) {
			if (typeof obj[key] === 'string') {
				obj[key] = obj[key].replace(regex, (match: string, variableKey: string, secondaryKeyPlusDot?: string, secondaryKey?: string, nextCharacter?: string) => {
					if (this.state.hasOwnProperty(variableKey)) {
						let thisVariable = this.state[variableKey];
						// example: $trackedStats.year
						if (typeof thisVariable === 'object' && secondaryKey && thisVariable.hasOwnProperty(secondaryKey)) {
							return String(thisVariable[secondaryKey]) + nextCharacter;
						}
						// example: $companyName
						else 
							return String(this.state[variableKey]) + nextCharacter;
					}
					else {
						throw new SyntaxError(`Invalid variable name ${match}`);
					}
				});
			}
		}
		return obj;
	}
	
	getThisPageControl() {
		let thisPageControl = pageControls[this.state.currentPage];
		if (!thisPageControl) 
			throw new PageError(`Page controls not defined for the symbol ${this.state.currentPage.description}`);
		return thisPageControl;
	}
	
	setPage(page: symbol) {
		
		let thisPageControl = pageControls[page];
		if (!thisPageControl) 
			throw new PageError(`Page controls not defined for the symbol ${page.description}`);
		
		let controlClass = thisPageControl.controlClass;
		let controlProps = this.fillTemplateText(thisPageControl.controlProps);
		let controlOnBack = thisPageControl.onBack;
		
		let dialog, currentPageProps;
		
		if (controlClass === InfoDialog) {
			dialog = fillDialogProps(controlProps);
			dialog.open = true;
		}
		else {
			dialog = cloneAndModify(this.state.dialog, {open: false});
			currentPageProps = controlProps;
		}
		
		this.setState({
			currentPage: page, 
			dialog,
			controlClass,
			currentPageProps: currentPageProps,
			currentOnBack: controlOnBack,
		});
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
		console.log('summoning', dialog);
		console.log(this.state.dialog === dialog);
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
	
	handleDashboardOnProceed() {
		let someScope1 = Scope1Projects.some((page) => this.state.selectedProjects.includes(page));
		let someScope2 = Scope2Projects.some((page) => this.state.selectedProjects.includes(page));
		
		console.log(`someScope1=${someScope1}, someScope2=${someScope2}`);
		
		// Show warning if user hasn't tried both scopes
		if (!someScope1 || !someScope2) {
			let warningDialogProps: DialogControlProps = {
				title: 'Hold up!',
				text: '',
				buttons: [
					closeDialogButton(),
					{
						text: 'Proceed anyways',
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
				warningDialogProps.text = 'You haven\'t selected any Scope 2 projects for this year. Do you want to go {BACK} and look at some of the possible Scope 1 projects?';
				this.summonInfoDialog(warningDialogProps);
			}
			return;
		}
		
		// Proceed to recap
		this.setPage(Pages.yearRecap);
	}
	
	render() {
		
		// Standard callbacks to spread to each control.
		const controlCallbacks = {
			doPageCallback: (callback) => this.handlePageCallback(callback),
			summonInfoDialog: (props) => this.summonInfoDialog(props),
			resolveToValue: (item) => this.resolveToValue(item),
		};
		
		return (
			<>
				<ThemeProvider theme={theme}>
					<Container maxWidth='xl'>
						<Box className='row' sx={{ bgcolor: '#ffffff80', minHeight: '100vh' }}>
							{this.state.showDashboard ? 
								<Dashboard 
									{...this.state.trackedStats} 
									{...controlCallbacks} 
									onBack={this.state.currentOnBack} 
									onProceed={() => this.handleDashboardOnProceed()}
									btnProceedDisabled={this.state.selectedProjects.length === 0}
								/> 
							: <></>}
							{(this.state.currentPageProps && this.state.controlClass) ?
								<CurrentPage
									{...controlCallbacks}
									controlClass={this.state.controlClass}
									controlProps={this.state.currentPageProps}
									selectedProjects={this.state.selectedProjects} // hacky, but this is only passed into CurrentPage so that it updates when selectedProjects changes
								/>
							: <></>}
						</Box>
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
