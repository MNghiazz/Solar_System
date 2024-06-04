import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import * as THREE from 'three';
import { texture } from 'three/examples/jsm/nodes/Nodes.js';

const planetData = [
  { name: 'Mercury', size: 4.22, texture: 'texture/mercury_texture.jpg'},
  { name: 'Venus', size: 5.025, texture: 'texture/venus_texture.jpg' },
  { name: 'Earth', size: 5.185, texture: 'texture/earth_texture.jpg' },
  { name: 'Mars', size: 6.695, texture: 'texture/mars_texture.jpg' },
  { name: 'Jupiter', size: 34.955, texture: 'texture/jupiter_texture.jpg' },
  { name: 'Saturn', size: 29.115, texture: 'texture/saturn_texture.jpg' },
  { name: 'Uranus', size: 12.68, texture: 'texture/uranus_texture.jpg' },
  { name: 'Neptune', size: 12.31, texture: 'texture/neptune_texture.jpg' }
];

const initialOrbitAngles = [
  0, // Mercury
  Math.PI / 6, // Venus
  Math.PI / 3, // Earth
  Math.PI / 2, // Mars
  Math.PI, // Jupiter
  Math.PI * 1.2, // Saturn
  Math.PI * 1.5, // Uranus
  Math.PI * 1.7 // Neptune
];

const moonData = [
  { parent: 'Earth', size: 1.2, texture: 'texture/moon_texture.jpg', orbitRadius: 10, orbitSpeed: 0.05 }
];



// Renderer Elements
var ctx = document.body.appendChild(document.createElement('canvas')).getContext('2d'),
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true
  });

document.body.appendChild(renderer.domElement);
renderer.domElement.style.position =
  ctx.canvas.style.position = 'fixed';
ctx.canvas.style.background = 'black';

function resize() {
  var width = window.innerWidth;
  var height = window.innerHeight;

  // Set the renderer size to match the window size
  renderer.setSize(width, height);
  ctx.canvas.width = width;
  ctx.canvas.height = height;

  // Center the renderer horizontally and vertically
  renderer.domElement.style.left = ctx.canvas.style.left = (width - renderer.domElement.width) / 2 + 'px';
  renderer.domElement.style.top = ctx.canvas.style.top = (height - renderer.domElement.height) / 2 + 'px';
}




window.addEventListener('resize', resize);

resize();

// Scene and Camera
var scene = new THREE.Scene();

var camera = new THREE.PerspectiveCamera(
  20, // Field of view
  16 / 9, // Aspect ratio
  0.1, // Near plane
  10000 // Far plane
);

camera.position.set(700, 235, 0);

var controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 1;


var sunTexture = new THREE.TextureLoader().load('texture/sun_texture.jpg');

// Create a material with the loaded texture
var sunMaterial = new THREE.MeshBasicMaterial({ map: sunTexture });

// Create a sphere geometry for the sun
var sunGeometry = new THREE.SphereGeometry(50, 64, 64); // Adjust the size and segments as needed

// Objects
var starColor = (function() {
  var colors = [0xffae3c ];
  return colors[Math.floor(Math.random() * colors.length)];
})(),
star = new THREE.Mesh(sunGeometry, sunMaterial),
glows = [];

star.castShadow = false;
scene.add(star);

for (var i = 1, scaleX = 1.1, scaleY = 1.1, scaleZ = 1.1; i < 5; i++) {
  var starGlow = new THREE.Mesh(
    new THREE.IcosahedronGeometry(20, 2),
    new THREE.MeshBasicMaterial({
      color: starColor,
      transparent: true,
      opacity: 0.2
    })
  );
  starGlow.castShadow = false;
  scaleX += 0.4 + Math.random() * .2;
  scaleY += 0.4 + Math.random() * .2;
  scaleZ += 0.4 + Math.random() * .2;
  starGlow.scale.set(scaleX, scaleY, scaleZ);
  starGlow.origScale = {
    x: scaleX,
    y: scaleY,
    z: scaleZ
  };
  glows.push(starGlow);
  scene.add(starGlow);
  }

// Texture Loader
var textureLoader = new THREE.TextureLoader();

// Planets
var planets = [];

