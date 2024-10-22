import React, { Fragment, useEffect, useState } from 'react';
import { EndGameResults, TrackedStats } from '../../trackedStats';
import { GameSettings } from '../SelectGameSettings';
import { ControlCallbacks, Emphasis, PageControl } from '../controls';
import { Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TableSortLabel, Typography } from '@mui/material';
import { visuallyHidden } from '@mui/utils';
import axios from 'axios';
import { StyledTableCell } from '../theme';

// interface ScoreData {
//     name: string;
//     scoreData: EndGameResults;
// }

interface LeaderboardDbEntry {
    name: string;
    scoreData: EndGameResults
}

interface LeaderboardDataRow extends EndGameResults {
    name: string;
}

interface HeadCell {
    id: keyof EndGameResults;
    label: string;
    numeric: boolean;
}

const headCells: readonly HeadCell[] = [
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
    console.log('getComparator order, orderby', order, orderBy);
    if (order === 'desc') {
       return (a, b) => descendingComparator(a, b, orderBy);
    } else {
       return (a, b) => -descendingComparator(a, b, orderBy);
    }
}


interface EnhancedTableProps {
    onRequestSort: (event: React.MouseEvent<unknown>, property: keyof EndGameResults) => void;
    // onRequestSort: (event: React.MouseEvent<unknown>, property: keyof ScoreData["scoreData"]) => void;
    order: Order;
    orderBy: string;
}

function EnhancedTableHead(props: EnhancedTableProps) {
    const { order, orderBy, onRequestSort } =
        props;
    const createSortHandler =
    (property: keyof EndGameResults) => (event: React.MouseEvent<unknown>) => {
        onRequestSort(event, property);
    };
    return (
        <TableHead>
            <TableRow>
                <StyledTableCell>Rank</StyledTableCell>
                <StyledTableCell>Name</StyledTableCell>
                {headCells.map((headCell) => (
                    <StyledTableCell
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
                    </StyledTableCell>
                ))}
            </TableRow>
        </TableHead>
    );
}


export default function ScoreBoard(props: FormProps) {
    const [orderRows, setOrder] = React.useState<Order>('asc');
    const [orderRowsBy, setOrderBy] = React.useState<keyof EndGameResults>('carbonSavingsPercent');

    const handleRequestSort = (
        event: React.MouseEvent<unknown>,
        property: keyof EndGameResults,
    ) => {
        const isAsc = orderRowsBy === property && orderRows === 'asc';
        setOrder(isAsc ? 'desc' : 'asc');
        setOrderBy(property);
    };

    const [leaderboardData, setLeaderboardData] = useState([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const response = await axios.get('http://127.0.0.1:3000/leaderboard');
            const leaderBoardRowData: LeaderboardDataRow[] = createLeaderboardRows(response.data) 
            setLeaderboardData(leaderBoardRowData);
            console.log('leaderboard data result', leaderBoardRowData);
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const createLeaderboardRows = (leaderboard: LeaderboardDbEntry[]): LeaderboardDataRow[] => {
        return leaderboard.map((entry: LeaderboardDbEntry) => {
            return {
                ...entry.scoreData,
                name: entry.name,
            }
        })
    }

    // todo 329 using memoized leaderboardData (does not exist). Needed to add leaderboardData as a dependency
    const visibleRows = React.useMemo(
        () => {
            return [...leaderboardData].sort(getComparator(orderRows, orderRowsBy))
        }, [orderRows, orderRowsBy, leaderboardData]);

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
                        {/* // todo 329 this row data format WAS incorrect for what the sorting expects */}
                        {visibleRows.map((row: LeaderboardDataRow, index) => {
                            return (
                                <TableRow
                                key={index}
                                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
                                >
                                <TableCell align="left">{index + 1}</TableCell>
                                <TableCell component="th" scope="row">{row.name}</TableCell>
                                <TableCell align="left">{row.carbonSavingsPercent}</TableCell>
                                <TableCell align="left">{row.gameTotalSpending}</TableCell>
                                <TableCell align="left">{row.costPerCarbonSavings}</TableCell>
                                <TableCell align="left">{row.projectedFinancedSpending}</TableCell>
                            </TableRow>
                            )}
                        )}
                    </TableBody>
                </Table>

            </TableContainer>


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
