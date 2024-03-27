import React from 'react';
import { Dialog, DialogActions } from '@mui/material';
import { PureComponentIgnoreFuncs } from '../../functions-and-types';
import { ControlCallbacks, PageControl } from '../controls';
import { CapitalFundingState } from '../../Financing';
import { CompletedProject, RenewableProject, ImplementedProject } from '../../ProjectControl';
import { TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import WinGame from '../WinGame';
import Pages from '../../Pages';
import { ButtonGroup, ButtonGroupButton } from '../Buttons';
import LoseGame from '../LoseGame';


export default function EndGameDialog(props: EndGameProps) {
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
			location.href = String(location.href); // Reload the page
			return state.currentPage; // The page returned doesn't really matter
		}
	}];

	debugger;
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

			{/* <WinGame {...props}></WinGame> */}
			{/* <LoseGame {...props}></LoseGame> */}
			
			{props.endGamePage === WinGame && <WinGame {...props}></WinGame>}
			{props.endGamePage === LoseGame && <LoseGame {...props}></LoseGame>}

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

export interface EndGameProps extends
	ControlCallbacks,
	GameSettings {
	capitalFundingState: CapitalFundingState,
	trackedStats: TrackedStats,
	defaultTrackedStats: TrackedStats,
	completedProjects: CompletedProject[];
	implementedRenewableProjects: RenewableProject[];
	implementedFinancedProjects: ImplementedProject[];
	yearRangeInitialStats: TrackedStats[];
	endGamePage: Component;
}

export function newEndGameDialogControl(): PageControl {
	return {
		componentClass: EndGameDialog,
		controlProps: {},
		hideDashboard: true,
	};
}