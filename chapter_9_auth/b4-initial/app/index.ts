import '../node_modules/bootstrap/dist/css/bootstrap.min.css';

import 'bootstrap';
import '../node_modules/bootstrap-social/bootstrap-social.css';
import '../node_modules/font-awesome/css/font-awesome.min.css';

import * as templates from './templates.ts';

/**
* Convenience method to fetch and decode JSON.
*/
const fetchJSON = async (url, method = 'GET') => {
  try {
    const response = await fetch(url, {method, credentials: 'same-origin'});
    return response.json();
  } catch (error) {
    return(error);
  }
}

const getBundles = async () => {
  const bundles = await fetchJSON('/api/list-bundles');
  if(bundles.error) {
    throw bundles.error;
  }
  return bundles;
}

const addBundle = async (input) => {
  try {
    const response = await fetch('/api/bundle', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({name: input})
    });
   
    if(!response.ok) {
      throw new Error(`Failed to create bundle: ${response.statusText}`)
    }

    const bundle = await response.json();
    
  } catch (err) {
    console.error('Error creating bundle', err);
  }
  
}

const updateUIWithNewBundle = bundle => {
  // TODO: Add bundle to UI.
}

const listBundles = bundles => {
  const mainElement = document.createElement('div');
  mainElement.className = 'b4-main';
  const appendMainElement = document.body.appendChild(mainElement);

  appendMainElement.innerHTML =
    templates.addBundleForm() + templates.listBundles({bundles});


  const form = document.createElement('form');
  form.className = 'form';
  form.addEventListener('submit', event => {
    event.preventDefault();
    const name = form.querySelector('input').value;
    addBundle(name);
  })
}

/**
 * Show an alert to the user.
 */
const showAlert = (message, type = 'danger') => {
  const alertsElement = document.body.querySelector('.b4-alerts');
  const html = templates.alert({type, message});
  alertsElement.insertAdjacentHTML('beforeend', html);
};

/**
 * Use Window location hash to show the specified view.
 */
const showView = async () => {
  const mainElement = document.body.querySelector('.b4-main');
  const [view, ...params] = window.location.hash.split('/');

  switch (view) {
    case '#welcome':
      const session = await fetchJSON('/api/session');
      mainElement.innerHTML = templates.welcome({session});
      if(session.error) {
        showAlert(session.error);
      }
      break;  
    case '#list-bundles':
      try {
        const bundles = await getBundles();
        listBundles(bundles);
      } catch (err) {
        showAlert(err);
        window.location.hash = '#welcome';        
      } 
      break; 
    default:
      // Unrecognized view.
      throw Error(`Unrecognized view: ${view}`);
  }
};

// Page setup.
(async () => {
  const session = await fetchJSON('/api/session');
  document.body.innerHTML = templates.main({session});
  window.addEventListener('hashchange', showView);
  showView().catch(err => window.location.hash = '#welcome');
})();
