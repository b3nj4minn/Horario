import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Clock, MapPin, User, Calendar as CalendarIcon, BookOpen, 
  Bell, BellRing, BellOff, Download, Coffee, X, FileEdit,
  Share2, PieChart, Timer, TrendingUp, CheckCircle2, Rocket, PartyPopper,
  ChevronLeft, ChevronRight, ChevronUp, ChevronDown, CalendarDays, AlertTriangle, 
  CheckCircle, XCircle, HelpCircle, ListTodo, Settings, GraduationCap,
  UploadCloud, Calculator, Link2, ExternalLink, Play, Pause, RotateCcw,
  Cloud, CloudOff, CloudLightning, Key, ChevronRightCircle, Activity, BarChart3,
  SlidersHorizontal, Check, Trash2, Link as LinkIcon, Trophy, Sparkles, Quote,
  CalendarPlus
} from 'lucide-react';

// --- FIREBASE CLOUD SYNC (NUBE PERSONAL) ---
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, onSnapshot } from 'firebase/firestore';

// Tu configuración real de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyACSWP04hK8WNF1Fmc3lsVm6FhfQx1rx0I",
  authDomain: "calendario-um.firebaseapp.com",
  projectId: "calendario-um",
  storageBucket: "calendario-um.firebasestorage.app",
  messagingSenderId: "668045367301",
  appId: "1:668045367301:web:790c5df121ba559dbce46c"
};

let app, db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (e) {
  console.error("Error iniciando Firebase", e);
}

// Colores Pastel Estilo Apple
const colors = {
  cornerstone: 'bg-blue-100 text-blue-900 border-blue-200',
  algebra: 'bg-orange-100 text-orange-900 border-orange-200',
  quimica: 'bg-emerald-100 text-emerald-900 border-emerald-200',
  proyectos: 'bg-purple-100 text-purple-900 border-purple-200',
  pensamiento: 'bg-rose-100 text-rose-900 border-rose-200',
  induccion1: 'bg-indigo-100 text-indigo-900 border-indigo-200', 
  induccion2: 'bg-amber-100 text-amber-900 border-amber-200', 
  gris: 'bg-gray-100 text-gray-800 border-gray-200',
  menta: 'bg-teal-100 text-teal-900 border-teal-200',
  rosa: 'bg-pink-100 text-pink-900 border-pink-200',
  limon: 'bg-lime-100 text-lime-900 border-lime-200',
};

const getDotColor = (colorClass) => {
  if (colorClass.includes('stone')) return 'bg-stone-400';
  return colorClass.split(' ')[0].replace('100', '500'); 
};

// Colección de Versículos Bíblicos Motivadores
const dailyVerses = [
  { text: "Todo lo puedo en Cristo que me fortalece.", ref: "Filipenses 4:13" },
  { text: "Mira que te mando que te esfuerces y seas valiente; no temas ni desmayes, porque Jehová tu Dios estará contigo en dondequiera que vayas.", ref: "Josué 1:9" },
  { text: "Porque yo sé muy bien los planes que tengo para ustedes —afirma el Señor—, planes de bienestar y no de calamidad, a fin de darles un futuro y una esperanza.", ref: "Jeremías 29:11" },
  { text: "Confía en el Señor de todo corazón, y no en tu propia inteligencia.", ref: "Proverbios 3:5" },
  { text: "No temas, porque yo estoy contigo; no desmayes, porque yo soy tu Dios que te esfuerzo; siempre te ayudaré.", ref: "Isaías 41:10" },
  { text: "Te haré entender, y te enseñaré el camino en que debes andar; Sobre ti fijaré mis ojos.", ref: "Salmos 32:8" },
  { text: "Y sabemos que a los que aman a Dios, todas las cosas les ayudan a bien.", ref: "Romanos 8:28" },
  { text: "Vengan a mí todos ustedes que están cansados y agobiados, y yo les daré descanso.", ref: "Mateo 11:28" },
  { text: "Y todo lo que hagáis, hacedlo de corazón, como para el Señor y no para los hombres.", ref: "Colosenses 3:23" },
  { text: "Pon en manos del Señor todas tus obras, y tus proyectos se cumplirán.", ref: "Proverbios 16:3" },
  { text: "Porque no nos ha dado Dios espíritu de cobardía, sino de poder, de amor y de dominio propio.", ref: "2 Timoteo 1:7" },
  { text: "Lámpara es a mis pies tu palabra, Y lumbrera a mi camino.", ref: "Salmos 119:105" },
  { text: "Todas vuestras cosas sean hechas con amor.", ref: "1 Corintios 16:14" },
  { text: "Jehová es mi pastor; nada me faltará.", ref: "Salmos 23:1" },
  { text: "Corramos con paciencia la carrera que tenemos por delante, puestos los ojos en Jesús.", ref: "Hebreos 12:1-2" }
];

// HORARIOS (Inducción convertida a Eventos para no penalizar asistencia)
const inductionScheduleData = {
  Lunes: [{ time: '08:00 - 09:00', subject: 'Tour Campus', teacher: 'Inducción', room: 'Hall Edificio Manuel Montt', color: colors.induccion1, eventType: 'evento' }, { time: '09:00 - 10:30', subject: 'Vida Universitaria', teacher: 'Inducción', room: 'Auditorio Manuel Montt', color: colors.induccion1, eventType: 'evento' }],
  Martes: [{ time: '09:00 - 10:30', subject: 'Convivencia Estudiantil', teacher: 'Inducción', room: 'Auditorio Manuel Montt', color: colors.induccion2, eventType: 'evento' }, { time: '11:00 - 12:30', subject: '¿Y esto es inclusión?', teacher: 'Inducción', room: 'Auditorio Manuel Montt', color: colors.induccion2, eventType: 'evento' }],
  Miércoles: [], Jueves: [{ time: '09:30 - 11:00', subject: 'Bienvenida Carrera', teacher: 'Inducción', room: 'Auditorio Manuel Montt', color: colors.induccion1, eventType: 'evento' }], Viernes: [], Sábado: []
};

const regularScheduleData = {
  Lunes: [
    { time: '11:00 - 12:10', subject: 'Proyecto Cornerstone', room: 'MCSR-Y03', color: colors.cornerstone },
    { time: '12:30 - 13:40', subject: 'Proyecto Cornerstone', room: 'MCSR-Y03', color: colors.cornerstone },
    { time: '13:40 - 17:00', subject: 'Ventana', room: 'Tiempo Libre', color: 'bg-stone-100 text-stone-600 border-stone-200', isBreak: true },
    { time: '17:00 - 18:10', subject: 'Álgebra', room: 'MCSR-Y02', color: colors.algebra }
  ],
  Martes: [
    { time: '09:30 - 10:40', subject: 'Química Aplicada a la Ingeniería', room: 'MCSR-202', color: colors.quimica },
    { time: '11:00 - 12:10', subject: 'Int. a la Administración de Proyectos', room: 'MCSR-Y02', color: colors.proyectos },
    { time: '12:30 - 13:40', subject: 'Int. a la Administración de Proyectos', room: 'MCSR-Y02', color: colors.proyectos },
    { time: '13:40 - 17:00', subject: 'Ventana', room: 'Tiempo Libre', color: 'bg-stone-100 text-stone-600 border-stone-200', isBreak: true },
    { time: '17:00 - 18:10', subject: 'Álgebra', room: 'MCSR-203', color: colors.algebra }
  ],
  Miércoles: [], 
  Jueves: [],
  Viernes: [
    { time: '08:00 - 09:10', subject: 'Pensamiento Computacional', room: 'MCSR-201', color: colors.pensamiento },
    { time: '09:30 - 10:40', subject: 'Pensamiento Computacional', room: 'MCSR-201', color: colors.pensamiento },
    { time: '11:00 - 12:10', subject: 'Pensamiento Computacional', room: 'MALI-210', color: colors.pensamiento }
  ],
  Sábado: [
    { time: '08:00 - 09:10', subject: 'Álgebra', room: 'MCSR-203', color: colors.algebra }
  ]
};

const jsDays = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];

const inductionStart = new Date(2026, 2, 9, 0, 0, 0);   
const semesterStart = new Date(2026, 2, 16, 0, 0, 0);   
const semesterEnd = new Date(2026, 6, 31, 23, 59, 59);  

const timeToMins = (timeStr) => { const [h, m] = timeStr.split(':').map(Number); return h * 60 + m; };
const getMonday = (d) => { const date = new Date(d); const day = date.getDay(); const diff = date.getDate() - day + (day === 0 ? -6 : 1); date.setDate(diff); date.setHours(0,0,0,0); return date; };

const toLocalISODate = (d) => {
  const z = n => ('0' + n).slice(-2);
  return d.getFullYear() + '-' + z(d.getMonth() + 1) + '-' + z(d.getDate());
};

