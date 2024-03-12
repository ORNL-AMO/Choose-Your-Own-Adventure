import { Fragment } from "react";
import { CompletedProject, ProjectControl } from "../../ProjectControl";
import Projects from "../../Projects";
import { truncate } from "../../functions-and-types";
import { TrackedStats } from "../../trackedStats";
import * as ReactPDF from '@react-pdf/renderer';
import { Button, Tooltip, TooltipProps, Typography, styled, tooltipClasses } from "@mui/material";
import React from "react";

export interface ReportPDFProps {
	yearRangeInitialStats: TrackedStats[], completedProjects: CompletedProject[]
}

export default function DownloadPDF(props: ReportPDFProps) {
	const [pdfInstance, setPdfInstance] = ReactPDF.usePDF({
		document:
			<EndGameReportPDF
				yearRangeInitialStats={props.yearRangeInitialStats}
				completedProjects={props.completedProjects}
			/>
	});

	const downloadPDF = () => {
		const link = document.createElement("a");
		link.download = `CYOS-End-of-Game.pdf`;
		link.href = pdfInstance.url;
		link.click();
	}

	return (

		<Fragment>
			{pdfInstance.loading && <div>Loading ...</div>}
			{pdfInstance.error && <div>Error generating document: {pdfInstance.error}</div>}

			<HtmlTooltip
				title={
					<Fragment>
						<Typography color="inherit">{"Get list of implemented projects with links to real-world "}<u>{'case studies'}</u></Typography>
					</Fragment>
				}
			>
				<Button
					size='medium'
					variant='contained'
					onClick={downloadPDF}
					style={{ margin: '10px', marginLeft: '2rem' }}>
					Download Projects PDF
				</Button>
			</HtmlTooltip>
		</Fragment>
	)
}


function EndGameReportPDF(props: ReportPDFProps): JSX.Element {
		let projectPDFLinks: any[] = [];
		props.completedProjects.forEach(project => {
			let implementedProject: ProjectControl = Projects[project.page];
			projectPDFLinks.push(
				<div key={implementedProject.pageId.toString()}>
					{implementedProject.caseStudy ?
						<div>
							<ReactPDF.Text style={styles.textTitle}>{implementedProject.title}
							</ReactPDF.Text>
							<ReactPDF.Text style={styles.textDesc}>{implementedProject.shortTitleRawText} </ReactPDF.Text>
							<ReactPDF.Link style={styles.link} src={implementedProject.caseStudy.url}>Case Study - {truncate(implementedProject.caseStudy.text)}</ReactPDF.Link>
						</div>
						:
						<div>
							<ReactPDF.Text style={styles.textTitle}>{implementedProject.title}</ReactPDF.Text>
							<ReactPDF.Text style={styles.textDesc}>{implementedProject.shortTitleRawText} </ReactPDF.Text>
							<ReactPDF.Text style={styles.textDesc}>No case study available </ReactPDF.Text>
						</div>
					}
					<br />
				</div>
			)
		});


	return (
		<ReactPDF.Document>
			<ReactPDF.Page style={styles.body}>
			<ReactPDF.Link style={styles.header} src={'https://cyos.ornl.gov'} fixed>cyos.ornl.gov</ReactPDF.Link>	
			<ReactPDF.Text style={styles.title}>Choose Your Own Solution</ReactPDF.Text>
      		<ReactPDF.Text style={styles.subtitle}>Energy Project Case Studies</ReactPDF.Text>
				{projectPDFLinks.map(projects => {
					return projects;
				})} 
			</ReactPDF.Page>
		</ReactPDF.Document>
		
	);
}

const HtmlTooltip = styled(({ className, ...props }: TooltipProps) => (
	<Tooltip {...props} classes={{ popper: className }} />
  ))(({ theme }) => ({
	[`& .${tooltipClasses.tooltip}`]: {
	  backgroundColor: '#f5f5f9',
	  color: 'rgba(0, 0, 0, 0.87)',
	  maxWidth: 220,
	  fontSize: theme.typography.pxToRem(12),
	  border: '1px solid #dadde9',
	},
  }));

const styles = ReactPDF.StyleSheet.create({
	body: {
	  paddingTop: 35,
	  paddingBottom: 65,
	  paddingHorizontal: 35,
	},
	title: {
	  fontSize: 24,
	  textAlign: 'center',
	  fontFamily: 'Times-Roman'
	},
	subtitle: {
	  fontSize: 12,
	  textAlign: 'center',
	  marginBottom: 40,
	},
	textTitle: {
		margin: 12,
		marginBottom: 2,
		fontSize: 16,
		textAlign: 'left',
		fontFamily: 'Times-Roman'
	},
	textDesc: {
		margin: 2,
		marginBottom: 2,
		marginLeft: 24,
		fontSize: 12,
		textAlign: 'left',
		fontFamily: 'Times-Roman'
	},
	link: {
		margin: 2,
		marginBottom: 16,
		marginLeft: 24,
		fontSize: 14,
		textAlign: 'left',
		fontFamily: 'Times-Roman'
	},
	header: {
		fontSize: 12,
		marginBottom: 20,
		textAlign: 'center',
		color: 'grey',
	},
  });
