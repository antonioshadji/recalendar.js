import { Page, Text, View, StyleSheet, Link } from '@react-pdf/renderer';
import dayjs from 'dayjs/esm';
import PropTypes from 'prop-types';
import React from 'react';
import { withTranslation } from 'react-i18next';

import { getWeekNumber } from '~/lib/date';
import {
	DATE_FORMAT as SPECIAL_DATES_DATE_FORMAT,
	findByDate,
	HOLIDAY_DAY_TYPE,
} from '~/lib/special-dates-utils';
import Header from '~/pdf/components/header';
import MiniCalendar, { HIGHLIGHT_WEEK } from '~/pdf/components/mini-calendar';
import PdfConfig from '~/pdf/config';
import { weekOverviewLink, dayPageLink } from '~/pdf/lib/links';
import { content, pageStyle } from '~/pdf/styles';

class WeekOverviewPage extends React.Component {
	styles = StyleSheet.create(
		Object.assign(
			{
				daysWrapper: {
					flexDirection: 'row',
					width: '100%',
					flexGrow: 1,
				},
todosContainer: {
	width: '50%',
	border: '1 solid black',
	marginTop: -1,
	marginLeft: -1,
	paddingHorizontal: 5,
	position: 'relative',
	flexDirection: 'column',
	justifyContent: 'flex-start',
},
				days: {
					width: '50%',
					flexDirection: 'column',
				},
				dayRow: {
					width: '100%',
					height: '14.25%',
				},
				day: {
					width: '100%',
					height: '100%',
					border: '1 solid black',
					flexDirection: 'column',
					padding: 5,
					marginTop: -1,
					marginLeft: -1,
					textDecoration: 'none',
					color: 'black',
				},
				dayDate: {
					flexDirection: 'row',
					flexGrow: 1,
					marginBottom: 2,
				},
				dayOfWeek: {
					fontSize: 12,
					fontWeight: 'bold',
				},
				shortDate: {
					fontSize: 12,
					textTransform: 'uppercase',
					marginLeft: 'auto',
				},
todo: {
	fontSize: 10,
	marginBottom: 2,
	position: 'absolute', // Position on top of notebook lines
},
notebookLine: {
	borderBottom: '0.5 solid #c0c0c0', // light grey horizontal line
	width: '100%',
	height: 14, // adjust spacing between lines
},
				specialItem: {
					fontSize: 10,
				},
			},
			{ content, page: pageStyle(this.props.config) },
		),
	);


	getNameOfWeek() {
		const { date } = this.props;
		const beginningOfWeek = date.startOf('week').format('DD MMMM');
		const endOfWeek = date.endOf('week').format('DD MMMM');
		return `${beginningOfWeek} - ${endOfWeek}`;
	}

renderNotebookLines(lineCount = 34) {
	return Array.from({ length: lineCount }).map((_, index) => (
		<View key={`line-${index}`} style={this.styles.notebookLine} />
	));
}
	renderDays() {
		const { date } = this.props;
		let currentDate = date.startOf('week');
		const endOfWeek = date.endOf('week');
		const days = [];

		while (currentDate.isBefore(endOfWeek)) {
			days.push(this.renderDay(currentDate));
			currentDate = currentDate.add(1, 'day');
		}

		return days;
	}

	renderDay(day) {
		const { config } = this.props;
		const specialDateKey = day.format(SPECIAL_DATES_DATE_FORMAT);
		const specialItems = config.specialDates.filter(findByDate(specialDateKey));

		return (
			<View key={`dayrow-${day.unix()}`} style={this.styles.dayRow}>
				<Link style={this.styles.day} src={'#' + dayPageLink(day, config)}>
					<View style={{ flexDirection: 'column' }}>
						<View style={this.styles.dayDate}>
							<Text style={this.styles.dayOfWeek}>{day.format('dddd')}</Text>
							<Text style={this.styles.shortDate}>{day.format('DD MMM')}</Text>
						</View>
						{specialItems.map(({ id, type, value }) => (
							<Text
								key={id}
								style={[
									this.styles.specialItem,
									{ fontWeight: type === HOLIDAY_DAY_TYPE ? 'bold' : 'normal' },
								]}
							>
								» {value}
							</Text>
						))}
					</View>
				</Link>
			</View>
		);
	}

renderTodosBlock() {
	const { todos } = this.props.config;

	return (
		<View style={this.styles.todosContainer}>
			{/* Render notebook lines first */}
			{this.renderNotebookLines(34)}

			{/* Render TODOs using positioned text */}
			{todos.map((todo, index) => (
				<Text
					key={todo.id}
					style={[
						this.styles.todo,
						{ top: index * 14 + 2 }, // Align each TODO with a notebook line
					]}
				>
					{todo.value}
				</Text>
			))}
		</View>
	);
}
	renderTodos() {
		return (
			<View key={'todos'} style={this.styles.todos}>
				{this.props.config.todos.map(({ id, value }) => (
					<Text key={id} style={this.styles.todo}>
						{value}
					</Text>
				))}
			</View>
		);
	}

	render() {
		const { t, date, config } = this.props;
		return (
			<Page
				id={weekOverviewLink(date, config)}
				size={config.pageSize}
				dpi={config.dpi}
			>
				<View style={this.styles.page}>
					<Header
						isLeftHanded={config.isLeftHanded}
						title={t('page.week.title')}
						subtitle={this.getNameOfWeek()}
						number={getWeekNumber(date).toString()}
						previousLink={
							'#' + weekOverviewLink(date.subtract(1, 'week'), config)
						}
						nextLink={'#' + weekOverviewLink(date.add(1, 'week'), config)}
						calendar={
							<MiniCalendar
								date={date}
								highlightMode={HIGHLIGHT_WEEK}
								config={config}
							/>
						}
					/>

					{/* Row layout: left = todos, right = days */}
					<View style={this.styles.daysWrapper}>
						{this.renderTodosBlock()}
						<View style={this.styles.days}>{this.renderDays()}</View>
					</View>
				</View>
			</Page>
		);
	}
}

WeekOverviewPage.propTypes = {
	config: PropTypes.instanceOf(PdfConfig).isRequired,
	date: PropTypes.instanceOf(dayjs).isRequired,
	t: PropTypes.func.isRequired,
};

export default withTranslation('pdf')(WeekOverviewPage);
