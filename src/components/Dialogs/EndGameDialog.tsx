import React from 'react';
import { Dialog, DialogActions } from '@mui/material';
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

			<DialogActions>
				<ButtonGroup
					buttons={buttons}
					doPageCallback={props.doPageCallback}
					doAppStateCallback={props.doAppStateCallback}
					resolveToValue={props.resolveToValue}
					useMUIStack={false}
				/>
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