import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as THREE from 'three';
import { useNavigate } from "react-router-dom";

import "../styles/pages/home.css";


import Header from "../components/header";
import LoginModal from "../components/modals/loginModal";

export default function Home({ handleLogout }) {
  const navigate = useNavigate();
  //Nome usuário
  const username = localStorage.getItem("username") || "Aventureiro(a)"; // se não tiver login vem como Aventureiro(a)
  const embersRef = useRef(null);

  return (
    <>

      {/* HEADER */}
      <Header handleLogout={handleLogout} />

      {/* MAIN */}

      <main className="home-main">
        <span>
          Olá, {username}!
        </span>
        <h2>Bem-vindo ao Theoros!</h2>

        <p>Sua plataforma de fichas de RPG está pronta.</p>

        <button onClick={() => navigate("/create")} className="btn-primary">
          + Criar nova ficha
        </button>

        <div className="main-content">
         
        </div>
      </main>
   
    </>
  );
  useEffect(() => {
          const scene = new THREE.Scene();
          sceneRef.current = scene;

          // Partículas
          const N = 100;
          const eArr = new Float32Array(N * 3);
          for (let i = 0; i < N; i++) {
              eArr[i*3]   = (Math.random() - 0.5) * 6;
              eArr[i*3+1] = (Math.random() - 0.5) * 6;
              eArr[i*3+2] = (Math.random() - 0.5) * 4;
          }
          //criação dos embers
          const emberGeo = new THREE.BufferGeometry();
          emberGeo.setAttribute('position', new THREE.BufferAttribute(eArr, 3));
          const embers = new THREE.Points(emberGeo,
              new THREE.PointsMaterial({ color: 0xff6600, size: 0.025, transparent: true, opacity: 0.6 })
          );
          scene.add(embers);
          embersRef.current = embers;

          const animate  = () => {
            //altera a posição dos embers
            if (embersRef.current) {
                const ep = embersRef.current.geometry.attributes.position;
                for (let i = 0; i < 100; i++) {
                    ep.array[i*3+1] += 0.004;
                    ep.array[i*3] += Math.sin(tRef.current + i) * 0.001;
                    if (ep.array[i*3+1] > 3) ep.array[i*3+1] = -3;
                }
                ep.needsUpdate = true;
            }

            rendererRef.current.render(sceneRef.current, cameraRef.current);
            animIdRef.current = requestAnimationFrame(animate);
          }
          animate();

          });
}
