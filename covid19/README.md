# Basic Sample Hardhat Project

This project demonstrates a basic Hardhat use case. It comes with a sample contract, a test for that contract, a sample script that deploys that contract, and an example of a task implementation, which simply lists the available accounts.

Try running some of the following tasks:

```shell
npx hardhat accounts
npx hardhat compile
npx hardhat clean
npx hardhat test
npx hardhat node
node scripts/sample-script.js
npx hardhat help
```

## Helpful Instructions

Open your terminal and browse to the directory you have git cloned to:

Install Hardhat if it has not been previously done so:

https://hardhat.org/getting-started/

Set up your ALCHEMY_RINKEBY_URL, RINKEBY_PRIVATE_KEY, env.ETHERSCAN_KEY in your .env

Compiling Contracts:

npx hardhat compile

Running Tests:

npx hardhat test

Deploying Tests:

npx hardhat run scripts/deploy.js --network rinkeby

../frontend/src/abis/Covid19.json will be automatically updated.

But you will need to replace the contract address on line 19 in the following file:

../frontend/src/components/Calendar.js

in order to test out the Admin feature as an owner of the smart contract.

Launching http://localhost:3000/:

cd .. frontend
npm start
