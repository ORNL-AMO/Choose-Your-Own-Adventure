import { Box, Typography, Grid } from "@mui/material";
import { parseSpecialText } from "../functions-and-types";
import React from 'react';
import { ButtonGroup, ButtonGroupButton } from "./Buttons";
import { PaperGridItem } from "./theme";
import { ControlCallbacks, PageControl } from "./controls";

/**
 * Generic control for picking between multiple choices across multiple groups.
 */
 export class GroupedChoices extends React.Component <GroupedChoicesProps> {
	render() {
		
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
export function newGroupedChoicesControl(props: GroupedChoicesControlProps, onBack: PageCallback): PageControl {
	return {
		controlClass: GroupedChoices,
		controlProps: props,
		onBack
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
