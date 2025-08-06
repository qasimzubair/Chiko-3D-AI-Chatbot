'use client'
import { Canvas, useFrame } from '@react-three/fiber'
import { OrbitControls, useGLTF } from '@react-three/drei'
import * as THREE from 'three'
import { FBXLoader } from 'three-stdlib'
import { useEffect, useRef } from 'react'

function AvatarModel({ emotion }) {
  const { scene, animations, error } = useGLTF('/model.glb', true)
  const mixer = useRef()
  const actions = useRef({})
  const currentEmotion = useRef('idle')

  // Helper to load FBX animations with error handling
  const loadFBXAnimation = (url, name) => {
    const loader = new FBXLoader()
    loader.load(
      url, 
      (fbx) => {
        if (fbx.animations && fbx.animations[0]) {
          const clip = fbx.animations[0]
          const action = mixer.current.clipAction(clip)
          actions.current[name.toLowerCase()] = action
        }
      },
      undefined,
      (error) => {
        console.warn(`Failed to load FBX animation: ${url}`, error)
      }
    )
  }

  useEffect(() => {
    if (!scene) return

    try {
      mixer.current = new THREE.AnimationMixer(scene)

      // Load textures with error handling
      const textureLoader = new THREE.TextureLoader()
      
      const bodyDiffuse = textureLoader.load(
        '/textures/Ch03_Body_diffuse.png',
        undefined,
        undefined,
        (error) => console.warn('Failed to load diffuse texture:', error)
      )
      const bodyNormal = textureLoader.load(
        '/textures/Ch03_Body_normal.png',
        undefined,
        undefined,
        (error) => console.warn('Failed to load normal texture:', error)
      )
      const bodySpecular = textureLoader.load(
        '/textures/Ch03_Body_specularGlossiness.png',
        undefined,
        undefined,
        (error) => console.warn('Failed to load specular texture:', error)
      )

      // Apply textures and skin to all meshes
      scene.traverse((object) => {
        if (object.isMesh) {
          // Create textured skin material with fallback
          const skinMaterial = new THREE.MeshStandardMaterial({
            map: bodyDiffuse,
            normalMap: bodyNormal,
            roughnessMap: bodySpecular,
            color: 0xFFDBB3, // Skin tone color
            metalness: 0.0,
            roughness: 0.6,
            side: THREE.DoubleSide
          })

          object.material = skinMaterial
          object.material.needsUpdate = true
          object.castShadow = true
          object.receiveShadow = true
        }
      })

      // Load animations from GLB with error handling
      if (animations && animations.length > 0) {
        animations.forEach((clip) => {
          try {
            const actionName = clip.name.toLowerCase()
            actions.current[actionName] = mixer.current.clipAction(clip)
            console.log(`Loaded animation: "${clip.name}" as "${actionName}"`)
          } catch (clipError) {
            console.warn(`Failed to load animation clip: ${clip.name}`, clipError)
          }
        })
      } else {
        console.warn('No animations found in GLB model')
      }

      // List all available actions
      console.log('All available actions:', Object.keys(actions.current))

      // Auto-play first animation if available
      setTimeout(() => {
        const actionKeys = Object.keys(actions.current)
        if (actionKeys.length > 0) {
          const firstAction = actionKeys[0]
          console.log(`Auto-playing: ${firstAction}`)
          try {
            actions.current[firstAction].reset().play()
            actions.current[firstAction].setLoop(THREE.LoopRepeat)
            currentEmotion.current = firstAction
          } catch (playError) {
            console.warn(`Failed to play animation: ${firstAction}`, playError)
          }
        } else {
          console.log('No animations to play - model might be static')
        }
      }, 500)
      
    } catch (error) {
      console.error('Error in useEffect:', error)
    }
  }, [scene, animations])

  // Trigger animation on emotion change with gesture combinations
  useEffect(() => {
    if (!mixer.current) return
    
    // Define gesture combinations for more dynamic animations
    const gestureSequences = {
      'greeting': ['waving', 'talking'],
      'excited_hello': ['waving', 'talking', 'waving'],
      'dramatic_angry': ['angry', 'talking'],
      'sad_explanation': ['defeated', 'talking'],
      'complex_waving': ['waving', 'talking', 'waving']
    }
    
    // Check if emotion is a sequence
    if (gestureSequences[emotion]) {
      playGestureSequence(gestureSequences[emotion])
      return
    }
    
    if (emotion && actions.current[emotion]) {
      // Stop current animation
      if (actions.current[currentEmotion.current]) {
        actions.current[currentEmotion.current].stop()
      }
      
      const action = actions.current[emotion]
      currentEmotion.current = emotion
      action.reset().play()
      action.clampWhenFinished = true
      action.loop = THREE.LoopOnce
      
      action.onFinished = () => {
        const actionKeys = Object.keys(actions.current)
        if (actionKeys.length > 0) {
          const defaultAction = actionKeys[0]
          actions.current[defaultAction].reset().play()
          actions.current[defaultAction].setLoop(THREE.LoopRepeat)
          currentEmotion.current = defaultAction
        }
      }
    }
  }, [emotion])
  
  // Function to play a sequence of gestures
  const playGestureSequence = (sequence) => {
    let currentIndex = 0
    
    const playNext = () => {
      if (currentIndex >= sequence.length) {
        // Sequence finished, return to default
        const actionKeys = Object.keys(actions.current)
        if (actionKeys.length > 0) {
          const defaultAction = actionKeys[0]
          actions.current[defaultAction].reset().play()
          actions.current[defaultAction].setLoop(THREE.LoopRepeat)
          currentEmotion.current = defaultAction
        }
        return
      }
      
      const gestureName = sequence[currentIndex]
      if (actions.current[gestureName]) {
        // Stop current animation
        if (actions.current[currentEmotion.current]) {
          actions.current[currentEmotion.current].stop()
        }
        
        const action = actions.current[gestureName]
        currentEmotion.current = gestureName
        action.reset().play()
        action.clampWhenFinished = true
        action.loop = THREE.LoopOnce
        
        action.onFinished = () => {
          currentIndex++
          setTimeout(playNext, 200) // Small delay between gestures
        }
      } else {
        // Skip this gesture if not found
        currentIndex++
        playNext()
      }
    }
    
    playNext()
  }

  // THIS NOW WORKS because it is inside Canvas context
  useFrame((_, delta) => {
    if (mixer.current) {
      mixer.current.update(delta)
    }
  })

  // Show error message if model failed to load
  if (error) {
    console.error('Failed to load 3D model:', error)
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="orange" />
      </mesh>
    )
  }

  // Show loading placeholder if scene not ready
  if (!scene) {
    return (
      <mesh position={[0, 0, 0]}>
        <boxGeometry args={[1, 2, 0.5]} />
        <meshStandardMaterial color="gray" />
      </mesh>
    )
  }

  return <primitive object={scene} scale={1.2} position={[0, -2.5, 0]} />
}

export default function Avatar({ emotion }) {
  return (
    <Canvas
      style={{ width: '100%', height: '100%' }}
      camera={{ 
        position: [0, 0, 5], 
        fov: 50,
        near: 0.1,
        far: 1000
      }}
      shadows
      performance={{ min: 0.5 }}
      dpr={[1, 2]}
    >
      {/* Light blue background - lighter */}
      <color attach="background" args={['#b3d9ff']} />
      
      {/* Simplified lighting for mobile performance */}
      <ambientLight intensity={0.6} />
      <directionalLight 
        position={[5, 5, 5]} 
        intensity={1.0} 
        castShadow
        shadow-mapSize-width={1024}
        shadow-mapSize-height={1024}
      />
      <pointLight position={[0, 2, 0]} intensity={0.3} />
      
      <AvatarModel emotion={emotion} />
      <OrbitControls 
        enableZoom={true}
        enablePan={false}
        enableRotate={true}
        maxPolarAngle={Math.PI / 2}
        minPolarAngle={Math.PI / 6}
        maxDistance={10}
        minDistance={2}
        target={[0, 0, 0]}
        enableDamping={true}
        dampingFactor={0.05}
      />
    </Canvas>
  )
}
