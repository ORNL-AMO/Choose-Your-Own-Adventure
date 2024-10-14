import React, { Fragment, useEffect, useState } from 'react';
import { EndGameResults, TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import { FinancingOption, isProjectFullyFunded } from '../../Financing';
import { ControlCallbacks, Emphasis, PageControl } from '../controls';
import { Box, Card, CardContent, CardHeader, Grid, Link, List, ListItem, ListItemIcon, ListItemText, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import { ParentSize } from '@visx/responsive';
import { ProjectControl } from '../../ProjectControl';
import { ImplementedFinancingData } from '../YearRecap';
import Projects from '../../Projects';
import { DialogFinancingOptionCard } from '../Dialogs/ProjectDialog';
import { parseSpecialText } from '../../functions-and-types';
import EnergyUseLineChart from '../EnergyUseLineChart';
import DownloadPDF from './DownloadPDF';
import InfoIcon from '@mui/icons-material/Info';
import { visuallyHidden } from '@mui/utils';
import axios from 'axios';

interface Data {
    name: string;
    carbonSavingsPercent: string;
    gameTotalSpending: string;
    costPerCarbonSavings: string;
    projectedFinancedSpending: string;
}

function createData(
    name: string,
    carbonSavingsPercent: string,
    gameTotalSpending: string,
    costPerCarbonSavings: string,
    projectedFinancedSpending: string
): Data {
    return { name, carbonSavingsPercent, gameTotalSpending, costPerCarbonSavings, projectedFinancedSpending };
}

const rows = [
    createData('A', '55.00', '4,796,000', '0.42', '3,948,000'),
    createData('B', '55.01', '4,795,000', '0.42', '3,948,000'),
    createData('C', '55.02', '4,794,000', '0.42', '3,948,000'),
    createData('D', '55.03', '4,793,000', '0.42', '3,948,000'),
    createData('E', '55.04', '4,792,000', '0.42', '3,948,000'),
    createData('F', '55.05', '4,791,000', '0.42', '3,948,000'),
    createData('G', '55.06', '4,790,000', '0.42', '3,948,000'),
]

interface HeadCell {
    id: keyof Data;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
    {
        id: 'name',
        numeric: false,
        label: 'Name',
    },
    {
        id: 'carbonSavingsPercent',
        numeric: false,
        label: 'CO2e Emissions Reduction %',
    },
    {
        id: 'gameTotalSpending',
        numeric: false,
        label: 'Budget Spent',
    },
    {
        id: 'costPerCarbonSavings',
        numeric: false,
        label: 'Cost per kg reduced',
    },
    {
        id: 'projectedFinancedSpending',
        numeric: false,
        label: 'Projected Spending / Remaining Debt',
    },
];

function descendingComparator<T>(a: T, b: T, orderBy: keyof T) {
    if (b[orderBy] < a[orderBy]) {
        return -1;
    }
    if (b[orderBy] > a[orderBy]) {
        return 1;
    }
    return 0;
}

type Order = 'asc' | 'desc';

function getComparator<Key extends keyof any>(
    order: Order,
    orderBy: Key,
): (
    a: { [key in Key]: number | string },
    b: { [key in Key]: number | string },
) => number {
    return order === 'desc'
        ? (a, b) => descendingComparator(a, b, orderBy)
        : (a, b) => -descendingComparator(a, b, orderBy);
}


interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof Data) => void;
    order: Order;
    orderBy: string;
}




function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } =
        props;
    const createSortHandler =
        (property: keyof Data) => (event: React.MouseEvent<unknown>) => {
            onRequestSort(event, property);
        };

    return (
        <TableHead>
            <TableRow>
                <TableCell>Rank</TableCell>
                {headCells.map((headCell) => (
                    <TableCell
                        key={headCell.id}
                        align={headCell.numeric ? 'right' : 'left'}
                        sortDirection={orderBy === headCell.id ? order : false}
                    >
                        <TableSortLabel
                            active={orderBy === headCell.id}
                            direction={orderBy === headCell.id ? order : 'asc'}
                            onClick={createSortHandler(headCell.id)}
                        >
                            {headCell.label}
                            {orderBy === headCell.id ? (
                                <Box component="span" sx={visuallyHidden}>
                                    {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                                </Box>
                            ) : null}
                        </TableSortLabel>
                    </TableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}


export default function ScoreBoard(props: FormProps) {
    const [orderRows, setOrder] = React.useState<Order>('asc');
    const [orderRowsBy, setOrderBy] = React.useState<keyof Data>('carbonSavingsPercent');

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof Data,
    ) => {
        const isAsc = orderRowsBy === property && orderRows === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const visibleRows = React.useMemo(
        () =>
            [...rows]
                .sort(getComparator(orderRows, orderRowsBy)),
        [orderRows, orderRowsBy],
    );


    const [data, setData] = useState({});

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://localhost:3001/data');
            setData(response.data);            
            console.error('worked');
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    return (
        <>
            <Typography variant='h2'>
                Leaderboard
            </Typography>

            <TableContainer component={Paper}>
                <Table aria-label='simple table'>
                    <EnhancedTableHead
                        order={orderRows}
                        orderBy={orderRowsBy}
                        onRequestSort={handleRequestSort}
                    />
                    <TableBody>
                        {visibleRows.map((row, index) => (
                            <TableRow
                                key={row.name}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                            >
                                <TableCell align="left">{index + 1}</TableCell>
                                <TableCell component="th" scope="row">
                                    {row.name}
                                </TableCell>
                                <TableCell align="left">{row.carbonSavingsPercent}</TableCell>
                                <TableCell align="left">{row.gameTotalSpending}</TableCell>
                                <TableCell align="left">{row.costPerCarbonSavings}</TableCell>
                                <TableCell align="left">{row.projectedFinancedSpending}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>

            </TableContainer>
            {data[0].name}

        </>
    );

}

interface FormProps {
    endGameResults: EndGameResults,
    yearRangeInitialStats: TrackedStats[];
}
export function newScoreBoardPageControl(): PageControl {
    return {
        componentClass: ScoreBoard,
        controlProps: {},
        hideDashboard: true,
    };
}

export interface ScoreBoardPageProps extends
    ControlCallbacks,
    GameSettings {
    endGameResults: EndGameResults;
    yearRangeInitialStats: TrackedStats[];
}
