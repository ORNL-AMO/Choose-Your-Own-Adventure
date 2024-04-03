import { Box } from "@mui/system";
import { animated } from '@react-spring/web'
import HorizontalBarWithTooltip from './HorizontalBar';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import React, { Fragment } from 'react';
import { Paper } from "@mui/material";


export interface FinancesAvailableProps {
    financesAvailable: number,
    moneySpent: number
}

export default function HeaderFinances(props: FinancesAvailableProps) {
    return (
        <Box
            display="flex"
            alignSelf={'center'}>
            <Box sx={{ display: { xs: 'none', sm: 'none', md: 'none', lg: 'inline-flex' } }}>
                <HorizontalBarWithTooltip
                    width={400} height={100}
                    inHeader={true}
                    data={[{
                        // Finances available can be negative UP TO the amount of rebates.... may be changed later
                        'Finances available': Math.max(props.financesAvailable, 0),
                        'Money spent': props.moneySpent,
                    }]}
                />
            </Box>
            <FinancesAvailableText 
				financesAvailable={props.financesAvailable}
				moneySpent={props.moneySpent}></FinancesAvailableText>
        </Box>

    )
}

export function FinancesAvailableText(props: FinancesAvailableProps) {
    let currentFinances = props.financesAvailable;
     // todo enable animation when we add previousFinances state
    //  let prevFinances = currentFinances * 1.05;
     // const { financesAvailable } = useSpring({
     //     from: { financesAvailable: prevFinances},
     //     financesAvailable: currentFinances,
     //     delay: 25,
 
     // })

    return (<Box sx={{
        fontWeight: 700,
        display: 'inline-flex',
        flexDirection: 'column',
        padding: '8px',
        alignSelf: 'center',
        color: 'rgb(32, 128, 48)',
    }}>
        <span>Available Balance</span>
        <span style={{ display: 'flex', fontSize: '24px' }}><AttachMoneyIcon sx={{ color: 'rgb(32, 128, 48)', alignSelf: 'center' }} />
             <animated.span>
                 {`${Math.floor(currentFinances).toLocaleString('en-US')}`}
                 {/* {financesAvailable.to((n => `${Math.floor(n).toLocaleString('en-US')}`))} */}
             </animated.span>
        </span>
    </Box>
    )
}

