import { Button, Stack } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React, { useEffect, useState } from 'react';
import BasicPopover from "./BasicPopover";
import { resolveToValue } from '../functions-and-types';
import type { ControlCallbacks } from './controls';
import type { DialogControlProps, DialogStateProps } from './InfoDialog';
import { fillDialogProps } from './InfoDialog';
import type App from '../App';

export declare interface ButtonGroupButton {
	/**
	 * Text to display on the button
	 */
	text: string;
	/**
	 * Variant of the button
	 */
	variant: buttonVariant;
	/**
	 * Contents to appear in an info popup. Mutually exclusive with infoDialog and onClick.
	 */
	infoPopup?: React.ReactNode;
	/**
	 * Contents to appear in an InfoDialog. Mutually exclusive with infoPopup and onClick.
	 */
	infoDialog?: DialogStateProps; // todo
	/**
	 * PageCallback to run on click. Mutually exclusive with infoPopup and infoDialog.
	 */
	onClick?: PageCallback;
	/**
	 * Optional icon at start of button text
	 */
	startIcon?: Resolvable<React.ReactNode>;
	/**
	 * Optional icon at end of button text
	 */
	endIcon?: Resolvable<React.ReactNode>;
	size?: 'small' | 'medium' | 'large';
	disabled?: Resolvable<boolean>;
}

export declare interface ButtonGroupProps extends ControlCallbacks {
	buttons?: ButtonGroupButton[];
	/**
	 * Prevent button from being enabled for the provided number of milliseconds.
	 */
	delay?: number;
	summonInfoDialog: (props) => void;
	doPageCallback: (callback?: PageCallback) => void;
	/**
	 * Whether to use a MUI Stack component to space the buttons, or just include the array of buttons "raw".
	 * @default true
	 */
	useMUIStack?: boolean;
}

/**
 * Group of configurable buttons. todo: turn into a class for render efficiency
 */
export function ButtonGroup(props: ButtonGroupProps) {
	
	// // Decide whether the button group starts disabled
	// let startsDisabled = false;
	// if (props.delay) startsDisabled = true;
	
	// let [disabled, setDisabled] = useState(!!props.delay);
	
	
	// // Un-disable the buttons after a delay IF it's provided
	// useEffect(() => {
	// 	if (props.delay) {
	// 		setTimeout(() => {
	// 			setDisabled(false);
	// 		}, props.delay);
	// 	}
	// });
	
	if (!props.buttons) return <></>;
	
	const buttons = props.buttons.map((button, idx) => {
		
		// Decide whether the button starts disabled
		// let thisDisabled = disabled;
		let thisDisabled = false;
		if (button.disabled) thisDisabled = thisDisabled || props.resolveToValue(button.disabled);
	
		// Check for mutually exclusive properties
		if (
			(button.infoPopup && (button.infoDialog || button.onClick)) ||
			(button.infoDialog && (button.infoPopup || button.onClick)) ||
			(button.onClick && (button.infoPopup || button.infoDialog))
		) {
			throw new Error(`Button has multiple mutually exclusive properties, infoPopup/infoDialog/onClick`);
		}
		
		// Info popup
		if (button.infoPopup) return (
			<BasicPopover key={idx} text={button.text} buttonVariant={button.variant} startIcon={props.resolveToValue(button.startIcon)}>
				{button.infoPopup}
			</BasicPopover>
		);
		// Button
		else return (
			<Button 
				key={idx}
				variant={button.variant} 
				startIcon={props.resolveToValue(button.startIcon)}
				endIcon={props.resolveToValue(button.endIcon)}
				size={button.size}
				disabled={thisDisabled}
				onClick={() => {
					// Button's provided onclick handler
					if (button.onClick) {
						props.doPageCallback(button.onClick);
					}
					// Button's provided infoDialog props
					else if (button.infoDialog) {
						props.summonInfoDialog(button.infoDialog);
					}
				}}
			>
				{button.text}
			</Button>
		);
	});
	
	if (props.useMUIStack === false) 
		return <>{buttons}</>;
	else 
		// By default, use a Stack element to space the buttons
		return (
			<Stack direction="row" justifyContent="center" spacing={2}>
				{buttons}
			</Stack>
		);
}

/* -======================================================- */
//       COMMON BUTTON CONTROLS (for use in pages.tsx)
/* -======================================================- */

export function backButton(newPage: PageCallback, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Back',
		variant: 'text',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
		},
		disabled: disabled
	};
}

// todo rest of disableds
export function continueButton(newPage: PageCallback): ButtonGroupButton {
	return {
		text: 'Continue',
		variant: 'text',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
		}
	};
}

export function selectButton(newPage: PageCallback, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Select',
		variant: 'contained',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
		},
		disabled: disabled
	};
}

export function selectButtonCheckbox(newPage: PageCallback, disabled?: Resolvable<boolean>, selected?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Select',
		variant: 'contained',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
		},
		disabled: disabled,
		startIcon: function (...params) {
			if (resolveToValue(selected, false, params, this)) {
				return <CheckBoxIcon/>;
			}
			else {
				return <CheckBoxOutlineBlankIcon/>;
			}
		}
	};
}

export function infoButtonWithPopup(popupContents: React.ReactNode): ButtonGroupButton {
	return {
		text: 'Info',
		variant: 'outlined',
		infoPopup: popupContents,
		startIcon: <QuestionMarkIcon/>
	};
}

/**
 * Example usage: CO2 savings inside GroupedChoices choice
 */
export function iconButtonWithPopupText(text: string, icon: React.ReactNode, popupContents: React.ReactNode): ButtonGroupButton {
	return {
		text: text,
		variant: 'text',
		startIcon: icon,
		
	};
}

export function infoButtonWithDialog(dialogProps: DialogControlProps): ButtonGroupButton {
	if (!dialogProps.buttons) dialogProps.buttons = [closeDialogButton()];
	dialogProps.allowClose = true; // Allow closing with the esc button or by clicking outside of the dialog
	
	return {
		text: 'Info',
		variant: 'outlined',
		startIcon: <QuestionMarkIcon/>,
		infoDialog: fillDialogProps(dialogProps),
	};
}

export function closeDialogButton(text?: string): ButtonGroupButton {
	if (!text) text = 'Back';
	return {
		text: text,
		variant: 'text',
		onClick: function (this: App, state) {
			return state.currentPage;
		}
	};
}