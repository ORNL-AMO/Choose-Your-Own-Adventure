import { Emphasis, GroupedChoices, InfoDialog, InfoDialogProps, SelectScope, Choice, StartPage, GroupedChoicesProps } from "./controls";
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
	digitalTwin: Symbol.for('digitalTwin'),
};

export const pageControls: PageControls = { };

pageControls[Pages.start] = {
	controlClass: StartPage,
	controlProps: {
		buttons: [
			{
				text: 'Start Playing',
				variant: 'contained',
				onClick: Pages.introduction,
				size: 'large',
			}
		]
	}
};

pageControls[Pages.introduction] = {
	controlClass: InfoDialog,
	controlProps: {
		text: 'For the past couple of decades, the automotive industry has been under pressure from regulators, public interest groups, stakeholders, customers, investors, and financial institutions to pursue a more sustainable model of growth.\nAs a sustainability manager at {$companyName}, your job is to make sure your facility meets its new corporate carbon reduction goal:',
		cardText: '{50%} carbon reduction over the next {10 years} with a {$1,000,000 annual budget}',
		title: 'Introduction',
		img: 'images/manufacturing.png',
		imgAlt: 'A robotic arm working on a car.',
		buttons: [
			backButton(Pages.start),
			continueButton(Pages.selectScope),
		]
	}
};

pageControls[Pages.selectScope] = {
	controlClass: SelectScope,
	controlProps: {
		title: 'To begin, you will need to decide which types of projects to pursue. {Would you like to...}',
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
};

pageControls[Pages.selectScope] = {
	controlClass: GroupedChoices,
	controlProps: {
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
	}
};

pageControls[Pages.scope1Projects] = {
	controlClass: GroupedChoices,
	controlProps: {
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
								text: 'Currently, your facility uses inefficient, high-volume furnace technology, where combustion gases are evacuated through a side take-off duct into the emission control system.\n\nYou can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.',
								cardText: 'dsklfjds',
								img: 'images/waste-heat-recovery.png'
							}),
							co2SavingsButton(3.5),
						]
					},
					{
						text: '2. Upgrade heat recovery on boiler/furnace system',
						buttons: [
							infoButtonWithDialog({
								title: 'Energy Efficiency - Digital Twin Analysis',
								text: 'A digital twin is the virtual representation of a physical object or system across its lifecycle.\n\nYou can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
							})
						],
					},
				]
			}
		]
	}
};

pageControls[Pages.digitalTwin] = {
	controlClass: InfoDialog,
	controlProps: {
		title: '{SELECTED}: DIGITAL TWIN ANALYSIS',
		cardText: 'You have achieved {2%} carbon emissions reduction and spent {$90,000} dollars.',
		text: '[Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management](https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant)\n\nGood choice! Ford Motor Company used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a 50% reduction in campus office space energy and water use compared to their older system.',
		img: 'images/ford.png',
	},
};

// eslint-disable-next-line @typescript-eslint/ban-types
export declare type Component = React.Component|Function;

export declare interface PageControl {
	controlClass?: Resolvable<Component|undefined>;
	controlProps: {
		[key: string]: any;
	}
}

export declare interface SelectScopeControl extends PageControl {
	controlClass: typeof SelectScope;
	controlProps: {
		title: string;
		choices: Choice[];
	}
}

export declare interface GroupedChoicesControl extends PageControl {
	controlClass: typeof GroupedChoices;
	controlProps: {
		title: string;
		groups: Array<{
			title: string;
			choices: Choice[];
		}>;
	}
}

declare interface PageControls {
	[key: symbol]: PageControl|SelectScopeControl;
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
		infoPopup: <Typography variant='body1'>This project would provide {percent}% in CO<sub>2</sub> savings.</Typography>
	};
}

// todo: investigate whether making this a callback improves page load time (by not resolving all the react components at the start)
function infoPopupWithIcons(title: string, bodyText: string, icons: Array<OverridableComponent<SvgIconTypeMap>>) {
	
	const gridWidth = 12 / icons.length;
	
	const gridItems = icons.map((Icon, idx) => (
		<Grid item xs={gridWidth} key={idx}>
			<Icon fontSize='large'/>
			{/* {icon} */}
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

console.log(performance.now() - st);