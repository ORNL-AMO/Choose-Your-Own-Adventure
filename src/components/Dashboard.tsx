import { Box, Grid, Typography } from "@mui/material";
import { PureComponentIgnoreFuncs } from "../functions-and-types";
import { PaperGridItem } from "./theme";
import React from 'react';
import GaugeChart from "./GaugeChart";
import { theme } from "./theme";

export class Dashboard extends PureComponentIgnoreFuncs <DashboardProps> {
	render() {
		const MAX_FINANCES = 1_500_000;
		const MAX_CARBON_EMISSIONS = 75_000;
		const CHART_SIZE = 250;
		const MAX_REBATES = 500_000;
		
		return (
			<>
				<Box m={2}>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography variant='h3'>Dashboard</Typography>
							<GaugeChart 
								width={CHART_SIZE} 
								value={clampRatio(this.props.carbonReduced, 100)} 
								text={`${this.props.carbonReduced.toLocaleString('en-US')}%`} 
								label='Carbon reduction'
								color={theme.palette.primary.dark}
							/>
							<GaugeChart 
								width={CHART_SIZE} 
								value={clampRatio(this.props.carbonEmissions, MAX_CARBON_EMISSIONS)} 
								text={`${(this.props.carbonEmissions / 1000).toLocaleString('en-US')} kT`} 
								label='Carbon emissions'
								color={theme.palette.primary.dark}
							/>
							<GaugeChart 
								width={CHART_SIZE} 
								value={clampRatio(this.props.financesAvailable, MAX_FINANCES)} 
								text={`$${this.props.financesAvailable.toLocaleString('en-US')}`} 
								label='Finances available'
								textFontSize={0.85}
								color={theme.palette.secondary.dark}
							/>
							<GaugeChart
								width={CHART_SIZE}
								value={clampRatio(this.props.moneySpent, MAX_FINANCES)}
								text={`$${this.props.financesAvailable.toLocaleString('en-US')}`}
								label='Money spent'
								textFontSize={0.85}
								color={theme.palette.secondary.dark}
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Finances available: ${this.props.financesAvailable.toLocaleString('en-US')} / ${this.props.totalBudget.toLocaleString('en-US')} budget</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Rebates: ${this.props.totalRebates.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
					</Grid>
				</Box>
				{/* todo something prettier */}
				<hr/> 
			</>
		);
	}
}

function clampRatio(value: number, max: number) {
	return Math.min(value / max, 1);
}

export interface DashboardProps {
	totalBudget: number;
	financesAvailable: number;
	carbonReduced: number;
	carbonEmissions: number;
	moneySpent: number;
	totalRebates: number;
	// todo brownie points
}