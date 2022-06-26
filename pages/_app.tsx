import React, { useState } from "react";
import TwitchAppBar from "../components/appbar";
import { createTheme, CssBaseline, ThemeProvider } from "@mui/material";
import { AppProps } from "next/app";
import Head from "next/head";

export const ThemeContext = React.createContext(undefined as any);

const lightTheme = createTheme({
  palette: {
    mode: "light",
  },
});

const darkTheme = createTheme({
  palette: {
    mode: "dark",
  },
});

function App({ Component, pageProps }: AppProps) {
  const [theme, setTheme] = useState<"light" | "dark">("dark");

  return (
    <ThemeContext.Provider value={[theme, setTheme]}>
      <ThemeProvider theme={theme == "light" ? lightTheme : darkTheme}>
        <Head>
          <title>Twitch Random</title>
          <meta name="viewport" content="initial-scale=1.0, width=device-width" />
          <meta name="description" content="Find new streamers to watch based on your language and favorite games" />
        </Head>
        <CssBaseline />
        <TwitchAppBar />
        <Component {...pageProps} />
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export default App;
