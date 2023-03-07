import * as React from 'react';
import { Popover, Button, Box } from '@mui/material';
import { resolveToValue } from '../functions-and-types';

/**
 * Material Popover with a button. See: https://mui.com/material-ui/react-popover/
 */
export default function BasicPopover(props: PopoverProps) {
	const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

	const handlePopoverOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
		setAnchorEl(event.currentTarget);
	};

	const handlePopoverClose = () => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);
	const id = open ? 'simple-popover' : undefined;
	
	// Default variant
	let variant = props.variant;
	if (!variant) variant = 'click';
	
	if (props.variant !== 'mouseover' && props.onClick) throw new Error('props.onClick is only allowed if props.variant == \'mouseover\'');
	return (
		<React.Fragment>
			<Button 
				aria-describedby={id}
				variant={props.buttonVariant}
				onClick={(e) => {
					if (variant === 'click') handlePopoverOpen(e);
					if (props.onClick) props.onClick();
				}}
				onMouseEnter={(variant === 'mouseover') ? handlePopoverOpen : undefined}
				onMouseLeave={(variant === 'mouseover') ? handlePopoverClose : undefined}
				startIcon={props.startIcon}
				endIcon={props.endIcon}
				size={props.buttonSize}
				disabled={props.buttonDisabled}
			>
				{props.text}
			</Button>
            <Popover
                id={id}
                sx={{
                    pointerEvents: (variant === 'mouseover' ? 'none' : 'unset'),
                }}
                open={open}
                anchorEl={anchorEl}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'left',
                }}
                onClose={handlePopoverClose}
                disableRestoreFocus
				disableScrollLock
            >
                <Box sx={{ p: 2 }}>{resolveToValue(props.children)}</Box>
            </Popover>
        </React.Fragment>
	);
}

declare interface PopoverProps extends React.PropsWithChildren {
	/**
	 * Icon to appear at the start of the button.
	 */
	startIcon?: React.ReactNode;
	/**
	 * Icon to appear at the end of the button.
	 */
	endIcon?: React.ReactNode;
	/**
	 * Variant of the button, see https://mui.com/material-ui/react-button/
	 */
	buttonVariant: buttonVariant;
	/**
	 * Size of the button, see https://mui.com/material-ui/react-button/
	 */
	buttonSize?: 'small'|'medium'|'large';
	/**
	 * Whether the button should appear disabled.
	 * @default false
	 */
	buttonDisabled?: boolean;
	/**
	 * Whether the popover should open/close on a mouse click or when the button is moused over.
	 */
	variant?: 'click'|'mouseover',
	/**
	 * Text to appear in the button.
	 */
	text: string;
	/**
	 * Click handler for popover; only allowed if variant == 'mouseover'
	 */
	onClick?: () => unknown;
}