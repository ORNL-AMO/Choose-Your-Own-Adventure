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
	CardActions,
	Container,
	CardMedia,
	Fade,
	Grow,
} from '@mui/material';
import type { ControlCallbacks, PageControl } from './controls';
import { Emphasis } from './controls';
import type { TrackedStats, YearCostSavings } from '../trackedStats';
import { statsGaugeProperties, getYearCostSavings, setCarbonEmissionsAndSavings } from '../trackedStats';
import type { CompletedProject, NumberApplier, RenewableProject, ProjectControl, RecapSurprise, ImplementedProject } from '../ProjectControl';
import {
	clampRatio,
	getIdString,
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
import Projects from '../Projects';
import { ParentSize } from '@visx/responsive';
import { GameSettings } from './SelectGameSettings';
import { CapitalFundingState, FinancingOption, getCanUseCapitalFunding, getCapitalFundingSurprise, getIsAnnuallyFinanced, isProjectFullyFunded, setCapitalFundingExpired, setCapitalFundingMilestone } from '../Financing';
import { findFinancingOptionFromProject } from '../Financing';
import { DialogFinancingOptionCard } from './Dialogs/ProjectDialog';

export class YearRecap extends React.Component<YearRecapProps, { inView }> {
	// timeout: NodeJS.Timeout;

	// constructor(props) {
	// 	super(props);

	// 	this.state = {
	// 		inView: false
	// 	};
	// 	// this.handleScroll = this.handleScroll.bind(this);
	// }

	// componentDidMount() {
	// 	debugger;
	// 	// Add scroll event listener when component mounts
	// 	window.addEventListener('scroll', this.handleScroll);
	// }

	// componentWillUnmount() {
	// 	// Remove scroll event listener when component unmounts
	// 	window.removeEventListener('scroll', this.handleScroll);
	// }

	// handleScroll() {
	// 	function isElementInViewport(el: HTMLElement) {
	// 		const rect = el.getBoundingClientRect()
	// 		return (
	// 			rect.top >= 0 &&
	// 			rect.left >= 0 &&
	// 			rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
	// 			rect.right <= (window.innerWidth || document.documentElement.clientWidth)
	// 		)
	// 	}

	// 	const surprise = document.querySelector('.year-recap-positive-surprise');
	// 	const surpriseInView = isElementInViewport(surprise as HTMLElement);
	// 	this.setState({ inView: surpriseInView });
	// 	// clearTimeout(this.timeout);
	// 	// this.timeout = setTimeout(() => {
	// 	// }, 200);
	// }

	render() {
		// * initialCurrentYearStats - READ ONLY stats 
		const initialCurrentYearStats = this.props.yearRangeInitialStats[this.props.currentGameYear - 1];
		// * mutableStats - mutates as we calculate current year recap
		let mutableStats: TrackedStats = { ...initialCurrentYearStats };
		let mutableCapitalFundingState: CapitalFundingState = { ...this.props.capitalFundingState };
		let recapResults: YearRecapResults = this.buildRecapCardsAndResults(this.props, initialCurrentYearStats, mutableStats, mutableCapitalFundingState);

		const noDecimalsFormatter = Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});
		const naturalGasSavingsFormatted: string = noDecimalsFormatter.format(recapResults.yearCostSavings.naturalGas);
		const electricitySavingsFormatted: string = noDecimalsFormatter.format(recapResults.yearCostSavings.electricity);
		const carbonSavingsPercentFormatted: string = (mutableStats.carbonSavingsPercent * 100).toFixed(2);
		const unspentBudgetFormatted: string = noDecimalsFormatter.format(recapResults.unspentBudget);
		const yearEndTotalSpendingFormatted: string = noDecimalsFormatter.format(recapResults.yearEndTotalSpending);
		// formatting new value? or existing
		const gameTotalNetCostFormatted: string = noDecimalsFormatter.format(mutableStats.yearEndTotalSpending);
		const costPerCarbonSavingsFormatted: string = mutableStats.costPerCarbonSavings !== undefined ? Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 2,
		}).format(mutableStats.costPerCarbonSavings) : '0';
		let barGraphData: BarGraphData = this.getBarGraphData(this.props, mutableStats);
		let recapWidthSx = { width: '90%', margin: 'auto' };

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
					nextButton={this.getNextButton(this.props, mutableStats, mutableCapitalFundingState)}
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
											Your company has reduced CO<sub>2</sub>e Emissions by{' '}
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
										<Typography variant={'h5'}>
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
									primary={
										<Typography variant={'h5'}>
											You spent{' '}<Emphasis>${yearEndTotalSpendingFormatted}</Emphasis>{' '} including hidden costs and rebates.
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
										<Typography variant={'h5'}>
											You have spent{' '}<Emphasis>${gameTotalNetCostFormatted}</Emphasis>{' '} throughout the game.
										</Typography>
									}
								/>
							</ListItem>
							<ListItem>
								<ListItemIcon>
									<InfoIcon />
								</ListItemIcon>
								<ListItemText
									primary={
										<Typography variant={'h5'}>
											Your cost per kg reduced was{' '}<Emphasis>${costPerCarbonSavingsFormatted}/kg CO<sub>2</sub>e</Emphasis>{' '}
										</Typography>
									}
								/>
							</ListItem>
						</List>
					</Box>

					{recapResults.projectRecapCards.length !== 0 ?
						<Box sx={recapWidthSx}>
							<Typography variant='h4' fontWeight={'500'} marginTop={3}>
								Current Projects
							</Typography>
							<Typography variant='body1' fontSize={18} sx={recapWidthSx} marginTop={.5}>
								These include projects implemented or renewed in this year.
								<br></br>
								<Emphasis>
									Check out the case studies, where real companies have applied these
									ideas!
								</Emphasis>
							</Typography>
						</Box>
						:
						<Box sx={recapWidthSx}>
							<Typography variant='h4' fontWeight={'500'} marginTop={3}>
								No Projects Selected
							</Typography>
						</Box>
					}
					<List sx={recapWidthSx}>{recapResults.projectRecapCards}</List>


					<Box sx={recapWidthSx}>
						<ParentSize>
							{(parent) => (
								<>
									<YearRecapCharts barGraphData={barGraphData.carbonSavingsPercent} width={parent.width} height={400} totalGameYears={this.props.totalGameYears} graphTitle={'GHG Reduction (%)'} unitLable={'%'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'carbon'} backgroundFill={'#eaeffb'} />
									<YearRecapCharts barGraphData={barGraphData.totalSpending} width={parent.width} height={400} totalGameYears={this.props.totalGameYears} graphTitle={'Total Money Spent (10K $)'} unitLable={'10K $'} currentYear={this.props.currentGameYear} domainYaxis={300} id={'money'} backgroundFill={'#f5f5f5'} />
									<YearRecapCharts barGraphData={barGraphData.costPerCarbon} width={parent.width} height={400} totalGameYears={this.props.totalGameYears} graphTitle={'Cost per kg ($/kg)'} unitLable={'$/kg'} currentYear={this.props.currentGameYear} domainYaxis={1} id={'cost'} backgroundFill={'#eaeffb'} />
									<YearRecapCharts barGraphData={barGraphData.naturalGas} width={parent.width} height={400} totalGameYears={this.props.totalGameYears} graphTitle={'Natural Gas Use (10K MMBtu)'} unitLable={'10K MMBtu'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'naturalGas'} backgroundFill={'#f5f5f5'} />
									<YearRecapCharts barGraphData={barGraphData.electricity} width={parent.width} height={400} totalGameYears={this.props.totalGameYears} graphTitle={'Electricity Use (M kWh)'} unitLable={'M kWh'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'electricity'} backgroundFill={'#eaeffb'} />
									<YearRecapCharts barGraphData={barGraphData.hydrogen} width={parent.width} height={400} totalGameYears={this.props.totalGameYears} graphTitle={'Landfill Gas Use (10K MMBtu)'} unitLable={'10K MMBtu'} currentYear={this.props.currentGameYear} domainYaxis={100} id={'hydrogen'} backgroundFill={'#f5f5f5'} />
								</>
							)}
						</ParentSize>
					</Box>

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
							nextButton={this.getNextButton(this.props, mutableStats, mutableCapitalFundingState)}
						/>
					</>
					}

				</Box>
			</>
		);
	}


	/**
	* Returns YearRecapResults and cards, mutates mutableStats and props
	*/
	buildRecapCardsAndResults(props: YearRecapProps, initialCurrentYearStats: TrackedStats, mutableStats: TrackedStats, mutableCapitalFundingState: CapitalFundingState): YearRecapResults {
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

		let implementedProjectIds: symbol[] = [...props.implementedProjectsIds];
		let implementedProjects: ProjectControl[] = implementedProjectIds.map(project => Projects[project]);
		let implementedFinancedProjects: ImplementedProject[] = [...props.implementedFinancedProjects];
		let implementedRenewableProjectsCopy: RenewableProject[] = props.implementedRenewableProjects.map(project => { return { ...project } });

		this.addPreviousRenewablesForDisplay(props.implementedRenewableProjects, mutableStats, implementedProjects);
		this.addRebateRecapCard(implementedProjects, recapResults.projectRecapCards, implementedFinancedProjects, implementedRenewableProjectsCopy, mutableStats.currentGameYear);
		this.addSurpriseEventCards(implementedProjects, recapResults.projectRecapCards, implementedFinancedProjects, implementedRenewableProjectsCopy, mutableStats.currentGameYear);

		let projectNetCost = 0;
		let totalProjectExtraCosts = 0;
		// * WARNING - mutableStats: TrackedStats for each iteration below represents the stats with current projects modifiers, not the cumulative stats for the year
		implementedProjects.forEach((implementedProject: ProjectControl, index) => {
			// * projectIndividualizedStats === renewable project savings calculations need project stats which are ONLY 
			// * mutated by the current renewable project (instead of mutatedStats which tracks all projects)
			const projectIndividualizedStats: TrackedStats = { ...initialCurrentYearStats };
			let gaugeCharts: JSX.Element[] = [];
			const renewableProject = implementedRenewableProjectsCopy.find(project => project.page === implementedProject.pageId);
			let hasAppliedFirstYearSavings = false;
			let shouldApplyHiddenCosts = true;
			let financingOption: FinancingOption;
			let shouldApplyCosts = true;
			if (renewableProject) {
				hasAppliedFirstYearSavings = renewableProject.yearStarted !== mutableStats.currentGameYear;
				let renewableProjectIndex: number = implementedRenewableProjectsCopy.findIndex(project => project.page === implementedProject.pageId);
				financingOption = implementedRenewableProjectsCopy[renewableProjectIndex].financingOption;
				let isAnnuallyFinanced = getIsAnnuallyFinanced(financingOption.financingType.id);
				shouldApplyCosts = isAnnuallyFinanced || !implementedProject.isSinglePaymentRenewable || (implementedProject.isSinglePaymentRenewable && renewableProject.yearStarted === mutableStats.currentGameYear);
				shouldApplyHiddenCosts = renewableProject.yearStarted === mutableStats.currentGameYear;
			} else {
				let financedIndex: number = implementedFinancedProjects.findIndex(project => project.page === implementedProject.pageId);
				financingOption = implementedFinancedProjects[financedIndex].financingOption;
			}

			this.applyStatsFromImplementation(implementedProject, projectIndividualizedStats, mutableStats, gaugeCharts, hasAppliedFirstYearSavings);
			this.applyEndOfYearStats(implementedProject, mutableStats, hasAppliedFirstYearSavings);
			this.addCarbonSavingsGauge(mutableStats, gaugeCharts, props.defaultTrackedStats);
			if (shouldApplyCosts) {
				implementedProject.applyCost(mutableStats, financingOption);
				projectNetCost = implementedProject.getYearEndTotalSpending(financingOption, mutableStats.gameYearInterval, shouldApplyHiddenCosts);
			}
			if (renewableProject && !hasAppliedFirstYearSavings) {
				this.mutateRenewableFirstYearStats(implementedProject, props, initialCurrentYearStats, projectIndividualizedStats);
			}

			recapResults.yearEndTotalSpending += projectNetCost;
			if (shouldApplyHiddenCosts) {
				totalProjectExtraCosts = implementedProject.getHiddenCost();
			}
			recapResults.unspentBudget -= totalProjectExtraCosts;
			recapResults.unspentBudget += implementedProject.getYearEndRebates();
			mutableStats.financesAvailable = recapResults.unspentBudget;

			this.addImplementedProjectRecapCard(
				implementedProject,
				props,
				mutableStats,
				recapResults,
				gaugeCharts,
				projectNetCost,
				totalProjectExtraCosts);
		});

		// todo this will eventually handle renwables
		recapResults.yearEndTotalSpending += this.getOngoingFinancingCosts(props.completedProjects, mutableStats);
		// setCapitalFundingExpired(mutableCapitalFundingState, mutableStats);
		this.addCapitalFundingRewardCard(recapResults.projectRecapCards, mutableCapitalFundingState, mutableStats);
		mutableStats.yearEndTotalSpending = initialCurrentYearStats.yearEndTotalSpending + recapResults.yearEndTotalSpending;
		this.setCostPerCarbonSavings(mutableStats);
		recapResults.yearCostSavings = getYearCostSavings(initialCurrentYearStats, mutableStats);
		this.setRenewableProjectResults(implementedRenewableProjectsCopy, mutableStats, initialCurrentYearStats, recapResults.yearCostSavings);

		return recapResults;
	}

	/**
	* Set mutable stats costPerCarbonSavings
	*/
	setCostPerCarbonSavings(mutableStats: TrackedStats) {
		let costPerCarbonSavings = 0;
		if (mutableStats.yearEndTotalSpending > 0 && mutableStats.carbonSavingsPerKg > 0) {
			costPerCarbonSavings = mutableStats.yearEndTotalSpending / mutableStats.carbonSavingsPerKg;
		}
		mutableStats.costPerCarbonSavings = costPerCarbonSavings;
	}

	/**
	* Costs from completed projects still in financing
	*/
	getOngoingFinancingCosts(completedProjects: CompletedProject[], mutableStats: TrackedStats) {
		let yearFinancingCosts: number = 0;
		completedProjects.forEach((completedProject: CompletedProject) => {
			if (completedProject.financingOption) {
				yearFinancingCosts += Projects[completedProject.page].getYearEndTotalSpending(completedProject.financingOption, mutableStats.gameYearInterval, false);
			}

		});
		return yearFinancingCosts;
	}


	/**
	* WARNING - Directly mutates renewable project in first year. This is a workaround to get correct stats display and state given some of the other game mechanics and logic
	* we need to assign/save individualized project savings to be applied in each renewable year recap - later years don't change savings state, only display values
	*/
	mutateRenewableFirstYearStats(implementedProject: ProjectControl, props: YearRecapProps, initialCurrentYearStats: TrackedStats, projectIndividualizedStats: TrackedStats) {
		const renewableProjectIndex = props.implementedRenewableProjects.findIndex(project => project.page === implementedProject.pageId);
		if (props.implementedRenewableProjects[renewableProjectIndex].yearStarted === initialCurrentYearStats.currentGameYear) {
			// todo 143 ignore for some financed projects
			props.implementedRenewableProjects[renewableProjectIndex].yearlyFinancialSavings = getYearCostSavings(initialCurrentYearStats, projectIndividualizedStats);
			console.log(`${String(props.implementedRenewableProjects[renewableProjectIndex].page)} budget period savings, ${props.implementedRenewableProjects[renewableProjectIndex].yearlyFinancialSavings?.electricity}`);
		}
	}

	/**
	* Set savings and costs related to renewable projects 
	*/
	setRenewableProjectResults(implementedRenewableProjectsCopy: RenewableProject[], mutableStats: TrackedStats, initialCurrentYearStats: TrackedStats, yearCostSavings: YearCostSavings) {
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
	addImplementedProjectRecapCard(implementedProject: ProjectControl,
		props: YearRecapProps,
		mutableStats: TrackedStats,
		recapResults: YearRecapResults,
		gaugeCharts: JSX.Element[],
		projectNetCost: number,
		totalExtraCosts: number) {

		let headerStyle = {
			'& .MuiCardHeader-title': {
				textAlign: 'left',
				fontSize: '26px',
				fontWeight: 'bold'
			},
			'& .MuiCardHeader-subheader': {
				textAlign: 'left',
				fontSize: '22px',
				fontWeight: '400',
				color: '#000000',
			},
		};

		let yearMultiplier = 1;
		if (implementedProject.isRenewable) {
			yearMultiplier = mutableStats.gameYearInterval;
		}
		const implementedProjects = implementedProject.isRenewable ? props.implementedRenewableProjects : props.implementedFinancedProjects
		let implementationFinancing: FinancingOption = findFinancingOptionFromProject(implementedProjects, implementedProject.pageId);
		let isFinanced = implementationFinancing.financingType.id !== 'budget';
		let isFinancingPaidOff;
		if (isFinanced) {
			let financedProject = implementedProjects.find(project => project.page === implementedProject.pageId);
			isFinancingPaidOff = isProjectFullyFunded(financedProject, mutableStats.currentGameYear);
		}

		let initialCost = implementedProject.getImplementationCost(implementationFinancing.financingType.id, mutableStats.gameYearInterval)

		let financingCardContent: DialogFinancingOptionCard = {
			...implementationFinancing,
			financedTotalCost: implementedProject.financedTotalCost ? implementedProject.financedTotalCost : implementedProject.baseCost,
			financedAnnualCost: implementedProject.financedAnnualCost,
			implementButton: undefined
		}
		let listItemSx = { paddingLeft: '8px' }
		recapResults.projectRecapCards.push(
			<ListItem key={String(implementedProject.pageId)}>
				<Card sx={{ width: '100%' }}>
					<CardHeader
						title={implementedProject.title}
						subheader={
							<Typography dangerouslySetInnerHTML={parseSpecialText(implementedProject.shortTitle)} />
						}
						sx={headerStyle}
					/>
					<CardContent sx={{ paddingTop: '0' }}>
						{implementedProject.caseStudy && (
							<Link href={implementedProject.caseStudy.url} underline='always' target='_blank' rel='noopener'>
								<p style={{ margin: 0, color: '#1D428A', fontSize: '20px', fontWeight: '500' }}>
									Case Study - {implementedProject.caseStudy.title}
								</p>
							</Link>
						)}


						<Grid
							container
							spacing={1}
							justifyContent='center'
							alignItems='center'>

							{isFinanced &&
								<Grid item
									xs={12}
									md={6}
									lg={3}>

									<List dense={true} sx={{ paddingLeft: 0 }}>
										<ListItem sx={listItemSx}>
											<ListItemText
												sx={{ marginTop: 0, marginBottom: 0 }}
												primary={
													<>
														<Typography variant="h5" sx={{ color: 'black', fontWeight: '500' }}>
															Financing
														</Typography>
														<Typography variant='h6'>
															{financingCardContent.financingType.name}
														</Typography>
													</>
												}
												secondary={
													<span>{financingCardContent.financingType.detailedInfo}</span>
												}
											/>
										</ListItem>
										{!isFinancingPaidOff
											&&
											<ListItem sx={listItemSx}>
												<ListItemText
													sx={{ marginTop: 0, marginBottom: 0 }}
													primary={
														<Typography sx={{ fontSize: '1.25rem', fontWeight: '500' }}>
															Annual {' '}
															<Emphasis money>
																${financingCardContent.financedAnnualCost.toLocaleString('en-US')}
															</Emphasis>
														</Typography>
													}
													secondary={
														<Typography sx={{ fontSize: '1rem', fontWeight: '500' }}>
															Total {' '} ${financingCardContent.financedTotalCost.toLocaleString('en-US')}
														</Typography>
													}
												/>
											</ListItem>
										}
										{isFinancingPaidOff
											&&
											<ListItem sx={listItemSx}>
												<ListItemText
													primary={
														<Typography sx={{ fontSize: '1.25rem', fontWeight: '500' }}>
															<Emphasis money>
																Paid Off
															</Emphasis>
														</Typography>
													}
												/>
											</ListItem>
										}

									</List>
								</Grid>
							}

							<Grid item
								xs={isFinanced ? 12 : 12}
								md={isFinanced ? 6 : 3}
								lg={isFinanced ? 3 : 3}>

								<List dense={true} sx={{ paddingLeft: 0 }}>
									{!isFinanced &&
										<ListItem sx={{ padding: 0, fontSize: '1.25rem', paddingLeft: '8px' }}>
											<ListItemText
												primary={
													<Typography>
														Initial Project Cost:{' '}
														<Emphasis money>
															${initialCost.toLocaleString('en-US')}
														</Emphasis>
													</Typography>
												}
											/>
										</ListItem>
									}
									<ListItem sx={{ padding: 0, fontSize: '1.25rem', paddingLeft: '8px' }}>
										<ListItemText
											primary={
												<Typography >
													Rebates: {' '}
													<Emphasis money>
														${implementedProject.getYearEndRebates().toLocaleString('en-US')}
													</Emphasis>
												</Typography>
											}

										/>
									</ListItem>
									<ListItem sx={{ padding: 0, fontSize: '1.25rem', paddingLeft: '8px' }}>
										<ListItemText
											primary={
												<Typography>
													Extra Costs:{' '}
													<Emphasis money>
														${totalExtraCosts.toLocaleString('en-US')}
													</Emphasis>
												</Typography>
											}
										/>
									</ListItem>
									<ListItem sx={listItemSx}>
										<ListItemText
											primary={
												<Typography sx={{ fontSize: '1.25rem', color: 'black', fontWeight: '500' }}>
													Year Net Cost:{' '}
													<Emphasis money>
														${projectNetCost.toLocaleString('en-US')}
													</Emphasis>
												</Typography>
											}
										/>
									</ListItem>
								</List>
							</Grid>


							<Grid item
								xs={isFinanced ? 12 : 12}
								md={isFinanced ? 12 : 9}
								lg={isFinanced ? 6 : 9}
								className='year-recap-charts'>
								<Grid
									container
									spacing={1}
									justifyContent='space-evenly'
									alignItems='center'>
									{gaugeCharts}
								</Grid>
							</Grid>

						</Grid>

					</CardContent>

				</Card>
			</ListItem>
		);
	}


	/**
	* Add already implemented/processed renewables to display alongside implemented projects
	*/
	addPreviousRenewablesForDisplay(implementedRenewableProjects: RenewableProject[], mutableStats: TrackedStats, implementedProjects: ProjectControl[]) {
		// todo verify this
		implementedRenewableProjects.forEach(project => {
			if (project.gameYearsImplemented.includes(mutableStats.currentGameYear)) {
				implementedProjects.push(Projects[project.page]);
			}
		});
	}


	/**
	* Add card for total utility rebate. Some rebates may happen multiple times (renewable projects)
	*/
	addCapitalFundingRewardCard(projectRecapCards: JSX.Element[], capitalFundingState: CapitalFundingState, stats: TrackedStats) {
		let percentSavingsMilestone: number = setCapitalFundingMilestone(capitalFundingState, stats);
		if (percentSavingsMilestone) {
			let surprise: RecapSurprise = getCapitalFundingSurprise(percentSavingsMilestone);
			let capitalFundingRewardCard = this.getCapitalFundingCard(surprise, surprise.title, surprise.subHeader)
			projectRecapCards.unshift(capitalFundingRewardCard);
		}

	}


	/**
	* Add card for Capital Funding Reward
	*/
	getCapitalFundingCard(surprise: RecapSurprise, title: string, subHeader: string | undefined, index?: number): JSX.Element {
		let keyId = index !== undefined ? index : title;
		return <ListItem key={`year-recap-surprise_${keyId}`}>
			<ThemeProvider theme={darkTheme}>
				{/* <Grow
					in={this.state.inView}
					style={{ transformOrigin: '0 0 0' }}
					{...(this.state.inView ? { timeout: 3000 } : {})}
				> */}
				<Card className={surprise.className} sx={{ width: '100%' }}>
					<CardMedia
						sx={{ height: 150 }}
						image="images/money-hands.jpg"
						title="reward"
					/>
					<CardHeader
						title={title}
						subheader={subHeader}
					/>
					<CardContent>
						<Typography variant='body1' dangerouslySetInnerHTML={parseSpecialText(surprise.text)} />
					</CardContent>
				</Card>
				{/* </Grow> */}
			</ThemeProvider>
		</ListItem>
	}

	/**
	* Add recap cards for "surprises".
	*/
	addSurpriseEventCards(implementedProjects: ProjectControl[], projectRecapCards: JSX.Element[], implementedFinancedProjects: ImplementedProject[], renewableProjects: ImplementedProject[], currentGameYear: number) {
		implementedProjects.forEach(project => {
			if (project.recapSurprises) {
				let shouldShowSurprise = getHasActiveHiddenCost(project, implementedFinancedProjects, renewableProjects, currentGameYear);
				if (shouldShowSurprise) {
					projectRecapCards.push(
						...project.recapSurprises.map((projectSurprise, index) => {
							return (
								this.getSurpriseEventCard(projectSurprise, project.title, project.shortTitle, index)
							);
						})
					);
				}
			}
		});
	}

	/**
	* Add card for negative/positive surprises.
	*/
	getSurpriseEventCard(surprise: RecapSurprise, title: string, subHeader: string | undefined, index?: number): JSX.Element {
		let keyId = index !== undefined ? index : title;
		return <ListItem key={`year-recap-surprise_${keyId}`}>
			<ThemeProvider theme={darkTheme}>
				<Card className={surprise.className} sx={{ width: '100%' }}>
					<CardHeader
						avatar={
							<Avatar
								sx={{ bgcolor: surprise.avatar.backgroundColor, color: surprise.avatar.color }}
							>
								{surprise.avatar.icon}
							</Avatar>
						}
						title={title}
						subheader={subHeader}
					/>
					<CardContent>
						<Typography variant='body1' dangerouslySetInnerHTML={parseSpecialText(surprise.text)} />
					</CardContent>
				</Card>
			</ThemeProvider>
		</ListItem>
	}

	/**
	* Add card for total utility rebate. Some rebates may happen multiple times (renewable projects)
	*/
	addRebateRecapCard(implementedProjects: ProjectControl[], projectRecapCards: JSX.Element[], implementedFinancedProjects: ImplementedProject[], renewableProjects: ImplementedProject[], currentGameYear: number) {
		let totallyUtilityRebateDollars = 0;
		let rebateProjects: ProjectControl[] = implementedProjects.filter(project => {
			let rebateValue = Number(project.utilityRebateValue);
			if (rebateValue) {
				let shouldShowSurprise = getHasActiveHiddenCost(project, implementedFinancedProjects, renewableProjects, currentGameYear)
				if (shouldShowSurprise) {
					totallyUtilityRebateDollars += rebateValue;
					return project;
				}
			}
		});

		if (totallyUtilityRebateDollars) {
			const utilityRebateText = `Your project selections qualify you for your local utility’s energy efficiency {rebate program}. 
	You will receive a $\{${totallyUtilityRebateDollars.toLocaleString('en-US')} utility credit} for implementing energy efficiency measures.`;
			projectRecapCards.push(
				<ListItem key={`${utilityRebateText}_surprise_`}>
					<ThemeProvider theme={darkTheme}>
						<Card className='year-recap-positive-surprise' sx={{ width: '100%' }}>
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
	* actualStatAppliers - Stats applied for implementing a project, gauge charts, or other display purpose
	*/
	applyStatsFromImplementation(implementedProject: ProjectControl,
		projectIndividualizedStats: TrackedStats,
		mutableStats: TrackedStats,
		gaugeCharts: JSX.Element[],
		hasAppliedFirstYearSavings: boolean) {

		for (let key in implementedProject.statsActualAppliers) {
			let thisApplier: NumberApplier = implementedProject.statsActualAppliers[key];
			let yearMultiplier = 1;
			if (thisApplier.isAbsolute) {
				yearMultiplier = mutableStats.gameYearInterval;
			}
			let oldValue = mutableStats[key];
			let newValue = hasAppliedFirstYearSavings ? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
			let difference = newValue - oldValue;
			mutableStats[key] = newValue;

			let oldProjectValue = projectIndividualizedStats[key];
			let newProjectValue = hasAppliedFirstYearSavings ? oldProjectValue : thisApplier.applyValue(oldProjectValue, yearMultiplier);
			projectIndividualizedStats[key] = newProjectValue;

			let thisGaugeProps = statsGaugeProperties[key];
			if (thisGaugeProps) {
				gaugeCharts.push(
					<Grid item sx={{ padding: '1rem' }} key={getIdString()}>
						<GaugeChart
							key={key}
							width={260}
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
					</Grid>

				);
			}
		}

	}

	/**
	* recapStatAppliers - Stats applied for at end of budget period, i.e. 1 year or 2 years if playing short game
	* @param hasAppliedFirstYearSavings: skip applying savings for this project - already applied in inplementation year
	*/
	applyEndOfYearStats(implementedProject: ProjectControl,
		mutableStats: TrackedStats,
		hasAppliedFirstYearSavings: boolean) {

		for (let key in implementedProject.statsRecapAppliers) {
			let thisApplier: NumberApplier = implementedProject.statsRecapAppliers[key];
			let oldValue = mutableStats[key];
			let yearMultiplier = 1;
			if (thisApplier.isAbsolute) {
				yearMultiplier = mutableStats.gameYearInterval;
			}
			let newValue = hasAppliedFirstYearSavings ? oldValue : thisApplier.applyValue(oldValue, yearMultiplier);
			mutableStats[key] = newValue;
		}

	}

	/**
	* Build gauge with new carbon savings percent, calculated using previous budget period carbon savings
	*/
	addCarbonSavingsGauge(mutableStats: TrackedStats,
		gaugeCharts: JSX.Element[],
		defaultTrackedStats: TrackedStats,
	) {

		let prevYearCarbonSavingsPercent = mutableStats.carbonSavingsPercent;
		mutableStats = setCarbonEmissionsAndSavings(mutableStats, defaultTrackedStats);
		let newCarbonSavingsPercent = mutableStats.carbonSavingsPercent;

		gaugeCharts.push(
			<Grid item sx={{ padding: '1rem' }}
				key={'carbonSavings' + getIdString()}>
				<GaugeChart
					width={260}
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
					label='GHG Reduction'
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
			</Grid>
		);
	}

	getBarGraphData(props: YearRecapProps, mutableStats: TrackedStats): BarGraphData {
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


	getNextButton(props: YearRecapProps, mutableStats: TrackedStats, capitalFundingState: CapitalFundingState) {
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
			onClick={() => props.handleNewYearSetup(mutableStats, capitalFundingState)}
			endIcon={rightArrow()}>
			<Typography variant='button'>{nextbuttonText}</Typography>
		</Button>
	}

}

export function getHasActiveHiddenCost(project: ProjectControl, implementedFinancedProjects: ImplementedProject[], renewableProjects: ImplementedProject[], currentGameYear: number): boolean {
	let hasActiveHiddenCosts = true;
	let renewableProject = renewableProjects.find(renewable => renewable.page === project.pageId);
	if (renewableProject && renewableProject.yearStarted !== currentGameYear) {
		hasActiveHiddenCosts = false;
	} else if (renewableProject) {
		let financedProject = implementedFinancedProjects.find(implementedProject => implementedProject.page === project.pageId);
		if (financedProject && renewableProject.yearStarted !== currentGameYear) {
			hasActiveHiddenCosts = false;
		}
	}
	return hasActiveHiddenCosts;
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
	capitalFundingState: CapitalFundingState,
	implementedProjectsIds: symbol[];
	completedProjects: CompletedProject[];
	implementedRenewableProjects: RenewableProject[];
	implementedFinancedProjects: ImplementedProject[];
	yearRangeInitialStats: TrackedStats[];
	defaultTrackedStats: TrackedStats;
	/**
	 * @param yearFinalStats The final stats for the year, including hidden surprises.
	 */
	handleNewYearSetup: (yearFinalStats: TrackedStats, capitalFundingState: CapitalFundingState) => void;
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

