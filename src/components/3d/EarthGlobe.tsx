import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ObservationHotspot, EnvironmentalCategory } from '../../types';
import { GLOBAL_HOTSPOTS } from '../../data/earthData';
import {
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Layers,
  MapPin,
  Radio,
  Eye,
  Crosshair,
  Satellite,
  Compass,
} from 'lucide-react';

interface EarthGlobeProps {
  onSelectHotspot: (hotspot: ObservationHotspot) => void;
  selectedHotspotId?: string | null;
  activeCategoryFilter?: EnvironmentalCategory | 'all';
}

export const EarthGlobe: React.FC<EarthGlobeProps> = ({
  onSelectHotspot,
  selectedHotspotId,
  activeCategoryFilter = 'all',
}) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [hoveredHotspot, setHoveredHotspot] = useState<ObservationHotspot | null>(null);
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number }>({ lat: 0, lng: 0 });
  const [mapMode, setMapMode] = useState<'radar' | 'satellite' | 'dark'>('radar');
  const [showOrbit, setShowOrbit] = useState<boolean>(true);
  const [isAutoRotating, setIsAutoRotating] = useState<boolean>(true);
  const [cameraZoomLevel, setCameraZoomLevel] = useState<number>(2.4);

  // References to three objects for interaction
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const globeGroupRef = useRef<THREE.Group | null>(null);
  const markersGroupRef = useRef<THREE.Group | null>(null);
  const satelliteMeshRef = useRef<THREE.Group | null>(null);
  const orbitLineRef = useRef<THREE.Line | null>(null);
  const targetRotationRef = useRef<{ x: number; y: number } | null>(null);

  // Filtered hotspots
  const filteredHotspots = GLOBAL_HOTSPOTS.filter(
    (h) => activeCategoryFilter === 'all' || h.category === activeCategoryFilter
  );

  // Helper to convert Lat/Lng to 3D Sphere vector
  const latLngToVector3 = (lat: number, lng: number, radius: number): THREE.Vector3 => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const z = radius * Math.sin(phi) * Math.sin(theta);
    const y = radius * Math.cos(phi);
    return new THREE.Vector3(x, y, z);
  };

  // Convert 3D vector back to Lat/Lng
  const vector3ToLatLng = (v: THREE.Vector3): { lat: number; lng: number } => {
    const r = v.length();
    const lat = 90 - (Math.acos(v.y / r) * 180) / Math.PI;
    const theta = Math.atan2(v.z, -v.x);
    const lng = (theta * 180) / Math.PI - 180;
    const normalizedLng = ((lng + 180) % 360) - 180;
    return {
      lat: Math.round(lat * 10) / 10,
      lng: Math.round(normalizedLng * 10) / 10,
    };
  };

  // Category color mapper
  const getCategoryColor = (category: EnvironmentalCategory): number => {
    switch (category) {
      case 'flood':
        return 0x00f0ff; // Neon cyan
      case 'forest':
        return 0x10b981; // Emerald
      case 'agriculture':
        return 0xfacc15; // Amber
      case 'earthquake':
        return 0xf43f5e; // Rose / red
      case 'glacier':
        return 0xa855f7; // Purple
      case 'wetland':
        return 0x06b6d4; // Teal
      default:
        return 0x38bdf8;
    }
  };

  // Procedural Earth Texture Generator
  const createEarthCanvasTexture = (mode: 'radar' | 'satellite' | 'dark'): THREE.CanvasTexture => {
    const canvas = document.createElement('canvas');
    canvas.width = 2048;
    canvas.height = 1024;
    const ctx = canvas.getContext('2d')!;

    // Base Ocean
    if (mode === 'dark') {
      ctx.fillStyle = '#050a14';
      ctx.fillRect(0, 0, 2048, 1024);
    } else if (mode === 'satellite') {
      const oceanGrad = ctx.createLinearGradient(0, 0, 0, 1024);
      oceanGrad.addColorStop(0, '#0c2340');
      oceanGrad.addColorStop(0.5, '#07162c');
      oceanGrad.addColorStop(1, '#0c2340');
      ctx.fillStyle = oceanGrad;
      ctx.fillRect(0, 0, 2048, 1024);
    } else {
      // Radar mode: dark navy with radar grid lines
      ctx.fillStyle = '#060d1f';
      ctx.fillRect(0, 0, 2048, 1024);

      // Radar scanline grid lines
      ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
      ctx.lineWidth = 1;
      for (let lat = 0; lat <= 1024; lat += 64) {
        ctx.beginPath();
        ctx.moveTo(0, lat);
        ctx.lineTo(2048, lat);
        ctx.stroke();
      }
      for (let lng = 0; lng <= 2048; lng += 64) {
        ctx.beginPath();
        ctx.moveTo(lng, 0);
        ctx.lineTo(lng, 1024);
        ctx.stroke();
      }
    }

    // Procedural Landmass Contours & Continents
    const drawLandmass = (
      cx: number,
      cy: number,
      rx: number,
      ry: number,
      color: string,
      glow: string
    ) => {
      ctx.save();
      ctx.fillStyle = color;
      ctx.shadowColor = glow;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
      ctx.fill();

      // Organic coastlines
      for (let i = 0; i < 8; i++) {
        const ox = cx + (Math.sin(i * 1.3) * rx * 0.75);
        const oy = cy + (Math.cos(i * 1.5) * ry * 0.75);
        const rad = (rx + ry) * 0.22;
        ctx.beginPath();
        ctx.arc(ox, oy, rad, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    const landColor =
      mode === 'satellite'
        ? '#1e3a24'
        : mode === 'radar'
        ? '#0e2646'
        : '#0f172a';
    const landGlow =
      mode === 'radar' ? '#00f0ff' : 'rgba(16, 185, 129, 0.3)';

    // Approximate major continental landmass centers on equirectangular projection
    // North America
    drawLandmass(520, 360, 260, 190, landColor, landGlow);
    // South America
    drawLandmass(720, 680, 180, 240, landColor, landGlow);
    // Eurasia
    drawLandmass(1380, 340, 460, 220, landColor, landGlow);
    // Africa
    drawLandmass(1140, 560, 210, 260, landColor, landGlow);
    // India Subcontinent
    drawLandmass(1440, 510, 120, 130, landColor, landGlow);
    // Australia
    drawLandmass(1740, 720, 160, 130, landColor, landGlow);
    // Greenland / Arctic
    drawLandmass(860, 160, 140, 90, '#475569', '#38bdf8');
    // Antarctica
    drawLandmass(1024, 980, 900, 70, '#334155', '#94a3b8');

    // Add city lights / radar reflection points
    ctx.fillStyle = mode === 'radar' ? 'rgba(0, 240, 255, 0.85)' : 'rgba(250, 204, 21, 0.75)';
    const sampleLights = [
      [540, 380], [480, 410], [510, 350], [1120, 310], [1150, 330],
      [1430, 490], [1460, 520], [1680, 380], [1720, 410], [740, 710],
      [1160, 590], [1730, 740]
    ];
    sampleLights.forEach(([x, y]) => {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    });

    const texture = new THREE.CanvasTexture(canvas);
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.ClampToEdgeWrapping;
    return texture;
  };

  // Initialize Three.js scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    // Scene
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // Camera
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(0, 0.4, cameraZoomLevel);
    cameraRef.current = camera;

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.2;
    rendererRef.current = renderer;

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Group for Earth globe
    const globeGroup = new THREE.Group();
    scene.add(globeGroup);
    globeGroupRef.current = globeGroup;

    // Base Sphere
    const globeGeometry = new THREE.SphereGeometry(1, 64, 64);
    const globeMaterial = new THREE.MeshStandardMaterial({
      map: createEarthCanvasTexture(mapMode),
      roughness: 0.55,
      metalness: 0.1,
      bumpScale: 0.05,
    });
    const globeMesh = new THREE.Mesh(globeGeometry, globeMaterial);
    globeGroup.add(globeMesh);

    // Atmospheric Glow (Outer Fresnel Shield)
    const atmosphereGeometry = new THREE.SphereGeometry(1.035, 64, 64);
    const atmosphereMaterial = new THREE.ShaderMaterial({
      vertexShader: `
        varying vec3 vNormal;
        void main() {
          vNormal = normalize(normalMatrix * normal);
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        varying vec3 vNormal;
        void main() {
          float intensity = pow(0.72 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.6);
          gl_FragColor = vec4(0.0, 0.94, 1.0, 1.0) * intensity * 1.5;
        }
      `,
      blending: THREE.AdditiveBlending,
      side: THREE.BackSide,
      transparent: true,
    });
    const atmosphereMesh = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
    globeGroup.add(atmosphereMesh);

    // Markers Group
    const markersGroup = new THREE.Group();
    globeGroup.add(markersGroup);
    markersGroupRef.current = markersGroup;

    // NISAR Orbit Line (Polar sun-synchronous 98.4 deg inclination)
    const orbitPoints: THREE.Vector3[] = [];
    const orbitRadius = 1.34; // 747km altitude scaled
    for (let i = 0; i <= 180; i++) {
      const angle = (i / 180) * Math.PI * 2;
      const x = orbitRadius * Math.sin(angle);
      const y = orbitRadius * Math.cos(angle) * Math.cos(THREE.MathUtils.degToRad(98.4));
      const z = orbitRadius * Math.cos(angle) * Math.sin(THREE.MathUtils.degToRad(98.4));
      orbitPoints.push(new THREE.Vector3(x, y, z));
    }
    const orbitGeometry = new THREE.BufferGeometry().setFromPoints(orbitPoints);
    const orbitMaterial = new THREE.LineBasicMaterial({
      color: 0x00f0ff,
      transparent: true,
      opacity: 0.45,
    });
    const orbitLine = new THREE.Line(orbitGeometry, orbitMaterial);
    globeGroup.add(orbitLine);
    orbitLineRef.current = orbitLine;

    // NISAR 3D Satellite Model
    const satGroup = new THREE.Group();
    // Bus body
    const busGeo = new THREE.BoxGeometry(0.04, 0.04, 0.06);
    const busMat = new THREE.MeshStandardMaterial({ color: 0xe2e8f0, metalness: 0.8, roughness: 0.2 });
    const bus = new THREE.Mesh(busGeo, busMat);
    satGroup.add(bus);

    // Solar panels
    const panelGeo = new THREE.BoxGeometry(0.18, 0.005, 0.04);
    const panelMat = new THREE.MeshStandardMaterial({ color: 0x1e3a8a, metalness: 0.9, roughness: 0.1 });
    const panel = new THREE.Mesh(panelGeo, panelMat);
    satGroup.add(panel);

    // 12-meter deployable mesh reflector dish (cone/parabolic)
    const dishGeo = new THREE.ConeGeometry(0.08, 0.02, 16, 1, true);
    const dishMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      wireframe: true,
      side: THREE.DoubleSide,
    });
    const dish = new THREE.Mesh(dishGeo, dishMat);
    dish.rotation.x = Math.PI * 0.5;
    dish.position.z = 0.05;
    satGroup.add(dish);

    globeGroup.add(satGroup);
    satelliteMeshRef.current = satGroup;

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const sunLight = new THREE.DirectionalLight(0xffffff, 1.8);
    sunLight.position.set(5, 3, 5);
    scene.add(sunLight);

    const backRimLight = new THREE.DirectionalLight(0x00f0ff, 0.9);
    backRimLight.position.set(-5, -2, -4);
    scene.add(backRimLight);

    // Animation Loop
    let animationFrameId: number;
    let clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      const delta = clock.getDelta();
      const time = clock.getElapsedTime();

      // Auto rotation
      if (isAutoRotating && !targetRotationRef.current && globeGroupRef.current) {
        globeGroupRef.current.rotation.y += delta * 0.08;
      }

      // Smooth camera fly-to target rotation if active
      if (targetRotationRef.current && globeGroupRef.current) {
        const tr = targetRotationRef.current;
        globeGroupRef.current.rotation.y += (tr.y - globeGroupRef.current.rotation.y) * 0.08;
        globeGroupRef.current.rotation.x += (tr.x - globeGroupRef.current.rotation.x) * 0.08;
        if (
          Math.abs(tr.y - globeGroupRef.current.rotation.y) < 0.002 &&
          Math.abs(tr.x - globeGroupRef.current.rotation.x) < 0.002
        ) {
          targetRotationRef.current = null;
        }
      }

      // Animate NISAR satellite along orbit path
      if (satelliteMeshRef.current) {
        const orbitSpeed = time * 0.35;
        const x = orbitRadius * Math.sin(orbitSpeed);
        const y = orbitRadius * Math.cos(orbitSpeed) * Math.cos(THREE.MathUtils.degToRad(98.4));
        const z = orbitRadius * Math.cos(orbitSpeed) * Math.sin(THREE.MathUtils.degToRad(98.4));
        satelliteMeshRef.current.position.set(x, y, z);
        satelliteMeshRef.current.lookAt(0, 0, 0);
      }

      // Pulsing hotspot rings
      if (markersGroupRef.current) {
        markersGroupRef.current.children.forEach((child) => {
          if (child instanceof THREE.Mesh && child.userData.isRing) {
            const scale = 1 + Math.sin(time * 3 + (child.userData.phase || 0)) * 0.25;
            child.scale.set(scale, scale, scale);
          }
        });
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mouse drag interaction
    let isDragging = false;
    let prevMousePos = { x: 0, y: 0 };

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      targetRotationRef.current = null;
      prevMousePos = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (isDragging && globeGroupRef.current) {
        const deltaX = e.clientX - prevMousePos.x;
        const deltaY = e.clientY - prevMousePos.y;
        globeGroupRef.current.rotation.y += deltaX * 0.005;
        globeGroupRef.current.rotation.x += deltaY * 0.005;
        prevMousePos = { x: e.clientX, y: e.clientY };
      }

      // Raycasting for hotspot hover & lat/long coordinates
      if (!isDragging && container && cameraRef.current && globeGroupRef.current) {
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );

        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);

        // Check markers
        if (markersGroupRef.current) {
          const markerIntersects = raycaster.intersectObjects(
            markersGroupRef.current.children,
            true
          );
          if (markerIntersects.length > 0) {
            const found = markerIntersects[0].object.userData.hotspot;
            if (found) {
              setHoveredHotspot(found);
              container.style.cursor = 'pointer';
              return;
            }
          } else {
            setHoveredHotspot(null);
            container.style.cursor = isDragging ? 'grabbing' : 'grab';
          }
        }

        // Check globe intersection for Lat/Long readout
        const globeIntersects = raycaster.intersectObject(globeMesh);
        if (globeIntersects.length > 0) {
          const pt = globeIntersects[0].point.clone();
          // Inverse transform by globe rotation
          pt.applyEuler(new THREE.Euler(-globeGroupRef.current.rotation.x, -globeGroupRef.current.rotation.y, 0, 'YXZ'));
          const coords = vector3ToLatLng(pt);
          setMouseCoords(coords);
        }
      }
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    const onClick = (e: MouseEvent) => {
      if (container && cameraRef.current && markersGroupRef.current) {
        const rect = container.getBoundingClientRect();
        const mouse = new THREE.Vector2(
          ((e.clientX - rect.left) / rect.width) * 2 - 1,
          -((e.clientY - rect.top) / rect.height) * 2 + 1
        );
        const raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(mouse, cameraRef.current);
        const markerIntersects = raycaster.intersectObjects(
          markersGroupRef.current.children,
          true
        );
        if (markerIntersects.length > 0) {
          const found = markerIntersects[0].object.userData.hotspot;
          if (found) {
            onSelectHotspot(found);
          }
        }
      }
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setCameraZoomLevel((prev) => {
        const next = Math.max(1.6, Math.min(4.2, prev + e.deltaY * 0.002));
        if (cameraRef.current) {
          cameraRef.current.position.z = next;
        }
        return next;
      });
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
    container.addEventListener('click', onClick);
    container.addEventListener('wheel', onWheel, { passive: false });

    const handleResize = () => {
      if (!container || !rendererRef.current || !cameraRef.current) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      cameraRef.current.aspect = w / h;
      cameraRef.current.updateProjectionMatrix();
      rendererRef.current.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      container.removeEventListener('click', onClick);
      container.removeEventListener('wheel', onWheel);
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
    };
  }, [mapMode]);

  // Update Markers when filters or selection changes
  useEffect(() => {
    if (!markersGroupRef.current) return;
    const group = markersGroupRef.current;

    // Clear old markers
    while (group.children.length > 0) {
      const obj = group.children[0];
      group.remove(obj);
    }

    filteredHotspots.forEach((hotspot, idx) => {
      const pos = latLngToVector3(hotspot.lat, hotspot.lng, 1.015);
      const isSelected = selectedHotspotId === hotspot.id;
      const colorHex = getCategoryColor(hotspot.category);

      // Center sphere pin
      const pinGeo = new THREE.SphereGeometry(isSelected ? 0.024 : 0.016, 16, 16);
      const pinMat = new THREE.MeshBasicMaterial({
        color: isSelected ? 0xffffff : colorHex,
      });
      const pinMesh = new THREE.Mesh(pinGeo, pinMat);
      pinMesh.position.copy(pos);
      pinMesh.userData = { hotspot };
      group.add(pinMesh);

      // Glowing pulsing radar ping ring
      const ringGeo = new THREE.RingGeometry(0.02, 0.035, 24);
      const ringMat = new THREE.MeshBasicMaterial({
        color: colorHex,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: isSelected ? 0.95 : 0.6,
      });
      const ringMesh = new THREE.Mesh(ringGeo, ringMat);
      ringMesh.position.copy(pos);
      ringMesh.lookAt(0, 0, 0);
      ringMesh.userData = { hotspot, isRing: true, phase: idx };
      group.add(ringMesh);
    });
  }, [filteredHotspots, selectedHotspotId]);

  // Smooth fly-to when selectedHotspotId changes
  useEffect(() => {
    if (!selectedHotspotId || !globeGroupRef.current) return;
    const target = GLOBAL_HOTSPOTS.find((h) => h.id === selectedHotspotId);
    if (!target) return;

    // Convert lat/lng to target rotation angles
    const targetY = -((target.lng + 180) * (Math.PI / 180)) + Math.PI * 0.5;
    const targetX = (target.lat * (Math.PI / 180)) * 0.7;

    targetRotationRef.current = {
      x: targetX,
      y: targetY,
    };
  }, [selectedHotspotId]);

  const handleZoom = (delta: number) => {
    setCameraZoomLevel((prev) => {
      const next = Math.max(1.6, Math.min(4.2, prev + delta));
      if (cameraRef.current) {
        cameraRef.current.position.z = next;
      }
      return next;
    });
  };

  const handleResetView = () => {
    if (globeGroupRef.current) {
      targetRotationRef.current = { x: 0.2, y: -0.6 };
    }
  };

  return (
    <div className="relative w-full h-[620px] lg:h-[720px] rounded-2xl overflow-hidden border border-cyan-500/20 bg-slate-950/70 backdrop-blur-xl shadow-2xl">
      {/* 3D Canvas Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Top Left: Mission HUD Readout */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none">
        <div className="glass-panel px-3.5 py-2.5 rounded-lg border border-cyan-500/30 text-xs font-mono">
          <div className="flex items-center gap-2 text-cyan-400 font-semibold mb-1">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>NISAR ORBITAL TRACK: 747 KM SSO</span>
          </div>
          <div className="text-slate-400 text-[11px] flex gap-4">
            <span>INCLINATION: <strong className="text-white">98.4°</strong></span>
            <span>REPEAT: <strong className="text-white">12 DAYS</strong></span>
            <span>SWATH: <strong className="text-white">242 KM</strong></span>
          </div>
        </div>
      </div>

      {/* Top Right: Map Display Modes & Satellite Toggles */}
      <div className="absolute top-4 right-4 z-20 flex flex-wrap gap-2">
        <div className="glass-panel p-1 rounded-lg border border-cyan-500/30 flex gap-1 text-xs font-mono">
          <button
            onClick={() => setMapMode('radar')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapMode === 'radar'
                ? 'bg-cyan-500/30 text-cyan-300 font-bold border border-cyan-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            RADAR SAR
          </button>
          <button
            onClick={() => setMapMode('satellite')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapMode === 'satellite'
                ? 'bg-emerald-500/30 text-emerald-300 font-bold border border-emerald-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            SATELLITE
          </button>
          <button
            onClick={() => setMapMode('dark')}
            className={`px-2.5 py-1 rounded transition-colors ${
              mapMode === 'dark'
                ? 'bg-indigo-500/30 text-indigo-300 font-bold border border-indigo-400/40'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            DEEP DARK
          </button>
        </div>

        <button
          onClick={() => {
            setShowOrbit(!showOrbit);
            if (orbitLineRef.current) orbitLineRef.current.visible = !showOrbit;
            if (satelliteMeshRef.current) satelliteMeshRef.current.visible = !showOrbit;
          }}
          className={`glass-panel px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
            showOrbit
              ? 'border-cyan-400/50 text-cyan-300 bg-cyan-950/60'
              : 'border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Toggle NISAR Satellite Orbit Track"
        >
          <Satellite className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">NISAR ORBIT</span>
        </button>

        <button
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          className={`glass-panel px-3 py-1 rounded-lg border text-xs font-mono flex items-center gap-1.5 transition-colors ${
            isAutoRotating
              ? 'border-cyan-400/50 text-cyan-300 bg-cyan-950/60'
              : 'border-slate-700 text-slate-400 hover:text-white'
          }`}
          title="Toggle Auto-Rotation"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${isAutoRotating ? 'animate-spin' : ''}`} />
          <span className="hidden sm:inline">ROTATE</span>
        </button>
      </div>

      {/* Floating Hovered Hotspot Tooltip */}
      {hoveredHotspot && (
        <div className="absolute top-20 left-4 z-30 max-w-sm glass-panel-glow p-4 rounded-xl border border-cyan-400/50 shadow-2xl text-xs animate-in fade-in duration-200">
          <div className="flex items-center justify-between mb-1.5">
            <span className="px-2 py-0.5 rounded text-[10px] font-mono uppercase font-bold tracking-wider bg-cyan-950 border border-cyan-500/40 text-cyan-300">
              {hoveredHotspot.category}
            </span>
            <span className="text-slate-400 font-mono text-[10px]">
              {hoveredHotspot.lat.toFixed(2)}°N, {hoveredHotspot.lng.toFixed(2)}°E
            </span>
          </div>
          <h4 className="font-chakra text-sm font-bold text-white mb-1">
            {hoveredHotspot.name}
          </h4>
          <p className="text-slate-300 text-[11px] mb-2 leading-relaxed">
            {hoveredHotspot.description}
          </p>
          <div className="grid grid-cols-2 gap-1.5 font-mono text-[10px] bg-slate-900/60 p-2 rounded border border-slate-700/60 mb-2">
            <div>
              <span className="text-slate-400">RADAR Δ:</span>{' '}
              <strong className={hoveredHotspot.deltaDb < 0 ? 'text-cyan-400' : 'text-emerald-400'}>
                {hoveredHotspot.deltaDb > 0 ? `+${hoveredHotspot.deltaDb}` : hoveredHotspot.deltaDb} dB
              </strong>
            </div>
            <div>
              <span className="text-slate-400">BAND:</span>{' '}
              <strong className="text-white">{hoveredHotspot.nisarBand}</strong>
            </div>
            <div>
              <span className="text-slate-400">AREA:</span>{' '}
              <strong className="text-white">{hoveredHotspot.affectedAreaSqKm.toLocaleString()} km²</strong>
            </div>
            <div>
              <span className="text-slate-400">COHERENCE:</span>{' '}
              <strong className="text-white">{hoveredHotspot.coherenceScore.toFixed(2)}</strong>
            </div>
          </div>
          <button
            onClick={() => onSelectHotspot(hoveredHotspot)}
            className="w-full py-1.5 rounded bg-cyan-500/30 hover:bg-cyan-500/50 text-cyan-200 font-medium flex items-center justify-center gap-1.5 border border-cyan-400/50 transition-all font-chakra tracking-wide"
          >
            <Eye className="w-3.5 h-3.5" /> EXPLORE RADAR ANALYSIS
          </button>
        </div>
      )}

      {/* Bottom Controls: Zoom, Reset, and Live Lat/Long Bar */}
      <div className="absolute bottom-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Coordinates readout */}
        <div className="glass-panel px-3 py-1.5 rounded-lg border border-cyan-500/30 text-xs font-mono text-cyan-300 flex items-center gap-2 pointer-events-auto">
          <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
          <span>
            LAT: <strong className="text-white">{mouseCoords.lat}°</strong> | LNG:{' '}
            <strong className="text-white">{mouseCoords.lng}°</strong>
          </span>
        </div>

        {/* Zoom & Reset Buttons */}
        <div className="flex gap-2 pointer-events-auto">
          <button
            onClick={() => handleZoom(-0.4)}
            className="glass-panel p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom(0.4)}
            className="glass-panel p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleResetView}
            className="glass-panel p-2 rounded-lg border border-slate-700 text-slate-300 hover:text-cyan-400 hover:border-cyan-400/50 transition-colors"
            title="Reset Orientation"
          >
            <Compass className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
