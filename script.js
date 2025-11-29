// --- AUDIO SYSTEM ---
const audio = document.getElementById('bg-music');
const bars = document.querySelectorAll('.bar');
let isPlaying = false;
audio.volume = 0.5;

function toggleMusic() {
    if (isPlaying) {
        audio.pause();
        bars.forEach(bar => bar.style.animationPlayState = 'paused');
    } else {
        audio.play();
        bars.forEach(bar => bar.style.animationPlayState = 'running');
    }
    isPlaying = !isPlaying;
}

// --- UI INTERACTIONS ---
function scrollToProjects() {
    const section = document.getElementById('projects');
    section.style.display = "block";
    gsap.to(section, {
        duration: 1,
        opacity: 1,
        y: 0,
        ease: "power3.out",
        onComplete: () => {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// --- MAGNETIC BUTTONS ---
const magnets = document.querySelectorAll('.magnetic');

magnets.forEach((magnet) => {
    magnet.addEventListener('mousemove', (e) => {
        const rect = magnet.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        gsap.to(magnet, { duration: 0.3, x: x * 0.5, y: y * 0.5, ease: "power2.out" });
    });
    magnet.addEventListener('mouseleave', () => {
        gsap.to(magnet, { duration: 1, x: 0, y: 0, ease: "elastic.out(1, 0.3)" });
    });
});

// --- 3D WARP DRIVE BACKGROUND ---
const container = document.getElementById('canvas-container');
const scene = new THREE.Scene();
scene.fog = new THREE.FogExp2(0x020203, 0.002);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
camera.position.z = 10;

const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

// 1. STARFIELD
const starGeometry = new THREE.BufferGeometry();
const starCount = 6000;
const starPos = new Float32Array(starCount * 3);
for(let i = 0; i < starCount * 3; i++) starPos[i] = (Math.random() - 0.5) * 600;
starGeometry.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const stars = new THREE.Points(starGeometry, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7, transparent: true, opacity: 0.8 }));
scene.add(stars);

// 2. NEON TUNNEL
const boxGeometry = new THREE.BoxGeometry(0.5, 0.5, 0.5);
const boxMaterial = new THREE.MeshBasicMaterial({ color: 0x00f3ff, wireframe: true });
const boxCount = 400;
const tunnel = new THREE.InstancedMesh(boxGeometry, boxMaterial, boxCount);
const dummy = new THREE.Object3D();
const boxData = [];

for (let i = 0; i < boxCount; i++) {
    const angle = (i / boxCount) * Math.PI * 20;
    const radius = 10 + Math.random() * 20;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    const z = (i / boxCount) * 400 - 200;
    dummy.position.set(x, y, z);
    dummy.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, 0);
    dummy.scale.set(Math.random() * 2, Math.random() * 2, Math.random() * 2);
    dummy.updateMatrix();
    tunnel.setMatrixAt(i, dummy.matrix);
    boxData.push({ x, y, z, speed: Math.random() * 0.5 + 0.2 });
}
scene.add(tunnel);

let mouseX = 0, mouseY = 0, targetX = 0, targetY = 0;
document.addEventListener('mousemove', (event) => {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.001;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.001;
});

const clock = new THREE.Clock();
function animate() {
    const time = clock.getElapsedTime();
    
    // Stars
    const starPositions = stars.geometry.attributes.position.array;
    for(let i = 0; i < starCount; i++) {
        const i3 = i * 3;
        starPositions[i3 + 2] += 2; 
        if(starPositions[i3 + 2] > 50) starPositions[i3 + 2] = -300;
    }
    stars.geometry.attributes.position.needsUpdate = true;

    // Tunnel
    for (let i = 0; i < boxCount; i++) {
        let { x, y, z, speed } = boxData[i];
        z += speed * 15;
        if (z > 50) z = -300;
        boxData[i].z = z;
        const twist = z * 0.01 + time * 0.2;
        dummy.position.set(x * Math.cos(twist) - y * Math.sin(twist), x * Math.sin(twist) + y * Math.cos(twist), z);
        dummy.rotation.x = time * speed + i;
        dummy.rotation.y = time * speed;
        dummy.updateMatrix();
        tunnel.setMatrixAt(i, dummy.matrix);
    }
    tunnel.instanceMatrix.needsUpdate = true;

    targetX = mouseX * 20; targetY = mouseY * 20;
    camera.position.x += (targetX - camera.position.x) * 0.05;
    camera.position.y += (-targetY - camera.position.y) * 0.05;
    camera.lookAt(0, 0, -50);
    stars.rotation.z = time * 0.05 + (mouseX * 0.5);

    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();