import gsap from "gsap";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock3,
  Moon,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import {
  lazy,
  Suspense,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

const MemoryField = lazy(() => import("./MemoryField").then((module) => ({ default: module.MemoryField })));

const media = (file: string) => `${import.meta.env.BASE_URL}media/${file}`;

const scenes = [
  "Una entrega tardía",
  "Despertar a Naye",
  "Diecinueve luces",
  "Después de clases",
  "Horas que desaparecen",
  "Humor dañado",
  "Archivo Naye",
  "Lo que quería decirte",
  "El comienzo de los 19",
] as const;

const constellation = [
  [12, 18], [31, 10], [53, 17], [78, 12], [90, 31], [70, 32], [44, 37], [18, 42], [7, 63],
  [29, 59], [55, 55], [81, 57], [94, 76], [71, 76], [48, 71], [24, 82], [8, 91], [52, 91], [84, 94],
] as const;

const gallery = [
  { src: "p04.webp", label: "energía extrovertida", note: "Evidencia de que alguna vez saliste de casa.", alt: "Naye sonriendo con un sombrero" },
  { src: "s02.webp", label: "humor inexplicable", note: "Una imagen perfectamente normal. Claramente.", alt: "Captura absurda de un personaje de videojuego" },
  { src: "p05.webp", label: "archivo del colegio", note: "Hay fotos que guardan una época completa.", alt: "Naye sonriendo con lentes y mascarilla" },
  { src: "p03.webp", label: "naye core", note: "El avatar también cuenta como documento histórico.", alt: "Avatar digital de Naye" },
  { src: "s01.webp", label: "shitpost certificado", note: "Contexto disponible: ninguno.", alt: "Montaje humorístico de una selfie" },
  { src: "p06.webp", label: "una nueva etapa", note: "El tiempo pasó. Tú también cambiaste.", alt: "Retrato reciente de Naye en una celebración" },
  { src: "m04.webp", label: "registro digital", note: "Capturas que solo se vuelven mejores con los años.", alt: "Dos avatares juntos en un videojuego" },
  { src: "m06.webp", label: "memoria pixelada", note: "Internet también fue un lugar donde crecimos.", alt: "Retrato con elementos pixelados" },
] as const;

const letter = [
  "Bueno, Naye: sé que es un poco tarde para desearte feliz cumpleaños, pero todavía quería hacerlo. Espero que hoy la hayas pasado muy bien y que haya sido un día bonito para ti.",
  "Eres una chica muy especial. Estoy sinceramente agradecido contigo por todas las veces que estuviste para mí, especialmente en algunos de mis momentos más difíciles y decisivos.",
  "Nuestra amistad significa muchísimo para mí por todo lo que hemos vivido y por tantos recuerdos que nunca voy a olvidar.",
  "Durante este año superaste etapas bastante difíciles. Se nota cuánto has cambiado y crecido, y de verdad me alegra verte mejor. Mi propio año también fue algo caótico, pero poco a poco voy superándolo como puedo, jajaja.",
  "Ahora solo espero que puedas cumplir las metas que tengas, que este nuevo año sea uno de los mejores para ti y, sobre todo, que pueda verte en tu prime.",
] as const;

function SceneHeading({ index, kicker, children }: { index: string; kicker: string; children: React.ReactNode }) {
  return (
    <header className="scene-heading" data-reveal>
      <p><span>{index}</span>{kicker}</p>
      <h2>{children}</h2>
    </header>
  );
}

export function App() {
  const reduceMotion = Boolean(useReducedMotion());
  const sceneRoot = useRef<HTMLElement>(null);
  const audioRef = useRef<HTMLAudioElement>(null);
  const holdFrame = useRef<number | null>(null);
  const lightDrag = useRef(false);
  const lastLightAt = useRef(0);
  const [scene, setScene] = useState(0);
  const [soundOn, setSoundOn] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const [holdHint, setHoldHint] = useState("mantén pulsado");
  const [lights, setLights] = useState(0);
  const [callPieces, setCallPieces] = useState([false, false, false]);
  const [nightIndex, setNightIndex] = useState(0);
  const [eyeFound, setEyeFound] = useState(false);
  const [eyeMessage, setEyeMessage] = useState("elige con sabiduría");
  const [galleryIndex, setGalleryIndex] = useState(0);
  const [galleryFurthest, setGalleryFurthest] = useState(0);
  const [letterIndex, setLetterIndex] = useState(0);

  const sceneComplete = useMemo(() => [
    true,
    holdProgress >= 1,
    lights >= 19,
    callPieces.every(Boolean),
    nightIndex >= 4,
    eyeFound,
    galleryFurthest >= 5,
    letterIndex >= letter.length - 1,
    true,
  ][scene], [callPieces, eyeFound, galleryFurthest, holdProgress, letterIndex, lights, nightIndex, scene]);

  const setAudio = useCallback(async (enabled: boolean) => {
    const audio = audioRef.current;
    if (!audio) return;
    if (enabled) {
      try {
        audio.volume = scene === 5 ? 0.16 : 0.32;
        await audio.play();
        setSoundOn(true);
      } catch {
        setSoundOn(false);
      }
    } else {
      audio.pause();
      setSoundOn(false);
    }
  }, [scene]);

  const goNext = useCallback(() => {
    if (!sceneComplete || scene >= scenes.length - 1) return;
    if (scene === 0) void setAudio(true);
    setScene((current) => Math.min(scenes.length - 1, current + 1));
  }, [scene, sceneComplete, setAudio]);

  const goBack = useCallback(() => setScene((current) => Math.max(0, current - 1)), []);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") goBack();
      if (event.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goBack, goNext]);

  useEffect(() => {
    sceneRoot.current?.focus({ preventScroll: true });
  }, [scene]);

  useEffect(() => {
    if (!soundOn || !audioRef.current) return;
    const audio = audioRef.current;
    const target = scene === 5 ? 0.14 : scene === 7 ? 0.25 : 0.32;
    const timer = window.setInterval(() => {
      const delta = target - audio.volume;
      if (Math.abs(delta) < 0.015) {
        audio.volume = target;
        window.clearInterval(timer);
      } else {
        audio.volume = Math.max(0, Math.min(1, audio.volume + Math.sign(delta) * 0.012));
      }
    }, 55);
    return () => window.clearInterval(timer);
  }, [scene, soundOn]);

  useLayoutEffect(() => {
    if (reduceMotion || !sceneRoot.current) return;
    const context = gsap.context(() => {
      gsap.fromTo(
        "[data-reveal]",
        { y: 24, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.78, stagger: 0.09, ease: "power3.out", clearProps: "transform" },
      );
    }, sceneRoot);
    return () => context.revert();
  }, [reduceMotion, scene]);

  useEffect(() => () => {
    if (holdFrame.current) cancelAnimationFrame(holdFrame.current);
  }, []);

  const startHold = () => {
    if (holdProgress >= 1) return;
    const startedAt = performance.now();
    setHoldHint("no sueltes…");
    const update = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / 1800);
      setHoldProgress(progress);
      if (progress < 1) {
        holdFrame.current = requestAnimationFrame(update);
      } else {
        setHoldHint("naye está oficialmente despierta");
      }
    };
    holdFrame.current = requestAnimationFrame(update);
  };

  const stopHold = () => {
    if (holdFrame.current) cancelAnimationFrame(holdFrame.current);
    holdFrame.current = null;
    if (holdProgress < 1) {
      setHoldProgress(0);
      setHoldHint("cinco minutos más… inténtalo otra vez");
    }
  };

  const addLights = (amount: number) => setLights((current) => Math.min(19, current + amount));

  const paintLights = () => {
    if (!lightDrag.current) return;
    const now = performance.now();
    if (now - lastLightAt.current > 58) {
      addLights(1);
      lastLightAt.current = now;
    }
  };

  const revealCallPiece = (index: number) => {
    setCallPieces((current) => current.map((value, item) => item === index ? true : value));
  };

  const chooseEye = (index: number) => {
    if (index === 2) {
      setEyeFound(true);
      setEyeMessage("diagnóstico: humor irreparable");
    } else {
      setEyeMessage(index === 0 ? "ese ojo no. habilidad cuestionable." : "casi. bueno… en realidad no.");
    }
  };

  const moveGallery = (direction: number) => {
    setGalleryIndex((current) => {
      const next = Math.max(0, Math.min(gallery.length - 1, current + direction));
      setGalleryFurthest((furthest) => Math.max(furthest, next));
      return next;
    });
  };

  const restart = () => {
    setScene(0);
    setHoldProgress(0);
    setHoldHint("mantén pulsado");
    setLights(0);
    setCallPieces([false, false, false]);
    setNightIndex(0);
    setEyeFound(false);
    setEyeMessage("elige con sabiduría");
    setGalleryIndex(0);
    setGalleryFurthest(0);
    setLetterIndex(0);
    if (audioRef.current) audioRef.current.currentTime = 0;
  };

  return (
    <main className={`experience-shell scene-${scene}`}>
      {/* La pista es instrumental, por lo que no existe diálogo que subtitular. */}
      {/* eslint-disable-next-line jsx-a11y/media-has-caption */}
      <audio ref={audioRef} src={media("a17.mp3")} preload="metadata" loop aria-label="Ylang Ylang, música de fondo" />
      <div className="aurora aurora-a" aria-hidden="true" />
      <div className="aurora aurora-b" aria-hidden="true" />
      {scene > 0 && (
        <Suspense fallback={null}>
          <MemoryField scene={scene} reduced={reduceMotion} />
        </Suspense>
      )}

      <header className="topbar">
        <span className="wordmark">para naye</span>
        <span className="top-scene" aria-live="polite">{String(scene + 1).padStart(2, "0")} / 09</span>
        <button
          className="icon-button"
          type="button"
          onClick={() => void setAudio(!soundOn)}
          aria-label={soundOn ? "Pausar música" : "Reproducir música"}
          aria-pressed={soundOn}
        >
          {soundOn ? <Volume2 size={17} /> : <VolumeX size={17} />}
        </button>
      </header>

      <AnimatePresence mode="wait" initial={false}>
        <motion.section
          ref={sceneRoot}
          className="scene-stage"
          key={scene}
          tabIndex={-1}
          aria-label={scenes[scene]}
          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 1.018 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, scale: 0.985 }}
          transition={{ duration: reduceMotion ? 0.12 : 0.58, ease: [0.22, 1, 0.36, 1] }}
        >
          {scene === 0 && (
            <div className="intro-scene">
              <p className="scene-index" data-reveal>14.08.2026 · entrega tardía</p>
              <div className="intro-center">
                <p className="eyebrow" data-reveal>Naye…</p>
                <h1 data-reveal>Sé que llegué<br /><em>algo tarde.</em></h1>
                <p className="intro-copy" data-reveal>Pero todavía quería dejarte algo que no cupiera en un mensaje.</p>
              </div>
              <button className="primary-action" type="button" onClick={goNext} data-reveal>
                abrir antes de que sea mañana <ArrowRight size={18} />
              </button>
            </div>
          )}

          {scene === 1 && (
            <div className="standard-scene wake-scene">
              <SceneHeading index="01" kicker="operación improbable">Despertar a<br /><em>Naye.</em></SceneHeading>
              <div className="wake-orbit" data-reveal style={{ "--hold": `${holdProgress * 360}deg` } as React.CSSProperties}>
                <button
                  type="button"
                  className={`hold-core ${holdProgress >= 1 ? "complete" : ""}`}
                  onPointerDown={startHold}
                  onPointerUp={stopHold}
                  onPointerCancel={stopHold}
                  onPointerLeave={stopHold}
                  aria-label="Mantén pulsado para despertar a Naye"
                >
                  {holdProgress >= 1 ? <Check size={34} /> : <Moon size={31} />}
                </button>
                <span className="orbit-dot" />
              </div>
              <div className="interaction-copy" data-reveal>
                <strong>{holdHint}</strong>
                <span>{holdProgress >= 1 ? "nivel 19 desbloqueado" : "criatura nocturna detectada"}</span>
              </div>
            </div>
          )}

          {scene === 2 && (
            <div className="standard-scene constellation-scene">
              <SceneHeading index="02" kicker="una por cada año">Diecinueve<br /><em>pequeñas luces.</em></SceneHeading>
              <button
                className="constellation-pad"
                type="button"
                onPointerDown={(event) => { lightDrag.current = true; event.currentTarget.setPointerCapture(event.pointerId); addLights(2); }}
                onPointerMove={paintLights}
                onPointerUp={() => { lightDrag.current = false; }}
                onPointerCancel={() => { lightDrag.current = false; }}
                onClick={() => addLights(2)}
                aria-label={`Desliza o toca para encender luces. ${lights} de 19 encendidas.`}
                data-reveal
              >
                {constellation.map(([left, top], index) => (
                  <i
                    key={`${left}-${top}`}
                    className={index < lights ? "lit" : ""}
                    style={{ left: `${left}%`, top: `${top}%`, transitionDelay: `${index * 12}ms` }}
                  />
                ))}
                <span className="light-count"><b>{lights}</b><small>/ 19</small></span>
              </button>
              <div className="interaction-copy" data-reveal>
                <strong>{lights < 19 ? "desliza para encenderlas" : "19 años. horario de sueño aún pendiente."}</strong>
                <span>{lights < 6 ? "extrovertida" : lights < 12 ? "profesional de la pereza" : lights < 19 ? "sobreviviente de madrugadas" : "nivel completado"}</span>
              </div>
            </div>
          )}

          {scene === 3 && (
            <div className="standard-scene call-scene">
              <SceneHeading index="03" kicker="archivo de pandemia">Después de<br /><em>clases.</em></SceneHeading>
              <div className="call-grid" data-reveal>
                {[
                  ["m01.webp", "Clases terminadas.", "Una llamada después de Meet."],
                  ["m04.webp", "La llamada seguía abierta.", "Nadie preguntaba cuánto duraría."],
                  ["p03.webp", "Y sin darnos cuenta…", "lo cotidiano se volvió recuerdo."],
                ].map(([image, title, text], index) => (
                  <button
                    type="button"
                    className={callPieces[index] ? "revealed" : ""}
                    key={image}
                    onClick={() => revealCallPiece(index)}
                    aria-label={callPieces[index] ? `${title} ${text}` : `Revelar recuerdo ${index + 1}`}
                  >
                    <img src={media(image)} alt="" />
                    <span className="call-status"><i /> {callPieces[index] ? "recuerdo recuperado" : "conectando…"}</span>
                    <span className="call-copy"><b>{callPieces[index] ? title : "toca para conectar"}</b>{callPieces[index] && <small>{text}</small>}</span>
                  </button>
                ))}
              </div>
              <p className="micro-note" data-reveal>{callPieces.filter(Boolean).length} de 3 fragmentos encontrados</p>
            </div>
          )}

          {scene === 4 && (
            <div className="standard-scene night-scene">
              <SceneHeading index="04" kicker="hace unos meses">Las horas que<br /><em>desaparecen.</em></SceneHeading>
              <div className="night-clock" data-reveal>
                <Clock3 size={18} />
                <AnimatePresence mode="popLayout">
                  <motion.strong
                    key={nightIndex}
                    initial={{ opacity: 0, y: 22 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -22 }}
                  >
                    {["11:47", "12:26", "1:38", "2:41", "3:…"][nightIndex]}
                  </motion.strong>
                </AnimatePresence>
                <span>{nightIndex === 0 ? "p. m." : "a. m."}</span>
              </div>
              <div className="night-transcript" data-reveal aria-live="polite">
                <p>{[
                  "Empezamos hablando de cualquier cosa.",
                  "Después apareció otra conversación.",
                  "Y otra historia que había que terminar.",
                  "El reloj dejó de colaborar.",
                  "Supongo que algunas cosas nunca cambian.",
                ][nightIndex]}</p>
              </div>
              <button
                className="secondary-action"
                type="button"
                onClick={() => setNightIndex((current) => Math.min(4, current + 1))}
                disabled={nightIndex >= 4}
                data-reveal
              >
                {nightIndex >= 4 ? "noción del tiempo: perdida" : "seguir hablando"}
                {nightIndex >= 4 ? <Check size={17} /> : <ArrowRight size={17} />}
              </button>
            </div>
          )}

          {scene === 5 && (
            <div className="standard-scene eye-scene">
              <SceneHeading index="05" kicker="examen obligatorio">Prueba de<br /><em>humor dañado.</em></SceneHeading>
              {!eyeFound ? (
                <>
                  <p className="eye-prompt" data-reveal>Encuentra el ojo correcto.</p>
                  <div className="eye-grid" data-reveal>
                    {["s01.webp", "s02.webp", "s03.webp"].map((image, index) => (
                      <button type="button" key={image} onClick={() => chooseEye(index)} aria-label={`Elegir ojo ${index + 1}`}>
                        <img src={media(image)} alt="" />
                        <span>0{index + 1}</span>
                      </button>
                    ))}
                  </div>
                  <p className="eye-message" aria-live="polite" data-reveal>{eyeMessage}</p>
                </>
              ) : (
                <motion.div className="eye-reveal" initial={{ scale: .7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
                  <img src={media("s03.webp")} alt="Personaje azul con ojos grandes" />
                  <div><span>mensaje recuperado</span><strong>¡MIRA<br />MI OJO!</strong><small>🗣️ 🗣️ 🔥 🔥</small></div>
                </motion.div>
              )}
            </div>
          )}

          {scene === 6 && (
            <div className="standard-scene archive-scene">
              <SceneHeading index="06" kicker="material clasificado">Archivo<br /><em>Naye.</em></SceneHeading>
              <div className="gallery-shell" data-reveal>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.figure
                    key={galleryIndex}
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.7}
                    onDragEnd={(_, info) => {
                      if (info.offset.x < -48) moveGallery(1);
                      if (info.offset.x > 48) moveGallery(-1);
                    }}
                    initial={{ opacity: 0, x: 36, rotate: 1.5 }}
                    animate={{ opacity: 1, x: 0, rotate: 0 }}
                    exit={{ opacity: 0, x: -36, rotate: -1.5 }}
                    transition={{ duration: .34 }}
                  >
                    <img src={media(gallery[galleryIndex].src)} alt={gallery[galleryIndex].alt} draggable="false" />
                    <figcaption>
                      <span>{String(galleryIndex + 1).padStart(2, "0")} / {String(gallery.length).padStart(2, "0")}</span>
                      <strong>{gallery[galleryIndex].label}</strong>
                      <p>{gallery[galleryIndex].note}</p>
                    </figcaption>
                  </motion.figure>
                </AnimatePresence>
                <div className="gallery-controls">
                  <button type="button" onClick={() => moveGallery(-1)} disabled={galleryIndex === 0} aria-label="Fotografía anterior"><ArrowLeft size={18} /></button>
                  <span>desliza</span>
                  <button type="button" onClick={() => moveGallery(1)} disabled={galleryIndex === gallery.length - 1} aria-label="Fotografía siguiente"><ArrowRight size={18} /></button>
                </div>
              </div>
            </div>
          )}

          {scene === 7 && (
            <div className="standard-scene letter-scene">
              <SceneHeading index="07" kicker="sin bromas por un momento">Lo que sí<br /><em>quería decirte.</em></SceneHeading>
              <div className="letter-card" data-reveal>
                <div className="letter-rule"><span style={{ width: `${((letterIndex + 1) / letter.length) * 100}%` }} /></div>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p
                    key={letterIndex}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: .42 }}
                  >
                    {letter[letterIndex]}
                  </motion.p>
                </AnimatePresence>
                <div className="letter-footer">
                  <span>{String(letterIndex + 1).padStart(2, "0")} / 05</span>
                  {letterIndex < letter.length - 1 ? (
                    <button type="button" onClick={() => setLetterIndex((current) => current + 1)}>seguir leyendo <ArrowRight size={16} /></button>
                  ) : (
                    <strong>— Fetuchini</strong>
                  )}
                </div>
              </div>
            </div>
          )}

          {scene === 8 && (
            <div className="final-scene">
              <img className="final-photo" src={media("p09.webp")} alt="Naye sonriendo en una fotografía del colegio" />
              <div className="final-shade" />
              <div className="final-sparks" aria-hidden="true">
                {constellation.map((_, index) => <i key={index} style={{ "--i": index } as React.CSSProperties} />)}
              </div>
              <div className="final-copy" data-reveal>
                <p>19 / prime en progreso</p>
                <h2>Feliz cumpleaños,<br /><em>Naye.</em></h2>
                <span>Que este año te encuentre riendo, creciendo y trasnochándote un poquito menos.</span>
                <small>Bueno… tampoco hay que pedir milagros.</small>
              </div>
              <div className="final-actions" data-reveal>
                <p>con mucho cariño fraternal · Fetuchini</p>
                <button type="button" onClick={restart}><RotateCcw size={16} /> volver a vivirlo</button>
              </div>
            </div>
          )}
        </motion.section>
      </AnimatePresence>

      {scene > 0 && scene < 8 && (
        <nav className="scene-nav" aria-label="Navegación de la experiencia">
          <button className="back-button" type="button" onClick={goBack} aria-label="Volver al evento anterior"><ArrowLeft size={18} /></button>
          <div className="progress-line" aria-hidden="true">
            {scenes.map((_, index) => <i key={index} className={index <= scene ? "active" : ""} />)}
          </div>
          <button className="next-button" type="button" onClick={goNext} disabled={!sceneComplete} aria-label={sceneComplete ? "Continuar al siguiente evento" : "Completa la interacción para continuar"}>
            {sceneComplete ? <ArrowRight size={18} /> : <span>{scene === 2 ? `${lights}/19` : "···"}</span>}
          </button>
        </nav>
      )}

      <button
        className="music-pill"
        type="button"
        onClick={() => void setAudio(!soundOn)}
        aria-label={soundOn ? "Pausar Ylang Ylang" : "Reproducir Ylang Ylang"}
      >
        {soundOn ? <Pause size={12} fill="currentColor" /> : <Play size={12} fill="currentColor" />}
        <span>Ylang Ylang</span>
        {soundOn && <i><b /><b /><b /></i>}
      </button>
    </main>
  );
}
