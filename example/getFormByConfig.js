import React from 'react';
import {
  Linking,
  Animated,
  Alert,
  View,
  Text,
  TextInput,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import PropTypes from 'prop-types';
import Collapsible from 'react-native-collapsible';
import FontAwesomeIcon from 'react-native-vector-icons/dist/FontAwesome';
import Hyperlink from 'react-native-hyperlink'; 
// TODO: Make this configurable at the invocation level.
import {
  Field,
  reduxForm,
  getFormSyncErrors,
} from 'redux-form/immutable';
import { connect } from 'react-redux';
import isEqual from 'lodash.isequal';

const marginStandard = 15;
const marginShort = 10;
const marginExtraShort = 5;
const thumbSize = 50;

const styles = StyleSheet.create({
  error: {
    height: 25,
    color: '#FF0000FF',
  },
  fieldContainer: {
    borderRadius: marginShort,
    overflow: 'hidden',
    flexDirection: 'row',
  },
  fieldErrorCaption: {
    height: 30,
    flexDirection: 'row',
  },
  fieldErrorContainer: {
    width: thumbSize,
    height: thumbSize,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fieldErrorCaptionContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  textInput: {
    minHeight: 40,
    fontSize: 16,
    flex: 1,
  },
  row: {
    justifyContent: 'center',
    flex:1,
    flexDirection: 'row',
  },
  checkBoxContainer: {
    width: 30,
    height: thumbSize,
    justifyContent: 'center',
  },
  checkBoxDescription: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
  },
  checkBoxText: {
    flex: 1,
  },
  linkStyle: {
    color: '#2980b9',
  },
});

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


class FieldContainer extends React.Component {
  render() {
    const {
      backgroundColor,
      children,
      touched,
      error,
      renderFieldError,
      collapsed,
      ...extraProps
    } = this.props;
    const shouldShowError = (!!touched && !!error);
    const shouldRenderFieldError = !!renderFieldError;
    return (
      <View
        style={{
          minHeight: 40,
        }}
      >
        <View
          style={[
            styles.fieldContainer,
            {
              backgroundColor,
              flexDirection: 'row',
            },
          ]}
        >
          <View
            style={{
              flex: 1,
            }}
          >
            {children}
          </View>
          {(shouldRenderFieldError) && (
            <View
              style={styles.fieldErrorContainer}
            >
              {(!!touched && !!error) && (
                renderFieldError()
              )}
            </View>
          )}
        </View>
        <Collapsible
          collapsed={!!shouldShowError}
        >
          <View
            style={{ height: marginShort }}
          />
        </Collapsible>
        <Collapsible
          collapsed={!shouldShowError}
        >
          <View
            style={[
              styles.fieldErrorCaption,
              {
                flex: 1,
              },
            ]}
          >
            <View
              style={[
                styles.fieldErrorCaptionContainer,
                {
                  flex: 1,
                },
              ]}
            >
              <Text
                style={styles.error}
              >
                {error}
              </Text>
            </View>
          </View>
        </Collapsible>
      </View>
    );
  }
}

const renderTextInput = (config, renderFieldError, linkStyle) => ({ input: { onChange, value, ...restInput }, meta: { touched, error, ...restMeta}}) => {
  const {
    style,
    numberOfLines,
    placeholder,
    collapsed,
    ...restConfig
  } = config;
  const resolvedStyle = style || styles.textInput;
  const resolvedNumberOfLines = numberOfLines || 1;
  const resolvedMultiline = resolvedNumberOfLines > 1;
  const resolvedPlaceholder = placeholder || '';
  return (
    <FieldContainer
      collapsed={collapsed}
      backgroundColor="#FFFFFFFF"
      touched={touched}
      error={error}
      renderFieldError={renderFieldError}
    >
      <View
        style={styles.row}
      >
        <TextInput
          value={value}
          onChangeText={onChange}
          underlineColorAndroid="transparent"
          style={resolvedStyle}
          numberOfLines={resolvedNumberOfLines}
          multiline={resolvedMultiline}
          placeholder={resolvedPlaceholder}
          {...restConfig}
        />
      </View>
    </FieldContainer>
  );
};

const renderBooleanInput = (config, renderFieldError, linkStyle) => ({ input: { onChange, value, ...restInput }, meta: { touched, error, ...restMeta}}) => {
  const {
    collapsed,
    style,
    description,
    ...restConfig
  } = config;
  const resolvedStyle = style || styles.checkBoxText;
  const resolvedDescription = description || '';
  const resolvedValue = !!value;
  const shouldUseHyperlink = (typeof resolvedDescription !== 'string') && resolvedDescription.length === 2;
  return (
    <FieldContainer
      collapsed={collapsed}
      backgroundColor="transparent"
      touched={touched}
      error={error}
      renderFieldError={null}
    >
      <View
        style={{
          minHeight: 40,
          flexDirection: 'row',
        }}
      >
        <TouchableOpacity
          style={styles.checkBoxContainer}
          onPress={() => onChange(!resolvedValue)}
        >
          <FontAwesomeIcon
            size={20}
            name={resolvedValue ? 'check-square' : 'square'}
            {...restConfig}
          />
        </TouchableOpacity>
        <View
          style={styles.checkBoxDescription}
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
    </FieldContainer>
  );
};


const isRequired = label => value => value ? undefined : `${label} is required.`;

const maxLength = (label, max) => value =>
    value && value.length > max ? `${label} must be ${max} characters or less.` : undefined;

const minLength = (label, min) => value =>
    value && value.length < min ? `${label} must be ${min} characters or more.` : undefined;

const isEmail = value =>
    value && !/^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i.test(value) ?
      'This E-Mail Address doesn\'t look right.' : undefined

const getValidationByConfig = (config) => {
  const {
    type,
    label,
    required,
  } = config;
  if (type === 'text') {
    const {
      min,
      max,
      textContentType,
    } = config;
    return ([
      required && isRequired(label),
      max && maxLength(label, max),
      min && minLength(label, min),
      textContentType === 'emailAddress' && isEmail,
    ])
      .filter(e => !!e);
  } else if (type === 'boolean') {
    return [
      required && isRequired(label),
    ]
      .filter(e => !!e);
  }
  return [];
};

const getComponentByConfig = (config, renderFieldError, linkStyle) => {
  const {
    type,
    // XXX: Use restConfig to limit the scope of props that propagate
    //      down the the actual element.
    ...restConfig
  } = config;
  if (type === 'text') {
    return renderTextInput(
      restConfig,
      renderFieldError,
      linkStyle,
    );
  } else if (type === 'boolean') {
    return renderBooleanInput(
      restConfig,
      renderFieldError,
      linkStyle,
    );
  }
};

class DynamicFields extends React.Component {
  static propTypes = {
    renderFieldError: PropTypes.func,
  }
  static defaultProps = {
    // TODO: Should delegate useful props for custom validation rules.
    renderFieldError: () => (
      <FontAwesomeIcon
        name="exclamation-triangle"
        size={17}
        color="lightgrey"
      />
    ),
  }
  constructor(nextProps) {
    super(nextProps);
    const {
      renderFieldError,
      linkStyle,
      config,
    } = nextProps;
    const cleanConfig = config
      .filter((e) => {
        const {
          key,
          label,
          // TODO: validate type
          type,
        } = e;
        // TODO: Enforce validation for supported types only!
        return key && type && label;
      });
    this.state = ({
      fields: cleanConfig.reduce(
          (arr, el, i) => {
            const {
              key,
              type,
              label,
            } = el;
            const resolvedLabel = (label || key);
            const validate = getValidationByConfig(
              el,
            );
            return ([
              ...arr,
              <Field
                name={key}
                component={getComponentByConfig(
                  el,
                  renderFieldError,
                  linkStyle || styles.linkStyle,
                )}
                validate={validate}
              />
            ]);
          },
          [],
        ),
    });
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
      fields,
      ...nextState
    } = this.state;
    return (
      <View
      >
        {fields}
      </View>
    );
  }
}

function getFieldsByConfig(
  form,
  config,
) {
  const mapStateToProps = (state, ownProps) => {
    return ({
      config,
      formSyncErrors: getFormSyncErrors(form)(state),
    });
  };
  const mapDispatchToProps = (dispatch, ownProps) => {
    return ({

    });
  };
  return connect(
    mapStateToProps,
    mapDispatchToProps,
    null,
    { withRef: false },
  )(
    reduxForm(
      {
        form,
      },
    )(DynamicFields),
  );
}

export default getFieldsByConfig;