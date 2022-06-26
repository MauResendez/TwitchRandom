import { useEffect, useState } from "react";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import axios from "axios";

function Copyright() {
  return (
    <Typography variant="body2" color="textSecondary" align="center">
      {`Copyright © Twitch Random ${new Date().getFullYear()}`}
    </Typography>
  );
}

export default function Home() {
  const [game, setGame] = useState(null);
  const [viewers, setViewers] = useState(null);
  const [language, setLanguage] = useState(null);
  const [inputGame, setInputGame] = useState("");
  const [open, setOpen] = useState(false);
  const [games, setGames] = useState([]);
  const router = useRouter();

  useEffect(() => {
    // When starting/refreshing the page, remove all previous data so the user can fill in the data to their liking
    sessionStorage.clear();

    async function getGames() {
      const response = await axios.get(`/api/games`);
      let games = response.data.map((game: { name: string }) => game.name);

      games = Array.from(new Set(games)); // Removing duplicates from the games array

      setGames(games);
    }

    getGames();
  }, []);

  useEffect(() => {
    // When starting/refreshing the page, remove all previous data so the user can fill in the data to their liking
    sessionStorage.setItem("game", game);
    sessionStorage.setItem("language", language);
    sessionStorage.setItem("viewers", viewers);
  }, [game, language, viewers]);

  const findRandomStream = (e) => {
    e.preventDefault();

    router.push("/stream");
  };

  const checkViewersInput = (e) => {
    if (e.target.value < 10 && e.target.value != "") {
      // If the viewer amount is set less than 10, then set it to 10
      setViewers(10);
      // sessionStorage.setItem('viewers', String(viewers));
    } else if (e.target.value > 9999999 && e.target.value != "") {
      // If the viewer amount is set higher than 9999999, then set it to 9999999 (Max Amount)
      setViewers(null);
      // sessionStorage.setItem('viewers', null);
    } else if (e.target.value >= 10 && e.target.value != "") {
      // If the viewer count is equal or more than 10, set the viewers to the number
      setViewers(e.target.value);
      // sessionStorage.setItem('viewers', e.target.value);
    } // If the user left it blank, assume that they want to view any streamer, no matter the viewer count
    else {
      setViewers(null);
      // sessionStorage.setItem('viewers', null);
    }

    sessionStorage.setItem("viewers", viewers);
  };

  return (
    <Grid
      container
      sx={{
        direction: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "90vh",
      }}
    >
      <Container maxWidth="sm" sx={{ textAlign: "center" }}>
        <Box sx={{ my: 2 }}>
          <Typography variant="h5">
            <strong>Twitch Random</strong>
          </Typography>
          <Typography>
            Find new streamers to watch based on your language and favorite
            games
          </Typography>
        </Box>
        <FormControl sx={{ width: "100%", my: 1 }} onSubmit={findRandomStream}>
          <Autocomplete
            sx={{ mb: 2 }}
            open={open}
            onOpen={() => {
              if (inputGame) {
                setOpen(true);
              }
            }}
            onClose={() => setOpen(false)}
            value={game}
            onChange={(e, game) => {
              setGame(game);
            }}
            inputValue={inputGame}
            onInputChange={(e, inputGame) => {
              setInputGame(inputGame);
              setGame(inputGame);

              if (!inputGame) {
                setOpen(false);
              }
            }}
            options={games}
            freeSolo
            renderInput={(params) => (
              <TextField
                {...params}
                variant="outlined"
                id="game"
                label="Game"
                name="game"
                autoFocus
              />
            )}
          />
          <TextField
            sx={{ mb: 2 }}
            variant="outlined"
            type="number"
            InputProps={{ inputProps: { min: "10", max: "9999999" } }}
            fullWidth
            id="viewers"
            label="Number of Viewers (Minimum: 10)"
            name="viewers"
            onChange={(e) => setViewers(viewers)}
            onBlur={checkViewersInput}
          />
          <FormControl fullWidth>
            <InputLabel id="language">Language</InputLabel>
            <Select
              sx={{ textAlign: "left" }}
              variant="outlined"
              labelId="language"
              id="language"
              label="Language"
              name="Language"
              onChange={(e) => setLanguage(e.target.value)}
            >
              <MenuItem value={null}>Select Language...</MenuItem>
              <MenuItem value={"en"}>English</MenuItem>
              <MenuItem value={"es"}>Español (Spanish)</MenuItem>
              <MenuItem value={"fr"}>Français (French)</MenuItem>
              <MenuItem value={"de"}>Deutsch (German)</MenuItem>
              <MenuItem value={"ja"}>日本語 (Japanese)</MenuItem>
              <MenuItem value={"it"}>Italiano (Italian)</MenuItem>
              <MenuItem value={"pt"}>Português (Portuguese)</MenuItem>
              <MenuItem value={"ru"}>русский (Russian)</MenuItem>
              <MenuItem value={"nl"}>Nederlands (Dutch)</MenuItem>
              <MenuItem value={"tr"}>Türkçe (Turkish)</MenuItem>
            </Select>
          </FormControl>
        </FormControl>
        <Box sx={{ display: "flex", justifyContent: "center", my: 2 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mr: 3 }}
            onClick={() => {
              router.push("/stream");
            }}
          >
            Find A Random Stream
          </Button>
          <Button
            type="button"
            variant="contained"
            color="primary"
            sx={{ ml: 3 }}
            onClick={() => {
              router.push("/results");
            }}
          >
            View Results
          </Button>
        </Box>
        <Box sx={{ my: 5 }}>
          <Copyright />
        </Box>
      </Container>
    </Grid>
  );
}
