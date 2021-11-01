import cors from 'cors';
import express from 'express';
import bitcoin from "bitcoinjs-lib";
import dotenv from 'dotenv';
import calls from './bc-calls.js';

dotenv.config();

var app = express();
let port = process.env.PORT;

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

	let tmptx = await calls.newSkeleton(coin, net, from, to, amount);

	tmptx.pubkeys = [];
	tmptx.signatures = [];

	tmptx.signatures = tmptx.tosign.map(function (tosign, n) {
		tmptx.pubkeys.push(keys.publicKey.toString('hex'));
		return bitcoin.script.signature.encode(
			keys.sign(Buffer.from(tosign, "hex")),
			0x01,
		).toString("hex").slice(0, -2) + "01";
	});
	//res.send(tmptx);

	let finaltx = await calls.send(coin, net, tmptx);

	res.send(finaltx);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
	console.log(`BlockCypher Token: ${process.env.TOKEN}`);
})

