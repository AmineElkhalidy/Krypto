// 

require('@nomiclabs/hardhat-waffle');

module.exports = {
  solidity: '0.8.0',
  networks: {
    ropsten: {
      url: 'https://eth-ropsten.alchemyapi.io/v2/oXvfG78JPlxUB8leImJZmXgJWBRBD_MS',
      accounts: [ '2afc76c4d7b03cd66c4e69dde74e1aad22147c3057677cc68d9f760bdaeee70e' ]
    }
  }
}