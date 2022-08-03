import { Box, Typography, Grid } from '@mui/material';
import { parseSpecialText } from '../functions-and-types';
import React from 'react';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import { PaperGridItem } from './theme';
import type { ControlCallbacks, PageControl } from './controls';

/**
 * Generic control for picking between multiple choices across multiple groups.
 */
export class GroupedChoices extends React.Component <GroupedChoicesProps> {
	render() {
		
		const props = this.props;
		let numGroups = props.groups.length;
		let gridWidth = 12 / numGroups;
		
		const gridItems = props.groups.map((group, idx) => {
			
			const choices = group.choices
			.filter(choice => {
				return props.resolveToValue(choice.visible, true);}) // Filter out choices that are not currently visible
			.map((choice, idx) => {
				
				return (<Grid item xs={12} key={choice.key || idx}>
					<PaperGridItem>
						<Typography variant='h4'>{props.resolveToValue(choice.title)}</Typography>
							<Typography variant='body1' p={2} dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(choice.text))}/>
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
				<Typography variant='h6' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(group.title))}/>
				<Grid container spacing={2}>
					{/* consider putting Typography title in here inside a grid item? */}
					{choices}
				</Grid>
			</Grid>);
		});
		
		return (
			<Box m={2}>
				<Typography variant='h5' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}/>
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
export function newGroupedChoicesControl(props: GroupedChoicesControlProps, onBack: PageCallback): PageControl {	
	return {
		controlClass: GroupedChoices,
		controlProps: props,
		onBack,
		hideDashboard: props.hideDashboard
	};
}

export interface Choice {
	title?: Resolvable<string>;
	text: Resolvable<string>;
	infoPopup?: React.ReactNode;
	disabled?: Resolvable<boolean>;
	buttons?: ButtonGroupButton[];
	/**
	 * Whether the choice will appear in the list.
	 */
	visible?: Resolvable<boolean>;
	/**
	 * Unkque key for React's internal use (if using a symbol, use symbol.description to turn it into a string)
	 */
	key?: string;
}

export interface GroupedChoicesGroup {
	title: string;
	choices: Choice[];
}

export interface GroupedChoicesControlProps {
	title: Resolvable<string>;
	groups: GroupedChoicesGroup[];
	hideDashboard: boolean|'initial';
}

export interface GroupedChoicesProps extends GroupedChoicesControlProps, ControlCallbacks { }
