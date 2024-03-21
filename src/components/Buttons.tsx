import { Button, MenuItem, Select, SelectChangeEvent, Stack } from '@mui/material';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import React from 'react';
import BasicPopover from './BasicPopover';
import { resolveToValue } from '../functions-and-types';
import type { ControlCallbacks } from './controls';
import type App from '../App';
import { DialogControlProps, DialogStateProps } from './Dialogs/dialog-functions-and-types';
import { fillProjectDialogProps } from './Dialogs/ProjectDialog';
import { FinancingId, FinancingType } from '../Financing';

/**
 * Button control for use inside a ButtonGroup component's `buttons` prop.
 */
export declare interface ButtonGroupButton {
	text: string;
	/**
	 * Determines input type: Button or Select
	 */
	inputType: 'button' | 'select';
	variant: buttonVariant;
	color?: 'primary' | 'inherit' | 'secondary' | 'success' | 'error' | 'info' | 'warning' | undefined;
	/**
	 * Contents to appear in an info popup. Mutually exclusive with infoDialog and onClick.
	 */
	infoPopup?: React.ReactNode;
	/**
	 * Contents to appear in an InfoDialog. Mutually exclusive with infoPopup and onClick.
	 */
	infoDialog?: DialogStateProps; 
	/**
	 * Contents to appear in an projectDialog.
	 */
	projectDialog?: DialogStateProps; 
	/**
	 * PageCallback to run on click. Mutually exclusive with infoPopup and infoDialog.
	 */
	onClick?: PageCallback;
	getDynamicButtonText?: Resolvable<string>;
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
	shouldDisplay?: Resolvable<boolean>
	href?: string;
	target?: React.HTMLAttributeAnchorTarget;
	/**
	 * Below properties are for Select input type
	 */
	value?: string;
	dropDownValue?: FinancingType;
	selectOptions?: Resolvable<FinancingType[]>;
	onChange?: PageCallbackDropdown;
}

export declare interface ButtonGroupProps extends ControlCallbacks {
	buttons?: ButtonGroupButton[];
	isProjectGroupChoice?: boolean;
	/**
	 * Whether the entire group of buttons appears disabled.
	 */
	disabled?: Resolvable<boolean>;
	doPageCallback: (callback?: PageCallback) => void;
	doPageCallbackDropdown?: (callback: PageCallbackDropdown, financingType: FinancingType) => void;
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
	
	if (!props.buttons) return <></>;
	const buttons = props.buttons.map((button, idx) => getButtonComponent(props, button, idx));
	if (props.useMUIStack === false) 
		return <>{buttons}</>;
	else {
		// By default, use a Stack element to space the buttons
		return (
			<Stack direction='row' justifyContent={props.isProjectGroupChoice? 'flex-end' : 'center'} spacing={2}>
				{buttons}
			</Stack>
		);
	}
}

export function getButtonComponent(props: ButtonGroupProps, button: ButtonGroupButton, idx: number) {
	let thisDisabled = props.resolveToValue(props.disabled, false);
	if (button.inputType === 'button') {
		if (button.disabled) {
			thisDisabled = thisDisabled || props.resolveToValue(button.disabled);
		}
	
		// todo 142 remove this and related. use distinct different components or better language if we need mutual exlusivity
		if (
			(button.infoPopup && (button.infoDialog || button.onClick)) ||
			(button.infoDialog && (button.infoPopup || button.onClick)) ||
			(button.onClick && (button.infoPopup || button.infoDialog))
		) {
			throw new Error('Button has multiple mutually exclusive properties, infoPopup/infoDialog/onClick');
		}
	
		let stateDependentText = props.resolveToValue(button.getDynamicButtonText);
		if (stateDependentText) {
			button.text = stateDependentText;
		}
	
		if (button.infoPopup) {
			return (
				<BasicPopover key={idx} text={button.text} buttonVariant={button.variant} startIcon={props.resolveToValue(button.startIcon)}>
					{button.infoPopup}
				</BasicPopover>
			);
		} else if (button.href) {
			// Button with href (using 'a' as the root node)
			return (
				<Button
					key={idx}
					variant={button.variant}
					color={button.color}
					startIcon={props.resolveToValue(button.startIcon)}
					endIcon={props.resolveToValue(button.endIcon)}
					size={button.size}
					href={button.href}
					target={button.target}
					disabled={thisDisabled}
				>
					{button.text}
				</Button>
			);
		}
		// Button without href
		else {
			return (
				<Button
					key={idx}
					variant={button.variant}
					color={button.color}
					startIcon={props.resolveToValue(button.startIcon)}
					endIcon={props.resolveToValue(button.endIcon)}
					size={button.size}
					disabled={thisDisabled}
					onClick={() => {
						if (button.onClick) {
							props.doPageCallback(button.onClick);
						}
						else if (button.projectDialog) {
							// todo 25 set availableProjectIds should probably happen here instead of <InfoDialog/> useEfffect
							props.displayProjectDialog(button.projectDialog);
						}
					}}
				>
					{button.text}
				</Button>
			);
		}
	} 
	if (button.inputType === 'select') {
		if (button.disabled) {
			thisDisabled = thisDisabled || props.resolveToValue(button.disabled);
		}
		const [selectedFinancingId, setDropdownSelectFinancing ] = React.useState(button.dropDownValue.id);

		const handleDropdownSelectFinancing = (event: SelectChangeEvent<FinancingId>) => {
			console.log('financingType event.target.value: ', event.target.value);
			setDropdownSelectFinancing(event.target.value as FinancingId);
		};

		let financingTypeOptions = props.resolveToValue(button.selectOptions);

		let menuItems = financingTypeOptions.map((financingType: FinancingType, index ) => {
			return (
				<MenuItem key={financingType.id} value={financingType.id}>{financingType.name}</MenuItem>
			);
		});

		return (
			<Select
				key={idx}
				value={selectedFinancingId}
				disabled={thisDisabled}
				onChange={(onChangeEvent) => {
					// todo need to coordinate what values are being passed in this select 
					let newFinancingId = onChangeEvent.target.value;
					handleDropdownSelectFinancing(onChangeEvent);
					let newSelectedFinancingType: FinancingType = financingTypeOptions.find(option => option.id === newFinancingId);
					props.doPageCallbackDropdown(button.onChange, newSelectedFinancingType);
				}}
			>
				{menuItems}
		
			</Select>
		
		);
	}
}

