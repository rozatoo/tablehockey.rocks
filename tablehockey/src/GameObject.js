import { SpriteMaterial } from "./three.module.js";

class GameObject {
     constructor(name, source, material, gltfLoader) {
          this.name = name;
          this.source = source;
          this.delta_x = 0;   // depth
          this.delta_z = 0;   // width
          this.delta_y = 0;   // height
          this.gltfLoader = gltfLoader;
          this.model;
          this.material = material;
          loadModel(this.source, this.gltfLoader);
          setMaterial();
     }

     loadModel(source, gltfLoader) {
          gltfLoader.load(source, function(gltf){
              this.model = gltf.scene;
              this.model.castShadow = true;
          })
     }

     setMaterial() {
          this.model.traverse( (child, i) => {
               if ( child.isMesh ) {
                    child.material = this.material;
                    child.material.side = THREE.DoubleSid;
               }
          } )
     }
}