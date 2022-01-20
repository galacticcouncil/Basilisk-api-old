const pallet = process.argv[2];
const method = process.argv[3];

const methodScript = require(`./${pallet}/${pallet}.ts`);
methodScript[method]();
