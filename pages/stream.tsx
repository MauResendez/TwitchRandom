import { useState, useEffect } from 'react';
import { Box, Button, CircularProgress, Container, Grid, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import axios, { AxiosResponse } from 'axios';
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router';

const TwitchStream = dynamic(() => import("react-twitch-embed-video"), {ssr: false})

export default function Stream() {
    const [{ stream, loading, error }, setState] = useState({ stream: null, loading: true, error: null });
    const [id, setId] = useState("twitch-embed");
    const [height, setHeight] = useState(450);
    const theme = useTheme();
    const sm = useMediaQuery(theme.breakpoints.down('sm'), { noSsr: true });
    const md = useMediaQuery(theme.breakpoints.down('md'), { noSsr: true });
    const lg = useMediaQuery(theme.breakpoints.down('lg'), { noSsr: true });

    const router = useRouter();

    function setFocus() {
        document.getElementById("twitch-embed").focus();
    }

    async function findStream(game: string, viewers: number, language: string) {
        let channel = sessionStorage.getItem('channel');
        let results = sessionStorage.getItem('results');

        try {
            if (channel) { // If you clicked on a stream from the Results page, it'll set up the stream to be that one
                setState({ stream: channel, loading: false, ...error });
                sessionStorage.removeItem('channel');
            } else if (!(results && results.length > 0)) { // If you first started searching, it'll retrieve results and pick a random stream from there
                let response = await axios.get(`/api/results?game=${game}&viewers=${viewers}&language=${language}`);
                let randomNumber = Math.floor(Math.random() * response.data.length);
                sessionStorage.setItem('results', JSON.stringify(response.data));

                setState({ stream: response.data[randomNumber].user_login, loading: false, ...error });
            } else { // If you already have results, it'll go back to the results array and choose another stream from there
                let randomNumber: number;
                let isLiveAndOnGame: boolean | AxiosResponse<any, any>;
                let results: any[];

                do {
                    randomNumber = Math.floor(Math.random() * JSON.parse(sessionStorage.getItem('results')).length);
                    results = JSON.parse(sessionStorage.getItem('results'));

                    // Checks to see if you found a streamer that's live and on the game you're searching for
                    isLiveAndOnGame = await axios.get(`/api/stream?game_name=${game}&user_login=${results[randomNumber].user_login}`);

                    // If you found a streamer that's not live anymore, remove the streamer from the results and start finding another one
                    if (isLiveAndOnGame == false) {
                        results.splice(randomNumber, 1);
                        sessionStorage.setItem('results', JSON.stringify(results));
                    }
                } while (!isLiveAndOnGame); // Have a loop in case some streams from the array have stop streaming

                setState({ stream: JSON.parse(sessionStorage.getItem('results'))[randomNumber].user_login, loading: false, ...error });
            }
        } catch (err) {
            setState({ ...stream, loading: false, error: err });
        };
    }

    useEffect(() => {
        if (sm) {
            setHeight(900);
        } else if (md) {
            setHeight(700);
        } else if (lg) {
            setHeight(500);
        }  
    }, [sm, md, lg]);

    useEffect(() => {
        let game = sessionStorage.getItem('game');
        let viewers = sessionStorage.getItem('viewers');
        let language = sessionStorage.getItem('language');
        
        if (loading) { // If loading state is true (When you're first starting searching)
            findStream(game, Number(viewers), language);
        }

    }, [stream, loading, error])

    return (
        <Grid container sx={{ direction: "column", alignItems: "center", justifyContent: "center", minHeight: '90vh' }}>
            <Container maxWidth="md" sx={{ textAlign: "center" }}>
                {loading &&
                    <CircularProgress size={100} />
                }

                {stream && !loading &&
                    <Grid sx={{ my: 3 }}>
                        <TwitchStream 
                            autoplay={true}
                            muted={false}
                            channel={stream}
                            layout="video-with-chat"
                            onPlay={() => { document.getElementById("twitch-embed").focus }}
                            onReady={() => { document.getElementById("twitch-embed").focus }}
                            theme="dark"
                            width="100%"
                            height={height}
                            chat="default"
                            targetId={id}
                        />
                    </Grid>
                }
                
                {!stream && !loading &&
                    <Typography variant="h5">Error: No stream found</Typography>
                }

                {!loading &&
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                        <Button sx={{ mr: 3 }} type="button" variant="contained" color="primary" className="submit" onClick={() => { setState({...stream, loading: true, ...error}) }}>Find Another Stream</Button>
                        <Button sx={{ ml: 3 }} type="button" variant="contained" color="primary" onClick={() => { router.push('/') }}>Home</Button>
                    </Box>
                }
            </Container>
        </Grid>
    )
}