'use strict';
const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const router = express.Router();
var cors = require('cors');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors({ origin: '*' }));

// Controllers
router.use('/produtos', async (req, res) => { // this one is able to consult the database and return the list of products
  try {
    var spt = req.path.split('/');    
    var route = spt[1];
    var phrase = req.query.frase;
    var response = await fetchProduct(route, phrase);
    if (response.error) return res.status(response.error).send(response);
    return res.status(200).send(response);
  }

  catch (err) {
    return res.status(500).send({ error: 'Error while trying to consult the list of products' });
  }
});

const fetchProduct = (product, phrase) => {
  return new Promise(resolve => {
    try {
      var data = require('./banco_de_palavras.json');
      let response = [];
      
      switch (product) {
        case '':
          for (let product in data) response.push(product);
          break;

        default:
          phrase = phrase.toUpperCase(); // to compare within camel case
          var words = phrase.split(' ');
          
          if (product && data[product]) { // if the product isn't empty, null or undefined, and exists in the banco_de_palavras.json file as an array item
            for (var [index, topic] of data[product].entries()) { // fetching in each topic of found product
              for (var [index, synonym] of topic.sinonimos.entries()) { // fetching in each synonym of found topic
                for(var [index, word] of words.entries()) { // comparing each word of submited phrase with each found synonym
                  if(synonym.toUpperCase().includes(word)) {
                    !response.includes(topic.resposta)? response.push(topic.resposta) : null;
                  }
                }
              }
            }
          }

          else resolve({ error: 404, message: 'Product not found' });
          break;
      }

      if(response.length <= 0) resolve({ error: 404, message: 'Product not found' });
      resolve({ body: response });
    }

    catch (err) {
      resolve({ error: 500, message: 'Script error' });
    }
  });
}

app.use(router);
app.listen(8080);