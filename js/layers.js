// Grupos de capas e información relativa
const layerGroups = {
    waypoints: {
        name: "Zonas de interes en Gandía"
    },
    patricova: {
        name: `Riesgo de inundaciones`,
        scale: ['bfdeff', '5badff', '007fff', '003fff', '0000ff'],
        style: patricovaCSS,
        preHtml: `<h6>Riesgo de inundaciones</h6>&nbsp;`,
        postHtml: ``
    }, 
    rain: {
        name: `Precipitaciones del 2019`,
        scale: ['E3F2FD', 'BBDEFB', '90CAF9', '64B5F6', '42A5F5', '2196F3', '1E88E5', '1976D2', '1565C0', '0D47A1'],
        preHtml: `<h6>Lluvias</h6>&nbsp;`,
        postHtml: ``
    },
    isobaras: {
        name: `Isobaras del tiempo 2019`,
        style: isobarasCSS,
        preHtml: `<h6>Isobaras del tiempo</h6>&nbsp;`,
        postHtml: ``
    }
}

// Función para leer archivos .shp
function readShapeLayers(url, name, info, showInfo) {

    fetch(url).then(r => r.arrayBuffer()).then((buffer) => {

        let shapeLayer;

        if (showInfo) {
            // Leemos archivo
            shapeLayer = new L.Shapefile(buffer, {
                onEachFeature: (feature, marker) => {
                    if (name.includes("inundaciones")) {
                        marker.bindPopup(`
                        <h6>Probabilidad de inundacion en este municipio</h6>
                        <br><br><h6>Riesgo:</h6> <i style="color: #70483c; font-size: 20px" class="fa fa-globe" aria-hidden="true"></i>&nbsp ${feature.properties.leyenda}
                        `);
                    }
                },
                style: info.style
            });
        } else {
            shapeLayer = new L.Shapefile(url);
        }

        if (name.includes("inundaciones")) {
            shapeLayer.legend = function () {

                var div = L.DomUtil.create('div', 'info legend');
                div.addEventListener("scroll", function (e) {
                    e.preventDefault();
                });
                div.innerHTML = `
                <h6>Riesgo inundaciones</h6>
                <div style="box-sizing: border-box;">
                <i style="background:#bfdeff"></i> <p>Muy bajo</p>
                <i style="background:#5badff"></i> <p>Bajo</p>
                <i style="background:#007fff"></i> <p>Medio</p>
                <i style="background:#003fff"></i> <p>Alto</p>
                <i style="background:#0000ff"></i> <p>Muy alto</p>
                </div>
                `;
                return div;
            };
        }

        // Cargamos capa
        control.addOverlay(shapeLayer, name, { groupName: info.name, expanded: true });
    })
}

function readTifLayers(url, name, info, showInfo) {
    fetch(url).then(r => r.arrayBuffer()).then((buffer) => {
        let s = new L.ScalarField.fromGeoTIFF(buffer);
        let tifLayer = new L.canvasLayer.scalarField(s, {
            range: s.range, 
            color: chroma.scale(info.scale).domain(s.range).classes(30),
            opacity: 0.85
        });

        if (showInfo) {
            tifLayer.on("click", (e) => {
                if (e.value !== null) {
                    let popup = L.popup()
                        .setLatLng(e.latlng)
                        .setContent(`<h5>${name}</h5>${info.preHtml}<b>${parseFloat(e.value).toFixed(2)} ${info.postHtml}</b>`)
                        .openOn(mymap);
                }
            });
        }
        
        if (name.includes("Precipitaciones")) {
            tifLayer.legend = function () {

                var div = L.DomUtil.create('div', 'info legend');
                div.addEventListener("scroll", function (e) {
                    e.preventDefault();
                });
                div.innerHTML = `
                <h6>Precipitaciones:</h6>
                <div style="box-sizing: border-box;">
                <i style="background:#bfdeff"></i> <p>Muy bajo</p>
                <i style="background:#5badff"></i> <p>Bajo</p>
                <i style="background:#007fff"></i> <p>Medio</p>
                <i style="background:#003fff"></i> <p>Alto</p>
                <i style="background:#0000ff"></i> <p>Muy alto</p>
                </div>
                `;
                return div;
            };
        }

        // Cargamos capa
        control.addOverlay(tifLayer, name, { groupName: info.name, expanded: true });
    });
}

function readKmlLayer(url, name, info) {
    // Load kml file
    fetch(url)
        .then(res => res.text())
        .then(kmltext => {
            // Create new kml overlay
            const parser = new DOMParser();
            const kml = parser.parseFromString(kmltext, 'text/xml');
            const track = new L.KML(kml);
            control.addOverlay(track, name, { groupName: info.name, expanded: true });
        });
}

// Función para obtener la extensión de los archivos
function getFileExtension(filename) {
    return filename.substring(filename.lastIndexOf('.') + 1, filename.length).toLowerCase() || filename.toLowerCase();
}

function patricovaCSS(feature) {

    // Estilos comunes
    let style = {
        color: "#6e6e6e",
        opacity: 1,
        fillOpacity: 0.7
    }

    switch (feature.properties.leyenda) {
        case 'Muy bajo': return { ...style, fillColor: "#bfdeff" };
        case "Bajo": return { ...style, fillColor: "#5badff" };
        case "Medio": return { ...style, fillColor: "#007fff" };
        case "Alto": return { ...style, fillColor: "#003fff" };
        case "Muy alto": return { ...style, fillColor: "#0000ff" };
    }
}

function isobarasCSS(feature) {

}

