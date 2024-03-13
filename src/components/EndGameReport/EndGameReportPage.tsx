import React, { Fragment } from 'react';
import { TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import { CapitalFundingState, FinancingOption, isProjectFullyFunded } from '../../Financing';
import { ControlCallbacks, Emphasis, PageControl } from '../controls';
import { Box, Button, Card, CardContent, CardHeader, Grid, Link, List, ListItem, ListItemText, Tooltip, TooltipProps, Typography, styled, tooltipClasses } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { CompletedProject, ImplementedProject, ProjectControl, RenewableProject } from '../../ProjectControl';
import { ImplementedFinancingData } from '../YearRecap';
import Projects from '../../Projects';
import { DialogFinancingOptionCard } from '../Dialogs/ProjectDialog';
import { parseSpecialText, truncate } from '../../functions-and-types';
import EnergyUseLineChart from '../EnergyUseLineChart';
import DownloadPDF, { ReportPDFProps } from './DownloadPDF';


export default class EndGameReportPage extends React.Component<EndGameReportPageProps> {
	render() {
		const yearRangeInitialStats: TrackedStats[] = [...this.props.yearRangeInitialStats];
		const mutableStats: TrackedStats = { ...this.props.yearRangeInitialStats[this.props.trackedStats.currentGameYear - 1] };
		let completedRenewables = [...this.props.implementedRenewableProjects].map(renewable => {
			return {
				completedYear: mutableStats.currentGameYear - 1,
				gameYearsImplemented: renewable.gameYearsImplemented,
				yearStarted: renewable.yearStarted,
				financingOption: renewable.financingOption,
				page: renewable.page
			}
		});

		let completedProjects = this.props.completedProjects.concat(completedRenewables);

		return (
			<Box m={2}>
				<EndGameReport
					yearRangeInitialStats={yearRangeInitialStats}
					completedProjects={completedProjects}
					mutableStats={mutableStats}
				/>
			</Box>
		);
	}

}

function EndGameReport(props: ReportProps) {
	let projectRecapCards: JSX.Element[] = [];
	props.completedProjects.forEach(project => {
		let implementedProject: ProjectControl = Projects[project.page];
		let implementationFinancing: FinancingOption = project.financingOption;
		let isFinanced = implementationFinancing.financingType.id !== 'budget';
		let financingData: ImplementedFinancingData = {
			option: implementationFinancing,
			isPaidOff: isFinanced ? isProjectFullyFunded(project, props.mutableStats) : false,
			isFinanced: isFinanced,

		}
		let projectNetCost = implementedProject.getYearEndTotalSpending(financingData.option, props.mutableStats.gameYearInterval);
		let totalProjectExtraCosts = implementedProject.getHiddenCost();

		projectRecapCards.push(
			getProjectCard(
				implementedProject,
				props.mutableStats,
				projectNetCost,
				totalProjectExtraCosts,
				financingData,
			));

	});

	return (
		<Fragment>
			<ParentSize>
				{(parent) => (
					<EnergyUseLineChart
					yearRangeInitialStats={props.yearRangeInitialStats}
					parentElement={parent}/>
				)}
			</ParentSize>
			<Box sx={{ display: 'flex', justifyContent: 'end', marginY: '1rem' }}>
					<DownloadPDF yearRangeInitialStats={props.yearRangeInitialStats}
						completedProjects={props.completedProjects}
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
		</Fragment>
	);
}

interface ReportProps extends ReportPDFProps {
	mutableStats: TrackedStats
}


function getProjectCard(implementedProject: ProjectControl,
	mutableStats: TrackedStats,
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

	let yearMultiplier = 1;
	if (implementedProject.isRenewable) {
		yearMultiplier = mutableStats.gameYearInterval;
	}
	let initialCost = implementedProject.financedAnnualCost ? implementedProject.financedAnnualCost : implementedProject.baseCost;
	initialCost *= yearMultiplier;

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
					</Grid>

				</CardContent>

			</Card>
		</ListItem>
	);
}


export function newEndGameReportPageControl(): PageControl {
	return {
		componentClass: EndGameReportPage,
		controlProps: {},
		hideDashboard: true,
	};
}

export interface EndGameReportPageProps extends
	ControlCallbacks,
	GameSettings {
	capitalFundingState: CapitalFundingState,
	trackedStats: TrackedStats,
	completedProjects: CompletedProject[];
	implementedRenewableProjects: RenewableProject[];
	implementedFinancedProjects: ImplementedProject[];
	yearRangeInitialStats: TrackedStats[];
}

