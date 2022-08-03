import React from 'react';

/* -======================================================- */
//                         CONTROLS
/* -======================================================- */

declare interface EmphasisProps extends React.PropsWithChildren {
	/**
	 * Whether to display the text as green, i.e. for a monetary value.
	 */
	money?: boolean;
}

/**
 * Emphasized text.
 */
export function Emphasis(props: EmphasisProps) {
	return <span className={'emphasis ' + (props.money ? 'money' : '')}>{props.children}</span>;
}

/**
 * Callbacks sent to every control. Component props extend this interface.
 */
export interface ControlCallbacks {
	doPageCallback: (callback?: PageCallback) => void;
	summonInfoDialog: (props) => void;
	resolveToValue: <T> (value: Resolvable<T>, whenUndefined?: T) => T;
}

/**
 * Props sent to CurrentPage
 */
export declare interface PageControlProps {
	controlClass: Component;
	controlProps: AnyDict;
	/**
	 * Page to go to when "Back" is clicked. (Not fully implemented)
	 */
	onBack?: PageCallback;
}

/**
 * Generic type for a PageControl.
 * @param controlClass Class for this component.
 * @param controlProps Properties sent to the control, NOT INCLUDING extra properties/handlers sent from App.tsx such as doPageCallback()
 */
export declare interface PageControl extends PageControlProps{
	/**
	 * if hideDashboard is set to 'initial', then the dashboard's visibility state will remain as it was before.
	 */
	hideDashboard: boolean|'initial';
}