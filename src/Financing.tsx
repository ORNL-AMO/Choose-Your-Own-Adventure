import { DialogFinancingOptionCard } from "./components/Dialogs/ProjectDialog";

export declare interface FinancingOption {
    financingType: FinancingType,
    totalCost?: number,
    annualCost?: number,
}

export interface FinancingType {
    name: string,
    id: FinancingId,
    description: string,
    detailedInfo?: string,
}

export function getGreenBondsFinancing(): FinancingType {
    return {
        name: 'Green Bonds',
        id: 'green-bonds',
        description: 'Finance your energy use reduction',
        detailedInfo: '0% interest loan. Loan term: 10 years'
    }
}

export function getGreenBondsAnnualCost(projectCost: number) {
    return projectCost / 10;
}

export function getGreenBondsTotalCost(projectCost: number) {
    return projectCost;
}


export function getLoanFinancing(): FinancingType {
    return {
        name: 'Loan',
        id: 'loan',
        description: 'Finance your energy use reduction',
        detailedInfo: '0% interest loan. Loan term: 10 years'
    }
}

export function getLoanAnnualCost(projectCost: number) {
    return projectCost / 10;
}

export function getLoanTotalCost(projectCost: number) {
    return projectCost;
}


export function getXaasFinancing(): FinancingType {
    return {
        name: 'Xaas',
        id: 'xaas',
        description: 'Finance your energy use reduction',
        detailedInfo: '0% interest loan. Loan term: 10 years'
    }
}

export function getXaasAnnualCost(projectCost: number) {
    return projectCost / 10;
}

export function getXaasTotalCost(projectCost: number) {
    return projectCost;
}


export function getCapitalFundsFinancing(): FinancingType {
    return {
        name: 'Capital Funding',
        id: 'capital-funding',
        description: 'Use capital funding reward',
        detailedInfo: 'Capital funding reward earned from reaching 15% energy savings'
    }
}

// todo 142 are we going to receive interest %s or hardcoded values, may need to replace this
export function setFinancingCosts(financingOptionCard: DialogFinancingOptionCard, projectCost: number) {
    if (financingOptionCard.financingType.id === 'loan') {
        financingOptionCard.annualCost = getLoanAnnualCost(projectCost)
        financingOptionCard.totalCost = getLoanTotalCost(projectCost)
    } else if (financingOptionCard.financingType.id === 'green-bonds') {
        financingOptionCard.annualCost = getGreenBondsAnnualCost(projectCost)
        financingOptionCard.totalCost = getGreenBondsTotalCost(projectCost)
    } else if (financingOptionCard.financingType.id === 'xaas') {
        financingOptionCard.annualCost = getXaasAnnualCost(projectCost)
        financingOptionCard.totalCost = getXaasTotalCost(projectCost)
    } else if (financingOptionCard.financingType.id === 'budget') {
        financingOptionCard.totalCost = projectCost
    }
}

export type FinancingId = 'budget' | 'green-bonds' | 'capital-funding' | 'loan' | 'xaas';
