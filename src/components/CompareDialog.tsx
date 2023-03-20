import {
	CardMedia, Dialog, DialogContent,
	Button, AppBar, IconButton, List, Slide,
	Toolbar, Typography, Stack, Card, CardContent, CardActions, useMediaQuery
} from '@mui/material';
import { parseSpecialText } from '../functions-and-types';
import { useTheme } from '@mui/material/styles';
import React, { PureComponent, useEffect } from 'react';
import type { TransitionProps } from '@mui/material/transitions';
import { fillDialogProps, InfoCard } from './InfoDialog';
import type { DialogStateProps } from './InfoDialog';
import type { InfoDialogProps } from './InfoDialog';
import type { DialogCardContent } from './InfoDialog';
import CloseIcon from '@mui/icons-material/Close';
import type { SelectedProject } from '../Projects';
import type { ControlCallbacks } from './controls';
import { ButtonGroup, ButtonGroupButton, deselectButton } from './Buttons';


const Transition = React.forwardRef(function Transition(
	props: TransitionProps & {
		children: React.ReactElement;
	},
	ref: React.Ref<unknown>,
) {
	return <Slide direction='up' ref={ref} {...props} />;
});

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

export declare interface CompareDialogProps extends ControlCallbacks {
	isOpen: boolean;
	selectedProjectsForComparison: SelectedProject[];
	onClose: () => void;
	onClearSelectedProjects: () => void;
}


function CompareDialogFunc(props: CompareDialogProps) {
	useEffect(() => {
		if (props.isOpen) {
			// timeout delay button display until dialog open - less page jump
			const timeout = setTimeout(() => {
				if (props.selectedProjectsForComparison.length > 0) {
					props.selectedProjectsForComparison.forEach(project => {
						if (props.doAppStateCallback) {
							props.doAppStateCallback(project.infoDialog.handleProjectInfoViewed);
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
	
	const projectDialogCards = getProjectDialogCards(props, theme);

	return (
		<div>
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
						spacing={2}
					>
						{projectDialogCards}
					</Stack>
				</DialogContent>

			</Dialog>
		</div>
	);
} else {
	return <></>;
}
}

function getProjectDialogCards(props: CompareDialogProps, theme) {
	return props.selectedProjectsForComparison.map((project: SelectedProject, idx) => {
		if (project.infoDialog.comparisonDialogButtons) {
			// No project in compare dialog should be disabled (ugly accessing index, until app handles buttons differently)
			project.infoDialog.comparisonDialogButtons[1].disabled = () => false;
		}

		const objectFit = (project.infoDialog.imgObjectFit) ? project.infoDialog.imgObjectFit : 'cover';
		const projectStatCards = getProjectStatCards(project, props, theme);
		// todo 25 use theme to set cardStyle width smaller for xl breakpoint
		const cardStyle = { 
			width: props.selectedProjectsForComparison.length == 2? .50 : .33, 
			marginLeft: '.5rem', 
			marginRight: '.5rem', 
			position: 'relative' 
		};
		return (
			<Card key={project.page.description} sx={cardStyle}>
				{project.infoDialog.img && <>
					<CardMedia
						component='img'
						height='260'
						image={project.infoDialog.img}
						alt={project.infoDialog.imgAlt}
						title={project.infoDialog.imgAlt}
						sx={{
							objectFit: objectFit,
							position: 'relative',
							zIndex: 2,
						}}
					/>
					{objectFit === 'contain' &&
						// This div is a container that clips the edges of the blurred image
						<div style={{
							position: 'absolute',
							height: 260,
							width: '100%',
							top: 0,
							right: 0,
							overflow: 'hidden',
						}}>
							<CardMedia
								component='img'
								height='260'
								image={project.infoDialog.img}
								alt={project.infoDialog.imgAlt}
								title={project.infoDialog.imgAlt}
								sx={{
									objectFit: 'cover',
									position: 'absolute',
									zIndex: 1,
									filter: 'blur(10px) grayscale(20%)',
									margin: '-20px',
									width: 'calc(100% + 40px)',
									height: '300px'
								}}
							/>
						</div>
					}
				</>}
				{!project.infoDialog.img && 
					<>
					<CardMedia
						component='img'
						height='260'
						image={project.infoDialog.img}
						alt={project.infoDialog.imgAlt}
						title={project.infoDialog.imgAlt}
						sx={{
							objectFit: objectFit,
							position: 'relative',
							zIndex: 2,
						}}
					/>
					</>
				}
				<CardContent>
					{/* Setting some static heights below to display all cards similarly */}
					<Typography gutterBottom variant='h5' component='div' className='semi-emphasis'
						dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(project.infoDialog.title))}>
					</Typography>
					<Typography variant='body2' color='#000000' component='div' height={150} sx={{overflowY: 'auto'}}
						gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(project.infoDialog.text))}>
					</Typography>
					<div style={{height: 225}}>
						{projectStatCards}
					</div>
				</CardContent>
				<CardActions style={{ justifyContent: 'flex-end' }}>
					<ButtonGroup
						buttons={project.infoDialog.comparisonDialogButtons}
						doPageCallback={props.doPageCallback}
						summonInfoDialog={props.summonInfoDialog}
						resolveToValue={props.resolveToValue}
						doAppStateCallback={props.doAppStateCallback}
					/>
				</CardActions>
			</Card>
		);

	});
}

function getProjectStatCards(project, props: CompareDialogProps, theme) {
	if (project.infoDialog.cardText && project.infoDialog.cards) throw new Error('InfoDialog: props.cardText and props.cards are mutually exclusive. Use one or the other.');
	let cardContents: DialogCardContent[] = [];
	if (project.infoDialog.cardText) {
		cardContents = [{
			text: props.resolveToValue(project.infoDialog.cardText),
			color: theme.palette.primary.light,
		}];
	}
	else if (project.infoDialog.cards) {
		cardContents = props.resolveToValue(project.infoDialog.cards);
	}
	return cardContents.map((cardContent, idx) =>
		<InfoCard
			key={idx}
			variant='outlined'
			sx={{borderColor: cardContent.color, color: '#000000', borderWidth: 'medium', fontWeight: 'bold'}}
			dangerouslySetInnerHTML={parseSpecialText(cardContent.text)}
		/>
	);
}
