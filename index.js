const {
  Connection,
  clusterApiUrl,
  Keypair,
  PublicKey,
  LAMPORTS_PER_SOL,
  Transaction,
  sendAndConfirmTransaction,
  SystemProgram,
} = require("@solana/web3.js");

// console.log(Keypair.generate());
const DEMO_FROM_SECRET_KEY = new Uint8Array([
  // devnet
  112, 30, 204, 22, 54, 213, 138, 30, 72, 231, 29, 253, 212, 211, 134, 222, 203,
  225, 182, 95, 149, 86, 199, 38, 183, 114, 243, 199, 247, 192, 127, 105, 96,
  40, 56, 235, 203, 247, 80, 6, 236, 35, 186, 192, 62, 205, 12, 45, 251, 2, 204,
  254, 193, 179, 151, 77, 22, 173, 53, 230, 17, 237, 237, 72,
  // localhost
  // 177,
  // 191, 95, 86, 191, 143, 248, 52, 246, 107, 145, 222, 248, 238, 11, 122, 17, 18,
  // 147, 208, 98, 99, 247, 211, 83, 244, 5, 89, 116, 108, 132, 154, 156, 173, 198,
  // 46, 159, 48, 67, 222, 251, 133, 11, 8, 166, 15, 6, 137, 238, 47, 16, 14, 139,
  // 196, 64, 195, 5, 131, 186, 173, 127, 226, 51, 133,
]);

const connection = new Connection(clusterApiUrl("devnet"), "confirmed");
// const connection = new Connection("http://localhost:8899", "confirmed");

const airdrop = async (publicKey, sol) => {
  const balance = await connection.getBalance(new PublicKey(publicKey));
  if (balance > sol * LAMPORTS_PER_SOL) {
    console.log("enough money! skip airdrop");
    return;
  }

  // Airdrop SOL to wallet
  console.log("Airdropping some SOL to wallet!");
  const airDropSignature = await connection.requestAirdrop(
    new PublicKey(publicKey),
    sol * LAMPORTS_PER_SOL
  );
  // Latest blockhash (unique identifier of the block)
  const latestBlockHash = await connection.getLatestBlockhash();

  // Confirm transaction using the last valid block height (refer to its time)
  // to check for transaction expiration
  await connection.confirmTransaction({
    blockhash: latestBlockHash.blockhash,
    lastValidBlockHeight: latestBlockHash.lastValidBlockHeight,
    signature: airDropSignature,
  });

  console.log("Airdrop completed for the account");
};

const transferSol = async () => {
  // GetKeypair from Secret Key
  const from = Keypair.fromSecretKey(DEMO_FROM_SECRET_KEY);

  // Generate another Keypair (account we'll be sending to)
  const to = Keypair.generate();

  // airdrop to sender if not enough money
  await airdrop(from.publicKey, 2);

  const senderBalance = await connection.getBalance(
    new PublicKey(from.publicKey)
  );

  const sendAmount = Math.floor(senderBalance / 2);

  console.log(`balance ${senderBalance / LAMPORTS_PER_SOL} SOL`);
  console.log(`send ${sendAmount / LAMPORTS_PER_SOL} SOL`);

  // Send money from "from" wallet and into "to" wallet
  var transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: from.publicKey,
      toPubkey: to.publicKey,
      lamports: sendAmount,
    })
  );

  // Sign transaction
  var signature = await sendAndConfirmTransaction(connection, transaction, [
    from,
  ]);

  console.log(`https://explorer.solana.com/tx/${signature}?cluster=devnet`);
};

transferSol();
