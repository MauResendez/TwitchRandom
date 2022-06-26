import { useContext } from "react";
import { AppBar, Box, Switch, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import { ThemeContext } from "../pages/_app";

function TwitchAppBar() {
  const [theme, setTheme] = useContext(ThemeContext);

  return (
    <AppBar
      position="static"
      className="appBar"
      sx={{ backgroundColor: theme == "light" ? "#9146FF" : "#121212" }}
    >
      <Toolbar>
        <Link href="/" passHref>
          <Typography variant="h6" sx={{ cursor: "pointer" }}>
            Twitch Random
          </Typography>
        </Link>
        <Box sx={{ flexGrow: 1 }} />
        <Switch
          onClick={() => setTheme(theme == "light" ? "dark" : "light")}
          checked={theme == "dark" ? true : false}
          inputProps={{ 'aria-label': 'theme' }}
        />
      </Toolbar>
    </AppBar>
  );
}

export default TwitchAppBar;
