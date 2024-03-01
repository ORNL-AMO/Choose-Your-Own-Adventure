import React from 'react';
import FlameIcon from '@mui/icons-material/LocalFireDepartment';
import BoltIcon from '@mui/icons-material/Bolt';
import Pages from "./Pages";
import TrafficConeIcon from './icons/TrafficConeIcon';
import Co2Icon from '@mui/icons-material/Co2';
import { ProjectControl, absolute } from "./ProjectControl";
import { getGreenBondsFinancing, getLoanFinancing, getEaaSFinancing, getHasFinancingStarted } from './Financing';

declare interface ProjectControls {
	[key: symbol]: ProjectControl;
}
const Projects: ProjectControls = {};
export default Projects;


/* -======================================================- */
//                   PROJECT CONTROLS
/* -======================================================- */
Projects[Pages.wasteHeatRecovery] = new ProjectControl({
	// Page symbol associated with the project. MUST BE THE SAME AS WHAT APPEARS IN Projects[...]
	pageId: Pages.wasteHeatRecovery,
	isCapitalFundsEligible: true,
	isEnergyEfficiency: true,
	// project cost, in dollars
	baseCost: 210_000,
	financedAnnualCost: 81_000,
	financedTotalCost: 324_000,
	financingOptions: [
		{
			financingType: getLoanFinancing(4),
		},
	],
	// Stats that appear in the CARDS inside the INFO DIALOG. These should mirror ActualAppliers 
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-14_400),
	},
	// statsActualAppliers should mirror 
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-14_400),
	},
	// Stats / Surprises that are applied in Year Recap. 
	statsRecapAppliers: {
		yearRebates: absolute(5_000),
	},
	title: 'Waste Heat Recovery',
	shortTitle: 'Install waste heat recovery to preheat boiler water',
	// bracketed words show as bold emphasis in the app 
	choiceInfoText: [
		'Your plant’s boilers currently pull water in directly from the plant water inlet.',
		'Installing a waste heat recovery system to preheat the water would reduce the amount of natural gas required by the system.'
	],
	recapDescription: 'Insert flavor text here!',
	choiceInfoImg: 'images/waste-heat-recovery.png',
	choiceInfoImgAlt: '', // What is this diagram from the PPT?
	choiceInfoImgObjectFit: 'contain',
	// List of surprise dialogs to show to the user when the hit select THE FIRST TIME.
	utilityRebateValue: 5000,
	// Case study to show in the year recap
	caseStudy: {
		title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
		url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
		text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
	},
	// Bit of text to preview what to expect from the project.
	energySavingsPreviewIcon: {
		text: '12%',
		inputType: 'button',
		variant: 'text',
		startIcon: <FlameIcon />
	},
	// SEE BELOW: EXAMPLE FOR CONDITIONAL PROJECT VISIBILITY - you can also do something like state.completedProjects.includes(Pages.myOtherProject)
	// visible: function (state: AppState) {
	//  return state.trackedStats.year >= 2;
	// }
});
// Projects[Pages.digitalTwinAnalysis] = new ProjectControl({
//  pageId: Pages.digitalTwinAnalysis,
//  cost: 90_000,
//  statsInfoAppliers: {
//      naturalGasMMBTU: absolute(-2_400),
//  },
//  statsActualAppliers: {
//      naturalGasMMBTU: absolute(-2_400),
//  },
//  title: 'Energy Efficiency - Digital Twin Analysis',
//  shortTitle: 'Conduct digital twin analysis',
//  choiceInfoText: [
//      'A digital twin is the virtual representation of a physical object or system across its lifecycle.',
//      'You can use digital twin technology to accurately {detect energy losses}, pinpoint areas where energy can be conserved, and improve the overall performance of production lines.'
//  ],
//  recapDescription: 'Insert flavor text here!',
//  choiceInfoImg: 'images/chiller-systems-in-plant.png',
//  choiceInfoImgAlt: 'A 3D model of the chiller systems in a plant',
//  choiceInfoImgObjectFit: 'contain',
//  caseStudy: {
//      title: 'Ford Motor Company: Dearborn Campus Uses A Digital Twin Tool For Energy Plant Management',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/implementation-models/ford-motor-company-dearborn-campus-uses-a-digital-twin-tool-energy-plant',
//      text: '{Ford Motor Company} used digital twin to improve the life cycle of their campus’s central plant. The new plant is projected to achieve a {50%} reduction in campus office space energy and water use compared to their older system.'
//  },
//  energySavingsPreviewIcon: {
//      text: '2.0%',
//      variant: 'text',
//      startIcon: <FlameIcon />,
//  }
// });

