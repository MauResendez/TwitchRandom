import React, { useState } from 'react';
import TwitchAppBar from '../components/appbar';
import { createTheme, CssBaseline, ThemeProvider } from '@mui/material';
import { AppProps } from 'next/app';

export const ThemeContext = React.createContext(undefined as any);

const lightTheme = createTheme({
  palette: {
    mode: 'light'
  },
});

const darkTheme = createTheme({
  palette: {
    mode: 'dark'
  },
});

function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      <ThemeProvider theme={theme == 'light' ? lightTheme : darkTheme}>
        <CssBaseline />
        <TwitchAppBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </ThemeContext.Provider>
  )
}

export default App
