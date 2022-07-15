import * as React from 'react';
import { Popover, Button, Box } from '@mui/material';
import { resolveToValue } from '../functions-and-types';

export default function BasicPopover(props: PopoverProps) {
  const [anchorEl, setAnchorEl] = React.useState<HTMLButtonElement | null>(null);

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

  return (
    <React.Fragment>
		<Button aria-describedby={id} 
			variant={props.variant} 
			onClick={handleClick}
			startIcon={props.startIcon}
		>
			{props.text}
		</Button>
		<Popover
			id={id}
			open={open}
			anchorEl={anchorEl}
			onClose={handleClose}
			anchorOrigin={{
				vertical: 'bottom',
				horizontal: 'center',
			}}
			transformOrigin={{
				vertical: 'top',
				horizontal: 'center',
			}}
		>
			<Box sx={{ p: 2 }}>{resolveToValue(props.children)}</Box>
		</Popover>
    </React.Fragment>
  );
}

declare interface PopoverProps extends React.PropsWithChildren {
	startIcon?: React.ReactNode;
	variant: buttonVariant;
	text: string;
}