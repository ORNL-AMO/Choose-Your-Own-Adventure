import { Button, Stack } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import React from 'react';
import BasicPopover from "./BasicPopover";
import { fillDialogProps, resolveToValue } from './functions-and-types';
import { DialogControlProps, DialogStateProps } from './controls';
import type App from './App';

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
	 * Optional icon
	 */
	startIcon?: React.ReactNode;
	size?: 'small' | 'medium' | 'large';
}

export declare interface ButtonGroupProps {
	buttons?: ButtonGroupButton[];
	summonInfoDialog: (props) => void;
	doPageCallback: (callback?: PageCallback) => void;
	/**
	 * Whether to use a MUI Stack component to space the buttons, or just include the array of buttons "raw".
	 * @default true
	 */
	useMUIStack?: boolean;
}

/**
 * Group of configurable buttons.
 */
export function ButtonGroup(props: ButtonGroupProps) {
	if (!props.buttons) return <></>;
	
	const buttons = props.buttons.map((button, idx) => {
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
			<BasicPopover key={idx} text={button.text} variant={button.variant} startIcon={button.startIcon}>
				{button.infoPopup}
			</BasicPopover>
		);
		// Button
		else return (
			<Button 
				key={idx}
				variant={button.variant} 
				startIcon={button.startIcon} 
				size={button.size}
				onClick={() => {
					console.log(button);
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

export function backButton(newPage: Resolvable<symbol>): ButtonGroupButton {
	return {
		text: 'Back',
		variant: 'text',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
		}
	};
}

export function continueButton(newPage: Resolvable<symbol>): ButtonGroupButton {
	return {
		text: 'Continue',
		variant: 'text',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
		}
	};
}

export function selectButton(newPage: Resolvable<symbol>): ButtonGroupButton {
	return {
		text: 'Select',
		variant: 'contained',
		onClick: function (...params) {
			return resolveToValue(newPage, undefined, params, this);
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
	
	return {
		text: 'Info',
		variant: 'outlined',
		startIcon: <QuestionMarkIcon/>,
		infoDialog: fillDialogProps(dialogProps),
	};
}

export function closeDialogButton(): ButtonGroupButton {
	return {
		text: 'Back',
		variant: 'text',
		onClick: function (this: App, state) {
			return state.currentPage;
		}
	};
}