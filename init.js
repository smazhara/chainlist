ChainList.deployed().then(function(instance) { app = instance; seller = web3.eth.accounts[0]; buyer = web3.eth.accounts[1]; app.sellArticle('article', 'article description', web3.toWei(1, 'ether')); app.buyArticleEvent().watch(function(error, event) { console.log(event) });amount=web3.toWei(1, 'ether');app.sellArticle('article', 'article desc', amount); app.buyArticle({from: buyer, value:amount}) })