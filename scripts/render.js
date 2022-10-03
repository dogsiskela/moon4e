import calcPosFromLatLonRad from "./methods.js";


let lastSelectedObject = null;
let lastSelectedColor = 'yellow';

var targetRotationX = 0.5;

var targetRotationY = 0.2;

var mouseX = 0;
var mouseXOnMouseDown = 0;
var targetRotationOnMouseDownX = 0;

var mouseY = 0;
var mouseYOnMouseDown = 0;
var targetRotationOnMouseDownY = 0;

var windowHalfX = (window.innerWidth * 0.6) / 2;
var windowHalfY = window.innerHeight / 2;

var slowingFactor = 0.25;

var scene;
var camera;

let points = [];

let moonObject;

let jsonData;

function init() {

    //Init scene
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(30, (window.innerWidth * 0.6) / window.innerHeight, 0.1, 1000);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth * 0.6, window.innerHeight);
    document.getElementById('moon').appendChild(renderer.domElement);
    camera.position.z = 65;
    scene.background = new THREE.TextureLoader().load('assets/textures/stars.jpg');


    //Moon object init
    var geometry = new THREE.SphereGeometry(15, 1024, 1024)
    const displacementMap = new THREE.TextureLoader().load(
        'assets/textures/moon_dis2.jpg'
    )
    const texture = new THREE.TextureLoader().load('assets/textures/moon3.jpg');
    const material = new THREE.MeshStandardMaterial({ map: texture, displacementMap: displacementMap, displacementScale: 1.6, roughness: 100.0 });
    moonObject = new THREE.Mesh(geometry, material);

    moonObject.geometry.computeVertexNormals();
    scene.add(moonObject);


    //Lights
    var light = new THREE.DirectionalLight(0xffffff, 0.7)
    var light2 = new THREE.DirectionalLight(0xdeb05d, 0.9)
    light.position.set(-20, 20, 60)
    light2.position.set(20, -20, 60)
    scene.add(light)
    scene.add(light2)


    getDotsFromJson();

    document.addEventListener('mousedown', onDocumentMouseDown, false);
    document.addEventListener('mousemove', onMouseMove, false);


    function animate() {
        requestAnimationFrame(animate);

        rotateAroundWorldAxis(moonObject, new THREE.Vector3(0, 1, 0), targetRotationX);
        rotateAroundWorldAxis(moonObject, new THREE.Vector3(1, 0, 0), targetRotationY);

        targetRotationY = targetRotationY * (1 - slowingFactor);
        targetRotationX = targetRotationX * (1 - slowingFactor);

        renderer.render(scene, camera);
    };


    animate();
}

init();

async function getDotsFromJson() {
    const response = await fetch("data.json");
    //lista od site podatoci
    const json = await response.json();
    jsonData = json;

    for (let item in json) {
        // if (json[item].Year < 1980) {

        let latlon = [json[item].Lat, json[item].Long]
        var geometryDot = new THREE.SphereGeometry(0.25, 20, 20)
        var materialDot = new THREE.MeshBasicMaterial({

            color: new THREE.Color('yellow')
        })
        var point = new THREE.Mesh(geometryDot, materialDot);
        point.name = json[item].id;
        if (json[item].depth) {
            materialDot.color = new THREE.Color('red')
        }
        var latlonpoint = calcPosFromLatLonRad(latlon[0], latlon[1], 15);
        point.position.set(latlonpoint[0], latlonpoint[1], latlonpoint[2]);
        moonObject.add(point)
        points.push(point)
        // }

    }
}
function resetFields() {
    document.getElementById('lat').innerHTML = "";
    document.getElementById('long').innerHTML = "";
    document.getElementById('type').innerHTML = "";
    document.getElementById('depth').innerHTML = "";
    document.getElementById('year').innerHTML = "";
    document.getElementById('magnitude').innerHTML = "";

}
function onMouseMove(event) {
    var mouse = new THREE.Vector2();
    mouse.x = (event.clientX / (window.innerWidth * 0.6)) * 2 - 1;
    mouse.y = - (event.clientY / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(points);
    //raycaster vrakja prazni points
    if (intersects.length > 0 && intersects[0].object.uuid != lastSelectedObject) {
        if (lastSelectedObject) {
            let point = points.find(el => el.uuid == lastSelectedObject);
            point.material.color = new THREE.Color(lastSelectedColor);
            resetFields();
            lastSelectedObject = null;
        }
        let idCurrent = intersects[0].object.name;
        let currentData = jsonData.find(el => el.id == idCurrent);
        console.log(currentData)
        
        
        intersects[0].object.material.color = new THREE.Color('white')
        
        lastSelectedObject = intersects[0].object.uuid;
        lastSelectedColor = 'yellow';
        
        document.getElementById('lat').innerHTML = currentData.Lat;
        document.getElementById('long').innerHTML = currentData.Long;
        if (currentData.depth) {
            document.getElementById('depth').innerHTML = currentData.depth;
            lastSelectedColor = 'red';
        }
        document.getElementById('type').innerHTML = currentData.type;
        document.getElementById('year').innerHTML = currentData.Year;
        if (currentData.Magnitude) {
            document.getElementById('magnitude').innerHTML = currentData.Magnitude;
        }

    }
    else if ((intersects.length == 0 && lastSelectedObject != null)) {
        let point = points.find(el => el.uuid == lastSelectedObject);
        ///
        point.material.color = new THREE.Color(lastSelectedColor);
        resetFields();
        ///
        lastSelectedObject = null;
    }

}

document.getElementById('zIndexPlus').addEventListener('click', function (evt) {
    console.log('changed')
    camera.position.z = camera.position.z + 10;
});

document.getElementById('zIndexMinus').addEventListener('click', function (evt) {
    console.log('changed')
    camera.position.z = camera.position.z - 10;
});



function rotateAroundWorldAxis(object, axis, radians) {

    var rotationMatrix = new THREE.Matrix4();

    rotationMatrix.makeRotationAxis(axis.normalize(), radians);
    rotationMatrix.multiply(object.matrix);                       // pre-multiply
    object.matrix = rotationMatrix;
    object.rotation.setFromRotationMatrix(object.matrix);
}

function onDocumentMouseDown(event) {

    event.preventDefault();

    document.addEventListener('mousemove', onDocumentMouseMove, false);
    document.addEventListener('mouseup', onDocumentMouseUp, false);
    document.addEventListener('mouseout', onDocumentMouseOut, false);

    mouseXOnMouseDown = event.clientX - windowHalfX;
    targetRotationOnMouseDownX = targetRotationX;

    mouseYOnMouseDown = event.clientY - windowHalfY;
    targetRotationOnMouseDownY = targetRotationY;
}



function onDocumentMouseMove(event) {

    mouseX = event.clientX - windowHalfX;

    targetRotationX = (mouseX - mouseXOnMouseDown) * 0.00025;

    mouseY = event.clientY - windowHalfY;

    targetRotationY = (mouseY - mouseYOnMouseDown) * 0.00025;
}
function onDocumentMouseUp(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

function onDocumentMouseOut(event) {

    document.removeEventListener('mousemove', onDocumentMouseMove, false);
    document.removeEventListener('mouseup', onDocumentMouseUp, false);
    document.removeEventListener('mouseout', onDocumentMouseOut, false);
}