// todo green bonds
Projects[Pages.processHeatingUpgrades] = new ProjectControl({
	pageId: Pages.processHeatingUpgrades,
	isCapitalFundsEligible: true,
	baseCost: 80_000,
	financedAnnualCost: 31_000,
	financedTotalCost: 124_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-300_000),
		naturalGasMMBTU: absolute(-3000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-300_000),
		naturalGasMMBTU: absolute(-3000),
	},
	title: 'Paint Booth Upgrades',
	financingOptions: [
		{
			financingType: getGreenBondsFinancing(4),
		},
	],
	shortTitle: 'Explore upgrades for the entire paint process system',
	choiceInfoText: [
		'Currently, your facility has an {inefficient} body-on-frame paint process. The paint process is served by a variety of applications including compressed air, pumps, and fans, as well as steam for hot water.',
		'You can invest in a new, upgraded paint process that is more {energy efficient}, {eliminates} steam to heat water, {re-circulates} air, and uses {lower temperatures}.'
	],
	choiceInfoImg: 'images/car-manufacturing.png',
	choiceInfoImgAlt: 'The frame of a car inside a manufacturing facility.',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Nissan North America: New Paint Plant',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/waupaca-foundry-cupola-waste-heat-recovery-upgrade-drives-deeper-energy-savings',
		text: 'In 2010, {Nissan’s Vehicle Assembly Plant} in Smyrna, Tennessee is {40%} more energy efficient than its predecessor, using an innovative “3-Wet” paint process that allows for the removal of a costly high temperature over bake step.'
	},
	energySavingsPreviewIcon: {
		text: '1.0%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.hydrogenPoweredForklifts] = new ProjectControl({
	pageId: Pages.hydrogenPoweredForklifts,
	baseCost: 150_000,
	isEnergyEfficiency: true,
	financedAnnualCost: 37_500,
	financedTotalCost: 150_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	statsInfoAppliers: {
		electricityUseKWh: absolute(280_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(280_000),
	},
	title: 'More efficient batteries for forklifts',
	shortTitle: 'Switch forklifts to lithium-ion batteries',
	choiceInfoText: [
		`Currently, your facility uses lead acid batteries to power your mobile forklifts, which yields high maintenance costs and low battery life for each forklift. 
		You can replace these batteries with lithium-ion batteries, which will result in higher efficiency batteries and charging, lower maintenance costs, longer battery life, 
		and you will also be able to shutdown a costly ventilation system. By quantifying the additional benefits of the new system, 
		you were able to convince management to transfer some maintenance budget over for this project, reducing your required payment.`
	],
	choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
	choiceInfoImgAlt: 'Hydrogen powered forklift.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Better Buildings, Better Plants SUMMIT',
		url: 'https://betterbuildingssolutioncenter.energy.gov/sites/default/files/2023Summit-Industrial_Energy_Efficiency-Slides.pdf',
		text: 'Better Buildings, Better Plants SUMMIT'
	},
	energySavingsPreviewIcon: {
		text: '??%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
// Projects[Pages.lightingUpgrades] = new ProjectControl({
//  pageId: Pages.lightingUpgrades,
//  cost: 12_000,
//  statsInfoAppliers: {
//      electricityUseKWh: relative(-0.125),
//  },
//  statsActualAppliers: {
//      electricityUseKWh: relative(-0.125),
//  },
//  statsRecapAppliers: {
//      yearRebates: absolute(7_500),
//  },
//  title: 'Energy Efficiency – Lighting Upgrades',
//  shortTitle: 'Explore lighting upgrades',
//  choiceInfoText: [
//      'Your plant currently uses {inefficient} T12 lighting. The lighting level in certain areas in the facility is {low} and affects the productivity of workers in those areas.',
//      'You could replace this lighting with LED lighting, which provides {reduced} energy consumption, a {longer} lifespan, and lighting control.'
//  ],
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'Lennox International: LED Project At New Regional Distribution Leased Location',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/lennox-international-led-project-at-new-regional-distribution-leased-location',
//      text: 'In 2016, {Lennox International} in Richardson, Texas implemented LED lighting throughout their warehouse, which resulted in annual energy savings of {$35,000.}'
//  },
//  utilityRebateValue: 5000,
// });

Projects[Pages.blendedFuel] = new ProjectControl({
	pageId: Pages.blendedFuel,
	isCapitalFundsEligible: true,
	baseCost: 500_000,
	isEnergyEfficiency: true,
	financedAnnualCost: 50_000,
	financedTotalCost: 500_000,
	financingOptions: [
		{
			financingType: getGreenBondsFinancing(10),
		},
	],
	statsInfoAppliers: {
		hydrogenMMBTU: absolute(18_000),
		naturalGasMMBTU: absolute(-18_000),
	},
	statsActualAppliers: {
		hydrogenMMBTU: absolute(18_000),
		naturalGasMMBTU: absolute(-18_000),
	},
	title: 'Blended Fuel for boiler',
	shortTitle: 'Utilize 30% landfill gas in your large boiler',
	choiceInfoText: [
		`As your larger boiler is still well within its expected lifetime, replacement is not yet warranted. 
		Instead, you have investigated the potential for fuel blending with local landfill gas. 
		It has been decided that a 30% blend best suits your needs. Your nearby landfill is beginning to explore this and is looking for buyers before investing. 
		While the cost of gas will be about half that of natural gas, you will be taking on some of the costs of the procurement development, plus the on-site pipeline and boiler retrofit. `
	],
	choiceInfoImg: 'images/electric-boiler.png',
	choiceInfoImgAlt: 'electric boiler',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	// add case study
});

Projects[Pages.landfillGasForOven] = new ProjectControl({
	pageId: Pages.landfillGasForOven,
	isCapitalFundsEligible: true,
	isEnergyEfficiency: true,
	baseCost: 200_000,
	financedAnnualCost: 20_000,
	financedTotalCost: 200_000,
	financingOptions: [
		{
			financingType: getGreenBondsFinancing(10),
		},
	],
	statsInfoAppliers: {
		hydrogenMMBTU: absolute(7_500),
		naturalGasMMBTU: absolute(-7_500),
	},
	statsActualAppliers: {
		hydrogenMMBTU: absolute(7_500),
		naturalGasMMBTU: absolute(-7_500),
	},
	title: 'Landfill Gas for oven',
	shortTitle: 'Utilize landfill gas for an oven.',
	choiceInfoText: [
		`As part of the boiler project, you have investigated the potential for fuel blending with local landfill gas. 
		You have decided to test one of your ovens out with landfill gas. 
		Your nearby landfill is beginning to explore this and is looking for buyers before investing. 
		While the cost of gas will be about half that of natural gas, you will be taking on some of the costs of the procurement development, 
		plus the on-site pipeline and boiler retrofit.`
	],
	choiceInfoImg: 'images/electric-boiler.png',
	choiceInfoImgAlt: 'electric boiler',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	// add case study
});


Projects[Pages.electricBoiler] = new ProjectControl({
	pageId: Pages.electricBoiler,
	isCapitalFundsEligible: true,
	baseCost: 500_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(200_000),
		naturalGasMMBTU: absolute(-20_000), // since the flavor text says No. 2 oil... maybe add a new stat later
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(200_000),
		naturalGasMMBTU: absolute(-20_000),
	},
	title: 'Fossil Fuel to Electric Boiler',
	shortTitle: 'Replace the old fossil fuel boiler with an electric boiler',
	choiceInfoText: [`The smaller of your two boilers is older and near ready for replacement.  You can replace that boiler with an electric providing the same steam pressure, 
	temperature and rate. As the boiler needs replacing soon, corporate has agreed to pay for part of this project out of capital funds, leaving you with about half the total installed cost.`],
	choiceInfoImg: 'images/electric-boiler.png',
	choiceInfoImgAlt: 'electric boiler',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	// add case study
});
Projects[Pages.solarPanelsCarPort] = new ProjectControl({
	pageId: Pages.solarPanelsCarPort,
	isCapitalFundsEligible: true,
	baseCost: 150_000,
	isSinglePaymentRenewable: true,
	financedAnnualCost: 37_500,
	financedTotalCost: 150_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: false,
	isRenewable: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	statsRecapAppliers: {
		financesAvailable: absolute(-30_000),
		hiddenSpending: absolute(30_000),
	},
	recapSurprises: [{
		title: 'Uh oh - Bad Asphalt!',
		text: 'While assessing the land in person, the contractor found that the parking lot\'s {asphalt needs replacement}. This will require an {additional $30,000} for the carport’s installation.',
		className: 'year-recap-negative-surprise',
		avatar: {
			icon: <TrafficConeIcon />,
			backgroundColor: 'rgba(54,31,6,0.6)',
			color: 'rgb(255 135 33)',
		}
	}],
	title: 'Small Carport Solar Installation',
	shortTitle: 'Install solar panels on new facility carport. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: [
		`You decided to look into installing a small covered carport with a solar electricity generation system. 
		Given the sizing of your parking lot and available room, you decide on a {0.25 MW system} and use parking in the carport as an incentive to well-performing or energy-saving employees. 
		Corporate has agreed that you will receive an annual {CREDIT} for the avoided grid electricity payment added to your budget every year.`
	],
	choiceInfoImg: 'images/solar-panels.png',
	choiceInfoImgAlt: 'Solar panels on the roof top of a car parking lot.',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Lockheed Martin 2.25 Megawatts Solar Carport',
		url: 'https://www.agt.com/portfolio-type/lockheed-martin-solar-carport/',
		text: 'In 2017, {Lockheed Martin} installed a 4-acre solar carport and was able to provide {3,595,000} kWh/year, or enough electricity to power almost {500 homes} annually.',
	},
	energySavingsPreviewIcon: {
		text: '1.8%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => {
		const isCarportCompleted = state.completedProjects.some(project => project.page === Pages.solarPanelsCarPort);
		return !isCarportCompleted;
	},
});
Projects[Pages.solarPanelsCarPortMaintenance] = new ProjectControl({
	pageId: Pages.solarPanelsCarPortMaintenance,
	isCapitalFundsEligible: true,
	isRenewable: true,
	baseCost: 10_000,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-537_000),
	},
	title: 'Carport Solar - Maintenance',
	shortTitle: 'Continue receiving energy from your solar generation. {YOU MUST RENEW THIS PROJECT ANNUALLY}.',
	choiceInfoText: ['You have installed and paid for your carport solar but need to perform small maintenance tasks for it. {YOU MUST RENEW THIS PROJECT ANNUALLY} to continue receiving the energy credits.'],
	choiceInfoImg: 'images/solar-panels.png',
	choiceInfoImgAlt: 'Solar panels on the roof top of a car parking lot.',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '1.8%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.solarRooftop] = new ProjectControl({
	pageId: Pages.solarRooftop,
	isCapitalFundsEligible: true,
	isRenewable: true,
	isSinglePaymentRenewable: true,
	baseCost: 3_750_000,
	financedAnnualCost: 460_000,
	financedTotalCost: 4_600_000,
	financingOptions: [
		{
			financingType: getLoanFinancing(10),
		},
	],
	statsInfoAppliers: {
		electricityUseKWh: absolute(-5_365_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-5_365_000),
	},
	//   statsRecapAppliers: {
	//       financesAvailable: absolute(-30_000),
	//        implementationSpending: absolute(30_000),
	//    },
	//    recapSurprises: [{
	//        title: 'Uh oh - Bad Asphalt!',
	//        text: 'While assessing the land in person, the contractor found that the parking lot\'s {asphalt needs replacement}. This will require an {additional $30,000} for the carport’s installation.',
	//        avatar: {
	//           icon: <TrafficConeIcon />,
	//            backgroundColor: 'rgba(54,31,6,0.6)',
	//           color: 'rgb(255 135 33)',
	//        }
	//    }],
	title: 'Rooftop mid-sized solar with storage',
	shortTitle: 'Build a 2MW rooftop solar array, with storage.',
	choiceInfoText: [
		`You believe you can install a 2MW system with storage for 0.5MW without interfering with your existing roof infrastructure.
		Corporate has agreed that you will receive an annual {CREDIT} for the avoided grid electricity payment added to your budget every year.`
	],
	choiceInfoImg: 'images/solar-field.jpg',
	choiceInfoImgAlt: 'Solar panels field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'Financing Carbon Projects Factsheet',
		url: 'https://betterbuildingssolutioncenter.energy.gov/sites/default/files/attachments/External_Financing_Carbon_Projects_Factsheet.pdf',
		text: '',
	},
	energySavingsPreviewIcon: {
		text: '18%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

//Empty Projects Scope 1 yr1-yr5
Projects[Pages.airHandingUnitUpgrades] = new ProjectControl({
	pageId: Pages.airHandingUnitUpgrades,
	isCapitalFundsEligible: true,
	baseCost: 175_000,
	financedAnnualCost: 67_000,
	financedTotalCost: 268_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-1_165_000),
		naturalGasMMBTU: absolute(-3600),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-1_165_000),
		naturalGasMMBTU: absolute(-3600),
	},
	title: 'Install Automated Controls for Air Handling Units',
	shortTitle: 'Install automated AHU controls to manage airflow without requiring the plant operator to manage the settings.',
	choiceInfoText: [
		'Your facilities have 20 AHUs that deliver over 1.2 million cubic feet per minute of conditioned air to maintain temperature, humidity, and air quality.',
		'Upgrading the controls system will lower the speed of the AHU motors once set points are met, enabling the temperature and humidity to be maintained while running the motors at a lower kilowatt (kW) load.',
		'Additionally, the controls include CO2 sensors to monitor air quality and adjust outdoor air ventilation accordingly. '
	],
	choiceInfoImg: 'images/air-handling-units.jpg',
	choiceInfoImgAlt: 'air handling unit',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'NISSAN NORTH AMERICA: AIR HANDLING UNITS CONTROL UPGRADE DELIVERS MASSIVE ENERGY SAVINGS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/nissan-north-america-air-handling-units-control-upgrade-delivers-massive-energy',
		text: 'Nissan’s Canton, Mississippi plant is one of four of the company’s manufacturing facilities in the United States. Opened in 2003, the Canton plant is a 4.5 million square foot plant that can produce up to 410,000 vehicles annually.'
	},
	energySavingsPreviewIcon: {
		text: '3.0%',
		inputType: 'button',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
Projects[Pages.advancedEnergyMonitoring] = new ProjectControl({
	pageId: Pages.advancedEnergyMonitoring,
	isCapitalFundsEligible: true,
	baseCost: 60_000,
	financedAnnualCost: 23_000,
	financedTotalCost: 92_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		// electricityUseKWh: absolute(-0.03),
		// naturalGasMMBTU: relative(-0.03),
	},
	statsActualAppliers: {
		// electricityUseKWh: relative(-0.03),
		// naturalGasMMBTU: relative(-0.03),
	},
	title: 'Advanced Energy Monitoring with Wireless Submetering',
	shortTitle: 'Installing submeters and an energy monitoring system will allow for the identification of future projects.',
	choiceInfoText: [
		`Your plant has {no monitoring} of its electrical and natural gas load beyond their monthly utility bills. However, installing submeters at every electrical and natural gas load in the plant is not economical or necessary. It was determined that you only need enough submeters installed so that the modeled energy consumption mimics the site’s actual energy curve. 
		This project would first determine which loads the plant would benefit from determining the energy consumption of.
	    The loads resulting in savings greater than the cost of a sensor were chosen as metering points. Sites for {50 sensors} were identified, covering over 75% of the facility load. While this project has {no direct energy savings}, it will allow for other projects to be identified. `
	],
	choiceInfoImg: 'images/advanced-sensors.png',
	choiceInfoImgAlt: 'advanced sensors',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'SAINT-GOBAIN CORPORATION',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/saint-gobain-corporation-advanced-energy-monitoring-wireless-submetering',
		text: 'Saint-Gobain North America’s current goal in energy monitoring is to gain more granular data on energy usage within its manufacturing sites to accelerate the achievement of its sustainability goals; namely reducing GHG emissions and lowering energy intensity.'
	},
	energySavingsPreviewIcon: {
		text: '0.0%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
// Projects[Pages.condensingEconomizerInstallation] = new ProjectControl({
//  pageId: Pages.condensingEconomizerInstallation,
//  cost: 95_000,
//  statsInfoAppliers: {
//      naturalGasMMBTU: relative(-0.07),
//  },
//  statsActualAppliers: {
//      naturalGasMMBTU: relative(-0.07),
//  },
//  title: 'Condensing Economizer Installation',
//  shortTitle: 'Condensing Economizer Installation ',
//  choiceInfoText: [
//      'The project involved recovering heat from the boiler exhaust via a direct contact condensing economizer. Exhaust is vented to the economizer in conjunction with the steam from each of the site’s deaerators and condensate return tanks.',
//      'Dampers (a valve or plate that regulates the flow of air inside a duct) installed at each broiler stack ensure proper draft and combustion flow to the economizer. This allows water in direct contact with the boiler exhaust to be heated and piped throughout the facility to the heat sinks (a temperature regulator).',
//      ' As a result, the hot water is used to pre-heat boiler water andfacility product through air gap plate and frame heat exchangers. Hot water flow is then regulated via control valves set to certain temperatures at an extremely steady state. Overall, the heat recovery system is monitored by a programmable logic control (PLC) system.',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'PEPSICO: CONDENSING ECONOMIZER INSTALLATION',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/pepsico-condensing-economizer-installation',
//      text: 'As part of the company’s 2025 25% greenhouse gas (GHG) reduction goal, it set out to reduce the energy usage of the Gatorade pasteurization process. Pasteurization is a process in which certain foods, such as milk and fruit juice, are treated with heat to eliminate pathogens and extend shelf life.'
//  },
//  energySavingsPreviewIcon: {
//      text: '7.0%',
//      variant: 'text',
//      startIcon: <FlameIcon />,
//  },
// });

// todo eaas
Projects[Pages.boilerControl] = new ProjectControl({
	pageId: Pages.boilerControl,
	isCapitalFundsEligible: true,
	baseCost: 100_000,
	financedAnnualCost: 38_000,
	financedTotalCost: 152_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-9600),
	},
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-9600),
	},
	title: 'Installing boiler monitors and control',
	shortTitle: 'Install a combustion controller to monitor and optimize the fuel-to-air ratio to maximize the efficiency of the combustion process. ',
	choiceInfoText: [
		`Your larger boiler is older, but still well within its expected lifetime. Adding a combustion controller to monitor the fuel-to-air ratio and allow you to optimize excess oxygen to maximize the efficiency of the combustion process while maintaining safe and stable boiler operation.
	    In addition, the flue gas recirculation fan can be installed to improve performance by lowering the maximum flame temperature to the minimum required level and reducing nitrogen oxide emissions by lowering the average oxygen content of the air. Together this will also minimize O&M costs, and extend the useful lifetime of the boiler.`
	],
	choiceInfoImg: 'images/boiler-monitoring.png',
	choiceInfoImgAlt: 'boiler monitoring.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'BENTLEY MILLS: BOILER CONTROL SYSTEM UPGRADES',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/bentley-mills-boiler-control-system-upgrades',
		text: 'Bentley Mills uses a large quantity of steam throughout their manufacturing process chain. In 2014, Bentley Mills began implementing a project to upgrade the control system for one of its largest natural gas fired boilers (Boiler #1) at its facility in the City of Industry, Los Angeles. Bentley Mills has been operating the facility since 1979 and employs over 300 people. The facility makes commercial modular carpet tile, broadloom and area rugs in its 280,000 square feet of manufacturing space.'
	},
	energySavingsPreviewIcon: {
		text: '8.0%',
		inputType: 'button',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
Projects[Pages.steamTrapsMaintenance] = new ProjectControl({
	pageId: Pages.steamTrapsMaintenance,
	isCapitalFundsEligible: true,
	baseCost: 15_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-1800),
	},
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-1800),
	},
	title: 'Treasure Hunt - Steam Trap Maintenance',
	shortTitle: 'Repair faulty steam traps and implement a steam trap program.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found that 35% of your steam traps were faulty.',
		'You can repair these traps and {institute a steam trap maintenance program} to reduce energy use and help operate the steam system more efficiently. ',
	],
	choiceInfoImg: 'images/steam-traps.jpg',
	choiceInfoImgAlt: 'steam trap',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'STEAM',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/steam',
		text: 'Due to the wide array of industrial uses and performance advantages of using steam, steam is an indispensable means of delivering energy in the manufacturing sector. As a result, steam accounts for a significant amount of industrial energy consumption. In 2006, U.S. manufacturers used about 4,762 trillion Btu of steam energy, representing approximately 40% of the total energy used in industrial process applications for product output.'
	},
	energySavingsPreviewIcon: {
		text: '1.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
Projects[Pages.improvePipeInsulation] = new ProjectControl({
	pageId: Pages.improvePipeInsulation,
	isCapitalFundsEligible: true,
	baseCost: 7_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		naturalGasMMBTU: absolute(-900),
	},
	statsActualAppliers: {
		naturalGasMMBTU: absolute(-900),
	},
	title: 'Treasure Hunt - Improve Pipe Insulation ',
	shortTitle: 'Insulate exterior steam pipes.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several exterior steam lines that are uninsulated.',
		'Adding {insultation} can be a cheap way to improve steam system efficiency and reliability.',
	],
	choiceInfoImg: 'images/steam-pipe-insulation.jpg',
	choiceInfoImgAlt: 'steam pipe insulation',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'STEAM',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/steam',
		text: 'Due to the wide array of industrial uses and performance advantages of using steam, steam is an indispensable means of delivering energy in the manufacturing sector. As a result, steam accounts for a significant amount of industrial energy consumption. In 2006, U.S. manufacturers used about 4,762 trillion Btu of steam energy, representing approximately 40% of the total energy used in industrial process applications for product output.'
	},
	energySavingsPreviewIcon: {
		text: '0.75%',
		inputType: 'button',
		variant: 'text',
		startIcon: <FlameIcon />,
	},
});
//Empty Projects Scope 2 yr6-yr10
Projects[Pages.compressedAirSystemImprovemnt] = new ProjectControl({
	pageId: Pages.compressedAirSystemImprovemnt,
	isCapitalFundsEligible: true,
	baseCost: 210_000,
	financedAnnualCost: 81_000,
	financedTotalCost: 324_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-2_250_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-2_250_000),
	},
	statsRecapAppliers: {
		yearRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Replace old compressors',
	shortTitle: 'Replace an old, inefficient compressor system with new compressors to increase reliability and reduce energy waste.',
	choiceInfoText: [
		'Your compressor system is three, older, inefficient compressors that operate in different combinations to achieve the required air capacity.',
		'These can collectively be replaced with two new, more efficient compressors and heat compression dryers. This new configuration will allow the plant to run on fewer compressors and provides some redundancy. The heat of compression dryers added to the drying capacity of the system and replaced refrigerated dryers, providing improved moisture control.',
	],
	choiceInfoImg: 'images/compressors.jpg',
	choiceInfoImgAlt: 'air compressors',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'SAINT-GOBAIN CORPORATION: MILFORD COMPRESSED AIR SYSTEM IMPROVEMENT',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/saint-gobain-corporation-milford-compressed-air-system-improvement',
		text: 'As part of its commitment to reducing its energy intensity, Saint-Gobain undertook a large compressed air system retrofit project at its Milford, Massachusetts glass plant. Upon completion, the compressed air system improvement is expected to deliver energy savings of 15% compared to the system it is replacing.'
	},
	energySavingsPreviewIcon: {
		text: '7.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
// Projects[Pages.compressedAirSystemOptimization] = new ProjectControl({
//  pageId: Pages.compressedAirSystemOptimization,
//  cost: 30_000,
//  statsInfoAppliers: {
//      electricityUseKWh: relative(-0.04),
//  },
//  statsActualAppliers: {
//      electricityUseKWh: relative(-0.04),
//  },
//  title: 'Compressed Air System Optimization',
//  shortTitle: 'The facility was experiencing pressure drops throughout their compressed air delivery pipe system and decided on investigating thei pipe sizing to solve the issue.',
//  choiceInfoText: [
//      'They replaced an existing 4” header pipe running from the compressors to a storage tank with a 6” header. The shorter pipe diameter hadn’t sufficiently served the system, as engineers recorded air pressure losses starting in the compressor room.',
//      'They also added a second 4” header pipe parallel to an existing 4” header leading out of the storage tank to supply separate parts of the plant and form a complete loop.',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'DARIGOLD: COMPRESSED AIR SYSTEM OPTIMIZATION',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/darigold-compressed-air-system-optimization',
//      text: 'Americas fifth-largest dairy co-op, Darigold has 11 plants in the northwestern United States that produce milk, butter, sour cream, milk powder, and other dairy products. The Sunnyside plant is the company’s largest facility and each day it produces about 530,000 pounds of cheese and 615,000 pounds of powdered dairy products. Compressed air supports production at this plant through control valves, cylinders, positioners, dampers, and pulsing for bag houses. An inefficient distribution system compelled the partner to upgrade its air piping to enable stable system pressure.'
//  },
//  energySavingsPreviewIcon: {
//      text: '4.0%',
//      variant: 'text',
//      startIcon: <BoltIcon />,
//  },
// });
Projects[Pages.chilledWaterMonitoringSystem] = new ProjectControl({
	pageId: Pages.chilledWaterMonitoringSystem,
	isCapitalFundsEligible: true,
	baseCost: 40_000,
	financedAnnualCost: 15_000,
	financedTotalCost: 60_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-900_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-900_000),
	},
	title: 'Chilled Water System Improvements after Advanced Energy Monitoring System ',
	shortTitle: 'Implement several changes to the chilled water system identified by the advanced energy monitoring system',
	choiceInfoText: [
		'Your facility identified their {chilled water system} as a Significant Energy Use (SEU) while installing the {advanced energy monitoring system}.',
		'Since then, you have identified {several} specific projects to improve the operations of the system such as modifying VFD controls, adjusting water flows to maximize temperatures based on outside weather, adjusting cooling tower fans, and more.',
	],
	choiceInfoImg: 'images/chiller-systems-in-plant.png',
	choiceInfoImgAlt: 'chiller system.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'NISSAN NORTH AMERICA: CHILLED WATER SYSTEM UPGRADES AND DASHBOARD',
		url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/nissan-north-america-chilled-water-system-upgrades-and-dashboard',
		text: 'During the process of pursuing ISO 50001 certification for Nissan’s vehicle assembly plant in Canton, Mississippi, Nissan’s Energy Team identified their chilled water system as a Significant Energy Use (SEU). Based on the facility’s 2014 energy baseline, the chilled water system accounted for 15% of the plant’s total electrical consumption.'
	},
	energySavingsPreviewIcon: {
		text: '3.0%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
// Projects[Pages.refrigerationUpgrade] = new ProjectControl({
//  pageId: Pages.refrigerationUpgrade,
//  cost: 10_000,
//  statsInfoAppliers: {
//      electricityUseKWh: relative(-0.05),
//  },
//  statsActualAppliers: {
//      electricityUseKWh: relative(-0.05),
//  },
//  title: 'Refrigeration Upgrade',
//  shortTitle: 'Increasing ammonia suction pressure reduces system lift, which is the difference between suction and discharge pressures within the system which help in reducing load on the comrpessor and increasing overall system effieicny.',
//  choiceInfoText: [
//      'The plant commissioned a study in June of 2017 to identify areas to improve energy efficiency. Previously, suction pressure was being run at 20.4 PSI to build the ice in the ice bank to optimal levels. In order to increase the efficiency of the system, it was decided to increase the ammonia suction pressure to 35.6 PSI, which is the pressure going into the compression step of the refrigeration cycle. Increasing ammonia suction pressure reduces system lift, which is the difference between suction and discharge pressures within the system. A reduction in lift accomplishes the following:',
//      'Reduces the overall work required by the compressors',
//      'Increases compressor capacity',
//      'Increases overall system efficiency',
//  ],
//  choiceInfoImg: 'images/hydrogen-powered-forklift.jpg',
//  choiceInfoImgAlt: 'Hydrogen powered forklift.',
//  choiceInfoImgObjectFit: 'contain',
//  recapDescription: 'Insert flavor text here!',
//  caseStudy: {
//      title: 'AGROPUR: REFRIGERATION UPGRADES',
//      url: 'https://betterbuildingssolutioncenter.energy.gov/showcase-projects/agropur-refrigeration-upgrades',
//      text: 'Le Sueur Cheese is one of seven Agropur cheese and whey protein drying plants in the United States. In 2010, Le Sueur Cheese joined the Better Buildings, Better Plants program and set a goal to reduce its energy intensity by 25% over a 10-year period.'
//  },
//  energySavingsPreviewIcon: {
//      text: '5.0%',
//      variant: 'text',
//      startIcon: <BoltIcon />,
//  },
// });
Projects[Pages.loweringCompressorPressure] = new ProjectControl({
	pageId: Pages.loweringCompressorPressure,
	isCapitalFundsEligible: true,
	baseCost: 3_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	title: 'Treasure Hunt - Lower compressed air system pressure',
	shortTitle: 'Gradually lower compressed air pressure to reduce compressor load.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and discovered that the supply pressure for compressed air was {10psig higher} than what is required for the equipment downstream.',
		'Over a few weeks, they can lower the pressure a few psi at a time while monitoring equipment performance and productivity.',
		'Lowering the compressor pressure can have an immediate impact on energy use with a very little associated cost. ',
	],
	choiceInfoImg: 'images/compressed-air.jpg',
	choiceInfoImgAlt: 'air compressor',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'COMPRESSED AIR - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/compressed-air',
		text: 'Compressed air provides a safe and reliable source of pneumatic pressure for a wide range of industrial processes. However, with over 80% of its input energy being lost as heat, air compressors are naturally inefficient. Energy-Efficient process design should opt for alternatives wherever possible and isolate compressed air usage to only processes that mandate it.'
	},
	energySavingsPreviewIcon: {
		text: '0.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.improveLightingSystems] = new ProjectControl({
	pageId: Pages.improveLightingSystems,
	isCapitalFundsEligible: true,
	baseCost: 50_000,
	financedAnnualCost: 19_000,
	financedTotalCost: 76_000,
	financingOptions: [
		{
			financingType: getEaaSFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsRecapAppliers: {
		yearRebates: absolute(10_000),
	},
	utilityRebateValue: 10000,
	title: 'Treasure Hunt - Lighting Upgrade',
	shortTitle: 'Install LED lighting in main production building',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found that the older lighting in the main production building could be replaced with LED lighting.',
		'While you are hoping to get a rebate for the fixture cost, it is not known if you qualify at this point. '
	],
	choiceInfoImg: 'images/lighting-upgrade.jpg',
	choiceInfoImgAlt: 'warehouse celling lights.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'LIGHTING - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/lighting',
		text: 'A good place to start investigating for energy savings is in your plant’s lighting system. In the industrial sector, lighting accounts for less than 5% of the overall energy footprint, but in some sectors, it can be higher.'
	},
	energySavingsPreviewIcon: {
		text: '1.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.startShutOff] = new ProjectControl({
	pageId: Pages.startShutOff,
	isCapitalFundsEligible: true,
	baseCost: 5_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-225_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-225_000),
	},
	title: 'Treasure Hunt - Implement Shut-off Program',
	shortTitle: 'Design and implement a program to shut off equipment when not in use',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several equipments that could be shut off during weekends or low production times.',
		'You can develop a {systematic program} to identify equipment to be turned off, create turn on and shut down procedures, and enforce shutdowns which can save electricity with very little cost.'
	],
	choiceInfoImg: 'images/vfds.jpg',
	choiceInfoImgAlt: 'Motor belt.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'ENERGY TREASURE HUNTS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/energy-treasure-hunts',
		text: 'One of the best tools at an energy manager\'s disposal is what\'s known as an Energy Treasure Hunt; an onsite three-day event that engages cross-functional teams of employees in the process of identifying operational and maintenance (O&M) energy efficiency improvements.'
	},
	energySavingsPreviewIcon: {
		text: '0.75%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.installVFDs1] = new ProjectControl({
	pageId: Pages.installVFDs1,
	isCapitalFundsEligible: true,
	baseCost: 30_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-450_000),
	},
	statsRecapAppliers: {
		yearRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs on small motors',
	shortTitle: 'Install VFDs on small motors with high use variability',
	choiceInfoText: [
		'Thanks to the {Advanced Energy Monitoring System}, your plant has identified several motors with {high use variability} that would benefit from VFDs.',
		'You can install VFDs on a few smaller motors for this project.'
	],
	choiceInfoImg: 'images/vfds.jpg',
	choiceInfoImgAlt: 'Motor belt.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	energySavingsPreviewIcon: {
		text: '1.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
Projects[Pages.installVFDs2] = new ProjectControl({
	pageId: Pages.installVFDs2,
	isCapitalFundsEligible: true,
	baseCost: 40_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-600_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-600_000),
	},
	statsRecapAppliers: {
		yearRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs on mid-sized motors',
	shortTitle: 'Install VFDs on mid-sized motors with high use variability',
	choiceInfoText: [
		'Thanks to the {Advanced Energy Monitoring System}, your plant has identified several motors with {high use variability} that would benefit from VFDs.',
		'You can install VFDs on a few moderately sized motors for this project.'
	],
	choiceInfoImg: 'images/vfds.jpg',
	choiceInfoImgAlt: 'Motor belt.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	energySavingsPreviewIcon: {
		text: '2.0%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
Projects[Pages.installVFDs3] = new ProjectControl({
	pageId: Pages.installVFDs3,
	isCapitalFundsEligible: true,
	baseCost: 100_000,
	financedAnnualCost: 38_000,
	financedTotalCost: 152_000,
	financingOptions: [
		{
			financingType: getGreenBondsFinancing(4),
		},
	],
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-1_050_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-1_050_000),
	},
	statsRecapAppliers: {
		yearRebates: absolute(5_000),
	},
	utilityRebateValue: 5000,
	title: 'Install VFDs on large motors',
	shortTitle: 'Install VFDs on large motors with high use variability',
	choiceInfoText: [
		'Thanks to the {Advanced Energy Monitoring System}, your plant has identified several motors with {high use variability} that would benefit from VFDs.',
		'You can install VFD on a large motor for this project.'
	],
	choiceInfoImg: 'images/vfds.jpg',
	choiceInfoImgAlt: 'Motor belt.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'MOTORS - Technology Focus Area',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/motors',
		text: 'Electric motors, taken together, make up the single largest end-use of electricity in the United States. In the U.S. manufacturing sector, electric motors used for machine drives such as pumps, conveyors, compressors, fans, mixers, grinders, and other materials-handling or processing equipment account for about 54% of industrial electricity consumption.'
	},
	energySavingsPreviewIcon: {
		text: '3.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: state => state.completedProjects.some(project => project.page === Pages.advancedEnergyMonitoring)
});
Projects[Pages.reduceFanSpeeds] = new ProjectControl({
	pageId: Pages.reduceFanSpeeds,
	isCapitalFundsEligible: true,
	baseCost: 1_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-75_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-75_000),
	},
	title: 'Treasure Hunt - Reduce fan speeds',
	shortTitle: 'Run interior fans at slightly lower speeds',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several fans that can be run at slightly lower speeds without substantially changing airflow.'
	],
	choiceInfoImg: 'images/fans.jpg',
	choiceInfoImgAlt: 'two big fans.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'ENERGY TREASURE HUNTS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/energy-treasure-hunts',
		text: 'One of the best tools at an energy manager\'s disposal is what\'s known as an Energy Treasure Hunt; an onsite three-day event that engages cross-functional teams of employees in the process of identifying operational and maintenance (O&M) energy efficiency improvements.'
	},
	energySavingsPreviewIcon: {
		text: '0.25%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});
Projects[Pages.lightingOccupancySensors] = new ProjectControl({
	pageId: Pages.lightingOccupancySensors,
	isCapitalFundsEligible: true,
	baseCost: 3_000,
	isEnergyEfficiency: true,
	statsInfoAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-150_000),
	},
	title: 'Treasure Hunt - Lighting Occupancy Sensors',
	shortTitle: 'Install occupancy sensors to turn off lights in unoccupied areas of the facility.',
	choiceInfoText: [
		'Your plant held an {energy treasure hunt} and found several areas where lights are not turned off when no one is in the area.',
		'Installing occupancy sensors in these areas would automatically turn off the lights when the area is unoccupied and turn them on when work has resumed.'
	],
	choiceInfoImg: 'images/lighting-upgrade.jpg',
	choiceInfoImgAlt: 'warehouse celling lights.',
	choiceInfoImgObjectFit: 'contain',
	recapDescription: 'Insert flavor text here!',
	caseStudy: {
		title: 'ENERGY TREASURE HUNTS',
		url: 'https://betterbuildingssolutioncenter.energy.gov/better-plants/energy-treasure-hunts',
		text: 'One of the best tools at an energy manager\'s disposal is what\'s known as an Energy Treasure Hunt; an onsite three-day event that engages cross-functional teams of employees in the process of identifying operational and maintenance (O&M) energy efficiency improvements.'
	},
	energySavingsPreviewIcon: {
		text: '0.50%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
});

