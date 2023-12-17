import '../node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';
import * as templates from './templates.ts';

const mainElement = document.createElement('div');
mainElement.className = 'b4-main';

const alertsElement = document.createElement('div');
alertsElement.className = 'b4-alerts';

document.body.appendChild(mainElement);


const getBundles = async () => {
    // mainElement.innerHTML = await templates.mainTemplate()(); // Ensure function it´s invoked.
    const esRes = await fetch('/es/b4/bundle/_search?size=1000');

    const esResBody = await esRes.json();

    return esResBody.hits.hits.map(hit => ({
        id: hit._id,
        name: hit._source.name,
    }));
};

const listBundles = bundles => {
    mainElement.innerHTML =  templates.addBundleForm() + templates.listBundles({bundles});

    const form = mainElement.querySelector('form');
    form.addEventListener('submit', event => {
        event.preventDefault();
        const name = form.querySelector('input').value;
        addBundle(name);
    });

    const deleteButtons = mainElement.querySelectorAll('button.delete');
    for (let i = 0; i < deleteButtons.length; i++) {
        const deleteButton = deleteButtons[i];
        deleteButton.addEventListener('click', event => {
            deleteBundle(deleteButton.getAttribute('data-bundle-id'));
        })
    }    
}
/**
* Delete the bundle with the specified ID, then list bundles.
*/
const deleteBundle = async (id) => {

    try {
        const bundles = await getBundles();
        const idx = bundles.findIndex(bundle => bundle.id === id);
        if(idx === -1) {
            throw Error(`No bundle with id ${id} was found`);
        }

        await fetch(`/api/bundle/${encodeURIComponent(id)}`, {method: 'DELETE'});

        bundles.splice(idx, 1);

        await listBundles(bundles);

        showAlert(`Bundle deleted!`, 'sucess');
    } catch (error) {
        showAlert(error);        
    }
}


/**
* Show an alert to the user.
*/
const showAlert = (message, type= 'danger') => {
    const html = templates.alertTemplate({type, message});
    alertsElement.insertAdjacentHTML('beforeend', html);
}

/**
* Create a new bundle with the given name, then list bundles.
*/
const addBundle = async (name) => {
    try {
        // Grab the list of bundles already created.
        const bundles = await getBundles();
        // Add the new bundle
        const url = `/api/bundle?name=${encodeURIComponent(name)}`;
        const res = await fetch(url, {method: 'POST'});
        const resBody = await res.json();

        // Merge the new bundle into the original results and show them.
        bundles.push({id: resBody._id, name});
        listBundles(bundles);

        showAlert(`Bundle "${name}" created!`, 'success');
    } catch (err) {
        showAlert(err);
    }
};

const showView = async () => {
    const [view, ...params] = window.location.hash.split('/');

        switch(view) {
            case '#welcome':
                mainElement.innerHTML = templates.welcomeTemplate()();
                break;
            case '#list-bundles':
                const bundles = await getBundles();
                listBundles(bundles);
                break;    
            default:
                // Unrecognized view.
                throw Error(`Unrecognized view: ${view}`);    
        }
    }
    
    window.addEventListener('hashchange', showView);
    showView().catch(err => window.location.hash = '#welcome');

    
   


 // const welcomeElement = document.createElement('div');
    // mainElement.className = 'b4-welcome';

    // const alertsElement = document.createElement('div');
    // alertsElement.className = 'b4-alerts';

     // document.body.appendChild(alertsElement);
    // document.body.appendChild(welcomeElement);

    // if (mainElement) {
    //     mainElement.innerHTML = templates.mainTemplate()(); // Ensure function it´s invoked.
    // }

    // if (alertsElement) {
    //     alertsElement.innerHTML = templates.alertTemplate({
    //         type: 'info',
    //         message: 'Handlebars is working!'
    //     });
    // }

    // if (welcomeElement) {
    //     welcomeElement.innerHTML = templates.welcomeTemplate()();
    // }