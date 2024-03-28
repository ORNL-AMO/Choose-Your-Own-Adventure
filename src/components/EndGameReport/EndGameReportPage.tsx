import React, { Fragment } from 'react';
import { EndGameResults, TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import { FinancingOption, isProjectFullyFunded } from '../../Financing';
import { ControlCallbacks, Emphasis, PageControl } from '../controls';
import { Box, Card, CardContent, CardHeader, Grid, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { ProjectControl } from '../../ProjectControl';
import { ImplementedFinancingData } from '../YearRecap';
import Projects from '../../Projects';
import { DialogFinancingOptionCard } from '../Dialogs/ProjectDialog';
import { parseSpecialText } from '../../functions-and-types';
import EnergyUseLineChart from '../EnergyUseLineChart';
import DownloadPDF from './DownloadPDF';
import InfoIcon from '@mui/icons-material/Info';


export default function EndGameReport(props: ReportProps) {
	let projectRecapCards: JSX.Element[] = [];
	props.endGameResults.completedProjects.forEach(project => {
		let implementedProject: ProjectControl = Projects[project.page];
		let implementationFinancing: FinancingOption = project.financingOption;
		let isFinanced = implementationFinancing.financingType.id !== 'budget';
		let financingData: ImplementedFinancingData = {
			option: implementationFinancing,
			isPaidOff: isFinanced ? isProjectFullyFunded(project, props.endGameResults.endYearStats) : false,
			isFinanced: isFinanced,

		}
		let projectNetCost = implementedProject.getYearEndTotalSpending(financingData.option, props.endGameResults.endYearStats.gameYearInterval);
		let totalProjectExtraCosts = implementedProject.getHiddenCost();

		projectRecapCards.push(
			getProjectCard(
				implementedProject,
				props.endGameResults.endYearStats,
				projectNetCost,
				totalProjectExtraCosts,
				financingData,
			));

	});

	return (
		<Box m={2}>

			<ParentSize>
				{(parent) => (
					<EnergyUseLineChart
					yearRangeInitialStats={props.yearRangeInitialStats}
					parentElement={parent}/>
				)}
			</ParentSize>
			<Box m={2}>
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
											<Emphasis>{props.endGameResults.carbonSavingsPercent}%</Emphasis>{' '}
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
											You have spent{' '}<Emphasis>${props.endGameResults.gameTotalSpending}</Emphasis>{' '} throughout the game.
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
											Your cost per kg reduced was{' '}<Emphasis>${props.endGameResults.costPerCarbonSavings}/kg CO<sub>2</sub>e</Emphasis>{' '}
										</Typography>
									}
								/>
							</ListItem>
							{props.endGameResults.projectedFinancedSpending &&
								<ListItem >
									<ListItemIcon>
										<InfoIcon />
									</ListItemIcon>
									<ListItemText
										primary={
											<Typography variant={'h5'}>
												You are projected to spend {' '}<Emphasis>${props.endGameResults.projectedFinancedSpending}</Emphasis>{' '} on financed and renewed projects in future years
											</Typography>
										}
									/>
								</ListItem>
							}
						</List>
					</Box>
			</Box>
					
			<Box sx={{ display: 'flex', justifyContent: 'end', marginY: '1rem' }}>
					<DownloadPDF yearRangeInitialStats={props.yearRangeInitialStats}
						completedProjects={props.endGameResults.completedProjects}
					/>
				</Box>
			{projectRecapCards.length > 0 &&
				<Grid
					container
					spacing={1}
					justifyContent='center'
					alignItems='flex-start'>

					{projectRecapCards.map(card =>
						<Grid item
							key={card.key}
							md={12}
							lg={12}>
							{card}
						</Grid>
					)}

				</Grid>
			}
		</Box>
	);
}

interface ReportProps {
	endGameResults: EndGameResults,
	yearRangeInitialStats: TrackedStats[];
}


function getProjectCard(implementedProject: ProjectControl,
	endYearStats: TrackedStats,
	projectNetCost: number,
	totalExtraCosts: number,
	financingData: ImplementedFinancingData
): JSX.Element {

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

	let initialCost = implementedProject.getImplementationCost(financingData.option.financingType.id, endYearStats.gameYearInterval)

	let financingCardContent: DialogFinancingOptionCard = {
		...financingData.option,
		financedTotalCost: implementedProject.financedTotalCost ? implementedProject.financedTotalCost : implementedProject.baseCost,
		financedAnnualCost: implementedProject.financedAnnualCost,
		implementButton: undefined
	}
	let listItemSx = { paddingLeft: '8px' }

	return (
		<ListItem 
		sx={{ paddingX: '0' }}
		key={String(implementedProject.pageId)}>
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
						justifyContent='flex-start'
						alignItems='center'>

						{financingData.isFinanced &&
							<Grid item
								lg={12}
							>

								<List
									dense={true}
									sx={{
										paddingLeft: 0,
										display: 'flex',
										flexDirection: 'row'
									}}
								>
									<ListItem sx={listItemSx}>
										<ListItemText
											sx={{ marginTop: 0, marginBottom: 0 }}
											primary={
												<>
													<Typography variant='h5' sx={{ color: 'black', fontWeight: '500' }}>
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
									{!financingData.isPaidOff
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
									{financingData.isPaidOff
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
							flexDirection='row'
							justifyContent='flex-start'
							lg={12}>

							<List
								dense={true}
								sx={{
									paddingLeft: 0,
									display: 'flex',
									flexDirection: 'row'
								}}
							>
								{!financingData.isFinanced &&
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
												Budget Period Net Cost:{' '}
												<Emphasis money>
													${projectNetCost.toLocaleString('en-US')}
												</Emphasis>
											</Typography>
										}
									/>
								</ListItem>
							</List>
						</Grid>
					</Grid>

				</CardContent>

			</Card>
		</ListItem>
	);
}


export function newEndGameReportPageControl(): PageControl {
	return {
		componentClass: EndGameReport,
		controlProps: {},
		hideDashboard: true,
	};
}

export interface EndGameReportPageProps extends
	ControlCallbacks,
	GameSettings {
	endGameResults: EndGameResults;
	yearRangeInitialStats: TrackedStats[];
}