Projects[Pages.smallVPPA] = new ProjectControl({
	pageId: Pages.smallVPPA,
	isCapitalFundsEligible: false,
	isRenewable: true,
	baseCost: 75_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-1_200_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-1_200_000)
	},
	customBudgetType: {
		name: "Power Purchase Agreement",
		description: "Pay Annually",
		id: 'budget'
	},
	title: 'Invest in wind VPPA',
	shortTitle: 'Invest in wind VPPA to offset {10%} of your electricity emissions. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: ['You decided to look into entering a virtual power purchase agreement for a wind farm a few states away. You can pay $0.05/kWh to offset your electricity emissions, this project costs offsetting {10%} of your electricity emissions.  Working with upper management, you work out a deal where {half of the project costs} come from your budget and the other half from a corporate budget. {THIS PROJECT WILL BE RENEWED ANNUALLY}.'],
	choiceInfoImg: 'images/wind-mills.jpg',
	choiceInfoImgAlt: 'wind mills in a field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '6.5%',
		inputType: 'button',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});

Projects[Pages.midVPPA] = new ProjectControl({
	pageId: Pages.midVPPA,
	isCapitalFundsEligible: false,
	isRenewable: true,
	baseCost: 150_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-2_400_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-2_400_000)
	},
	customBudgetType: {
		name: "Power Purchase Agreement",
		description: "Pay Annually",
		id: 'budget'
	},
	title: 'Invest in wind VPPA',
	shortTitle: 'Invest in wind VPPA to offset {20%} of your electricity emissions. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: ['You decided to look into entering a virtual power purchase agreement for a wind farm a few states away. You can pay $0.05/kWh to offset your electricity emissions, this project costs offsetting {20%} of your electricity emissions.  Working with upper management, you work out a deal where {half of the project costs} come from your budget and the other half from a corporate budget. {THIS PROJECT WILL BE RENEWED ANNUALLY}.'],
	choiceInfoImg: 'images/wind-mills.jpg',
	choiceInfoImgAlt: 'wind mills in a field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '13%',
		inputType: 'button',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});

