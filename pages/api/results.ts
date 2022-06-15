const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({path: '/.env'}); // Load .env file
var shuffle = require('shuffle-array');

async function getToken()
{
    const response = await axios.post(`${process.env.TOKEN_URL}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`);

    const token = response.data;

    return token.access_token;
}

function replace_thumbnail(streams)
{
    let i = 0, len = streams.length;

    while(i < len)
    {
        streams[i].thumbnail_url = streams[i].thumbnail_url.replace('{width}x{height}', '325x180');
        ++i;
    }

    return streams;
}

export default async function handler(req, res) {
    let { game, viewers, language } = req.query;

    try
    {
        let token = await getToken();

        let headers = {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + token
        }

        let gameID;

        if (game !== 'null')
        {
            let game_response = await axios.get(`${process.env.GAMES_URL}?name=${game}`, { headers: headers });
            let game_data = game_response.data;

            if (game_data.length == 0) // If there is no game found, send empty array to display no results found message
            {
                return res.json([]);
            }

            gameID = game_data.data[0].id;
        }

        let streams = [];
        let streams_data;
        let cursor = '';
        let count = 0;

        do {
            if (count % 2 == 0) {
                let response = await axios.get(`${process.env.STREAMS_URL}?first=100` + (game !== 'null' ? `&game_id=${gameID}` : '') + (language !== 'null' ? `&language=${language}` : '') + (cursor ? `&after=${cursor}` : ''), { headers: headers });
                streams_data = response.data;

                if (streams.length == 0) {
                    streams = streams_data.data;
                } else if (streams_data.data.length == 0 || streams_data.data[0].viewer_count < 10) {
                    break;
                } else {
                    streams = streams.concat(streams_data.data);
                }

                if (streams_data.pagination.cursor) {
                    cursor = streams_data.pagination.cursor;
                }
                else {
                    break;
                }
            }

            ++count;
        } while (count != 10);

        let filtered_streams;

        if (viewers != null) {
            filtered_streams = streams.filter(stream => stream.viewer_count <= viewers); // Filter streams to ones that have equal or lower amount of given viewers from the parameters.
        }
        
        filtered_streams = replace_thumbnail(streams);
        
        shuffle(filtered_streams);

        return res.json(filtered_streams);
    }
    catch (err)
    {
        console.log(err);
        console.log(err.message);

        res.status(500).json
        ({
            message: 'Server Error'
        });
    }
}