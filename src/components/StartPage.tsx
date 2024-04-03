import React from 'react';
import { Typography } from '@mui/material';
import Image from 'mui-image';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import type { ControlCallbacks, PageControl } from './controls';

/**
 * Start page
 */
export function StartPage(props: StartPageProps) {
	return (
		<React.Fragment>
			<h1>
				<Image style={{'maxWidth': '400px'}} src='./images/better-plants.png' duration={0}></Image>
			</h1>
			<Typography variant='h2' component='div' gutterBottom>
				CHOOSE YOUR OWN SOLUTION!
			</Typography>
			<Typography variant='h4' component='div' gutterBottom>
				Can you decarbonize this industrial facility?
			</Typography>
			<br/>
			<ButtonGroup 
				buttons={props.buttons} 
				doPageCallback={props.doPageCallback} 
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
		componentClass: StartPage,
		controlProps: props,
		hideDashboard: true,
	};
}

/**
 * Control properties specified by the scripter (in pages.tsx).
 */
export declare interface StartPageControlProps {
	buttons?: ButtonGroupButton[];
}

export declare interface StartPageProps extends StartPageControlProps, ControlCallbacks { }