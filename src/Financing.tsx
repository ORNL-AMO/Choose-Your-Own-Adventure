import type { ImplementedProject, RecapSurprise } from './ProjectControl';
import type { TrackedStats } from './trackedStats';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import React from 'react';


export declare interface FinancingOption {
    financingType: FinancingType,
    financedTotalCost?: number,
    financedAnnualCost?: number,
}

export type FinancingId = 'budget' | 'greenBond' | 'capital-funding' | 'loan' | 'xaas';

/**
 * Capital Funding state - track user carbon/ghg savings and rewards related to capital funding
 */
export interface CapitalFundingState {
    roundA: FundingRound;
    roundB: FundingRound;
}

export interface FundingRound {
    isEarned: boolean;
    eligibleYear: number;
    usedOnProjectId: symbol;
}

export interface FinancingType {
    name: string,
    id: FinancingId,
	loanTerm?: number,
    description: string,
    detailedInfo?: string,
    isRoundA?: boolean,
}


/**
 * No interest, full term of game loan
 * @param item Item to resolve.
 */
export function getGreenBondsFinancing(years: number): FinancingType {
    return {
        name: 'Green Bonds',
        id: 'greenBond',
        loanTerm: years,
        description: 'Finance your energy use reduction',
        detailedInfo: `0% interest loan. Loan term: ${years} years`
    }
}


/**
 * Loan with interest, 4 or 10 years
 * @param years years to pay back loan
 */
export function getLoanFinancing(years: number): FinancingType {
    return {
        name: 'Loan',
        id: 'loan',
        loanTerm: years,
        description: 'Finance your energy use reduction',
        detailedInfo: `10% interest. Loan term: ${years} years`
    }
}


/**
 * No interest, short or long term
 * @param years years to pay back loan
 */
export function getXaasFinancing(years: number): FinancingType {
    return {
        name: 'Xaas',
        id: 'xaas',
        loanTerm: years,
        description: 'Finance your energy use reduction',
        detailedInfo: `0% interest. Loan term: ${years} years`
    }
}

/**
 * Capital funding financing - one free project
 * 
 */
export function getCapitalFundingOption(): FinancingOption {
    return {
        financingType: {
            name: 'Capital Funding',
            id: 'capital-funding',
            description: 'Use capital funding reward',
            detailedInfo: 'Capital funding reward earned from reaching energy savings milestones'
        },
    }
}

export function setCapitalFundingRoundUsed(capitalFundingState: CapitalFundingState, financingOption: FinancingOption, projectId: symbol) {
    if (capitalFundingState.roundA.isEarned && capitalFundingState.roundA.usedOnProjectId === undefined) {
        capitalFundingState.roundA.usedOnProjectId = projectId;
        financingOption.financingType.isRoundA = true;
        console.log('Used capital funding A', capitalFundingState.roundA.usedOnProjectId);
    } else if (capitalFundingState.roundB.isEarned && capitalFundingState.roundB.usedOnProjectId === undefined) {
        capitalFundingState.roundB.usedOnProjectId = projectId;
        financingOption.financingType.isRoundA = false;
        console.log('Used capital funding B', capitalFundingState.roundB.usedOnProjectId);
    }

    return capitalFundingState;
}

export function removeCapitalFundingRoundUsed(capitalFundingState: CapitalFundingState, isRoundA: boolean) {
    if (isRoundA) {
        capitalFundingState.roundA.usedOnProjectId = undefined;
    } else if (isRoundA === false) {
        capitalFundingState.roundB.usedOnProjectId = undefined;
    }
    return capitalFundingState;
}

export function getCanUseCapitalFunding(capitalFundingState: CapitalFundingState) {
    return getCanUseRound(capitalFundingState.roundA) || getCanUseRound(capitalFundingState.roundB);
}

export function getCanUseRound(round: FundingRound) {
    return round.isEarned && !round.isExpired && !round.usedOnProjectId;
}

/**
* Was capital funding used in elegible year
*/
export function setCapitalFundingExpired(capitalFundingState: CapitalFundingState, stats: TrackedStats) {
	capitalFundingState.roundA.isExpired = getRoundIsExpired(capitalFundingState.roundA, stats);
	capitalFundingState.roundB.isExpired = getRoundIsExpired(capitalFundingState.roundB, stats);
}


export function getRoundIsExpired(round: FundingRound, stats: TrackedStats) {
    return round.isEarned && round.eligibleYear <= stats.currentGameYear && round.usedOnProjectId === undefined;
}


export function getDefaultFinancingOption(hasFinancingOptions: boolean, baseCost: number): FinancingOption {
    return {
        financingType: {
            name: hasFinancingOptions ? 'Pay with Existing Budget' : 'Fully Fund Project',
            description: hasFinancingOptions ? 'Reduce energy use with a one-time payment' : 'Pay for project with funds from current budget',
            id: 'budget',
        },
        financedTotalCost: baseCost,
        financedAnnualCost: undefined,
    }
}


/**
 * Set milestone round is earned
 */
