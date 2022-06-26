import { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Container,
  Grid,
  ImageList,
  ImageListItem,
  ImageListItemBar,
  Pagination,
} from "@mui/material";
import Link from "next/link";
import axios from "axios";

export default function Results() {
  const [{ results, loading, error }, setState] = useState({
    results: [],
    loading: true,
    error: null,
  });
  const [currentPageResults, setCurrentPageResults] = useState([]);
  const [pageNumber, setPageNumber] = useState(1);

  const channelsPerPage = 50;
  const channelsVisited = (pageNumber - 1) * channelsPerPage;

  const pageCount = Math.ceil(results.length / channelsPerPage);

  const displayResults = results
    .slice(channelsVisited, channelsVisited + channelsPerPage)
    .map((result) => {
      return (
        <Link href="/stream" passHref key={result.id}>
          <a
            onClick={() => sessionStorage.setItem("channel", result.user_login)}
          >
            <ImageListItem>
              <img src={result.thumbnail_url} alt="Thumbnail" />
              <ImageListItemBar
                title={result.title}
                subtitle={
                  <span>
                    {result.user_name} ({result.viewer_count} viewers)
                  </span>
                }
              />
            </ImageListItem>
          </a>
        </Link>
      );
    });

  const findResults = async (
    game: string,
    viewers: number,
    language: string
  ) => {
    try {
      const response = await axios.get(
        `/api/results?game=${game}&viewers=${viewers}&language=${language}`
      );

      sessionStorage.setItem("results", JSON.stringify(response.data));
      setState({ results: response.data, loading: false, ...error });
      setCurrentPageResults(
        response.data.slice(channelsVisited, channelsVisited + channelsPerPage)
      );
    } catch (err) {
      setState({ results: results, loading: false, error: err });
    }
  };

  useEffect(() => {
    sessionStorage.removeItem("channel");

    const game = sessionStorage.getItem("game");
    const viewers = sessionStorage.getItem("viewers");
    const language = sessionStorage.getItem("language");

    if (loading) {
      findResults(game, Number(viewers), language);
    }
  }, []);

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
      {loading && <CircularProgress size={100} />}

      {results.length == 0 && !loading && (
        <Box>
          <h1>Error: No results found</h1>
        </Box>
      )}

      {results.length != 0 && !loading && (
        <Container sx={{ pt: "1rem", pb: "3rem" }}>
          <ImageList cols={3}>{displayResults}</ImageList>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              mt: 5,
            }}
          >
            <Pagination
              count={pageCount}
              page={pageNumber}
              onChange={(e, value) => {
                setPageNumber(value);
              }}
            />
          </Box>
        </Container>
      )}
    </Grid>
  );
}
