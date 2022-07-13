import type { App, AppState } from "./App";
import type { DialogStateProps } from "./controls";

/**
 * Parse handcrafted text into pretty-printed HTML. Currently supported: 
 *  \n -> newline 
 *  {text} -> emphasized text
 *  [text](link) -> <a href="link" target="_blank">text</a>
 * @param text 
 * @returns Object for passing to "dangerouslySetInnerHTML" attribute (https://reactjs.org/docs/dom-elements.html#dangerouslysetinnerhtml)
 */
export function parseSpecialText(text?: string): {__html: string} {
	text = text || '';
	let newText = text
		.replace(/{([^{}]*?)}/g, '<span class="emphasis">$1</span>')
		.replace(/(\n)|(\\n)/g, '<br/>')
        .replace(/\[(.*?)\]\((\S*?)\)/g, '<a href="$2" target="_blank">$1</a>');
    
	return {
		__html: newText
	};
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

export function fillDialogProps(obj: AnyDict): DialogStateProps {
	return {
		open: obj.open || false,
		title: obj.title || '',
		text: obj.text || '',
		cardText: obj.cardText || '',
		img: obj.img || '',
		imgAlt: obj.imgAlt || '',
		buttons: obj.buttons || undefined,
	};
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
		[key: string]: any;
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
	 * Either the desired return type, or a function which returns the desired type.
	 * @param state Read-only, immutable state of the main app
	 * @param nextState Mutable object containing properties to assign to the app's state next.
	 */
	type Resolvable<T> = T|((state?: AnyDict, nextState?: AnyDict) => T);
	/**
	 * Callback for a button click which 
	 * @param state Read-only, immutable state of the main app
	 * @param nextState Mutable object containing properties to assign to the app's state next.
	 */
	type PageCallback = ((this: App, state: AppState, nextState: AnyDict) => symbol)|symbol;
	
	/**
	 * JS does not discern between integers and floats, but we can still identify as necessary which numbers should be integers only.
	 */
	type integer = number;
	
	type buttonVariant = 'text'|'outlined'|'contained';
}