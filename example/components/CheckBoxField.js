import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Linking,
} from 'react-native';
import PropTypes from 'prop-types';
import Hyperlink from 'react-native-hyperlink'; 
import FontAwesomeIcon from 'react-native-vector-icons/dist/FontAwesome';

// TODO themeing
const thumbSize = 50;

const openUrl = url => Linking.canOpenURL(url)
  .then((isSupported) => {
    if (isSupported) {
      return Linking
        .openURL(url);
    }
    return Promise.reject(
      new Error(
        `Failed to open "${url}".`,
      ),
    );
  });

const styles = StyleSheet.create(
  {
    container: {
      minHeight: 40,
      flexDirection: 'row',
    },
    touchableOpacity: {
      width: 30,
      height: thumbSize,
      justifyContent: 'center',
    },
    description: {
      alignItems: 'center',
      flex: 1,
      flexDirection: 'row',
    },
    text: {
      flex: 1,
    },
    linkStyle: {
      color: '#2980b9',
    },
  },
);

const CheckBoxField =  ({ config, linkStyle, input: { onChange, value, ...restInput }, meta: { touched, error, ...restMeta}}) => {
  const {
    style,
    description,
    ...restConfig
  } = config;
  const resolvedStyle = style || styles.text;
  const resolvedDescription = description || '';
  const resolvedValue = !!value;
  const shouldUseHyperlink = (typeof resolvedDescription !== 'string') && resolvedDescription.length === 2;
  return (
    <View
      style={styles.container}
    >
      <TouchableOpacity
        style={styles.touchableOpacity}
        onPress={() => onChange(!resolvedValue)}
      >
        <FontAwesomeIcon
          size={20}
          name={resolvedValue ? 'check-square' : 'square'}
          {...restConfig}
        />
      </TouchableOpacity>
      <View
        style={styles.description}
      >
        {(shouldUseHyperlink) ? (
          <Hyperlink
            style={resolvedStyle}
            onPress={openUrl}
            linkStyle={linkStyle}
            linkText={() => resolvedDescription[1]}
          >
            <Text
              style={resolvedStyle}
            >
              {resolvedDescription[0]}
            </Text>
          </Hyperlink>
        ) : (
          <Text
            style={resolvedStyle}
          >
            {resolvedDescription}
          </Text>
        )}
      </View>
    </View>
  );
};

// TODO: implement these
CheckBoxField.propTypes = {
  linkStyle: PropTypes.shape({}),
};

CheckBoxField.defaultProps = {
  linkStyle: styles.linkStyle,
};

export default CheckBoxField;
