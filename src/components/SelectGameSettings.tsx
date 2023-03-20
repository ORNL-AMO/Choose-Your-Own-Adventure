import React from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, MenuItem, Paper, Select, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
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

    const handleChange = (event: SelectChangeEvent<number>) => {
        setTotalIterations(event.target.value as number);
    }

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
                    <DialogContentText id='alert-dialog-slide-description' gutterBottom>
                        You have the option to play through in 1 OR 2 year intervals.
                    </DialogContentText>
                    <InputLabel id='selectYearInterval'>Please Select the interval size you would like to play through:</InputLabel>
                    <Select
                        labelId='selectYearInterval'
                        id='selectedInterval'
                        value={totalYearIterations}
                        label='totalIterations'
                        onChange={handleChange}
                    >
                        <MenuItem value={10}> 1 year intervals </MenuItem>
                        <MenuItem value={5}> 2 year intervals</MenuItem>

                    </Select>
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