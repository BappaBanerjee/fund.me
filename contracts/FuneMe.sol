//SPDX-License-Identifier:MIT
pragma solidity ^0.8.0;
import "./PriceConvertor.sol";

error FundMe__NotOwner(); //write the name of the contract before the error can help us to identify from where the error has generated

contract FundMe {
    using PriceConvertor for uint256;

    uint256 public constant MINIUSD = 50 * 10 ** 18;
    address[] private funders;
    mapping(address => uint256) private addressToAmount;
    address private immutable i_owner; // write the immutable variable starting with i_

    AggregatorV3Interface priceFeed;

    modifier onlyOwner() {
        if (msg.sender != i_owner) revert FundMe__NotOwner();
        _;
    }

    constructor(address _address) {
        i_owner = msg.sender;
        priceFeed = AggregatorV3Interface(_address);
    }

    function fund() public payable {
        require(
            msg.value.getConversionPrice(priceFeed) > MINIUSD,
            "Please enter sufficient amount"
        );
        //address 0xA39434A63A52E749F02807ae27335515BA4b07F7
        funders.push(msg.sender);
        addressToAmount[msg.sender] = msg.value;
    }

    function withdraw() public onlyOwner {
        for (uint256 i = 0; i < funders.length; i++) {
            addressToAmount[funders[i]] = 0;
        }
        funders = new address[](0);
        (bool success, ) = payable(i_owner).call{value: address(this).balance}(
            ""
        );
        require(success, "call failed");
    }

    function getAddressToAmountFunded(
        address fundingAddress
    ) public view returns (uint256) {
        return addressToAmount[fundingAddress];
    }

    function getVersion() public view returns (uint256) {
        return priceFeed.version();
    }

    function getFunder(uint256 index) public view returns (address) {
        return funders[index];
    }

    function getOwner() public view returns (address) {
        return i_owner;
    }

    function getPriceFeed() public view returns (AggregatorV3Interface) {
        return priceFeed;
    }

    fallback() external payable {
        fund();
    }

    receive() external payable {
        fund();
    }
}
