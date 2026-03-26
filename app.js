// Import gridstack and its CSS
import 'gridstack/dist/gridstack.min.css';
import { GridStack } from 'gridstack';

// Function to initialize gridstack
function initGrid() {
    const grid = GridStack.init({
        margin: 10,
        cellHeight: 80,
        verticalMargin: 10,
        float: true,
        removable: '.remove',
        useLocalStorage: true,
        /* New properties for fullscreen configuration */
        fullScreen: true,
        resizable: {
            handles: 'e, se, s'
        },
        draggable: {
            handle: '.drag-handle',
            appendTo: 'body'
        }
    });

    // Load layout from local storage
    const layout = localStorage.getItem('gridstack-layout');
    if (layout) {
        grid.load(JSON.parse(layout));
    }

    // Save layout to local storage on change
    grid.on('change', () => {
        localStorage.setItem('gridstack-layout', JSON.stringify(grid.save()));
    });
}

// Initialize the grid on page load
window.onload = initGrid;