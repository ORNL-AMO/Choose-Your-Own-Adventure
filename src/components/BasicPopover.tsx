import * as React from 'react';
import { Popover, Button, Box } from '@mui/material';
import { resolveToValue } from '../functions-and-types';

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
				open={open}
				anchorEl={anchorEl}
				onClose={handlePopoverClose}
				anchorOrigin={{
					vertical: 'bottom',
					horizontal: 'center',
				}}
				transformOrigin={{
					vertical: 'top',
					horizontal: 'center',
				}}
				sx={{
					pointerEvents: (variant === 'mouseover' ? 'none' : 'unset'),
				}}
			>
				<Box sx={{ p: 2 }}>{resolveToValue(props.children)}</Box>
			</Popover>
		</React.Fragment>
	);
}

declare interface PopoverProps extends React.PropsWithChildren {
	startIcon?: React.ReactNode;
	endIcon?: React.ReactNode;
	buttonVariant: buttonVariant;
	buttonSize?: 'small'|'medium'|'large';
	buttonDisabled?: boolean;
	variant?: 'click'|'mouseover',
	text: string;
	/**
	 * Click handler for popover; only allowed if variant == 'mouseover'
	 */
	onClick?: () => unknown;
}