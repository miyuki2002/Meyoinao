const axios = require('axios');

module.exports = async (client, servers, shardCount) => {
    await axios.post(
        'https://blist.xyz/api/bot/740108641054621696/stats/',
        JSON.stringify({
            'server_count': servers.toString(),
            'shard_count': shardCount.toString(),
        }),
        {
            method: 'POST',
            headers: {
                'Authorization': process.env.BLIST_TOKEN,
                'Content-Type': 'application/json',
            },
        },
    ).then(client.log('Posted bot stats to blist.xyz')).catch(function(error) {
        console.log(error);
    });
};