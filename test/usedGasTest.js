// contracts 
const ComposableTopDown = artifacts.require("./ComposableTopDown.sol");
const SampleNFT = artifacts.require("./SampleNFT.sol");
const SampleERC20 = artifacts.require("./SampleERC20.sol");

const web3Utils = require('web3-utils');
const web3Abi = require('web3-eth-abi');
var BN = require('bn.js').BN;

contract('ComposableTopDown', function(accounts) {

    let composable, sampleNFT, sampleERC20, alice = accounts[0], bob = accounts[1];
    const bytes1 = web3Utils.padLeft(web3Utils.toHex(1), 32);
    const bytes2 = web3Utils.padLeft(web3Utils.toHex(2), 32);

    it('should be deployed, Composable', async () => {
        composable = await  ComposableTopDown.deployed();
        assert(composable !== undefined, 'Composable was not deployed');
      });
    
    it('should be deployed, SampleNFT', async () => {
        sampleNFT = await SampleNFT.deployed();
        assert(sampleNFT !== undefined, 'SampleNFT was not deployed');
    });

    it('should be deployed, SampleERC20', async () => {
        sampleERC20 = await SampleERC20.deployed();
        assert(sampleERC20 !== undefined, 'SampleERC20 was not deployed');
    });
    
    it('should mint a 721 token, SampleNFT', async () => {
        const tokenId = await sampleNFT.mint721.call(alice);
        assert(tokenId.eq(new BN(1)), 'SampleNFT 721 token was not created or has wrong tokenId');
        const tx = await sampleNFT.mint721(alice)
        console.log(tx.receipt.gasUsed)
    });

    it('should mint a 721 token, Composable', async () => {
        const tokenId = await composable.mint.call(alice);
        assert(tokenId.eq(new BN(1)), 'Composable 721 token was not created or has wrong tokenId');
        const tx = await composable.mint(alice)
        console.log(tx.receipt.gasUsed)
    });

    it('should safeTransferFrom SampleNFT to Composable', async () => {
        const oldGas = SampleNFT.defaults().gas
        const oldFrom = SampleNFT.defaults().from
        SampleNFT.defaults({ from: alice, gas: 500000 })
        const tx = await sampleNFT.safeTransferFrom(alice, composable.address, 1, bytes1)
        SampleNFT.defaults({gas: oldGas, from: oldFrom})
        console.log(tx.receipt.gasUsed)
    });

    it('should transfer composable to bob', async () => {
        const tx = await composable.transferFrom(alice, bob, 1);
        console.log(tx.receipt.gasUsed)
    });

    it('should transfer child to alice', async () => {
        ComposableTopDown.defaults({ from: bob })
        const tx = await composable.transferChild(1, alice, sampleNFT.address, 1);
        assert(tx.receipt.status, 'tx error');
        console.log(tx.receipt.gasUsed)
    });

    it('should mint a 721 token, Composable "2" for Alice', async () => {
        const tokenId = await composable.mint.call(alice);
        assert(tokenId.eq(new BN(2)), 'Composable 721 token was not created or has wrong tokenId');
        const tx = await composable.mint(alice);
        console.log(tx.receipt.gasUsed)
    });

    it('should mint a 721 token, SampleNFT', async () => {
        const tokenId = await sampleNFT.mint721.call(alice);
        assert(tokenId.eq(new BN(2)), 'SampleNFT 721 token was not created or has wrong tokenId');
        const tx = await sampleNFT.mint721(alice);
        console.log(tx.receipt.gasUsed)
    });

    it('should safeTransferFrom SampleNFT "2" to Composable "2"', async () => {
        const oldGas = SampleNFT.defaults().gas
        const oldFrom = SampleNFT.defaults().from
        SampleNFT.defaults({ from: alice, gas: 500000 })
        const tx = await sampleNFT.safeTransferFrom(alice, composable.address, 2, bytes2);
        SampleNFT.defaults({gas: oldGas, from: oldFrom})
        
        assert(tx != undefined, 'no tx using safeTransferFrom');
        console.log(tx.receipt.gasUsed)
    });

    it('should safeTransferChild from composable 2 to composable 1', async () => {
        //address _to, address _childContract, uint256 _childTokenId, bytes _data
        const oldGas = ComposableTopDown.defaults().gas
        const oldFrom = ComposableTopDown.defaults().from
        ComposableTopDown.defaults({ from: alice, gas: 500000 })
        const tx = await composable.safeTransferChild(2, composable.address, sampleNFT.address, 2, bytes1)
        ComposableTopDown.defaults({gas: oldGas, from: oldFrom})

        assert(tx, 'tx undefined using safeTransferChild');
        console.log(tx.gasUsed)
    });

    it('should mint ERC20', async () => {
        const success = await sampleERC20.mint.call(alice, 1500);
        assert(success, 'did not mint ERC20');
        const tx = await sampleERC20.mint(alice, 1500);
        console.log(tx.receipt.gasUsed)
    });

    it('should transfer half the value from the ERC20 to the composable "2"', async () => {
        const tx = await sampleERC20.transfer(composable.address, 500, bytes2)
        assert((await composable.balanceOfERC20(2, sampleERC20.address)).eq(new BN(500)), "check balance false")
        assert(tx, 'did not transfer');
        console.log(tx.gasUsed)
    });

    it('should transfer half the value from the ERC20 to the composable "2" by getERC20', async () => {
        const oldFrom = ComposableTopDown.defaults().from
        ComposableTopDown.defaults({ from: alice })
        var tx = await sampleERC20.approve(composable.address, new BN('0xffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff', 16))
        console.log("Approve: " + tx.receipt.gasUsed)
        tx = await composable.getERC20(alice, 2, sampleERC20.address, 498)
        console.log("getERC20: " + tx.receipt.gasUsed)
        ComposableTopDown.defaults({ from: oldFrom })

        assert((await composable.balanceOfERC20(2, sampleERC20.address)).eq(new BN(998)), "check balance false")
    });
})