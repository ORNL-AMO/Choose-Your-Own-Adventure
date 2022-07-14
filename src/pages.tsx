import { GroupedChoicesProps, PageControl, newGroupedChoicesControl, newInfoDialogControl, newStartPageControl } from "./controls";
import React from 'react';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Co2Icon from '@mui/icons-material/Co2';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Grid, SvgIconTypeMap, Typography } from "@mui/material";
import { Box } from "@mui/system";
import { backButton, continueButton, selectButton, infoButtonWithPopup, infoButtonWithDialog, ButtonGroupButton } from "./Buttons";
import type { OverridableComponent } from "@mui/material/OverridableComponent";
import { theme } from "./theme";

let st = performance.now();
/**
 * Symbols to represent each page.
 */
export const Pages = {
	start: Symbol.for('start'),
	introduction: Symbol.for('introduction'),
	selectScope: Symbol.for('selectScope'),
	scope1Projects: Symbol.for('scope1Projects'),
	scope2Projects: Symbol.for('scope2Projects'),
	wasteHeatRecovery: Symbol.for('waste-heat-recovery'),
	wasteHeatRecoveryRebate: Symbol.for('waste-heat-recovery-rebate'),
	digitalTwinAnalysis: Symbol.for('digital-twin-analysis'),
	processHeatingUpgrades: Symbol.for('process-heating-upgrades'),
	hydrogenPoweredForklifts: Symbol.for('hydrogen-powered-forklifts'),
	electricBoiler: Symbol.for('electric-boiler'),
};

export const pageControls: PageControls = { };

pageControls[Pages.start] = newStartPageControl({
	buttons: [
		{
			text: 'Start Playing',
			variant: 'contained',
			onClick: function () {
				return Pages.introduction;
			},
			size: 'large',
		}
	]
});

pageControls[Pages.introduction] = newInfoDialogControl({
	text: 'For the past couple of decades, the automotive industry has been under pressure from regulators, public interest groups, stakeholders, customers, investors, and financial institutions to pursue a more sustainable model of growth.\nAs a sustainability manager at {$companyName}, your job is to make sure your facility meets its new corporate carbon reduction goal:',
	cardText: '{50%} carbon reduction over the next {10 years} with a {$1,000,000 annual budget}',
	title: 'Introduction',
	img: 'images/manufacturing.png',
	imgAlt: 'A robotic arm working on a car.',
	buttons: [
		backButton(Pages.start),
		continueButton(function (state, nextState) {
			nextState.showDashboard = true; // Show dashboard after the user clicked through the introduction
			return Pages.selectScope;
		}),
	]
});

pageControls[Pages.selectScope] = newGroupedChoicesControl({
	title: 'To begin, you will need to decide which types of projects to pursue. {Would you like to...}',
	groups: [
		{	
			title: '',
			choices: [
				{
					title: 'A',
					text: 'Tackle Scope 1 emissions – fossil fuel consumption',
					buttons: [
						infoButtonWithPopup(
							infoPopupWithIcons(
								'Scope 1: Direct Emissions',
								'Company emissions that are owned or controlled by the organization directly.',
								[LocalShippingIcon, FactoryIcon, LocationCityIcon],
							)
						),
						selectButton(Pages.scope1Projects),
					],
				},
				
			]
		}, {
			title: '',
			choices: [
				{
					title: 'B',
					text: 'Tackle Scope 1 emissions – fossil fuel consumption',
					buttons: [
						infoButtonWithPopup(
							infoPopupWithIcons(
								'Scope 2: Indirect Emissions',
								'Company emissions that are caused indirectly when the energy it purchases and uses is produced.',
								[FlashOnIcon, ElectricalServicesIcon]
							)
						),
						selectButton(Pages.scope2Projects),
					],
				},
			]
		}
	]
});

