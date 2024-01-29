import { Paper } from "@mui/material";
import { ButtonGroupButton } from "../Buttons";
import { styled } from '@mui/material/styles';


export const InfoCard = styled(Paper)(({ theme }) => ({
	...theme.typography.body2,
	textAlign: 'center',
	color: theme.palette.text.secondary,
	borderColor: theme.palette.primary.light,
	lineHeight: 2,
	marginTop: theme.spacing(2),
	marginBottom: theme.spacing(2),
	paddingTop: theme.spacing(2),
	paddingBottom: theme.spacing(2),
	paddingLeft: theme.spacing(0.5),
	paddingRight: theme.spacing(0.5),
}));


export declare interface DialogCardContent {
	text: string;
	color: string;
}

export declare interface DialogStateProps extends DialogControlProps {
	isOpen: boolean;
}
/**
 * Control properties specified by the scripter (in pages.tsx).
 */
export declare interface DialogControlProps {
	title: Resolvable<string>;
	text: Resolvable<string|string[]>;
	allowClose?: boolean;
	img?: string;
	imgObjectFit?: 'cover'|'contain';
	imgAlt?: string;
	buttons?: ButtonGroupButton[];
	handleProjectInfoViewed?: AppStateCallback;
}

