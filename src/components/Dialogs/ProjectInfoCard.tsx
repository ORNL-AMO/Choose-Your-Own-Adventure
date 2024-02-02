import React, { useEffect } from 'react';
import { CardMedia, Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions, useMediaQuery, Paper, DialogProps, Box, Card, CardHeader, CardContent, Typography, CardActions, Button, List, ListItem, ListItemText, Grid } from '@mui/material';
import { parseSpecialText, PureComponentIgnoreFuncs } from '../../functions-and-types';
import { useTheme } from '@mui/material/styles';
import { ButtonGroup } from '../Buttons';
import { DialogCardContent, InfoCard } from './dialog-functions-and-types';
import { Emphasis } from '../controls';
import { DialogFinancingOptionCard, ProjectDialogProps } from './ProjectDialog';


export class ProjectInfoCard extends PureComponentIgnoreFuncs<ProjectDialogProps> {
	render() {
		return (
			<ProjectInfoCardFunc {...this.props} />
		);
	}
}

/**
 * Project info child component for ProjectDialog and CompareDialogs.
 */
function ProjectInfoCardFunc(props: ProjectDialogProps) {
	const theme = useTheme();
	let imgHeight = '260';
	let objectFit = (props.imgObjectFit) ? props.imgObjectFit : 'cover';

	// todo 25 - this effect logic SHOULD be moved to onClick handler for the info dialog, 
	useEffect(() => {
		// timeout delay button display until dialog open - less page jump
		const timeout = setTimeout(() => {
			if (props.handleProjectInfoViewed && props.doAppStateCallback) {
				props.doAppStateCallback(props.handleProjectInfoViewed);
			}
		}, 100);

		return () => {
			// ensure state cleared before next effect
			clearTimeout(timeout);
		};
	});

	let energyStatCards: JSX.Element[] = getProjectEnergytStatCards(props.energyStatCards, props.resolveToValue);
	let financingOptionCards: DialogFinancingOptionCard[] = [];
	if (props.financingOptionCards) {
		financingOptionCards = props.resolveToValue(props.financingOptionCards);
	}

	return (
		<>
		{props.img && <>
				<CardContent>
					{/* static image / energy stats overlay */}
					<Box sx={{position: 'absolute', display: 'flex', justifyContent: 'space-evenly', width: '100%'}}>
						<CardMedia
							component='img'
							height={imgHeight}
							image={props.img}
							alt={props.imgAlt}
							title={props.imgAlt}
							sx={{
								objectFit: objectFit,
								width: '40%',
								alignSelf: 'start',
								borderRadius: '16px',
								marginX: '8px',
								zIndex: 2,
								boxShadow: 1
							}}
						/>
						<Box sx={{ zIndex: 2, width: '50%', marginX: '8px', }}>
							{energyStatCards}
						</Box>
					</Box>

					{/* blurred background */}
					<CardMedia
						component='img'
						height={imgHeight}
						image={props.img}
						alt={props.imgAlt}
						title={props.imgAlt}
						sx={{
							objectFit: 'cover',
							zIndex: 1,
							padding: '0px',
							flexWrap: 'nowrap',
							filter: 'blur(8px) grayscale(75%)',
							margin: '-20px',
							width: 'calc(100% + 40px)',
							height: '300px',
							borderRadius: '8px'
						}}
					>
					</CardMedia>
				</CardContent>
			</>}

			{!props.inCompareDialog &&
				<>
					<DialogTitle className='semi-emphasis' variant="h5" dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}></DialogTitle>
					<DialogContent>
						<DialogContentText id='alert-dialog-slide-description' gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.text))}>
						</DialogContentText>
						{getFinancingOptionsGrid(financingOptionCards, props)}
					</DialogContent>
				</>
			}

			{props.inCompareDialog &&
				<>
					<CardContent>
						{/* Setting some static heights below to display all cards similarly */}
						<Typography gutterBottom variant='h5' component='h5' className='emphasis'
							dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.title))}>
						</Typography>
						<Typography paragraph variant='body2' color='#000000' component='div'
							sx={{ overflowY: 'auto', height: '200px' }}
							gutterBottom dangerouslySetInnerHTML={parseSpecialText(props.resolveToValue(props.text))}>
						</Typography>
						{getFinancingOptionsGrid(financingOptionCards, props)}
					</CardContent>
					<CardActions style={{ justifyContent: 'flex-end' }}>
						<ButtonGroup
							buttons={props.comparisonDialogButtons}
							doPageCallback={props.doPageCallback}
							displayProjectDialog={props.displayProjectDialog}
							resolveToValue={props.resolveToValue}
							doAppStateCallback={props.doAppStateCallback}
						/>
					</CardActions>
				</>
			}

		</>
	);
}

