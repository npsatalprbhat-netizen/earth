import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { ObservationHotspot } from '../../types';
import { Box, Layers, Eye, Activity, Droplets, Mountain, HelpCircle } from 'lucide-react';

interface Disaster3DViewerProps {
  hotspot: ObservationHotspot;
}

export const Disaster3DViewer: React.FC<Disaster3DViewerProps> = ({ hotspot }) => {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const [viewState, setViewState] = useState<'after' | 'difference'>('difference');
  const [showWireframe, setShowWireframe] = useState<boolean>(true);
  const [waterLevel, setWaterLevel] = useState<number>(1.2);
  const [verticalExaggeration, setVerticalExaggeration] = useState<number>(2.5);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const terrainMeshRef = useRef<THREE.Mesh | null>(null);
  const waterMeshRef = useRef<THREE.Mesh | null>(null);

  // Generate grid elevation matrix
  const gridSize = 32;
  const generateElevationGrid = () => {
    const beforeGrid: number[][] = [];
    const afterGrid: number[][] = [];

    for (let r = 0; r < gridSize; r++) {
      beforeGrid[r] = [];
      afterGrid[r] = [];
      for (let c = 0; c < gridSize; c++) {
        // Base terrain elevation with natural hills & river valley
        const distFromCenter = Math.hypot(r - gridSize / 2, c - gridSize / 2);
        const riverValley = Math.sin(c * 0.25) * 1.5;
        const hill = Math.cos(r * 0.2) * Math.sin(c * 0.15) * 2.2;
        const baseHeight = 2.0 + hill - (r > 12 && r < 20 ? 1.8 : 0) + riverValley;

        beforeGrid[r][c] = baseHeight;

        // Disaster impact
        if (hotspot.category === 'flood') {
          // River breach fills valley floor with flood layer
          afterGrid[r][c] = r > 10 && r < 22 && c > 6 && c < 26 ? baseHeight - 0.9 : baseHeight;
        } else if (hotspot.category === 'earthquake') {
          // Fault displacement step
          const faultStep = c > gridSize / 2 ? 1.4 : -1.4;
          afterGrid[r][c] = baseHeight + faultStep;
        } else if (hotspot.category === 'glacier') {
          // Glacier thinning
          afterGrid[r][c] = baseHeight - (distFromCenter < 10 ? 1.8 : 0.2);
        } else {
          // Forest degradation / soil subsidence
          afterGrid[r][c] = baseHeight - (distFromCenter < 12 ? 0.8 : 0.1);
        }
      }
    }
    return { beforeGrid, afterGrid };
  };

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(20, 18, 24);
    camera.lookAt(0, 0, 0);
    cameraRef.current = camera;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
      renderer.setSize(width || 600, height || 400);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      rendererRef.current = renderer;
    } catch (e) {
      console.warn('WebGL is not available in Disaster3DViewer:', e);
      setWebglSupported(false);
      return;
    }

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0x00f0ff, 1.4);
    dirLight.position.set(15, 20, 10);
    scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0xf59e0b, 0.6);
    fillLight.position.set(-15, 10, -10);
    scene.add(fillLight);

    // Ground Grid Helper
    const gridHelper = new THREE.GridHelper(30, 30, 0x00f0ff, 0x1e3a5f);
    gridHelper.position.y = -1;
    scene.add(gridHelper);

    // Terrain Plane Geometry
    const terrainGeo = new THREE.PlaneGeometry(24, 24, gridSize - 1, gridSize - 1);
    terrainGeo.rotateX(-Math.PI / 2);

    const terrainMat = new THREE.MeshStandardMaterial({
      roughness: 0.7,
      metalness: 0.1,
      wireframe: showWireframe,
      vertexColors: true,
    });

    const terrainMesh = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrainMesh);
    terrainMeshRef.current = terrainMesh;

    // Water Inundation Plane
    const waterGeo = new THREE.PlaneGeometry(24, 24);
    waterGeo.rotateX(-Math.PI / 2);
    const waterMat = new THREE.MeshStandardMaterial({
      color: 0x00f0ff,
      roughness: 0.1,
      metalness: 0.8,
      transparent: true,
      opacity: hotspot.category === 'flood' ? 0.65 : 0.0,
    });
    const waterMesh = new THREE.Mesh(waterGeo, waterMat);
    waterMesh.position.y = waterLevel;
    scene.add(waterMesh);
    waterMeshRef.current = waterMesh;

    // Animation & Mouse Controls
    let isDragging = false;
    let prevMouse = { x: 0, y: 0 };
    let rotX = 0.5;
    let rotY = 0.6;

    const onMouseDown = (e: MouseEvent) => {
      isDragging = true;
      prevMouse = { x: e.clientX, y: e.clientY };
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isDragging) return;
      const dx = e.clientX - prevMouse.x;
      const dy = e.clientY - prevMouse.y;
      rotY += dx * 0.008;
      rotX = Math.max(0.1, Math.min(1.4, rotX + dy * 0.008));
      prevMouse = { x: e.clientX, y: e.clientY };

      const radius = 32;
      camera.position.x = radius * Math.cos(rotY) * Math.cos(rotX);
      camera.position.z = radius * Math.sin(rotY) * Math.cos(rotX);
      camera.position.y = radius * Math.sin(rotX);
      camera.lookAt(0, 0, 0);
    };

    const onMouseUp = () => {
      isDragging = false;
    };

    container.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    let frameId: number;
    const render = () => {
      frameId = requestAnimationFrame(render);
      if (waterMeshRef.current && hotspot.category === 'flood') {
        waterMeshRef.current.position.y = waterLevel + Math.sin(Date.now() * 0.002) * 0.05;
      }
      renderer.render(scene, camera);
    };
    render();

    return () => {
      container.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      cancelAnimationFrame(frameId);
      renderer.dispose();
    };
  }, []);

  // Update Terrain Heights & Colors based on viewState
  useEffect(() => {
    if (!terrainMeshRef.current) return;
    const mesh = terrainMeshRef.current;
    const geo = mesh.geometry as THREE.PlaneGeometry;
    const pos = geo.attributes.position;
    const { beforeGrid, afterGrid } = generateElevationGrid();

    const colors: number[] = [];
    let vertexIdx = 0;

    for (let r = 0; r < gridSize; r++) {
      for (let c = 0; c < gridSize; c++) {
        const bH = beforeGrid[r][c];
        const aH = afterGrid[r][c];
        const delta = aH - bH;

        let finalHeight = bH;
        let color = new THREE.Color(0x38bdf8);

        if (viewState === 'after') {
          finalHeight = aH * verticalExaggeration * 0.4;
          // Submerged / scarred area colored red or dark teal
          if (Math.abs(delta) > 0.3) {
            color.setHex(hotspot.category === 'flood' ? 0x0284c7 : 0xe11d48);
          } else {
            color.setHSL(0.35 - (aH / 6) * 0.25, 0.7, 0.45);
          }
        } else {
          // Difference mode
          finalHeight = (bH + delta * 2.0) * verticalExaggeration * 0.4;
          if (delta < -0.3) {
            color.setHex(0x00f0ff); // Subsidence / inundation
          } else if (delta > 0.3) {
            color.setHex(0xf43f5e); // Uplift / deformation
          } else {
            color.setHex(0x1e293b); // Stable
          }
        }

        pos.setY(vertexIdx, finalHeight);
        colors.push(color.r, color.g, color.b);
        vertexIdx++;
      }
    }

    geo.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
    pos.needsUpdate = true;
    geo.computeVertexNormals();

    const mat = mesh.material as THREE.MeshStandardMaterial;
    mat.wireframe = showWireframe;
    mat.needsUpdate = true;
  }, [viewState, showWireframe, verticalExaggeration, hotspot]);

  return (
    <div className="flex flex-col lg:flex-row gap-6 bg-slate-900/80 rounded-2xl p-6 border border-cyan-500/30 glass-panel-glow">
      {/* 3D Canvas Side */}
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Box className="w-5 h-5 text-cyan-400" />
            <h3 className="font-chakra text-lg font-bold text-white tracking-wide">
              3D DIGITAL SURFACE ELEVATION & RADAR RELIEF
            </h3>
          </div>
          <div className="flex gap-1.5 glass-panel p-1 rounded-lg border border-cyan-500/30 text-xs font-mono">
            <button
              onClick={() => setViewState('after')}
              className={`px-3 py-1 rounded transition-colors ${
                viewState === 'after'
                  ? 'bg-rose-500 text-white font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              POST-DISASTER 3D RELIEF
            </button>
            <button
              onClick={() => setViewState('difference')}
              className={`px-3 py-1 rounded transition-colors ${
                viewState === 'difference'
                  ? 'bg-emerald-500 text-slate-950 font-bold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              3D DELTA Δ DISPLACEMENT
            </button>
          </div>
        </div>

        {/* 3D Viewport or 2D Topographic Contour Fallback */}
        {webglSupported ? (
          <div
            ref={mountRef}
            className="w-full h-[400px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative cursor-grab active:cursor-grabbing"
          >
            <div className="absolute top-3 left-3 glass-panel px-2.5 py-1.5 rounded text-[11px] font-mono text-slate-300 pointer-events-none">
              DRAG TO ROTATE 3D PERSPECTIVE
            </div>
          </div>
        ) : (
          <div className="w-full h-[400px] rounded-xl overflow-hidden bg-slate-950 border border-slate-800 relative flex flex-col items-center justify-center p-6 text-center">
            <Mountain className="w-10 h-10 text-cyan-400 mb-2 opacity-80" />
            <div className="text-white font-chakra text-lg font-bold">Topographic Radar Inundation Model</div>
            <div className="text-slate-400 text-xs font-mono max-w-sm mt-1">
              DEM elevation baseline: <strong className="text-cyan-300">{hotspot.elevationDeltaMeters}m</strong> vertical surface displacement.
            </div>
            <div className="mt-4 px-4 py-2 rounded-lg bg-cyan-950/80 border border-cyan-500/30 text-cyan-300 font-mono text-xs">
              Measured InSAR Coherence: {(hotspot.coherenceScore * 100).toFixed(0)}% • Mode: {viewState.toUpperCase()}
            </div>
          </div>
        )}

        {/* Bottom Toggles */}
        <div className="flex items-center justify-between mt-3 text-xs font-mono text-slate-300">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showWireframe}
              onChange={(e) => setShowWireframe(e.target.checked)}
              className="accent-cyan-400"
            />
            <span>SHOW RADAR FACET WIREFRAME</span>
          </label>

          <div className="flex items-center gap-3">
            <span>VERTICAL EXAGGERATION:</span>
            <input
              type="range"
              min="1"
              max="5"
              step="0.5"
              value={verticalExaggeration}
              onChange={(e) => setVerticalExaggeration(parseFloat(e.target.value))}
              className="w-24 accent-cyan-400"
            />
            <span className="text-cyan-400 font-bold">{verticalExaggeration}x</span>
          </div>
        </div>
      </div>

      {/* Scientific Metrics & Extraction Explanation Side */}
      <div className="w-full lg:w-96 flex flex-col justify-between bg-slate-950/70 p-5 rounded-xl border border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold mb-3 uppercase tracking-wider">
            <Activity className="w-4 h-4" />
            EXTRACTED NASA-ISRO SAR VALUES
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>CALIBRATED BACKSCATTER (σ⁰)</span>
                <span className="text-cyan-300 font-bold">{hotspot.radarCharacteristics.polarization}</span>
              </div>
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-chakra text-slate-300">Observed Intensity:</span>
                <span className="text-sm font-chakra text-cyan-300 font-bold">{hotspot.afterBackscatterDb} dB</span>
              </div>
              <div className="mt-1 text-xs font-mono font-bold text-cyan-400 flex items-center justify-between">
                <span>NET SENSITIVITY SHIFT:</span>
                <span className={hotspot.deltaDb < 0 ? 'text-cyan-400' : 'text-emerald-400'}>
                  {hotspot.deltaDb > 0 ? `+${hotspot.deltaDb}` : hotspot.deltaDb} dB
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>INTERFEROMETRIC COHERENCE (γ)</span>
                <span className="text-indigo-300 font-bold">InSAR PHASE</span>
              </div>
              <div className="text-lg font-chakra font-bold text-white">
                {hotspot.coherenceScore.toFixed(2)}{' '}
                <span className="text-xs text-slate-400 font-normal">
                  ({hotspot.coherenceScore > 0.5 ? 'High Fringe Stability' : 'Significant Decorrelation'})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="flex justify-between text-xs text-slate-400 font-mono mb-1">
                <span>AFFECTED GEOGRAPHICAL AREA</span>
                <span className="text-emerald-300 font-bold">L2 GCOV</span>
              </div>
              <div className="text-lg font-chakra font-bold text-white">
                {hotspot.affectedAreaSqKm.toLocaleString()}{' '}
                <span className="text-xs text-slate-400 font-normal">km²</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-xs text-slate-300 leading-relaxed">
            <strong className="text-cyan-300 font-mono block mb-1">
              SCIENTIFIC EXPLANATION:
            </strong>
            {hotspot.scientificFinding}
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
          <span>Elevation delta derived from L-band phase unwrapping & pixel-offset tracking.</span>
        </div>
      </div>
    </div>
  );
};
