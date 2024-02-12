import {
	CardMedia, Dialog, DialogContent,
	Button, AppBar, IconButton, List, Slide,
	Toolbar, Typography, Stack, Card, CardContent, CardActions, useMediaQuery
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import React, { PureComponent, useEffect } from 'react';
import type { TransitionProps } from '@mui/material/transitions';
import CloseIcon from '@mui/icons-material/Close';
import type { SelectedProject } from '../../ProjectControl';
import type { ControlCallbacks } from '../controls';
import { DialogStateProps } from './dialog-functions-and-types';
import { fillProjectDialogProps } from './ProjectDialog';
import { ProjectInfoCard } from './ProjectInfoCard';
import { CapitalFundingState } from '../../Financing';



/**
 * Full screen dialog with actions header - Currently always mounted.
 */
export class CompareDialog extends PureComponent<CompareDialogProps> {
	render() {
		return (
			<CompareDialogFunc {...this.props} />
		);
	}
}

function CompareDialogFunc(props: CompareDialogProps) {
	useEffect(() => {
		if (props.isOpen) {
			// timeout delay button display until dialog open - less page jump
			const timeout = setTimeout(() => {
				if (props.selectedProjectsForComparison.length > 0) {
					props.selectedProjectsForComparison.forEach(project => {
						if (props.doAppStateCallback) {
							props.doAppStateCallback(project.projectDialog.handleProjectInfoViewed);
						}
					});
				}
			}, 100);
			
			return () => {
				// ensure state cleared before next effect
				clearTimeout(timeout);
			};
		}
	});

	const theme = useTheme();
	if (props.isOpen) {
	const sxAppbar = {
		'position': 'relative',
		'bgcolor': 'white',
	};
	
	const projectInfoCards = getProjectInfoCards(props, theme);

	return (
			<Dialog
				fullScreen
				open={props.isOpen}
				onClose={props.onClose}
				TransitionComponent={Transition}
			>
				<AppBar sx={sxAppbar}>
					<Toolbar>
						<IconButton
							edge='start'
							color='primary'
							onClick={props.onClose}
							aria-label='close'
						>
							<CloseIcon />
						</IconButton>
						<Typography sx={{ ml: 2, flex: 1 }} variant='h6' className='bp-font-color' component='div'>
							Compare And Implement
						</Typography>
						<Stack
						direction='row'
						justifyContent='flex-end'
						alignItems='center'
						spacing={1}
						>

						<Button color='primary' variant='outlined' onClick={props.onClearSelectedProjects}>
							Clear Comparisons
						</Button>
						<Button color='primary' variant='contained'  onClick={props.onClose}>
							Close
						</Button>
						</Stack>
					</Toolbar>
				</AppBar>
				<DialogContent>
					<Stack
						direction='row'
						justifyContent='center'
						alignItems='center'
						spacing={4}
					>
						{projectInfoCards}
					</Stack>
				</DialogContent>

			</Dialog>
	);
} else {
	return <></>;
}
}


function getProjectInfoCards(props: CompareDialogProps, theme) {
	let controlCallbacks = {
		doPageCallback: props.doPageCallback,
		doAppStateCallback: props.doAppStateCallback,
		displayProjectDialog: props.displayProjectDialog,
		resolveToValue: props.resolveToValue
	};

	let projectDialogs: JSX.Element[] = [];

	props.selectedProjectsForComparison.forEach((project: SelectedProject, idx) => {
		let projectDialogStateProps = fillProjectDialogProps(project.projectDialog);
		const cardStyle = { 
			width: props.selectedProjectsForComparison.length == 2? .50 : .33, 
			marginLeft: '.5rem', 
			marginRight: '.5rem', 
			position: 'relative',
			alignSelf: 'stretch',
			display: 'flex',
			flexDirection: 'column',
			justifyContent: 'space-between'
		};
		
		const card = <Card 
		sx={cardStyle} 
		key={project.page.toString() + idx}>
		<ProjectInfoCard
			{...projectDialogStateProps}
			{...controlCallbacks}
			inCompareDialog={true}
			capitalFundingState={props.capitalFundingState}
			onClose={() => props.onClose}
		></ProjectInfoCard>
		</Card>

		projectDialogs.push(card)
	});
	return projectDialogs;
}


const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction='up' ref={ref} {...props} />;
});


export declare interface CompareDialogProps extends DialogStateProps, ControlCallbacks {
	selectedProjectsForComparison: SelectedProject[];
	handleRemoveSelectedCompare?: PageCallback;
	capitalFundingState: CapitalFundingState;
	onClose: () => void;
	onClearSelectedProjects: () => void;
}
