import { Box, CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper, Typography, Grid } from "@mui/material";
import { parseSpecialText, PureComponentIgnoreFuncs } from "./functions-and-types";
import Image from 'mui-image';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';
import { ButtonGroup, ButtonGroupButton } from "./Buttons";

/* -======================================================- */
//                         CONTROLS
/* -======================================================- */

export function Emphasis(props: React.PropsWithChildren) {
	return <span className='emphasis'>{props.children}</span>;
}


// -=============- START PAGE -=============-

/**
 * Start page
 */
export function StartPage(props: StartPageProps) {
	return (
		<React.Fragment>
			<h1>
				<Image style={{'maxWidth': '400px'}} src='./images/better-plants.png' duration={0}></Image>
			</h1>
			<Typography variant="h2" component="div" gutterBottom>
				CHOOSE YOUR OWN SOLUTION!
			</Typography>
			<Typography variant="h4" component="div" gutterBottom>
				Can you decarbonize this industrial facility?
			</Typography>
			<br/>
			<ButtonGroup 
				buttons={props.buttons} 
				doPageCallback={props.doPageCallback} 
				summonInfoDialog={props.summonInfoDialog}
				resolveToValue={props.resolveToValue}
			/>
		</React.Fragment>
	);
}

/**
 * TS wrapper for a StartPage component control. 
 * Use this when definining a PageControl for code autocompletion and props checking.
 */
export function newStartPageControl(props: StartPageControlProps): PageControl {
	return {
		controlClass: StartPage,
		controlProps: props,
	};
}

// -=============- GROUPED CHOICES -=============-

/**
 * Stylized "Paper" item to go inside a grid
 */
const PaperGridItem = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.secondary,
}));

/**
 * Generic control for picking between multiple choices across multiple groups.
 */
export class GroupedChoices extends React.Component <GroupedChoicesProps> {
	render() {
		console.log('groupedchoice render');
		console.log(this.props.resolveToValue);
		
		const props = this.props;
		let numGroups = props.groups.length;
		let gridWidth = 12 / numGroups;
		
		const gridItems = props.groups.map((group, idx) => {
			
			const choices = group.choices.map((choice, idx) => {
				
				return (<Grid item xs={12} key={idx}>
					<PaperGridItem>
						<Typography variant='h4'>{choice.title}</Typography>
							<Typography variant='body1' p={2} dangerouslySetInnerHTML={parseSpecialText(choice.text)}/>
							<ButtonGroup 
								buttons={choice.buttons} 
								doPageCallback={props.doPageCallback} 
								summonInfoDialog={props.summonInfoDialog}
								resolveToValue={props.resolveToValue}
							/>
					</PaperGridItem>
				</Grid>);
			});
			
			return (<Grid item xs={12} sm={6} md={gridWidth} key={idx}>
				<Typography variant='h6' dangerouslySetInnerHTML={parseSpecialText(group.title)}/>
				<Grid container spacing={2}>
					{/* consider putting Typography title in here inside a grid item? */}
					{choices}
				</Grid>
			</Grid>);
		});
		
		return (
			<Box m={2}>
				<Typography variant='h5' dangerouslySetInnerHTML={parseSpecialText(props.title)}/>
				<br/>
				<Grid container spacing={2}>
					{gridItems}
				</Grid>
			</Box>
		);
	}
}

/**
 * TS wrapper for a GroupedChoices component control. 
 * Use this when definining a PageControl for code autocompletion and props checking.
 */
export function newGroupedChoicesControl(props: GroupedChoicesControlProps): PageControl {
	return {
		controlClass: GroupedChoices,
		controlProps: props,
	};
}

export interface Choice {
	title?: string;
	text: string;
	infoPopup?: React.ReactNode;
	disabled?: Resolvable<boolean>;
	buttons?: ButtonGroupButton[];
}

export interface GroupedChoicesGroup {
	title: string;
	choices: Choice[];
}

export interface GroupedChoicesControlProps {
	title: string;
	groups: GroupedChoicesGroup[];
}

export interface GroupedChoicesProps extends GroupedChoicesControlProps, ControlCallbacks { }


/* -======================================================- */
//                         DASHBOARD
/* -======================================================- */


export class Dashboard extends PureComponentIgnoreFuncs <DashboardProps> {
	render() {
		return (
			<>
				<Box m={2}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography variant='h3'>Dashboard</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Finances available: ${this.props.financesAvailable.toLocaleString('en-US')} / ${this.props.totalBudget.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Money spent: ${this.props.moneySpent.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Carbon reduction: {this.props.carbonReduced.toLocaleString('en-US')}%</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Carbon emissions: {this.props.carbonEmissions.toLocaleString('en-US')} metric tons</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Rebates: ${this.props.totalRebates.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
					</Grid>
				</Box>
				{/* todo something prettier */}
				<hr/> 
			</>
		);
	}
}

export interface DashboardProps {
	totalBudget: number;
	financesAvailable: number;
	carbonReduced: number;
	carbonEmissions: number;
	moneySpent: number;
	totalRebates: number;
	// todo brownie points
}

/* -======================================================- */
//                      INFO DIALOG
/* -======================================================- */

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
			sx={{borderColor: cardContent.color}}
			dangerouslySetInnerHTML={parseSpecialText(cardContent.text)}
		/>
	);
	
	const cardImage = (props.img) ? 
		<CardMedia
			component="img"
			height="260"
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
			aria-describedby="alert-dialog-slide-description"
		>
			{cardImage}
			<DialogTitle className='semi-emphasis' dangerouslySetInnerHTML={parseSpecialText(props.title)}></DialogTitle>
			<DialogContent>
				<DialogContentText id="alert-dialog-slide-description" gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.text)}>
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
 */
export function newInfoDialogControl(props: DialogControlProps): PageControl {
	return {
		controlClass: InfoDialog,
		controlProps: props,
	};
}

declare interface DialogCardContent {
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

/* -======================================================- */
//                      PROPS INTERFACES
/* -======================================================- */

/**
 * Callbacks sent to every control. Component props extend this interface.
 */
export interface ControlCallbacks {
	doPageCallback: (callback?: PageCallback) => void;
	summonInfoDialog: (props) => void;
	resolveToValue: <T> (value: Resolvable<T>) => T;
}

// -=============- START PAGE -=============-

/**
 * Control properties specified by the scripter (in pages.tsx).
 */
export declare interface StartPageControlProps {
	buttons?: ButtonGroupButton[];
}

export declare interface StartPageProps extends StartPageControlProps, ControlCallbacks { }

// -=============- PAGE CONTROL -=============-

/**
 * Generic type for a PageControl.
 * @param controlClass Class for this component.
 * @param controlProps Properties sent to the control, NOT INCLUDING extra properties/handlers sent from App.tsx such as doPageCallback()
 */
export declare interface PageControl {
	controlClass: Component;
	controlProps: AnyDict;
}