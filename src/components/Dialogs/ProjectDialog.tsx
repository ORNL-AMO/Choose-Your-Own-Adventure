import React, { useEffect } from 'react';
import { CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper, DialogProps } from '@mui/material';
import { parseSpecialText, PureComponentIgnoreFuncs } from '../../functions-and-types';
import { useTheme } from '@mui/material/styles';
import { ButtonGroup, ButtonGroupButton } from '../Buttons';
import { DialogCardContent, DialogControlProps, InfoCard } from './dialog-functions-and-types';
import { ControlCallbacks } from '../controls';
import { InfoDialogControlProps } from './InfoDialog';


export class ProjectDialog extends PureComponentIgnoreFuncs <ProjectDialogProps> {
	render() {
		return (
			<ProjectDialogFunc {...this.props}/>
		);
	}
}

/**
 * Dialog pop-up that shows project information.
 * Using a sub-function because `useMediaQuery` requires React hooks, which are only allowed in function-style React components, 
 * but InfoDialog is using a class declaration so we can tell it when it should/should not re-render.
 */

function ProjectDialogFunc (props: ProjectDialogProps) {
	const theme = useTheme();
	let fullScreen = useMediaQuery(theme.breakpoints.down('sm'));	
	let imgHeight = '260';
	let objectFit = (props.imgObjectFit) ? props.imgObjectFit : 'cover';
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
	
	let energyStatCardContents: DialogCardContent[] = [];
	if (props.cards) {
		energyStatCardContents = props.resolveToValue(props.cards);
	}
	
	return (
		<Dialog
			fullScreen={fullScreen}
			open={props.isOpen}
			keepMounted
			onClose={handleClose}
			aria-describedby='alert-dialog-slide-description'
			sx={{
				backdropFilter: 'blur(10px)'
			}}
		>
			{props.img && <>
				<CardMedia
					component='img'
					height= {imgHeight}
					image={props.img}
					alt={props.imgAlt}
					title={props.imgAlt}
					sx={{
						objectFit: objectFit,
						position: 'relative',
						zIndex: 2,
					}}
				/>
				{/* Blurred background IF objectFit is 'contain' */}
				{objectFit === 'contain' && 
					// This div is a container that clips the edges of the blurred image
					<div style={{
						position: 'absolute',
						height: 260,
						width: '100%',
						overflow: 'hidden',
					}}>
						<CardMedia
							component='img'
							height='260'
							image={props.img}
							alt={props.imgAlt}
							title={props.imgAlt}
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

			<DialogTitle className='semi-emphasis' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}></DialogTitle>
			<DialogContent>
				<DialogContentText id='alert-dialog-slide-description' gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.text))}>
				</DialogContentText>
				{energyStatCardContents.map((cardContent, idx) => 
					<InfoCard 
						key={idx}
						variant='outlined' 
						sx={{borderColor: cardContent.color, color: '#000000', borderWidth: 'medium', fontWeight: 'bold'}}
						dangerouslySetInnerHTML={parseSpecialText(cardContent.text)}
					/>
				)}
			</DialogContent>
			<DialogActions>
				<ButtonGroup
					buttons={props.buttons}
					doPageCallback={props.doPageCallback}
					doAppStateCallback={props.doAppStateCallback}
					displayProjectDialog={props.displayProjectDialog}
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
				/>
			</DialogActions>
		</Dialog>
	);
}

export declare interface ProjectDialogProps extends ProjectDialogStateProps, ControlCallbacks { 
	onClose: () => void;
}

/**
 * Represent dialog properties managed by App.tsx/state 
 */
export declare interface ProjectDialogStateProps extends ProjectDialogControlProps {
	isOpen: boolean
}


export declare interface ProjectDialogControlProps extends DialogControlProps {
	discriminator?: string,
	cards: Resolvable<DialogCardContent[]>;
	comparisonDialogButtons?: ButtonGroupButton[];
}

export function isProjectDialogControlProps(object: any): object is ProjectDialogControlProps {
    return object.discriminator === 'project';
}

export function fillProjectDialogProps(obj: AnyDict): ProjectDialogStateProps {
	return {
		discriminator: obj.discriminator,
		isOpen: obj.isOpen || false,
		title: obj.title || '',
		text: obj.text || '',
		cards: obj.cards || [],
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
		cards: [],
		text: '',
	}
}



