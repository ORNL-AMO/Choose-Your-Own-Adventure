import React from 'react';
import type { RecapSurprise } from './Projects';
import type { TrackedStats } from './trackedStats';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';

/**
 * Capital Funding state - track user carbon/ghg savings and rewards related to capital funding
 */
export interface CapitalFundingState {
    roundA: FundingRound;
    roundB: FundingRound;
}

export interface FundingRound {
    isEarned: boolean;
    isUsed: boolean;
    usedOnProjectId: symbol;
}

/**
 * Set milestone round is earned
 */
export function setCapitalFundingMilestone(capitalFundingState: CapitalFundingState, stats: TrackedStats) {
	let savingsMilestone: number;
	if (!capitalFundingState.roundA.isEarned) {
		savingsMilestone = checkHasSavingsMilestone(stats, .15);
		capitalFundingState.roundA.isEarned = savingsMilestone !== undefined;
		console.log('earned round A')
	} else if (!capitalFundingState.roundB.isEarned) {
		savingsMilestone = checkHasSavingsMilestone(stats, .30);
		capitalFundingState.roundB.isEarned = savingsMilestone !== undefined;
		console.log('earned round B');
	}
	return savingsMilestone;
}


/**
 * User has obtained savings milestone and can receive a Capital Funds Reward to implement a free project
 */
export function checkHasSavingsMilestone(stats: TrackedStats, carbonSavingsPercentMilestone: number): number {
	if (stats.carbonSavingsPercent >= carbonSavingsPercentMilestone) {
		return carbonSavingsPercentMilestone;
	}
	return undefined;
}


/**
 * Get Default Capital Funding surprise
 */
export function getCapitalFundingSurprise(milestoneSavingsPercent: string): RecapSurprise {
    return {
		title: `Greenhouse gas emissions have been reduced by ${milestoneSavingsPercent}!`,
		subHeader: 'Capital Funding Reward Earned',
		text: 'You\'ve received a {Capital Funding Reward} for making great choices toward reducing emissions. This reward allows you to implement one qualifying project for {FREE}.',
		className: 'year-recap-positive-surprise',
		avatar: {
			icon: <AttachMoneyIcon />,
			backgroundColor: 'rgba(255,255,255,0.8)',
			color: 'rgba(63, 163, 0, 1)',
		},
		img: undefined,
		imgObjectFit: undefined,
		imgAlt: undefined
	}
}