pageControls[Pages.scope1Projects] = newGroupedChoicesControl({
	title: '{Scope 1 Emissions Projects} - Good choice! You have {15 minutes} to explore this menu. Spend it wisely!',
	groups: [
		{
			title: 'Invest in energy efficiency',
			choices: [
				{
					text: '1. Upgrade heat recovery on boiler/furnace system',
					buttons: [
						infoButtonWithDialog({
							title: 'Energy Efficiency - Waste Heat Recovery',
							text: [
								'Currently, your facility uses {inefficient, high-volume} furnace technology, where {combustion gases} are evacuated through a side take-off duct into the emission control system', 
								'You can invest in capital improvements to {maximize waste heat recovery} at your facility through new control system installation and piping upgrades.'
							],
							cards: projectCostAndCO2ReductionCards(65_000, 3.5),
							img: 'images/waste-heat-recovery.png',
							imgAlt: '', // What is this diagram from the PPT?
							imgObjectFit: 'contain',
						}),
						co2SavingsButton(3.5),
						selectButton(function (state, nextState) {
							let selectedProjects = state.selectedProjects.slice();
							selectedProjects.push(Pages.wasteHeatRecovery);
							nextState.selectedProjects = selectedProjects;
							return Pages.wasteHeatRecovery; // todo
						}, 
						(state) => 
							state.selectedProjects.includes(Pages.wasteHeatRecovery)
						)
					]
				},
				{
					text: '2. Conduct digital twin analysis',
					buttons: [
						infoButtonWithDialog({
							title: 'Energy Efficiency - Digital Twin Analysis',
							text: [
								'A digital twin is the virtual representation of a physical object or system across its lifecycle.', 
								'You can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
							],
							img: 'images/chiller-systems-in-plant.png',
							imgAlt: 'A 3D model of the chiller systems in a plant',
							imgObjectFit: 'contain',
							cards: projectCostAndCO2ReductionCards(90_000, 2),
						}),
						co2SavingsButton(2.0),
						selectButton(function () {
							return Pages.scope1Projects; // todo
						})
					],
				},
				{
					text: '3. Explore efficient process heating upgrades',
					buttons: [
						infoButtonWithDialog({
							title: 'Energy Efficiency – Process Heating Upgrades',
							text: [
								'Currently, your facility has an {inefficient} body-on-frame paint process. The paint process is served by a variety of applications including compressed air, pumps and fans, as well as steam for hot water.',
								'You can invest in a new, upgraded paint process that is more {energy efficient}, {eliminates} steam to heat water, {re-circulates} air, and uses {lower temperatures}.'
							],
							img: 'images/car-manufacturing.png',
							imgAlt: 'The frame of a car inside a manufacturing facility.',
							cards: projectCostAndCO2ReductionCards(80_000, 2.5),
						}),
						co2SavingsButton(2.5),
						selectButton(function () {
							return Pages.scope1Projects; // todo
						})
					]
				}
			]
		}, {
			title: 'Fuel switching',
			choices: [
				{
					text: '4. Switch to hydrogen powered forklifts',
					buttons: [
						infoButtonWithDialog({
							title: 'Fuel Switching – Hydrogen Powered Forklifts',
							text: [
								'Currently, your facility uses {lead acid} batteries to power your mobile forklifts, which yields {high} maintenance costs and {low} battery life for each forklift.',
								'You can replace these batteries with {hydrogen fuel cell} batteries, which will result in {lower} maintenance costs, {longer} battery life, and contribute to your facility’s {reduced} emissions.',
							],
							img: 'images/hydrogen-powered-forklift.jpg',
							imgAlt: 'Hydrogen powered forklift.',
							imgObjectFit: 'contain',
							cards: projectCostAndCO2ReductionCards(100_000, 2.0),
						}),
						co2SavingsButton(2.0),
						selectButton(function () {
							return Pages.scope1Projects; // todo
						}),
					]
				}
			]
		}, {
			title: 'Invest in electrification',
			choices: [
				{
					text: '6. Change fossil fuel boiler to an electric boiler',
					buttons: [
						infoButtonWithDialog({
							title: 'Fuel Switching - Fossil Fuel to Electric Boiler',
							text: [
								'Currently, your facility operates two 700-hp firetube boilers that burn {No. 2 oil}, which releases CO_{2} into the atmosphere.', 
								'You have the opportunity to replace your oil-firing boiler with an {electric} one, which will {prevent} direct carbon emissions, {minimize} noise pollution, and {reduce} air contaminants.',
							],
							img: 'images/electric-boiler.png',
							imgAlt: 'Electric boiler',
							imgObjectFit: 'contain',
							cards: projectCostAndCO2ReductionCards(200_000, 4.5),
						}),
						co2SavingsButton(4.5),
						selectButton(function () {
							return Pages.scope1Projects; // todo
						}),
					]
				}
			]
		}
	]
});

// TODO tomorrow: New control class for waste heat recovery, slides 7 and 8

// pageControls[Pages.wasteHeatRecovery] = {
// 	// controlClass: 
// };

pageControls[Pages.digitalTwinAnalysis] = newInfoDialogControl({
	title: '{SELECTED}: DIGITAL TWIN ANALYSIS',
	cardText: 'You have achieved {2%} carbon emissions reduction and spent {$90,000} dollars.',
	text: '[Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management](https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant)\n\nGood choice! Ford Motor Company used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a 50% reduction in campus office space energy and water use compared to their older system.',
	img: 'images/ford.png',
});

declare interface PageControls {
	[key: symbol]: PageControl;
}

export class PageError extends Error {
	constructor(message) {
		super(message);
	}
}

function co2SavingsButton(percent: number): ButtonGroupButton {
	return {
		text: percent.toFixed(1) + '%',
		variant: 'text',
		startIcon: <Co2Icon/>,
		// infoPopup: <Typography variant='body1'>This project would provide {percent}% in CO<sub>2</sub> savings.</Typography>
	};
}

// todo: investigate whether making this a callback improves page load time (by not resolving all the react components at the start)
function infoPopupWithIcons(title: string, bodyText: string, icons: Array<OverridableComponent<SvgIconTypeMap>>) {
	
	const gridWidth = 12 / icons.length;
	
	const gridItems = icons.map((Icon, idx) => (
		<Grid item xs={gridWidth} key={idx}>
			<Icon fontSize='large'/>
		</Grid>
	));
	
	return (
		<div style={{maxWidth: '200px'}}>
			<Typography variant='h6'>{title}</Typography>
			<Typography variant='body1'>{bodyText}</Typography>
			<Box sx={{marginTop: 2}}>
				<Grid container spacing={4} sx={{textAlign: 'center'}}>
					{gridItems}
				</Grid>
			</Box>
		</div>
	);
}

function projectCostAndCO2ReductionCards(projectCost: number, co2Reduction: number) {
	return [
		{
			text: `Total project cost: {$${projectCost.toLocaleString('en-US')}}`,
			color: theme.palette.primary.light, //todo change
		},
		{
			text: `CO_{2} reduction: {${co2Reduction.toFixed(1)}%}`,
			color: theme.palette.secondary.light, // todo change
		}
	];
}

console.log(performance.now() - st);