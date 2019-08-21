import React from 'react';
import PropTypes from 'prop-types';
import {
  Text,
  View,
  StyleSheet,
} from 'react-native';
import { Map } from 'immutable';
import { Field } from 'redux-form/immutable';
import { isEqual } from 'lodash';
import uuidv4 from 'uuid/v4';

import { withTheme } from './../theme';

import DefaultFieldWrapper from './DefaultFieldWrapper';
import DefaultGrouping from './DefaultGrouping';
import DefaultLabel from './DefaultLabel';

const styles = StyleSheet
  .create(
    {
      defaultLayout: {
        flex: 1,
        flexDirection: 'column',
      },
    },
  );

export const isNested = (config = {}) => {
  const { type, forms } = config;
  return (!type) && forms;
};

// XXX: A specialized yt
export const isGrouping = (config = {}) => {
  if (isNested(config)) {
    const { key } = config;
    return !key;
  }
  return false;
};

export const isField = (config = {}) => {
  const { key } = config;
  // XXX: These *do* need a type attribute, but in the interest
  //      of failing safely, missing specifications will return
  //      with a warning.
  return !isNested(config) && !!key;
};

export const isConfig = (config = {}) => {
  return isField(config) || isNested(config);
};

function evaluateToJsx (
  config = [],
  theme = {},
  FieldWrapper = DefaultFieldWrapper,
  GroupingComponent,
  LabelComponent,
  validation = {},
  types = {},
  keyPfx = '',
) {
  return config
    .reduce(
      (children, e) => {
        const nested = isNested(e);
        const field = isField(e);
        if (nested) {
          const { forms } = e;
          const grouping = isGrouping(e);
          if (grouping) {
            // TODO: Missing index (position of group) and getValuesFor
            return [
              ...children,
              <GroupingComponent
                {...e}
              >
                {evaluateToJsx(
                  forms,
                  theme,
                  FieldWrapper,
                  GroupingComponent,
                  LabelComponent,
                  validation,
                  types,
                  keyPfx,
                )}
              </GroupingComponent>
            ];
          }
          const { key, label } = e;
          return [
            ...children,
            (!!label) && (
              <LabelComponent
                label={label}
              />
            ),
            ...evaluateToJsx(
              forms,
              theme,
              FieldWrapper,
              GroupingComponent,
              LabelComponent,
              validation,
              types,
              `${keyPfx}${key}.`,
            ),
          ]
            .filter(e => !!e);
        }
        // XXX: It must be a field.
        const {
          value,
          ...safeConfig
        } = e;
        const { key, type } = e;
        const validate = (validation[type] || (() => []))(e);
        const FieldImpl = types[type];
        const sfx = `${keyPfx}${key}`;
        if (!FieldImpl) {
          console.warn(
            `Unrecognized field type ${type}!`,
          );
          return children;
        }
        return [
          ...children,
          <Field
            key={sfx}
            name={sfx}
            component={({ meta, ...extraProps }) => (
              <FieldWrapper
                {...extraProps}
                meta={meta}
                theme={theme}
                config={safeConfig}
              >
                {FieldImpl}
              </FieldWrapper>
            )}
            validate={validate}
          />,
        ];
      },
      [],
    );
};

class DynamicFields extends React.Component {
  constructor(nextProps) {
    super(nextProps);
    const {
      config,
      disabled,
      types,
      validation,
      theme,
      FieldWrapper,
      LayoutComponent,
      GroupingComponent,
      LabelComponent,
      formValueSelector,
      getFormValues,
    } = nextProps;
    const children = evaluateToJsx(
      config,
      theme,
      FieldWrapper,
      GroupingComponent,
      LabelComponent,
      validation,
      types,
    );
    this.state = {
      children,
    };
  }
  componentDidMount() {
    const {
      handleSubmit,
      onHandleSubmit,
    } = this.props;
    if (onHandleSubmit) {
      onHandleSubmit(handleSubmit);
    }
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      formSyncErrors,
      onHandleFormSyncErrors,
    } = nextProps;
    const syncErrorsChanged = !isEqual(
      formSyncErrors,
      this.props.formSyncErrors,
    );
    if (syncErrorsChanged && onHandleFormSyncErrors) {
      onHandleFormSyncErrors(
        formSyncErrors,
      );
    }
  }
  render() {
    const {
      LayoutComponent,
      theme,
      formValueSelector,
      ...extraProps
    } = this.props;
    const { children } = this.state;
    return (
      <LayoutComponent
        {...extraProps}
      >
        {children}
      </LayoutComponent>
    );
  }
}

DynamicFields.propTypes = {
  theme: PropTypes.shape({}),
  LayoutComponent: PropTypes.func,
  disabled: PropTypes.bool,
  FieldWrapper: PropTypes.func,
  GroupingComponent: PropTypes.func,
  grouping: PropTypes.arrayOf(
    PropTypes.shape(
      {
        keys: PropTypes.arrayOf(
          PropTypes.string,
        ),
      },
    ),
  ),
};

DynamicFields.defaultProps = {
  theme: undefined,
  disabled: false,
  LayoutComponent: ({ children }) => (
    <View
      style={styles.defaultLayout}
    >
      {children}
    </View>
  ),
  FieldWrapper: DefaultFieldWrapper,
  GroupingComponent: DefaultGrouping,
  grouping: [],
  LabelComponent: DefaultLabel,
};

export default withTheme(
  DynamicFields,
);
