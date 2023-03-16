import React from 'react';
import {
	Avatar,
	Box,
	Button,
	Card,
	CardActions,
	CardContent,
	CardHeader,
	MobileStepper,
	Grid,
	List,
	ListItem,
	Typography,
	Divider,
	TableContainer,
	Table,
	TableHead,
	TableRow,
	TableCell,
	TableBody,
	Paper,
	ThemeProvider,
	ListItemText,
} from '@mui/material';
import type { ControlCallbacks, PageControl } from './controls';
import { Emphasis } from './controls';
import type { TrackedStats } from '../trackedStats';
import { emptyTrackedStats } from '../trackedStats';
import { calculateYearSavings } from '../trackedStats';
import { calculateAutoStats } from '../trackedStats';
import { statsGaugeProperties } from '../trackedStats';
import type { CompletedProject, NumberApplier } from '../Projects';
import Projects from '../Projects';
import {
	clampRatio,
	parseSpecialText,
	rightArrow,
	shortenNumber,
	toPercent,
	withSign,
} from '../functions-and-types';
import GaugeChart from './GaugeChart';
import { darkTheme } from './theme';

export class YearRecap extends React.Component<YearRecapProps> {

	render() {
		const thisYearStart = this.props.yearRangeInitialStats[this.props.year - 1];
		if (!thisYearStart) {
			throw new Error(
				`Could not find stats for the start of year ${this.props.year} (index ${this.props.year - 1
				})`
			);
		}

		// As we loop through the projects, we'll mutate this object and provide gauge charts for how the stats changed
		let mutableStats: TrackedStats = { ...thisYearStart };
		// Since hidden surprises will change stats, we need to keep track of the hidden changes for our sanity check later
		let hiddenStatDiff: TrackedStats = { ...emptyTrackedStats };

		const projectRecaps: JSX.Element[] = [];
		let implementedProjects = [...this.props.implementedProjects].map(project => Projects[project]);

		let totalUtilityRebates = 0;
		let rebateProjects = implementedProjects.filter(project => {
			let rebateValue = Number(project.utilityRebateValue);
			if (rebateValue) {
				totalUtilityRebates += rebateValue;
				return project;
			}
		});
		if (totalUtilityRebates) {
			const utilityRebateText = `Your project selections qualify you for your local utility’s energy efficiency {rebate program}. You will receive a $\{${totalUtilityRebates.toLocaleString('en-US')} utility credit} for implementing energy efficiency measures.`;
			projectRecaps.push(
				<ListItem key={`${utilityRebateText}_surprise_`}>
					<ThemeProvider theme={darkTheme}>
						<Card className='year-recap-rebate-surprise' sx={{ width: '100%' }}>
							<CardHeader
								avatar={
									<Avatar
										sx={{ bgcolor: rebateProjects[0].rebateAvatar.backgroundColor, color: rebateProjects[0].rebateAvatar.color }}
									>
										{rebateProjects[0].rebateAvatar.icon}
									</Avatar>
								}
								title='Congratulations!'
								subheader='Utility Rebates Earned'
							/>
							<CardContent>
								<Typography variant='body1' dangerouslySetInnerHTML={parseSpecialText(utilityRebateText)} />
									{rebateProjects.map((project, idx) => {
									return <List dense={true} key={project.shortTitle + idx}>
										<ListItem>
											<ListItemText
												primary={project.title}
												secondary={project.shortTitle}
											/>
										</ListItem>
									</List>} // eslint-disable-line 
								)}
							</CardContent>
						</Card>
					</ThemeProvider>
				</ListItem>
			);
		}


		implementedProjects.forEach(project => {
			if (project.recapSurprises) {
				projectRecaps.push(
					...project.recapSurprises.map((projectSurprise, idx) => {
						return (
							<ListItem key={`${project.pageId.description}_surprise_${idx}`}>
								<ThemeProvider theme={darkTheme}>
									<Card className='year-recap-hidden-surprise' sx={{width: '100%'}}>
										<CardHeader
											avatar={
												<Avatar 
													sx={{bgcolor: projectSurprise.avatar.backgroundColor, color: projectSurprise.avatar.color}}
												>
													{projectSurprise.avatar.icon}
												</Avatar>
											}
											title={project.title}
											subheader={project.shortTitle}
										/>
										<CardContent>
											<Typography variant='body1' dangerouslySetInnerHTML={parseSpecialText(projectSurprise.text)}/>
										</CardContent>
									</Card>
								</ThemeProvider>
							</ListItem>
						);
					})
				);
			}
		});
		
		let nextYearFinancesAvailable = this.props.financesAvailable;
		for (let i in this.props.implementedProjects) {
			let projectKey = this.props.implementedProjects[i];
			
			const thisProject = Projects[projectKey];
			if (!thisProject)
				throw new Error(
					`Project for page ${projectKey.description} not defined`
				);

			let gaugeCharts: JSX.Element[] = [];
			// Go through the project's "actual" stats appliers and create a gauge chart for each one
			for (let key in thisProject.statsActualAppliers) {
				let thisApplier: NumberApplier = thisProject.statsActualAppliers[key];
				let thisGaugeProps = statsGaugeProperties[key];
				if (!thisGaugeProps) {
					console.log(
						`No dashboardStatsGaugeProperties for ${key} (check Dashboard.tsx)`
					);
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
						text={
							(difference < 0 ? '-' : '+') +
							Math.abs(difference).toLocaleString('en-US')
						}
						label={thisGaugeProps.label}
						ticks={[
							{
								label: shortenNumber(newValue),
								value: clampRatio(newValue, thisGaugeProps.maxValue),
							},
						]}
					/>
				);
			}
			// Go through the project's "hidden" stat appliers... but don't create a gauge chart for them.
			// 	Could do it in one loop and create gauge charts for the sum of actual plus hidden stats, in the future...
			for (let key in thisProject.statsRecapAppliers) {
				let thisApplier: NumberApplier = thisProject.statsRecapAppliers[key];
				let oldValue = mutableStats[key];
				let newValue = thisApplier.applyValue(oldValue);
				let difference = newValue - oldValue;
				mutableStats[key] = newValue;
				hiddenStatDiff[key] = difference;
			}
			
			let prevCarbonSavings = mutableStats.carbonSavings;
			mutableStats = calculateAutoStats(mutableStats); // update carbonEmissions and carbonSavings
			thisProject.applyCost(mutableStats); // update financesAvailable, totalBudget, and moneySpent

			const totalYearEndRebates = thisProject.getYearEndRebates();
			const yearEndNetCost = thisProject.getYearEndNetCost();
			const totalYearEndExtraCosts = thisProject.getHiddenCost();

			nextYearFinancesAvailable -= totalYearEndExtraCosts;
			nextYearFinancesAvailable += totalYearEndRebates;
			gaugeCharts.push(
				<GaugeChart
					key={'carbonSavings'}
					width={250}
					value1={prevCarbonSavings}
					color1='#888888'
					value2={mutableStats.carbonSavings}
					color2='#000000'
					text={
						withSign(
							(mutableStats.carbonSavings - prevCarbonSavings) * 100,
							1
						) + '%'
					}
					backgroundColor={'#88888820'}
					label='Carbon savings'
					ticks={[
						{
							label: toPercent(mutableStats.carbonSavings),
							value: mutableStats.carbonSavings,
						},
						{
							label: '50%',
							value: 0.5,
						},
					]}
				/>
			);
			projectRecaps.push(
				<ListItem key={projectKey.description}>
					<Card sx={{ width: '100%' }}>
						<Grid
							container
							spacing={2}
							justifyContent='center'
							alignItems='center'
						>
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
									{thisProject.caseStudy && (
										<>
											<p className='emphasis'>
												Case Study - {thisProject.caseStudy.title}
											</p>
											<p
												dangerouslySetInnerHTML={parseSpecialText(
													thisProject.caseStudy.text
												)}
												className='noMarginBottom'
											/>
										</>
									)}
								</CardContent>
							</Grid>
							<Grid item xs={12} md={6} className='year-recap-charts'>
								{gaugeCharts}
								<div style={{ width: '100%', textAlign: 'center' }}>
									<Typography variant='body1'>
										<>
											Initial project cost:{' '}
											<Emphasis money>
												${thisProject.cost.toLocaleString('en-US')}
											</Emphasis>
											{' '}
											&nbsp; Rebates:{' '}
											<Emphasis money>
												${totalYearEndRebates.toLocaleString('en-US')}
											</Emphasis>
											{' '}
											&nbsp; Extra costs:{' '}
											<Emphasis money>
												${totalYearEndExtraCosts.toLocaleString('en-US')}
											</Emphasis>
										</>
									</Typography>
									<Typography variant='body1'>
										Net cost:{' '}
										<Emphasis money>
											${yearEndNetCost.toLocaleString('en-US')}
										</Emphasis>
									</Typography>
								</div>
							</Grid>
						</Grid>
						{thisProject.caseStudy && (
							<CardActions>
								<Button
									variant='text'
									href={thisProject.caseStudy.url}
									target='_blank'
								>
									Read case study
								</Button>
							</CardActions>
						)}
					</Card>
				</ListItem>
			);
		}

		// Sanity check! The current year "real" stats are spread directly into this.props
		// for (let key in mutableStats) {
		// 	if(key !== 'year') {
		// 		if (typeof this.props[key] !== 'undefined') {
		// 			if ((this.props[key] + hiddenStatDiff[key]) !== mutableStats[key]) {
		// 				console.error(
		// 					`Uh oh! Stat ${key} does not match. In props: ${this.props[key]}, in mutableStats: ${mutableStats[key]}, in hiddenStatDiff: ${hiddenStatDiff[key]}`
		// 				);
		// 			}
		// 		}
		// 	}
		// }
		const noDecimalsFormatter = Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0, 
			maximumFractionDigits: 0, 
		});
		const savings = calculateYearSavings(thisYearStart, mutableStats);
		const naturalGasSavingsFormatted: string = noDecimalsFormatter.format(savings.naturalGas);
		const electricitySavingsFormatted: string = noDecimalsFormatter.format(savings.electricity);
		
		const nextYearFinancesAvailableFormatted: string = noDecimalsFormatter.format(nextYearFinancesAvailable);
		return (
			<>
				<Box m={2}>
					<Typography variant='h3'>Year {this.props.year} Recap</Typography>
					<Typography variant='h5'>
						This year, your company saved{' '}
						<Emphasis>${naturalGasSavingsFormatted}</Emphasis>{' '}
						on natural gas and{' '}
						<Emphasis>${electricitySavingsFormatted}</Emphasis>{' '}
						on electricity!
					</Typography>
					<Typography variant='body1'>
						This will be added to your budget for next year, as well as the{' '}
						<Emphasis>${nextYearFinancesAvailableFormatted}</Emphasis> of your budget
						that was not yet spent.
					</Typography>
					{/* <Divider/> */}
					<Typography variant='body1' marginTop={2}>
						These are the projects you have selected for this year. Make sure to
						check out the case studies, where real companies have applied these
						ideas!
					</Typography>
					<List>{projectRecaps}</List>
					{/* Completed projects: Only display if there have been completed projects */}
					{this.props.completedProjects.length > 0 && <>
						<Divider/>
						<Typography variant='body1' marginTop={2}>Projects already completed:</Typography>
						<Box m={2}>
							<TableContainer component={Paper}>
								<Table sx={{ minWidth: 650 }} aria-label='simple table'>
									<TableHead>
										<TableRow>
											<TableCell>Project</TableCell>
											<TableCell align='right'>Case study</TableCell>
											{/* Add more stats here */}
										</TableRow>
									</TableHead>
									<TableBody>
										{this.props.completedProjects.map((project) => {
											let projectSymbol: symbol = project.page;
											const thisProject = Projects[projectSymbol];
											// todo 15 - low priority - let's use id's here instead of description
											return (<TableRow
												key={projectSymbol.description}
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												<TableCell component='th' scope='row'>
													{thisProject.title}
												</TableCell>
												<TableCell align='right'>
													{thisProject.caseStudy ? 
													<a href={thisProject.caseStudy.url} target='_blank' rel='noreferrer'>{thisProject.caseStudy.title}</a> : 
													''}
												</TableCell>
											</TableRow>);
										})
										}
									</TableBody>
								</Table>
							</TableContainer>
						</Box>
					</>
					}
				</Box>
				<MobileStepper
					variant='progress'
					steps={10}
					position='static'
					activeStep={this.props.year}
					backButton={<Box sx={{ width: 180 }}></Box>}
					nextButton={
						<Button
							sx={{ width: 180 }}
							variant='text'
							onClick={() => this.props.handleYearRecap(mutableStats)}
							endIcon={rightArrow()}
						>
							Proceed to year {this.props.year + 1}
						</Button>
					}
				/>
			</>
		);
	}
}

/**
 * TS wrapper for a GroupedChoices component control.
 * Use this when definining a PageControl for code autocompletion and props checking.
 */
export function newYearRecapControl(
	props: YearRecapControlProps,
	onBack: PageCallback
): PageControl {
	return {
		componentClass: YearRecap,
		controlProps: props,
		onBack,
		hideDashboard: true,
	};
}

export interface YearRecapControlProps {} // eslint-disable-line 

export interface YearRecapProps
	extends YearRecapControlProps,
		ControlCallbacks,
		TrackedStats {
	implementedProjects: symbol[];
	completedProjects: CompletedProject[];
	yearRangeInitialStats: TrackedStats[];
	/**
	 * @param yearFinalStats The final stats for the year, including hidden surprises.
	 */
	handleYearRecap: (yearFinalStats: TrackedStats) => void;
}
