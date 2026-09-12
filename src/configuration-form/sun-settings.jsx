import dayjs from 'dayjs/esm';
import PropTypes from 'prop-types';
import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import Row from 'react-bootstrap/Row';
import { withTranslation } from 'react-i18next';

import { getSunTimes } from '~/lib/sun';
import ToggleAccordionItem from './toggle-accordion-item';

class SunSettings extends React.PureComponent {
  state = {
    geoError: null,
  };

  handleDetectLocation = () => {
    const { onMultipleFieldsChange, t } = this.props;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      this.setState({ geoError: t('configuration.sun.location-error') });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        this.setState({ geoError: null });
        const browserTz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || '';
        onMultipleFieldsChange({
          latitude: Number(position.coords.latitude.toFixed(4)),
          longitude: Number(position.coords.longitude.toFixed(4)),
          timezone: browserTz,
        });
      },
      () => {
        this.setState({ geoError: t('configuration.sun.location-error') });
      },
      { timeout: 10000 },
    );
  };

  render() {
    const { isSunriseSunsetEnabled, latitude, longitude, timezone, timeFormat, onChange, onToggle, t } = this.props;
    const { geoError } = this.state;

    const detectedTz = (typeof Intl !== 'undefined' && Intl.DateTimeFormat().resolvedOptions().timeZone) || 'UTC';
    const activeTz = timezone || detectedTz;

    const previewTimes = getSunTimes(dayjs(), {
      latitude,
      longitude,
      timezone: activeTz,
      timeFormat,
    });

    return (
      <ToggleAccordionItem
        id="isSunriseSunsetEnabled"
        title={t('configuration.sun.title')}
        toggledOn={isSunriseSunsetEnabled}
        onToggle={onToggle}
      >
        <p className="mb-3 text-muted">{t('configuration.sun.description')}</p>

        {geoError && (
          <Alert variant="warning" dismissible onClose={() => this.setState({ geoError: null })}>
            {geoError}
          </Alert>
        )}

        <Button
          variant="outline-primary"
          size="sm"
          className="mb-3 align-self-start"
          onClick={this.handleDetectLocation}
        >
          {t('configuration.sun.use-location')}
        </Button>

        <Row className="mb-3">
          <Col sm={6}>
            <Form.Group controlId="latitude">
              <Form.Label>{t('configuration.sun.latitude')}</Form.Label>
              <Form.Control type="number" step="any" value={latitude} onChange={onChange} data-type="number" />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group controlId="longitude">
              <Form.Label>{t('configuration.sun.longitude')}</Form.Label>
              <Form.Control type="number" step="any" value={longitude} onChange={onChange} data-type="number" />
            </Form.Group>
          </Col>
        </Row>

        <Row className="mb-3">
          <Col sm={6}>
            <Form.Group controlId="timezone">
              <Form.Label>{t('configuration.sun.timezone')}</Form.Label>
              <Form.Control type="text" value={timezone} placeholder={detectedTz} onChange={onChange} />
            </Form.Group>
          </Col>
          <Col sm={6}>
            <Form.Group controlId="timeFormat">
              <Form.Label>{t('configuration.sun.time-format')}</Form.Label>
              <Form.Select value={timeFormat || '24h'} onChange={onChange}>
                <option value="24h">{t('configuration.sun.format-24h')}</option>
                <option value="12h">{t('configuration.sun.format-12h')}</option>
              </Form.Select>
            </Form.Group>
          </Col>
        </Row>

        {previewTimes && (
          <div className="text-muted small mt-1">
            {previewTimes.alwaysUp && 'Today: Midnight Sun'}
            {previewTimes.alwaysDown && 'Today: Polar Night'}
            {previewTimes.sunrise && previewTimes.sunset && (
              <>
                Today: ↑ {previewTimes.sunrise} &nbsp;&nbsp; ↓ {previewTimes.sunset}
              </>
            )}
          </div>
        )}
      </ToggleAccordionItem>
    );
  }
}

SunSettings.propTypes = {
  isSunriseSunsetEnabled: PropTypes.bool.isRequired,
  latitude: PropTypes.number.isRequired,
  longitude: PropTypes.number.isRequired,
  timezone: PropTypes.string.isRequired,
  timeFormat: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onToggle: PropTypes.func.isRequired,
  onMultipleFieldsChange: PropTypes.func.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation('app')(SunSettings);
