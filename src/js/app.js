class App {
  constructor() {
    App.contracts = {}
    App.initWeb3()
  }

  static get web3() {
    return this._web3 = this._web3 || new Web3(this.web3Provider)
  }

  static get web3Provider() {
    if (typeof web3 === 'undefined') {
      return new Web3.providers.HttpProvider('http://localhost:8545')
    } else {
      return web3.currentProvider
    }
  }

  static initWeb3() {
    App.displayAccountInfo()

    App.initContract()
  }

  static displayAccountInfo() {
    App.web3.eth.getCoinbase((err, account) => {
      if (err !== null)
        return

      App.account = account

      $('#account').text(account)

      App.web3.eth.getBalance(account, (err, balance) => {
        if (err !== null)
          return

        const etherBalance = App.web3.fromWei(balance, 'ether')

        $('#accountBalance').text(`${etherBalance} ETH`)
      })
    })
  }

  static initContract() {
    $.getJSON('ChainList.json', (chainListArtifacts) => {
      App.contracts.ChainList = TruffleContract(chainListArtifacts)

      App.contracts.ChainList.setProvider(App.web3Provider)

      App.listenToEvents()

      App.reloadArticles()
    })
  }

  static sellArticle() {
    const _article_name = $('#article_name').val()
    const _description = $('#article_description').val()
    const _price = App.web3.toWei(parseInt($('#article_price').val() || 0), 'ether')

    if ((_article_name.trim() == '') || (_price == 0))
      return false

    App.contracts.ChainList.deployed().then((instance) => {
      console.log('deployed')

      return instance.sellArticle(_article_name, _description, _price, {
        from: App.account,
        gas: 500000
      })
      .then((result) => {
        console.log(`result ${result}`)
      }).catch((err) => {
        console.error(`sellArticle error ${err}`)
      })
    }).catch((err) => {
      console.error(`chainlist deploy error ${err}`)
    })
  }

  static async reloadArticles() {
    App.displayAccountInfo()

    const contract = await App.contracts.ChainList.deployed()

    const article = await contract.getArticle()
    let [seller, buyer, name, descr, price] = article

    price = App.web3.fromWei(price, 'ether')

    if (seller == 0x0)
      return

    const articlesRow = $('#articlesRow')
    articlesRow.empty()

    const articleTemplate = $('#articleTemplate')
    articleTemplate.find('.panel-title').text(name)
    articleTemplate.find('.article-description').text(descr)
    articleTemplate.find('.article-price').text(price)
    articleTemplate.find('.btn-buy').attr('data-value', price)

    if (seller == App.account)
      seller = 'You'

    articleTemplate.find('.article-seller').text(seller)

    if (buyer == 0x0) {
      buyer = 'Not bought'
    } else if (buyer == App.account) {
      buyer = 'You'
    }

    articleTemplate.find('.article-buyer').text(buyer)

    console.log`seller ${seller}`
    console.log`App.account ${App.account}`
    if (seller == 'You' || buyer == 'You') {
      articleTemplate.find('.btn-buy').hide()
    }

    articlesRow.append(articleTemplate.html())
  }

  static listenToEvents() {
    App.contracts.ChainList.deployed().then((instance) => {
      instance.
        sellArticleEvent({}, {fromBlock: 0, toBlock: 'latest'}).
        watch((error, event) => {
          $('#events').
            append(`<li class="list-group-item">${event.args._name} is
              for sale</li>`)

          App.reloadArticles()
        })
    })
  }

  static async buyArticle() {
    event.preventDefault()

    var _price = parseInt($(event.target).data('value'))

    const contract = await App.contracts.ChainList.deployed()

    const result = await contract.buyArticle({
      from: App.account,
      value: web3.toWei(_price, 'ether'),
      gas: 5000000
    })
  }
}

$(function() {
  $(window).load(function() {
    new App()
  });
});
