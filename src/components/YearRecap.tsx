import React from 'react';
import { Avatar, Box, Button, Card, CardActions, CardContent, CardHeader, MobileStepper, Grid, List, ListItem, Typography, Divider } from '@mui/material';
import type { ControlCallbacks, PageControl } from './controls';
import { Emphasis } from './controls';
import type { TrackedStats } from '../trackedStats';
import { calculateYearSavings } from '../trackedStats';
import { calculateAutoStats } from '../trackedStats';
import {statsGaugeProperties} from '../trackedStats';
import FactoryIcon from '@mui/icons-material/Factory';
import type { NumberApplier } from '../projects';
import Projects from '../projects';
import { clampRatio, parseSpecialText, rightArrow, shortenNumber, toPercent, withSign } from '../functions-and-types';
import GaugeChart from './GaugeChart';

export class YearRecap extends React.Component <YearRecapProps> {
	render() {
		
		let thisYearStart = this.props.yearlyTrackedStats[this.props.year - 1];
		if (!thisYearStart) {
			throw new Error(`Could not find stats for the start of year ${this.props.year} (index ${this.props.year - 1})`);
		}
		
		// As we loop through the projects, we'll mutate this object and provide gauge charts for how the stats changed
		let mutableStats: TrackedStats = {...thisYearStart};
		// todo: hidden surprises
		
		const projectRecaps = this.props.selectedProjects.map((projectKey, idx) => {
			
			const thisProject = Projects[projectKey];
			if (!thisProject) throw new Error(`Project for page ${projectKey.description} not defined`);
			
			let gaugeCharts: JSX.Element[] = [];
			// Go through the project's "actual" stats appliers and create a gauge chart for each one
			for (let key in thisProject.statsActualAppliers) {
				let thisApplier: NumberApplier = thisProject.statsActualAppliers[key];
				let thisGaugeProps = statsGaugeProperties[key];
				if (!thisGaugeProps) {
					console.log(`No dashboardStatsGaugeProperties for ${key} (check Dashboard.tsx)`);
					continue;
				}
				let oldValue = mutableStats[key];
				let newValue = thisApplier.applyValue(oldValue);
				let difference = newValue - oldValue;
				mutableStats[key] = newValue;
				
				gaugeCharts.push(
					<GaugeChart 
						key={key}
						width={250}
						backgroundColor={'#88888820'}
						value1={clampRatio(newValue, thisGaugeProps.maxValue)}
						color1={'#bbbbbba0'}
						value2={clampRatio(oldValue, thisGaugeProps.maxValue)}
						color2={thisGaugeProps.color}
						text={(difference < 0 ? '-' : '+') + Math.abs(difference).toLocaleString('en-US')}
						label={thisGaugeProps.label}
						ticks={[{
							label: shortenNumber(newValue),
							value: clampRatio(newValue, thisGaugeProps.maxValue)
						}]}
					/>
				);
			}
			let prevCarbonSavings = mutableStats.carbonSavings;
			mutableStats = calculateAutoStats(mutableStats); // update carbonEmissions and carbonSavings
			thisProject.applyCost(mutableStats); // update financesAvailable, totalBudget, and moneySpent
			
			gaugeCharts.push(<GaugeChart
				key={'carbonSavings'}
				width={250}
				value1={prevCarbonSavings}
				color1='#888888'
				value2={mutableStats.carbonSavings}
				color2='#000000'
				text={withSign((mutableStats.carbonSavings - prevCarbonSavings) * 100, 1) + '%'}
				backgroundColor={'#88888820'}
				label='Carbon savings'
				ticks={[{
					label: toPercent(mutableStats.carbonSavings),
					value: mutableStats.carbonSavings,
				}, {
					label: '50%',
					value: 0.5,
				}]}
			/>);
			// todo hidden, no idea how i'm gonna imp that
			
			
			return <ListItem key={projectKey.description}>
				<Card sx={{width: '100%'}}>
					<Grid container spacing={2} justifyContent='center' alignItems='center'>
						<Grid item xs={12} md={6}>
							<CardHeader
								avatar={
									<Avatar color={thisProject.recapAvatar.backgroundColor}>
										{thisProject.recapAvatar.icon}
									</Avatar>
								}
								title={thisProject.title}
								subheader={thisProject.shortTitle}
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
						<Grid item xs={12} md={6} className='year-recap-charts'> 
							{gaugeCharts}
							<div style={{width: '100%', textAlign: 'center'}}>
								<Typography variant='body1'>
									Initial project cost: <Emphasis money>${thisProject.cost.toLocaleString('en-US')}</Emphasis> &nbsp;
									Rebates: <Emphasis money>${thisProject.getRebates().toLocaleString('en-US')}</Emphasis>
								</Typography>
								<Typography variant='body1'>Net cost: <Emphasis money>${thisProject.getNetCost().toLocaleString('en-US')}</Emphasis></Typography>
							</div>
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
			</ListItem>;
		});
		
		// Sanity check! The current year "real" stats are spread directly into this.props
		for (let key in mutableStats) {
			if (typeof this.props[key] !== 'undefined') {
				if (this.props[key] !== mutableStats[key]) {
					console.error(`Uh oh! Stat ${key} does not match. In props: ${this.props[key]}, in mutableStats: ${mutableStats[key]}`);
				}
			}
		}
		
		let savings = calculateYearSavings(thisYearStart, mutableStats);
		
		return (<>
			<Box m={2}>
				<Typography variant='h3'>Year {this.props.year} Recap</Typography>
				<Typography variant='h5'>
					This year, your company saved <Emphasis>${savings.naturalGas.toLocaleString('en-US')}</Emphasis> on natural gas and <Emphasis>${savings.electricity.toLocaleString('en-US')}</Emphasis> on electricity!
				</Typography>
				<Typography variant='body1'>
					This will be added to your budget for next year, as well as the <Emphasis>${this.props.financesAvailable}</Emphasis> of your budget that was not yet spent.
				</Typography>
				<Divider/>
				
				<List >
					<ListItem>
					<Typography variant='body1'>These are the projects you have selected. Make sure to check out the case studies, where real companies have applied these ideas!</Typography>
					</ListItem>
					{projectRecaps}
				</List>
			</Box>
			<MobileStepper
				variant='progress'
				steps={10}
				position='static'
				activeStep={this.props.year}
				backButton={
					<Box sx={{width: 180}}></Box>
				}
				nextButton={
					<Button
						sx={{width: 180}}
						variant='text'
						onClick={this.props.handleYearRecap}
						endIcon={rightArrow()}
					>
						Proceed to year {this.props.year + 1}
					</Button>
				}
			/> 
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
		onBack,
		hideDashboard: true,
	};
}

export interface YearRecapControlProps { }

export interface YearRecapProps extends YearRecapControlProps, ControlCallbacks, TrackedStats { 
	selectedProjects: symbol[];
	yearlyTrackedStats: TrackedStats[];
	handleYearRecap: () => void;
}