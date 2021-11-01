import cors from 'cors';
import express from 'express';
import fetch from 'node-fetch';
import bitcoin from "bitcoinjs-lib";

var app = express();
let port = 3000;

app.use(express.json());
app.use(cors({
	origin: true,
	credentials: true
}));

app.post('/', async (req, res) => {
	let from = req.body.from;
	let to = req.body.to;
	let amount = req.body.amount;
	let priv = req.body.priv;
	let coin = req.body.coin;
	let net = req.body.net;
	var keys = bitcoin.ECPair.fromWIF(priv, bitcoin.networks.bitcoin);

	let tmptx = await getBlockCypherSkeleton(coin, net, from, to, amount);

	tmptx.pubkeys = [];
	tmptx.signatures = tmptx.tosign.map((tosign, n) => {
		tmptx.pubkeys.push(keys.publicKey.toString('hex'));
		let encodedSignature = bitcoin.script.signature.encode(
			keys.sign(Buffer.from(tosign, "hex")),
			0x01,
		)
		.toString("hex")
		.slice(0, -2);
		
		return encodedSignature;
	});

	let finaltx = await sendSignedTransaction(coin, net, tmptx);

	res.send(finaltx);


});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
})


async function getBlockCypherSkeleton(coin, net, from, to, amount) {
	let newUrl = `https://api.blockcypher.com/v1/${coin}/${net}/txs/new`;
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
}


async function sendSignedTransaction(coin, net, signedtx) {
	let sendUrl = `https://api.blockcypher.com/v1/${coin}/${net}/txs/send`;
	let finaltx = await fetch(sendUrl, {
		method: "POST",
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify(signedtx)
	}).then(x => x.json());

	return finaltx;
}