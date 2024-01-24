import React from 'react';
import type { RenewableProject, UserSettings} from '../Projects';
import type { CompletedProject, SelectedProject, GameSettings} from '../Projects';
import { PureComponentIgnoreFuncs } from '../functions-and-types';
import type { TrackedStats } from '../trackedStats';
import { GroupedChoices } from './GroupedChoices';
import type { GroupedChoicesProps } from './GroupedChoices';
import { SelectGameSettings } from './SelectGameSettings';
import { StartPage } from './StartPage';
import type { StartPageProps } from './StartPage';
import { YearRecap } from './YearRecap';
import type { PageControlProps, ControlCallbacks } from './controls';


interface CurrentPageProps extends ControlCallbacks, PageControlProps {
	implementedProjectsIds: symbol[];
	implementedRenewableProjects: RenewableProject[];
	availableProjectIds: symbol[];
	selectedProjectsForComparison: SelectedProject[];
	completedProjects: CompletedProject[];
	trackedStats: TrackedStats;
	handleCompareProjectsClick: () => void;
	handleClearProjectsClick: () => void;
	yearRangeInitialStats: TrackedStats[];
	gameSettings: GameSettings;	
	defaultTrackedStats :TrackedStats;
	handleNewYearSetupOnProceed: (yearFinalStats: TrackedStats) => void;
	handleGameSettingsOnProceed: (userSettings: UserSettings) => void;
}

export class CurrentPage extends PureComponentIgnoreFuncs<CurrentPageProps> {
	render() {
		const controlCallbacks: ControlCallbacks = {
			doPageCallback: this.props.doPageCallback,
			doAppStateCallback: this.props.doAppStateCallback,
			summonInfoDialog: this.props.summonInfoDialog,
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
					defaultTrackedStats ={this.props.defaultTrackedStats }
					implementedProjectsIds={this.props.implementedProjectsIds}
					implementedRenewableProjects={this.props.implementedRenewableProjects}
					completedProjects={this.props.completedProjects}
					yearRangeInitialStats={this.props.yearRangeInitialStats}
					handleNewYearSetup={this.props.handleNewYearSetupOnProceed}
				/>;
			default:
				return <></>;
		}
	}
}
