import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import type { ControlCallbacks } from './controls';
import { color } from '@mui/system';

interface TabPanelProps {
    children?: React.ReactNode;
    index: number;
    value: number;
}

function TabPanel(props: TabPanelProps) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role='tabpanel'
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box>
                    <Typography sx={{ fontSize: '22px' }}>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

function a11yProps(index: number) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BasicTabs(props: ScopeTabsControlProps) {
    const [value, setValue] = React.useState(0);

    const handleChange = (event: React.SyntheticEvent, selectedScopeIndex: number) => {
        setValue(selectedScopeIndex);
        props.handleChangeScopeTabs(selectedScopeIndex);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ bgcolor: 'background.paper' }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    aria-label='basic tabs example'
                    centered 
                    variant='fullWidth'
                >
                    <Tab sx={{ fontSize: '28px', border: 1, borderColor: '#1D428A' }} label='Scope 1' {...a11yProps(0)} />
                    <Tab sx={{ fontSize: '28px', border: 1, borderColor: '#1D428A' }} label='Scope 2' {...a11yProps(1)} />
                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                Scope 1: Direct Emissions <br></br>
                Company emissions that are owned or controlled by the organization directly.
            </TabPanel>
            <TabPanel value={value} index={1}>
                Scope 2: Indirect Emissions <br></br>
                Company emissions that are caused indirectly when the energy it purchases and uses is produced.
            </TabPanel>
        </Box>
    );
}

export interface ScopeTabsControlProps {
    handleChangeScopeTabs: (selectedScopeIndex: number) => void;
}
