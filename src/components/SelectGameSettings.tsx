import React from 'react';
import { Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, InputLabel, MenuItem, Paper, Select, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import Image from 'mui-image';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ButtonGroupButton } from './Buttons';
import { ButtonGroup } from './Buttons';
import type { ControlCallbacks, PageControl } from './controls';
import { parseSpecialText } from '../functions-and-types';
import type { GameSettings } from '../Projects';

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
    const [totalIterations, setTotalIterations] = React.useState('5');

    const handleChange = (event: SelectChangeEvent) => {
        setTotalIterations(event.target.value);
    }

    return (
        <React.Fragment>
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
                        You have the option to play through in 1 OR 2 year intervals,
                        <InputLabel id='selectYearInterval'>Please Select the interval size you would like to play through:</InputLabel>
                        <Select
                            labelId='selectYearInterval'
                            id='selectedInterval'
                            value={totalIterations}
                            label='totalIterations'
                            onChange={handleChange}
                        >
                            <MenuItem value={10}> 1 year intervals </MenuItem>
                            <MenuItem value={5}> 2 year intervals</MenuItem>

                        </Select>
                    
                    
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <ButtonGroup
                        buttons={props.buttons}
                        doPageCallback={props.doPageCallback}
                        summonInfoDialog={props.summonInfoDialog}
                        resolveToValue={props.resolveToValue}
                        useMUIStack={false}
                    />
                </DialogActions>

            </Dialog>
        </React.Fragment>
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
    totalIterations?: Resolvable<number>; 
    buttons?: ButtonGroupButton[];
}

export declare interface SelectGameSettingsProps extends SelectGameSettingsControlProps, ControlCallbacks { }