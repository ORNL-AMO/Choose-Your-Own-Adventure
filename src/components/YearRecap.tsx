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
import { ButtonGroupButton } from './Buttons';
import YearRecapCharts from './YearRecapCharts';

export class YearRecap extends React.Component<YearRecapProps> {

	render() {
		const budgetPeriodInitialStats = this.props.yearRangeInitialStats[this.props.year - 1];
		if (!budgetPeriodInitialStats) {
			throw new Error(
				`Could not find stats for the start of year ${this.props.year} (index ${this.props.year - 1
				})`
			);
		}

		// As we loop through the projects, we'll mutate this object and provide gauge charts for how the stats changed
		let mutableStats: TrackedStats = { ...budgetPeriodInitialStats };
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
		
		let unspentBudget = this.props.financesAvailable;
		let yearEndNetCost = 0;

		// * WARNING - mutableStats: TrackedStats for each iteration below represents the stats 
		// * with current projects modifiers, not the cumulative stats for the year
		for (let i in implementedProjects) {
			// * renewal project savings calculation need stats that are mutated only at project scope (instead of mutatedStats which tracks all projects)
			const projectIndividualizedStats: TrackedStats = { ...budgetPeriodInitialStats };

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
				let yearMultiplier = 1;
				if (thisApplier.isAbsolute) {
					yearMultiplier = mutableStats.gameYears;
				}
				
				let oldValue = mutableStats[key];
				let newValue = skipRenewalSavings? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
				let difference = newValue - oldValue;
				mutableStats[key] = newValue;
				
				// todo 88 method
				let oldProjectValue = projectIndividualizedStats[key];
				let newProjectValue = skipRenewalSavings? oldProjectValue : thisApplier.applyValue(oldProjectValue, yearMultiplier);
				projectIndividualizedStats[key] = newProjectValue;

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
					let yearMultiplier = 1;
					if (thisApplier.isAbsolute) {
						yearMultiplier = mutableStats.gameYears;
					}
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
					if (renewalProjectIndex >= 0) {
						if (this.props.projectsRequireRenewal[renewalProjectIndex].yearStarted === budgetPeriodInitialStats.year) {
							// * WARNING changes state/props projectsRequireRenewal state directly
							// todo 22 / 88 no other visible sane way to update this - should probably be done in componentDidMount / useEffect
							this.props.projectsRequireRenewal[renewalProjectIndex].yearlyFinancialSavings = calculateYearSavings(budgetPeriodInitialStats, projectIndividualizedStats);
							console.log(`${String(this.props.projectsRequireRenewal[renewalProjectIndex].page)} budget period savings, ${this.props.projectsRequireRenewal[renewalProjectIndex].yearlyFinancialSavings?.electricity}`);
						}
					}

				} else {
					projectNetCost = thisProject.getYearEndNetCost();
				}
				let yearMultiplier = 1;
				if (thisProject.renewalRequired) {
					yearMultiplier = mutableStats.gameYears;
				}
				const initialProjectCost = thisProject.cost * yearMultiplier;
				yearEndNetCost += projectNetCost;
				const totalYearEndExtraCosts = thisProject.getHiddenCost();
				unspentBudget -= totalYearEndExtraCosts;
				unspentBudget += totalYearEndRebates;
				mutableStats.financesAvailable = unspentBudget;

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
									// subheader={thisProject.shortTitle}
									sx={headerStyle}
								/>							
								<CardContent>
									<Typography variant='body1' sx={{textAlign: 'left',	fontSize: '18px', fontWeight: '400',color: '#000000',}} dangerouslySetInnerHTML={parseSpecialText(thisProject.shortTitle)} />
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
		mutableStats.totalMoneySpent = budgetPeriodInitialStats.totalMoneySpent + yearEndNetCost;
		let costPerCarbonSavings = 0;
		if (mutableStats.totalMoneySpent > 0 && mutableStats.carbonSavingsPerKg > 0) {
			costPerCarbonSavings = mutableStats.totalMoneySpent / mutableStats.carbonSavingsPerKg;
		}
		mutableStats.costPerCarbonSavings = costPerCarbonSavings;

		const savings = calculateYearSavings(budgetPeriodInitialStats, mutableStats);
		console.log('budget period savings', savings);
		projectsRequireRenewal.forEach((project: RenewalProject) => {
			// * on first year of renewal project implementation :
			// * YearRecap displays savings accurately, subsequent years don't - so we're appending to savings
			// * onProceed accurately adds savings, so don't add savings to financesAvailable 
			if (project.yearlyFinancialSavings && project.yearsImplemented.includes(budgetPeriodInitialStats.year) 
				&& project.yearStarted !== budgetPeriodInitialStats.year
				&& budgetPeriodInitialStats.year !== 1) {
					console.log(`${String(project.page)} renewable savings added', ${project.yearlyFinancialSavings.electricity}`);
					savings.electricity += project.yearlyFinancialSavings.electricity;
					savings.naturalGas += project.yearlyFinancialSavings.naturalGas;

					// * only update financesAvailable with renewable savings (other savings applied at recap)
					mutableStats.financesAvailable += project.yearlyFinancialSavings.electricity;
					mutableStats.financesAvailable += project.yearlyFinancialSavings.naturalGas;
				}
			});
		
		const naturalGasSavingsFormatted: string = noDecimalsFormatter.format(savings.naturalGas);
		const electricitySavingsFormatted: string = noDecimalsFormatter.format(savings.electricity);
		const carbonSavingsPercentFormatted: string = (mutableStats.carbonSavingsPercent * 100).toFixed(2);
		
		const unspentBudgetFormatted: string = noDecimalsFormatter.format(unspentBudget);
		const yearEndNetCostFormatted: string = noDecimalsFormatter.format(yearEndNetCost);
		const totalNetCostFormatted: string = noDecimalsFormatter.format(mutableStats.totalMoneySpent);
		const costPerCarbonSavingsFormatted: string = costPerCarbonSavings !== undefined? Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0, 
			maximumFractionDigits: 2, 
		}).format(costPerCarbonSavings) : '0';

		let carbonSavingsPercentBarGraphData: number[] = [];
		this.props.yearRangeInitialStats.forEach(year =>{
			carbonSavingsPercentBarGraphData.push(year.carbonSavingsPercent * 100);
		});
		carbonSavingsPercentBarGraphData.push(mutableStats.carbonSavingsPercent * 100);

		let naturalGasPercentBarGraphData: number[] = [];
		this.props.yearRangeInitialStats.forEach(year =>{
			naturalGasPercentBarGraphData.push(year.naturalGasMMBTU / 10000);
		});
		naturalGasPercentBarGraphData.push(mutableStats.naturalGasMMBTU / 10000);

		let electricitySavingsPercentBarGraphData: number[] = [];
		this.props.yearRangeInitialStats.forEach(year =>{
			electricitySavingsPercentBarGraphData.push(year.electricityUseKWh / 1000000);
		});
		electricitySavingsPercentBarGraphData.push(mutableStats.electricityUseKWh / 1000000);

		let totalMoneySpentBarGraphData: number[] = [];
		this.props.yearRangeInitialStats.forEach(year =>{
			totalMoneySpentBarGraphData.push(year.totalMoneySpent / 10000);
		});
		totalMoneySpentBarGraphData.push(mutableStats.totalMoneySpent / 10000);


		
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
					nextButton={getNextButton(this.props, mutableStats)}
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
											This budget period, your company saved{' '}
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
											This will be added to your budget for the next period, as well as the{' '}
											<Emphasis>${unspentBudgetFormatted}</Emphasis> of your budget
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
							nextButton={getNextButton(this.props, mutableStats)}
						/>
					</>
					}
					<YearRecapCharts barGraphData={carbonSavingsPercentBarGraphData} width={1000} height={500} totalIterations={this.props.totalIterations} graphTitle={'Carbon Savings (%)'} unitLable={'%'}/>
					<YearRecapCharts barGraphData={totalMoneySpentBarGraphData} width={1000} height={500} totalIterations={this.props.totalIterations} graphTitle={'Total Money Spent ($)'} unitLable={'10K $'}/>
					<YearRecapCharts barGraphData={naturalGasPercentBarGraphData} width={1000} height={500} totalIterations={this.props.totalIterations} graphTitle={'Natural Gas Use (MMBtu)'} unitLable={'10K MMBtu'}/>
					<YearRecapCharts barGraphData={electricitySavingsPercentBarGraphData} width={1000} height={500} totalIterations={this.props.totalIterations} graphTitle={'Electricity Use (kWh)'} unitLable={'M kWh'}/>

				</Box>
			</>
		);
	}

}

function getNextButton(props: YearRecapProps, mutableStats: TrackedStats) {
	let nextbuttonText = `Proceed to year ${props.year + 1}`;
	// end of game
	if (props.totalIterations === props.year) {
		nextbuttonText = 'View Score';
	} else if (props.totalIterations === 5) {
		nextbuttonText = `Proceed to years ${props.yearInterval + 2} and ${props.yearInterval + 3}`;
	} 
	return <Button
		variant='outlined'
		size='medium'
		onClick={() => props.handleYearRecap(mutableStats)}
		endIcon={rightArrow()}>
		<Typography variant='button'>{nextbuttonText}</Typography>
	</Button>
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
