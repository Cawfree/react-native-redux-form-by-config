import React from 'react';
import {
  View,
  StyleSheet,
  Text,
} from 'react-native';
import FontAwesomeIcon from 'react-native-vector-icons/dist/FontAwesome';
import Collapsible from '@cawfree/react-native-collapsible-view';

import { withTheme } from '../theme';

const styles = StyleSheet
  .create(
    {
      defaultField: {
        flex: 1,
      },
      defaultBoolean: {
        flex: 1,
      },
      defaultErrorIcon: {
        alignItems: 'center',
        justifyContent: 'center',
      },
      defaultText: {
        flex: 1,
        flexDirection: 'row',
        backgroundColor: 'white',
        alignItems: 'center',
      },
      defaultError: {
        flex: 1,
      },
      errorText: {
        flex: 1,
      },
    },
  );

const DefaultFieldWrapper = withTheme(
  ({ theme, meta, config, children, ...extraProps }) => {
    const { type } = config;
    const {
      error,
      touched,
    } = meta;
    const {
      borderRadius,
      marginShort,
      marginExtraShort,
      minFieldHeight,
    } = theme;
    const shouldShowError = !!(touched && error);
    return (
      <View
        style={styles.defaultField}
      >
        {(type === 'boolean') && (
          <View
            style={[
              styles.defaultBoolean,
            ]}
          >
            {children}
          </View>
        )}
        {(type !== 'boolean') && (
          <View
            style={[
              styles.defaultText,
              {
                borderRadius,
              },
            ]}
          >
            <View
              style={[
                {
                  flex: 1,
                  paddingLeft: marginExtraShort,
                },
              ]}
            >
              {children}
            </View>
            <View
              style={[
                styles.defaultErrorIcon,
                {
                  width: minFieldHeight,
                  height: minFieldHeight,
                  opacity: shouldShowError ? 1 : 0,
                },
              ]}
            >
              <FontAwesomeIcon
                name="exclamation-triangle"
                size={20}
                color="lightgrey"
              />
            </View>
          </View>
        )}
        <View
          style={[
            styles.defaultError,
            {
              paddingBottom: marginShort,
            },
          ]}
        >
          <Collapsible
            collapsed={!shouldShowError}
          >
            <Text
              style={{
                ...theme.errorStyle,
                marginTop: marginExtraShort,
                flex: 1,
                textAlign: 'right',
              }}
            >
              {error}
            </Text>
          </Collapsible>
        </View>
      </View>
    );
  },
);

export default DefaultFieldWrapper;