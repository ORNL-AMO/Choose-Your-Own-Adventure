import { Box, Grid, Typography } from "@mui/material";
import { PureComponentIgnoreFuncs } from "../functions-and-types";
import { PaperGridItem } from "./theme";
import React from 'react';
import Example from "./Example";

export class Dashboard extends PureComponentIgnoreFuncs <DashboardProps> {
	render() {
		return (
			<>
				<Box m={2}>
					<Example width={500} height={500} />
					{/* <Grid container spacing={2}>
						<Grid item xs={12}>
							<Typography variant='h3'>Dashboard</Typography>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Finances available: ${this.props.financesAvailable.toLocaleString('en-US')} / ${this.props.totalBudget.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Money spent: ${this.props.moneySpent.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Carbon reduction: {this.props.carbonReduced.toLocaleString('en-US')}%</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Carbon emissions: {this.props.carbonEmissions.toLocaleString('en-US')} metric tons</Typography>
							</PaperGridItem>
						</Grid>
						<Grid item xs={12} sm={6}>
							<PaperGridItem>
								<Typography>Rebates: ${this.props.totalRebates.toLocaleString('en-US')}</Typography>
							</PaperGridItem>
						</Grid>
					</Grid> */}
				</Box>
				{/* todo something prettier */}
				<hr/> 
			</>
		);
	}
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