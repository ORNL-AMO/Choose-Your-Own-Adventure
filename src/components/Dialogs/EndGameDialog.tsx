import React from 'react';
import { Dialog, DialogActions, Typography } from '@mui/material';
import { ControlCallbacks, PageControl } from '../controls';
import { EndGameResults, TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import WinGame from '../WinGame';
import Pages from '../../Pages';
import { ButtonGroup, ButtonGroupButton } from '../Buttons';
import LoseGame from '../LoseGame';


export default function EndGameDialog(props: EndGameDialogProps) {
	const buttons: ButtonGroupButton[] = [{
		text: 'View Report',
		variant: 'text',
		size: 'large',
		onClick: function () {
			return Pages.endGameReport;
		}
	},
	{
		text: 'New Game',
		variant: 'text',
		size: 'large',
		onClick: (state) => {
			location.href = String(location.href);
			return state.currentPage; 
		}
	},
	{
		text: 'Submit Score',
		variant: 'text',
		size: 'large',		
		onClick: function () {
			return Pages.submitScoreForm;
		}
	}];

	return (
		<Dialog
			fullScreen={true}
			open={true}
			keepMounted
			aria-describedby='alert-dialog-slide-description'
			sx={{
				backdropFilter: 'blur(10px)'
			}}
		>	
			{props.endGameResults.isWinningGame && <WinGame {...props}></WinGame>}
			{!props.endGameResults.isWinningGame && <LoseGame {...props}></LoseGame>}

			<DialogActions sx={{justifyContent: 'space-between'}}>
				<Typography variant='h4' fontWeight='800'
					textAlign='left' pl={2} component='div'
					className='bp-font-color'>
					Choose Your Own Solution
				</Typography>
				<div>
				<ButtonGroup
					buttons={buttons}
					doPageCallback={props.doPageCallback}
					doAppStateCallback={props.doAppStateCallback}
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
					/>
				</div>
			</DialogActions>
		</Dialog>
	);
}

export interface EndGameDialogProps extends
	ControlCallbacks,
	GameSettings {
	yearRangeInitialStats: TrackedStats[];
	endGameResults: EndGameResults;
}

export function newEndGameDialogControl(): PageControl {
	return {
		componentClass: EndGameDialog,
		controlProps: {},
		hideDashboard: true,
	};
}