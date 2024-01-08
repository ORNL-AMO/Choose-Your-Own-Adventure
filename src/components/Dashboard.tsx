import {
	Box,
	Button,
	Divider,
	Grid,
	MobileStepper,
	Paper,
	styled,
	TableBody,
	TableCell,
	TableContainer,
	TableHead,
	TableRow,
	Typography,
} from '@mui/material';
import { leftArrow, PureComponentIgnoreFuncs, rightArrow, clampRatio, shortenNumber } from '../functions-and-types';
import React from 'react';
import GaugeChart from './GaugeChart';
import { StyledTableCell, StyledTableRow, theme } from './theme';
import type { ControlCallbacks } from './controls';
import BasicPopover from './BasicPopover';
import HorizontalBarWithTooltip from './HorizontalBar';
import type { TrackedStats } from '../trackedStats';
import { statsGaugeProperties } from '../trackedStats';
import type { GameSettings } from '../Projects';
import { Table } from '@mui/material';

export class Dashboard extends PureComponentIgnoreFuncs<DashboardProps> {

	render() {
		const CHART_SIZE = 250;

		const singleDecimalFormatter = Intl.NumberFormat('en-US', {
			minimumFractionDigits: 1,
			maximumFractionDigits: 1,
		});
		const noDecimalsFormatter = Intl.NumberFormat('en-US', {
			minimumFractionDigits: 0,
			maximumFractionDigits: 0,
		});
		
		const carbonSavingsPercent = this.props.carbonSavingsPercent * 100;
		const carbonSavingsFormatted: string = `${carbonSavingsPercent.toFixed(1)}%`;
		
		const naturalGasEmissionRateFormatted: string = singleDecimalFormatter.format(this.props.naturalGasEmissionsPerMMBTU);
		const electricityEmissionRateFormatted: string = singleDecimalFormatter.format(this.props.electricityEmissionsPerKWh);
		const hydrogenEmissionRateFormatted: string = singleDecimalFormatter.format(this.props.hydrogenEmissionsPerMMBTU);

		const emissionsFromNaturalGasFormatted: string = singleDecimalFormatter.format(this.props.naturalGasEmissionsPerMMBTU * this.props.naturalGasMMBTU / 1000);
		const emissionsFromElectricityFormatted: string = singleDecimalFormatter.format(this.props.electricityEmissionsPerKWh * this.props.electricityUseKWh / 1000);
		const emissionsFromHydrogenFormatted: string = singleDecimalFormatter.format(this.props.hydrogenEmissionsPerMMBTU * this.props.hydrogenMMBTU / 1000);

		const electricityCost = noDecimalsFormatter.format(this.props.electricityCostPerKWh * this.props.electricityUseKWh);
		const naturalGasCost = noDecimalsFormatter.format(this.props.naturalGasCostPerMMBTU * this.props.naturalGasMMBTU); 
		const hydrogenCost = noDecimalsFormatter.format(this.props.hydrogenCostPerMMBTU * this.props.hydrogenMMBTU); 

		const naturalGasFormatted: string = noDecimalsFormatter.format(this.props.naturalGasMMBTU);
		const electricityUseFormatted: string = noDecimalsFormatter.format(this.props.electricityUseKWh);
		const hydrogenFormatted: string = noDecimalsFormatter.format(this.props.hydrogenMMBTU);

		const financesFormatted: number = Number(this.props.financesAvailable.toFixed(0));


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
					backButton={
						<Button size='medium'
							variant='outlined'
							onClick={this.props.onBack}
							disabled={this.props.btnBackDisabled}>
							{leftArrow()}
							Back
						</Button>
					}
					nextButton={
						<BasicPopover
							buttonSize='medium'
							onClick={this.props.onProceed}
							buttonVariant='outlined'
							text='Proceed'
							variant='mouseover'
							endIcon={rightArrow()}
							buttonDisabled={this.props.btnProceedDisabled}
						>
							{this.props.totalIterations == 5 &&
								<div
									style={{ maxWidth: '200px' }}
								>
									{/* todo: special case for last year! */}
									Commit to your selected projects and proceed to Years {this.props.yearInterval} and {this.props.yearInterval + 1}.
								</div>
							}
							{this.props.totalIterations == 10 &&
								<div
									style={{ maxWidth: '200px' }}
								>
									{/* todo: special case for last year! */}
									Commit to your selected projects and proceed to Year {this.props.year}.
								</div>
							}
						</BasicPopover>
					}
				/>
				<Box m={2}>
					{/* todo timer for each year */}
					{this.props.totalIterations == 5 &&
						<Typography variant='h6'>
							Years {this.props.yearInterval} and {this.props.yearInterval + 1} of 10
						</Typography>
					}
					{this.props.totalIterations == 10 &&
						<Typography variant='h6'>
							Year {this.props.year} of 10
						</Typography>
					}
					<Grid container spacing={2}>
						<Grid item xs={12}>
							{/* <Typography variant="h3">Dashboard</Typography> */}
							<GaugeChart
								width={CHART_SIZE}
								value1={clampRatio(this.props.carbonSavingsPercent, 1)}
								text={carbonSavingsFormatted}
								label='Carbon Savings'
								textFontSize={0.85}
								color1={theme.palette.primary.dark}
								ticks={[{
									value: .5,
									label: '50%'
								}]}
							/>
							<GaugeChart
								width={CHART_SIZE}
								value1={clampRatio(
									this.props.naturalGasMMBTU,
									statsGaugeProperties.naturalGasMMBTU.maxValue,
								)}
								text={naturalGasFormatted}
								label='Natural Gas Use (MMBTU)'
								textFontSize={0.85}
								color1={theme.palette.primary.dark}
								ticks={[{
									value: .5,
									label: shortenNumber(statsGaugeProperties.naturalGasMMBTU.maxValue * 0.5),
								}, {
									value: 1,
									label: shortenNumber(statsGaugeProperties.naturalGasMMBTU.maxValue),
								}]}
							/>
							<GaugeChart
								width={CHART_SIZE}
								value1={clampRatio(this.props.electricityUseKWh, statsGaugeProperties.electricityUseKWh.maxValue)}
								text={electricityUseFormatted}
								label='Electricity Use (kWh)'
								textFontSize={0.85}
								color1={theme.palette.warning.main}
								ticks={[{
									value: .5,
									label: shortenNumber(statsGaugeProperties.electricityUseKWh.maxValue * 0.5),
								}, {
									value: 1,
									label: shortenNumber(statsGaugeProperties.electricityUseKWh.maxValue)
								}]}
							/>
							<GaugeChart
								width={CHART_SIZE}
								value1={clampRatio(
									this.props.hydrogenMMBTU,
									statsGaugeProperties.hydrogenMMBTU.maxValue,
								)}
								text={hydrogenFormatted}
								label='Hydrogen (MMBTU)'
								textFontSize={0.85}
								color1={theme.palette.primary.light}
								ticks={[{
									value: .5,
									label: shortenNumber(statsGaugeProperties.hydrogenMMBTU.maxValue * 0.5),
								}, {
									value: 1,
									label: shortenNumber(statsGaugeProperties.hydrogenMMBTU.maxValue),
								}]}
							/>
							<HorizontalBarWithTooltip
								width={400} height={145}
								data={[{
									// Finances available can be negative UP TO the amount of rebates.... may be changed later
									'Finances available': Math.max(financesFormatted, 0),
									'Money spent': this.props.moneySpent,
								}]}
							/>
						</Grid>		
					</Grid>
					<TableContainer component={Paper} sx={{ marginTop: 3}}>
						<Table sx={{ minWidth: 650 }} size='small' aria-label='simple table'>
							<TableHead>
								<TableRow>
									<StyledTableCell align='center'>Utility</StyledTableCell>
									<StyledTableCell align='center'>Emission Rate</StyledTableCell>
									<StyledTableCell align='center'>Emissions from Utility</StyledTableCell>
									<StyledTableCell align='center'>Utility Cost per unit</StyledTableCell>
									<StyledTableCell align='center'>Total Cost</StyledTableCell>
								</TableRow>
							</TableHead>
							<TableBody>
								<StyledTableRow
									key={'naturalGas'}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<StyledTableCell id='dashboardText' align='center' component='th' scope='row'> {'Natural Gas'}</StyledTableCell>
									<StyledTableCell align='center'>{naturalGasEmissionRateFormatted} kg/MMBTU</StyledTableCell>
									<StyledTableCell align='center'>{emissionsFromNaturalGasFormatted} metric tons</StyledTableCell>
									<StyledTableCell align='center'>${this.props.naturalGasCostPerMMBTU.toFixed(2)}/kWh</StyledTableCell>
									<StyledTableCell align='center'>${naturalGasCost}</StyledTableCell>
								</StyledTableRow>
								<StyledTableRow
									key={'electricity'}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<StyledTableCell id='dashboardText' align='center' component='th' scope='row'>{'Electricity'}</StyledTableCell>
									<StyledTableCell align='center'>{electricityEmissionRateFormatted} kg/kWh</StyledTableCell>
									<StyledTableCell align='center'>{emissionsFromElectricityFormatted} metric tons</StyledTableCell>
									<StyledTableCell align='center'>${this.props.electricityCostPerKWh.toFixed(2)}/kWh</StyledTableCell>
									<StyledTableCell align='center'>${electricityCost}</StyledTableCell>
								</StyledTableRow>
								<StyledTableRow
									key={'hydrogen'}
									sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
								>
									<StyledTableCell id='dashboardText' align='center' component='th' scope='row'>{'Hydrogen'}</StyledTableCell>
									<StyledTableCell align='center'>{hydrogenEmissionRateFormatted} kg/MMBTU</StyledTableCell>
									<StyledTableCell align='center'>{emissionsFromHydrogenFormatted} metric tons</StyledTableCell>
									<StyledTableCell align='center'>${this.props.hydrogenCostPerMMBTU.toFixed(2)}/MMBTU</StyledTableCell>
									<StyledTableCell align='center'>${hydrogenCost}</StyledTableCell>
								</StyledTableRow>
							</TableBody>
						</Table>
					</TableContainer>
				</Box>
				<Divider variant='middle' />
			</>
		);
	}
}

export interface DashboardProps extends ControlCallbacks, TrackedStats, GameSettings {
	onBack?: () => void;
	onProceed: () => void;
	btnBackDisabled: boolean;
	btnProceedDisabled: boolean;
}
