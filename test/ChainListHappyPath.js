const ChainList = artifacts.require('./ChainList.sol')
const helpers = require('./helpers')


contract('ChainList', async (accounts) => {
  let contract

  let article = {
    name: 'Article 1',
    description: 'Description of Article 1',
    price: web3.toWei(1, 'szabo'),
    seller: accounts[0],
    buyer: accounts[1]
  }

  function balance(account) {
    return web3.eth.getBalance(account).toNumber()
  }

  it('has no articles', async () => {
    contract = await ChainList.deployed()

    assert.equal(
      await contract.numberOfArticles(), 0, 'number of articles must be 0')
  })

  it('sells an article', async () => {
    contract = await ChainList.deployed()

    await contract.sellArticle(
      article.name,
      article.description,
      article.price,
      { from: article.seller }
    )

    const articleCount = await contract.numberOfArticles()

    assert.equal(articleCount, 1, 'article count must be 1')

    await helpers.assertArticle(1, article)
  })

  it('triggers an event when a new article is sold', async () => {
    contract = await ChainList.deployed()

    const watcher = contract.sellArticleEvent()

    await contract.sellArticle(
      article.name,
      article.description,
      article.price,
      {
        from: article.seller
      }
    )

    const events = await watcher.get()

    assert.equal(events.length, 1, 'should have received one event')

    assert.equal(events[0].args._seller, article.seller,
      `seller must be ${article.seller}`)

    assert.equal(events[0].args._name, article.name,
      `article must be ${article.name}`)

    assert.equal(events[0].args._price.toNumber(), article.price,
      `article price must be ${article.price}`)
  })

  it('buys an article', async () => {
    contract = await ChainList.deployed()

    const sellerBalanceBeforeBuy = balance(article.seller)
    const buyerBalanceBeforeBuy = balance(article.buyer)

    await contract.sellArticle(
      article.name,
      article.description,
      article.price,
      { from: article.seller }
    )

    const articleId = await contract.numberOfArticles()

    const receipt = await contract.buyArticle(
      articleId,
      {
        from: article.buyer,
        value: article.price,
      }
    )

    // event
    assert.equal(receipt.logs.length, 1, 'must trigger one event')

    assert.equal(receipt.logs[0].event, 'buyArticleEvent',
      'must be buyArticleEvent')

    const {_seller, _buyer, _name, _price} = receipt.logs[0].args

    assert.equal(_seller, article.seller, `seller must be ${article.seller}`)
    assert.equal(_buyer, article.buyer, `buyer must be ${article.buyer}`)
    assert.equal(_name, article.name, `articleName must be ${article.name}`)
    assert.equal(_price.toNumber(), article.price,
      `articlePrice must be ${article.price}`)

    // balances
    sellerBalanceAfterBuy = balance(article.seller)
    buyerBalanceAfterBuy = balance(article.buyer)

    assert(
      sellerBalanceAfterBuy <= sellerBalanceBeforeBuy + parseInt(article.price),
      `sellerBalanceAfterBuy must <= ` +
      `${sellerBalanceBeforeBuy + parseInt(article.price)} ` +
      `but was ${sellerBalanceAfterBuy}`
    )

    assert(
      buyerBalanceAfterBuy <= buyerBalanceBeforeBuy - parseInt(article.price),
      `buyerBalanceAfterBuy must be <= ` +
      `${buyerBalanceBeforeBuy - parseInt(article.price)}, ` +
      `but was ${buyerBalanceAfterBuy}`
    )
  })
})
