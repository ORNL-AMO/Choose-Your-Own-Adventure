import { createTheme, Paper, styled, TableRow } from '@mui/material';
import TableCell, { tableCellClasses } from '@mui/material/TableCell';

// see: https://mui.com/material-ui/customization/theming/ and https://mui.com/material-ui/customization/default-theme/#main-content
export const theme = createTheme({
	palette: {
		mode: 'light',
		primary: {
			// blue
			main: '#1d459d',
			// main: '#ff0000',
		},
		secondary: {
			// green
			main: '#70b94a',
			// main: '#00ff00',
		},
		warning: {
			// yellow
			main: '#e9bc18',
		}
	},
});

export const darkTheme = createTheme({
	palette: {
		mode: 'dark',
		text: {
			primary: 'rgba(255, 255, 255, 0.95)'
		}
	}
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



export const StyledTableCell = styled(TableCell)(({ theme }) => ({
	[`&.${tableCellClasses.head}`]: {
		backgroundColor: theme.palette.primary.light,
		color: theme.palette.common.white,
		fontSize: 14,
	},
	[`&.${tableCellClasses.body}`]: {
		fontSize: 14,
		color: theme.palette.primary.main,
	},
}));

export const StyledTableRow = styled(TableRow)(({ theme }) => ({
	'&:nth-of-type(odd)': {
		backgroundColor: theme.palette.action.hover,
	},
	// hide last border
	'&:last-child td, &:last-child th': {
		border: 0,
	},
}));