Projects[Pages.largeVPPA] = new ProjectControl({
	pageId: Pages.largeVPPA,
	isCapitalFundsEligible: false,
	isRenewable: true,
	baseCost: 225_000,
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-3_600_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-3_600_000)
	},
	customBudgetType: {
		name: "Power Purchase Agreement",
		description: "Pay Annually",
		id: 'budget'
	},
	title: 'Invest in wind VPPA',
	shortTitle: 'Invest in wind VPPA to offset {30%} of your electricity emissions. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: ['You decided to look into entering a virtual power purchase agreement for a wind farm a few states away. You can pay $0.05/kWh to offset your electricity emissions, this project costs offsetting {30%} of your electricity emissions.  Working with upper management, you work out a deal where {half of the project costs} come from your budget and the other half from a corporate budget. {THIS PROJECT WILL BE RENEWED ANNUALLY}.'],
	choiceInfoImg: 'images/wind-mills.jpg',
	choiceInfoImgAlt: 'wind mills in a field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '20%',
		inputType: 'button',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
});


Projects[Pages.midSolar] = new ProjectControl({
	pageId: Pages.midSolar,
	isCapitalFundsEligible: false,
	mustAnnuallyFinance: true,
	isRenewable: true,
	baseCost: 210_000,
	financedAnnualCost: 105_000,
	financedTotalCost: 260_000,
	customBudgetType: {
		name: "Power Purchase Agreement",
		description: "Pay Annually",
		id: 'budget'
	},
	financingOptions: [
		{
			financingType: getEaaSFinancing(10),
		},
	],
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-1_717_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-1_717_000)
	},
	title: 'Mid-sized Solar PPPA',
	shortTitle: 'Enter a PPPA with your local utility to build a 2MW solar array. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: [
		`To meet aggressive decarbonization goals, you have looked into leasing some neighboring land to your utility for solar panels and receiving the electricity as a physical power purchase agreement (PPPA).
		 You will continue paying your utility provider for electricity, at a higher rate than previously, but not be responsible for the capital investment or maintenance of the system.  
		 You believe you can install a 2MW system. You have worked out a deal with your corporate management team and they will pay for half the difference in additional electricity cost from the utility budget. 
		 You will be in this contract for the next 10 years, so this cost will renew annually automatically.`],
	choiceInfoImg: 'images/solar-field.jpg',
	choiceInfoImgAlt: 'Solar panels field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '9.3%',
		inputType: 'button',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
	visible: (state) => {
		return state.gameSettings.financingOptions.eaas && getHasFinancingStarted(state.trackedStats.currentGameYear, state.gameSettings.financingStartYear, state.gameSettings.gameYearInterval);
	}
});



