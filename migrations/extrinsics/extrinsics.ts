const pallet = process.argv[2];
const method = process.argv[3];

const methodScript = require(`./${pallet}/${pallet}.ts`);

methodScript[method]().then(
    () => process.exit(0),
    (err:Error) => {
        console.error(err);
        process.exit(1);
    }
);
