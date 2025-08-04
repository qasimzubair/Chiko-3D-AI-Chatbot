'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { FBXLoader } from 'three-stdlib'
import { useEffect, useRef } from 'react'

function AvatarModel({ emotion }) {
  const { scene, animations } = useGLTF('/3DModel.glb')
  const mixer = useRef()
  const actions = useRef({})
  const currentEmotion = useRef('idle')

  // Helper to load FBX animations
  const loadFBXAnimation = (url, name) => {
    const loader = new FBXLoader()
    loader.load(url, (fbx) => {
      const clip = fbx.animations[0]
      const action = mixer.current.clipAction(clip)
      actions.current[name.toLowerCase()] = action
    })
  }

  useEffect(() => {
    mixer.current = new THREE.AnimationMixer(scene)

    // Load animations from GLB
    animations.forEach((clip) => {
      actions.current[clip.name.toLowerCase()] = mixer.current.clipAction(clip)
    })

    // Load extra animations
    loadFBXAnimation('/Defeated.fbx', 'defeated')
    loadFBXAnimation('/Angry.fbx', 'angry')
    loadFBXAnimation('/Waving Gesture.fbx', 'wave')
    loadFBXAnimation('/Talking.fbx', 'talking')

    actions.current['idle']?.play()
  }, [scene, animations])

  // Trigger animation on emotion change
  useEffect(() => {
    if (!mixer.current) return
    if (emotion && actions.current[emotion]) {
      actions.current[currentEmotion.current]?.stop()
      const action = actions.current[emotion]
      currentEmotion.current = emotion
      action.reset().play()
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
      action.onFinished = () => {
        actions.current['idle']?.reset().play()
        currentEmotion.current = 'idle'
      }
    }
  }, [emotion])

  // THIS NOW WORKS because it is inside Canvas context
  useFrame((_, delta) => mixer.current?.update(delta))

  return <primitive object={scene} scale={1.5} />
}

export default function Avatar({ emotion }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
     camera={{ position: [0, 4, 6], fov: 45 }}
    >
      <color attach="background" args={['#e6f0ff']} />
      <ambientLight intensity={1} />
      <directionalLight position={[0, 5, 5]} intensity={1.2} />
      <AvatarModel emotion={emotion} />
      <OrbitControls enableZoom={false} maxPolarAngle={Math.PI / 2} />
    </Canvas>
  )
}
