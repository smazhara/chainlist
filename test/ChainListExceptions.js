var ChainList = artifacts.require('./ChainList.sol')

contract('ChainList', (accounts) => {
  let contract

  const article = {
    seller: accounts[0],
    buyer: accounts[1],
    name: 'Article 1',
    description: 'Description of article 1',
    price: web3.toWei(1, 'ether')
  }

  function invalidOpCode(error) {
    assert(error.message.indexOf('invalid opcode') >= 0,
      `error should be 'invalid opcode' but was '${error}'`)
  }

  function assertInvalidOpCode(error) {
    assert(error.message.indexOf('invalid opcode') >= 0,
      `error should be 'invalid opcode' but was '${error}'`)
  }

  async function assertEmptyArticle() {
    const id = await contract.numberOfArticles()

    const [, _seller, _buyer, _articleName, _articleDescription, _price] =
      await contract.articles(id)

    assert.equal(_seller, 0x0, 'seller must be empty')
    assert.equal(_buyer, 0x0, 'buyer must be empty')
    assert.equal(_articleName, '', 'article name must be empty')
    assert.equal(_articleDescription, '', 'article description must be empty')
    assert.equal(_price.toNumber(), 0, 'price must be 0')
  }

  async function assertUnsoldArticle() {
    const [_seller, _buyer, _articleName, _articleDescription, _price] =
      await contract.articles(0)

    assert.equal(_seller, article.seller, `seller must be ${seller}`)
    assert.equal(_buyer, 0x0, 'buyer must be empty')
    assert.equal(_articleName, article.name,
      `article name must be ${article.name}`)
    assert.equal(_articleDescription, article.description,
      `article description must be ${article.description}`)
    assert.equal(_price.toNumber(), article.price,
      `price must be ${article.price}`)
  }

  it('throws when no article to sell', async () => {
    contract = await ChainList.deployed()

    try {
      await contract.buyArticle(0, {
        from: article.buyer,
        value: article.price
      })
    } catch (error) {
      assert.match(error, /^Error: VM Exception while processing transaction/)
      await assertEmptyArticle()
      return
    }

    throw 'Failed'
  })

  async function showArticle() {
    const [_seller, _buyer, _articleName, _articleDescription, _price] =
      await contract.getArticle()

    console.log(`
      seller: ${_seller}
      buyer: ${_buyer}
      name: ${_articleName}
      description: ${_articleDescription}
      price: ${_price}
    `)
  }

  it('throws when buying own article', async () => {
    contract = await ChainList.deployed()

    await contract.sellArticle(
      article.name,
      article.description,
      article.price
    )

    try {
      await contract.buyArticle(0, {
        from: article.seller,
        value: article.price
      })
    } catch (error) {
      assert.match(error, /^Error: VM Exception while processing transaction/)
      await assertUnsoldArticle()
      return
    }

    throw 'Failed'
  })

  xit('throws when price paid != article price', async () => {
    contract = await ChainList.deployed()

    await contract.sellArticle(
      article.name,
      article.description,
      article.price
    )

    try {
      await contract.buyArticle(0, {
        from: buyer,
        value: article.price - 1000
      })
    } catch (error) {
      assertInvalidOpCode(error)
      await assertUnsoldArticle()
      return
    }

    throw 'Failed'
  })

  xit('throws when buying already bought article', async () => {
    contract = await ChainList.deployed()

    await contract.sellArticle(
      articleName,
      articleDescription,
      articlePrice
    )

    await contract.buyArticle({
      from: buyer,
      value: articlePrice
    })

    try {
      await contract.buyArticle({
        from: buyer,
        value: articlePrice
      })
    } catch (error) {
      assertInvalidOpCode(error)
      return
    }

    throw 'Failed'
  })
})