Projects[Pages.largeWind] = new ProjectControl({
	pageId: Pages.largeWind,
	isCapitalFundsEligible: false,
	isRenewable: true,
	baseCost: 537_000,
	financedAnnualCost: 268_000,
	financedTotalCost: 660_000,
	customBudgetType: {
		name: "Power Purchase Agreement",
		description: "Pay Annually",
		id: 'budget'
	},
	statsInfoAppliers: {
		absoluteCarbonSavings: absolute(-4_292_000)
	},
	statsActualAppliers: {
		absoluteCarbonSavings: absolute(-4_292_000)
	},
	title: 'Utility-PPPA Wind Project',
	shortTitle: 'Enter a PPPA with a local wind farm to help them expand into a neighboring field. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: [
		`To meet aggressive decarbonization goals, you have looked into selling an empty field next to your facility to a local wind farm company and receiving the electricity as 
		part of a 15-year contract to source a large portion of your electricity use. You will continue paying your utility provider for electricity, at a higher rate than previously, 
		but not be responsible for the capital investment or maintenance of the system. They are planning to install a {5MW system} on the site. 
		You have worked out a deal with your corporate management team and they will pay for half the difference in additional electricity cost from the utility budget. 
		You will be in this contract for the next 15 years, so this cost will renew annually automatically.`],
	choiceInfoImg: 'images/wind-mills.jpg',
	choiceInfoImgAlt: 'wind mills in a field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '23%',
		variant: 'text',
		startIcon: <Co2Icon />,
	},
	visible: (state) => {
		return state.gameSettings.financingOptions.eaas && getHasFinancingStarted(state.trackedStats.currentGameYear, state.gameSettings.financingStartYear, state.gameSettings.gameYearInterval);
	}
});

