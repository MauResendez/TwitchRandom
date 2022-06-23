const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '/.env' }); // Load .env file

async function getToken() {
    const response = await axios.post(`${process.env.TOKEN_URL}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`);

    const token = response.data;

    return token.access_token;
}

export default async function handler(req, res) {
    let { game, broadcaster_id } = req.query;

    try
    {
        let token = await getToken();

        let headers = {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + token
        }

        let response = await axios.get(`${process.env.STREAMS_URL}?broadcaster_id=${broadcaster_id}`, { headers: headers });
        let data = response.data;

        if(data.data.length !== 0 && data.data[0].type === 'live' && data.data[0].game_name === game) // If the streamer is live and playing the game that the user is looking for, return true
        {
            return res.json(true);
        }
        else // Else return false
        {
            return res.json(false);
        }
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