const getClassesForDate = (date, customEvts = {}, hiddenEvts = {}) => {
  const dayName = jsDays[date.getDay()];
  const dateStr = `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  
  let baseClasses = [];
  if (date.getTime() < inductionStart.getTime()) {
    baseClasses = [];
  } else if (date.getTime() >= inductionStart.getTime() && date.getTime() < semesterStart.getTime()) {
    baseClasses = inductionScheduleData[dayName] || [];
  } else {
    baseClasses = regularScheduleData[dayName] || [];
  }

  let activeClasses = baseClasses.filter(c => {
    const id = `${dateStr}_${c.subject}_${c.time}`;
    return !hiddenEvts[id];
  });

  const dayCustomEvents = customEvts[dateStr] || [];
  activeClasses = [...activeClasses, ...dayCustomEvents];

  activeClasses.sort((a, b) => timeToMins(a.time.split(' - ')[0]) - timeToMins(b.time.split(' - ')[0]));

  return activeClasses;
};

export default function App() {
  const [cloudStatus, setCloudStatus] = useState(db ? 'offline' : 'unconfigured'); 
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  
  const [syncKey, setSyncKey] = useState(localStorage.getItem('academic_sync_key') || 'benja_os_2026');
  const [tempSyncKey, setTempSyncKey] = useState('');

  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentWeekStart, setCurrentWeekStart] = useState(getMonday(new Date()));
  const [selectedDay, setSelectedDay] = useState(new Date()); 
  const [view, setView] = useState('week'); 
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const [notes, setNotes] = useState({});
  const [attendanceRecords, setAttendanceRecords] = useState({}); 
  const [exams, setExams] = useState({}); 
  const [grades, setGrades] = useState({}); 
  const [links, setLinks] = useState({}); 
  
  const [selectedSubjectModal, setSelectedSubjectModal] = useState(null);
  const [modalTab, setModalTab] = useState('attendance'); 
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showSubjectsListModal, setShowSubjectsListModal] = useState(false);
  const [showAcademicLoadModal, setShowAcademicLoadModal] = useState(false); 
  const [showGlobalAttendanceModal, setShowGlobalAttendanceModal] = useState(false); 
  const [showTrophiesModal, setShowTrophiesModal] = useState(false);
  const [showVerseModal, setShowVerseModal] = useState(false);
  const [attendanceChartPeriod, setAttendanceChartPeriod] = useState('week');

  const [customEvents, setCustomEvents] = useState({}); 
  const [hiddenEvents, setHiddenEvents] = useState({});
  const [eventModalData, setEventModalData] = useState(null);
  
  const [recycleBin, setRecycleBin] = useState([]);
  const [showRecycleBinModal, setShowRecycleBinModal] = useState(false);

  const [hasPromptedAttendance, setHasPromptedAttendance] = useState(false);

  const [showPomodoro, setShowPomodoro] = useState(false);
  const [isEventsExpanded, setIsEventsExpanded] = useState(true);
  const [isPomoSettingsOpen, setIsPomoSettingsOpen] = useState(false);
  const [pomoStudyTime, setPomoStudyTime] = useState(25);
  const [pomoBreakTime, setPomoBreakTime] = useState(5);
  const [pomoTimeLeft, setPomoTimeLeft] = useState(25 * 60); 
  const [pomoIsActive, setPomoIsActive] = useState(false);
  const [pomoMode, setPomoMode] = useState('study'); 

  const [toastMessage, setToastMessage] = useState(null);
  const notifiedClasses = useRef(new Set());
  const fileInputRef = useRef(null);

  const isPreInduction = currentTime.getTime() < inductionStart.getTime();

  // --- LÓGICA VERSÍCULO DIARIO ---
  const currentDailyVerse = useMemo(() => {
    const start = new Date(currentTime.getFullYear(), 0, 0);
    const diff = (currentTime - start) + ((start.getTimezoneOffset() - currentTime.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    return dailyVerses[dayOfYear % dailyVerses.length];
  }, [currentTime]);

  useEffect(() => {
    try {
      const savedNotes = localStorage.getItem('academic_notes'); const savedAttendance = localStorage.getItem('academic_attendance_v3'); const savedExams = localStorage.getItem('academic_exams'); const savedGrades = localStorage.getItem('academic_grades'); const savedLinks = localStorage.getItem('academic_links');
      const savedCustom = localStorage.getItem('academic_custom_events'); const savedHidden = localStorage.getItem('academic_hidden_events');
      const savedRecycle = localStorage.getItem('academic_recycle_bin');
      if (savedNotes) setNotes(JSON.parse(savedNotes)); if (savedAttendance) setAttendanceRecords(JSON.parse(savedAttendance)); if (savedExams) setExams(JSON.parse(savedExams)); if (savedGrades) setGrades(JSON.parse(savedGrades)); if (savedLinks) setLinks(JSON.parse(savedLinks));
      if (savedCustom) setCustomEvents(JSON.parse(savedCustom)); if (savedHidden) setHiddenEvents(JSON.parse(savedHidden));
      if (savedRecycle) setRecycleBin(JSON.parse(savedRecycle));
      if ("Notification" in window && Notification.permission === "granted") setNotificationsEnabled(true);
      setIsDataLoaded(true);

      const todayStr = new Date().toDateString();
      const lastVerseDate = localStorage.getItem('academic_verse_date');
      if (lastVerseDate !== todayStr) {
        setShowVerseModal(true);
        localStorage.setItem('academic_verse_date', todayStr);
      }
    } catch (e) {}

    if (!db) return;
    const docRef = doc(db, 'horario_sync_app', syncKey);
    
    setCloudStatus('syncing');
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const n = data.notes || {}; setNotes(n); localStorage.setItem('academic_notes', JSON.stringify(n));
        const a = data.attendanceRecords || {}; setAttendanceRecords(a); localStorage.setItem('academic_attendance_v3', JSON.stringify(a));
        const e = data.exams || {}; setExams(e); localStorage.setItem('academic_exams', JSON.stringify(e));
        const g = data.grades || {}; setGrades(g); localStorage.setItem('academic_grades', JSON.stringify(g));
        const l = data.links || {}; setLinks(l); localStorage.setItem('academic_links', JSON.stringify(l));
        const cE = data.customEvents || {}; setCustomEvents(cE); localStorage.setItem('academic_custom_events', JSON.stringify(cE));
        const hE = data.hiddenEvents || {}; setHiddenEvents(hE); localStorage.setItem('academic_hidden_events', JSON.stringify(hE));
        const rb = data.recycleBin || []; setRecycleBin(rb); localStorage.setItem('academic_recycle_bin', JSON.stringify(rb));
      } else {
        setNotes({}); setAttendanceRecords({}); setExams({}); setGrades({}); setLinks({}); setCustomEvents({}); setHiddenEvents({}); setRecycleBin([]);
        localStorage.removeItem('academic_notes'); localStorage.removeItem('academic_attendance_v3');
        localStorage.removeItem('academic_exams'); localStorage.removeItem('academic_grades'); localStorage.removeItem('academic_links');
        localStorage.removeItem('academic_custom_events'); localStorage.removeItem('academic_hidden_events'); localStorage.removeItem('academic_recycle_bin');
      }
      setCloudStatus('synced');
    }, (error) => {
      console.error("Error de conexión con la nube", error);
      setCloudStatus('offline');
    });

    return () => unsubscribe();
  }, [syncKey]);

  const pushToCloud = async (newDataFields) => {
    if (!db) return;
    setCloudStatus('syncing');
    try {
      const docRef = doc(db, 'horario_sync_app', syncKey);
      await setDoc(docRef, newDataFields, { merge: true });
      setCloudStatus('synced');
    } catch (e) {
      console.error("Error guardando", e);
      setCloudStatus('offline');
    }
  };

  const handleChangeSyncKey = () => {
    if (tempSyncKey.trim() === '') return;
    setSyncKey(tempSyncKey);
    localStorage.setItem('academic_sync_key', tempSyncKey);
    setTempSyncKey('');
    showToast('Clave Actualizada');
  };

  const requestNotificationPermission = () => {
    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === "granted") {
          setNotificationsEnabled(true);
          showToast("Notificaciones Activadas");
        } else {
          showToast("Permiso Denegado");
        }
      });
    } else {
      showToast("Tu navegador no soporta notificaciones");
    }
  };

  const showToast = (m) => { setToastMessage(m); setTimeout(() => setToastMessage(null), 3000); };

  const eventsStateRef = useRef({ custom: customEvents, hidden: hiddenEvents });
  useEffect(() => { eventsStateRef.current = { custom: customEvents, hidden: hiddenEvents }; }, [customEvents, hiddenEvents]);

  // Reloj, Notificaciones Inteligentes y Limpieza Automática de Papelera (cada 2 días)
  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date(); setCurrentTime(now);
      
      // Auto-Limpiador de Papelera de Reciclaje (Elimina > 48hrs)
      if (isDataLoaded && recycleBin.length > 0) {
         const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
         const filtered = recycleBin.filter(item => now.getTime() - item.deletedAt < TWO_DAYS);
         if (filtered.length !== recycleBin.length) {
            setRecycleBin(filtered);
            localStorage.setItem('academic_recycle_bin', JSON.stringify(filtered));
            pushToCloud({ recycleBin: filtered });
            showToast('🧹 Limpieza automática de papelera completada');
         }
      }

      if (notificationsEnabled && "Notification" in window && Notification.permission === "granted") {
        const currentMins = now.getHours() * 60 + now.getMinutes();
        getClassesForDate(now, eventsStateRef.current.custom, eventsStateRef.current.hidden).forEach(cls => {
          const startMins = timeToMins(cls.time.split(' - ')[0]);
          const endMins = timeToMins(cls.time.split(' - ')[1]);

          // Alerta de Clases Normales
          if (startMins - currentMins === 10 && !cls.isBreak) {
            const classId = `${now.toDateString()}-${cls.subject}-start`;
            if (!notifiedClasses.current.has(classId)) {
              new Notification("¡Clase en 10 min!", { body: `${cls.subject} en ${cls.room}` });
              notifiedClasses.current.add(classId);
            }
          }

          // Alerta Visual y Sonora de "Fin de Ventana"
          if (cls.isBreak && currentMins === endMins) {
            const windowId = `${now.toDateString()}-${cls.subject}-end`;
            if (!notifiedClasses.current.has(windowId)) {
              new Notification("¡Tu ventana ha terminado!", { body: "Prepárate para la siguiente clase." });
              showToast("¡Tu tiempo libre ha terminado! ☕");
              notifiedClasses.current.add(windowId);
            }
          }
        });
      }
    }, 60000); return () => clearInterval(timer);
  }, [notificationsEnabled, recycleBin, isDataLoaded]);

  // Limpieza en el primer inicio por si la app estuvo cerrada mucho tiempo
  useEffect(() => {
    if (!isDataLoaded || recycleBin.length === 0) return;
    const TWO_DAYS = 2 * 24 * 60 * 60 * 1000;
    const now = new Date().getTime();
    const filtered = recycleBin.filter(item => now - item.deletedAt < TWO_DAYS);
    if (filtered.length !== recycleBin.length) {
       setRecycleBin(filtered);
       localStorage.setItem('academic_recycle_bin', JSON.stringify(filtered));
       pushToCloud({ recycleBin: filtered });
    }
  }, [isDataLoaded]);

  // Pomodoro Timer
  useEffect(() => {
    let interval = null;
    if (pomoIsActive && pomoTimeLeft > 0) { interval = setInterval(() => setPomoTimeLeft(time => time - 1), 1000); } 
    else if (pomoTimeLeft === 0) {
      setPomoIsActive(false);
      const isNowBreak = pomoMode === 'study';
      if ("Notification" in window && Notification.permission === "granted") {
        new Notification(isNowBreak ? "¡Tiempo de Descanso!" : "¡A Estudiar!", { 
          body: isNowBreak ? `Tómate ${pomoBreakTime} minutos para recargar energías.` : `El descanso terminó. ¡Hora de enfocarse ${pomoStudyTime} minutos!` 
        });
      }
      setPomoMode(isNowBreak ? 'break' : 'study'); 
      setPomoTimeLeft(isNowBreak ? pomoBreakTime * 60 : pomoStudyTime * 60);
    }
    return () => clearInterval(interval);
  }, [pomoIsActive, pomoTimeLeft, pomoMode, pomoStudyTime, pomoBreakTime]);

  const resetPomodoro = () => {
    setPomoIsActive(false); setPomoMode('study'); setPomoTimeLeft(pomoStudyTime * 60);
  };
  const applyPomoSettings = () => {
    setIsPomoSettingsOpen(false);
    resetPomodoro();
  };

  // Motor Inteligente de Asistencia (Ignora las "Ventanas" y los "Eventos")
  const pendingAttendanceClasses = useMemo(() => {
    const pending = [];
    if (currentTime.getTime() < inductionStart.getTime()) return pending;
    for (let d = new Date(inductionStart); d <= currentTime; d.setDate(d.getDate() + 1)) {
      getClassesForDate(new Date(d), customEvents, hiddenEvents).filter(c => !c.isBreak && c.eventType !== 'evento').forEach(cls => {
        const classEndTime = new Date(d); classEndTime.setHours(...cls.time.split(' - ')[1].split(':'), 0, 0);
        if (classEndTime < currentTime) {
          const classId = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}_${cls.subject}_${cls.time}`;
          if (!attendanceRecords[classId]) pending.push({ id: classId, dateObj: new Date(d), subject: cls.subject, time: cls.time, room: cls.room });
        }
      });
    }
    return pending.sort((a, b) => b.dateObj - a.dateObj);
  }, [currentTime, attendanceRecords, customEvents, hiddenEvents]);

  // Motor Generador de Lista de Próximos Eventos (Global)
  const upcomingEventsList = useMemo(() => {
    const events = [];
    const today = new Date(currentTime);
    today.setHours(0,0,0,0);

    // 1. Obtener eventos de inducción
    if (today < semesterStart) {
      const startD = new Date(Math.max(today.getTime(), inductionStart.getTime()));
      for (let d = new Date(startD); d < semesterStart; d.setDate(d.getDate() + 1)) {
        const dayName = jsDays[d.getDay()];
        const indEvents = inductionScheduleData[dayName] || [];
        indEvents.forEach(e => {
          if (e.eventType === 'evento') {
            const dateStr = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
            const id = `${dateStr}_${e.subject}_${e.time}`;
            if (!hiddenEvents[id]) {
              events.push({ ...e, dateObj: new Date(d), dateStr });
            }
          }
        });
      }
    }

    // 2. Obtener eventos personalizados
    Object.keys(customEvents).forEach(dateStr => {
      const [y, m, d] = dateStr.split('-');
      const evtDate = new Date(y, m - 1, d);
      if (evtDate >= today) {
        const dayEvents = customEvents[dateStr] || [];
        dayEvents.forEach(e => {
          if (e.eventType === 'evento') {
            events.push({ ...e, dateObj: evtDate, dateStr });
          }
        });
      }
    });

    // 3. Filtrar los que ya pasaron hoy por hora y ordenar
    const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
    return events
      .filter(e => {
        if (e.dateObj.getTime() === today.getTime()) {
          return timeToMins(e.time.split(' - ')[1]) > currentMins;
        }
        return true;
      })
      .sort((a, b) => {
        if (a.dateObj.getTime() !== b.dateObj.getTime()) {
          return a.dateObj.getTime() - b.dateObj.getTime();
        }
        return timeToMins(a.time.split(' - ')[0]) - timeToMins(b.time.split(' - ')[0]);
      });
  }, [customEvents, hiddenEvents, currentTime]);

  useEffect(() => { if (isDataLoaded && pendingAttendanceClasses.length > 0 && !hasPromptedAttendance && !isPreInduction) { setShowPendingModal(true); setHasPromptedAttendance(true); } }, [isDataLoaded, pendingAttendanceClasses, hasPromptedAttendance, isPreInduction]);
  useEffect(() => { if (showPendingModal && pendingAttendanceClasses.length === 0) setShowPendingModal(false); }, [pendingAttendanceClasses, showPendingModal]);

  // Funciones con PushToCloud
  const saveNote = (s, t) => { const u = { ...notes, [s]: t }; setNotes(u); localStorage.setItem('academic_notes', JSON.stringify(u)); pushToCloud({ notes: u }); };
  const recordAttendance = (id, st) => { const u = { ...attendanceRecords, [id]: st }; setAttendanceRecords(u); localStorage.setItem('academic_attendance_v3', JSON.stringify(u)); pushToCloud({ attendanceRecords: u }); };
  
  const addExam = (s, title, date) => { 
    if (!title || !date) return; 
    const u = { ...exams, [s]: [...(exams[s] || []), { id: Date.now(), title, date }].sort((a,b) => new Date(a.date) - new Date(b.date)) }; 
    setExams(u); localStorage.setItem('academic_exams', JSON.stringify(u)); pushToCloud({ exams: u }); 
    showToast('Examen Agregado'); 
  };
  const deleteExam = (s, id) => { 
    const u = { ...exams, [s]: (exams[s] || []).filter(e => e.id !== id) }; 
    setExams(u); localStorage.setItem('academic_exams', JSON.stringify(u)); pushToCloud({ exams: u }); 
  };
  
  const addGrade = (s, name, gradeVal, weightVal) => { 
    const val = parseFloat(gradeVal); const w = parseFloat(weightVal); 
    if (isNaN(val) || isNaN(w) || val < 1 || val > 7 || w <= 0 || w > 100) return showToast('Valores Inválidos'); 
    const c = grades[s] || []; 
    if (c.reduce((sum, g) => sum + parseFloat(g.weight), 0) + w > 100) return showToast('Supera el 100%'); 
    const u = { ...grades, [s]: [...c, { id: Date.now(), name, grade: val, weight: w }] }; 
    setGrades(u); localStorage.setItem('academic_grades', JSON.stringify(u)); pushToCloud({ grades: u }); 
    showToast('Nota Registrada'); 
  };
  const deleteGrade = (s, id) => { 
    const u = { ...grades, [s]: (grades[s] || []).filter(g => g.id !== id) }; 
    setGrades(u); localStorage.setItem('academic_grades', JSON.stringify(u)); pushToCloud({ grades: u }); 
  };
  
  const addLink = (s, title, url) => { 
    if (!title || !url) return; 
    let finalUrl = url.startsWith('http') ? url : `https://${url}`; 
    const u = { ...links, [s]: [...(links[s] || []), { id: Date.now(), title, url: finalUrl }] }; 
    setLinks(u); localStorage.setItem('academic_links', JSON.stringify(u)); pushToCloud({ links: u }); 
    showToast('Enlace Guardado'); 
  };
  const deleteLink = (s, id) => { 
    const u = { ...links, [s]: (links[s] || []).filter(l => l.id !== id) }; 
    setLinks(u); localStorage.setItem('academic_links', JSON.stringify(u)); pushToCloud({ links: u }); 
  };

  const calculateGradesStats = (s) => {
    const sg = grades[s] || []; if (sg.length === 0) return { avg: 0, totalWeight: 0, requiredToPass: 0, missingWeight: 100 };
    let pSum = 0; let tWeight = 0; sg.forEach(g => { pSum += (g.grade * (g.weight / 100)); tWeight += parseFloat(g.weight); });
    const cAvg = tWeight > 0 ? (pSum / (tWeight / 100)) : 0; const mWeight = 100 - tWeight;
    let req = mWeight > 0 ? (4.0 - pSum) / (mWeight / 100) : (pSum < 4.0 ? 99 : 0); 
    return { avg: cAvg.toFixed(1), totalWeight: tWeight.toFixed(0), missingWeight: mWeight.toFixed(0), requiredToPass: req };
  };

  const exportDataJSON = () => { const blob = new Blob([JSON.stringify({ notes, attendanceRecords, exams, grades, links, customEvents, hiddenEvents, recycleBin }, null, 2)], { type: 'application/json' }); const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href = url; a.download = 'Backup_Horario.json'; document.body.appendChild(a); a.click(); document.body.removeChild(a); showToast('Exportado exitosamente'); };
  const handleFileUpload = (e) => { const file = e.target.files[0]; if (!file) return; const reader = new FileReader(); reader.onload = (ev) => { try { const imp = JSON.parse(ev.target.result); if (imp.notes) setNotes(imp.notes); if (imp.attendanceRecords) setAttendanceRecords(imp.attendanceRecords); if (imp.exams) setExams(imp.exams); if (imp.grades) setGrades(imp.grades); if (imp.links) setLinks(imp.links); if (imp.customEvents) setCustomEvents(imp.customEvents); if (imp.hiddenEvents) setHiddenEvents(imp.hiddenEvents); if (imp.recycleBin) setRecycleBin(imp.recycleBin); pushToCloud(imp); showToast('Datos importados'); setShowSettingsModal(false); } catch (err) { showToast('Error al importar'); } }; reader.readAsText(file); };

  const handleSaveEvent = (eventData) => {
    const dateStrObj = new Date(eventData.formDate + "T12:00:00");
    const dateStr = `${dateStrObj.getFullYear()}-${dateStrObj.getMonth()+1}-${dateStrObj.getDate()}`;
    
    const newEvent = {
      id: eventData.id || `custom_${Date.now()}`,
      isCustom: true,
      subject: eventData.subject,
      time: `${eventData.startTime} - ${eventData.endTime}`,
      room: eventData.room,
      color: eventData.color,
      replaces: eventData.replaces || null,
      eventType: eventData.eventType || 'evento'
    };

    let newHidden = { ...hiddenEvents };
    if (!eventData.isCustom && eventData.originalId) {
      newHidden[eventData.originalId] = true;
      newEvent.replaces = eventData.originalId;
    }

    let newCustom = { ...customEvents };
    if (eventData.isCustom && eventData.originalDateStr && eventData.originalDateStr !== dateStr) {
      newCustom[eventData.originalDateStr] = (newCustom[eventData.originalDateStr] || []).filter(c => c.id !== eventData.id);
    }

    newCustom[dateStr] = [...(newCustom[dateStr] || []).filter(c => c.id !== newEvent.id), newEvent];

    setHiddenEvents(newHidden); setCustomEvents(newCustom);
    localStorage.setItem('academic_hidden_events', JSON.stringify(newHidden));
    localStorage.setItem('academic_custom_events', JSON.stringify(newCustom));
    pushToCloud({ hiddenEvents: newHidden, customEvents: newCustom });
    setEventModalData(null);
    showToast(newEvent.eventType === 'evento' ? 'Evento guardado' : 'Materia guardada');
  };

  const handleDeleteEvent = (eventData) => {
    const now = Date.now();
    const newRecycleBin = [...recycleBin, { ...eventData, deletedAt: now }];

    if (!eventData.isCustom) {
      const newHidden = { ...hiddenEvents, [eventData.originalId]: true };
      setHiddenEvents(newHidden);
      setRecycleBin(newRecycleBin);
      localStorage.setItem('academic_hidden_events', JSON.stringify(newHidden));
      localStorage.setItem('academic_recycle_bin', JSON.stringify(newRecycleBin));
      pushToCloud({ hiddenEvents: newHidden, recycleBin: newRecycleBin });
    } else {
      let newCustom = { ...customEvents };
      newCustom[eventData.originalDateStr] = (newCustom[eventData.originalDateStr] || []).filter(c => c.id !== eventData.id);
      setCustomEvents(newCustom);
      
      let newHidden = { ...hiddenEvents };
      if (eventData.replaces) {
        delete newHidden[eventData.replaces];
      }
      setHiddenEvents(newHidden);
      setRecycleBin(newRecycleBin);
      localStorage.setItem('academic_custom_events', JSON.stringify(newCustom));
      localStorage.setItem('academic_hidden_events', JSON.stringify(newHidden));
      localStorage.setItem('academic_recycle_bin', JSON.stringify(newRecycleBin));
      pushToCloud({ customEvents: newCustom, hiddenEvents: newHidden, recycleBin: newRecycleBin });
    }
    setEventModalData(null);
    showToast('Movido a la papelera');
  };

  const handleRestoreEvent = (item) => {
    const newRecycleBin = recycleBin.filter(x => x.id !== item.id || x.deletedAt !== item.deletedAt);
    
    if (!item.isCustom) {
       let newHidden = { ...hiddenEvents };
       delete newHidden[item.originalId];
       setHiddenEvents(newHidden);
       setRecycleBin(newRecycleBin);
       localStorage.setItem('academic_hidden_events', JSON.stringify(newHidden));
       localStorage.setItem('academic_recycle_bin', JSON.stringify(newRecycleBin));
       pushToCloud({ hiddenEvents: newHidden, recycleBin: newRecycleBin });
    } else {
       let newCustom = { ...customEvents };
       newCustom[item.originalDateStr] = [...(newCustom[item.originalDateStr] || []), item];
       setCustomEvents(newCustom);

       let newHidden = { ...hiddenEvents };
       if (item.replaces) {
          newHidden[item.replaces] = true;
       }
       setHiddenEvents(newHidden);
       setRecycleBin(newRecycleBin);
       localStorage.setItem('academic_custom_events', JSON.stringify(newCustom));
       localStorage.setItem('academic_hidden_events', JSON.stringify(newHidden));
       localStorage.setItem('academic_recycle_bin', JSON.stringify(newRecycleBin));
       pushToCloud({ customEvents: newCustom, hiddenEvents: newHidden, recycleBin: newRecycleBin });
    }
    showToast('Restaurado');
  };

  const handlePermDelete = (item) => {
    const newRecycleBin = recycleBin.filter(x => x.id !== item.id || x.deletedAt !== item.deletedAt);
    setRecycleBin(newRecycleBin);
    localStorage.setItem('academic_recycle_bin', JSON.stringify(newRecycleBin));
    pushToCloud({ recycleBin: newRecycleBin });
    showToast('Eliminado permanentemente');
  };

  const handleEmptyTrash = () => {
    setRecycleBin([]);
    localStorage.setItem('academic_recycle_bin', JSON.stringify([]));
    pushToCloud({ recycleBin: [] });
    showToast('Papelera vaciada');
    setShowRecycleBinModal(false);
  };

  const getUpcomingExam = (s) => { const ex = exams[s]; if (!ex || ex.length === 0) return null; const n = new Date(); n.setHours(0,0,0,0); const up = ex.find(e => { const d = new Date(e.date); d.setHours(0,0,0,0); const diff = Math.ceil((d - n) / (1000 * 60 * 60 * 24)); return diff >= 0 && diff <= 7; }); if (up) { const d = new Date(up.date); d.setHours(0,0,0,0); return { ...up, daysLeft: Math.ceil((d - n) / (1000 * 60 * 60 * 24)) }; } return null; };

  // --- LÓGICA DE NAVEGACIÓN ---
  const nextTime = () => {
    if (view === 'month') { 
      const mid = new Date(currentWeekStart); mid.setDate(mid.getDate() + 15);
      const nextMonth = new Date(mid.getFullYear(), mid.getMonth() + 1, 1); 
      if (nextMonth.getFullYear() < 2026 || (nextMonth.getFullYear() === 2026 && nextMonth.getMonth() <= 6)) { setCurrentWeekStart(getMonday(nextMonth)); }
    } else if (view === 'week') { 
      const nextWeek = new Date(currentWeekStart); nextWeek.setDate(nextWeek.getDate() + 7); 
      if (nextWeek.getTime() <= semesterEnd.getTime() + (7 * 24 * 60 * 60 * 1000)) { setCurrentWeekStart(nextWeek); }
    } else if (view === 'day') {
      const nextDay = new Date(selectedDay); nextDay.setDate(nextDay.getDate() + 1);
      setSelectedDay(nextDay);
      setCurrentWeekStart(getMonday(nextDay));
    }
  };

  const prevTime = () => {
    if (view === 'month') { 
      const mid = new Date(currentWeekStart); mid.setDate(mid.getDate() + 15);
      const prevMonth = new Date(mid.getFullYear(), mid.getMonth() - 1, 1); 
      if (prevMonth.getFullYear() > 2026 || (prevMonth.getFullYear() === 2026 && prevMonth.getMonth() >= 0)) { setCurrentWeekStart(getMonday(prevMonth)); }
    } else if (view === 'week') { 
      const prevWeek = new Date(currentWeekStart); prevWeek.setDate(prevWeek.getDate() - 7); 
      setCurrentWeekStart(prevWeek); 
    } else if (view === 'day') {
      const prevDay = new Date(selectedDay); prevDay.setDate(prevDay.getDate() - 1);
      setSelectedDay(prevDay);
      setCurrentWeekStart(getMonday(prevDay));
    }
  };

  const goToToday = () => { const now = new Date(); setCurrentWeekStart(getMonday(now)); setSelectedDay(now); setView('day'); };

  const weekDaysArray = []; for (let i = 0; i < 7; i++) { const d = new Date(currentWeekStart); d.setDate(d.getDate() + i); weekDaysArray.push(d); }
  
  const currentShortMonth = monthNames[currentTime.getMonth()].substring(0,3); const currentDateNum = currentTime.getDate(); const currentYear = currentTime.getFullYear();
  const fullDateString = `${jsDays[currentTime.getDay()]}, ${currentDateNum} de ${monthNames[currentTime.getMonth()]} de ${currentYear}`;
  const hour = currentTime.getHours(); let greeting = hour >= 5 && hour < 12 ? 'Buenos días' : hour >= 12 && hour < 19 ? 'Buenas tardes' : 'Buenas noches';

  let nextClass = null; let classStatus = ''; let progressPercent = 0; let timeRemaining = '';
  const currentMins = currentTime.getHours() * 60 + currentTime.getMinutes();
  const classesForRealToday = getClassesForDate(currentTime, customEvents, hiddenEvents);
  if (classesForRealToday.length > 0) {
    for (let cls of classesForRealToday) {
      if(cls.isBreak) continue;
      const [startStr, endStr] = cls.time.split(' - '); const startMins = timeToMins(startStr); const endMins = timeToMins(endStr);
      if (currentMins >= startMins && currentMins <= endMins) { nextClass = cls; classStatus = 'in-progress'; progressPercent = ((currentMins - startMins) / (endMins - startMins)) * 100; const l = endMins - currentMins; timeRemaining = l >= 60 ? `${Math.floor(l / 60)}h ${l % 60}m` : `${l} min`; break; } 
      else if (currentMins < startMins) { nextClass = cls; classStatus = 'upcoming'; const l = startMins - currentMins; timeRemaining = l >= 60 ? `${Math.floor(l / 60)}h ${l % 60}m` : `${l} min`; break; }
    }
  }

  // --- CÁLCULOS ESTILO APPLE (Excluyendo Ventanas Y EVENTOS) ---
  const uniqueSubjectsList = useMemo(() => {
    const s = new Set(); 
    Object.values(regularScheduleData).flat().filter(c => !c.isBreak).forEach(cls => s.add(cls.subject));
    Object.values(customEvents).flat().filter(c => !c.isBreak && c.eventType !== 'evento').forEach(cls => s.add(cls.subject));
    return Array.from(s);
  }, [customEvents]);

  const academicLoadDetails = useMemo(() => {
    const load = {};
    Object.keys(regularScheduleData).forEach(day => {
      regularScheduleData[day].filter(c => !c.isBreak).forEach(cls => {
        if(!load[cls.subject]) load[cls.subject] = 0;
        const [start, end] = cls.time.split(' - ');
        load[cls.subject] += (timeToMins(end) - timeToMins(start));
      });
    });
    return Object.entries(load).map(([subject, mins]) => ({ subject, mins })).sort((a,b) => b.mins - a.mins);
  }, []);

  const stats = React.useMemo(() => {
    let tM = 0;
    Object.keys(regularScheduleData).forEach(day => regularScheduleData[day].filter(c => !c.isBreak).forEach(c => { const [s, e] = c.time.split(' - '); tM += (timeToMins(e) - timeToMins(s)); }));
    return { totalSubjects: uniqueSubjectsList.length, totalHours: (tM / 60).toFixed(1) };
  }, [uniqueSubjectsList]);

  const globalAttendancePct = useMemo(() => {
    let pC = 0, total = 0;
    uniqueSubjectsList.forEach(subj => {
      Object.keys(attendanceRecords).forEach(k => {
        if (k.includes(`_${subj}_`)) { total++; if (attendanceRecords[k] === 'present') pC++; }
      });
    });
    return total === 0 ? 100 : Math.round((pC / total) * 100);
  }, [attendanceRecords, uniqueSubjectsList]);

  // GRÁFICOS ACUMULATIVOS: Calcula la progresión real sin caer a 0 en días futuros
  const attendanceChartDataWeek = useMemo(() => {
    let cumP = 0, cumT = 0;
    return weekDaysArray.map(date => {
      const dStart = new Date(date); dStart.setHours(0,0,0,0);
      const now = new Date(); now.setHours(0,0,0,0);
      
      getClassesForDate(date, customEvents, hiddenEvents).filter(c => !c.isBreak && c.eventType !== 'evento').forEach(cls => {
        const e = new Date(date); e.setHours(...cls.time.split(' - ')[1].split(':'), 0, 0);
        if (e < currentTime) { 
            cumT++; 
            const id = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${cls.subject}_${cls.time}`; 
            if (attendanceRecords[id] === 'present') cumP++; 
        }
      });
      const pct = cumT === 0 ? 100 : (cumP / cumT) * 100;
      return { label: jsDays[date.getDay()].substring(0,3), pct };
    });
  }, [weekDaysArray, attendanceRecords, currentTime, customEvents, hiddenEvents]);

  const attendanceChartDataMonth = useMemo(() => {
    const mid = new Date(currentWeekStart); mid.setDate(mid.getDate() + 15);
    const targetMonth = mid.getMonth(); const targetYear = mid.getFullYear();
    const lastDay = new Date(targetYear, targetMonth + 1, 0).getDate();
    
    const weeks = [ {p:0,t:0}, {p:0,t:0}, {p:0,t:0}, {p:0,t:0} ];
    let cumP = 0, cumT = 0;
    
    for(let day = 1; day <= lastDay; day++) {
       const d = new Date(targetYear, targetMonth, day);
       const weekIdx = Math.min(3, Math.floor((day - 1) / 7)); 
       
       getClassesForDate(d, customEvents, hiddenEvents).filter(c => !c.isBreak && c.eventType !== 'evento').forEach(cls => {
          const e = new Date(d); e.setHours(...cls.time.split(' - ')[1].split(':'), 0, 0);
          if (e < currentTime) { 
              weeks[weekIdx].t++; cumT++;
              const id = `${d.getFullYear()}-${d.getMonth()+1}-${d.getDate()}_${cls.subject}_${cls.time}`; 
              if (attendanceRecords[id] === 'present') { weeks[weekIdx].p++; cumP++; }
          }
       });
    }
    
    let runningP = 0, runningT = 0;
    return weeks.map((w, i) => {
       runningP += w.p; runningT += w.t;
       const pct = runningT === 0 ? 100 : (runningP / runningT) * 100;
       return { label: `S${i+1}`, pct };
    });
  }, [currentWeekStart, attendanceRecords, currentTime, customEvents, hiddenEvents]);

  const semesterProgress = React.useMemo(() => {
    const now = currentTime.getTime(); if (now < semesterStart.getTime()) return 0; if (now > semesterEnd.getTime()) return 100;
    return Math.round(((now - semesterStart.getTime()) / (semesterEnd.getTime() - semesterStart.getTime())) * 100);
  }, [currentTime]);

  const formatPomoTime = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  let navTitle = '';
  const midMonthDate = new Date(currentWeekStart); midMonthDate.setDate(midMonthDate.getDate() + 15);

  if (view === 'month') navTitle = `${monthNames[midMonthDate.getMonth()]} ${midMonthDate.getFullYear()}`;
  else if (view === 'week') navTitle = `Semana ${weekDaysArray[0].getDate()} ${monthNames[weekDaysArray[0].getMonth()].substring(0,3)} al ${weekDaysArray[6].getDate()} ${monthNames[weekDaysArray[6].getMonth()].substring(0,3)}`;
  else navTitle = `${jsDays[selectedDay.getDay()]}, ${selectedDay.getDate()} de ${monthNames[selectedDay.getMonth()]}`;

  const renderMonthDays = () => {
    const year = midMonthDate.getFullYear(); const month = midMonthDate.getMonth();
    const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0);
    const days = [];
    let startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1;
    for (let i = 0; i < startOffset; i++) days.push(null);
    for (let i = 1; i <= lastDay.getDate(); i++) days.push(new Date(year, month, i));

    return days.map((date, idx) => {
      if (!date) return <div key={`empty-${idx}`} className="h-10 sm:h-20" />;
      const classes = getClassesForDate(date, customEvents, hiddenEvents).filter(c => !c.isBreak);
      const hasClasses = classes.length > 0;
      const isSelected = selectedDay.toDateString() === date.toDateString() && view === 'day';
      const isToday = date.toDateString() === (new Date()).toDateString();

      const bgClasses = isSelected ? 'border-blue-600 bg-blue-50 shadow-md ring-1 ring-blue-600' :
                        isToday ? 'border-blue-400 bg-blue-100 shadow-sm' :
                        hasClasses ? 'border-gray-300 bg-white shadow-[0_1px_4px_rgba(0,0,0,0.02)] hover:border-gray-400' :
                        'border-transparent bg-transparent opacity-40 hover:bg-gray-100';

      return (
        <div 
          key={date.toISOString()}
          onClick={() => { setSelectedDay(date); setCurrentWeekStart(getMonday(date)); setView('day'); }}
          className={`h-10 sm:h-20 rounded-xl sm:rounded-2xl p-1 sm:p-1.5 flex flex-col items-center sm:items-start justify-start cursor-pointer transition-all active:scale-95 border ${bgClasses}`}
        >
          <span className={`text-[9px] sm:text-sm font-black ${isSelected || isToday ? 'text-blue-700' : hasClasses ? 'text-gray-900' : 'text-gray-400'}`}>
            {date.getDate()}
          </span>
          {hasClasses && (
            <div className="mt-auto flex flex-wrap gap-1 w-full justify-center sm:justify-start px-0.5 pb-0.5">
              {classes.map((c, i) => (
                <div key={i} className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full ${getDotColor(c.color)}`} title={c.subject} />
              ))}
            </div>
          )}
        </div>
      );
    });
  };

  const renderClassCard = (cls, idx, date, isToday) => {
    const classId = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${cls.subject}_${cls.time}`;
    // Si es evento, no mostramos asistencia ni exámenes vinculados.
    const status = cls.eventType === 'evento' ? null : attendanceRecords[classId]; 
    const exam = cls.eventType === 'evento' ? null : getUpcomingExam(cls.subject);
    const isC = isToday && currentMins >= timeToMins(cls.time.split(' - ')[0]) && currentMins <= timeToMins(cls.time.split(' - ')[1]);

    if (cls.isBreak) {
      return (
        <div key={idx} className="border border-stone-200 bg-stone-50/80 p-3 sm:p-5 rounded-[1.2rem] sm:rounded-[2rem] shadow-sm flex flex-col items-center justify-center text-center relative overflow-hidden group hover:bg-stone-100 transition-colors">
          <Coffee className="w-5 h-5 sm:w-7 sm:h-7 text-stone-400 mb-1 sm:mb-2 group-hover:scale-110 transition-transform" />
          <h3 className="font-black text-stone-600 text-[11px] sm:text-[13px] tracking-tight uppercase break-words px-2">{cls.subject}</h3>
          <div className="mt-1 sm:mt-1.5 space-y-1 text-[9px] sm:text-[10px] font-bold text-stone-400">
            <div className="flex items-center justify-center gap-1.5"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span>{cls.time}</span></div>
          </div>
        </div>
      );
    }

    return (
      <div 
        key={idx} 
        onClick={() => { 
          // Solo abrir panel de administración si NO es evento y NO es break
          if (cls.eventType !== 'evento' && !cls.isBreak) {
             setSelectedSubjectModal(cls.subject); 
             setModalTab('attendance'); 
          }
        }} 
        className={`border ${cls.color} p-3 sm:p-5 rounded-[1.2rem] sm:rounded-[2rem] bg-white shadow-sm hover:shadow-md transition-all ${cls.eventType !== 'evento' ? 'cursor-pointer' : ''} flex flex-col relative overflow-hidden active:scale-95 ${isC ? 'ring-2 ring-blue-500' : ''}`}
      >
        <div className="flex justify-between items-start gap-2 mb-3 sm:mb-4">
          <h3 className="font-black text-gray-900 text-xs sm:text-[15px] leading-tight pr-1 tracking-tight flex-1 break-words">{cls.subject}</h3>
          <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
            {status && <div className="p-1 rounded-full bg-white shadow-sm">{status === 'present' ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4 text-green-500" /> : <XCircle className="w-3 h-3 sm:w-4 sm:h-4 text-red-500" />}</div>}
            <button onClick={(e) => { 
                e.stopPropagation(); 
                const originalId = `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}_${cls.subject}_${cls.time}`;
                setEventModalData({
                    ...cls,
                    originalId,
                    originalDateStr: `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}`,
                    formDate: toLocalISODate(date),
                    startTime: cls.time.split(' - ')[0],
                    endTime: cls.time.split(' - ')[1],
                    eventType: cls.eventType || 'materia'
                });
            }} className="p-1 sm:p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                <FileEdit className="w-3 h-3 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
        {exam && <div className="mb-3 sm:mb-4 bg-white/80 p-2 sm:p-2.5 rounded-xl sm:rounded-2xl border border-red-100 flex items-center gap-1.5"><AlertTriangle className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-600" /><span className="text-[9px] sm:text-[10px] font-black text-red-700 uppercase tracking-wider">{exam.title} {exam.daysLeft === 0 ? 'HOY' : `${exam.daysLeft}D`}</span></div>}
        <div className="mt-auto space-y-1.5 sm:space-y-2 text-[10px] sm:text-[11px] font-bold text-gray-500">
          <div className="flex items-center gap-1.5 sm:gap-2"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300" /> <span>{cls.time}</span></div>
          <div className="flex items-center gap-1.5 sm:gap-2"><MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300" /> <span className="text-gray-800">{cls.room}</span></div>
        </div>
      </div>
    );
  };

  return (
    <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }} className="min-h-screen bg-[#F2F2F7] text-[#1C1C1E] relative pb-24 selection:bg-blue-200 antialiased">
      
      {/* TOASTS */}
      <div className={`fixed bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 bg-gray-900/90 backdrop-blur-2xl text-white px-4 sm:px-5 py-2 sm:py-3 rounded-full shadow-[0_8px_30px_rgb(0,0,0,0.2)] flex items-center gap-2 transition-all duration-300 z-[100] ${toastMessage ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95 pointer-events-none'}`}>
        <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
        <span className="font-bold text-xs sm:text-sm tracking-wide">{toastMessage}</span>
      </div>

      {/* WIDGET POMODORO FLOTANTE */}
      {showPomodoro && (
        <div className="fixed bottom-24 right-4 sm:bottom-10 sm:right-10 bg-white/95 backdrop-blur-3xl border border-white shadow-[0_12px_40px_rgb(0,0,0,0.15)] rounded-[2rem] sm:rounded-[2.5rem] p-5 sm:p-6 w-56 sm:w-64 z-[90] animate-in slide-in-from-bottom-5 duration-300">
          {isPomoSettingsOpen ? (
            <div className="flex flex-col h-full justify-between">
              <div className="flex justify-between items-center mb-4"><span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-400">Temporizador</span></div>
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-5">
                <div><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block ml-1">Estudio (minutos)</label><input type="number" min="1" max="120" value={pomoStudyTime} onChange={e => setPomoStudyTime(Number(e.target.value))} className="w-full bg-[#F2F2F7] text-gray-900 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner text-sm" /></div>
                <div><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-wider mb-1 block ml-1">Descanso (minutos)</label><input type="number" min="1" max="60" value={pomoBreakTime} onChange={e => setPomoBreakTime(Number(e.target.value))} className="w-full bg-[#F2F2F7] text-gray-900 font-bold px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-green-500 shadow-inner text-sm" /></div>
                {!notificationsEnabled && (
                   <button onClick={requestNotificationPermission} className="mt-2 w-full py-2 bg-yellow-50 text-yellow-700 text-[9px] sm:text-[10px] font-bold rounded-lg sm:rounded-xl border border-yellow-200">Activar Notificaciones</button>
                )}
              </div>
              <button onClick={applyPomoSettings} className="w-full py-3 sm:py-3.5 bg-blue-600 text-white rounded-[1rem] sm:rounded-[1.2rem] font-black text-[10px] sm:text-xs shadow-md active:scale-95 transition-all uppercase tracking-widest">Guardar</button>
            </div>
          ) : (
            <>
              <div className="flex justify-between items-center mb-2"><span className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-1 sm:px-2.5 rounded-lg ${pomoMode === 'study' ? 'bg-blue-50 text-blue-600' : 'bg-green-50 text-green-600'}`}>{pomoMode === 'study' ? 'Concentración' : 'Descanso'}</span><div className="flex items-center gap-1 sm:gap-1.5"><button onClick={() => setIsPomoSettingsOpen(true)} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 sm:p-2 rounded-full"><SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button><button onClick={() => setShowPomodoro(false)} className="text-gray-400 hover:text-gray-700 transition-colors bg-gray-50 hover:bg-gray-100 p-1.5 sm:p-2 rounded-full"><X className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button></div></div>
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 mx-auto my-3 sm:my-4 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90 absolute top-0 left-0"><circle cx="50%" cy="50%" r="45%" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-gray-100" /><circle cx="50%" cy="50%" r="45%" strokeWidth="8" fill="transparent" strokeDasharray={2 * Math.PI * 60} strokeDashoffset={(2 * Math.PI * 60) - ((pomoMode === 'study' ? (pomoTimeLeft / (pomoStudyTime * 60)) : (pomoTimeLeft / (pomoBreakTime * 60))) * (2 * Math.PI * 60))} className={`${pomoMode === 'study' ? 'stroke-blue-600' : 'stroke-green-600'} transition-all duration-1000 ease-linear`} strokeLinecap="round" /></svg>
                <p className="text-3xl sm:text-4xl font-black tabular-nums text-gray-900 tracking-tighter z-10">{formatPomoTime(pomoTimeLeft)}</p>
              </div>
              <div className="flex justify-center gap-3 sm:gap-4 mt-2 sm:mt-3">
                 <button onClick={() => setPomoIsActive(!pomoIsActive)} className={`w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full text-white shadow-lg active:scale-90 transition-all ${pomoIsActive ? 'bg-orange-500 hover:bg-orange-600' : 'bg-blue-600 hover:bg-blue-700'}`}>
                   {pomoIsActive ? <Pause className="w-4 h-4 sm:w-5 sm:h-5 fill-current" /> : <Play className="w-4 h-4 sm:w-5 sm:h-5 fill-current translate-x-[2px]" />}
                 </button>
                 <button onClick={resetPomodoro} className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gray-50 text-gray-500 hover:bg-gray-200 transition-colors shadow-sm active:scale-90">
                   <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5" />
                 </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* CONTENEDOR PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-3 py-4 sm:px-5 sm:py-6 md:px-10 md:py-10 space-y-4 sm:space-y-6">
        
        {/* HEADER CON NOMBRE MINIMALISTA */}
        <header className="bg-white border border-gray-200/60 shadow-[0_2px_12px_rgba(0,0,0,0.03)] rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 sm:gap-6 transition-all duration-300">
          <div className="flex items-center gap-3 sm:gap-5">
            <div className="hidden sm:flex flex-col items-center justify-between w-12 h-12 md:w-16 md:h-16 bg-[#F8F9FA] rounded-xl sm:rounded-2xl shadow-inner border border-gray-100 overflow-hidden shrink-0">
              <div className="bg-red-500 w-full text-center py-0.5 sm:py-1 text-[8px] sm:text-[9px] font-black text-white tracking-widest uppercase">{currentShortMonth}</div>
              <div className="flex-1 flex items-center justify-center text-xl sm:text-2xl font-black text-gray-900 pb-0.5">{currentDateNum}</div>
            </div>
            <div>
              <div className="flex items-center gap-1.5 sm:gap-2 mb-1 sm:mb-1.5 opacity-80">
                <User className="w-3 h-3 sm:w-3 text-gray-400" />
                <p className="text-[8px] sm:text-[9px] font-black text-gray-400 tracking-[0.25em] uppercase">Benjamin Cerda</p>
              </div>
              <h1 className="text-2xl sm:text-3xl md:text-5xl font-black tracking-tight text-[#1C1C1E] mb-1 sm:mb-1.5 leading-none">Mi Horario</h1>
              <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                <p className="text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">{greeting}</p>
                <span className="hidden sm:inline text-gray-200">|</span>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{fullDateString}</p>
              </div>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 w-full md:w-auto">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 bg-[#F8F9FA] rounded-lg sm:rounded-xl text-[10px] sm:text-[11px] font-black text-gray-500 border border-gray-200 shadow-inner cursor-pointer hover:bg-gray-200 transition-colors" onClick={() => setShowSettingsModal(true)}>
              {cloudStatus === 'synced' ? <Cloud className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-500" /> : <CloudOff className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-gray-300" />}
              <span className="uppercase tracking-widest">{cloudStatus === 'synced' ? 'Sincronizado' : 'Desconectado'}</span>
            </div>
            
            {pendingAttendanceClasses.length > 0 && (
              <button onClick={() => setShowPendingModal(true)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-orange-50 border border-orange-100 text-orange-600 hover:bg-orange-100 shadow-sm active:scale-95 transition-all relative flex items-center gap-1.5 sm:gap-2" title="Asistencia Pendiente">
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline text-[9px] sm:text-[10px] font-black uppercase tracking-widest">Pendientes</span>
                <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-orange-500 border-2 border-white rounded-full animate-pulse" />
              </button>
            )}

            <button onClick={() => setShowRecycleBinModal(true)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-red-50 border border-red-100 text-red-600 hover:bg-red-100 shadow-sm active:scale-95 transition-all relative" title="Papelera">
              <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
              {recycleBin.length > 0 && <span className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-red-500 border-2 border-white rounded-full animate-pulse" />}
            </button>
            
            <button onClick={() => setEventModalData({ isNew: true, formDate: toLocalISODate(new Date()), startTime: '08:00', endTime: '09:30', color: colors.cornerstone, subject: '', room: '', eventType: 'evento' })} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-blue-50 border border-blue-100 text-blue-600 hover:bg-blue-100 shadow-sm active:scale-95 transition-all" title="Añadir">
              <CalendarPlus className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button onClick={() => setShowPomodoro(!showPomodoro)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-600 hover:bg-indigo-100 shadow-sm active:scale-95 transition-all" title="Pomodoro">
              <Timer className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button onClick={() => setShowVerseModal(true)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-rose-50 border border-rose-100 text-rose-600 hover:bg-rose-100 shadow-sm active:scale-95 transition-all" title="Versículo Diario">
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button onClick={() => setShowTrophiesModal(true)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-amber-50 border border-amber-100 text-amber-600 hover:bg-amber-100 shadow-sm active:scale-95 transition-all" title="Mis Trofeos">
              <Trophy className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            
            <button onClick={() => setShowSettingsModal(true)} className="p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-gray-100 border border-gray-200 text-gray-700 hover:bg-gray-200 shadow-sm active:scale-95 transition-all" title="Ajustes">
              <Settings className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </header>

        {/* --- ESTADÍSTICAS PROPORCIONALES --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <StatCard icon={<BookOpen className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} title="Materias" value={stats.totalSubjects} color="text-blue-600" bg="bg-blue-50" onClick={() => setShowSubjectsListModal(true)} />
          <StatCard icon={<Activity className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} title="Asistencia" value={`${globalAttendancePct}%`} color={globalAttendancePct < 75 ? "text-red-500" : "text-indigo-600"} bg="bg-indigo-50" onClick={() => setShowGlobalAttendanceModal(true)} />
          <StatCard icon={<Timer className="w-3.5 h-3.5 sm:w-4 sm:h-4"/>} title="Carga" value={stats.totalHours} unit="hrs" color="text-emerald-600" bg="bg-emerald-50" onClick={() => setShowAcademicLoadModal(true)} />
          <div className="bg-white p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.8rem] border border-gray-200 shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-2 sm:gap-3">
              <div className="flex items-center justify-between"><div className="p-2 sm:p-2.5 bg-rose-50 text-rose-600 rounded-[1rem] sm:rounded-[1.1rem]"><TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><span className="text-[9px] sm:text-[10px] font-black text-rose-600 bg-rose-50 px-2 py-0.5 rounded-lg border border-rose-100">{semesterProgress}%</span></div>
              <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 sm:mb-1.5">Semestre</p><div className="w-full bg-[#F2F2F7] rounded-full h-1.5 sm:h-2 overflow-hidden shadow-inner"><div className="bg-rose-500 h-1.5 sm:h-2 rounded-full transition-all duration-1000" style={{ width: `${semesterProgress}%` }}></div></div></div>
          </div>
        </div>

        {/* --- PRÓXIMOS EVENTOS --- */}
        {upcomingEventsList.length > 0 && (
           <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-4 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-200/80">
             <div 
                className="flex items-center justify-between cursor-pointer group select-none"
                onClick={() => setIsEventsExpanded(!isEventsExpanded)}
             >
                <div className="flex items-center gap-2 sm:gap-3">
                   <div className="p-2 sm:p-2.5 bg-blue-50 text-blue-600 rounded-[1rem] sm:rounded-[1.1rem]"><CalendarIcon className="w-4 h-4 sm:w-5 sm:h-5"/></div>
                   <h2 className="text-base sm:text-lg font-black text-gray-900 uppercase tracking-tight">Próximos Eventos</h2>
                   {isEventsExpanded ? <ChevronUp className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-blue-500 transition-colors" /> : <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />}
                </div>
                <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest bg-gray-50 px-2 sm:px-3 py-1 sm:py-1.5 rounded-lg sm:rounded-xl border border-gray-100">{upcomingEventsList.length} pend.</span>
             </div>
             
             <div className={`grid transition-[grid-template-rows,opacity,margin] duration-300 ease-in-out ${isEventsExpanded ? 'grid-rows-[1fr] opacity-100 mt-3 sm:mt-4' : 'grid-rows-[0fr] opacity-0 mt-0'}`}>
                <div className="overflow-hidden">
                   <div className="flex overflow-x-auto gap-3 sm:gap-4 pb-2 sm:pb-4 snap-x snap-mandatory no-scrollbar -mx-2 px-2">
                      {upcomingEventsList.map((evt, i) => (
                         <div 
                           key={i} 
                           onClick={() => {
                               const originalId = `${evt.dateStr}_${evt.subject}_${evt.time}`;
                               setEventModalData({
                                   ...evt,
                                   originalId,
                                   originalDateStr: evt.dateStr,
                                   formDate: toLocalISODate(evt.dateObj),
                                   startTime: evt.time.split(' - ')[0],
                                   endTime: evt.time.split(' - ')[1],
                                   eventType: 'evento'
                               });
                           }} 
                           className={`shrink-0 w-[200px] sm:w-[260px] p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[2rem] border ${evt.color} bg-white shadow-sm flex flex-col justify-between snap-start relative overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.02] active:scale-95 transition-all`}
                         >
                           <div>
                             <h3 className="font-black text-sm sm:text-[15px] leading-tight pr-1 tracking-tight text-gray-900 mb-1.5 sm:mb-2">{evt.subject}</h3>
                             <p className="text-[8px] sm:text-[9px] font-black uppercase tracking-widest opacity-80 mb-3 sm:mb-4 inline-block px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white/60 shadow-sm border border-white/50">
                                {jsDays[evt.dateObj.getDay()]} {evt.dateObj.getDate()} {monthNames[evt.dateObj.getMonth()].substring(0,3)}
                             </p>
                           </div>
                           <div className="space-y-1 sm:space-y-1.5 text-[10px] sm:text-[11px] font-bold opacity-75 mt-auto pt-2 sm:pt-3 border-t border-black/5">
                             <div className="flex items-center gap-1.5 sm:gap-2"><Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span>{evt.time}</span></div>
                             <div className="flex items-center gap-1.5 sm:gap-2"><MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5" /> <span className="truncate">{evt.room}</span></div>
                           </div>
                         </div>
                      ))}
                   </div>
                </div>
             </div>
           </div>
        )}

        {nextClass && (
          <div className={`p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[2rem] shadow-[0_2px_15px_rgba(0,0,0,0.02)] border overflow-hidden relative ${classStatus === 'in-progress' ? 'bg-gradient-to-br from-green-50 to-white border-green-200' : 'bg-gradient-to-br from-blue-50 to-white border-blue-200'}`}>
            {classStatus === 'in-progress' && <div className="absolute bottom-0 left-0 h-1 sm:h-1.5 bg-green-500 transition-all duration-1000" style={{ width: `${progressPercent}%` }} />}
            <div className="flex items-center gap-4 sm:gap-5 relative z-10">
              <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl shrink-0 bg-white shadow-sm border border-gray-100 ${classStatus === 'in-progress' ? 'text-green-600' : 'text-blue-600'}`}>
                 {nextClass.eventType === 'evento' ? <CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" /> : <Bell className="w-5 h-5 sm:w-6 sm:h-6" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start gap-2"><h4 className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${classStatus === 'in-progress' ? 'text-green-700' : 'text-blue-700'}`}>{classStatus === 'in-progress' ? 'En Curso' : 'Próxima'}</h4><span className="text-[9px] sm:text-[10px] font-black px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md sm:rounded-lg bg-white shadow-sm border border-gray-100">{timeRemaining}</span></div>
                <p className="text-gray-900 font-black mt-0.5 sm:mt-1 text-sm sm:text-xl truncate tracking-tight">{nextClass.subject}</p>
                <p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5 flex items-center gap-1"><MapPin className="w-3 h-3 sm:w-3.5 sm:h-3.5"/> {nextClass.room} <span className="mx-0.5 sm:mx-1">•</span> {nextClass.time}</p>
              </div>
            </div>
          </div>
        )}

        {/* --- NAVEGADOR DE FECHA --- */}
        <div className="bg-white rounded-[1.2rem] sm:rounded-[1.8rem] p-1.5 sm:p-2.5 border border-gray-200 shadow-[0_4px_15px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row justify-between items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start">
            <div className="flex items-center gap-1 sm:gap-1.5 bg-[#F2F2F7] p-1 rounded-xl sm:rounded-2xl border border-gray-200/60 shadow-inner">
              <button onClick={prevTime} className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white text-gray-600 shadow-sm border border-gray-100 active:scale-90 transition-all"><ChevronLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
              <button onClick={goToToday} className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-lg sm:rounded-xl bg-white text-[10px] sm:text-[11px] font-black flex items-center gap-1 sm:gap-2 text-gray-900 shadow-sm border border-gray-100 active:scale-90 transition-all uppercase tracking-widest">Hoy</button>
              <button onClick={nextTime} className="p-2 sm:p-2.5 rounded-lg sm:rounded-xl bg-white text-gray-600 shadow-sm border border-gray-100 active:scale-90 transition-all"><ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button>
            </div>
            <span className="text-[10px] sm:text-[11px] font-black text-gray-500 uppercase tracking-widest hidden sm:inline ml-2 sm:ml-4">{navTitle}</span>
          </div>
          <div className="flex bg-[#F2F2F7] p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full sm:w-auto shadow-inner border border-gray-200/60">
            {['day', 'week', 'month'].map(v => (
              <button key={v} onClick={() => setView(v)} className={`flex-1 sm:px-6 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${view === v ? 'bg-white shadow-[0_2px_8px_rgba(0,0,0,0.1)] text-gray-900' : 'text-gray-400 hover:text-gray-600'}`}>{v === 'day' ? 'Día' : v === 'week' ? 'Semana' : 'Mes'}</button>
            ))}
          </div>
          <span className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest sm:hidden pb-1">{navTitle}</span>
        </div>

        {/* --- VISTAS --- */}
        {view === 'month' ? (
          <div className="bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-3 sm:p-6 shadow-[0_2px_15px_rgba(0,0,0,0.02)] border border-gray-200/80 animate-in fade-in duration-500">
             <div className="grid grid-cols-7 gap-1.5 sm:gap-2 mb-3 sm:mb-6">
                {['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(d => (<div key={d} className="text-center text-[10px] sm:text-xs font-black text-gray-300 uppercase tracking-widest">{d}</div>))}
             </div>
             <div className="grid grid-cols-7 gap-1.5 sm:gap-3 lg:gap-4">{renderMonthDays()}</div>
          </div>
        ) : (
          <div className={`grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5 lg:gap-6 ${view === 'week' ? 'lg:grid-cols-3 xl:grid-cols-6' : 'lg:grid-cols-1'}`}>
            {weekDaysArray.map((date) => {
              if (view === 'week' && date.getDay() === 0) return null; // Ocultar domingo en vista semanal
              if (view === 'day' && date.toDateString() !== selectedDay.toDateString()) return null;

              const classes = getClassesForDate(date, customEvents, hiddenEvents);
              const isToday = date.toDateString() === currentTime.toDateString();
              
              const hideOnMobile = view === 'week' && classes.length === 0 && !isToday;

              // Separamos Eventos de Materias/Ventanas
              const eventosList = classes.filter(c => c.eventType === 'evento');
              const materiasList = classes.filter(c => c.eventType !== 'evento');

              return (
                <div key={date.toISOString()} className={`flex flex-col gap-3 sm:gap-4 ${hideOnMobile ? 'hidden lg:flex' : ''} ${isToday && view === 'week' ? 'bg-blue-50/40 rounded-[1.5rem] sm:rounded-[2.5rem] p-3 sm:p-4 -m-3 sm:-m-4 ring-1 ring-blue-200/50' : ''}`}>
                  <h2 className="text-xs sm:text-sm font-black text-gray-900 pb-2 sm:pb-2.5 border-b border-gray-200/60 flex items-center justify-between sticky top-0 z-10">
                    <span className="uppercase tracking-widest">{jsDays[date.getDay()]} <span className="text-gray-400 ml-1 font-bold">{date.getDate()}</span></span>
                    {isToday && <span className="text-[7px] sm:text-[8px] font-black bg-blue-600 text-white px-1.5 sm:px-2 py-0.5 rounded-md shadow-sm uppercase">Actual</span>}
                  </h2>
                  <div className="flex flex-col gap-3 sm:gap-4">
                    
                    {eventosList.length > 0 && (
                      <div className="flex flex-col gap-2.5 sm:gap-3 mb-1">
                        <h3 className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 opacity-80">
                          <CalendarIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> Eventos Diarios
                        </h3>
                        {eventosList.map((cls, idx) => renderClassCard(cls, `evt-${idx}`, date, isToday))}
                      </div>
                    )}

                    {materiasList.length > 0 && (
                      <div className="flex flex-col gap-3 sm:gap-4">
                        {eventosList.length > 0 && (
                          <h3 className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1 flex items-center gap-1.5 mt-1.5 sm:mt-2 opacity-80">
                            <BookOpen className="w-2.5 h-2.5 sm:w-3 sm:h-3"/> Clases Regulares
                          </h3>
                        )}
                        {materiasList.map((cls, idx) => renderClassCard(cls, `mat-${idx}`, date, isToday))}
                      </div>
                    )}

                    {classes.length === 0 && (
                      <div className={`h-20 sm:h-24 rounded-[1.2rem] sm:rounded-[2rem] border border-dashed border-gray-200 bg-white/40 flex items-center justify-center text-[9px] sm:text-[10px] font-black text-gray-300 uppercase tracking-widest`}>Sin Clases</div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODALES SUPERPUESTOS */}
      {showVerseModal && <DailyVerseModal onClose={() => setShowVerseModal(false)} verse={currentDailyVerse} />}
      {showSubjectsListModal && <SubjectListModal onClose={() => setShowSubjectsListModal(false)} subjects={uniqueSubjectsList} onSelect={(s) => { setSelectedSubjectModal(s); setModalTab('grades'); }} />}
      {showAcademicLoadModal && <AcademicLoadModal onClose={() => setShowAcademicLoadModal(false)} load={academicLoadDetails} total={stats.totalHours} />}
      {showGlobalAttendanceModal && <GlobalAttendanceModal onClose={() => setShowGlobalAttendanceModal(false)} pct={globalAttendancePct} period={attendanceChartPeriod} setPeriod={setAttendanceChartPeriod} weekData={attendanceChartDataWeek} monthData={attendanceChartDataMonth} />}
      {showTrophiesModal && <TrophiesModal onClose={() => setShowTrophiesModal(false)} currentTime={currentTime} semesterStart={semesterStart} semesterEnd={semesterEnd} />}

      {/* MODAL GESTOR DE MATERIA */}
      {selectedSubjectModal && (
        <SubjectModal 
          subject={selectedSubjectModal} 
          initialTab={modalTab}
          onClose={() => setSelectedSubjectModal(null)}
          attendanceRecords={attendanceRecords}
          grades={grades}
          exams={exams}
          links={links}
          notes={notes}
          addGrade={addGrade}
          deleteGrade={deleteGrade}
          addExam={addExam}
          deleteExam={deleteExam}
          addLink={addLink}
          deleteLink={deleteLink}
          saveNote={saveNote}
          calculateGradesStats={calculateGradesStats}
          recordAttendance={recordAttendance}
        />
      )}
      
      {showSettingsModal && <SettingsModal onClose={() => setShowSettingsModal(false)} syncKey={syncKey} cloudStatus={cloudStatus} tempSyncKey={tempSyncKey} setTempSyncKey={setTempSyncKey} onApply={handleChangeSyncKey} onExport={exportDataJSON} onImport={handleFileUpload} fileRef={fileInputRef} db={db} />}
      {showPendingModal && <PendingModal onClose={() => setShowPendingModal(false)} classes={pendingAttendanceClasses} onAction={recordAttendance} names={monthNames} days={jsDays} />}
      {eventModalData && <EventEditorModal data={eventModalData} onClose={() => setEventModalData(null)} onSave={handleSaveEvent} onDelete={handleDeleteEvent} />}
      {showRecycleBinModal && <RecycleBinModal onClose={() => setShowRecycleBinModal(false)} items={recycleBin} onRestore={handleRestoreEvent} onEmpty={handleEmptyTrash} onPermDelete={handlePermDelete} />}
    </div>
  );
}

// --- COMPONENTES MODALES Y EXTRAS ---

function RecycleBinModal({ onClose, items, onRestore, onEmpty, onPermDelete }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[150] p-4 sm:p-5 animate-in fade-in duration-300">
      <div className="bg-[#F2F2F7] w-full max-w-md rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="p-1.5 sm:p-2 bg-red-50 text-red-500 rounded-lg sm:rounded-xl"><Trash2 className="w-4 h-4 sm:w-5 sm:h-5"/></div>
            <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight">Papelera</h3>
          </div>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[60vh] space-y-2 sm:space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-8 sm:py-10 text-gray-400 font-bold text-[10px] sm:text-xs uppercase tracking-widest">
              Papelera Vacía
            </div>
          ) : (
            items.map((item, idx) => (
              <div key={idx} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 flex justify-between items-center gap-3 sm:gap-4">
                <div className="flex-1 min-w-0">
                  <p className="font-black text-sm sm:text-base text-gray-900 truncate">{item.subject}</p>
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">
                    {item.isCustom ? (item.eventType === 'evento' ? 'Evento' : 'Materia Custom') : 'Clase Fija'} • {item.startTime || item.time.split(' - ')[0]}
                  </p>
                  <p className="text-[8px] sm:text-[9px] text-red-400 mt-0.5 sm:mt-1 font-bold">
                    Eliminado: {new Date(item.deletedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-1.5 sm:gap-2">
                  <button onClick={() => onRestore(item)} className="p-2 sm:p-2.5 bg-gray-50 text-blue-600 rounded-lg sm:rounded-xl hover:bg-blue-50 transition-colors" title="Restaurar">
                    <RotateCcw className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                  <button onClick={() => onPermDelete(item)} className="p-2 sm:p-2.5 bg-gray-50 text-red-500 rounded-lg sm:rounded-xl hover:bg-red-50 transition-colors" title="Eliminar Permanentemente">
                    <X className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {items.length > 0 && (
          <div className="p-4 sm:p-6 pt-0 bg-[#F2F2F7]">
            <button onClick={onEmpty} className="w-full py-3 sm:py-4 bg-red-100 text-red-600 rounded-[1rem] sm:rounded-[1.2rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-red-200 transition-colors shadow-sm active:scale-95 transition-transform">
              Vaciar Papelera
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function EventEditorModal({ data, onClose, onSave, onDelete }) {
  const [subject, setSubject] = useState(data.subject || '');
  const [formDate, setFormDate] = useState(data.formDate || '');
  const [startTime, setStartTime] = useState(data.startTime || '08:00');
  const [endTime, setEndTime] = useState(data.endTime || '09:30');
  const [room, setRoom] = useState(data.room || '');
  const [color, setColor] = useState(data.color || colors.cornerstone);
  
  const [eventType, setEventType] = useState(data.eventType || (data.isNew ? 'evento' : 'materia'));

  const handleSave = (e) => {
    e.preventDefault();
    onSave({ ...data, subject, formDate, startTime, endTime, room, color, eventType });
  };

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[150] p-4 sm:p-5 animate-in fade-in duration-300">
      <div className="bg-[#F2F2F7] w-full max-w-sm rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white flex flex-col">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white">
          <h3 className="font-black text-lg sm:text-xl uppercase tracking-tight">{data.isNew ? 'Añadir' : 'Editar'}</h3>
          <button onClick={onClose} className="p-2 sm:p-2.5 rounded-full bg-gray-50 text-gray-400 hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        
        <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-3 sm:space-y-4 overflow-y-auto max-h-[65vh]">
          {/* Selector Evento / Materia */}
          <div className="flex bg-gray-200/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full shadow-inner">
             <button type="button" onClick={() => setEventType('evento')} className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${eventType === 'evento' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Evento</button>
             <button type="button" onClick={() => setEventType('materia')} className={`flex-1 py-1.5 sm:py-2 text-[9px] sm:text-[10px] font-black uppercase tracking-widest rounded-lg sm:rounded-xl transition-all ${eventType === 'materia' ? 'bg-white shadow-md text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}>Materia</button>
          </div>

          <div>
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Nombre</label>
            <input required type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder={eventType === 'evento' ? "Ej: Ayudantía Cálculo" : "Ej: Cálculo II"} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Fecha</label>
            <input required type="date" value={formDate} onChange={(e) => setFormDate(e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div className="flex gap-3 sm:gap-4">
            <div className="flex-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Inicio</label>
              <input required type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex-1">
              <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Fin</label>
              <input required type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1">Ubicación</label>
            <input type="text" value={room} onChange={(e) => setRoom(e.target.value)} placeholder="Sala, Link, etc." className="w-full px-3 py-2.5 sm:px-4 sm:py-3 bg-white border border-gray-200 rounded-xl sm:rounded-2xl text-xs sm:text-sm font-bold shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
          <div>
            <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-1.5 sm:mb-2">Color de Etiqueta</label>
            <div className="flex gap-1.5 sm:gap-2 flex-wrap">
              {Object.values(colors).map((c, i) => (
                <div 
                  key={i} 
                  onClick={() => setColor(c)} 
                  className={`w-6 h-6 sm:w-8 sm:h-8 rounded-full cursor-pointer transition-transform ${color === c ? 'scale-110 shadow-md ring-2 ring-offset-2 ring-gray-800' : 'hover:scale-105 opacity-80'} ${c.split(' ')[0].replace('100', '500').replace('gray-100','gray-500')}`}
                />
              ))}
            </div>
          </div>
        </form>
        
        <div className="p-4 sm:p-6 pt-0 flex gap-2 sm:gap-3 mt-2 sm:mt-4 bg-[#F2F2F7]">
          {!data.isNew && (
            <button type="button" onClick={() => onDelete(data)} className="px-4 py-3 sm:px-5 sm:py-4 bg-red-100 text-red-600 rounded-[1rem] sm:rounded-[1.2rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest hover:bg-red-200 transition-colors shadow-sm">
              Eliminar
            </button>
          )}
          <button type="button" onClick={handleSave} className="flex-1 py-3 sm:py-4 bg-gray-900 text-white rounded-[1rem] sm:rounded-[1.2rem] font-black text-[9px] sm:text-[10px] uppercase tracking-widest shadow-md active:scale-95 transition-transform">
            Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

function DailyVerseModal({ onClose, verse }) {
  return (
    <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center z-[150] p-4 sm:p-5 animate-in zoom-in-95 duration-300">
      <div className="bg-[#F2F2F7] w-full max-w-sm rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white">
           <h3 className="font-black text-lg sm:text-xl uppercase flex items-center gap-2 sm:gap-3 text-rose-600"><Sparkles className="w-4 h-4 sm:w-5 sm:h-5 fill-current opacity-40" /> Inspiración</h3>
           <button onClick={onClose} className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-full hover:bg-gray-100 transition-colors"><X className="w-4 h-4" /></button>
        </div>
        <div className="p-6 sm:p-8 text-center bg-white m-4 sm:m-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden">
           <Quote className="w-8 h-8 sm:w-10 sm:h-10 text-rose-100 mx-auto mb-3 sm:mb-4 absolute top-3 left-3 sm:top-4 sm:left-4 opacity-50" />
           <p className="text-base sm:text-xl font-black text-gray-800 leading-snug mb-5 sm:mb-6 relative z-10">"{verse?.text}"</p>
           <div className="inline-block bg-rose-50 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl border border-rose-100 shadow-inner">
             <p className="text-[9px] sm:text-[10px] font-black text-rose-600 uppercase tracking-widest">{verse?.ref}</p>
           </div>
        </div>
        <div className="px-4 pb-4 sm:px-5 sm:pb-5">
          <button onClick={onClose} className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-md">Comenzar mi día</button>
        </div>
      </div>
    </div>
  );
}

function SubjectModal({ subject, initialTab, onClose, attendanceRecords, grades, exams, links, notes, addGrade, deleteGrade, addExam, deleteExam, addLink, deleteLink, saveNote, calculateGradesStats, recordAttendance }) {
  const [tab, setTab] = useState(initialTab);
  
  const [gradeName, setGradeName] = useState(''); const [gradeVal, setGradeVal] = useState(''); const [gradeWeight, setGradeWeight] = useState('');
  const [examTitle, setExamTitle] = useState(''); const [examDate, setExamDate] = useState('');
  const [linkTitle, setLinkTitle] = useState(''); const [linkUrl, setLinkUrl] = useState('');

  const subjectRecords = Object.entries(attendanceRecords)
    .filter(([id, status]) => id.includes(`_${subject}_`))
    .map(([id, status]) => {
      const [dateStr, subj, time] = id.split('_');
      return { id, dateStr, time, status };
    })
    .sort((a, b) => new Date(b.dateStr) - new Date(a.dateStr));

  const totalClasses = subjectRecords.length;
  const attendedClasses = subjectRecords.filter(r => r.status === 'present').length;
  const attendancePct = totalClasses === 0 ? 100 : Math.round((attendedClasses / totalClasses) * 100);

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[100] p-0 sm:p-4 animate-in fade-in duration-300">
      <div className="bg-[#F2F2F7] w-full max-w-md rounded-t-[2rem] sm:rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90vh] sm:h-[720px] border border-white animate-in slide-in-from-bottom-8">
        <div className="px-5 pt-5 pb-3 sm:px-8 sm:pt-8 sm:pb-4 flex justify-between items-start shrink-0">
          <div className="pr-4"><h3 className="font-black text-xl sm:text-2xl text-gray-900 tracking-tighter leading-none">{subject}</h3><p className="text-[9px] sm:text-[10px] text-blue-600 mt-1.5 sm:mt-2 font-black tracking-widest uppercase">Admin Ramo</p></div>
          <button onClick={onClose} className="p-2 sm:p-3 rounded-full bg-white hover:bg-gray-100 text-gray-400 shadow-sm transition-all"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button>
        </div>
        
        <div className="px-5 sm:px-8 pb-1 sm:pb-2 flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar shrink-0">
           {['attendance', 'grades', 'exams', 'links', 'notes'].map(t => (
             <button key={t} onClick={() => setTab(t)} className={`pb-2 sm:pb-3 text-[10px] sm:text-xs font-black uppercase tracking-widest border-b-[2px] sm:border-b-[3px] transition-all ${tab === t ? 'border-blue-600 text-gray-900' : 'border-transparent text-gray-400'}`}>
               {t === 'attendance' ? 'Asis' : t === 'grades' ? 'Notas' : t === 'exams' ? 'Exam' : t === 'links' ? 'Links' : 'Apuntes'}
             </button>
           ))}
        </div>
        
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {tab === 'attendance' && (
            <div className="space-y-3 sm:space-y-4">
              <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 shadow-sm text-center relative overflow-hidden">
                <div className={`absolute bottom-0 left-0 w-full h-1 sm:h-1.5 transition-all ${attendancePct < 75 ? 'bg-red-500' : 'bg-green-500'}`}></div>
                <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mb-1 sm:mb-2 tracking-widest">Asistencia Total</p>
                <p className={`text-5xl sm:text-6xl font-black tracking-tighter ${attendancePct < 75 ? 'text-red-500' : 'text-gray-900'}`}>{attendancePct}%</p>
              </div>
              
              <div className="space-y-2.5 sm:space-y-3 mt-4 sm:mt-5">
                <h4 className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase ml-1 tracking-widest">Historial de Clases</h4>
                {subjectRecords.map(record => (
                   <div key={record.id} className="bg-white p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.5rem] flex justify-between items-center shadow-sm border border-gray-100">
                     <div>
                        <p className="text-xs sm:text-sm font-bold text-gray-800">{record.dateStr}</p>
                        <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">{record.time}</p>
                     </div>
                     <button
                        onClick={() => recordAttendance(record.id, record.status === 'present' ? 'absent' : 'present')}
                        className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg sm:rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 ${record.status === 'present' ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'}`}
                     >
                        {record.status === 'present' ? 'Asistí' : 'Falté'}
                     </button>
                   </div>
                ))}
                {subjectRecords.length === 0 && <p className="text-center text-[10px] sm:text-xs font-bold text-gray-400 uppercase p-4 sm:p-6">Aún no hay registros guardados.</p>}
              </div>
            </div>
          )}

          {tab === 'grades' && (() => {
            const { avg, totalWeight, requiredToPass } = calculateGradesStats(subject);
            return (
              <div className="space-y-4 sm:space-y-5">
                <div className="bg-white p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2.5rem] border border-gray-200 shadow-sm">
                  <div className="flex justify-between items-center pb-3 sm:pb-4 border-b border-gray-100 mb-3 sm:mb-4">
                    <div>
                      <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Promedio</p>
                      <p className={`text-4xl sm:text-6xl font-black tracking-tighter mt-0.5 sm:mt-1 ${parseFloat(avg) < 4 ? 'text-red-500' : 'text-blue-600'}`}>{totalWeight > 0 ? avg : '--'}</p>
                    </div>
                    <div className="text-right uppercase">
                      <p className="text-[9px] sm:text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-1 rounded-lg border border-blue-100">{totalWeight}% listo</p>
                    </div>
                  </div>
                  {totalWeight > 0 && totalWeight < 100 && (
                    <p className="text-[10px] sm:text-[11px] font-bold text-gray-800 leading-relaxed px-1">Necesitas un <span className="text-blue-600 font-black">{requiredToPass > 7 ? 'Imposible' : requiredToPass < 1 ? '1.0' : requiredToPass.toFixed(1)}</span> en el resto del ramo para aprobar.</p>
                  )}
                </div>
                
                <div className="space-y-2.5 sm:space-y-3">
                  {(grades[subject] || []).map((g) => (
                    <div key={g.id} className="bg-white p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.8rem] flex justify-between items-center shadow-sm border border-gray-100">
                      <div className="flex flex-col"><span className="font-black text-xs sm:text-sm text-gray-900 tracking-tight">{g.name}</span><span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">{g.weight}%</span></div>
                      <div className="flex items-center gap-3 sm:gap-4"><span className={`text-xl sm:text-2xl font-black ${g.grade < 4 ? 'text-red-500' : 'text-gray-900'}`}>{g.grade.toFixed(1)}</span><button onClick={() => deleteGrade(subject, g.id)} className="p-1.5 sm:p-2 text-red-500 bg-red-50 rounded-lg sm:rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></button></div>
                    </div>
                  ))}
                </div>

                <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 space-y-3">
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase ml-1">Nueva Nota</p>
                  <div className="flex gap-2">
                    <input type="text" value={gradeName} onChange={e=>setGradeName(e.target.value)} placeholder="Ej: Certamen 1" className="flex-1 bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                    <input type="number" step="0.1" value={gradeVal} onChange={e=>setGradeVal(e.target.value)} placeholder="7.0" className="w-14 sm:w-16 bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                    <input type="number" value={gradeWeight} onChange={e=>setGradeWeight(e.target.value)} placeholder="%" className="w-14 sm:w-16 bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                  </div>
                  <button onClick={() => { addGrade(subject, gradeName, gradeVal, gradeWeight); setGradeName(''); setGradeVal(''); setGradeWeight(''); }} className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Guardar Nota</button>
                </div>
              </div>
            );
          })()}

          {tab === 'exams' && (
            <div className="space-y-4 sm:space-y-5">
               <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 space-y-3">
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase ml-1">Nuevo Examen</p>
                  <div className="flex gap-2">
                    <input type="text" value={examTitle} onChange={e=>setExamTitle(e.target.value)} placeholder="Ej: Solemne 1" className="flex-1 w-1/2 bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                    <input type="date" value={examDate} onChange={e=>setExamDate(e.target.value)} className="flex-1 w-1/2 bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                  </div>
                  <button onClick={() => { addExam(subject, examTitle, examDate); setExamTitle(''); setExamDate(''); }} className="w-full py-3 sm:py-4 mt-2 bg-blue-600 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Agendar Examen</button>
               </div>
               <div className="space-y-2.5 sm:space-y-3">
                  {(exams[subject] || []).map((e) => (
                    <div key={e.id} className="bg-white p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.8rem] flex justify-between items-center shadow-sm border border-gray-100">
                      <div className="flex flex-col"><span className="font-black text-xs sm:text-sm text-gray-900">{e.title}</span><span className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">{new Date(e.date).toLocaleDateString()}</span></div>
                      <button onClick={() => deleteExam(subject, e.id)} className="p-1.5 sm:p-2 text-red-500 bg-red-50 rounded-lg sm:rounded-xl hover:bg-red-100"><Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {tab === 'links' && (
            <div className="space-y-4 sm:space-y-5">
               <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-200 space-y-3">
                  <p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase ml-1">Añadir Enlace</p>
                  <input type="text" value={linkTitle} onChange={e=>setLinkTitle(e.target.value)} placeholder="Título (Ej: Drive)" className="w-full bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                  <input type="text" value={linkUrl} onChange={e=>setLinkUrl(e.target.value)} placeholder="URL (www...)" className="w-full bg-[#F2F2F7] p-2.5 sm:p-3 rounded-lg sm:rounded-xl text-[10px] sm:text-xs font-bold outline-none" />
                  <button onClick={() => { addLink(subject, linkTitle, linkUrl); setLinkTitle(''); setLinkUrl(''); }} className="w-full py-3 sm:py-4 bg-gray-900 text-white rounded-xl sm:rounded-2xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform">Guardar Link</button>
               </div>
               <div className="space-y-2.5 sm:space-y-3">
                  {(links[subject] || []).map((l) => (
                    <div key={l.id} className="bg-white p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.8rem] flex justify-between items-center shadow-sm border border-gray-100">
                      <a href={l.url} target="_blank" rel="noreferrer" className="flex items-center gap-2 sm:gap-3 overflow-hidden pr-2"><div className="p-1.5 sm:p-2 bg-blue-50 text-blue-600 rounded-lg shrink-0"><LinkIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" /></div><span className="font-black text-xs sm:text-sm text-gray-900 hover:text-blue-600 transition-colors truncate">{l.title}</span></a>
                      <button onClick={() => deleteLink(subject, l.id)} className="p-1.5 sm:p-2 text-red-500 hover:text-red-700 shrink-0"><Trash2 className="w-3.5 h-3.5 sm:w-4 h-4" /></button>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {tab === 'notes' && (
            <textarea autoFocus className="w-full h-80 sm:h-96 bg-white rounded-[1.5rem] sm:rounded-[2.5rem] p-5 sm:p-8 text-xs sm:text-sm leading-relaxed font-bold border border-gray-200 outline-none shadow-inner shadow-gray-100/50 text-gray-800 placeholder:text-gray-200" placeholder="Escribe tus apuntes aquí... se guardan solos en la nube." value={notes[subject] || ''} onChange={(e) => saveNote(subject, e.target.value)} />
          )}
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value, unit, color, bg, onClick }) {
  return (
    <div onClick={onClick} className="bg-white p-3 sm:p-4 rounded-[1.2rem] sm:rounded-[1.8rem] border border-gray-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] flex flex-col justify-between gap-2 sm:gap-3 cursor-pointer hover:shadow-md transition-all active:scale-95 group">
      <div className="flex items-center justify-between">
        <div className={`p-2 sm:p-2.5 ${bg} ${color} rounded-[0.9rem] sm:rounded-[1.1rem] transition-transform group-hover:scale-110`}>{icon}</div>
        <ChevronRightCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-200 group-hover:text-blue-500 transition-colors" />
      </div>
      <div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p><p className="text-lg sm:text-2xl font-black text-gray-900 mt-0.5">{value} {unit && <span className="text-[10px] sm:text-xs font-bold text-gray-400">{unit}</span>}</p></div>
    </div>
  );
}

function SubjectListModal({ onClose, subjects, onSelect }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[90] p-4 sm:p-5 animate-in fade-in duration-300">
      <div className="bg-[#F2F2F7] w-full max-w-sm rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col border border-white">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white"><h3 className="font-black text-lg sm:text-xl text-gray-900 uppercase tracking-tight">Materias</h3><button onClick={onClose} className="p-2 sm:p-2.5 rounded-full bg-gray-50 text-gray-400"><X className="w-4 h-4" /></button></div>
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-2 sm:space-y-3">
          {subjects.map((s, i) => (<div key={i} onClick={() => onSelect(s)} className="bg-white p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.5rem] shadow-sm hover:shadow-md cursor-pointer flex justify-between items-center transition-all active:scale-95 group"><span className="font-black text-xs sm:text-sm text-gray-900 leading-tight">{s}</span><ChevronRightCircle className="w-4 h-4 sm:w-5 sm:h-5 text-gray-200 group-hover:text-blue-500" /></div>))}
        </div>
      </div>
    </div>
  );
}

function AcademicLoadModal({ onClose, load, total }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[90] p-4 sm:p-5 animate-in fade-in">
      <div className="bg-[#F2F2F7] w-full max-w-md rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white"><div><h3 className="font-black text-lg sm:text-xl uppercase">Carga Semanal</h3><p className="text-[10px] sm:text-xs font-bold text-gray-400 mt-0.5 sm:mt-1">{total} HORAS TOTALES</p></div><button onClick={onClose} className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-full"><X className="w-4 h-4" /></button></div>
        <div className="p-4 sm:p-6 space-y-2.5 sm:space-y-3">
          {load.map((item, i) => (
            <div key={i} className="bg-white p-4 sm:p-5 rounded-[1.2rem] sm:rounded-[1.8rem] flex justify-between items-center border border-gray-100 shadow-sm gap-3 sm:gap-4">
              <span className="font-semibold text-xs sm:text-sm text-gray-700 truncate" title={item.subject}>{item.subject}</span>
              <span className="text-[9px] sm:text-[10px] font-bold text-emerald-700 bg-emerald-100 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-full uppercase tracking-widest shrink-0">
                {Math.floor(item.mins/60)}H {item.mins%60}M
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// Gráfico Lineal Acumulativo (SVG) para Asistencia
function GlobalAttendanceModal({ onClose, pct, period, setPeriod, weekData, monthData }) {
  const data = period === 'week' ? weekData : monthData;
  const paddingX = 20;
  const paddingY = 20;
  const width = 300;
  const height = 120;

  const points = data.map((d, i) => {
    const x = data.length > 1 ? paddingX + (i * ((width - 2 * paddingX) / (data.length - 1))) : width / 2;
    const y = height - paddingY - (d.pct / 100 * (height - 2 * paddingY));
    return { x, y, pct: d.pct, label: d.label };
  });

  const pathString = points.map(p => `${p.x},${p.y}`).join(' ');

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-end sm:items-center justify-center z-[90] p-0 sm:p-5 animate-in fade-in">
      <div className="bg-[#F2F2F7] w-full max-w-md rounded-t-[2rem] sm:rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white animate-in slide-in-from-bottom-10">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white"><h3 className="font-black text-lg sm:text-xl uppercase">Asistencia</h3><button onClick={onClose} className="p-2 sm:p-3 bg-gray-50 text-gray-400 rounded-full"><X className="w-4 h-4 sm:w-5 sm:h-5" /></button></div>
        <div className="p-4 sm:p-6">
          <div className="flex bg-gray-200/60 p-1 sm:p-1.5 rounded-xl sm:rounded-2xl w-full mb-4 sm:mb-6 shadow-inner">
            {['week', 'month'].map(p => (<button key={p} onClick={() => setPeriod(p)} className={`flex-1 py-1.5 sm:py-2 text-[10px] sm:text-xs font-black uppercase rounded-lg sm:rounded-xl transition-all ${period === p ? 'bg-white shadow-md text-gray-900' : 'text-gray-500'}`}>{p === 'week' ? 'Semana' : 'Mes'}</button>))}
          </div>
          
          <div className="bg-white p-5 sm:p-7 rounded-[1.5rem] sm:rounded-[2.5rem] shadow-sm mb-4 sm:mb-6 border border-gray-200/50 relative overflow-hidden">
             <svg viewBox={`0 0 ${width} ${height + 20}`} className="w-full h-auto overflow-visible">
               <defs>
                 <linearGradient id="gradientLine" x1="0" y1="0" x2="0" y2="1">
                   <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.2" />
                   <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                 </linearGradient>
               </defs>
               {[0, 50, 100].map((val) => {
                 const yPos = height - paddingY - (val / 100 * (height - 2 * paddingY));
                 return (
                   <line key={val} x1="0" y1={yPos} x2={width} y2={yPos} stroke="#f3f4f6" strokeWidth="2" strokeDasharray="4 4" />
                 );
               })}

               {points.length > 1 && (
                 <polygon points={`${paddingX},${height} ${pathString} ${width-paddingX},${height}`} fill="url(#gradientLine)" />
               )}

               {points.length > 1 && (
                 <polyline points={pathString} fill="none" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
               )}

               {points.map((p, i) => (
                 <g key={i}>
                   <circle cx={p.x} cy={p.y} r="5" fill="#fff" stroke="#3b82f6" strokeWidth="3" />
                   <text x={p.x} y={height + 15} fontSize="9" fontWeight="900" fill="#9ca3af" textAnchor="middle">{p.label.toUpperCase()}</text>
                   <text x={p.x} y={p.y - 12} fontSize="9" fontWeight="900" fill="#3b82f6" textAnchor="middle">{Math.round(p.pct)}%</text>
                 </g>
               ))}
             </svg>
          </div>

          <div className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-200 flex items-center justify-between"><div><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest">Global</p><p className={`text-3xl sm:text-4xl font-black mt-0.5 sm:mt-1 ${pct < 75 ? 'text-red-500' : 'text-green-500'}`}>{pct}%</p></div><span className="text-[9px] sm:text-[10px] font-black text-gray-400 bg-gray-50 border border-gray-100 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-lg sm:rounded-xl uppercase">Meta: 75%</span></div>
        </div>
      </div>
    </div>
  );
}

function TrophiesModal({ onClose, currentTime, semesterStart, semesterEnd }) {
  const totalWeeks = 20; 
  const passedWeeks = Math.max(0, Math.floor((currentTime.getTime() - semesterStart.getTime()) / (1000 * 60 * 60 * 24 * 7)));
  const isSemesterFinished = currentTime.getTime() > semesterEnd.getTime();

  const weeksGrid = Array.from({length: totalWeeks}).map((_, i) => {
    const isEarned = i < passedWeeks;
    return (
      <div key={i} className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl border transition-all ${isEarned ? 'bg-amber-50 border-amber-200 shadow-sm' : 'bg-gray-50 border-gray-100 opacity-60'}`}>
        <Trophy className={`w-5 h-5 sm:w-6 sm:h-6 ${isEarned ? 'text-amber-500 fill-amber-500 drop-shadow-md' : 'text-gray-300'}`} />
        <span className={`text-[8px] sm:text-[9px] font-black mt-1.5 sm:mt-2 uppercase tracking-widest ${isEarned ? 'text-amber-700' : 'text-gray-400'}`}>Sem {i+1}</span>
      </div>
    );
  });

  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 sm:p-5 animate-in zoom-in-95">
      <div className="bg-[#F2F2F7] w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white"><h3 className="font-black text-lg sm:text-xl uppercase">Vitrina de Logros</h3><button onClick={onClose} className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-full"><X className="w-4 h-4" /></button></div>
        
        <div className="p-4 sm:p-6 max-h-[70vh] overflow-y-auto">
          <div className={`p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border shadow-sm flex items-center gap-3 sm:gap-5 transition-all mb-4 sm:mb-6 ${isSemesterFinished ? 'bg-gradient-to-r from-yellow-400 to-amber-500 border-yellow-300' : 'bg-white border-gray-100'}`}>
            <div className={`p-3 sm:p-4 rounded-xl sm:rounded-2xl ${isSemesterFinished ? 'bg-white/20 backdrop-blur-sm' : 'bg-gray-50'}`}>
              <Trophy className={`w-8 h-8 sm:w-10 sm:h-10 ${isSemesterFinished ? 'text-white fill-white' : 'text-gray-300'}`} />
            </div>
            <div className="flex-1">
              <p className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest ${isSemesterFinished ? 'text-yellow-100' : 'text-gray-400'}`}>Trofeo Maestro</p>
              <p className={`text-base sm:text-xl font-black mt-0.5 sm:mt-1 ${isSemesterFinished ? 'text-white' : 'text-gray-900'}`}>{isSemesterFinished ? '¡Semestre Completado!' : 'Termina el semestre'}</p>
            </div>
          </div>

          <div className="bg-white p-4 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] border border-gray-100 shadow-sm">
            <div className="flex justify-between items-center mb-4 sm:mb-5">
              <h4 className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-gray-800">Trofeos Semanales</h4>
              <span className="text-[9px] sm:text-[10px] font-black bg-amber-100 text-amber-700 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg">{passedWeeks} / {totalWeeks} Obtenidos</span>
            </div>
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-2 sm:gap-3">
              {weeksGrid}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SettingsModal({ onClose, syncKey, cloudStatus, tempSyncKey, setTempSyncKey, onApply, onExport, onImport, fileRef, db }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 sm:p-5 animate-in fade-in">
      <div className="bg-[#F2F2F7] w-full max-w-sm rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white animate-in zoom-in-95">
        <div className="px-5 py-5 sm:px-8 sm:py-7 border-b border-gray-200 flex justify-between items-center bg-white"><h3 className="font-black text-lg sm:text-xl uppercase">Ajustes</h3><button onClick={onClose} className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-full"><X className="w-4 h-4" /></button></div>
        <div className="p-5 sm:p-7 space-y-4 sm:space-y-6">
          <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-200/50">
            <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-5 pb-4 sm:pb-5 border-b border-gray-50"><div className="p-2.5 sm:p-3 rounded-xl sm:rounded-2xl bg-[#F2F2F7] border border-gray-200 shadow-inner">{cloudStatus === 'synced' ? <Cloud className="text-green-500 w-5 h-5 sm:w-6 sm:h-6" /> : <CloudOff className="text-gray-300 w-5 h-5 sm:w-6 sm:h-6" />}</div><div><p className="font-black text-xs sm:text-sm uppercase">Sincronización</p><p className="text-[9px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-0.5 sm:mt-1">{cloudStatus === 'synced' ? 'Conectado' : 'Sin Conexión'}</p></div></div>
            {db && (<div><label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 sm:mb-2 block ml-1">Clave de Enlace</label><div className="flex gap-2"><input type="text" placeholder="Tu clave..." value={tempSyncKey} onChange={(e) => setTempSyncKey(e.target.value)} className="flex-1 px-3 py-2 sm:px-4 sm:py-3 text-[10px] sm:text-xs font-black rounded-lg sm:rounded-xl bg-[#F2F2F7] text-gray-900 outline-none border border-transparent focus:bg-white focus:ring-2 focus:ring-blue-500 shadow-inner" /><button onClick={onApply} className="px-3 py-2 sm:px-4 sm:py-3 bg-gray-900 text-white text-[9px] sm:text-[10px] font-black uppercase rounded-lg sm:rounded-xl shadow-md active:scale-90 tracking-widest">OK</button></div><p className="mt-2.5 sm:mt-3 text-[8px] sm:text-[9px] font-black text-blue-600 bg-blue-50 py-1.5 sm:py-2 rounded-lg text-center uppercase tracking-widest border border-blue-100">Actual: {syncKey}</p></div>)}
          </div>
          <div className="space-y-2 sm:space-y-2.5"><button onClick={onExport} className="w-full py-3 sm:py-4 bg-white border border-gray-200 text-gray-900 rounded-[1rem] sm:rounded-[1.2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all">Exportar Datos</button><input type="file" accept=".json" ref={fileRef} onChange={onImport} className="hidden" /><button onClick={() => fileRef.current?.click()} className="w-full py-3 sm:py-4 bg-white border border-gray-200 text-gray-900 rounded-[1rem] sm:rounded-[1.2rem] font-black text-[10px] sm:text-xs uppercase tracking-widest shadow-sm active:scale-95 transition-all">Importar Datos</button></div>
        </div>
      </div>
    </div>
  );
}

function PendingModal({ onClose, classes, onAction, names, days }) {
  return (
    <div className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm flex items-center justify-center z-[110] p-4 sm:p-5 animate-in zoom-in-95">
      <div className="bg-[#F2F2F7] w-full max-w-lg rounded-[2rem] sm:rounded-[3rem] shadow-2xl overflow-hidden border border-white">
        <div className="px-5 py-5 sm:px-8 sm:py-7 bg-white border-b border-gray-200 flex justify-between items-center"><div className="flex items-center gap-3 sm:gap-4"><div className="p-2 sm:p-3 bg-red-500 text-white rounded-xl sm:rounded-2xl"><ListTodo className="w-5 h-5 sm:w-6 sm:h-6" /></div><div><h3 className="font-black text-lg sm:text-xl tracking-tight uppercase">Pasar Lista</h3><p className="text-[10px] sm:text-xs font-bold text-red-600 uppercase tracking-widest">Pendientes: {classes.length}</p></div></div><button onClick={onClose} className="p-2 sm:p-2.5 bg-gray-50 text-gray-400 rounded-full"><X className="w-4 h-4" /></button></div>
        <div className="p-4 sm:p-6 max-h-[60vh] overflow-y-auto space-y-3 sm:space-y-4">{classes.map((p) => (<div key={p.id} className="bg-white p-4 sm:p-5 rounded-[1.5rem] sm:rounded-[2rem] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-3 sm:gap-4"><div><p className="font-black text-sm sm:text-base text-gray-900 tracking-tight leading-none">{p.subject}</p><p className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase mt-1.5 sm:mt-2 tracking-widest">{days[p.dateObj.getDay()]} {p.dateObj.getDate()} {names[p.dateObj.getMonth()].substring(0,3)} • {p.time}</p></div><div className="flex gap-2 w-full sm:w-auto"><button onClick={() => onAction(p.id, 'absent')} className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 bg-red-50 text-red-700 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest border border-red-100 active:scale-90 transition-all">Falté</button><button onClick={() => onAction(p.id, 'present')} className="flex-1 px-4 py-2.5 sm:px-5 sm:py-3 bg-green-50 text-green-700 rounded-xl sm:rounded-2xl font-black text-[9px] sm:text-[10px] uppercase tracking-widest border border-green-100 active:scale-90 transition-all">Asistí</button></div></div>))}</div>
      </div>
    </div>
  );
}