Projects[Pages.communityWindProject] = new ProjectControl({
	pageId: Pages.communityWindProject,
	isCapitalFundsEligible: false,
	isRenewable: true,
	mustAnnuallyFinance: true,
	baseCost: 537_000,
	financedAnnualCost: 400_000,
	financedTotalCost: 660_000,
	financingOptions: [
		{
			financingType: getGreenBondsFinancing(10),
		},
	],
	statsInfoAppliers: {
		electricityUseKWh: absolute(-8_200_000),
	},
	statsActualAppliers: {
		electricityUseKWh: absolute(-8_200_000),
	},
	title: 'Community Wind Project',
	shortTitle: 'Invest in community wind project. {THIS PROJECT WILL BE RENEWED ANNUALLY}.',
	choiceInfoText: [
		`To meet aggressive decarbonization goals, you have looked into working with a local wind farm company and investing in a portion of the generation. 
		You can use Green Bonds to pay for project and you will then own a portion of the generation. The utility is planning to install a {10MW system} on the site, and you will invest in 4MW. 
		You have worked out a deal with your corporate management team and they will pay for half of the project from capital funds. 
		You will paying the bonds back for the next 10 years, so this cost will renew annually automatically. `],
	choiceInfoImg: 'images/wind-mills.jpg',
	choiceInfoImgAlt: 'wind mills in a field',
	choiceInfoImgObjectFit: 'cover',
	recapDescription: 'Insert flavor text here!',
	caseStudy: undefined,
	energySavingsPreviewIcon: {
		text: '23%',
		inputType: 'button',
		variant: 'text',
		startIcon: <BoltIcon />,
	},
	visible: (state) => {
		return state.gameSettings.financingOptions.greenBond && getHasFinancingStarted(state.trackedStats.currentGameYear, state.gameSettings.financingStartYear, state.gameSettings.gameYearInterval);
	}
});