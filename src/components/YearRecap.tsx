import React from 'react';
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, Divider, Grid, List, ListItem, ListItemText, Typography } from '@mui/material';
import type { ControlCallbacks, PageControl } from './controls';
import type { DashboardTrackedStats } from './Dashboard';
import { dashboardStatsGaugeProperties } from './Dashboard';
import FactoryIcon from '@mui/icons-material/Factory';
import Projects from '../projects';
import { parseSpecialText } from '../functions-and-types';

export class YearRecap extends React.Component <YearRecapProps> {
	render() {
		
		let thisYearStart = this.props.yearlyTrackedStats[this.props.year - 1];
		if (!thisYearStart) {
			throw new Error(`Could not find stats for the start of year ${this.props.year} (index ${this.props.year - 1})`);
		}
		
		// As we loop through the projects, we'll mutate this object and provide gauge charts for how the stats changed
		let mutableStats = {...thisYearStart};
		// todo: hidden surprises
		
		const projectRecaps = this.props.selectedProjects.map((projectKey, idx) => {
			
			const thisProject = Projects[projectKey];
			if (!thisProject) throw new Error(`Project for page ${projectKey.description} not defined`);
			
			let gaugeCharts = [];
			for (let key in thisProject.statsActualAppliers) {
				let thisApplier = thisProject.statsActualAppliers[key];
			}
			// todo hidden, no idea how i'm gonna imp that
			
			
			return <>
				<ListItem key={projectKey.description}>
					<Card sx={{width: '100%'}}>
						<Grid container spacing={2}>
							<Grid item xs={12} md={6}>
								<CardHeader
									avatar={
										<Avatar>
											<FactoryIcon/>
										</Avatar>
									}
									title={thisProject.title}
									subheader={thisProject.choiceInfoTitle}
								/>
								<CardContent>
									{thisProject.recapDescription}
									{thisProject.caseStudy && <>
										<p className='emphasis'>
											Case Study - {thisProject.caseStudy.title}
										</p>
										<p 
											dangerouslySetInnerHTML={parseSpecialText(thisProject.caseStudy.text)}
											className='noMarginBottom'
										/>
									</>
									}
								</CardContent>
							</Grid>
							<Grid item xs={12} md={6}>
								
							</Grid>
						</Grid>
						{thisProject.caseStudy &&
							<CardActions>
								<Button 
									variant='text'
									href={thisProject.caseStudy.url}
									target='_blank'
								>
									Read case study
								</Button>
							</CardActions>
						}
					</Card>
				</ListItem>
			</>;
		});
		
		return (<>
			<Box m={2}>
				<Typography variant='h3'>Year {this.props.year} Recap</Typography>
				<List 
					sx={{m: 2}}
				>
					{projectRecaps}
				</List>
			</Box>
		</>);
	}
}

/**
 * TS wrapper for a GroupedChoices component control. 
 * Use this when definining a PageControl for code autocompletion and props checking.
 */
export function newYearRecapControl(props: YearRecapControlProps, onBack: PageCallback): PageControl {
	return {
		controlClass: YearRecap,
		controlProps: props,
		onBack
	};
}

export interface YearRecapControlProps { }

export interface YearRecapProps extends YearRecapControlProps, ControlCallbacks, DashboardTrackedStats { 
	selectedProjects: symbol[];
	yearlyTrackedStats: DashboardTrackedStats[];
}