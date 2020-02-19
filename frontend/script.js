'use strict';

var elements = {
  loading_container: document.getElementById('loading_container'), // Loading Container
  form_container: document.getElementById('form_container'), // Form Container
  product: document.getElementById('product'), // Form Field
  phrase: document.getElementById('phrase'), // Form Field
  fetch: document.getElementById('fetch'), // Submit Button
  fetch_container: document.getElementById('fetch_container'), // Container
  preloader_container: document.getElementById('preloader_container'), // Container
  results_target: document.getElementById('results_target'), // Results Container
};

window.onload = () => {
  jQuery.ajax({
    url: 'http://localhost:8080/produtos',
    dataType: 'json',
    method: "GET",
    success: data => {
      for (let [index, product] of data.body.entries()) {
        let formatted = product.substring(0, 1).toUpperCase() + product.substring(1); // capitalizing the first letter to display properly
        elements.product.innerHTML += `<option value="${formatted}"> ${formatted} </option>`;
      }
    },
    error: async error => {
      await buildResponse('error', `Erro ${error.status}`, 'na tentativa de comunicação com o backend !', true);

      // hidding the fetch button
      elements.fetch.classList.add('hidden');
      elements.fetch.disabled = true;
      elements.fetch.readonly = true;
      elements.fetch.onclick = null;
    }
  }).done(() => {
    elements.loading_container.classList.add('hidden');
    elements.form_container.classList.remove('hidden');
  });
}

document.addEventListener('DOMContentLoaded', event => {
  elements.product.addEventListener('focus', () => elements.product.classList.remove('is-valid', 'is-invalid'), false);
  elements.phrase.addEventListener('focus', () => elements.phrase.classList.remove('is-valid', 'is-invalid'), false);
  elements.fetch.addEventListener('click', async () => await request(), false);
});

const request = () => {
  return new Promise(async resolve => {
    let product = elements.product.value;
    let phrase = elements.phrase.value;

    if (product && phrase) {
      elements.fetch_container.classList.add('hidden');
      elements.results_target.classList.add('hidden');
      elements.preloader_container.classList.remove('hidden');

      jQuery.ajax({
        url: `http://localhost:8080/produtos/${product.toLowerCase()}?frase=${phrase}`,
        dataType: 'json',
        method: "GET",
        success: async data => {
          for (let [index, answer] of data.body.entries()) await buildResponse('success', '', answer, false);
        },
        error: async error => {
          if (error.status == 404) await buildResponse('error', `Erro ${error.status}`, ', resposta não encontrada !', false);
          else await buildResponse('error', `Erro ${error.status}`, 'na tentativa de comunicação com o backend !', true);
          setTimeout(() => {
            elements.preloader_container.classList.add('hidden');
            elements.fetch_container.classList.remove('hidden');
            elements.results_target.classList.remove('hidden');
          }, 500);
  
          resolve();
        }
      }).done(() => {
        setTimeout(() => {
          elements.preloader_container.classList.add('hidden');
          elements.fetch_container.classList.remove('hidden');
          elements.results_target.classList.remove('hidden');
        }, 500);

        resolve();
      });
    }

    else {
      if (!product) elements.product.classList.add('is-invalid');
      if (!phrase) elements.phrase.classList.add('is-invalid');
    }
  });
}


// Auxiliar functions
const buildResponse = (type, title, message, reload = false) => {
  return new Promise(resolve => {
    var output = '';
    var status_class = '';

    switch (type) {
      case 'success':
        status_class = 'success';
        break;

      case 'error':
      default:
        status_class = 'danger';
        break;
    }

    output = `<div class="alert alert-${status_class} alert-dismissible full-width" role="alert">`;
    output += `<span type="button" class="close" data-dismiss="alert" aria-label="Close" onclick="removeElement(this, ${reload})">`;
    output += `<span aria-hidden="true">&times;</span>`;
    output += `</span>`;
    output += `<strong>${title}</strong> ${message}</div>`;
    elements.results_target.innerHTML = output;
    resolve();
  });
}

const removeElement = (handler, reload = false) => {
  $(handler)[0].parentNode.remove();
  reload ? window.location.reload() : null;
}