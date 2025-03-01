import React, { Fragment } from 'react';
import type { ImplementedProject, RenewableProject} from '../ProjectControl';
import type { CompletedProject, SelectedProject} from '../ProjectControl';
import { PureComponentIgnoreFuncs } from '../functions-and-types';
import type { EndGameResults, TrackedStats } from '../trackedStats';
import { GroupedChoices } from './GroupedChoices';
import type { GroupedChoicesProps } from './GroupedChoices';
import { GameSettings, SelectGameSettings, UserSettings } from './SelectGameSettings';
import { StartPage } from './StartPage';
import type { StartPageProps } from './StartPage';
import { YearRecap } from './YearRecap';
import type { PageControlProps, ControlCallbacks } from './controls';
import { CapitalFundingState } from '../Financing';
import EndGameReportPage from './EndGameReport/EndGameReportPage';
import EndGameDialog from './Dialogs/EndGameDialog';
import EndGameReport from './EndGameReport/EndGameReportPage';
import SubmitScoreForm from './EndGameReport/SubmitScoreForm';
import ScoreBoard from './EndGameReport/ScoreBoard';


interface CurrentPageProps extends ControlCallbacks, PageControlProps {
	implementedProjectsIds: symbol[];
	implementedRenewableProjects: RenewableProject[];
	implementedFinancedProjects: ImplementedProject[];
	availableProjectIds: symbol[];
	selectedProjectsForComparison: SelectedProject[];
	completedProjects: CompletedProject[];
	trackedStats: TrackedStats;
	capitalFundingState: CapitalFundingState;
	handleCompareProjectsClick: () => void;
	handleClearProjectsClick: () => void;
	yearRangeInitialStats: TrackedStats[];
	gameSettings: GameSettings;	
	defaultTrackedStats :TrackedStats;
	endGameResults: EndGameResults;
	handleGameSettingsOnProceed: (userSettings: UserSettings) => void;
	handleNewYearSetupOnProceed: (yearFinalStats: TrackedStats, capitalFundingState: CapitalFundingState) => void;
}

export class CurrentPage extends PureComponentIgnoreFuncs<CurrentPageProps> {
	render() {
		const controlCallbacks: ControlCallbacks = {
			doPageCallback: this.props.doPageCallback,
			doAppStateCallback: this.props.doAppStateCallback,
			displayProjectDialog: this.props.displayProjectDialog,
			resolveToValue: this.props.resolveToValue,
		};

		switch (this.props.componentClass) {
			case StartPage: {
				const startPageProps = {
					...this.props.controlProps,
					...controlCallbacks
				} as StartPageProps;

				return <StartPage
					{...startPageProps}
				/>;
			}
			case SelectGameSettings:
				return <SelectGameSettings
					{...this.props.gameSettings}
					{...controlCallbacks}
					onProceed={this.props.handleGameSettingsOnProceed}
                />;
			case GroupedChoices: {
				const groupedChoicesControlProps = {
					...this.props.controlProps,
					...controlCallbacks,
				} as GroupedChoicesProps;
				
				return <GroupedChoices
				{...groupedChoicesControlProps}
				handleCompareProjectsClick={this.props.handleCompareProjectsClick}
				handleClearProjectsClick={this.props.handleClearProjectsClick}
				selectedProjectsForComparison={this.props.selectedProjectsForComparison}
				/>;
			}
			case YearRecap:
				return <YearRecap
					{...this.props.trackedStats}
					{...controlCallbacks}
					{...this.props.gameSettings}
					capitalFundingState={this.props.capitalFundingState}					
					defaultTrackedStats={this.props.defaultTrackedStats }
					implementedProjectsIds={this.props.implementedProjectsIds}
					implementedRenewableProjects={this.props.implementedRenewableProjects}
					implementedFinancedProjects={this.props.implementedFinancedProjects}
					completedProjects={this.props.completedProjects}
					yearRangeInitialStats={this.props.yearRangeInitialStats}
					handleNewYearSetup={this.props.handleNewYearSetupOnProceed}
				/>;
			case EndGameDialog:
				return (
					<EndGameDialog
						{...controlCallbacks}
						{...this.props.gameSettings}
						yearRangeInitialStats={this.props.yearRangeInitialStats}
						endGameResults={this.props.endGameResults}
					/>
				);
			case EndGameReport:
				return (
					<EndGameReport
						{...controlCallbacks}
						{...this.props.gameSettings}
						endGameResults={this.props.endGameResults}
						yearRangeInitialStats={this.props.yearRangeInitialStats}
					/>
				);
			case SubmitScoreForm:
			return (
				<SubmitScoreForm
					{...controlCallbacks}
					{...this.props.gameSettings}
					endGameResults={this.props.endGameResults}
					yearRangeInitialStats={this.props.yearRangeInitialStats}
				/>
			);
			case ScoreBoard:
			return (
				<ScoreBoard
					{...controlCallbacks}
					{...this.props.gameSettings}
					endGameResults={this.props.endGameResults}
					yearRangeInitialStats={this.props.yearRangeInitialStats} />
			);
			default:
				return <></>;
		}
	}
}