export function setCapitalFundingMilestone(capitalFundingState: CapitalFundingState, stats: TrackedStats) {
	let savingsMilestone: number;
	if (!capitalFundingState.roundA.isEarned) {
        let roundAMilestonePercent = 15;
		savingsMilestone = checkHasSavingsMilestone(stats, roundAMilestonePercent);
        if (savingsMilestone) {
            capitalFundingState.roundA.isEarned = true;
            capitalFundingState.roundA.eligibleYear = stats.currentGameYear + 1;
            capitalFundingState.roundA.isExpired = false;
            console.log('Capital Funding - earned round A, for year:', stats.currentGameYear + 1)
        }
	} else if (!capitalFundingState.roundB.isEarned) {
        let roundBMilestonePercent = 40;
        // let roundBMilestone = process.env.NODE_ENV == 'development' ? .8: 40;
		savingsMilestone = checkHasSavingsMilestone(stats, roundBMilestonePercent);
		if (savingsMilestone) {
            capitalFundingState.roundB.isEarned = true;
            capitalFundingState.roundB.eligibleYear = stats.currentGameYear + 1;
            capitalFundingState.roundB.isExpired = false;
            console.log('Capital Funding - earned round B, for year:', stats.currentGameYear + 1);
        }
	}
	return savingsMilestone;
}

/**
 * Reset capital funding state from future year
 */
export function resetCapitalFundingState(capitalFundingState: CapitalFundingState, prevYearStats: TrackedStats) {
	if (capitalFundingState.roundA.eligibleYear === prevYearStats.currentGameYear + 1) {
        capitalFundingState.roundA.isEarned = false;
        capitalFundingState.roundA.eligibleYear = undefined;
	}
    if (capitalFundingState.roundB.eligibleYear === prevYearStats.currentGameYear + 1) {
        capitalFundingState.roundB.isEarned = false;
        capitalFundingState.roundB.eligibleYear = undefined;
	}
}



/**
 * User has obtained savings milestone and can receive a Capital Funds Reward to implement a free project
 */
export function checkHasSavingsMilestone(stats: TrackedStats, carbonSavingsPercentMilestone: number): number {
    let carbonSavingsPercent = stats.carbonSavingsPercent * 100;
    carbonSavingsPercent = Number(carbonSavingsPercent.toFixed(1))
	if (carbonSavingsPercent >= carbonSavingsPercentMilestone) {
		return carbonSavingsPercentMilestone;
	}
	return undefined;
}


/**
 * Get Default Capital Funding surprise
 */
export function getCapitalFundingSurprise(milestoneSavingsPercent: number): RecapSurprise {
    return {
		title: `Greenhouse gas emissions have been reduced by ${milestoneSavingsPercent}%`,
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

/**
 * Check whether project is annually financed or should otherwise be ignored by year to year logic
 */
export function getIsAnnuallyFinanced(financingId: FinancingId) {
    return !['budget', 'capital-funding'].includes(financingId);
}

/**
 * check whether budget, capital funding, or payoff year
 */
export function isProjectFullyFunded(project: ImplementedProject, currentGameYear: number) {
    let financingPayoffYear: number = project.yearStarted + project.financingOption.financingType.loanTerm;
    let isAnnuallyFinanced = getIsAnnuallyFinanced(project.financingOption.financingType.id);
    return !isAnnuallyFinanced || currentGameYear >= financingPayoffYear;
}

/**
 * This is a bandaid due to implementedProjectIds and Implementedfinancedprojects having different lengths
 */
export function findFinancingOptionFromProject(implementedFinancedProjects: ImplementedProject[], pageId: symbol) {
    const financingIndex = implementedFinancedProjects.findIndex(project => project.page === pageId);
	 return implementedFinancedProjects[financingIndex]? implementedFinancedProjects[financingIndex].financingOption : undefined;
}

/**
 * Capital Funding state - track user carbon/ghg savings and rewards related to capital funding
 */
export interface CapitalFundingState {
    roundA: FundingRound;
    roundB: FundingRound;
}

export interface FundingRound {
    isEarned: boolean;
    isExpired: boolean;
    eligibleYear: number;
    usedOnProjectId: symbol;
}





// todo 143 - don't currently need below. we're hardcoded values for each project, I've been told we may eventually calculate interest
// export function setFinancingCosts(financingOptionCard: DialogFinancingOptionCard, projectCost: number) {
//     if (financingOptionCard.financingType.id === 'loan') {
//         financingOptionCard.financedAnnualCost = getLoanfinancedAnnualCost(projectCost)
//         financingOptionCard.financedTotalCost = getLoanfinancedTotalCost(projectCost)
//     } else if (financingOptionCard.financingType.id === 'greenBond') {
//         financingOptionCard.financedAnnualCost = getGreenBondsfinancedAnnualCost(projectCost)
//         financingOptionCard.financedTotalCost = getGreenBondsfinancedTotalCost(projectCost)
//     } else if (financingOptionCard.financingType.id === 'xaas') {
//         financingOptionCard.financedAnnualCost = getXaasfinancedAnnualCost(projectCost)
//         financingOptionCard.financedTotalCost = getXaasfinancedTotalCost(projectCost)
//     } else if (financingOptionCard.financingType.id === 'budget') {
//         financingOptionCard.financedTotalCost = projectCost
//     }
// }

// export function getXaasfinancedAnnualCost(projectCost: number) {
//     return projectCost / 10;
// }

// export function getXaasfinancedTotalCost(projectCost: number) {
//     return projectCost;
// }

// export function getLoanfinancedAnnualCost(projectCost: number) {
//     return projectCost / 10;
// }

// export function getLoanfinancedTotalCost(projectCost: number) {
//     return projectCost;
// }

// export function getGreenBondsfinancedAnnualCost(projectCost: number) {
//     return projectCost / 10;
// }

// export function getGreenBondsfinancedTotalCost(projectCost: number) {
//     return projectCost;
// }

// export function setFinancingCosts(financingOptionCard: DialogFinancingOptionCard, project: ProjectControl) {
//     financingOptionCard.financedAnnualCost = project.financedAnnualCost
//     financingOptionCard.financedTotalCost = project.financedTotalCost
//     return financingOptionCard;
// }


