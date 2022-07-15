import { createTheme, Paper, styled } from '@mui/material';

export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			main: '#1d459d',
			// main: '#ff0000',
		},
		secondary: {
			main: '#70b94a',
			// main: '#00ff00',
		},
	},
});


/**
 * Stylized "Paper" item to go inside a grid
 */
export const PaperGridItem = styled(Paper)(({ theme }) => ({
	backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
	...theme.typography.body2,
	padding: theme.spacing(1),
	textAlign: 'center',
	color: theme.palette.text.secondary,
}));