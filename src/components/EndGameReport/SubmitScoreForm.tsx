import React, { Fragment, useState } from 'react';
import { EndGameResults, TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import { FinancingOption, isProjectFullyFunded } from '../../Financing';
import { ControlCallbacks, Emphasis, PageControl } from '../controls';
import { Box, Button, Card, CardContent, CardHeader, Grid, Link, List, ListItem, ListItemIcon, ListItemText, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { ProjectControl } from '../../ProjectControl';
import { ImplementedFinancingData } from '../YearRecap';
import Projects from '../../Projects';
import { DialogFinancingOptionCard } from '../Dialogs/ProjectDialog';
import { parseSpecialText } from '../../functions-and-types';
import EnergyUseLineChart from '../EnergyUseLineChart';
import DownloadPDF from './DownloadPDF';
import InfoIcon from '@mui/icons-material/Info';
import { ButtonGroup, ButtonGroupButton } from '../Buttons';
import Pages from '../../Pages';
import axios from 'axios';

export default function SubmitScoreForm(props: SubmitScoreFormPageProps) {

    const formFormatting = {
        fontSize: '24px',
        margin: '10px'
    }

    const [name, setName] = useState('');
    const [scoreData, setData] = useState(props.endGameResults);

    const data = { name: name, scoreData: scoreData };

    const handleSubmit = (event) => {
        sendData(data);
        event.preventDefault();
        alert(`The name that you entered was: ${name} \n
             ${scoreData.carbonSavingsPercent}, ${scoreData.gameTotalSpending}, ${scoreData.costPerCarbonSavings}, ${scoreData.projectedFinancedSpending}`);
    }

    const buttons: ButtonGroupButton[] = [
	{
		text: 'View Scoreboard',
		variant: 'text',
		size: 'large',		
		onClick: function () {
			return Pages.scoreBoard;
		}
	}];

    const sendData = async (data) => {
        try {
            const response = await fetch('http://localhost:3001/saveData',{
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }, 
                body: JSON.stringify(data),
            });
            const result = await response.text();
            console.log(result);
        } catch (error) {
            console.log('error: ', error);
        }
    };

    return (
        <>
            <Box m={2}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <List dense={true}>
                        <ListItem>
                            <ListItemText
                                primary={<Typography variant='h5'>
                                    Your Final Results:
                                </Typography>} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <InfoIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography variant='h5'>
                                    Your company has reduced CO<sub>2</sub>e Emissions by{' '}
                                    <Emphasis>{props.endGameResults.carbonSavingsPercent}%</Emphasis>{' '}
                                </Typography>} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <InfoIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography variant={'h5'}>
                                    You have spent{' '}<Emphasis>${props.endGameResults.gameTotalSpending}</Emphasis>{' '} throughout the game
                                </Typography>} />
                        </ListItem>
                        <ListItem>
                            <ListItemIcon>
                                <InfoIcon />
                            </ListItemIcon>
                            <ListItemText
                                primary={<Typography variant={'h5'}>
                                    Your cost per kg reduced was{' '}<Emphasis>${props.endGameResults.costPerCarbonSavings}/kg CO<sub>2</sub>e</Emphasis>{' '}
                                </Typography>} />
                        </ListItem>
                        {props.endGameResults.projectedFinancedSpending &&
                            <ListItem>
                                <ListItemIcon>
                                    <InfoIcon />
                                </ListItemIcon>
                                <ListItemText
                                    primary={<Typography variant={'h5'}>
                                        You are projected to spend {' '}<Emphasis>${props.endGameResults.projectedFinancedSpending}</Emphasis>{' '} on financed and renewed projects in future years
                                    </Typography>} />
                            </ListItem>}
                    </List>
                </Box>
            </Box>
            <form onSubmit={handleSubmit}>
                <label style={formFormatting}>
                    Enter your name or team name:
                    <br></br>
                    <input style={formFormatting} type='text' value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <br></br>
                <input style={{ fontSize: '14px' }} type='submit' />
            </form>
            <div>
                <ButtonGroup
                    buttons={buttons}
                    doPageCallback={props.doPageCallback}
                    doAppStateCallback={props.doAppStateCallback}
                    resolveToValue={props.resolveToValue}
                    useMUIStack={false}
                />
            </div>
            {/* <Button
                size='small'
                variant='contained'
                onClick={function () {
                    return Pages.scoreBoard;
                }}
                style={{ margin: '10px', marginLeft: '2rem' }}>
                    View Scoreboard
            </Button> */}
        </>
    );

}

interface FormProps {
    endGameResults: EndGameResults,
    yearRangeInitialStats: TrackedStats[];
}
export function newSubmitScoreFormPageControl(): PageControl {
    return {
        componentClass: SubmitScoreForm,
        controlProps: {},
        hideDashboard: true,
    };
}

export interface SubmitScoreFormPageProps extends
    ControlCallbacks,
    GameSettings {
    endGameResults: EndGameResults;
    yearRangeInitialStats: TrackedStats[];
}
