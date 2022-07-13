import React from 'react';
import { Container, Button, Box, } from '@mui/material';

import './App.scss';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { InfoDialogProps, InfoDialog, StartPage, GroupedChoices, DialogStateProps } from './controls';
import { Component, pageControls, PageError, Pages } from './pages';
import { resolveToValue, fillDialogProps } from './functions-and-types';

interface HomeProps {
	dialog: AnyDict;
	selectProps?: AnyDict;
	currentPageProps?: AnyDict;
	controlClass?: Component;
	doPageCallback: (callback?: PageCallback) => void;
	summonInfoDialog: (props: any) => void;
}

export interface AppState {
	currentPage: symbol;
	companyName: string;
	dialog: DialogStateProps,
	currentPageProps?: AnyDict; // todo
	controlClass?: Component;
}

function Dashboard(props: HomeProps) {
	switch (props.controlClass) {
		case StartPage:
		case GroupedChoices:
			if (!props.currentPageProps) throw new Error('currentPageProps not defined'); 
			return (<props.controlClass
				{...props.currentPageProps} // Pass everything into the child
				doPageCallback={props.doPageCallback}
				summonInfoDialog={props.summonInfoDialog}
			/>);
		default:
			return <></>;
	}
}

function HomePage(props: HomeProps) {
	const dlg = props.dialog;
	
	return (
		<div className='homepage'>
			<Box className='row' sx={{ bgcolor: '#ffffff80', height: '100vh' }}>
				<Dashboard {...props}/>
			</Box>
			<InfoDialog
				open={dlg.open}
				title={dlg.title}
				img={dlg.img}
				imgAlt={dlg.imgAlt}
				text={dlg.text}
				cardText={dlg.cardText}
				buttons={dlg.buttons}
				doPageCallback={props.doPageCallback}
				summonInfoDialog={props.summonInfoDialog}
			/>
		</div>
	);
}

/**
 * Just a helper function to SHALLOWLY clone an object, modify certain keys, and return the cloned object. 
 * This is because React prefers to keep objects within a state immutable.
 */
function cloneAndModify<T>(obj: T, newValues: AnyDict) {
	let newObj = {};
	// First populate values from the old object
	for (let key of Object.keys(obj)) {
		newObj[key] = obj[key];
	}
	// Then populate values from the new object
	for (let key of Object.keys(newValues)) {
		newObj[key] = newValues[key];
	}
	return newObj;
}

export class App extends React.PureComponent <unknown, AppState> {
	constructor(props: unknown) { 
		super(props);
		this.state = {
			currentPage: Pages.start,
			companyName: 'Auto-Man, Inc.',
			dialog: {
				open: false,
				title: '',
				text: '',
				cardText: undefined
			},
			currentPageProps: pageControls[Pages.start].controlProps,
			controlClass: pageControls[Pages.start].controlClass,
		};
		// @ts-ignore - for debugging
		window.app = this;
		// @ts-ignore
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
	
	render() {
		return (
			<div className='homepage'>
				<Container maxWidth='xl'>
					<HomePage 
						dialog={this.state.dialog}
						currentPageProps={this.state.currentPageProps}
						controlClass={this.state.controlClass}
						doPageCallback={(callback) => this.handlePageCallback(callback)}
						summonInfoDialog={(props) => this.summonInfoDialog(props)}
					/>
				</Container>
			</div>
		);
	}
}

export default App;
