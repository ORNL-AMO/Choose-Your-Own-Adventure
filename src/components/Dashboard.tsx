import {
	Box,
	Button,
	Divider,
	Grid,
	MobileStepper,
	Typography,
} from '@mui/material';
import { leftArrow, PureComponentIgnoreFuncs, rightArrow, clampRatio } from '../functions-and-types';
import React from 'react';
import GaugeChart from './GaugeChart';
import { theme } from './theme';
import type { ControlCallbacks } from './controls';
import BasicPopover from './BasicPopover';
import HorizontalBarWithTooltip from './HorizontalBar';

/**
 * exclusively for dashboardStatsGaugeProperties
 */
declare interface StatsGaugeProperties {
	label: string;
	color: string;
	textFontSize: number;
	maxValue: number;
}

/**
 * Labels and colors and stuff for some tracked stats.
 */
export const dashboardStatsGaugeProperties: 
	// {[key in keyof DashboardTrackedStats]?: StatsGaugeProperties}  //for later
	{[key: string]: StatsGaugeProperties}
= {
	naturalGasMMBTU: {
		label: 'Natural gas use (MMBTU)',
		color: theme.palette.primary.dark,
		textFontSize: 0.85,
		maxValue: 1_000_000,
	},
	electricityUseKWh: {
		label: 'Electricity use (kWh)',
		color: theme.palette.warning.main,
		textFontSize: 0.85,
		maxValue: 1_000_000,
	}
};

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
							onClick={() => {
								if (this.props.onBack) {
									this.props.doPageCallback(this.props.onBack);
								}
								else console.error('onClick called but props.onBack is not specified');
							}} 
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
							<div style={{maxWidth: '200px'}}>
								Proceed to the next year. TODO MORE DESCRIPTION
							</div>
						</BasicPopover>
					}
				/>
				<Box m={2}>
					{/* TODO: timer for each year */}
					<Typography variant='h6'>
						Year {this.props.year} of 10
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							{/* <Typography variant="h3">Dashboard</Typography> */}
							<GaugeChart
								width={CHART_SIZE}
								value={clampRatio(this.props.carbonSavings, 100)}
								text={`${this.props.carbonSavings.toLocaleString('en-US')}%`}
								label='Carbon savings'
								color={theme.palette.primary.dark}
								ticks={[{
									value: .5,
									label: '50%'
								}]}
							/>
							<GaugeChart
								width={CHART_SIZE}
								value={clampRatio(
									this.props.naturalGasMMBTU,
									dashboardStatsGaugeProperties.naturalGasMMBTU.maxValue,
								)}
								text={(this.props.naturalGasMMBTU).toLocaleString('en-US')}
								label='Natural gas use (MMBTU)'
								textFontSize={0.85}
								color={theme.palette.primary.dark}
								ticks={[{
									value: .5,
									label: '50%'
								}]}
							/>
							{/* <GaugeChart
								width={CHART_SIZE}
								value={clampRatio(
									this.props.carbonEmissions,
									MAX_CARBON_EMISSIONS
								)}
								text={`${(this.props.carbonEmissions / 1000).toLocaleString(
									"en-US"
								)} kT`}
								label="Carbon emissions"
								color={theme.palette.primary.dark}
							/> */}
							<GaugeChart
								width={CHART_SIZE}
								value={clampRatio(this.props.electricityUseKWh, dashboardStatsGaugeProperties.electricityUseKWh.maxValue)}
								text={this.props.electricityUseKWh.toLocaleString('en-US')}
								label='Electricity use (kWh)'
								textFontSize={0.85}
								color={theme.palette.warning.main}
								ticks={[{
									value: .5,
									label: '50%'
								}, {
									value: 1,
									label: '100%'
								}, {
									value: .666,
									label: '66%'
								}]}
							/>
							<HorizontalBarWithTooltip 
								width={400} height={145}
								data={[{
									// Finances available can be negative UP TO the amount of rebates.... may be changed later
									'Finances available': Math.max(this.props.financesAvailable, 0),
									'Money spent': this.props.moneySpent,
									'Rebates': this.props.totalRebates,
								}]}
							/>
							{/* <GaugeChart
								width={CHART_SIZE}
								value={clampRatio(this.props.financesAvailable, MAX_FINANCES)}
								text={`$${this.props.financesAvailable.toLocaleString(
									"en-US"
								)}`}
								label="Finances available"
								textFontSize={0.85}
								color={theme.palette.secondary.dark}
							/>
							<GaugeChart
								width={CHART_SIZE}
								value={clampRatio(this.props.moneySpent, MAX_FINANCES)}
								text={`$${this.props.moneySpent.toLocaleString(
									"en-US"
								)}`}
								label="Money spent"
								textFontSize={0.85}
								color={theme.palette.secondary.dark}
							/> */}
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
								Electricity: ${this.props.electricityCostKWh.toFixed(2)}/kWh
							</Typography>
						</Grid>
					</Grid>
				</Box>
				<Divider variant='middle' />
			</>
		);
	}
}

export interface DashboardTrackedStats {
	/**
	 * Natural gas, in millions of British Thermal Units (MMBTU, for reasons)
	 */
	naturalGasMMBTU: number;
	/**
	 * Cost of natural gas, per MMBTU.
	 */
	naturalGasCostPerMMBTU: number;
	/**
	 * Amount of electricity used, in kilowatt-hours (kWh).
	 */
	electricityUseKWh: number;
	/**
	 * Cost of electricity, per kWh.
	 */
	electricityCostKWh: number;
	
	totalBudget: number;
	financesAvailable: number;
	carbonSavings: number;
	carbonEmissions: number;
	moneySpent: number;
	totalRebates: number;
	/**
	 * current year, 1 through 10.
	 */
	year: number;
}

export interface DashboardProps extends ControlCallbacks, DashboardTrackedStats {
	onBack?: PageCallback;
	onProceed: () => void;
	/**
	 * Whether the PROCEED Button is disabled.
	 */
	btnProceedDisabled: boolean;
}
