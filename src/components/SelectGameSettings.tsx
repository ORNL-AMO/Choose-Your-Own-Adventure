import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputLabel, MenuItem, Paper, Select, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ButtonGroupButton } from './Buttons';
import type { ControlCallbacks, PageControl } from './controls';
import type { GameSettings, UserSettings } from '../Projects';
import Pages from '../Pages';

export const SettingsCard = styled(Paper)(({ theme }) => ({
    ...theme.typography.body2,
    textAlign: 'center',
    color: theme.palette.text.secondary,
    borderColor: theme.palette.primary.light,
    lineHeight: 2,
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2),
    paddingBottom: theme.spacing(2),
    paddingLeft: theme.spacing(0.5),
    paddingRight: theme.spacing(0.5),
}));

/**
 * Start page
 */
export function SelectGameSettings(props: SelectGameSettingsProps) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('sm'));
    const [gameYearInterval, setGameYearInterval] = React.useState(props.gameYearInterval);
    const [financingStartYear, setFinancingStartYear] = React.useState(getFinancingStartYear());
    const [allowBudgetCarryover, setBudgetCarryoverOption ] = React.useState('yes');    
    const [energyCarryoverYears, setEnergyCarryoverOption ] = React.useState(1);

    const handleIntervalChange = (event: SelectChangeEvent<number>) => {
        setGameYearInterval(event.target.value as number);
    };

    const handleFinancingStartYear = (event: SelectChangeEvent<number>) => {
        setFinancingStartYear(event.target.value as number);
    };

    const handleCarryoverChange = (event: SelectChangeEvent<string>) => {
        setBudgetCarryoverOption(event.target.value as string);
    };

    const handleEnergyCarryoverChange = (event: SelectChangeEvent<number>) => {
        setEnergyCarryoverOption(event.target.value as number);
    };

    return (
        <>
            <Dialog
                fullScreen={fullScreen}
                open={true}
                aria-describedby='alert-dialog-slide-description'
            >
                <DialogTitle className='semi-emphasis'>
                    Game Settings
                </DialogTitle>

                <DialogContent>
                    <Box m={2}>
                        <DialogContentText id='alert-dialog-slide-description' gutterBottom>
                            You have the option to play through in 1 OR 2-year intervals.
                        </DialogContentText>
                        <InputLabel id='selectGameYearInterval'>Please Select the interval size you would like to play through:</InputLabel>
                        <Select
                            labelId='selectGameYearInterval'
                            id='selectGameYearInterval'
                            value={gameYearInterval}
                            label='gameYearInterval'
                            onChange={handleIntervalChange}
                        >
                            <MenuItem value={1}> 1-year intervals </MenuItem>
                            <MenuItem value={2}> 2-year intervals</MenuItem>

                        </Select>                        
                    </Box>
                    <Divider variant='middle'/>
                    <Box m={2}>
                        <InputLabel id='selectFinancingStartYear' sx={{overflow: 'visible'}}>
                            Choose the year in which project financing options should be introduced:</InputLabel>
                        <Select
                            labelId='selectFinancingStartYear'
                            id='selectFinancingStartYear'
                            value={financingStartYear}
                            label='financingStartYear'
                            onChange={handleFinancingStartYear}
                        >
                            <MenuItem value={1}> First Year </MenuItem>
                            <MenuItem value={2}> Second Year</MenuItem>
                            <MenuItem value={3}> Third Year</MenuItem>
                            <MenuItem value={4}> Fourth Year</MenuItem>
                            <MenuItem value={5}> Fifth Year</MenuItem>
                            {/* // TODO 150 check game interval for more options */}
                        </Select>                        
                    </Box>
                    <Divider variant='middle'/>
                    <Box m={2}>
                        <InputLabel id='selectAllowBudgetCarryover'>Would you like to allow the carryover of the remaining end-of-year <br></br> budget to next year&apos;s budget?</InputLabel>
                        <Select
                            labelId='selectAllowBudgetCarryover'
                            id='selectAllowBudgetCarryover'
                            value={allowBudgetCarryover}
                            label='carryoverOption'
                            onChange={handleCarryoverChange}
                            disabled
                        >
                            <MenuItem value={'yes'}> Yes </MenuItem>
                            <MenuItem value={'no'}> No </MenuItem>
                        </Select>
                    </Box>
                    <Divider variant='middle'/>
                    <Box m={2}>
                        <InputLabel id='selectEnergyCarryoverYears'>Would you like to add energy cost savings to next year&apos;s budget?</InputLabel>
                        <Select
                            labelId='selectEnergyCarryoverYears'
                            id='selectEnergyCarryoverYears'
                            value={energyCarryoverYears}
                            label='energyCarryoverOption'
                            onChange={handleEnergyCarryoverChange}
                            disabled
                        >
                            <MenuItem value={1}> One Year </MenuItem>
                            <MenuItem value={2}> Two Year </MenuItem>
                        </Select>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button
                        size='small'
                        onClick={() => props.doPageCallback(Pages.introduction)} >
                        Back
                    </Button>
                    <Button
                        size='small'
                        onClick={() => props.onProceed(
                            {
                                gameYearInterval,
                                financingStartYear,
                                energyCarryoverYears,
                                allowBudgetCarryover
                            }
                        )} >
                        Start Playing
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    );

}

/**
 * TS wrapper for a StartPage component control. 
 * Use this when definining a PageControl for code autocompletion and props checking.
 */
export function newSelectGameSettingsControl(props: SelectGameSettingsControlProps): PageControl {
    return {
        componentClass: SelectGameSettings,
        controlProps: props,
        hideDashboard: true,
    };
}

export function getFinancingStartYear() {
    return process.env.NODE_ENV == 'development' ? 1 : 3;
}

/**
 * Control properties specified by the scripter (in pages.tsx).
 */
export declare interface SelectGameSettingsControlProps {
    buttons?: ButtonGroupButton[];
}

export interface SelectGameSettingsProps extends SelectGameSettingsControlProps, ControlCallbacks, GameSettings {
    onProceed: (userSettings: UserSettings) => void;
    doPageCallback: (callback?: PageCallback) => void;
}