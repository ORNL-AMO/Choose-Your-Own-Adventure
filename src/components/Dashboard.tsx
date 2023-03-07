import {
	Box,
	Button,
	Divider,
	Grid,
	MobileStepper,
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


export class Dashboard extends PureComponentIgnoreFuncs<DashboardProps> {
	
	render() {
		const CHART_SIZE = 250;
		return (
			<>
				<MobileStepper
					variant='progress'
					steps={10}
					position='static'
					activeStep={this.props.year}
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
							<div 
							style={{maxWidth: '200px'}}
							>
								{/* todo: special case for last year! */}
								Commit to your selected projects and proceed to Year {this.props.year + 1}.
							</div>
						</BasicPopover>
					}
				/> 
				<Box m={2}>
					{/* todo timer for each year */}
					<Typography variant='h6'>
						Year {this.props.year} of 10
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							{/* <Typography variant="h3">Dashboard</Typography> */}
							<GaugeChart
								width={CHART_SIZE}
								value1={clampRatio(this.props.carbonSavings, 1)}
								text={`${(this.props.carbonSavings * 100).toLocaleString('en-US')}%`}
								label='Carbon savings'
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
								text={(this.props.naturalGasMMBTU).toLocaleString('en-US')}
								label='Natural gas use (MMBTU)'
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
								text={this.props.electricityUseKWh.toLocaleString('en-US')}
								label='Electricity use (kWh)'
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
									'Finances available': Math.max(this.props.financesAvailable, 0),
									'Money spent': this.props.moneySpent,
								}]}
							/>
						</Grid>
						{/* <Grid item xs={12} sm={6} md={4}>
							<Typography>
								Finances available: $
								{this.props.financesAvailable.toLocaleString("en-US")} / $
								{this.props.totalBudget.toLocaleString("en-US")}
							</Typography>
						</Grid> */}
						{/* <Grid item xs={12} sm={6} md={4}>
							<Typography>
								Rebates: ${this.props.totalRebates.toLocaleString("en-US")}
							</Typography>
						</Grid> */}
						<Grid item xs={12} sm={6}>
							<Typography>
								Natural gas: ${this.props.naturalGasCostPerMMBTU.toFixed(2)}/MMBTU
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography>
								Emissions from natural gas: {
									(this.props.naturalGasEmissionsPerMMBTU * this.props.naturalGasMMBTU / 1000).toLocaleString('en-US')
								} metric tons
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography>
								Electricity: ${this.props.electricityCostPerKWh.toFixed(2)}/kWh
							</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<Typography>
								Emissions from electrical grid: {
									(this.props.electricityEmissionsPerKWh * this.props.electricityUseKWh / 1000).toLocaleString('en-US')
								} metric tons
							</Typography>
						</Grid>
					</Grid>
				</Box>
				<Divider variant='middle' />
			</>
		);
	}
}

export interface DashboardProps extends ControlCallbacks, TrackedStats {
	onBack?: () => void;
	onProceed: () => void;
	/**
	 * Whether the PROCEED Button is disabled.
	 */
	btnProceedDisabled: boolean;
}
