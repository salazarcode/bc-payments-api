
import fetch from 'node-fetch';

export default {
    newSkeleton: async (coin, net, from, to, amount) => {
        let newUrl = `https://api.blockcypher.com/v1/${coin}/${net}/txs/new?token=${process.env.TOKEN}`;
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
        let finaltx = await fetch(sendUrl, {
            method: "POST",
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(signedtx)
        }).then(x => x.json());
    
        return finaltx;
    },
    sign: (tx, keys) => {
        tx.pubkeys = [];
        tx.signatures = [];
    
        tx.signatures = tx.tosign.map(function (tosign, n) {
            tx.pubkeys.push(keys.publicKey.toString('hex'));
            return bitcoin.script.signature.encode(
                keys.sign(Buffer.from(tosign, "hex")),
                0x01,
            ).toString("hex").slice(0, -2) + "01";
        });

        return tx;
    }
}