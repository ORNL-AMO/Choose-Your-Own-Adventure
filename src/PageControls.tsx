import React from 'react';
import type { OverridableComponent } from '@mui/material/OverridableComponent';
import type { SvgIconTypeMap} from '@mui/material';
import type { PageControl} from './components/controls';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import FactoryIcon from '@mui/icons-material/Factory';
import LocationCityIcon from '@mui/icons-material/LocationCity';
import ElectricalServicesIcon from '@mui/icons-material/ElectricalServices';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import { Grid, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { backButton, continueButton, selectButton, infoButtonWithPopup } from './components/Buttons';
import Pages from './Pages';
import { newStartPageControl } from './components/StartPage';
import { newGroupedChoicesControl } from './components/GroupedChoices';
import { newSelectGameSettingsControl } from './components/SelectGameSettings';
import { newAppPageDialogControl } from './components/Dialogs/InfoDialog';
import Projects from './Projects';
import { newYearRecapControl } from './components/YearRecap';
import { newEndGameReportPageControl } from './components/EndGameReport/EndGameReportPage';
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

PageControls[Pages.introduction] = newAppPageDialogControl({
    text: (state) => `For the past couple of decades, the automotive industry has been under pressure from regulators, public interest groups, stakeholders, customers, investors, and financial institutions to pursue a more sustainable model of growth.\nAs a sustainability manager at {${state.companyName}}, your job is to make sure your facility meets its new corporate GHG reduction goal:`,
    cardText: '{50%}  GHG reduction over the next {10 years} with \n an {annual budget of $75,000} \n {OR} a {biennial budget of $150,000} \n You have the option to play through in {1 OR 2-year intervals}',
    title: 'Introduction',
    img: 'images/manufacturing.png',
    imgAlt: 'A robotic arm working on a car.',
    buttons: [
        // todo 142 don't need a back button to go back to a splash page
        backButton(Pages.start),
        continueButton(function (state, nextState) {
            return Pages.selectGameSettings;
        }),
    ]
});

PageControls[Pages.selectGameSettings] = newSelectGameSettingsControl({});

PageControls[Pages.winScreen] = newAppPageDialogControl({
	title: 'CONGRATULATIONS!',
    text: (state) => `You succeeded at the goal! \n You managed to decarbonize {${state.companyName}} by {${(state.trackedStats.carbonSavingsPercent * 100).toFixed(1)}%} in 10 years or less! \n You reduced CO<sub>2</sub>e Emissions by a total of {${state.trackedStats.carbonSavingsPerKg.toLocaleString(undefined, { maximumFractionDigits: 0 })} kg CO<sub>2</sub>e}! \n You saved a total of {$${state.trackedStats.costPerCarbonSavings.toFixed(2)}/kg CO<sub>2</sub>e}! \n You spent a total of {$${state.trackedStats.yearEndTotalSpending.toLocaleString()}} and completed {${state.completedProjects.length}} projects!`,
	img: 'images/confetti.png',
	buttons: [
        {
			text: 'View Report',
			variant: 'text',
            size: 'large',
			onClick: function () {
                return Pages.endGameReport;
            }
		},
		{
			text: 'Play again',
			variant: 'text',
            size: 'large',
			onClick: (state) => {
				location.href = String(location.href); // Reload the page

				return state.currentPage; // The page returned doesn't really matter
			}
		}
	]
});

PageControls[Pages.loseScreen] = newAppPageDialogControl({
    title: 'Sorry...',
    text: (state) => `Sorry, looks like you didn't succeed at decarbonizing {${state.companyName}} by 50%. You got to {${(state.trackedStats.carbonSavingsPercent * 100).toFixed(1)}%} in 10 years. Try again?`,
    buttons: [
        {
			text: 'View Report',
			variant: 'text',
            size: 'large',
			onClick: function () {
                return Pages.endGameReport;
            }
		},
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


PageControls[Pages.selectScope] = newGroupedChoicesControl({
    title: function (state, nextState) {
        // Year 1
        if (state.trackedStats.currentGameYear === 1) {
            return 'To begin, you will need to decide which types of projects to pursue. {Would you like to...}';
        }
        // Subsequent years
        else {
            return `Welcome back. Choose the projects you wish to pursue for Year ${state.trackedStats.currentGameYear}.`;
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
                    text: 'Tackle Scope 2 emissions – purchased electricity',
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
    title: (state) => `These are the possible {Scope 1} projects {${state.companyName}} can do this budget period.`,
    isProjectGroupChoice: true,
    groups: [
        {
            title: 'Energy Efficiency',
            choices: [
                Projects[Pages.advancedEnergyMonitoring].getProjectChoiceControl(),
                Projects[Pages.steamTrapsMaintenance].getProjectChoiceControl(),
                Projects[Pages.improvePipeInsulation].getProjectChoiceControl(),    
                Projects[Pages.boilerControl].getProjectChoiceControl(),            
                Projects[Pages.airHandingUnitUpgrades].getProjectChoiceControl(),                               
                Projects[Pages.processHeatingUpgrades].getProjectChoiceControl(),
                Projects[Pages.wasteHeatRecovery].getProjectChoiceControl(),
                // Projects[Pages.digitalTwinAnalysis].getProjectChoiceControl(),
                // Projects[Pages.condensingEconomizerInstallation].getProjectChoiceControl(),      
            ]
        }, 
        {
            title: 'Electrification & Fuel Switching',
            choices: [
                Projects[Pages.electricBoiler].getProjectChoiceControl(),  
                Projects[Pages.blendedFuel].getProjectChoiceControl(),                
                Projects[Pages.landfillGasForOven].getProjectChoiceControl(),
                Projects[Pages.heatPumpForOffice].getProjectChoiceControl(),
                Projects[Pages.solarThermalHotWater].getProjectChoiceControl()
            ]
        }
    ],
    hideDashboard: false,
}, Pages.selectScope);
PageControls[Pages.scope2Projects] = newGroupedChoicesControl({
    title: (state) => `These are the possible {Scope 2} projects {${state.companyName}} can do this budget period.`,
    isProjectGroupChoice: true,
    groups: [
        {
            title: 'Energy Efficiency',
            choices: [
                Projects[Pages.advancedEnergyMonitoring].getProjectChoiceControl(),     
                Projects[Pages.reduceFanSpeeds].getProjectChoiceControl(),          
                Projects[Pages.lightingOccupancySensors].getProjectChoiceControl(),
                Projects[Pages.improveLightingSystems].getProjectChoiceControl(),                               
                Projects[Pages.startShutOff].getProjectChoiceControl(),     
                Projects[Pages.airHandingUnitUpgrades].getProjectChoiceControl(),                               
                Projects[Pages.compressedAirSystemImprovemnt].getProjectChoiceControl(),            
                Projects[Pages.loweringCompressorPressure].getProjectChoiceControl(),               
                Projects[Pages.chilledWaterMonitoringSystem].getProjectChoiceControl(),         
                Projects[Pages.installVFDs1].getProjectChoiceControl(),         
                Projects[Pages.installVFDs2].getProjectChoiceControl(),         
                Projects[Pages.installVFDs3].getProjectChoiceControl(),
                Projects[Pages.hydrogenPoweredForklifts].getProjectChoiceControl(),      
                // Projects[Pages.lightingUpgrades].getProjectChoiceControl(),  
                // Projects[Pages.compressedAirSystemOptimization].getProjectChoiceControl(),           
                // Projects[Pages.refrigerationUpgrade].getProjectChoiceControl(),          
            ]
        },
         {
            title: 'Bundled RECs (Renewable Energy Credits)',
            choices: [
                Projects[Pages.solarPanelsCarPort].getProjectChoiceControl(),
                Projects[Pages.midSolar].getProjectChoiceControl(),
                Projects[Pages.solarRooftop].getProjectChoiceControl(),
                Projects[Pages.largeWind].getProjectChoiceControl(),
                Projects[Pages.communityWindProject].getProjectChoiceControl(),
                // Projects[Pages.solarFieldOnSite].getProjectChoiceControl(),
            ]
        }, 
        {
            title: 'Un-bundled RECs',
            choices: [
                Projects[Pages.smallVPPA].getProjectChoiceControl(),
                Projects[Pages.midVPPA].getProjectChoiceControl(),
                Projects[Pages.largeVPPA].getProjectChoiceControl(),
            ]
        }
    ],
    hideDashboard: false,
}, Pages.selectScope);

PageControls[Pages.yearRecap] = newYearRecapControl(Pages.selectScope);
PageControls[Pages.endGameReport] = newEndGameReportPageControl();


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
