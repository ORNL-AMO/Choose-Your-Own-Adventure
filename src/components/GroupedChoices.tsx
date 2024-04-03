import { Box, Typography, Grid, CardHeader, Divider, Button, ToggleButtonGroup, ToggleButton } from '@mui/material';
import { parseSpecialText, resolveToValue } from '../functions-and-types';
import React from 'react';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import { PaperGridItem } from './theme';
import type { ControlCallbacks, PageControl } from './controls';
import { Stack } from '@mui/system';
import type { SelectedProject } from '../ProjectControl';
import { FinancingOption } from '../Financing';

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
				// let implemented = resolveToValue(choice.implemented, false);
				let disabled = resolveToValue(choice.disabled, false);
				let paperStyle = { 
					opacity: disabled ? 0.8 : 1,
					paddingBottom: '1rem',					
					color: '#000000'	
				};
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
						// className={implemented? 'implementedChoiceBorder' : undefined}
						sx={paperStyle} // if disabled, lower opacity
					>
						<CardHeader
							action={
									<ButtonGroup
										buttons={choice.energySavingsPreviewIcons}
										disabled={disabled}
										doPageCallback={props.doPageCallback}
										displayProjectDialog={props.displayProjectDialog}
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
							displayProjectDialog={props.displayProjectDialog}
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
		
		const isProjectPage1 = props.resolveToValue(props.title).includes('Scope 1');
		const isProjectPage2 = props.resolveToValue(props.title).includes('Scope 2');
		
		return (
			<Box m={2}>
				<Typography variant='h5' dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))} />
				<br />
				{(isProjectPage1 || isProjectPage2) &&
					<Stack direction='row'
						justifyContent='end'
						alignItems='center'
						spacing={2}>
						<Button
							size='medium'
							variant='outlined'
							disabled={props.selectedProjectsForComparison && props.selectedProjectsForComparison.length < 1}
							onClick={() => {
								if (props.handleClearProjectsClick) {
									props.resolveToValue(props.handleClearProjectsClick());
								}
							}}
							style={{ margin: '10px' }}>
							Clear Comparisons
						</Button>
						<Button
							size='medium'
							variant='contained'
							disabled={props.selectedProjectsForComparison && props.selectedProjectsForComparison.length < 2}
							onClick={() => {
								if (props.selectedProjectsForComparison && props.selectedProjectsForComparison.length >= 2 && props.handleCompareProjectsClick) {
									props.resolveToValue(props.handleCompareProjectsClick());
								}
							}}
							style={{ margin: '10px' }}>
							Compare Selected Projects
						</Button>
					</Stack>
				}
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
	implemented?: Resolvable<boolean>;
	// Quick/small stats to include in card headers or elsewhere 
	energySavingsPreviewIcons?: ButtonGroupButton[]
	financingOption?: FinancingOption;
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
	availableProjectIds?: symbol[]
	selectedProjectsForComparison?: SelectedProject[];
	handleClearProjectsClick?: () => void;
	handleCompareProjectsClick?: () => void;
	title: Resolvable<string>;
	groups: GroupedChoicesGroup[];
	isProjectGroupChoice?: boolean;
	hideDashboard: boolean|'initial';
}

export interface GroupedChoicesProps extends GroupedChoicesControlProps, ControlCallbacks { 
}
