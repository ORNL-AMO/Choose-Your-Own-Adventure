import { CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper } from '@mui/material';
import { parseSpecialText, PureComponentIgnoreFuncs } from '../functions-and-types';
import { styled, useTheme } from '@mui/material/styles';
import type { Breakpoint } from '@mui/material/styles';
import React, { useEffect } from 'react';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import type { ControlCallbacks, PageControl } from './controls';

export const InfoCard = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	textAlign: 'center',
	color: theme.palette.text.secondary,
	borderColor: theme.palette.primary.light,
	lineHeight: 2,
	marginTop: theme.spacing(2),
	marginBottom: theme.spacing(2),
	paddingTop: theme.spacing(2),
	paddingBottom: theme.spacing(2),
	paddingLeft: theme.spacing(0.5),
	paddingRight: theme.spacing(0.5),
}));


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

	let objectFit = (props.imgObjectFit) ? props.imgObjectFit : 'cover';
	
	function handleClose() {
		// Run onClose handler ONLY if allowClose is set to true
		if (props.allowClose === true) {
			props.onClose();
		}
	}
	
	// Info cards with border
	if (props.cardText && props.cards) throw new Error('InfoDialog: props.cardText and props.cards are mutually exclusive. Use one or the other.');
	let cardContents: DialogCardContent[] = [];
	if (props.cardText) {
		cardContents = [{
			text: props.resolveToValue(props.cardText),
			color: '#000000',
		}];
	}
	else if (props.cards) {
		cardContents = props.resolveToValue(props.cards);
	}
	const infoCards = cardContents.map((cardContent, idx) => 
		<InfoCard 
			key={idx}
			variant='outlined' 
			sx={{borderColor: cardContent.color, color: '#000000', borderWidth: 'medium', fontWeight: 'bold'}}
			dangerouslySetInnerHTML={parseSpecialText(cardContent.text)}
		/>
	);
	
	return (
		<Dialog
			fullScreen={fullScreen}
			open={props.open}
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

			{props.title === 'CONGRATULATIONS!' &&
				<DialogTitle sx={{ fontSize: '30px', textAlign: 'center' }} className='semi-emphasis' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}></DialogTitle>
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
				{infoCards}
			</DialogContent>
			<DialogActions>
				<ButtonGroup 
					buttons={props.buttons}
					doPageCallback={props.doPageCallback} 
					doAppStateCallback={props.doAppStateCallback} 
					summonInfoDialog={props.summonInfoDialog}
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
				/>
			</DialogActions>
		</Dialog>
	);
}

/**
 * Dialog pop-up that shows information.
 */
export class InfoDialog extends PureComponentIgnoreFuncs <InfoDialogProps> {
	render() {
		return (
			<InfoDialogFunc {...this.props}/>
		);
	}
}

/**
 * TS wrapper for an InfoDialog component control. 
 * Use this when definining a PageControl for code autocompletion and props checking.
 * 	**Back handling is done by buttons, not onBack**
 */
export function newInfoDialogControl(props: DialogControlProps): PageControl {
	return {
		componentClass: InfoDialog,
		controlProps: props,
		hideDashboard: 'initial'
	};
}

export declare interface DialogCardContent {
	text: string;
	color: string;
}

/**
 * Control properties specified by the scripter (in pages.tsx).
 */
export declare interface DialogControlProps {
	title: Resolvable<string>;
	text: Resolvable<string|string[]>;
	/**
	 * Shorthand for cards: [{text: <text>, color: theme.palette.primary.light}] - mutually exclusive with cards
	 */
	cardText?: Resolvable<string>;
	/**
	 * Mutually exclusive with cardText
	 */
	cards?: Resolvable<DialogCardContent[]>;
	allowClose?: boolean;
	img?: string;
	imgObjectFit?: 'cover'|'contain';
	imgAlt?: string;
	buttons?: ButtonGroupButton[];
	comparisonDialogButtons?: ButtonGroupButton[];
	handleProjectInfoViewed?: AppStateCallback;
	handleRemoveSelectedCompare?: PageCallback;
}

/**
 * Returns a new DialogStateProps object with the specified optional properties, while falling back to defaults for those not specified.
 */
export function fillDialogProps(obj: AnyDict): DialogStateProps {
	return {
		open: obj.open || false,
		title: obj.title || '',
		text: obj.text || '',
		cardText: obj.cardText || undefined,
		cards: obj.cards || undefined,
		img: obj.img || '',
		imgAlt: obj.imgAlt || '',
		allowClose: obj.allowClose || false,
		imgObjectFit: obj.imgObjectFit || undefined,
		buttons: obj.buttons || undefined,
		comparisonDialogButtons: obj.comparisonDialogButtons || undefined,
		handleProjectInfoViewed: obj.handleProjectInfoViewed
	};
}

/**
 * Dialog properties stored in app state.
 */
export declare interface DialogStateProps extends DialogControlProps {
	open: boolean;
}

/**
 * Properties sent to the InfoDialog control.
 */
export declare interface InfoDialogProps extends DialogStateProps, ControlCallbacks { 
	onClose: () => void;
}