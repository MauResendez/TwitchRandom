const axios = require('axios');
const dotenv = require('dotenv');
dotenv.config({ path: '/.env' }); // Load .env file

async function getToken() {
    const response = await axios.post(`${process.env.TOKEN_URL}?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}&grant_type=client_credentials`);

    const token = response.data;

    return token.access_token;
}

export default async function handler(req, res) {
    try {
        let token = await getToken();

        let headers = {
            'Client-ID': process.env.CLIENT_ID,
            'Authorization': 'Bearer ' + token
        }

        let games = [];
        let games_data;
        let cursor = '';
        let count = 0;

        do {
            let response = await axios.get(`${process.env.TOP_GAMES_URL}?first=100` + (cursor ? `&after=${cursor}` : ''), { headers: headers });
            games_data = response.data;

            if (games.length == 0) {
                games = games_data.data;
            }
            else if (games_data.data.length == 0) {
                break;
            }
            else {
                games = games.concat(games_data.data);
            }

            if (games_data.pagination.cursor) {
                cursor = games_data.pagination.cursor;
            }
            else {
                break;
            }

            ++count;
        } while (count != 5);

        return res.json(games);
    }
    catch (err) {
        console.log(err.message);

        res.status(500).json({
            message: 'Server Error'
        });
    }
}