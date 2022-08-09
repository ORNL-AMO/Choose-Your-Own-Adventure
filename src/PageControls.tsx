import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap} from '@mui/material';
import type { ButtonGroupButton} from './components/Buttons';
import type { PageControl} from './components/controls';
import type { AppState } from './App';import React from 'react';

import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import Co2Icon from '@mui/icons-material/Co2';
import QuestionMarkIcon from '@mui/icons-material/QuestionMark';
import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';

import { backButton, continueButton, selectButton, infoButtonWithPopup, selectButtonCheckbox } from './components/Buttons';
import Pages from './Pages';
import Projects from './Projects';
import { theme } from './components/theme';
import { newStartPageControl } from './components/StartPage';
import { newYearRecapControl } from './components/YearRecap';
import { newGroupedChoicesControl } from './components/GroupedChoices';
import { newInfoDialogControl } from './components/InfoDialog';

let st = performance.now(); // Performance measurement

declare interface PageControls {
	[key: symbol]: PageControl;
}

/**
 * PageControls is a DICTIONARY object containing page controls. The key for this object is a symbol, specifically from the `Pages` object in `pages.tsx`.
 */
export const PageControls: PageControls = { };

PageControls[Pages.start] = newStartPageControl({
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

PageControls[Pages.introduction] = newInfoDialogControl({
	text: (state) => `For the past couple of decades, the automotive industry has been under pressure from regulators, public interest groups, stakeholders, customers, investors, and financial institutions to pursue a more sustainable model of growth.\nAs a sustainability manager at {${state.companyName}}, your job is to make sure your facility meets its new corporate carbon reduction goal:`,
	cardText: '{50%} carbon reduction over the next {10 years} with a {$1,000,000 annual budget}',
	title: 'Introduction',
	img: 'images/manufacturing.png',
	imgAlt: 'A robotic arm working on a car.',
	buttons: [
		backButton(Pages.start),
		continueButton(function (state, nextState) {
			return Pages.selectScope;
		}),
	]
});

PageControls[Pages.selectScope] = newGroupedChoicesControl({
	title: function (state, nextState) {
		// Year 1
		if (state.trackedStats.year === 1) {
			return 'To begin, you will need to decide which types of projects to pursue. {Would you like to...}';
		}
		// Subsequent years
		else {
			return `Welcome back. Choose the projects you wish to pursue for Year ${state.trackedStats.year}.`;
		}
	},
	groups: [
		{	
			title: '',
			choices: [
				{
					title: 'Scope 1',
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
					title: 'Scope 2',
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
	],
	hideDashboard: false,
}, (state, nextState) => {
	nextState.showDashboard = false;
	return Pages.introduction;
});

PageControls[Pages.scope1Projects] = newGroupedChoicesControl({
	title: (state) => `These are the possible {Scope 2} projects {${state.companyName}} can do this year.\nSelect what projects you want your company to work on in {Year ${state.trackedStats.year}}, and then click {Proceed} on the top right when you are ready.`,
	groups: [
		{
			title: 'Invest in energy efficiency',
			choices: [
				Projects[Pages.wasteHeatRecovery].getChoiceControl(),
				Projects[Pages.digitalTwinAnalysis].getChoiceControl(),
				Projects[Pages.processHeatingUpgrades].getChoiceControl(),
			]
		}, {
			title: 'Fuel switching',
			choices: [
				Projects[Pages.hydrogenPoweredForklifts].getChoiceControl(),
			]
		}, {
			title: 'Invest in electrification',
			choices: [
				Projects[Pages.electricBoiler].getChoiceControl(),
			]
		}
	],
	hideDashboard: false,
}, Pages.selectScope);

PageControls[Pages.scope2Projects] = newGroupedChoicesControl({
	title: (state) => `These are the possible {Scope 2} projects {${state.companyName}} can do this year.\nSelect what projects you want your company to work on in {Year ${state.trackedStats.year}}, and then click {Proceed} on the top right when you are ready.`,
	groups: [
		{
			title: 'Invest in energy efficiency',
			choices: [
				Projects[Pages.lightingUpgrades].getChoiceControl(),
			]
		}, {
			title: 'Bundled RECs (Renewable Energy Credits)',
			choices: [
				Projects[Pages.solarPanelsCarPort].getChoiceControl(),
				Projects[Pages.solarFieldOnsite].getChoiceControl(),
			]
		}, {
			title: 'Un-bundled RECs',
			choices: [
				{
					text: '8. Invest in wind VPPA',
					buttons: [
						// todo info
						co2SavingsButton(10.0),
						selectButtonCheckbox(function (state, nextState) {
							toggleSelectedPage(Pages.windVPPA, state, nextState);
							return Pages.scope2Projects;
						},
						undefined,
						(state) => state.selectedProjects.includes(Pages.windVPPA)
						),
					]
				}
			]
		}
	],
	hideDashboard: false,
}, Pages.selectScope);

PageControls[Pages.yearRecap] = newYearRecapControl({}, Pages.selectScope);

PageControls[Pages.wasteHeatRecovery] = newInfoDialogControl({
	title: '{SELECTED}: WASTE HEAT RECOVERY',
	cardText: 'You have achieved {3.5%} carbon emissions reduction and spent {$60,000} dollars.',
	text: [
		'[Waupaca Foundry: Cupola Waste Heat Recovery Upgrade Drives Deeper Energy Savings](https://betterbuildingssolutioncenter.energy.gov/showcase-projects/waupaca-foundry-cupola-waste-heat-recovery-upgrade-drives-deeper-energy-savings)',
		'Nice choice! In 2010, {Waupaca Foundry} implemented heat recovery system upgrades in their Plant 23, which lead to upgrades in other plants as well. Combined savings have led to a reduction in natural gas usage by {1,200,000 therms} per year and {72,000 tons} of annual CO2 reduction.',
	],
	buttons: [
		continueButton(Pages.scope1Projects),
	]
});

PageControls[Pages.digitalTwinAnalysis] = newInfoDialogControl({
	title: '{SELECTED}: DIGITAL TWIN ANALYSIS',
	cardText: 'You have achieved {2%} carbon emissions reduction and spent {$90,000} dollars.',
	text: '[Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management](https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant)\n\nGood choice! Ford Motor Company used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a 50% reduction in campus office space energy and water use compared to their older system.',
	img: 'images/ford.png',
	buttons: [
		continueButton(Pages.scope1Projects),
	]
});

PageControls[Pages.winScreen] = newInfoDialogControl({
	title: 'CONGRATULATIONS!',
	text: (state) => `You succeeded at the goal. You managed to decarbonize {${state.companyName}} by {${(state.trackedStats.carbonSavings * 100).toFixed(1)}%} in 10 years!`,
	img: 'images/confetti.png'
});

PageControls[Pages.loseScreen] = newInfoDialogControl({
	title: 'Sorry...',
	text: (state) => `Sorry, looks like you didn't succeed at decarbonizing {${state.companyName}} by 50%. You got to {${(state.trackedStats.carbonSavings * 100).toFixed(1)}%} in 10 years. Try again?`,
	buttons: [
		{
			text: 'Try again',
			variant: 'text',
			onClick: (state) => {
				location.href = String(location.href); // Reload the page
				
				return state.currentPage; // The page returned doesn't really matter
			}
		}
	]
});

export function notImplemented(pageBack?: symbol) {
	return newInfoDialogControl({
		title: 'Not implemented',
		text: 'Sorry, this page has not been implemented yet.',
		buttons: [
			backButton(pageBack || Pages.selectScope),
		]
	});
}

/**
 * Toggle whether a certain symbol is included in app.state.selectedProjects.
 */
export function toggleSelectedPage(page: symbol, state: AppState, nextState: AnyDict) {
	let selectedProjects = state.selectedProjects.slice();
	// IF ALREADY SELECTED
	if (selectedProjects.includes(page)) {
		selectedProjects.splice(selectedProjects.indexOf(page), 1);
	}
	// IF NOT ALREADY SELECTED
	else {
		selectedProjects.push(page);
	}
	nextState.selectedProjects = selectedProjects;
}

export function co2SavingsButton(percent: number): ButtonGroupButton {
	return {
		text: percent.toFixed(1) + '%',
		variant: 'text',
		startIcon: <Co2Icon/>,
		// infoPopup: <Typography variant='body1'>This project would provide {percent}% in CO<sub>2</sub> savings.</Typography>
	};
}

// todo: investigate whether making this a callback improves page load time (by not resolving all the react components at the start)
export function infoPopupWithIcons(title: string, bodyText: string, icons: Array<OverridableComponent<SvgIconTypeMap>>) {
	
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

export function projectCostAndCO2ReductionCards(projectCost: number, co2Reduction: number) {
	return [
		{
			text: `Total project cost: {$${projectCost.toLocaleString('en-US')}}`,
			color: theme.palette.secondary.dark, // todo change
		},
		{
			text: `CO_{2} reduction: {${co2Reduction.toFixed(1)}%}`,
			color: theme.palette.primary.light, //todo change
		}
	];
}

console.log('PageControls', performance.now() - st);