planetData.forEach((data, index) => {
  var size = data.size,
  texture = textureLoader.load(data.texture),
    // Increase the detail level by adding more segments
    planetGeom = new THREE.Mesh(
      new THREE.SphereGeometry(size, 64, 64), // 64 segments for a rounder appearance
      new THREE.MeshLambertMaterial({
        map: texture,
        flatShading: true
      })  
    ),
    planet = new THREE.Object3D();

  planet.add(planetGeom);

  planet.name = data.name;

  // Increase separation between planets, especially for larger planets
  const baseOrbitRadius = 50;
  const separationFactor = 2; // Increase this factor for more separation
  planet.orbitRadius = baseOrbitRadius * separationFactor;

  if(data.name == 'Venus') {
    planet.orbitRadius += 80;
  }
  if(data.name == 'Earth') {
    planet.orbitRadius += 130;
  }

  if(data.name == 'Mars') {
    planet.orbitRadius += 200;
  }
  if (data.name === 'Jupiter') {
    planet.orbitRadius += 300; // Increase the separation for Jupiter
  }
  if (data.name === 'Saturn') {
    planet.orbitRadius += 520; // Increase the separation for Saturn
  }
  if (data.name === 'Uranus') {
    planet.orbitRadius += 650; // Increase the separation for Saturn
  }
  if(data.name === 'Neptune') {
    planet.orbitRadius += 780;
  }


  planet.rotSpeed = 0.005 + Math.random() * 0.01;
  planet.rotSpeed *= Math.random() < .10 ? -1 : 1;
  planet.rot = Math.random();

  // Adjust orbitSpeed for each planet
  planet.orbitSpeed = (0.02 - index * 0.0048) * 0.25;
  if (data.name === 'Jupiter') {
    planet.orbitSpeed *= 5; // Speed up Jupiter's orbit
  }

  planet.orbit = initialOrbitAngles[index];
  planet.position.set(planet.orbitRadius, 0, 0);

  planets.push(planet);
  scene.add(planet);


  var orbit = new THREE.Line(
    new THREE.CircleGeometry(planet.orbitRadius, 90),
    new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0,
      side: THREE.BackSide
    })
  );

  // Shift the vertices by modifying the position attribute
  var position = orbit.geometry.attributes.position;
  var newPosition = new Float32Array(position.count * 3); // Create a new typed array
  for (let i = 0; i < position.count; i++) {
    let index = i * 3;
    newPosition[index] = position.array[index + 3];
    newPosition[index + 1] = position.array[index + 4];
    newPosition[index + 2] = position.array[index + 5];
  }
  position.array = newPosition;
  position.needsUpdate = true;

  orbit.rotation.x = (90 * Math.PI) / 180;
  scene.add(orbit);

  


});




//Adding saturn ring

const saturn = planets.find(planet => planet.name === 'Saturn');

if (saturn) {
  // Define ring parameters
  const saturnRingInnerRadius = 35;
  const saturnRingOuterRadius = 55;
  const saturnRingThickness = 1;
  const saturnRingSegments = 100;

  // Create ring geometry
  const ringGeometry = new THREE.RingGeometry(saturnRingInnerRadius, saturnRingOuterRadius, saturnRingSegments);
  ringGeometry.computeBoundingBox();

  // Create ring material
  const ringTexture = textureLoader.load('texture/saturn_ring_texture.png');
  const ringMaterial = new THREE.MeshLambertMaterial({
    map: ringTexture,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.8
  });

  // Create ring mesh
  const ringMesh = new THREE.Mesh(ringGeometry, ringMaterial);

  // Rotate the ring to align with Saturn's rotation
  ringMesh.rotation.x = Math.PI / 2;

  // Position the ring relative to Saturn
  saturn.add(ringMesh);
} else {
  console.error('Saturn planet object not found in the scene.');
}

//Adding moon to Earth

function addMoons() {
  moonData.forEach(data => {
    // Find the parent planet
    const parentPlanet = planets.find(planet => planet.name === 'Earth');

    if (parentPlanet) {
      // Create moon geometry and material
      const moonGeometry = new THREE.SphereGeometry(data.size, 32, 32);
      const moonTexture = textureLoader.load(data.texture);
      const moonMaterial = new THREE.MeshLambertMaterial({ map: moonTexture });

      // Create moon mesh
      const moonMesh = new THREE.Mesh(moonGeometry, moonMaterial);

      // Set moon's orbit properties
      moonMesh.orbitRadius = data.orbitRadius;
      moonMesh.orbitSpeed = data.orbitSpeed;
      moonMesh.orbit = Math.random() * Math.PI * 2; // Set initial orbit angle

      // Position the moon relative to its parent planet
      moonMesh.position.set(data.orbitRadius, 0, 0);

      // Add moon as a child of its parent planet
      parentPlanet.add(moonMesh);
    }else {
      console.log('can not find the parent planet');
    }
  });
}

// Call the function to add moons
addMoons();



// Lights
var light1 = new THREE.PointLight(starColor, 2, 0, 0);

light1.position.set(0, 0, 0);
scene.add(light1);

var light2 = new THREE.AmbientLight(0x090909);
scene.add(light2);



var hemisphereLight = new THREE.HemisphereLight(0xffffbb, 0x080820, 0.3);
scene.add(hemisphereLight);



// 2D Background Stars
var bgStars = [];

for (var i = 0; i < 600; i++) {
  var tw = {
    x: Math.random(),
    y: Math.random()
  }

  bgStars.push(tw);
}

function animate() {
  requestAnimationFrame(animate);

  glows.forEach(function (starGlow) {
    starGlow.scale.x = starGlow.origScale.x + Math.sin(Date.now() * .002) * 0.1;
    starGlow.scale.y = starGlow.origScale.y + Math.sin(Date.now() * .002) * 0.1;
    starGlow.scale.z = starGlow.origScale.z + Math.sin(Date.now() * .002) * 0.1;
  });


  planets.forEach(function (planet) {
    planet.orbit += planet.orbitSpeed;
    planet.rotation.y += planet.rotSpeed;
    planet.position.x = Math.cos(planet.orbit) * planet.orbitRadius;
    planet.position.z = Math.sin(planet.orbit) * planet.orbitRadius;
  });

  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
  ctx.save();
  ctx.fillStyle = 'white';
  for (var s in bgStars) {
    var q = bgStars[s],
      oX = q.x * ctx.canvas.width,
      oY = q.y * ctx.canvas.height,
      size = Math.random() < .9998 ? Math.random() : Math.random() * 3;

    ctx.beginPath();
    ctx.moveTo(oX, oY - size);
    ctx.lineTo(oX + size, oY);
    ctx.lineTo(oX, oY + size);
    ctx.lineTo(oX - size, oY);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  controls.update();
  renderer.render(scene, camera);
}

animate();