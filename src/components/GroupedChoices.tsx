import { Box, Typography, Grid, CardHeader } from '@mui/material';
import { parseSpecialText, resolveToValue } from '../functions-and-types';
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
				let disabled = resolveToValue(choice.disabled, false);
				let headerStyle;
				let choiceButtons: ButtonGroupButton[] | undefined = choice.buttons;
				if (props.isProjectGroupChoice) {
					headerStyle = {
						'& .MuiCardHeader-title': {
							textAlign: 'left',
							fontSize: '1.25rem'
						},
					};

					// if (choice.buttons) {
					// 	// todo 25 still display but make disabled
					// 	choiceButtons = choice.buttons.filter(button => {
					// 		const shouldDisplay = props.resolveToValue(button.shouldDisplay, false);
					// 		return shouldDisplay;
					// 	});
					// }
				}
				return (<Grid item xs={12} key={choice.key || idx}>
					<PaperGridItem
						sx={{ 
							opacity: disabled ? 0.8 : 1,
							paddingBottom: '1rem'		
						}} // if disabled, lower opacity
					>
						<CardHeader
							action={
									<ButtonGroup
										buttons={choice.choiceStats}
										disabled={disabled}
										doPageCallback={props.doPageCallback}
										summonInfoDialog={props.summonInfoDialog}
										resolveToValue={props.resolveToValue}
										isProjectGroupChoice={props.isProjectGroupChoice}
									/>
							}
							title={props.resolveToValue(choice.title)}
							sx={headerStyle}
						/>

						<Typography variant='body1' p={2} pt={0} dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(choice.text))}  
							textAlign={props.isProjectGroupChoice? 'left': 'center'}
						/>
						<ButtonGroup
							buttons={choiceButtons}
							disabled={disabled}
							doPageCallback={props.doPageCallback}
							summonInfoDialog={props.summonInfoDialog}
							resolveToValue={props.resolveToValue}
							doAppStateCallback={props.doAppStateCallback}
							isProjectGroupChoice={props.isProjectGroupChoice}
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
		componentClass: GroupedChoices,
		controlProps: props,
		onBack,
		hideDashboard: props.hideDashboard
	};
}

/**
 * A choice within a group.
 */
export interface Choice {
	/**
	 * Title of the choice. Can be an empty string to make it not appear.
	 */
	title?: Resolvable<string>;
	/**
	 * Text/description of the choice.
	 */
	text: Resolvable<string>;
	disabled?: Resolvable<boolean>;
	// Quick/small stats to include in card headers or elsewhere 
	choiceStats?: ButtonGroupButton[]
	/**
	 * Buttons to appear at the bottom of the choice.
	 */
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

/**
 * A group of Choices.
 */
export interface GroupedChoicesGroup {
	/**
	 * Title of the group. Can be an empty string to make it not appear.
	 */
	title: string;
	choices: Choice[];
}

export interface GroupedChoicesControlProps {
	/**
	 * Title of the entire GroupedChoices page.
	 */
	allowImplementProjects?: symbol[]
	title: Resolvable<string>;
	groups: GroupedChoicesGroup[];
	isProjectGroupChoice?: boolean;
	hideDashboard: boolean|'initial';
}

export interface GroupedChoicesProps extends GroupedChoicesControlProps, ControlCallbacks { 
}
