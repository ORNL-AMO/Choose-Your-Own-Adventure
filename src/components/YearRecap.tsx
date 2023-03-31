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
	ListItemIcon,
	Link,
} from '@mui/material';
import type { ControlCallbacks, PageControl } from './controls';
import { Emphasis } from './controls';
import type { TrackedStats } from '../trackedStats';
import { emptyTrackedStats, statsGaugeProperties, calculateYearSavings, setCarbonEmissionsAndSavings } from '../trackedStats';
import type { CompletedProject, NumberApplier, GameSettings, RenewalProject } from '../Projects';
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
import InfoIcon from '@mui/icons-material/Info'

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
		// * 22 need to create new array - the original will be modified
		let projectsRequireRenewal = this.props.projectsRequireRenewal.map(project => { return {...project}});

		// * adding to implemented projects to show display values
		projectsRequireRenewal.forEach(project => {
			if (project.yearsImplemented.includes(mutableStats.year)) {
				implementedProjects.push(Projects[project.page]);
			}
		});

		let totalUtilityRebates = 0;
		// todo 22 renewalRequired some rebates may happen multiple times
		// todo 22 surprises (negative) only happen once
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
		let yearEndNetCost = 0;

		// * WARNING - mutableStats: TrackedStats for each iteration below represents the stats 
		// * with current projects modifiers, not the cumulative stats for the year
		for (let i in implementedProjects) {
			const thisProject = implementedProjects[i];
			const projectKey = thisProject.pageId;
			if (!thisProject)
				throw new Error(
					`Project for page ${projectKey.description} not defined`
				);

			let gaugeCharts: JSX.Element[] = [];
			const renewalProject = projectsRequireRenewal.find(project => project.page === thisProject.pageId);
			let skipRenewalSavings = false;
			if (renewalProject) {
				skipRenewalSavings = renewalProject.yearStarted !== mutableStats.year;
			}
			for (let key in thisProject.statsActualAppliers) {
				let thisApplier: NumberApplier = thisProject.statsActualAppliers[key];
				let oldValue = mutableStats[key];
				let yearMultiplier = thisApplier.isAbsolute? mutableStats.gameYears : undefined;
				let newValue = skipRenewalSavings? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
				let difference = newValue - oldValue;
				mutableStats[key] = newValue;
				let thisGaugeProps = statsGaugeProperties[key];
				if (thisGaugeProps) {
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
				}

				
				// Go through the project's "hidden" stat appliers... but don't create a gauge chart for them.
				// 	Could do it in one loop and create gauge charts for the sum of actual plus hidden stats, in the future...
				for (let key in thisProject.statsRecapAppliers) {
					let thisApplier: NumberApplier = thisProject.statsRecapAppliers[key];
					let oldValue = mutableStats[key];
					let yearMultiplier = thisApplier.isAbsolute ? mutableStats.gameYears : undefined;
					let newValue = skipRenewalSavings? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
					let difference = newValue - oldValue;
					mutableStats[key] = newValue;
					hiddenStatDiff[key] = difference;
				}

				let prevCarbonSavings = mutableStats.carbonSavingsPercent;
				mutableStats = setCarbonEmissionsAndSavings(mutableStats, this.props.defaultTrackedStats);
				thisProject.applyCost(mutableStats);
				const totalYearEndRebates = thisProject.getYearEndRebates();
				
				let projectNetCost = 0;
				if (thisProject.renewalRequired) {
					projectNetCost = thisProject.getYearEndNetCost(mutableStats.gameYears);
					const renewalProjectIndex = this.props.projectsRequireRenewal.findIndex(project => project.page === thisProject.pageId);
					// * Need to assign/save individualized project savings to be applied in each renewal year recap - later years don't change savings state, only display values
					// * accurate for absolute savings appliers only
					if (renewalProjectIndex >= 0) {
						if (this.props.projectsRequireRenewal[renewalProjectIndex].yearStarted === thisYearStart.year) {
							// todo 22 no other visible sane way to update this - should probably be done in componentDidMount / useEffect
							// * 22 changes state/props projectsRequireRenewal state directly
							this.props.projectsRequireRenewal[renewalProjectIndex].yearlyFinancialSavings = calculateYearSavings(thisYearStart, mutableStats);
						}
					}
				} else {
					projectNetCost = thisProject.getYearEndNetCost();
				}
				const initialProjectCost = thisProject.cost * mutableStats.gameYears;
				yearEndNetCost += projectNetCost;
				const totalYearEndExtraCosts = thisProject.getHiddenCost();
				nextYearFinancesAvailable -= totalYearEndExtraCosts;
				nextYearFinancesAvailable += totalYearEndRebates;
				mutableStats.financesAvailable = nextYearFinancesAvailable;

				gaugeCharts.push(
					<GaugeChart
						key={'carbonSavings'}
						width={250}
						value1={prevCarbonSavings}
						color1='#888888'
						value2={mutableStats.carbonSavingsPercent}
						color2='#000000'
						text={
							withSign(
								(mutableStats.carbonSavingsPercent - prevCarbonSavings) * 100,
								1
							) + '%'
						}
					backgroundColor={'#88888820'}
					label='Carbon savings'
					ticks={[
						{
							label: toPercent(mutableStats.carbonSavingsPercent),
							value: mutableStats.carbonSavingsPercent,
						},
						{
							label: '50%',
							value: 0.5,
						},
					]}
				/>
			);
			let headerStyle = {
				'& .MuiCardHeader-title': {
					textAlign: 'left',
					fontSize: '30px',
					fontWeight: 'bold'
				},
				'& .MuiCardHeader-subheader': {
					textAlign: 'left',
					fontSize: '18px',
					fontWeight: '400',
					color: '#000000',
				},
			};

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
									title={thisProject.title}
									subheader={thisProject.shortTitle}
									sx={headerStyle}
								/>
								<CardContent>
									{thisProject.caseStudy && (
										<>
											<Link href={thisProject.caseStudy.url} underline='always' target='_blank' rel='noopener'>
												<p style={{color: '#1D428A', fontSize: '24px', fontWeight: '500' }}>
													Case Study - {thisProject.caseStudy.title}
												</p>
											</Link>
										</>
									)}
								</CardContent>
							</Grid>
							<Grid item xs={12} md={6} className='year-recap-charts'>
								{gaugeCharts}
								<div style={{ width: '100%', textAlign: 'center' }}>
									<Typography sx={{ color: 'black', fontSize: '20px', fontWeight: '500' }}>
										<>
											Initial project cost:{' '}
											<Emphasis money>
												${initialProjectCost.toLocaleString('en-US')}
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
									<Typography sx={{ color: 'black', fontSize: '20px', fontWeight: '500' }}>
										Net cost:{' '}
										<Emphasis money>
											${projectNetCost.toLocaleString('en-US')}
										</Emphasis>
									</Typography>
								</div>
							</Grid>
						</Grid>
					</Card>
				</ListItem>
			);
		}

		const noDecimalsFormatter = Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0, 
			maximumFractionDigits: 0, 
		});

		// * total net costs / (% CO2 saved * (ngEmissionRate * ngUseInitial + electEmissionRate * electUseInitial));
		const totalNetCost = thisYearStart.totalMoneySpent + yearEndNetCost;
		let costPerCarbonSavings = 0;
		if (totalNetCost > 0) {
			costPerCarbonSavings = totalNetCost / mutableStats.carbonSavingsPerKg;
		}
		mutableStats.costPerCarbonSavings = costPerCarbonSavings;

		const savings = calculateYearSavings(thisYearStart, mutableStats);
		projectsRequireRenewal.forEach((project: RenewalProject) => {
			if (project.yearlyFinancialSavings 
				&& project.yearsImplemented.includes(thisYearStart.year) 
				&& thisYearStart.year !== 1) {	
				savings.electricity += project.yearlyFinancialSavings.electricity;
				savings.naturalGas += project.yearlyFinancialSavings.naturalGas;
				// * 22 we need to display financesAvailable on this page so savings added here instead of onProceed like regular projects
				mutableStats.financesAvailable += savings.naturalGas + savings.electricity;
			}
		});
		
		const naturalGasSavingsFormatted: string = noDecimalsFormatter.format(savings.naturalGas);
		const electricitySavingsFormatted: string = noDecimalsFormatter.format(savings.electricity);
		const carbonSavingsPercentFormatted: string = (mutableStats.carbonSavingsPercent * 100).toFixed(2);
		
		const nextYearFinancesAvailableFormatted: string = noDecimalsFormatter.format(nextYearFinancesAvailable);
		const yearEndNetCostFormatted: string = noDecimalsFormatter.format(yearEndNetCost);
		const totalNetCostFormatted: string = noDecimalsFormatter.format(totalNetCost);
		const costPerCarbonSavingsFormatted: string = costPerCarbonSavings !== undefined? Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0, 
			maximumFractionDigits: 2, 
		}).format(costPerCarbonSavings) : '0';

		return (
			<>
			<Divider/>
			<MobileStepper
					variant='progress'
					steps={this.props.totalIterations}
					position='static'
					activeStep={this.props.year - 1}
					LinearProgressProps={{sx: {height: '16px', width: '50%'}}}
					sx={{ padding: '.75rem' }}
					backButton={<Box sx={{ width: 180 }}></Box>}
					nextButton={
						<Button
							variant='outlined'
							size='medium'
							onClick={() => this.props.handleYearRecap(mutableStats)}
							endIcon={rightArrow()}
						>
							{this.props.totalIterations == 5 &&								
								<Typography variant='button'>Proceed to years {this.props.yearInterval + 2} and {this.props.yearInterval + 3}</Typography>
							}
							{this.props.totalIterations == 10 &&								
								<Typography variant='button'>Proceed to year {this.props.year + 1}</Typography>
							}
						</Button>
					}
				/>
				<Box m={2}>
					{this.props.totalIterations == 5 &&
						<Typography variant='h3'>Years {this.props.yearInterval} and {this.props.yearInterval + 1} Recap</Typography>
					}
					{this.props.totalIterations == 10 &&
						<Typography variant='h3'>Year {this.props.year} Recap</Typography>
					}

					<Box sx={{ display: 'flex', justifyContent: 'center' }}>
						<List dense={true}>
						<ListItem >
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText
									primary={
										<Typography variant='h5'>
											Your company has reduced CO<sub>2</sub> Emissions by{' '}
											<Emphasis>{carbonSavingsPercentFormatted}%</Emphasis>{' '}
										</Typography>
									}
								/>
							</ListItem>
							<ListItem >
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText
									primary={
										<Typography variant='h5'>
											This year, your company saved{' '}
											<Emphasis>${naturalGasSavingsFormatted}</Emphasis>{' '}
											on natural gas and{' '}
											<Emphasis>${electricitySavingsFormatted}</Emphasis>{' '}
											on electricity!
										</Typography>
									}
								/>
							</ListItem>
							<ListItem >
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText
									primary={
										<Typography sx={{ fontSize: '20px' }} >
											This will be added to your budget for next year, as well as the{' '}
											<Emphasis>${nextYearFinancesAvailableFormatted}</Emphasis> of your budget
											that was not yet spent.
										</Typography>
									}
								/>
							</ListItem>
							<ListItem >
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText
									primaryTypographyProps={{ fontSize: '20px' }}
									primary={
										<span>You spent{' '}<Emphasis>${yearEndNetCostFormatted}</Emphasis>{' '} including hidden costs. You have spent{' '}<Emphasis>${totalNetCostFormatted}</Emphasis>{' '} total.</span>
									}
								/>
							</ListItem>
							<ListItem>
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText
									primaryTypographyProps={{ fontSize: '20px' }}
									primary={
										<span>Your cost per kg reduced was{' '}<Emphasis>${costPerCarbonSavingsFormatted}/kg CO<sub>2</sub></Emphasis>{' '}</span>
									}
								/>
							</ListItem>
						</List>
					</Box>

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
						<MobileStepper
							variant='progress'
							steps={this.props.totalIterations}
							position='static'
							activeStep={this.props.year - 1}
							LinearProgressProps={{sx: {height: '16px', width: '50%'}}}
							sx={{ padding: '.75rem' }}
							backButton={<Box sx={{ width: 180 }}></Box>}
							nextButton={
								<Button
									variant='outlined'
									size='medium'
									onClick={() => this.props.handleYearRecap(mutableStats)}
									endIcon={rightArrow()}
								>
									{this.props.totalIterations == 5 &&								
										<Typography variant='button'>Proceed to years {this.props.yearInterval + 2} and {this.props.yearInterval + 3}</Typography>
									}
									{this.props.totalIterations == 10 &&								
										<Typography variant='button'>Proceed to year {this.props.year + 1}</Typography>
									}
								</Button>
							}
						/>
					</>
					}
				</Box>
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
		TrackedStats,
		GameSettings {
	implementedProjects: symbol[];
	completedProjects: CompletedProject[];
	projectsRequireRenewal: RenewalProject[];
	yearRangeInitialStats: TrackedStats[];
	defaultTrackedStats : TrackedStats;
	/**
	 * @param yearFinalStats The final stats for the year, including hidden surprises.
	 */
	handleYearRecap: (yearFinalStats: TrackedStats) => void;
}
