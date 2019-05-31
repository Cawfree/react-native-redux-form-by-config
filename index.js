import React from 'react';
import { connect } from 'react-redux';
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
import Animation from 'lottie-react-native';
import Hyperlink from 'react-native-hyperlink'; 
import PropTypes from 'prop-types';
// TODO: Make this configurable at the invocation level.
import {
  Field,
  reduxForm,
  getFormSyncErrors,
} from 'redux-form/immutable';
import isEqual from 'lodash.isequal';

import FontAwesomeIcon from 'react-native-vector-icons/FontAwesome';
//import Collapsible from 'react-native-collapsible';

// TODO: Expose properties and rendering/animation interfaces, that kind of stuff.
const {
  // TODO: Allow the caller to define a custom width.
  width: screenWidth,
} = Dimensions.get('window');

const marginShort = 10;
const marginExtraShort = 5;

const styles = StyleSheet.create({
  error: {
    height: 25,
    color: '#FF0000FF',
  },
  fieldContainer: {
    borderRadius: marginShort,
    overflow: 'hidden',
    flexDirection: 'row',
    flex: 1,
  },
  fieldErrorCaption: {
    width: screenWidth,
    height: 30,
    flexDirection: 'row',
  },
  fieldErrorCaptionContainer: {
    width: screenWidth - (2 * marginShort),
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
});

class CheckBox extends React.Component {
  state = {
    animProgress: new Animated.Value(0),
  }
  componentDidMount() {
    const {
      checked,
    } = this.props;
    if (checked) {
      return this.__animate(checked);
    }
    return Promise
      .resolve();
  }
  componentWillUpdate(nextProps, nextState) {
    const {
      checked,
    } = nextProps;
    if (checked !== this.props.checked) {
      return this.__animate(checked);
    }
    return Promise
      .resolve();
  }
  __animate(checked) {
    const {
      animProgress,
    } = this.state;
    return new Promise(resolve => Animated.timing(
      animProgress,
      {
        toValue: checked ? 0.6 : 0.1,
        duration: 800,
      },
    ).start(resolve));
  }
  render() {
    const {
      style,
      checked,
      onRequestChange,
    } = this.props;
    const { animProgress } = this.state;
    return (
      <TouchableOpacity
        style={style}
        onPress={() => onRequestChange(!checked)}
      >
        <Animation
          style={{
            flex: 1,
          }}
          source={require('./res/checkbox.json')}
          progress={animProgress}
        />
      </TouchableOpacity>
    );
  }
}

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
    const shouldShowError = (!!touched && !!error) || !collapsed;
    const shouldRenderFieldError = !!renderFieldError;
    return (
      <View
        style={{
          flex: 1,
          minHeight: 40,
        }}
      >
        <View
          style={[
            styles.fieldContainer,
            {
              backgroundColor,
            },
          ]}
        >
          <View
            style={{
              width: screenWidth - ((2 * marginShort) + (shouldRenderFieldError ? (50) : 0)),
              flex: 1,
              minHeight: 40,
            }}
          >
            {children}
          </View>
          {(shouldRenderFieldError) && (
            <View
              style={{
                width: 50,
                height: 50,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {(!!touched && !!error) && (
                renderFieldError()
              )}
            </View>
          )}
        </View>
        {(!!shouldShowError) && (
          <View
            style={styles.fieldErrorCaption}
          >
            {(!!touched && !!error) && (
              <View
                style={styles.fieldErrorCaptionContainer}
              >
                <Text
                  style={styles.error}
                >
                  {error}
                </Text>
              </View>
            )}
          </View>
        )}
      </View>
    );
  }
}

const renderTextInput = (config, renderFieldError) => ({ input: { onChange, value, ...restInput }, meta: { touched, error, ...restMeta}}) => {
  const {
    numberOfLines,
    placeholder,
    secureTextEntry,
    textContentType,
    collapsed,
    ref,
    style,
    ...restConfig
  } = config;
  const resolvedNumberOfLines = numberOfLines || 1;
  const resolvedStyle = style || {};
  const multiline = resolvedNumberOfLines > 1;
  return (
    <FieldContainer
      backgroundColor="#FFFFFFFF"
      touched={touched}
      error={error}
      renderFieldError={renderFieldError}
      collapsed={collapsed}
    >
      <TextInput
        ref={ref}
        style={{
          flex: 1,
          fontSize: 16,
          ...resolvedStyle,
        }}
        value={value}
        onChangeText={onChange}
        numberOfLines={resolvedNumberOfLines}
        multiline={multiline}
        placeholder={placeholder || ''}
        underlineColorAndroid="transparent"
        secureTextEntry={secureTextEntry}
        textContentType={textContentType}
      />
    </FieldContainer>
  );
};

const renderBooleanInput = (config, renderFieldError) => ({ input: { onChange, value, ...restInput }, meta: { touched, error, ...restMeta}}) => {
  const {
    collapsed,
    ref,
    style,
    description,
    ...restConfig
  } = config;
  const resolvedStyle = style || {};
  const resolvedDescription = description || '';
  const resolvedValue = !!value;
  const shouldUseHyperlink = (typeof resolvedDescription !== 'string') && resolvedDescription.length === 2;
  return (
    <FieldContainer
      backgroundColor="transparent"
      touched={touched}
      error={error}
      renderFieldError={null}
      collapsed={collapsed}
    >
      <View
        style={{
          flex: 1,
          width: screenWidth - (2 * marginShort),
          flexDirection: 'row',
          alignItems: 'center',
        }}
      >
        <TouchableOpacity
          style={{
            marginLeft: -1 * marginShort,
            width: 50,
            height: 50,
          }}
          onPress={() => onChange(!resolvedValue) }
        >
          <CheckBox
            style={{ flex: 1 }}
            onRequestChange={checked => onChange(checked)}
            checked={resolvedValue}
          />
        </TouchableOpacity>
        <View
          style={{
            width: (screenWidth - 50) - (1 * marginShort),
          }}
        >
          {(shouldUseHyperlink) ? (
            <Hyperlink
              onPress={(url) => {
                return Linking.canOpenURL(url)
                  .then((supported) => {
                    if (supported) {
                      return Linking
                        .openURL(url);
                    }
                    return Promise.reject(
                      new Error(
                        `Failed to open "${url}".`,
                      ),
                    );
                  });
              }}
              linkStyle={{
                color: '#2980b9',
              }}
              linkText={() => resolvedDescription[1]}
            >
              <Text
                style={{
                  ...resolvedStyle,
                }}
              >
                {resolvedDescription[0]}
              </Text>
            </Hyperlink>
          ) : (
            <Text
              style={{
                ...resolvedStyle,
              }}
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

const getComponentByConfig = (config, renderFieldError) => {
  const {
    type,
  } = config;
  if (type === 'text') {
    return renderTextInput(
      config,
      renderFieldError,
    );
  } else if (type === 'boolean') {
    return renderBooleanInput(
      config,
      renderFieldError,
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
              <View
                style={{
                  flex: 1,
                }}
              >
                <Field
                  name={key}
                  component={getComponentByConfig(
                    el,
                    nextProps.renderFieldError,
                  )}
                  validate={validate}
                />
              </View>
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
        style={{
          flex: 1,
        }}
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
