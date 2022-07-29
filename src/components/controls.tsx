import React from 'react';

/* -======================================================- */
//                         CONTROLS
/* -======================================================- */

export function Emphasis(props: React.PropsWithChildren) {
	return <span className='emphasis'>{props.children}</span>;
}

/**
 * Callbacks sent to every control. Component props extend this interface.
 */
export interface ControlCallbacks {
	doPageCallback: (callback?: PageCallback) => void;
	summonInfoDialog: (props) => void;
	resolveToValue: <T> (value: Resolvable<T>) => T;
}

/**
 * Generic type for a PageControl.
 * @param controlClass Class for this component.
 * @param controlProps Properties sent to the control, NOT INCLUDING extra properties/handlers sent from App.tsx such as doPageCallback()
 */
export declare interface PageControl {
	controlClass: Component;
	controlProps: AnyDict;
	onBack?: PageCallback
}