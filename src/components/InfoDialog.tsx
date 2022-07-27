import { Box, CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper, Typography, Grid } from '@mui/material';
import { parseSpecialText, PureComponentIgnoreFuncs } from '../functions-and-types';
import Image from 'mui-image';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import { PaperGridItem } from './theme';
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

// TODO: Support multiple images
// 	and make vertical images look better
function InfoDialogFunc (props: InfoDialogProps) {
	const theme = useTheme();
	const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
	
	// Optional objectFit parameter
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
			text: props.cardText,
			color: theme.palette.primary.light,
		}];
	}
	else if (props.cards) {
		cardContents = props.cards;
	}
	const infoCards = cardContents.map((cardContent, idx) => 
		<InfoCard 
			key={idx}
			variant='outlined' 
			sx={{borderColor: cardContent.color, color: cardContent.color}}
			dangerouslySetInnerHTML={parseSpecialText(cardContent.text)}
		/>
	);
	
	const cardImage = (props.img) ? 
		<CardMedia
			component='img'
			height='260'
			image={props.img}
			alt={props.imgAlt}
			title={props.imgAlt}
			sx={{objectFit: objectFit}}
		/>
		: <></>;
	return (
		<Dialog
			fullScreen={fullScreen}
			open={props.open}
			keepMounted
			onClose={handleClose}
			aria-describedby='alert-dialog-slide-description'
		>
			{cardImage}
			<DialogTitle className='semi-emphasis' dangerouslySetInnerHTML={parseSpecialText(props.title)}></DialogTitle>
			<DialogContent>
				<DialogContentText id='alert-dialog-slide-description' gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.text)}>
				</DialogContentText>
				{infoCards}
			</DialogContent>
			<DialogActions>
				<ButtonGroup 
					buttons={props.buttons}
					doPageCallback={props.doPageCallback} 
					summonInfoDialog={props.summonInfoDialog}
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
					delay={props.buttonsDelay}
				/>
			</DialogActions>
		</Dialog>
	);
}

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
		controlClass: InfoDialog,
		controlProps: props,
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
	title: string;
	text: string|string[];
	/**
	 * Shorthand for cards: [{text: <text>, color: theme.palette.primary.light}] - mutually exclusive with cards
	 */
	cardText?: string;
	/**
	 * Mutually exclusive with cardText
	 */
	cards?: DialogCardContent[];
	allowClose?: boolean;
	img?: string;
	imgObjectFit?: 'cover'|'contain';
	imgAlt?: string;
	buttons?: ButtonGroupButton[];
	buttonsDelay?: number;
}

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
		buttonsDelay: obj.buttonsDelay || undefined,
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