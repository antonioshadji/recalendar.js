import dayjs from 'dayjs/esm';
import { t } from 'i18next';

import { getPageProperties, getPageSizeInPoints, REMARKABLE } from '~/lib/device-utils';
import { wrapWithId } from '~/lib/id-utils';
import { ITINERARY_ITEM, ITINERARY_LINES } from '~/lib/itinerary-utils';
import {
  AUTOMATIC_SPACING,
  DEFAULT_LINE_HEIGHT_PIXELS,
  DEFAULT_LINE_OPACITY,
  LINED,
  normalizeLineStyle,
} from '~/lib/line-styles';
import { SIDEBAR_LEFT } from '~/lib/sidebar-utils';
import { getSeasonEvents } from '~/lib/sun';
import { LATO } from '~/pdf/lib/fonts';

const CONFIG_FIELDS = [
  'device',
  'dpi',
  'pageSize',
  'fontFamily',
  'year',
  'month',
  'firstDayOfWeek',
  'monthCount',
  'weekendDays',
  'isLeftHanded',
  'sidebarPosition',
  'sidebarOffset',
  'isSunriseSunsetEnabled',
  'latitude',
  'longitude',
  'timezone',
  'timeFormat',
  'isYearNotesEnabled',
  'yearNotesItinerary',
  'isMonthOverviewEnabled',
  'habits',
  'monthItinerary',
  'isWeekOverviewEnabled',
  'todos',
  'dayItineraries',
  'isWeekRetrospectiveEnabled',
  'weekRetrospectiveItinerary',
  'specialDates',
  'lineStyle',
  'lineHeightPixels',
  'lineSpacingPixels',
  'lineOpacity',
];

export { DEFAULT_LINE_HEIGHT_PIXELS };

export const CONFIG_FILE = 'config.json';
export const CONFIG_VERSION_1 = 'v1';
export const CONFIG_VERSION_2 = 'v2';
export const CONFIG_VERSION_3 = 'v3';
export const CONFIG_VERSION_4 = 'v4';
export const CONFIG_CURRENT_VERSION = CONFIG_VERSION_4;

export function hydrateFromObject(object) {
  return Object.fromEntries(
    CONFIG_FIELDS.filter((field) => object[field] !== undefined).map((field) => [field, object[field]]),
  );
}

class PdfConfig {
  constructor(configOverrides = {}) {
    this.year = 2027;
    this.month = 0;
    this.firstDayOfWeek = dayjs.localeData().firstDayOfWeek();
    this.weekendDays = [0, 6];
    this.isLeftHanded = false;
    this.sidebarPosition = SIDEBAR_LEFT;
    this.sidebarOffset = 0;
    this.monthCount = 12;
    this.fontFamily = LATO;
    this.isSunriseSunsetEnabled = true;
    this.latitude = 0;
    this.longitude = 0;
    this.timezone = '';
    this.timeFormat = '24h';
    this.isYearNotesEnabled = true;
    this.yearNotesItinerary = [
      {
        type: ITINERARY_LINES,
        value: 50,
      },
    ];
    this.isMonthOverviewEnabled = true;
    this.habits = [
      t('habits.habit1', { ns: 'config' }),
      t('habits.habit2', { ns: 'config' }),
      t('habits.habit3', { ns: 'config' }),
      t('habits.habit4', { ns: 'config' }),
      t('habits.habit5', { ns: 'config' }),
    ];
    this.monthItinerary = [
      {
        type: ITINERARY_ITEM,
        value: t('month.goal', { ns: 'config' }),
      },
      {
        type: ITINERARY_LINES,
        value: 4,
      },
      {
        type: ITINERARY_ITEM,
        value: t('month.notes', { ns: 'config' }),
      },
      {
        type: ITINERARY_LINES,
        value: 50,
      },
    ];
    this.isWeekOverviewEnabled = true;
    this.todos = [
      t('todos.example1', { ns: 'config' }),
      t('todos.example2', { ns: 'config' }),
      t('todos.example3', { ns: 'config' }),
    ];

    let dayOfWeek = this.firstDayOfWeek;
    this.dayItineraries = [...Array(7).keys()].map(() => {
      const itinerary = {
        dayOfWeek,
        items: [{ type: ITINERARY_LINES, value: 50 }],
        isEnabled: true,
      };
      dayOfWeek = ++dayOfWeek % 7;
      return itinerary;
    });
    this.isWeekRetrospectiveEnabled = true;
    this.weekRetrospectiveItinerary = [
      {
        type: ITINERARY_ITEM,
        value: t('retrospective.question1', { ns: 'config' }),
      },
      {
        type: ITINERARY_ITEM,
        value: t('retrospective.question2', { ns: 'config' }),
      },
      {
        type: ITINERARY_LINES,
        value: 50,
      },
    ];
    this.device = REMARKABLE;
    const { dpi, pageSize } = getPageProperties(this.device);
    this.dpi = dpi;
    this.pageSize = pageSize;
    this.specialDates = getSeasonEvents(this.year, this.timezone);
    this.lineStyle = LINED;
    this.lineHeightPixels = DEFAULT_LINE_HEIGHT_PIXELS;
    this.lineSpacingPixels = AUTOMATIC_SPACING;
    this.lineOpacity = DEFAULT_LINE_OPACITY;

    if (Object.keys(configOverrides).length !== 0) {
      Object.assign(this, configOverrides);
      if (!configOverrides.specialDates) {
        this.specialDates = getSeasonEvents(this.year, this.timezone);
      }
    }

    this.lineStyle = normalizeLineStyle(this.lineStyle);

    this.ensureUniqueIds();
  }

  get pointSize() {
    return getPageSizeInPoints(this);
  }

  ensureUniqueIds() {
    const fieldsRequiringUniqueIds = [
      'habits',
      'monthItinerary',
      'specialDates',
      'todos',
      'weekRetrospectiveItinerary',
      'yearNotesItinerary',
    ];

    fieldsRequiringUniqueIds.forEach((field) => {
      const thisField = this[field];
      this[field] = thisField.map(wrapWithId);
    });

    this.dayItineraries = this.dayItineraries.map((dayItinerary) => {
      dayItinerary.items = dayItinerary.items.map(wrapWithId);
      return dayItinerary;
    });
  }
}

export default PdfConfig;
