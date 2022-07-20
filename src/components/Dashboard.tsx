import {
	Box,
	Button,
	Divider,
	Grid,
	MobileStepper,
	Typography,
} from "@mui/material";
import { leftArrow, PureComponentIgnoreFuncs, rightArrow } from "../functions-and-types";
import { PaperGridItem } from "./theme";
import React from "react";
import GaugeChart from "./GaugeChart";
import { theme } from "./theme";
import KeyboardArrowLeft from "@mui/icons-material/KeyboardArrowLeft";
import KeyboardArrowRight from "@mui/icons-material/KeyboardArrowRight";
import { ControlCallbacks } from "./controls";

export class Dashboard extends PureComponentIgnoreFuncs<DashboardProps> {
	render() {
		const MAX_FINANCES = 1_500_000;
		const MAX_CARBON_EMISSIONS = 75_000;
		const CHART_SIZE = 250;
		const MAX_REBATES = 500_000;

		return (
			<>
				<MobileStepper
					variant="progress"
					steps={10}
					position="static"
					activeStep={this.props.year}
					backButton={
						<Button size="small" 
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
						<Button
							size="small"
							onClick={this.props.onProceed}
							disabled={false}
						>
							Proceed
							{rightArrow()}
						</Button>
					}
				/>
				<Box m={2}>
					<Typography variant='h6'>
						Year {this.props.year} of 10
					</Typography>
					<Grid container spacing={2}>
						<Grid item xs={12}>
							{/* <Typography variant="h3">Dashboard</Typography> */}
							<GaugeChart
								width={CHART_SIZE}
								value={clampRatio(this.props.carbonReduced, 100)}
								text={`${this.props.carbonReduced.toLocaleString("en-US")}%`}
								label="Carbon reduction"
								color={theme.palette.primary.dark}
							/>
							<GaugeChart
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
							/>
							<GaugeChart
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
							/>
						</Grid>
						<Grid item xs={12} sm={6}>
							{/* <PaperGridItem> */}
								<Typography>
									Finances available: $
									{this.props.financesAvailable.toLocaleString("en-US")} / $
									{this.props.totalBudget.toLocaleString("en-US")}
									{/* budget */}
								</Typography>
							{/* </PaperGridItem> */}
						</Grid>
						<Grid item xs={12} sm={6}>
							{/* <PaperGridItem> */}
								<Typography>
									Rebates: ${this.props.totalRebates.toLocaleString("en-US")}
								</Typography>
							{/* </PaperGridItem> */}
						</Grid>
					</Grid>
				</Box>
				<Divider variant="middle" />
			</>
		);
	}
}

function clampRatio(value: number, max: number) {
	return Math.min(value / max, 1);
}

export interface DashboardTrackedStats {
	totalBudget: number;
	financesAvailable: number;
	carbonReduced: number;
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
}
