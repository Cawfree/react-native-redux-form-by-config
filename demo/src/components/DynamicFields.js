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

import { withTheme } from '../theme';

import DefaultFieldWrapper from './DefaultFieldWrapper';
import DefaultGrouping from './DefaultGrouping';
import DefaultLabel from './DefaultLabel';

import defaultTransform from '../transform';

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
    return key === undefined;
  }
  return false;
};

export const isField = (config = {}) => {
  const { key } = config;
  // XXX: These *do* need a type attribute, but in the interest
  //      of failing safely, missing specifications will return
  //      with a warning.
  return !isNested(config) && key !== undefined;
};

export const isConfig = (config = {}) => {
  return isField(config) || isNested(config);
};

// XXX: Returns the keys of nested forms within the config that are capable of supplying
//      a value. 
export const getDescendents = (config = [], directOnly = false, keyPfx = '') => {
  return config
    .reduce(
      (keys, e) => {
        const nested = isNested(e);
        const field = isField(e);
        if (nested) {
          const { forms } = e;
          const grouping = isGrouping(e);
          if (grouping) {
            return [
              ...keys,
              ...(
                (!directOnly) ? (
                  getDescendents(
                    forms,
                    directOnly,
                    keyPfx,
                  )
                ) : (
                  []
                )
              ),
            ];
          }
          const { key } = e;
          return [
            ...keys,
            ...getDescendents(
              forms,
              directOnly,
              `${keyPfx}${key}.`,
            ),
          ];
        }
        const { key } = e;
        return [
          ...keys,
          `${keyPfx}${key}`,
        ];
      },
      [],
    );
};

function evaluateToJsx (
  config = [],
  theme = {},
  FieldWrapper = DefaultFieldWrapper,
  GroupingComponent,
  LabelComponent,
  validation = {},
  types = {},
  formValueSelector,
  keyPfx = '',
) {
  return config
    .reduce(
      (children, e) => {
        const nested = isNested(e);
        const field = isField(e);
        if (nested) {
          const {
            forms,
          } = e;
          const grouping = isGrouping(e);
          if (grouping) {
            // TODO: Missing index (position of group) and getValuesFor
            // XXX: must be scoped
            return [
              ...children,
              <GroupingComponent
                LabelComponent={LabelComponent}
                getDescendents={() => getDescendents(forms, true, keyPfx)}
                formValueSelector={formValueSelector}
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
                  formValueSelector,
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
                style={theme.groupLabelStyle}
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
              formValueSelector,
              `${keyPfx}${key}.`,
            ),
          ]
            .filter(e => !!e);
        }
        const {
          value,
          ...safeConfig
        } = e;
        const { key, type, label, labelHidden } = e;
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
          <>
            {(!!label && !labelHidden) && (
              <LabelComponent
                label={label}
                style={theme.labelStyle}
              />
            )}
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
            />
          </>,
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
      formValueSelector,
    );
    this.state = {
      children,
    };
  }
  componentDidMount() {
    const {
      handleSubmit,
      onHandleSubmit,
      transform,
    } = this.props;
    if (onHandleSubmit) {
      onHandleSubmit(
        () => Promise
          .resolve()
          .then(
            () => new Promise((resolve, reject) => handleSubmit(resolve)().catch(reject)),
          )
          .catch(
            e => Promise
              .reject(
                new Error(
                  'Form did not satisfy validation',
                ),
              ),
          )
          .then(transform),
      );
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
  transform: PropTypes.func,
};

DynamicFields.defaultProps = {
  theme: undefined,
  disabled: false,
  LayoutComponent: ({ children }) => (
    <View
    >
      {children}
    </View>
  ),
  FieldWrapper: DefaultFieldWrapper,
  GroupingComponent: DefaultGrouping,
  grouping: [],
  LabelComponent: DefaultLabel,
  transform: defaultTransform,
};

export default withTheme(
  DynamicFields,
);
