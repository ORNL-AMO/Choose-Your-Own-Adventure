import { CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper } from '@mui/material';
import { parseSpecialText, PureComponentIgnoreFuncs } from '../../functions-and-types';
import { useTheme } from '@mui/material/styles';
import React, { useEffect } from 'react';
import { ButtonGroup } from '../Buttons';
import { DialogCardContent, DialogControlProps, DialogStateProps, InfoCard } from './dialog-functions-and-types';
import { ControlCallbacks, PageControl } from '../controls';

/**
 * Dialog pop-up that shows general information, standalone app page dialogs.
 */
export class InfoDialog extends PureComponentIgnoreFuncs <InfoDialogProps> {
	render() {
		return (
			<InfoDialogFunc {...this.props}/>
		);
	}
}

/**
 * Using a sub-function because `useMediaQuery` requires React hooks, which are only allowed in function-style React components, 
 * but InfoDialog is using a class declaration so we can tell it when it should/should not re-render.
 */
function InfoDialogFunc (props: InfoDialogProps) {
	const theme = useTheme();
	let fullScreen = useMediaQuery(theme.breakpoints.down('sm'));	

	let imgHeight = '260';
	if( props.title === 'CONGRATULATIONS!' ){
		fullScreen = true;
		imgHeight = '390';
	}
	let objectFit = (props.imgObjectFit) ? props.imgObjectFit : 'cover';
	
	function handleClose() {
		// Run onClose handler ONLY if allowClose is set to true
		if (props.allowClose === true) {
			props.onClose();
		}
	}
	
	useEffect(() => {
		// avoid page jump - delay button display until dialog open
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
				{/* below div is a container that clips the edges of the blurred image */}
				{objectFit === 'contain' && 
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

			{props.title === 'CONGRATULATIONS!' &&
				<DialogTitle sx={{ fontSize: '42px', textAlign: 'center' }} className='semi-emphasis' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}></DialogTitle>
			}
			{props.title !== 'CONGRATULATIONS!' &&
				<DialogTitle className='semi-emphasis' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}></DialogTitle>
			}
			<DialogContent>
				{props.title === 'CONGRATULATIONS!' &&
					<DialogContentText sx={{ fontSize: '28px', textAlign: 'center' }} id='alert-dialog-slide-description' gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.text))}>
					</DialogContentText>
				}
				{props.title !== 'CONGRATULATIONS!' &&
					<DialogContentText id='alert-dialog-slide-description' gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.text))}>
					</DialogContentText>
				}
			</DialogContent>

			<DialogActions>
				<ButtonGroup 
					buttons={props.buttons}
					doPageCallback={props.doPageCallback} 
					doAppStateCallback={props.doAppStateCallback} 
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
				/>
			</DialogActions>
		</Dialog>
	);
}


export declare interface InfoDialogProps extends InfoDialogStateProps, ControlCallbacks { 
	onClose: () => void;
}

/**
 * Represent dialog properties managed by App.tsx/state 
 */
export declare interface InfoDialogStateProps extends InfoDialogControlProps {
	isOpen: boolean
}


export declare interface InfoDialogControlProps extends DialogControlProps {
	cardText?: Resolvable<string>;
}

/**
 * Returns a new DialogStateProps object with the specified optional properties, while falling back to defaults for those not specified.
 */
export function fillInfoDialogProps(obj: AnyDict): InfoDialogStateProps {
	return {
		isOpen: obj.isOpen || false,
		cardText: obj.cardText || '',
		title: obj.title || '',
		text: obj.text || '',
		img: obj.img || '',
		imgAlt: obj.imgAlt || '',
		allowClose: obj.allowClose || false,
		imgObjectFit: obj.imgObjectFit || undefined,
		buttons: obj.buttons || undefined,
		handleProjectInfoViewed: obj.handleProjectInfoViewed
	};
}

export function getEmptyInfoDialogState() {
	return {
		isOpen: false,
		title: '',
		text: '',
	}
}

/**
 *  return PageControl for a standalone app dialog page
 */
export function newAppPageDialogControl(props: InfoDialogControlProps): PageControl {
	return {
		componentClass: InfoDialog,
		controlProps: props,
		hideDashboard: 'initial'
	};
}



