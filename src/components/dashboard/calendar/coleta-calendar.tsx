'use client';

import { useState, useEffect } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Grid,
  Paper,
  Select,
  MenuItem,
  FormControl,
} from "@mui/material";

import {
  collection,
  doc,
  setDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
} from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

// Lista fixa de bairros
const BAIRROS = [
  "Centro",
  "Jardim América",
  "Vila Nova",
  "Industrial",
  "Boa Vista",
];

interface BairroSelecionado {
  bairro: string;
  turno: "Manhã" | "Tarde";
}

export function ColetasCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  // Modal para criar/editar evento
  const [modalNovoEventoOpen, setModalNovoEventoOpen] = useState(false);

  // Modal para visualizar evento existente
  const [modalEventoExistenteOpen, setModalEventoExistenteOpen] = useState(false);

  const [bairrosSelecionados, setBairrosSelecionados] = useState<BairroSelecionado[]>([]);
  const [eventData, setEventData] = useState<any | null>(null);

  // Carregar eventos em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "coletas"), (snapshot) => {
      const loadedEvents: any[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        loadedEvents.push({
          id: docSnap.id,
          title: `Coleta em ${data.bairros.length} bairros`,
          start: docSnap.id,
          extendedProps: { bairros: data.bairros },
        });
      });
      setEvents(loadedEvents);
    });
    return () => unsubscribe();
  }, []);

  // Clique em uma data
  const handleDateClick = async (arg: any) => {
    const date = arg.dateStr;
    setSelectedDate(date);

    const docRef = doc(collection(db, "coletas"), date);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      // Se já existe coleta → abrir modal de evento existente
      setEventData({ id: date, ...snapshot.data() });
      setModalEventoExistenteOpen(true);
    } else {
      // Se não existe coleta → abrir modal para criar novo
      setBairrosSelecionados([]);
      setModalNovoEventoOpen(true);
    }
  };

  // Seleção/deseleção de bairro
  const handleTurnoChange = (bairro: string, turno: "Manhã" | "Tarde") => {
    setBairrosSelecionados((prev) => {
      const exists = prev.find((b) => b.bairro === bairro);
      if (!exists) {
        return [...prev, { bairro, turno }];
      } else if (exists.turno === turno) {
        return prev.filter((b) => b.bairro !== bairro);
      } else {
        return prev.map((b) =>
          b.bairro === bairro ? { ...b, turno } : b
        );
      }
    });
  };

  const getTurnoDoBairro = (bairro: string) => {
    const b = bairrosSelecionados.find((b) => b.bairro === bairro);
    return b ? b.turno : "";
  };

  // Salvar no Firestore
  const handleSave = async () => {
    if (!selectedDate) return;
    if (bairrosSelecionados.length === 0) {
      alert("Selecione pelo menos um bairro e turno.");
      return;
    }
    await setDoc(doc(db, "coletas", selectedDate), { bairros: bairrosSelecionados });
    setModalNovoEventoOpen(false);
  };

  // Excluir evento
  const handleDelete = async () => {
    if (!eventData) return;
    await deleteDoc(doc(db, "coletas", eventData.id));
    setModalEventoExistenteOpen(false);
  };

  // Editar evento → abre modal de criação preenchido
  const handleEdit = () => {
    if (!eventData) return;
    setBairrosSelecionados(eventData.bairros || []);
    setModalEventoExistenteOpen(false);
    setModalNovoEventoOpen(true);
  };

  const handleEventClick = async (arg: any) => {
  const date = arg.event.startStr;
  setSelectedDate(date);

  const docRef = doc(collection(db, "coletas"), date);
  const snapshot = await getDoc(docRef);

  if (snapshot.exists()) {
    const data = snapshot.data() as { bairros: BairroSelecionado[] };
    setBairrosSelecionados(data.bairros || []);
  } else {
    setBairrosSelecionados([]);
  }

  setModalEventoExistenteOpen(true);
};

  return (
    <div>
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        eventClick={handleEventClick}
        height="auto"
        locale="pt"
      />

      {/* Modal de novo evento */}
      <Dialog open={modalNovoEventoOpen} onClose={() => setModalNovoEventoOpen(false)} fullWidth maxWidth="md">
        <DialogTitle>Configurar Coleta</DialogTitle>
        <DialogContent>
          <Grid container spacing={2}> {/* AQUI ESTÁ A CORREÇÃO: ADICIONANDO 'container' */}
            {BAIRROS.map((bairro) => {
              const turnoAtual = getTurnoDoBairro(bairro);
              return (
                <Grid size={{xs:12, md:4 }} key={bairro}>
                  <Paper
                    sx={{
                      cursor: "pointer",
                      minHeight: 120,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      p: 2,
                      border: turnoAtual ? "2px solid #4caf50" : "2px solid #ccc",
                      backgroundColor: turnoAtual ? "#e8f5e9" : "#fff",
                    }}
                  >
                    <Typography variant="body1" sx={{ mb: 1 }}>
                      {bairro}
                    </Typography>
                    <FormControl fullWidth size="small">
                      <Select
                        value={turnoAtual}
                        displayEmpty
                        onChange={(e) => handleTurnoChange(bairro, e.target.value as "Manhã" | "Tarde")}
                        renderValue={(selected) => (selected ? selected : "Selecione turno")}
                      >
                        <MenuItem value="Manhã">Manhã</MenuItem>
                        <MenuItem value="Tarde">Tarde</MenuItem>
                      </Select>
                    </FormControl>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setModalNovoEventoOpen(false)} color="inherit">Cancelar</Button>
          <Button variant="contained" onClick={handleSave} color="success">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal de evento existente */}
      <Dialog open={modalEventoExistenteOpen} onClose={() => setModalEventoExistenteOpen(false)} fullWidth>
        <DialogTitle>Evento existente - {eventData?.id}</DialogTitle>
        <DialogContent>
          {eventData?.bairros?.map((b: any, idx: number) => (
            <Typography key={idx}>
              {b.bairro} - {b.turno}
            </Typography>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleEdit}>Editar bairros</Button>
          <Button onClick={handleDelete} color="error">
            Apagar evento
          </Button>
          <Button onClick={() => setModalEventoExistenteOpen(false)}>Sair</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}