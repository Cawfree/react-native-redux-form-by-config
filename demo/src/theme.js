import React from 'react';
import { createTheming } from '@callstack/react-theme-provider';

const marginExtraShort = 5;
const marginShort = 10;
const marginStandard = 15;

export const defaultTheme = {
  marginExtraShort,
  marginShort,
  marginStandard,
  backgroundColor: '#FFFFFFFF',
  borderRadius: marginShort,
  linkStyle: {
    color: '#2980b9',
  },
  errorStyle: {
    color: 'red',
  },
  groupLabelStyle: {
    fontWeight: 'bold',
    color: '#FFFFFFFF',
    fontSize: 16,
  },
  labelStyle: {
    color: '#FFFFFFFF',
    fontSize: 12,
  },
  minFieldHeight: 50,
};

const theme = createTheming(
  defaultTheme,
);

const { ThemeProvider } = theme;

export const { withTheme, useTheme } = theme;

export default ThemeProvider;
