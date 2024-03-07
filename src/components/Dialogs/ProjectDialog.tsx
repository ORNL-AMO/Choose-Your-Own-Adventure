import React, { useEffect } from 'react';
import { CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper, DialogProps, Box, Card, CardHeader, CardContent, Typography, CardActions, Button, List, ListItem, ListItemText, Grid } from '@mui/material';
import { parseSpecialText, PureComponentIgnoreFuncs } from '../../functions-and-types';
import { useTheme } from '@mui/material/styles';
import { ButtonGroup, ButtonGroupButton } from '../Buttons';
import { DialogCardContent, DialogControlProps, InfoCard } from './dialog-functions-and-types';
import { ControlCallbacks, Emphasis } from '../controls';
import { CapitalFundingState, FinancingOption } from '../../Financing';
import { ProjectInfoCard } from './ProjectInfoCard';


export class ProjectDialog extends PureComponentIgnoreFuncs<ProjectDialogProps> {
	render() {
		return (
			<ProjectDialogFunc {...this.props} />
		);
	}
}

/**
 * Dialog pop-up that shows project information.
 * Using a sub-function because `useMediaQuery` requires React hooks, which are only allowed in function-style React components, 
 * but InfoDialog is using a class declaration so we can tell it when it should/should not re-render.
 */

function ProjectDialogFunc(props: ProjectDialogProps) {
	const theme = useTheme();
	let fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
	function handleClose() {
		// Run onClose handler ONLY if allowClose is set to true
		if (props.allowClose === true) {
			props.onClose();
		}
	}

	// todo 25 - this effect logic SHOULD be moved to onClick handler for the info dialog, 
	useEffect(() => {
		// timeout delay button display until dialog open - less page jump
		const timeout = setTimeout(() => {
			if (props.handleProjectInfoViewed && props.doAppStateCallback) {
				props.doAppStateCallback(props.handleProjectInfoViewed);
			}
		}, 100);

		return () => {
			// ensure state cleared before next effect
			clearTimeout(timeout);
		};
	});


	let controlCallbacks = {
		doPageCallback: props.doPageCallback,
		doAppStateCallback: props.doAppStateCallback,
		displayProjectDialog: props.displayProjectDialog,
		resolveToValue: props.resolveToValue,
		doPageCallbackDropdown: props.doPageCallbackDropdown
	};

	return (
		<Dialog
			fullScreen={fullScreen}
			fullWidth={true}
			maxWidth={'lg'}
			open={props.isOpen}
			keepMounted
			onClose={handleClose}
			aria-describedby='alert-dialog-slide-description'
			sx={{
				backdropFilter: 'blur(10px)',

			}}
			PaperProps={{
				style: {
				  overflowX: 'hidden'
				},
			}}
			
			>
			<ProjectInfoCard
				{...props}
				{...controlCallbacks}
				onClose={() => props.onClose}
			></ProjectInfoCard>
			<DialogActions>
				<ButtonGroup
					buttons={props.buttons}
					doPageCallback={props.doPageCallback}
					doAppStateCallback={props.doAppStateCallback}
					displayProjectDialog={props.displayProjectDialog}
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
					doPageCallbackDropdown={props.doPageCallbackDropdown}
				/>
			</DialogActions>
		</Dialog>
	);
}

export declare interface ProjectDialogProps extends ProjectDialogStateProps, ControlCallbacks {
	onClose: () => void;
	capitalFundingState: CapitalFundingState,
	currentGameYear: number
}

/**
 * Represent dialog properties managed by App.tsx/state 
 */
export declare interface ProjectDialogStateProps extends ProjectDialogControlProps {
	isOpen: boolean,
	inCompareDialog?: boolean,
}

export declare interface DialogFinancingOptionCard extends FinancingOption {
	implementButton: ButtonGroupButton
}

export declare interface ProjectDialogControlProps extends DialogControlProps {
	discriminator?: string,
	energyStatCards: Resolvable<DialogCardContent[]>;
	financingOptionCards: Resolvable<DialogFinancingOptionCard[]>;
	comparisonDialogButtons?: ButtonGroupButton[];
}

export function fillProjectDialogProps(obj: AnyDict): ProjectDialogStateProps {
	return {
		discriminator: obj.discriminator,
		comparisonDialogButtons: obj.comparisonDialogButtons || [],
		isOpen: obj.isOpen || false,
		title: obj.title || '',
		text: obj.text || '',
		energyStatCards: obj.energyStatCards || [],
		financingOptionCards: obj.financingOptionCards || [],
		img: obj.img || '',
		imgAlt: obj.imgAlt || '',
		allowClose: obj.allowClose || false,
		imgObjectFit: obj.imgObjectFit || undefined,
		buttons: obj.buttons || undefined,
		handleProjectInfoViewed: obj.handleProjectInfoViewed
	};
}

export function getEmptyProjectDialog() {
	return {
		isOpen: false,
		title: '',
		energyStatCards: [],
		financingOptionCards: [],
		text: '',
	}
}


