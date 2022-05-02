import './style.css'
import * as dat from 'dat.gui'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader.js'
import firefliesVertexShader from './shaders/fire/vertex.glsl'
import firefliesFragmentShader from './shaders/fire/fragment.glsl'
import portalVertexShader from './shaders/portal/vertex.glsl'
import portalFragmentShader from './shaders/portal/fragment.glsl'



/**
 * Base
 */
// Debug
const debugObject = {}
const gui = new dat.GUI({
    width: 400
})

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Loaders
 */
// Texture loader
const textureLoader = new THREE.TextureLoader()
const bakedTexture = textureLoader.load('baked.jpg')
bakedTexture.flipY = false
bakedTexture.encoding = THREE.sRGBEncoding

// Draco loader
const dracoLoader = new DRACOLoader()
dracoLoader.setDecoderPath('draco/')

// GLTF loader
const gltfLoader = new GLTFLoader()
gltfLoader.setDRACOLoader(dracoLoader)

//fog
scene.fog = new THREE.Fog(0x14020f, 0.2 , 10);


//material
//baked
const bakedMaterial = new THREE.MeshBasicMaterial({map: bakedTexture})

//POLE LIGHT
const poleLightMaterial = new THREE.MeshBasicMaterial({color: 0xFFFFFF})

//Portal Material
const portalMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uTime: {value: 0},
        uColorStart: { value: new THREE.Color(0xcc00cc)},
        uColorEnd: { value: new THREE.Color(0xdf73ff)}
    },
    vertexShader: portalVertexShader,
    fragmentShader: portalFragmentShader
})


//MODEL
gltfLoader.load(
    'portal2.glb',
    (gltf) => 
    {
    
    const bakedMesh = gltf.scene.children.find(child => child.name === 'floor001')
    bakedMesh.material = bakedMaterial
    //    gltf.scene.children.find((child) => {console.log(child)})
        

        const poleLightMeshA = gltf.scene.children.find(child => child.name === 'Cube015')
        const poleLightMeshB = gltf.scene.children.find(child => child.name === 'poleLightB')
        const portalLightMesh = gltf.scene.children.find(child => child.name === 'Circle')

        portalLightMesh.material = portalMaterial
        poleLightMeshB.material = poleLightMaterial
        poleLightMeshA.material = poleLightMaterial

        gltf.scene.rotation.y += 3.15
        // gltf.scene.position.x += 2
        // gltf.scene.position.z += 1
        scene.add(gltf.scene)
    }
)


//Fireflies
const fireFliesGeometry = new THREE.BufferGeometry()
const fireFliesCount = 40
const positionArray = new Float32Array(fireFliesCount * 3)
const scaleArray = new Float32Array(fireFliesCount)

for(let i=0; i < fireFliesCount; i++){
    positionArray[i * 3 + 0] = (Math.random() - 0.5) * 4
    positionArray[i * 3 + 1] = Math.random() * 1.8 + 0.5
    positionArray[i * 3 + 2] = (Math.random() - 0.5) * 4

    scaleArray[i] = Math.random()
}
fireFliesGeometry.setAttribute('position', new THREE.BufferAttribute(positionArray, 3))
fireFliesGeometry.setAttribute('aScale', new THREE.BufferAttribute(positionArray, 1))

//material
const fireFliesMaterial = new THREE.ShaderMaterial({
    uniforms:
    {
        uTime: { value: 0 },
        uPixelRatio: {value: Math.min(devicePixelRatio, 2)},
        uSize: { value: 100 }
    },
    vertexShader: firefliesVertexShader,
    fragmentShader: firefliesFragmentShader,
    transparent: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false
})



//points
const fireFlies = new THREE.Points(fireFliesGeometry, fireFliesMaterial)
scene.add(fireFlies)


/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))


    //updte fireflies
    fireFliesMaterial.uniforms.uPixelRatio.value = Math.min(devicePixelRatio, 2)
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(65, sizes.width / sizes.height, 0.1, 100)
camera.position.x = 1
camera.position.y = 1
camera.position.z = 2.7
scene.add(camera)


// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
camera.lookAt(0, 1, 0)

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas,
    antialias: true
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
renderer.outputEncoding = THREE.sRGBEncoding


debugObject.clearColor = '#0c0218'
renderer.setClearColor(debugObject.clearColor)
gui
.addColor(debugObject, 'clearColor')
.onChange(() => {
    renderer.setClearColor(debugObject.clearColor)
})

/**
 * Animate
 */
const clock = new THREE.Clock()

const tick = () =>
{
    const elapsedTime = clock.getElapsedTime()

    fireFliesMaterial.uniforms.uTime.value = elapsedTime
    portalMaterial.uniforms.uTime.value = elapsedTime

    // Update controls
    //controls.update()

    // Render
    renderer.render(scene, camera)

    // Call tick again on the next frame
    window.requestAnimationFrame(tick)
}

tick()