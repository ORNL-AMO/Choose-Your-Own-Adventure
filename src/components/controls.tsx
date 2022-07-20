import { Box, CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper, Typography, Grid } from "@mui/material";
import { parseSpecialText, PureComponentIgnoreFuncs } from "../functions-and-types";
import Image from 'mui-image';
import { styled, useTheme } from '@mui/material/styles';
import React from 'react';
import { ButtonGroup, ButtonGroupButton } from "./Buttons";
import { PaperGridItem } from "./theme";

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


/* -======================================================- */
//                         DASHBOARD
/* -======================================================- */



/* -======================================================- */
//                      INFO DIALOG
/* -======================================================- */


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
	onBack?: PageCallback
}