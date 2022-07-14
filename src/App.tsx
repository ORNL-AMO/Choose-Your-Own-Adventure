import React from 'react';
import { Container, Button, Box, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { InfoDialogProps, InfoDialog, StartPage, GroupedChoices, DialogStateProps, PageControl, ControlCallbacks, DashboardProps, Dashboard } from './controls';
import { pageControls, PageError, Pages } from './pages';
import { resolveToValue, fillDialogProps, PureComponentIgnoreFuncs } from './functions-and-types';

export interface HomeProps extends ControlCallbacks {
	dialog: DialogStateProps;
	currentPageProps?: AnyDict;
	dashboardProps: DashboardProps;
	controlClass?: Component;
	showDashboard: boolean;
	onDialogClose: () => void;
	selectedProjects: symbol[];
}

export interface AppState {
	currentPage: symbol;
	companyName: string;
	dialog: DialogStateProps,
	currentPageProps?: AnyDict; // todo
	controlClass?: Component;
	trackedStats: DashboardProps;
	showDashboard: boolean;
	selectedProjects: symbol[];
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

function HomePage(props: HomeProps) {
	const dialogProps: DialogStateProps = props.dialog;
	
	return (
		<div className='homepage'>
			<Box className='row' sx={{ bgcolor: '#ffffff80', minHeight: '100vh' }}>
				{props.showDashboard ? 
					<Dashboard {...props.dashboardProps}/> 
				: <></>}
				{(props.currentPageProps && props.controlClass) ?
					<CurrentPage
						controlClass={props.controlClass}
						doPageCallback={props.doPageCallback}
						summonInfoDialog={props.summonInfoDialog}
						controlProps={props.currentPageProps}
						resolveToValue={props.resolveToValue}
						selectedProjects={props.selectedProjects}
					/>
				: <></>}
			</Box>
			<InfoDialog
				{...dialogProps}
				onClose={props.onDialogClose}
				doPageCallback={props.doPageCallback}
				summonInfoDialog={props.summonInfoDialog}
				resolveToValue={props.resolveToValue}
			/>
		</div>
	);
}

/**
 * Just a helper function to SHALLOWLY clone an object, modify certain keys, and return the cloned object. 
 * This is because React prefers to keep objects within a state immutable.
 */
function cloneAndModify<T>(obj: T, newValues: AnyDict): T {
	// First populate values from the old object
	let newObj: T = {
		...obj
	};
	// Then populate values from the new object
	for (let key of Object.keys(newValues)) {
		newObj[key] = newValues[key];
	}
	return newObj;
}

export class App extends React.PureComponent <unknown, AppState> {
	constructor(props: unknown) { 
		super(props);
		
		// const startPage = Pages.start;
		const startPage = Pages.scope1Projects; // temporary
		const showDashboardAtStart = true;
		
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
				financesAvailable: 1_000_000,
				totalBudget: 1_000_000,
				carbonReduced: 0,
				carbonEmissions: 0,
				moneySpent: 0,
				totalRebates: 0,
			},
			showDashboard: showDashboardAtStart,
			selectedProjects: [],
		};
		// @ts-ignore - for debugging
		window.app = this;
		// @ts-ignore - for debugging
		window.Pages = Pages; 
		// window.onbeforeunload = () => 'Are you sure you want to exit?'; TODO enable later
		
		// todo
		// addEventListener('popstate', this.handleHistoryPopState.bind(this));
	}
	
	/**
	 * Replaces variables from the app state, such as "$companyName" -> this.state.companyName
	 */
	fillTemplateText<T=AnyDict>(obj: T): T{
		const regex = /\$([a-zA-Z]\w*?)(\W)/g;
		
		for (let key of Object.keys(obj)) {
			if (typeof obj[key] === 'string') {
				obj[key] = obj[key].replace(regex, (match, variableKey, nextCharacter) => {
					if (this.state.hasOwnProperty(variableKey)) {
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
		});
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
	handleHistoryPopState(event) {
		// console.log(event);
		// if (!event.state) return;
		
		// let lastPage: symbol = Symbol.for(event.state.page);
		// if (!lastPage) return console.log('lastpage');
		
		// let lastPageControl = pageControls[lastPage];
		// this.setPage(resolveToValue(lastPageControl.onBack));
	}
	
	// todo comment
	summonInfoDialog(props) {
		let dialog = fillDialogProps(props);
		dialog.open = true;
		this.setState({dialog});
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
	
	render() {
		console.log('Rendering');
		return (
			<div className='homepage'>
				<Container maxWidth='xl'>
					<HomePage 
						dialog={this.state.dialog}
						currentPageProps={this.state.currentPageProps}
						dashboardProps={this.state.trackedStats}
						controlClass={this.state.controlClass}
						showDashboard={this.state.showDashboard}
						doPageCallback={(callback) => this.handlePageCallback(callback)}
						summonInfoDialog={(props) => this.summonInfoDialog(props)}
						onDialogClose={() => this.handleDialogClose()}
						resolveToValue={(item) => this.resolveToValue(item)}
						selectedProjects={this.state.selectedProjects} // hacky, but this is only passed into Homepage & CurrentPage so that it updates when selectedProjects changes
					/>
				</Container>
			</div>
		);
	}
}

export default App;