export function getProjectEnergytStatCards(cards: Resolvable<DialogCardContent[]>, resolveToValue: <T> (value: Resolvable<T>, whenUndefined?: T) => T): JSX.Element[] {
	let cardContents: DialogCardContent[] = [];
	if (cards) {
		cardContents = resolveToValue(cards);
	}
	return cardContents.map((cardContent, idx) =>
		<InfoCard
			key={idx}
			variant='outlined'
			sx={{
				borderColor: cardContent.backgroundColor,
				borderWidth: 'medium',
				fontWeight: 'bold',
				border: 'none',
				color: cardContent.textColor,
				backgroundColor: cardContent.backgroundColor,


			}}
			dangerouslySetInnerHTML={parseSpecialText(cardContent.text, false)}
		/>
	);
}

function getFinancingOptionsGrid(financingOptionCards: DialogFinancingOptionCard[], props: ProjectDialogProps) {
	return (
		<Grid container spacing={2} sx={{ marginTop: '1rem' }}
			justifyContent='flex-end'
			alignItems='flex-end'>
			{financingOptionCards.map((cardContent: DialogFinancingOptionCard, idx) =>
				<Grid item
					display={'flex'}
					flexDirection={'column'}
					alignSelf={'stretch'}
					xs={4}
					key={cardContent.financingType.name + idx}
				>
					<Card
						sx={{
							boxShadow: '0 2px 4px -2px rgba(0,0,0,0.24), 0 4px 24px -2px rgba(0, 0, 0, 0.2)',
							display: 'flex',
							flexDirection: 'column',
							flexGrow: 1,
						}}>
						<CardHeader
							title={cardContent.financingType.name}
							titleTypographyProps={{ variant: 'h6' }}
							subheader={!props.inCompareDialog? cardContent.financingType.description : undefined}
							subheaderTypographyProps={{ variant: 'subtitle1' }}
							sx={{
								paddingBottom: '4px',
							}}
						/>
						{!props.inCompareDialog && 
						<CardContent sx={{ paddingTop: '4px', paddingBottom: '4px' }}>
							<Typography variant="body2">
								{cardContent.financingType.detailedInfo}
							</Typography>
						</CardContent>
						}
						<CardActions
							sx={{ flexDirection: 'column', flexGrow: '1', alignItems: 'flex-end', justifyContent: 'flex-end', paddingBottom: '16px' }}
							disableSpacing>
							<Grid container
								spacing={2}
								sx={{ padding: '8px' }}>

								<Grid item xs={8}>
									{cardContent.financingType.id !== 'capital-funding' ?
										cardContent.annualCost !== undefined ?
											<>
												<Typography variant={!props.inCompareDialog? 'body2' : 'caption'} gutterBottom>
													<Emphasis money>
														Total ${cardContent.totalCost.toLocaleString('en-US')}
													</Emphasis>
												</Typography>

												<Typography variant='h6' gutterBottom>
													<Emphasis money>
														Annual ${cardContent.annualCost.toLocaleString('en-US')}
													</Emphasis>
												</Typography>
											</>
											:
											<Typography variant='h6' gutterBottom>
												<Emphasis money>
													${cardContent.totalCost.toLocaleString('en-US')}
												</Emphasis>
											</Typography>
										:
										<Typography variant='h6' gutterBottom>
											<Emphasis money>
												Free
											</Emphasis>
										</Typography>
									}
								</Grid>
							</Grid>

							<Button
								sx={{ width: '100%' }}
								variant={cardContent.implementButton.variant}
								color={cardContent.implementButton.color}
								startIcon={props.resolveToValue(cardContent.implementButton.startIcon)}
								endIcon={props.resolveToValue(cardContent.implementButton.endIcon)}
								size={cardContent.implementButton.size}
								href={cardContent.implementButton.href}
								target={cardContent.implementButton.target}
								onClick={() => {
									props.doPageCallback(cardContent.implementButton.onClick)
								}}
								disabled={props.resolveToValue(cardContent.implementButton.disabled)}>
								{cardContent.implementButton.text}
							</Button>
						</CardActions>
					</Card>
				</Grid>


			)}
		</Grid>
	);
}



