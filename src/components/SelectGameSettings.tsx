import React from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, InputLabel, MenuItem, Paper, Select, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import Image from 'mui-image';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import type { ControlCallbacks, PageControl } from './controls';
import { parseSpecialText } from '../functions-and-types';
import type { GameSettings } from '../Projects';
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
    const [totalYearIterations, setTotalIterations] = React.useState(props.totalIterations);
    const [allowCarryover, setCarryoverOption ] = React.useState('yes');    
    const [allowEnergyCarryover, setEnergyCarryoverOption ] = React.useState('One Year');

    const handleIntervalChange = (event: SelectChangeEvent<number>) => {
        setTotalIterations(event.target.value as number);
    };

    const handleCarryoverChange = (event: SelectChangeEvent<string>) => {
        setCarryoverOption(event.target.value as string);
    };

    const handleEnergyCarryoverChange = (event: SelectChangeEvent<string>) => {
        setEnergyCarryoverOption(event.target.value as string);
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
                        <InputLabel id='selectYearInterval'>Please Select the interval size you would like to play through:</InputLabel>
                        <Select
                            labelId='selectYearInterval'
                            id='selectYearInterval'
                            value={totalYearIterations}
                            label='totalIterations'
                            onChange={handleIntervalChange}
                        >
                            <MenuItem value={10}> 1-year intervals </MenuItem>
                            <MenuItem value={5}> 2-year intervals</MenuItem>

                        </Select>                        
                    </Box>
                    <Divider variant='middle'/>
                    <Box m={2}>
                        <InputLabel id='allowCarryover'>Would you like to allow the carryover of the remaining end-of-year <br></br> budget to next year&apos;s budget?</InputLabel>
                        <Select
                            labelId='allowCarryover'
                            id='allowCarryover'
                            value={allowCarryover}
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
                        <InputLabel id='allowEnergyCarryover'>Would you like to add energy cost savings to next year&apos;s budget?</InputLabel>
                        <Select
                            labelId='allowEnergyCarryover'
                            id='allowEnergyCarryover'
                            value={allowEnergyCarryover}
                            label='energyCarryoverOption'
                            onChange={handleEnergyCarryoverChange}
                            disabled
                        >
                            <MenuItem value={'One Year'}> One Year </MenuItem>
                            <MenuItem value={'Two Year'}> Two Year </MenuItem>
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
                        onClick={() => props.onProceed(totalYearIterations)} >
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

/**
 * Control properties specified by the scripter (in pages.tsx).
 */
export declare interface SelectGameSettingsControlProps {
    buttons?: ButtonGroupButton[];
}

export interface SelectGameSettingsProps extends SelectGameSettingsControlProps, ControlCallbacks, GameSettings {
    onProceed: (totalYearIterations: number) => void;
    doPageCallback: (callback?: PageCallback) => void;
}