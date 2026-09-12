import { Link, StyleSheet, Text, View } from '@react-pdf/renderer';
import PropTypes from 'prop-types';
import React from 'react';

class Header extends React.PureComponent {
  constructor(props) {
    super(props);

    const stylesObject = {
      header: {
        flexGrow: 0,
        flexDirection: 'row',
      },
      meta: {
        flexGrow: 1,
        flexDirection: 'column',
        borderRight: '1 solid black',
      },
      dateMain: {
        flexDirection: 'row',
        marginLeft: 'auto',
      },
      dateInfo: {
        flex: 1,
        flexDirection: 'row',
        paddingRight: 5,
      },
      subtitle: {
        textTransform: 'uppercase',
        textAlign: 'right',
        margin: '0 5',
        fontSize: props.subtitleSize,
      },
      daySubtitleWrapper: {
        marginLeft: 'auto',
        alignItems: 'flex-end',
        justifyContent: 'center',
      },
      sunTimes: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
        margin: '2 5 0 5',
      },
      sunTimeItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginLeft: 8,
      },
      sunTimeArrow: {
        fontSize: 8,
        color: '#555',
        marginRight: 2,
      },
      sunTimeText: {
        fontSize: 8.5,
        color: '#333',
      },
      title: {
        textTransform: 'uppercase',
        textDecoration: 'none',
        justifyContent: 'center',
        textAlign: 'right',
        color: 'black',
        padding: '10 5',
        fontSize: props.titleSize,
        maxWidth: 165,
      },
      arrow: {
        color: '#AAA',
        textDecoration: 'none',
        justifyContent: 'center',
        padding: '10 5',
        fontSize: 20,
      },
      dayNumber: {
        fontSize: 55,
        fontWeight: 'bold',
        marginBottom: -5,
      },
      specialItems: {
        flexDirection: 'column',
        width: 130,
      },
      specialItem: {
        fontSize: 10,
        marginLeft: 5,
        fontStyle: 'italic',
      },
    };

    if (this.props.isLeftHanded) {
      stylesObject.header.flexDirection = 'row-reverse';

      stylesObject.meta.borderLeft = stylesObject.meta.borderRight;
      stylesObject.meta.borderRight = 'none';

      delete stylesObject.dateMain.marginLeft;
      delete stylesObject.daySubtitleWrapper.marginLeft;

      stylesObject.dateInfo.flexDirection = 'row-reverse';
      stylesObject.daySubtitleWrapper.alignItems = 'flex-start';
      stylesObject.subtitle.textAlign = 'left';
      stylesObject.sunTimes.justifyContent = 'flex-start';
      stylesObject.sunTimeItem.marginLeft = 0;
      stylesObject.sunTimeItem.marginRight = 8;
    }

    this.styles = StyleSheet.create(stylesObject);
  }

  renderSpecialItems() {
    if (!this.props.specialItems) {
      return null;
    }

    return (
      <View style={this.styles.specialItems}>
        {this.props.specialItems.map(({ id, value }) => (
          <Text key={id} style={this.styles.specialItem}>
            » {value}
          </Text>
        ))}
      </View>
    );
  }

  renderSunTimes() {
    const { sunTimes } = this.props;
    if (!sunTimes) {
      return null;
    }

    if (sunTimes.alwaysUp) {
      return (
        <View style={this.styles.sunTimes}>
          <Text style={this.styles.sunTimeText}>Midnight Sun</Text>
        </View>
      );
    }

    if (sunTimes.alwaysDown) {
      return (
        <View style={this.styles.sunTimes}>
          <Text style={this.styles.sunTimeText}>Polar Night</Text>
        </View>
      );
    }

    if (!sunTimes.sunrise && !sunTimes.sunset) {
      return null;
    }

    return (
      <View style={this.styles.sunTimes}>
        {sunTimes.sunrise && (
          <View style={this.styles.sunTimeItem}>
            <Text style={this.styles.sunTimeArrow}>↑</Text>
            <Text style={this.styles.sunTimeText}>{sunTimes.sunrise}</Text>
          </View>
        )}
        {sunTimes.sunset && (
          <View style={this.styles.sunTimeItem}>
            <Text style={this.styles.sunTimeArrow}>↓</Text>
            <Text style={this.styles.sunTimeText}>{sunTimes.sunset}</Text>
          </View>
        )}
      </View>
    );
  }

  render() {
    const { calendar, id, nextLink, number, previousLink, subtitle, title, titleLink } = this.props;

    return (
      <View id={id} style={this.styles.header}>
        <View style={this.styles.meta}>
          <View style={this.styles.dateMain}>
            <Link src={titleLink} style={this.styles.title}>
              {title}
            </Link>
            <Link src={previousLink} style={this.styles.arrow}>
              «
            </Link>
            <Text style={this.styles.dayNumber}>{number}</Text>
            <Link src={nextLink} style={this.styles.arrow}>
              »
            </Link>
          </View>
          <View style={this.styles.dateInfo}>
            {this.renderSpecialItems()}
            <View style={this.styles.daySubtitleWrapper}>
              <Text style={this.styles.subtitle}>{subtitle}</Text>
              {this.renderSunTimes()}
            </View>
          </View>
        </View>
        {calendar}
      </View>
    );
  }
}

Header.defaultProps = {
  titleSize: 20,
  subtitleSize: 20,
};

Header.propTypes = {
  id: PropTypes.string,
  children: PropTypes.node,
  calendar: PropTypes.node.isRequired,
  isLeftHanded: PropTypes.bool.isRequired,
  number: PropTypes.string.isRequired,
  specialItems: PropTypes.array,
  subtitle: PropTypes.string.isRequired,
  subtitleSize: PropTypes.number,
  sunTimes: PropTypes.shape({
    sunrise: PropTypes.string,
    sunset: PropTypes.string,
    alwaysUp: PropTypes.bool,
    alwaysDown: PropTypes.bool,
  }),
  title: PropTypes.string.isRequired,
  titleLink: PropTypes.string,
  titleSize: PropTypes.number,
  previousLink: PropTypes.string.isRequired,
  nextLink: PropTypes.string.isRequired,
};

export default Header;
