import {
	Box,
	Button,
	Divider,
	Grid,
	MobileStepper,
	Paper,
	styled,
	Typography,
} from '@mui/material';
import { leftArrow, PureComponentIgnoreFuncs, rightArrow, clampRatio, shortenNumber } from '../functions-and-types';
import React from 'react';
import GaugeChart from './GaugeChart';
import { theme } from './theme';
import type { ControlCallbacks } from './controls';
import BasicPopover from './BasicPopover';
import HorizontalBarWithTooltip from './HorizontalBar';
import type { TrackedStats } from '../trackedStats';
import {statsGaugeProperties} from '../trackedStats';
import type { GameSettings } from '../Projects';

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

		const emissionsFromNaturalGasFormatted: string = singleDecimalFormatter.format(this.props.naturalGasEmissionsPerMMBTU * this.props.naturalGasMMBTU / 1000);
		const emissionsFromElectricityFormatted: string = singleDecimalFormatter.format(this.props.electricityEmissionsPerKWh * this.props.electricityUseKWh / 1000);

		const electricityCost = noDecimalsFormatter.format(this.props.electricityCostPerKWh * this.props.electricityUseKWh);
		const naturalGasCost = noDecimalsFormatter.format(this.props.naturalGasCostPerMMBTU * this.props.naturalGasMMBTU); 
		
		const naturalGasFormatted: string = noDecimalsFormatter.format(this.props.naturalGasMMBTU);
		const electricityUseFormatted: string = noDecimalsFormatter.format(this.props.electricityUseKWh);
		

		const financesFormatted: number = Number(this.props.financesAvailable.toFixed(0));
		
		return (
			<>
				<MobileStepper
					variant='progress'
					steps={this.props.totalIterations}
					position='static'
					activeStep={this.props.year - 1}
					backButton={
						<Button size='small' 
							onClick={this.props.onBack} 
							disabled={!this.props.onBack}>
							{leftArrow()}
							Back
						</Button>
					}
					nextButton={
						<BasicPopover
							buttonSize='small'
							onClick={this.props.onProceed}
							buttonVariant='text'
							text='Proceed'
							variant='mouseover'
							endIcon={rightArrow()}
							buttonDisabled={this.props.btnProceedDisabled}
						>
							{this.props.totalIterations == 5 &&
								<div 
								style={{maxWidth: '200px'}}
								>
									{/* todo: special case for last year! */}
									Commit to your selected projects and proceed to Years {this.props.yearInterval} and {this.props.yearInterval + 1}.
								</div>
							}
							{this.props.totalIterations == 10 &&
								<div 
								style={{maxWidth: '200px'}}
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
								},{
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
							<HorizontalBarWithTooltip 
								width={400} height={145}
								data={[{
									// Finances available can be negative UP TO the amount of rebates.... may be changed later
									'Finances available': Math.max(financesFormatted, 0),
									'Money spent': this.props.moneySpent,
								}]}
							/>
						</Grid>


						<Grid container spacing={{ xs: 2, md: 2 }} columns={{ xs: 4, sm: 8, md: 16 }} pt={3}>
							<Grid item xs={2} sm={4} md={4}>
							<Typography id='dashboardText'>
									Natural gas emission rate: {
										naturalGasEmissionRateFormatted
									} kg/MMBTU
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
								<Typography id='dashboardText'>
									Emissions from natural gas: {
										emissionsFromNaturalGasFormatted
									} metric tons
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
								<Typography id='dashboardText'>
									Natural gas: ${this.props.naturalGasCostPerMMBTU.toFixed(2)}/MMBTU
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
							<Typography id='dashboardText'>
									Natural gas cost: ${naturalGasCost}
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
							<Typography id='dashboardText'>
									Electricity emission rate: {
										electricityEmissionRateFormatted
									} kg/kWh
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
								<Typography id='dashboardText'>
									Emissions from electricity: {
										emissionsFromElectricityFormatted
									} metric tons
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
								<Typography id='dashboardText'>
									Electricity: ${this.props.electricityCostPerKWh.toFixed(2)}/kWh
								</Typography>
							</Grid>
							<Grid item xs={2} sm={4} md={4}>
								<Typography id='dashboardText'>
									Electricity cost: ${electricityCost}
								</Typography>
							</Grid>
						</Grid>

					</Grid>
				</Box>
				<Divider variant='middle' />
			</>
		);
	}
}

export interface DashboardProps extends ControlCallbacks, TrackedStats, GameSettings {
	onBack?: () => void;
	onProceed: () => void;
	/**
	 * Whether the PROCEED Button is disabled.
	 */
	btnProceedDisabled: boolean;
}
