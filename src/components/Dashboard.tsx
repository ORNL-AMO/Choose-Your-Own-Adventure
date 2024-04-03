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
import React, { Fragment, useRef } from 'react';
import GaugeChart from './GaugeChart';
import { StyledTableCell, StyledTableRow, theme } from './theme';
import type { ControlCallbacks } from './controls';
import BasicPopover from './BasicPopover';
import HorizontalBarWithTooltip from './HorizontalBar';
import type { TrackedStats } from '../trackedStats';
import { getElectricityEmissionsFactor, statsGaugeProperties } from '../trackedStats';
import { Table } from '@mui/material';
import { GameSettings } from './SelectGameSettings';
import { useEffect, useState } from "react";
import FinancesHeader, { FinancesAvailableText } from './HeaderFinances';

export interface DashboardProps extends ControlCallbacks, TrackedStats, GameSettings {
	onBack?: () => void;
	onProceed: () => void;
	btnBackDisabled: boolean;
	btnProceedDisabled: boolean;
}


export function Dashboard(props: DashboardProps) {
	const [showFloatingHeader, setShowFloatingHeader] = useState(false)
	const horizontalBarRef = useRef();
	const isVisible = useIsVisible(horizontalBarRef);

	let proceedHoverInfoEl = (<div
			style={{ maxWidth: '200px' }}
		>
			{/* todo: special case for last year! */}
			Commit to your selected projects and proceed to Years {props.gameYearDisplayOffset} and {props.gameYearDisplayOffset + 1}.
		</div>
	);

	if (props.totalGameYears == 10) {
		proceedHoverInfoEl = (<div
			style={{ maxWidth: '200px' }}
		>
			{/* todo: special case for last year! */}
			Commit to your selected projects and proceed to Year {props.currentGameYear}.
		</div>
		);
	}

	useEffect(() => {
		setShowFloatingHeader(!isVisible)
	}, [isVisible]);

	const CHART_SIZE = 250;

	const singleDecimalFormatter = Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 1,
	});
	const noDecimalsFormatter = Intl.NumberFormat('en-US', {
		minimumFractionDigits: 0,
		maximumFractionDigits: 0,
	});
	const threeDecimalFormatter = Intl.NumberFormat('en-US', {
		minimumFractionDigits: 1,
		maximumFractionDigits: 3,
	});

	const carbonSavingsPercent = props.carbonSavingsPercent * 100;
	const carbonSavingsFractionValue = clampRatio(props.carbonSavingsPercent, 1);
	const carbonSavingsFormatted = `${carbonSavingsPercent.toFixed(1)}%`;

	const naturalGasEmissionRateFormatted: string = threeDecimalFormatter.format(props.naturalGasEmissionsPerMMBTU);
	const electricityEmissionRateFormatted: string = threeDecimalFormatter.format(getElectricityEmissionsFactor(props.currentGameYear, props.gameYearInterval, props.gameYearDisplayOffset));
	const hydrogenEmissionRateFormatted: string = threeDecimalFormatter.format(props.hydrogenEmissionsPerMMBTU);

	const emissionsFromNaturalGasFormatted: string = singleDecimalFormatter.format(props.naturalGasEmissionsPerMMBTU * props.naturalGasMMBTU / 1000);
	const emissionsFromElectricityFormatted: string = singleDecimalFormatter.format(getElectricityEmissionsFactor(props.currentGameYear, props.gameYearInterval, props.gameYearDisplayOffset) * props.electricityUseKWh / 1000);
	const emissionsFromHydrogenFormatted: string = singleDecimalFormatter.format(props.hydrogenEmissionsPerMMBTU * props.hydrogenMMBTU / 1000);

	const electricityCost = noDecimalsFormatter.format(props.electricityCostPerKWh * props.electricityUseKWh);
	const naturalGasCost = noDecimalsFormatter.format(props.naturalGasCostPerMMBTU * props.naturalGasMMBTU);
	const hydrogenCost = noDecimalsFormatter.format(props.hydrogenCostPerMMBTU * props.hydrogenMMBTU);

	const naturalGasFormatted: string = noDecimalsFormatter.format(props.naturalGasMMBTU);
	const electricityUseFormatted: string = noDecimalsFormatter.format(props.electricityUseKWh);
	const hydrogenFormatted: string = noDecimalsFormatter.format(props.hydrogenMMBTU);

	const financesFormatted = Number(props.financesAvailable.toFixed(0));

	return (
		<>
			<Divider />

			{showFloatingHeader &&
				<Box sx={{
					position: "sticky",
					display: "flex",
					flexDirection: 'row',
					justifyContent: 'space-between',
					flexWrap: 'wrap',
					top: '0px',
					zIndex: 999,
					background: '#fff',
					boxShadow: '0px 25px 20px -20px rgba(0,0,0,0.45)'
				}}>
					<Box
						alignSelf={'center'}
						padding={'16px 32px'}
					>
						<Button size='medium'
							variant='outlined'
							onClick={props.onBack}
							disabled={props.btnBackDisabled}>
							{leftArrow()}
							Back
						</Button>
					</Box>
					<FinancesHeader
						financesAvailable={financesFormatted}
						moneySpent={props.implementationSpending}
						/>
					<Box
						alignSelf={'center'}
						padding={'16px 32px'}
					>
						<BasicPopover
							buttonSize='medium'
							onClick={props.onProceed}
							buttonVariant='outlined'
							text='Proceed'
							variant='mouseover'
							endIcon={rightArrow()}
							buttonDisabled={props.btnProceedDisabled}
						>
							{proceedHoverInfoEl}
						</BasicPopover>
					</Box>
				</Box>
			}
			<MobileStepper
				variant='progress'
				steps={props.totalGameYears}
				position='static'
				activeStep={props.currentGameYear - 1}
				LinearProgressProps={{ sx: { height: '16px', width: '50%' } }}
				sx={{ padding: '.75rem' }}
				backButton={
					<Button size='medium'
						variant='outlined'
						onClick={props.onBack}
						disabled={props.btnBackDisabled}>
						{leftArrow()}
						Back
					</Button>
				}
				nextButton={
					<BasicPopover
						buttonSize='medium'
						onClick={props.onProceed}
						buttonVariant='outlined'
						text='Proceed'
						variant='mouseover'
						endIcon={rightArrow()}
						buttonDisabled={props.btnProceedDisabled}
					>
					{proceedHoverInfoEl}
					</BasicPopover>
				}
			/>
			<Box m={2}>
				{/* todo timer for each year */}
				{props.totalGameYears == 5 &&
					<Typography variant='h6'>
						Years {props.gameYearDisplayOffset} and {props.gameYearDisplayOffset + 1} of 10
					</Typography>
				}
				{props.totalGameYears == 10 &&
					<Typography variant='h6'>
						Year {props.currentGameYear} of 10
					</Typography>
				}
				<Grid container spacing={2}>
					<Grid item xs={12}>
						{/* <Typography variant="h3">Dashboard</Typography> */}
						<GaugeChart
							width={CHART_SIZE}
							value1={carbonSavingsFractionValue}
							text={carbonSavingsFormatted}
							label='GHG Reduction'
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
								props.naturalGasMMBTU,
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
							value1={clampRatio(props.electricityUseKWh, statsGaugeProperties.electricityUseKWh.maxValue)}
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
								props.hydrogenMMBTU,
								statsGaugeProperties.hydrogenMMBTU.maxValue,
							)}
							text={hydrogenFormatted}
							label='Landfill Gas (MMBTU)'
							textFontSize={0.85}
							color1={'#f06807'}
							ticks={[{
								value: .5,
								label: shortenNumber(statsGaugeProperties.hydrogenMMBTU.maxValue * 0.5),
							}, {
								value: 1,
								label: shortenNumber(statsGaugeProperties.hydrogenMMBTU.maxValue),
							}]}
						/>

						<div ref={horizontalBarRef} style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'center'}}>
							<HorizontalBarWithTooltip
								width={400} height={145}
								inHeader={false}
								data={[{
									// Finances available can be negative UP TO the amount of rebates.... may be changed later
									'Finances available': Math.max(financesFormatted, 0),
									'Money spent': props.implementationSpending,
								}]}
							/>
							<FinancesAvailableText 
								financesAvailable={financesFormatted}
								moneySpent={props.implementationSpending}/>
						</div>
					</Grid>
				</Grid>
				<TableContainer component={Paper} sx={{ marginTop: 3 }}>
					<Table sx={{ minWidth: 650 }} size='small' aria-label='simple table'>
						<TableHead>
							<TableRow>
								<StyledTableCell align='center'> </StyledTableCell>
								<StyledTableCell align='center'>Natural Gas</StyledTableCell>
								<StyledTableCell align='center'>Electricity</StyledTableCell>
								<StyledTableCell align='center'>Landfill Gas</StyledTableCell>
							</TableRow>
						</TableHead>
						<TableBody>
							<StyledTableRow
								key={'naturalGas'}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<StyledTableCell id='dashboardText' align='center' component='th' scope='row'> {'Emission Rate'}</StyledTableCell>
								<StyledTableCell align='center'>{naturalGasEmissionRateFormatted} kg/MMBTU</StyledTableCell>
								<StyledTableCell align='center'>{electricityEmissionRateFormatted} kg/kWh</StyledTableCell>
								<StyledTableCell align='center'>{hydrogenEmissionRateFormatted} kg/MMBTU</StyledTableCell>
							</StyledTableRow>
							<StyledTableRow
								key={'electricity'}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<StyledTableCell id='dashboardText' align='center' component='th' scope='row'>{'Emissions from Utility'}</StyledTableCell>
								<StyledTableCell align='center'>{emissionsFromNaturalGasFormatted} metric tons</StyledTableCell>
								<StyledTableCell align='center'>{emissionsFromElectricityFormatted} metric tons</StyledTableCell>
								<StyledTableCell align='center'>{emissionsFromHydrogenFormatted} metric tons</StyledTableCell>
							</StyledTableRow>
							<StyledTableRow
								key={'hydrogen'}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<StyledTableCell id='dashboardText' align='center' component='th' scope='row'>{'Utility Cost per unit'}</StyledTableCell>
								<StyledTableCell align='center'>${props.naturalGasCostPerMMBTU.toFixed(2)}/MMBTU</StyledTableCell>
								<StyledTableCell align='center'>${props.electricityCostPerKWh.toFixed(2)}/kWh</StyledTableCell>
								<StyledTableCell align='center'>${props.hydrogenCostPerMMBTU.toFixed(2)}/MMBTU</StyledTableCell>
							</StyledTableRow>
							<StyledTableRow
								key={'financedTotalCosts'}
								sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
							>
								<StyledTableCell id='dashboardText' align='center' component='th' scope='row'>{'Total Cost'}</StyledTableCell>
								<StyledTableCell align='center'>${naturalGasCost}</StyledTableCell>
								<StyledTableCell align='center'>${electricityCost}</StyledTableCell>
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



export function useIsVisible(ref) {
	const [isIntersecting, setIntersecting] = useState(false);

	useEffect(() => {
		const observer = new IntersectionObserver(([entry]) => {
			setIntersecting(entry.isIntersecting);
		});

		observer.observe(ref.current);
		return () => {
			observer.disconnect();
		};
	}, [ref]);

	const isFirstLoadPosition = window.scrollY === 0;
	return isIntersecting || isFirstLoadPosition;
}