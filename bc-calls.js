
import fetch from 'node-fetch';

export default {
    newSkeleton: async (coin, net, from, to, amount) => {
        let newUrl = `https://api.blockcypher.com/v1/${coin}/${net}/txs/new?token=${process.env.TOKEN}`;
        console.log(process.env.TOKEN);
        let tmptx = await fetch(newUrl, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    inputs: [{
                        addresses: [from]
                    }],
                    outputs: [{
                        addresses: [to],
                        value: amount
                    }]
                })
            })
            .then(x => x.json());

        return tmptx;
    },
    send: async (coin, net, signedtx) => {
        let sendUrl = `https://api.blockcypher.com/v1/${coin}/${net}/txs/send?token=${process.env.TOKEN}`;
        console.log(process.env.TOKEN);
        let finaltx = await fetch(sendUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signedtx)
        }).then(x => x.json());
    
        return finaltx;
    }
}