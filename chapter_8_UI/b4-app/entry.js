import './node_modules/bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap';

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM is ready. Compiling and rendering templates');


    const mainElement = document.createElement('div');
    mainElement.className = 'b4-main';

    const welcomeElement = document.createElement('div');
    welcomeElement.className = 'b4-welcome';
    
    const alertsElement = document.createElement('div');
    alertsElement.className = 'b4-alerts';
    
    document.body.innerHTML =  `
    <div class="container">
        <h1>B4 - Book Bundler</h1>
    </div>
    `;
    
    document.body.appendChild(alertsElement);
    document.body.appendChild(mainElement);

    mainElement.innerHTML = templates.welcomeTemplate()();
    
       
    alertsElement.innerHTML = `
        <div class="alert alert-success alert-dismissible fade in" role="alert">
            <button class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
            <strong>Success!</strong> Bootstrap is working.
        </div>
    `;
});    
    


