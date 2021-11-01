import cors from 'cors';
import express from 'express';
import bitcoin from "bitcoinjs-lib";
import dotenv from 'dotenv';
import calls from './bc-utils.js';

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

	let newTx = await calls.newSkeleton(coin, net, from, to, amount);
	let txSigned = calls.sign(newTx, keys);
	let finaltx = await calls.send(coin, net, txSigned);

	res.send(finaltx);
});

app.listen(port, () => {
	console.log(`Example app listening at http://localhost:${port}`)
	console.log(`BlockCypher Token: ${process.env.TOKEN}`);
})

