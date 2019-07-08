import React from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  Platform,
} from 'react-native';
import PropTypes from 'prop-types';

const styles = StyleSheet.create(
  {
    container: {
      flexDirection: 'row',
      flex: Platform.OS === 'web' ? 1 : undefined,
      paddingLeft: Platform.OS === 'web' ? 5 : undefined,
    },
    textInput: {
      fontSize: 16,
      flex: 1,
    },
  },
);

class TextInputField extends React.Component {
  render() {
    const { config, theme, disabled, input: { onChange, value, ...restInput }, meta: { touched, error, ...restMeta} } = this.props;
    const {
      style,
      numberOfLines,
      placeholder,
      Component,
      ...restConfig
    } = config;
    const {
      thumbSize,
    } = theme;
    const resolvedStyle = {
      ...(style || styles.textInput),
    };
    const resolvedNumberOfLines = numberOfLines || 1;
    const resolvedMultiline = resolvedNumberOfLines > 1;
    const resolvedPlaceholder = placeholder || '';
    const resolvedValue = value|| '';
    const ResolvedComponent = Component || TextInput;
    return (
      <View
        style={styles.container}
      >
        <ResolvedComponent
          value={resolvedValue}
          onChangeText={onChange}
          editable={!disabled}
          underlineColorAndroid="transparent"
          style={resolvedStyle}
          numberOfLines={resolvedNumberOfLines}
          multiline={resolvedMultiline}
          placeholder={resolvedPlaceholder}
          {...restConfig}
        />
      </View>
    );
  }
}

TextInputField.propTypes = {

};

TextInputField.defaultProps = {

};

export default TextInputField;