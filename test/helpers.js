const ChainList = artifacts.require('./ChainList.sol')

async function contract() {
  return await ChainList.deployed()
}

module.exports = {
  async assertEmptyArticle(id) {
    const [_seller, _buyer, _articleName, _articleDescription, _price] =
      await (await contract()).articles(id)

    assert.equal(_seller, 0x0, 'seller must be empty')
    assert.equal(_buyer, 0x0, 'buyer must be empty')
    assert.equal(_articleName, '', 'article name must be empty')
    assert.equal(_articleDescription, '', 'article description must be empty')
    assert.equal(_price.toNumber(), 0, 'price must be 0')
  },

  async assertArticle(id, article) {
    const [_, seller, buyer, name, description, price] =
      await (await contract()).articles(id)

    assert.equal(seller, article.seller, `seller must be ${article.seller}`)

    assert.equal(buyer, 0x0, 'buyer must be empty')

    assert.equal(name, article.name, `article name must be ${article.name}`)

    assert.equal(description, article.description,
      `article description must be ${article.description}`)

    assert.equal(price.toNumber(), article.price,
      `price must be ${article.price}`)
  }

}
