loadComponent = async (componentName) => {
    try {
        const component = await fetch(`${componentName}.html`);
        let componentHTML = await component.text();
        let parentDiv = document.createElement('div');
        parentDiv.innerHTML = componentHTML;
        return parentDiv;
    } catch (error) {
        console.error(`Error loading component: ${error}`);
    }
}