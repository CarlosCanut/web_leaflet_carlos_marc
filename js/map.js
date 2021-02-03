var mapLayers;
var baseMaps;
var legend;
var control;
var mymap;

const mapStyle = {
    streets: L.esri.basemapLayer('Streets'),
    topographic: L.esri.basemapLayer('Topographic'),
    terrain: L.esri.basemapLayer('Terrain'),
    spainIGN: Spain_IGNBase
}

function initMap() {
    // Creamos mapa
    mymap = L.map('map', {
        center: [40.538467, -3.8532],
        zoom: 6,
        zoomControl: false, 
        layers: [mapStyle.terrain] 
    });

    L.control.scale().addTo(mymap);

    mapLayers = [];

    baseMaps = [{
        groupName: "Mapas base",
        layers: {
            "Terreno": mapStyle.terrain,
            "Calles": mapStyle.streets,
            "Topográfico": mapStyle.topographic,
            "España IGN base": mapStyle.spainIGN
        },
        expanded: true
    }];
    
    let options = {
        container_width: "300px",
        exclusive: false,
        collapsed: true,
        position: 'topright'
    };

    // Plugin controller
    control = L.Control.styledLayerControl(baseMaps, mapLayers, options);

    let zoomHome = L.Control.zoomHome();
    zoomHome.addTo(mymap);

    let measureControl = new L.Control.Measure({
        position: 'topleft',
        primaryLengthUnit: 'meters',
        secondaryLengthUnit: 'kilometers',
        primaryAreaUnit: 'hectares',
        activeColor: 'red',
        completedColor: 'blue'
    });
    measureControl.addTo(mymap);

    let mapLayer = new L.TileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}');
    let miniMap = new L.Control.MiniMap(mapLayer, { toggleDisplay: true }).addTo(mymap);

    legend = L.control({ position: 'bottomleft' });

    //Eventos de zoom y capas
    mymap.on('overlayadd', (e) => {
        // Hacer zoom 
        mymap.fitBounds(e.layer.getBounds());

        mymap.closePopup();

        if (e.layer.legend != undefined) {
            legend.onAdd = e.layer.legend;
            legend.addTo(mymap);
        }
    });

    mymap.addControl(control);
}