import KeyboardArrowLeft from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRight from '@mui/icons-material/KeyboardArrowRight';
import React from 'react';
import type { App, AppState, NextAppState } from './App';
import { theme } from './components/theme';
import { FinancingOption } from './Financing';

/**
 * Parse handcrafted text into pretty-printed HTML. Currently supported: 
 *  \n -> newline 
 *  {text} -> emphasized text
 * 	x_{text} -> subscript text
 *  [text](link) -> <a href="link" target="_blank">text</a>
 * @param text Text to parse. If an array of strings is provided, then they will be joined by two newlines.
 * @returns Object for passing to "dangerouslySetInnerHTML" attribute (https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
 */
export function parseSpecialText(text?: string|string[], shouldEmphasize: boolean = true): {__html: string} {
	text = text || '';
	let span = '<span>$1</span>';
	if (shouldEmphasize) span = '<span class="emphasis">$1</span>';
	if (text instanceof Array) text = text.join('\n\n'); // If text is an array, join it with two linebreaks into one string
	let newText = text
		.replace(/_{([^{}]*?)}/g, '<sub>$1</sub>')									// Subscript
		.replace(/{([^{}]*?)}/g, span) 				// Emphasis
		.replace(/(\n)|(\\n)/g, '<br/>')											// Line break
        .replace(/\[(.*?)\]\((\S*?)\)/g, '<a href="$2" target="_blank">$1</a>');	// Links
    
	return {
		__html: newText
	};
}

/**
 * Use to pad strings for unique keys in React lists
 */
export function getIdString() {
	return (Math.random() + 1).toString(36).substring(7);
}

/**
 * Return the ratio of one number to another, with a maximum of 1.
 */
export function clampRatio(value: number, max: number) {
	return Math.min(value / max, 1);
}

export function truncate(text: string, specifiedLimit?: number) {
    let limit = specifiedLimit ? specifiedLimit : 50;
    if (text.length > limit) {
        return text.slice(0, limit) + '...'
    } else {
        return text;
    }
}


/**
 * Returns the number with a + or - sign depending on its sign.
 * @param value value
 * @param decimals Number of decimal places (optional)
 */
export function withSign(value: number, decimals?: number): string {
	let sign = (value < 0) ? '-' : '+';
	if (typeof decimals === 'number')
		return sign + Math.abs(value).toFixed(decimals);
	else 
		return sign + Math.abs(value).toLocaleString('en-US');
}

export function toPercent(value: number): string {
	return (value * 100).toFixed(1) + '%';
}

/**
 * Resolve an item of an unknown type to a value.
 * @param item Item to resolve.
 * @param whenUndefined Value when undefined
 * @param params Parameters to apply to the function
 * @param bindObj Object to bind to the function (for "this")
 * @returns Resolved value.
 */
export function resolveToValue(item: unknown, whenUndefined?: unknown, params?: unknown[], bindObj?: unknown) {
	if (typeof item === 'function') {
		if (bindObj)
			return item.apply(bindObj, params);
		else
			return item(params);
	}
	else if (item === undefined || item === null) {
		return whenUndefined;
	}
	else {
		return item;
	}
}

/**
 * A basic implementation of the default shouldComponentUpdate implementation for React.PureComponent.
 * Does a shallow comparison between this.props and nextProps, and this.state and nextState.
 * Allows us to do some logic in addition to the basic shallow comparison.
 * 	Ignores functions in the comparison, because passing an arrow function into component props is treated as a new variable.
 */
export function comparePropsAndStateIgnoreFuncs(this: React.Component, nextProps, nextState?) {
	let propCompare = shallowCompareIgnoreFuncs(this.props, nextProps);
	if (propCompare === true) return true;
	
	if (!nextState) return false;
	else return shallowCompareIgnoreFuncs(this.state, nextState);
}

export function shallowCompareIgnoreFuncs(obj1, obj2) {
	let keys = Object.keys(obj1);
	return keys.some(key => 
		(obj1[key] !== obj2[key] && typeof obj1[key] !== 'function'));
}

/**
 * Custom implementation of PureComponent which ignores functions in the shouldComponentUpdate comperison.
 * This is because passing arrow/bind functions as props will cause the shallow comparison to always fail.
 * For example, (() => foo()) == (() => foo()) returns false
 */
export class PureComponentIgnoreFuncs <P> extends React.Component <P> {
	shouldComponentUpdate(nextProps, nextState) {
		return comparePropsAndStateIgnoreFuncs.apply(this, [nextProps, nextState]);
	}
}

/**
 * Just a helper function to SHALLOWLY clone an object, modify certain keys, and return the cloned object. 
 * This is because React prefers to keep objects within a state immutable.
 */
