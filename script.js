import * as THREE from 'three';

const canvasContainer = document.getElementById('canvasContainer');
const arButton = document.getElementById('arButton');

// Create a scene and camera
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 5;

// Create a renderer
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
canvasContainer.appendChild(renderer.domElement);

// Create a cube (you can replace this with your 3D model)
const geometry = new THREE.BoxGeometry();
const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const cube = new THREE.Mesh(geometry, material);
scene.add(cube);

// Handle AR button click
arButton.addEventListener('click', () => {
    // Check if WebXR is supported
    if ('xr' in navigator) {
        // Request AR session
        navigator.xr.requestSession('immersive-ar').then((session) => {
            // Attach the renderer to the XR session's base layer
            const xrLayer = new THREE.XRWebGLLayer(session, renderer);
            session.updateRenderState({ baseLayer: xrLayer });

            // Add the cube to the scene
            scene.add(cube);

            // Start rendering the scene in AR
            session.requestAnimationFrame(onXRFrame);

            // Handle session end
            session.addEventListener('end', () => {
                // Clean up and remove the cube
                scene.remove(cube);
                session.cancelAnimationFrame(onXRFrame);
                session.end();
            });
        }).catch((error) => {
            console.error('Error starting AR session:', error);
        });
    } else {
        console.error('WebXR not supported');
    }
});

// Handle XR frame rendering
function onXRFrame(timestamp, xrFrame) {
    const pose = xrFrame.getViewerPose(xrFrame.session.baseLayer.frameOfReference);
    if (pose) {
        const view = pose.views[0];
        const viewport = xrFrame.session.baseLayer.getViewport(view);
        camera.projectionMatrix = view.projectionMatrix;
        const viewMatrix = new THREE.Matrix4().fromArray(view.transform.inverse.matrix);
        camera.matrixWorldInverse.copy(viewMatrix);
        renderer.setSize(viewport.width, viewport.height);
        renderer.render(scene, camera);
    }
    xrFrame.session.requestAnimationFrame(onXRFrame);
}
