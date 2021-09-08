import {GLTFLoader} from "./GLTFLoader.js";

let scene = new THREE.Scene();
var mouse = new THREE.Vector2();
var raycaster = new THREE.Raycaster();
let color_1, color_2;
let light, material_1, material_2, field_material, ground_material, loader;
let INTERSECTED;
var player_1, player_2, field, puck, ground;
const renderer = new THREE.WebGLRenderer();
const rectLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
let camera;

// load .gltf files and set objects to them
function loadModels() {
     
     loader = new GLTFLoader();
     loader.load("./3D-Models/Field.glb", function(gltf){
         field = gltf.scene;
         scene.add(gltf.scene);
         field.castShadow = true;
     })
     loader.load("./3D-Models/Player_1.gltf", function(gltf){
         player_1 = gltf.scene;
         scene.add(gltf.scene);
         player_1.castShadow = true;
         player_1.traverse( ( child, i ) => {
             if ( child.isMesh ) {
                 child.material = material_1
                 child.material.side = THREE.DoubleSide
             }
         })
     })
     loader.load("./3D-Models/Player_2.gltf", function(gltf){
         player_2 = gltf.scene;
         scene.add(gltf.scene);
         player_2.castShadow = true;
         player_2.traverse( ( child, i ) => {
             if ( child.isMesh ) {
                 child.material = material_2
                 child.material.side = THREE.DoubleSide
             }
         })
     })
     loader.load("../3D-Models/Puck.gltf", function(gltf){
         puck = gltf.scene;
         scene.add(gltf.scene);
         puck.castShadow = true;
     })

     loader.load("./3D-Models/wide_flat_cube.gltf", function(gltf){
         ground = gltf.scene;
         ground.castShadow = true;
         ground.traverse( ( child, i ) => {
             if ( child.isMesh ) {
                 child.material = ground_material
                 child.material.side = THREE.DoubleSide
                 console.log()
             }
         })
         ground.visible = false;
         ground.position.set( 0, 3, 0 )
         scene.add(ground);
     })
     console.log("player_2 is " + player_2);
     console.log("player_1 is " + player_1);
     console.log("field is " + field);
}

// set materals, add lights to scene
function setScene() {
     // Color and Material ------------------
     material_1 = new THREE.MeshLambertMaterial({
     color:'#D8FFA9'
     });
     material_2 = new THREE.MeshLambertMaterial({
         color:'#FFA9CA'
     });
     field_material = new THREE.MeshLambertMaterial({
         color:'#FFE0BD'
     });
     ground_material = new THREE.MeshBasicMaterial({
         color: '#ECCCC9'
     });
     color_1 = new THREE.Color('#FFCD82');
     color_2 = new THREE.Color('#82E4FF');

     // Scene ------------------------------
     scene.background = new THREE.Color( '#E0F4C0' );
     light = new THREE.HemisphereLight(0xfffff, 0x000000, 0.6 );
     scene.add(light);
     light.position.set(0,30,0)
     rectLight.position.set( -5, 10, -10 );
     rectLight.lookAt( 0, 0, 0 );
     rectLight.castShadow = true;
     rectLight.shadow.mapSize.width = 512; 
     rectLight.shadow.mapSize.height = 512; 
     rectLight.shadow.camera.near = 0.5;
     rectLight.shadow.camera.far = 500; 
     scene.add( rectLight )
}

function setCamera() {
     camera = new THREE.PerspectiveCamera(
     75,
     window.innerWidth / window.innerHeight,
     0.01,
     1000
     );
     camera.position.set( 15, 30, 0 );
     camera.lookAt( 0, 0, 0 );
}

// change picture on window resize
function onWindowResize() {
     camera.aspect = window.innerWidth / window.innerHeight;
     camera.updateProjectionMatrix();
     renderer.setSize( window.innerWidth, window.innerHeight );
}

function onMouseMove( event ) {
	// calculate mouse position in normalized device coordinates
	// (-1 to +1) for both components
	mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// change position of player_1
function move_player( x, z, player) {
     // var gamma = 0.3;
     var delta = 0.1;

     //console.log(x, z);
     
     if ( player.position.x < x ) { 
         player.position.x += delta;
     }  
     if ( player.position.x > x ) { 
         player.position.x -= delta;
     }
     if ( player.position.z < z ) {
         player.position.z += delta;
     }
     if ( player.position.z > z ) {
         player.position.z -= delta;
     }
}

function move_camera() {
     camera.position.x += 0.01;
     camera.position.y += 0.01;
}

// setup renderer and append to document body
function setRenderer() { 
     renderer.setSize(window.innerWidth, window.innerHeight);
     renderer.shadowMap.enabled = true;
     renderer.shadowMap.type = THREE.PCFSoftShadowMap;
     document.body.appendChild(renderer.domElement);
}

function control_player(player) {
     raycaster.setFromCamera(mouse, camera);
     const full_intersects = raycaster.intersectObjects( scene.children, true ); 
     
     if ( full_intersects.length > 0 ) {
         var intersects = full_intersects.slice( 1, full_intersects.length );

         // get the intersection point in the 3D world
         var point = full_intersects[ 0 ].point  
         var x, z;            
         x = point.x // depth
         z = point.z - 18.5 // width
         
         move_player(x, z, player);
         
         if ( intersects.length > 1 ) {

             /* 

             // change color of object mous points at
             if ( INTERSECTED != intersects[ 0 ].object ) {

                 if ( INTERSECTED ) 
                 INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

                 INTERSECTED = intersects[ 0 ].object;
                 INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
                 INTERSECTED.material.emissive.setHex( 0xff0000 );
                 // document.addEventListener( 'mousedown', onDocumentMouseDown, false );
             }
             */
         }

     } else {

         if ( INTERSECTED ) INTERSECTED.material.emissive.setHex( INTERSECTED.currentHex );

         INTERSECTED = null;
     }
}

class Loop {

     constructor(camera, scene, renderer, onMouseMove) {
          // this.player = player;
          this.camera = camera;
          this.scene = scene;
          this.renderer = renderer;
          this.onMouseMove = onMouseMove;
          this.updatables = [];
          window.addEventListener('mousemove', this.onMouseMove, false);
     }
     
     start() {
         // requestAnimationFrame(animate);
         
         /*if (player_1 && player_2 && field) {
              console.log("all important components available")
         }*/

         // highlight();
         window.addEventListener( 'resize', onWindowResize );

         // animation
         this.renderer.setAnimationLoop(() => {
              // update scene 
              this.tick();
              // render frame
              this.renderer.render(this.scene, this.camera);
         });
     }

     stop() {
         renderer.setAnimationLoop(null);
     }

     // changes between frames
     tick() {
          // move_camera();
          if (player_1) {
               control_player(player_1);
          }
     }
}

/*
const controls = new THREE.MapControls(camera, renderer.domElement);
controls.update();
*/

setCamera();
loadModels();
// console.log(models);
setScene();
setRenderer();
window.addEventListener('mousemove', onMouseMove, false);
// console.log(this.player_1);

const loop = new Loop(camera, scene, renderer);
loop.start();
console.log("end");
// animate();