/* -======================================================- */
//       COMMON BUTTON CONTROLS (for use in PageControls)
/* -======================================================- */

/**
 * Generates a "Back" button which sets the app to the specified page when clicked.
 */
export function backButton(onClick: PageCallback, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Back',
		inputType: 'button',
		variant: 'text',
		onClick: function (...params) {
			return resolveToValue(onClick, undefined, params, this);
		},
		disabled
	};
}

/**
 * Generates a "Continue" button which sets the app to the specified page when clicked.
 */
export function continueButton(onClick: PageCallback, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Continue',
		inputType: 'button',
		variant: 'text',
		onClick: function (...params) {
			return resolveToValue(onClick, undefined, params, this);
		},
		disabled,
	};
}

/**
 * Generates a "Select" button which sets the app to the specified page when clicked.
 */
export function selectButton(onClick: PageCallback, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Select',
		inputType: 'button',
		variant: 'contained',
		onClick: function (...params) {
			return resolveToValue(onClick, undefined, params, this);
		},
		disabled,
	};
}

/**
 * Generates a "Select" button with a checkbox.
 * @param onClick Click handler. Must return a Page symbol.
 * @param disabled Whether the button should appear disabled.
 * @param selected Whether the checkbox should be checked.
 * @returns 
 */

export function implementButtonCheckbox(onClick: PageCallback, disabled?: Resolvable<boolean>, selected?: Resolvable<boolean>, shouldDisplay?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Implement Project',
		inputType: 'button',
		color: 'success',
		variant: 'contained',
		onClick: function (...params) {
			return resolveToValue(onClick, undefined, params, this);
		},
		disabled: disabled,
		shouldDisplay: shouldDisplay,
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

/**
 * Generates a button with a question-mark and a popup.
 */
export function infoButtonWithPopup(popupContents: React.ReactNode, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: 'Info',
		inputType: 'button',
		variant: 'outlined',
		infoPopup: popupContents,
		startIcon: <QuestionMarkIcon/>,
		disabled,
	};
}

/**
 * Generates a button with a custom icon and a popup.
 */
export function iconButtonWithPopupText(text: string, icon: React.ReactNode, popupContents: React.ReactNode, disabled?: Resolvable<boolean>): ButtonGroupButton {
	return {
		text: text,
		inputType: 'button',
		variant: 'text',
		startIcon: icon,
		infoPopup: popupContents,
		disabled,
	};
}

/**
 * Creates an outlined 'Info' button with a dialog that pops up when clicked.
 * @param dialogProps Dialog control props
 * @returns Button control for use inside a ButtonGroup
 */
export function infoButtonWithProjectDialog(dialogProps: DialogControlProps, disabled?: Resolvable<boolean>): ButtonGroupButton {
	if (!dialogProps.buttons) dialogProps.buttons = [closeDialogButton()];
	dialogProps.allowClose = true; // Allow closing with the esc button or by clicking outside of the dialog
	return {
		text: 'Info',
		inputType: 'button',
		variant: 'outlined',
		startIcon: <QuestionMarkIcon/>,
		projectDialog: fillProjectDialogProps(dialogProps),
		disabled,
		shouldDisplay: true
	};
}

/**
 * Generates a "Compare" button with a checkbox.
 * @param addProjectToCompare Click handler. Must return a Page symbol.
 * @param selected Whether the checkbox should be checked. 
 * @param disabled Whether the button should appear disabled.
 * @param buttonText dependant on whether selected
 * @returns 
 */
export function compareButton(addProjectToCompare: PageCallback, selected: Resolvable<boolean>, disabled?: Resolvable<boolean>, buttonText?: Resolvable<string>): ButtonGroupButton {
	return {
		text: 'Compare',
		inputType: 'button',
		variant: 'outlined',
		onClick: function (...params) {
			return resolveToValue(addProjectToCompare, undefined, params, this);
		},
		getDynamicButtonText: function (...params) {
			return resolveToValue(buttonText, false, params, this);
		},
		disabled,
		startIcon: function (...params) {
			if (resolveToValue(selected, false, params, this)) {
				return <CheckBoxIcon/>;
			}
			else {
				return <CheckBoxOutlineBlankIcon/>;
			}
		},
		shouldDisplay: true
	};
}


/**
 * Generates a "Compare" button with a checkbox.
 * @param onClick removes from list of selected for compare

 * @returns 
 */
export function deselectButton(onClick: AppStateCallback): ButtonGroupButton {
	return {
		text: 'Deselect',
		inputType: 'button',
		variant: 'outlined',
		onClick: function (...params) {
			return resolveToValue(onClick, undefined, params, this);
		},
		shouldDisplay: true
	};
}

/**
 * Generates a button that will close a dialog.
 * @param text Text to display, default = 'Back'
 */
export function closeDialogButton(text?: string, disabled?: Resolvable<boolean>): ButtonGroupButton {
	if (!text) text = 'Back';
	return {
		text: text,
		inputType: 'button',
		variant: 'text',
		onClick: function (this: App, state) {
			this.handleDialogClose();
			return state.currentPage;
		},
		disabled,
	};
}