export function cloneAndModify<T>(obj: T, newValues: AnyDict): T {
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

/**
 * Returns a back-pointing arrow icon.
 */
export function leftArrow() {
	if (theme.direction === 'rtl') {
		return (<KeyboardArrowRight/>);
	}
	else {
		return (<KeyboardArrowLeft />);
	}
}

/**
 * Returns a forward-pointing arrow icon.
 */
export function rightArrow() {
	if (theme.direction === 'rtl') {
		return (<KeyboardArrowLeft />);
	}
	else {
		return (<KeyboardArrowRight/>);
	}
}

/**
 * Modified code from Orteil's Cookie Clicker. https://orteil.dashnet.org/cookieclicker
 */
function formatEveryThirdPower(notations) {
	return function (val) {
		let base=0,notationValue='';
		if (!isFinite(val)) return 'Infinity';
		if (val>=1000)
		{
			val/=1000;
			while(Math.round(val)>=1000)
			{
				val/=1000;
				base++;
			}
			if (base>=notations.length) {return 'Infinity';} else {notationValue=notations[base];}
		}
		let multiplier = (val >= 100) ? 10 : (val >= 10) ? 100 : 1000;
		return (Math.round(val * multiplier) / multiplier) + notationValue;
	};
}

let formatter = formatEveryThirdPower(['k','M','B','T', 'Qa', 'Qi', 'Sx']);

/**
 * Shorten a number with the suffix 'k', 'M', 'B', etc. for thousand, million, billion respectively.
 * Modified code from Orteil's Cookie Clicker. https://orteil.dashnet.org/cookieclicker
 * @param val value
 * @param {number} [floats] Number of decimals after the period for numbers < 1000.
 */
export function shortenNumber(val, floats?) {
	let negative = (val < 0);
	let decimal = '';
	let fixed = val.toFixed(floats);
	if (floats > 0 && Math.abs(val) < 1000 && Math.floor(fixed) != fixed) decimal='.'+(fixed.toString()).split('.')[1];
	val = Math.floor(Math.abs(val));
	if (floats > 0 && fixed == val+1) val++;
	
	let output = formatter(val);
	if (output == '0') negative = false;
	return (negative ? '-' : '') + output + decimal;
}

// Helpful types
declare global {
	
	/**
	 * Key-value object holding strings.
	 */
	interface StringDict {
		[key: string]: string;
	}
	
	/**
	 * Key-value object holding anything.
	 */
	interface AnyDict {
		[key: string]: any; // eslint-disable-line 
	}
	
	/**
	 * Generic key-value object with a declared type. 
	 * @example var teamKeyMap: Dict<Team> = {}; 
	 * teamKeyMap['team0'] = teams[0];
	 */
	interface Dict<T> {
		[key: string]: T;
	}
	

	/**
	 * Either the desired return type, or a function which returns the desired type, which will be called by binding "this" to the main App object & passed its state.
	 * Most controls are passed the prop "resolveToValue" which will achieve this.
	 * @param state Read-only, immutable state of the main app
	 * @param nextState Mutable object containing properties to assign to the app's state next.
	 */
	type Resolvable<T> = T|((this: App, state: AppState, nextState: NextAppState) => T);
	
	/**
	 * Either the desired return type, or a function which returns the desired type, WITHOUT necessarily being bound to any object.
	 */
	type ResolvableGeneric<T> = T|((this: unknown, ...params: unknown[]) => T);
	
	/**
	 * Data type that must resolve into a Page symbol. You can either provide a Page symbol by itself, or provide a function which returns a Page symbol.
	 * It is mostly used for button clicks, to determine which page to display next.
	 * IF YOU WANT TO DO OTHER LOGIC AND DO NOT WANT THE PAGE TO CHANGE, SIMPLY RETURN `state.currentPage`
	 * @param state Read-only, immutable state of the main app
	 * @param nextState Mutable object containing properties to assign to the app's state next.
	 */
	type PageCallback = ((this: App, state: AppState, nextState: NextAppState, financingOption: FinancingOption) => symbol)|symbol;
	
	/**
	 * Make state changes without Page navigation
	 * @param state Read-only, immutable state of the main app
	 * @param nextState Mutable object containing properties to assign to the app's state next.
	 */
	type AppStateCallback = ((this: App, state: AppState, nextState: NextAppState) => void);
	
	/**
	 * JS does not discern between integers and floats, but we can still identify as necessary which numbers should be integers only.
	 */
	type integer = number;
	
	type buttonVariant = 'text'|'outlined'|'contained';
	
	// eslint-disable-next-line @typescript-eslint/ban-types
	type Component = React.Component|Function;



}