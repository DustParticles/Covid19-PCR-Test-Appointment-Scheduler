// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// When running the script with `npx hardhat run <script>` you'll find the Hardhat
// Runtime Environment's members available in the global scope.
const hre = require("hardhat");

async function main() {
  // Hardhat always runs the compile task when running scripts with its command
  // line interface.
  //
  // If this script is run directly using `node` you may want to call compile
  // manually to make sure everything is compiled
  // await hre.run('compile');

  // We get the contract to deploy
  // using Rinkeby Price Feed Adddress
  const priceFeed = '0x8A753747A1Fa494EC906cE90E9f37563A8AF630e';
  const Covid19 = await hre.ethers.getContractFactory("Covid19");
  const covid19 = await Covid19.deploy(priceFeed);

  await covid19.deployed();

  console.log("Covid19 deployed to:", covid19.address);

  saveFrontendFiles();
}

// Create and automatically update frontend Covid19.json
// each time the contract is redeployed.
function saveFrontendFiles() {
  const fs = require("fs");

  const abiDir = __dirname + "/../frontend/src/abis";

  if (!fs.existsSync(abiDir)) {
    fs.mkdirSync(abiDir);
  }

  const artifact = artifacts.readArtifactSync("Covid19");

  fs.writeFileSync(
    abiDir + "/Covid19.json",
    JSON.stringify(artifact, null, 2)
  );
}
// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
