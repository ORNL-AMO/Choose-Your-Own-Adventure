import React from 'react';
import {
	Avatar,
	Box,
	Button,
	Card,
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
import type { TrackedStats, YearCostSavings } from '../trackedStats';
import { statsGaugeProperties, getYearCostSavings, setCarbonEmissionsAndSavings } from '../trackedStats';
import type { CompletedProject, NumberApplier, GameSettings, RenewableProject, ProjectControl } from '../Projects';
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
import InfoIcon from '@mui/icons-material/Info';
import YearRecapCharts from './YearRecapCharts';

export class YearRecap extends React.Component<YearRecapProps> {

	// todo render is being triggered twice
	render() {

		debugger;
		// this.props.year what does this represent? current year
		// * initialCurrentYearStats - READ ONLY stats 
		const initialCurrentYearStats = this.props.yearRangeInitialStats[this.props.currentGameYear - 1];
		// * mutableStats - mutates as we calculate current year recap
		let mutableStats: TrackedStats = { ...initialCurrentYearStats };
		let recapResults: YearRecapResults = buildRecapCardsAndResults(this.props, initialCurrentYearStats, mutableStats);
		
		
		const noDecimalsFormatter = Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});
		const naturalGasSavingsFormatted: string = noDecimalsFormatter.format(recapResults.yearCostSavings.naturalGas);
		const electricitySavingsFormatted: string = noDecimalsFormatter.format(recapResults.yearCostSavings.electricity);
		const carbonSavingsPercentFormatted: string = (mutableStats.carbonSavingsPercent * 100).toFixed(2);
		const unspentBudgetFormatted: string = noDecimalsFormatter.format(recapResults.unspentBudget);
		const yearEndTotalSpendingFormatted: string = noDecimalsFormatter.format(recapResults.yearEndTotalSpending);
		debugger;
		// formatting new value? or existing
		const totalNetCostFormatted: string = noDecimalsFormatter.format(mutableStats.yearEndTotalSpending);
		const costPerCarbonSavingsFormatted: string = mutableStats.costPerCarbonSavings !== undefined ? Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(mutableStats.costPerCarbonSavings) : '0';
		
		let barGraphData: BarGraphData = getBarGraphData(this.props, mutableStats);

		return (
			<>
				<Divider />
				<MobileStepper
					variant='progress'
					steps={this.props.totalGameYears}
					position='static'
					activeStep={this.props.currentGameYear - 1}
					LinearProgressProps={{ sx: { height: '16px', width: '50%' } }}
					sx={{ padding: '.75rem' }}
					backButton={<Box sx={{ width: 180 }}></Box>}
					nextButton={getNextButton(this.props, mutableStats)}
				/>
				<Box m={2}>
					{this.props.totalGameYears == 5 &&
						<Typography variant='h3'>Years {this.props.gameYearDisplayOffset} and {this.props.gameYearDisplayOffset + 1} Recap</Typography>
					}
					{this.props.totalGameYears == 10 &&
						<Typography variant='h3'>Year {this.props.currentGameYear} Recap</Typography>
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
										<span>You spent{' '}<Emphasis>${yearEndTotalSpendingFormatted}</Emphasis>{' '} including hidden costs. You have spent{' '}<Emphasis>${totalNetCostFormatted}</Emphasis>{' '} total.</span>
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
					
					<List>{recapResults.projectRecapCards}</List>

					<YearRecapCharts barGraphData={barGraphData.carbonSavingsPercent} width={1200} height={500} totalGameYears={this.props.totalGameYears} graphTitle={'Carbon Savings (%)'} unitLable={'%'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'carbon'}/>
					<YearRecapCharts barGraphData={barGraphData.totalSpending} width={1200} height={500} totalGameYears={this.props.totalGameYears} graphTitle={'Total Money Spent (10K $)'} unitLable={'10K $'} currentYear={this.props.currentGameYear} domainYaxis={300} id={'money'} />
					<YearRecapCharts barGraphData={barGraphData.costPerCarbon} width={1200} height={500} totalGameYears={this.props.totalGameYears} graphTitle={'Cost per kg ($/kg)'} unitLable={'$/kg'} currentYear={this.props.currentGameYear} domainYaxis={1} id={'cost'}/>
					<YearRecapCharts barGraphData={barGraphData.naturalGas} width={1200} height={500} totalGameYears={this.props.totalGameYears} graphTitle={'Natural Gas Use (10K MMBtu)'} unitLable={'10K MMBtu'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'naturalGas'}/>
					<YearRecapCharts barGraphData={barGraphData.electricity} width={1200} height={500} totalGameYears={this.props.totalGameYears} graphTitle={'Electricity Use (M kWh)'} unitLable={'M kWh'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'electricity'}/>
					<YearRecapCharts barGraphData={barGraphData.hydrogen} width={1200} height={500} totalGameYears={this.props.totalGameYears} graphTitle={'Hydrogen Use (10K MMBtu)'} unitLable={'10K MMBtu'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'hydrogen'}/>

					{this.props.completedProjects.length > 0 && <>
						<Divider />
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
										{this.props.completedProjects.map((project, index) => {
											let projectSymbol: symbol = project.page;
											const completedProject = Projects[projectSymbol];
											return (<TableRow
												key={`${projectSymbol.description}_${index}`}
												sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
											>
												<TableCell component='th' scope='row'>
													{completedProject.title}
												</TableCell>
												<TableCell align='right'>
													{completedProject.caseStudy ?
														<a href={completedProject.caseStudy.url} target='_blank' rel='noreferrer'>{completedProject.caseStudy.title}</a> :
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
							steps={this.props.totalGameYears}
							position='static'
							activeStep={this.props.currentGameYear - 1}
							LinearProgressProps={{ sx: { height: '16px', width: '50%' } }}
							sx={{ padding: '.75rem' }}
							backButton={<Box sx={{ width: 180 }}></Box>}
							nextButton={getNextButton(this.props, mutableStats)}
						/>
					</>
					}

				</Box>
			</>
		);
	}

}

/**
* Returns YearRecapResults and cards, mutates mutableStats and props
*/
function buildRecapCardsAndResults(props: YearRecapProps, initialCurrentYearStats: TrackedStats, mutableStats: TrackedStats): YearRecapResults {
	let recapResults: YearRecapResults = {
		projectRecapCards: [],
		unspentBudget: props.financesAvailable,
		yearEndTotalSpending: 0,
		yearCostSavings: {
			naturalGas: 0,
			electricity: 0,
			hydrogen: 0
		}
	};

	let implementedProjects: ProjectControl[] = [...props.implementedProjectsIds].map(project => Projects[project]);
	addPreviousRenewablesForDisplay(props.implementedRenewableProjects, mutableStats, implementedProjects);
	addRebateRecapCard(implementedProjects, recapResults.projectRecapCards);
	addSurpriseEventCards(implementedProjects, recapResults.projectRecapCards);
	
	// * creating new array - the original MUST be modified below as a workaround to project state/setup
	// todo low-priority find a way to not modify props original
	let implementedRenewableProjectsCopy: RenewableProject[] = props.implementedRenewableProjects.map(project => { return { ...project } });
	// * WARNING - mutableStats: TrackedStats for each iteration below represents the stats 
	// * with current projects modifiers, not the cumulative stats for the year
	let projectNetCost = 0;
	let totalProjectExtraCosts = 0;
	implementedProjects.forEach(implementedProject => {
		// * projectIndividualizedStats === renewable project savings calculation need stats only mutated by that project (instead of mutatedStats which tracks all projects)
		const projectIndividualizedStats: TrackedStats = { ...initialCurrentYearStats };
		let gaugeCharts: JSX.Element[] = [];
		const renewableProject = implementedRenewableProjectsCopy.find(project => project.page === implementedProject.pageId);
		let hasImplementationYearSavings = false;
		if (renewableProject) {
			hasImplementationYearSavings = renewableProject.yearStarted !== mutableStats.currentGameYear;
		}

		// * actualStatsAppliers
		applyStatsFromImplementation(implementedProject, projectIndividualizedStats, mutableStats, gaugeCharts, hasImplementationYearSavings);
		// * recapStatsAppliers
		applyEndOfYearStats(implementedProject, mutableStats, hasImplementationYearSavings);
		addCarbonSavingsGauge(mutableStats, gaugeCharts, props.defaultTrackedStats);
		implementedProject.applyCost(mutableStats);

		if (implementedProject.isRenewable) {
			projectNetCost = implementedProject.getYearEndTotalSpending(mutableStats.gameYearInterval);
			const renewableProjectIndex = props.implementedRenewableProjects.findIndex(project => project.page === implementedProject.pageId);

			// * Need to assign/save individualized project savings to be applied in each renewable year recap - later years don't change savings state, only display values 
			if (renewableProjectIndex >= 0) {
				if (props.implementedRenewableProjects[renewableProjectIndex].yearStarted === initialCurrentYearStats.currentGameYear) {
					// * WARNING changes state/props implementedRenewableProjects state directly
					// todo 22 / 88 no other visible sane way to update this - should probably be done in componentDidMount / useEffect
					props.implementedRenewableProjects[renewableProjectIndex].yearlyFinancialSavings = getYearCostSavings(initialCurrentYearStats, projectIndividualizedStats);
					console.log(`${String(props.implementedRenewableProjects[renewableProjectIndex].page)} budget period savings, ${props.implementedRenewableProjects[renewableProjectIndex].yearlyFinancialSavings?.electricity}`);
				}
			}
		} else {
			projectNetCost = implementedProject.getYearEndTotalSpending();
		}

		recapResults.yearEndTotalSpending += projectNetCost;
		totalProjectExtraCosts = implementedProject.getHiddenCost();
		recapResults.unspentBudget -= totalProjectExtraCosts;
		recapResults.unspentBudget += implementedProject.getYearEndRebates();
		mutableStats.financesAvailable = recapResults.unspentBudget;

		addImplementedProjectRecapCard(
			implementedProject, 
			mutableStats, 
			recapResults, 
			gaugeCharts, 
			projectNetCost, 
			totalProjectExtraCosts);
	});


	// * total net costs / (% CO2 saved * (ngEmissionRate * ngUseInitial + electEmissionRate * electUseInitial));
	mutableStats.yearEndTotalSpending = initialCurrentYearStats.yearEndTotalSpending + recapResults.yearEndTotalSpending;
	setCostPerCarbonSavings(mutableStats);
	recapResults.yearCostSavings = getYearCostSavings(initialCurrentYearStats, mutableStats);
	setRenewableProjectResults(implementedRenewableProjectsCopy, mutableStats, initialCurrentYearStats, recapResults.yearCostSavings);

	return recapResults;
}

/**
* Set mutable stats costPerCarbonSavings
*/
function setCostPerCarbonSavings(mutableStats: TrackedStats) {
	let costPerCarbonSavings = 0;
	if (mutableStats.yearEndTotalSpending > 0 && mutableStats.carbonSavingsPerKg > 0) {
		costPerCarbonSavings = mutableStats.yearEndTotalSpending / mutableStats.carbonSavingsPerKg;
	}
	mutableStats.costPerCarbonSavings = costPerCarbonSavings;
}

/**
* Set savings and costs related to renewable projects 
*/
function setRenewableProjectResults(implementedRenewableProjectsCopy: RenewableProject[], mutableStats: TrackedStats, initialCurrentYearStats: TrackedStats, yearCostSavings: YearCostSavings) {
	implementedRenewableProjectsCopy.forEach((project: RenewableProject) => {
		// * on first year of renewable project implementation :
		// * YearRecap displays savings accurately, subsequent years don't - so we're appending to savings
		// * onProceed accurately adds savings, so don't add savings to financesAvailable 
		if (project.yearlyFinancialSavings && project.gameYearsImplemented.includes(initialCurrentYearStats.currentGameYear)
			&& project.yearStarted !== initialCurrentYearStats.currentGameYear
			&& initialCurrentYearStats.currentGameYear !== 1) {
			console.log(`${String(project.page)} renewable savings added', ${project.yearlyFinancialSavings.electricity}`);
			yearCostSavings.electricity += project.yearlyFinancialSavings.electricity;
			yearCostSavings.naturalGas += project.yearlyFinancialSavings.naturalGas;

			// * only update financesAvailable with renewable savings (other savings applied at recap)
			mutableStats.financesAvailable += project.yearlyFinancialSavings.electricity;
			mutableStats.financesAvailable += project.yearlyFinancialSavings.naturalGas;
		}
	});
}

/**
* Add card for an implemented project
*/
function addImplementedProjectRecapCard(implementedProject: ProjectControl, 
	mutableStats: TrackedStats, 
	recapResults: YearRecapResults, 
	gaugeCharts: JSX.Element[],
	projectNetCost: number,
	totalExtraCosts: number) {

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

	let yearMultiplier = 1;
	if (implementedProject.isRenewable) {
		yearMultiplier = mutableStats.gameYearInterval;
	}
	const initialCost = implementedProject.cost * yearMultiplier;

	recapResults.projectRecapCards.push(
		<ListItem key={String(implementedProject.pageId)}>
			<Card sx={{ width: '100%' }}>
				<Grid
					container
					spacing={2}
					justifyContent='center'
					alignItems='center'
				>
					<Grid item xs={12} md={6}>
						<CardHeader
							title={implementedProject.title}
							// subheader={implementedProject.shortTitle}
							sx={headerStyle}
						/>
						<CardContent>
							<Typography variant='body1' sx={{ textAlign: 'left', fontSize: '18px', fontWeight: '400', color: '#000000', }} dangerouslySetInnerHTML={parseSpecialText(implementedProject.shortTitle)} />
							{implementedProject.caseStudy && (
								<>
									<Link href={implementedProject.caseStudy.url} underline='always' target='_blank' rel='noopener'>
										<p style={{ color: '#1D428A', fontSize: '24px', fontWeight: '500' }}>
											Case Study - {implementedProject.caseStudy.title}
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
										${initialCost.toLocaleString('en-US')}
									</Emphasis>
									{' '}
									&nbsp; Rebates:{' '}
									<Emphasis money>
										${implementedProject.getYearEndRebates().toLocaleString('en-US')}
									</Emphasis>
									{' '}
									&nbsp; Extra costs:{' '}
									<Emphasis money>
										${totalExtraCosts.toLocaleString('en-US')}
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

/**
* Add already implemented/processed renewables to display alongside implemented projects
*/
function addPreviousRenewablesForDisplay(implementedRenewableProjects: RenewableProject[], mutableStats: TrackedStats, implementedProjects: ProjectControl[]) {
	// todo verify this
	implementedRenewableProjects.forEach(project => {
		if (project.gameYearsImplemented.includes(mutableStats.currentGameYear)) {
			implementedProjects.push(Projects[project.page]);
		}
	});
}


/**
* Add recap cards for "surprises".
*/
function addSurpriseEventCards(implementedProjects: ProjectControl[], projectRecapCards: JSX.Element[]) {
	implementedProjects.forEach(project => {
		if (project.recapSurprises) {
			projectRecapCards.push(
				...project.recapSurprises.map((projectSurprise, idx) => {
					return (
						<ListItem key={`${project.pageId.description}_surprise_${idx}`}>
							<ThemeProvider theme={darkTheme}>
								<Card className='year-recap-hidden-surprise' sx={{ width: '100%' }}>
									<CardHeader
										avatar={
											<Avatar
											sx={{ bgcolor: projectSurprise.avatar.backgroundColor, color: projectSurprise.avatar.color }}
											>
												{projectSurprise.avatar.icon}
											</Avatar>
										}
										title={project.title}
										subheader={project.shortTitle}
										/>
									<CardContent>
										<Typography variant='body1' dangerouslySetInnerHTML={parseSpecialText(projectSurprise.text)} />
									</CardContent>
								</Card>
							</ThemeProvider>
						</ListItem>
					);
				})
				);
		}
	});
}

/**
* Add card for total utility rebate. Some rebates may happen multiple times (renewable projects)
*/
function addRebateRecapCard(implementedProjects: ProjectControl[], projectRecapCards: JSX.Element[]) {
	let totallyUtilityRebateDollars = 0;
	let rebateProjects: ProjectControl[] = implementedProjects.filter(project => {
		let rebateValue = Number(project.utilityRebateValue);
		if (rebateValue) {
			totallyUtilityRebateDollars += rebateValue;
			return project;
		}
	});
	
	if (totallyUtilityRebateDollars) {
	const utilityRebateText = `Your project selections qualify you for your local utility’s energy efficiency {rebate program}. 
	You will receive a $\{${totallyUtilityRebateDollars.toLocaleString('en-US')} utility credit} for implementing energy efficiency measures.`;
	projectRecapCards.push(
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
							</List>
						} // eslint-disable-line 
						)}
					</CardContent>
				</Card>
			</ThemeProvider>
		</ListItem>
	);
	}
}

/**
* Stats applied for: implementing a project, gauge charts, or other display purpose
*/
function applyStatsFromImplementation(implementedProject: ProjectControl,
	projectIndividualizedStats: TrackedStats,
	mutableStats: TrackedStats,
	gaugeCharts: JSX.Element[],
	hasImplementationYearSavings: boolean) {

	for (let key in implementedProject.statsActualAppliers) {
		let thisApplier: NumberApplier = implementedProject.statsActualAppliers[key];
		let yearMultiplier = 1;
		if (thisApplier.isAbsolute) {
			yearMultiplier = mutableStats.gameYearInterval;
		}
		let oldValue = mutableStats[key];
		let newValue = hasImplementationYearSavings ? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
		let difference = newValue - oldValue;
		mutableStats[key] = newValue;

		let oldProjectValue = projectIndividualizedStats[key];
		let newProjectValue = hasImplementationYearSavings ? oldProjectValue : thisApplier.applyValue(oldProjectValue, yearMultiplier);
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

}

/**
* Stats applied for at end of budget period, i.e. 1 year or 2 years if playing short game
*/
function applyEndOfYearStats(implementedProject: ProjectControl,
	mutableStats: TrackedStats,
	hasImplementationYearSavings: boolean) {

	for (let key in implementedProject.statsRecapAppliers) {
		let thisApplier: NumberApplier = implementedProject.statsRecapAppliers[key];
		let oldValue = mutableStats[key];
		let yearMultiplier = 1;
		if (thisApplier.isAbsolute) {
			yearMultiplier = mutableStats.gameYearInterval;
		}
		let newValue = hasImplementationYearSavings ? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
		mutableStats[key] = newValue;
	}

}

/**
* Build gauge with new carbon savings percent, calculated using previous budget period carbon savings
*/
function addCarbonSavingsGauge(mutableStats: TrackedStats,
	gaugeCharts: JSX.Element[],
	defaultTrackedStats: TrackedStats,
	) {

		let prevYearCarbonSavingsPercent = mutableStats.carbonSavingsPercent;
		mutableStats = setCarbonEmissionsAndSavings(mutableStats, defaultTrackedStats);
		let newCarbonSavingsPercent = mutableStats.carbonSavingsPercent;

		gaugeCharts.push(
			<GaugeChart
				key={'carbonSavings'}
				width={250}
				value1={prevYearCarbonSavingsPercent}
				color1='#888888'
				value2={newCarbonSavingsPercent}
				color2='#000000'
				text={
					withSign(
						(newCarbonSavingsPercent - prevYearCarbonSavingsPercent) * 100,
						1
					) + '%'
				}
				backgroundColor={'#88888820'}
				label='Carbon savings'
				ticks={[
					{
						label: toPercent(newCarbonSavingsPercent),
						value: newCarbonSavingsPercent,
					},
					{
						label: '50%',
						value: 0.5,
					},
				]}
			/>
		);
}

function getBarGraphData(props: YearRecapProps, mutableStats: TrackedStats): BarGraphData {
	let barGraphData: BarGraphData = {
		carbonSavingsPercent: [],
		costPerCarbon: [],
		naturalGas: [],
		hydrogen: [],
		electricity: [],
		totalSpending: [],
	};

	props.yearRangeInitialStats.forEach(year => {
		barGraphData.carbonSavingsPercent.push(year.carbonSavingsPercent * 100);
	});
	barGraphData.carbonSavingsPercent.push(mutableStats.carbonSavingsPercent * 100);

	let predictionCarbon: number;
	if (props.totalGameYears === 10) {
		predictionCarbon = 5;
	} else {
		predictionCarbon = 10;
	}
	for (let i = props.currentGameYear; i < props.totalGameYears; i++) {
		barGraphData.carbonSavingsPercent.push((predictionCarbon * (i + 1)));
	}

	props.yearRangeInitialStats.forEach(year => {
		barGraphData.naturalGas.push(year.naturalGasMMBTU / 10000);
	});
	barGraphData.naturalGas.push(mutableStats.naturalGasMMBTU / 10000);
	for (let i = props.currentGameYear; i < props.totalGameYears; i++) {
		barGraphData.naturalGas.push(mutableStats.naturalGasMMBTU / 10000);
	}

	props.yearRangeInitialStats.forEach(year => {
		barGraphData.electricity.push(year.electricityUseKWh / 1000000);
	});
	barGraphData.electricity.push(mutableStats.electricityUseKWh / 1000000);
	for (let i = props.currentGameYear; i < props.totalGameYears; i++) {
		barGraphData.electricity.push(mutableStats.electricityUseKWh / 1000000);
	}

	props.yearRangeInitialStats.forEach(year => {
		barGraphData.hydrogen.push(year.hydrogenMMBTU / 10000);
	});
	barGraphData.hydrogen.push(mutableStats.hydrogenMMBTU / 10000);
	for (let i = props.currentGameYear; i < props.totalGameYears; i++) {
		barGraphData.hydrogen.push(mutableStats.hydrogenMMBTU / 10000);
	}

	props.yearRangeInitialStats.forEach(year => {
		barGraphData.totalSpending.push(year.yearEndTotalSpending / 10000);
	});
	barGraphData.totalSpending.push(mutableStats.yearEndTotalSpending / 10000);
	// todo should include hiddenSpending
	let predictionImplementationSpending: number = mutableStats.yearEndTotalSpending;
	for (let i = props.currentGameYear; i < props.totalGameYears; i++) {
		if (props.totalGameYears === 10) {
			predictionImplementationSpending += 75000;
		} else {
			predictionImplementationSpending += 150000;
		}
		barGraphData.totalSpending.push(predictionImplementationSpending / 10000);
	}

	props.yearRangeInitialStats.forEach(year => {
		barGraphData.costPerCarbon.push(year.costPerCarbonSavings);
	});
	barGraphData.costPerCarbon.push(mutableStats.costPerCarbonSavings);
	for (let i = props.currentGameYear; i < props.totalGameYears; i++) {
		barGraphData.costPerCarbon.push(mutableStats.costPerCarbonSavings);
	}

	return barGraphData;
}


function getNextButton(props: YearRecapProps, mutableStats: TrackedStats) {
	let nextbuttonText = `Proceed to year ${props.currentGameYear + 1}`;
	// end of game
	if (props.totalGameYears === props.currentGameYear) {
		nextbuttonText = 'View Score';
	} else if (props.totalGameYears === 5) {
		nextbuttonText = `Proceed to years ${props.gameYearDisplayOffset + 2} and ${props.gameYearDisplayOffset + 3}`;
	}
	return <Button
		variant='outlined'
		size='medium'
		onClick={() => props.handleNewYearSetup(mutableStats)}
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

export interface YearRecapControlProps { } // eslint-disable-line 

export interface YearRecapProps
	extends YearRecapControlProps,
	ControlCallbacks,
	TrackedStats,
	GameSettings {
	implementedProjectsIds: symbol[];
	completedProjects: CompletedProject[];
	implementedRenewableProjects: RenewableProject[];
	yearRangeInitialStats: TrackedStats[];
	defaultTrackedStats: TrackedStats;
	/**
	 * @param yearFinalStats The final stats for the year, including hidden surprises.
	 */
	handleNewYearSetup: (yearFinalStats: TrackedStats) => void;
}

export interface YearRecapResults {
	projectRecapCards: JSX.Element[],
	unspentBudget: number,
	yearEndTotalSpending: number,
	yearCostSavings: YearCostSavings
}

export interface BarGraphData {
	carbonSavingsPercent: number[],
	costPerCarbon: number[]
	naturalGas: number[],
	electricity: number[],
	hydrogen: number[],
	totalSpending: number[],
}
