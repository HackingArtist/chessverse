//SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/ChainlinkClient.sol";

/**
 * Request testnet LINK and ETH here: https://faucets.chain.link/
 * Find information on LINK Token Contracts and get the latest ETH and LINK faucets here: https://docs.chain.link/docs/link-token-contracts/
 */

/**
 * @notice DO NOT USE THIS CODE IN PRODUCTION. This is an example contract. 
 */
contract GenericLargeResponse is ChainlinkClient {
  using Chainlink for Chainlink.Request;

  // variable bytes returned in a signle oracle response
  string public data;
  string public image_url;

  /**
   * @notice Initialize the link token and target oracle
   * @dev The oracle address must be an Operator contract for multiword response
   *
   *
   * Kovan Testnet details: 
   * Link Token: 0xa36085F69e2889c224210F603D836748e7dC0088
   * Oracle: 0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8 (Chainlink DevRel)
   *
   */
  constructor(
  ) {
    setChainlinkToken(0xa36085F69e2889c224210F603D836748e7dC0088);
    setChainlinkOracle(0xc57B33452b4F7BB189bB5AfaE9cc4aBa1f7a4FD8);
  }

  /**
   * @notice Request variable bytes from the oracle
   */
  function requestBytes(
  )
    public
  {
    bytes32 specId = "7a97ff8493ec406d90621b2531f9251a";
    uint256 payment = 100000000000000000;
    Chainlink.Request memory req = buildChainlinkRequest(specId, address(this), this.fulfillBytes.selector);
    req.add("get","https://min-api.cryptocompare.com/data/pricemultifull?fsyms=ETH&tsyms=USD");
    req.add("path", "RAW.ETH.USD.FROMSYMBOL");
    requestOracleData(req, payment);
  }

  // event RequestFulfilled(
  //   bytes32 indexed requestId,
  //   string indexed data
  // );

  /**
   * @notice Fulfillment function for variable bytes
   * @dev This is called by the oracle. recordChainlinkFulfillment must be used.
   */
  function fulfillBytes(
    bytes32 requestId,
    string memory stringData
  )
    public
    recordChainlinkFulfillment(requestId)
  {
    // emit RequestFulfilled(requestId, bytesData);
    image_url = "done";
    data = stringData;
    // image_url = string(data);
  }

}
