const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Covid19", function () {
  let Covid19, covid19;
  let owner, addr1, addr2;
   
  // Assigning DECIMAL with any integer value will not affect the intended outcome    
  const DECIMAL = "8"; 
  // This is the only param essential on determining the number of decimals needed
  const INIT_ANSWER = 200000000000; //ETH/USD set to $2,000 with 8 decimals

  beforeEach(async function () {
    [owner, addr1, addr2] = await ethers.getSigners();

    // Mock3Aggregator is deployed first to obtain its Price Feed Address
    MockV3Aggregator = await ethers.getContractFactory("MockV3Aggregator");
    mockV3Aggregator = await MockV3Aggregator.deploy(DECIMAL, INIT_ANSWER);
    await mockV3Aggregator.deployed();

    Covid19 = await ethers.getContractFactory("Covid19");
    // Price Feed Address is passeed into the constructor of Covi19
    covid19 = await Covid19.deploy(mockV3Aggregator.address);
    await covid19.deployed();
  });

  it("Should change usdPrice", async function () {
    const tx = await covid19.changeUsdPrice(125);

    await tx.wait();

    expect(await (covid19.usdPrice())/1e18).to.equal(125);
  });

    it("Should fail to change usdPrice if non-owner", async function () {
    await expect(
      covid19.connect(addr1).changeUsdPrice(50)).to.be.revertedWith("UnauthorizedCaller");
  });

  it("Should fail to withraw balance if non-owner", async function () {
    await expect(
      covid19.connect(addr2).withdraw()).to.be.revertedWith("UnauthorizedCaller");
  });

  it("Should change usdPrice and update ethTestFee", async function () {
    const tx = await covid19.changeUsdPrice(100);

    await tx.wait();

    expect(await (covid19.getEthTestFee())/1e18).to.equal(0.05);
  });  

  it("Should add two appointments", async function () {

    const tx = await covid19.changeUsdPrice(150);

    await tx.wait();
    
    const tx1 = await covid19.connect(addr1).createAppointment(
      "Nasal PCR", 1644143400, 1644150600, {value: ethers.utils.parseEther("0.075")});
    await tx1.wait();
  
    const tx2 = await covid19.connect(addr2).createAppointment(
      "Saliva PCR", 1644154200, 1644159600, {value: ethers.utils.parseEther("0.075")});
    await tx2.wait();
  
    const appointments = await covid19.getAppointments();
    expect(appointments.length).to.equal(2);
  });    
  
  it("Should fail to create appointment if paying less than 0.0375 ETH ($75)", async function () {
    // Arrange

    // Act
    // 2,000 eth/usd
    // usdPrice is 75
    // 2000/1 == 50/x == 0.0375
    const tx = await covid19.changeUsdPrice(75);

    await tx.wait();
    
    // Assert
    await expect(
      covid19.connect(addr1).createAppointment(
        "Rapid PCR", 1644143400, 1644150600, {value: ethers.utils.parseEther("0.03")}))
        .to.be.revertedWith("InsufficientEth");
    
  });    

});
