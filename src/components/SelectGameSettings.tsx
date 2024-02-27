import React from 'react';
import { Box, Button, Checkbox, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, Divider, FormControl, FormControlLabel, FormGroup, FormHelperText, FormLabel, InputLabel, List, ListItem, ListItemText, MenuItem, Paper, Select, styled, Typography, useMediaQuery, useTheme } from '@mui/material';
import type { SelectChangeEvent } from '@mui/material/Select';
import type { ButtonGroupButton } from './Buttons';
import type { ControlCallbacks, PageControl } from './controls';
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
    const [allowBudgetCarryover, setBudgetCarryoverOption ] = React.useState('no');    
    const [costSavingsCarryoverYears, setCostSavingsCarryoverOption ] = React.useState(props.costSavingsCarryoverYears);
    const [financingOptions, setFinancingOptions] = React.useState({
        xaas: true,
        loan: true,
        greenBond: false,
      });
    const [useGodMode, setUseGodMode] = React.useState(false);


    const handleIntervalChange = (event: SelectChangeEvent<number>) => {
        setGameYearInterval(event.target.value as number);
    };

    const handleFinancingStartYear = (event: SelectChangeEvent<number>) => {
        setFinancingStartYear(event.target.value as number);
    };

    const handleCarryoverChange = (event: SelectChangeEvent<string>) => {
        setBudgetCarryoverOption(event.target.value as string);
    };

    const handleCostSavingsCarryoverChange = (event: SelectChangeEvent<CostSavingsCarryoverId>) => {
        setCostSavingsCarryoverOption(event.target.value as CostSavingsCarryoverId);
    };
    
    const handleFinancingOptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setFinancingOptions({
            ...financingOptions,
            [event.target.name]: event.target.checked
        });
    };
    const { xaas, loan, greenBond } = financingOptions;
    const invalidFinancingOptionsError = [xaas, loan, greenBond].filter((v) => v).length !== 2;


    const handleGodMode = (event: React.ChangeEvent<HTMLInputElement>) => {
        setUseGodMode(event.target.checked);
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
                    {process.env.NODE_ENV == 'development' && 
                        <Box m={2} p='16px' sx={{background: '#ff000052'}}>
                            <InputLabel
                            sx={{fontWeight: '800'} }
                            id='useGodMode'>DEVELOPMENT ONLY: Activate law-less mode</InputLabel>
                            <Checkbox
                                checked={useGodMode}
                                onChange={handleGodMode}
                                inputProps={{ 'aria-label': 'controlled' }}
                                />
                             <List dense={true}>
                                <ListItem>
                                    <ListItemText
                                        primary="Inflated budget"
                                        secondary={'$5,000,000'}
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="No limit on project count"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="No warnings for Scopes or Capital funding use in same year"
                                    />
                                </ListItem>
                            </List>              
                        </Box>
                    }
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
      

                    <FormControl sx={{ m: 2 }} component='fieldset' error={invalidFinancingOptionsError} variant='standard'>
                        <FormLabel component='legend'>Pick <b>two</b> financing options to be made available for project implementation.</FormLabel>
                        <FormGroup>
                            <FormControlLabel
                                control={
                                    <Checkbox checked={xaas} onChange={handleFinancingOptionChange} name='xaas' />
                                }
                                label='Xaas'
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox checked={loan} onChange={handleFinancingOptionChange} name='loan' />
                                }
                                label='Loan'
                            />
                            <FormControlLabel
                                control={
                                    <Checkbox checked={greenBond} onChange={handleFinancingOptionChange} name='greenBond' />
                                }
                                label='Green Bond'
                            />
                        </FormGroup>
                        <FormHelperText>Select 2 options</FormHelperText>
                    </FormControl>
                    <Divider variant='middle' />

                    <Box m={2}>
                        <InputLabel id='selectAllowBudgetCarryover'>Would you like to allow the carryover of the remaining end-of-year <br></br> budget to next year&apos;s budget?</InputLabel>
                        <Select
                            labelId='selectAllowBudgetCarryover'
                            id='selectAllowBudgetCarryover'
                            value={allowBudgetCarryover}
                            label='carryoverOption'
                            onChange={handleCarryoverChange}
                        >
                            <MenuItem value={'yes'}> Yes </MenuItem>
                            <MenuItem value={'no'}> No </MenuItem>
                        </Select>
                    </Box>
                    <Divider variant='middle'/>
                    <Box m={2}>
                        <InputLabel id='selectCostSavingsCarryoverYears'>Would you like to add energy cost savings to next year&apos;s budget?</InputLabel>
                        <Select
                            labelId='selectCostSavingsCarryoverYears'
                            id='selectCostSavingsCarryoverYears'
                            value={costSavingsCarryoverYears}
                            label='costSavingsCarryoverYearsOption'
                            onChange={handleCostSavingsCarryoverChange}
                        >
                            <MenuItem value={'never'}> Never </MenuItem>
                            <MenuItem value={'oneYear'}> One Year </MenuItem>
                            <MenuItem value={'always'} disabled> Always </MenuItem>
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
                        disabled={invalidFinancingOptionsError}
                        onClick={() => {
                            if (!invalidFinancingOptionsError) {
                                return  props.onProceed(
                                    {
                                        gameYearInterval,
                                        financingStartYear,
                                        costSavingsCarryoverYears,
                                        allowBudgetCarryover,
                                        financingOptions,
                                        useGodMode
                                    })
                            }
                        }} >
                        Start Playing
                    </Button>
                </DialogActions>

            </Dialog>
        </>
    );

}

export function newSelectGameSettingsControl(props: SelectGameSettingsControlProps): PageControl {
    return {
        componentClass: SelectGameSettings,
        controlProps: props,
        hideDashboard: true,
    };
}

export function getFinancingStartYear() {
    // return process.env.NODE_ENV == 'development' ? 1 : 3;
    return 3;
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

/**
 * Used for tracking Game Settings  
 */
export interface GameSettings extends UserSettings {
	totalGameYears: number,
	budget: number,
	naturalGasUse: number,
	electricityUse: number,
	hydrogenUse: number,
}

export interface UserSettings {
	gameYearInterval: number,
	financingStartYear: number,
	costSavingsCarryoverYears: CostSavingsCarryoverId,
	allowBudgetCarryover: string,
    useGodMode: boolean,
	financingOptions: GameFinancingOptions
}

export type CostSavingsCarryoverId = 'never' | 'oneYear' | 'always';

/**
 * Financing options enabled by user - pick two of three 
 */
export interface GameFinancingOptions {
    // always true
    budget?: boolean,
	xaas: boolean,
	loan: boolean,
	greenBond: boolean
}
