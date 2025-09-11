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
  Checkbox,
  FormControlLabel,
  FormGroup,
  Select,
  MenuItem,
  Stack,
  Typography,
  Box,
} from "@mui/material";

import { collection, doc, setDoc, getDoc, deleteDoc, getDocs } from "firebase/firestore";
import { db } from "@/firebase/firebaseConfig";

// Lista de bairros fixos
const BAIRROS = ["Centro", "Jardim América", "Vila Nova", "Industrial", "Boa Vista"];

type ColetaData = {
  bairros: string[];
  turno: string;
};

export function ColetasCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [selectedBairros, setSelectedBairros] = useState<string[]>([]);
  const [turno, setTurno] = useState("manha");

  // Carregar eventos existentes do Firestore
  useEffect(() => {
    const fetchEvents = async () => {
      const querySnapshot = await getDocs(collection(db, "coletas"));
      const loadedEvents: any[] = [];
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data() as ColetaData;
        loadedEvents.push({
          title: `${(data.bairros || []).join(", ")} - ${data.turno}`,
          start: docSnap.id,
        });
      });
      setEvents(loadedEvents);
    };
    fetchEvents();
  }, []);

  // Clique em uma data do calendário
  const handleDateClick = async (arg: any) => {
    const date = arg.dateStr;
    setSelectedDate(date);

    const docRef = doc(collection(db, "coletas"), date);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
      const data = snapshot.data() as ColetaData;
      setSelectedBairros(data.bairros);
      setTurno(data.turno);
    } else {
      setSelectedBairros([]);
      setTurno("manha");
    }

    setOpen(true);
  };

  // Salvar evento
  const handleSave = async () => {
    if (!selectedDate) return;
    const docRef = doc(collection(db, "coletas"), selectedDate);
    await setDoc(docRef, { bairros: selectedBairros, turno });

    setEvents((prev) => [
      ...prev.filter((e) => e.start !== selectedDate),
      { title: `${selectedBairros.join(", ")} - ${turno}`, start: selectedDate },
    ]);

    setOpen(false);
  };

  // Apagar evento
  const handleDelete = async () => {
    if (!selectedDate) return;
    const docRef = doc(collection(db, "coletas"), selectedDate);
    await deleteDoc(docRef);

    setEvents((prev) => prev.filter((e) => e.start !== selectedDate));

    setSelectedBairros([]);
    setTurno("manha");
    setOpen(false);
  };

  const toggleBairro = (bairro: string) => {
    setSelectedBairros((prev) =>
      prev.includes(bairro) ? prev.filter((b) => b !== bairro) : [...prev, bairro]
    );
  };

  return (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Calendário de Coletas
      </Typography>

      {/* Calendário sempre visível */}
      <FullCalendar
        plugins={[dayGridPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        events={events}
        dateClick={handleDateClick}
        height="auto"
      />

      {/* Modal para criar/visualizar evento */}
      <Dialog open={open} onClose={() => setOpen(false)} fullWidth>
        <DialogTitle>
          {selectedDate} - Configuração de Coleta
        </DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1">Bairros</Typography>
          <FormGroup>
            {BAIRROS.map((bairro) => (
              <FormControlLabel
                key={bairro}
                control={
                  <Checkbox
                    checked={selectedBairros.includes(bairro)}
                    onChange={() => toggleBairro(bairro)}
                  />
                }
                label={bairro}
              />
            ))}
          </FormGroup>

          <Typography variant="subtitle1" sx={{ mt: 2 }}>
            Turno
          </Typography>
          <Select fullWidth value={turno} onChange={(e) => setTurno(e.target.value)}>
            <MenuItem value="manha">manha</MenuItem>
            <MenuItem value="tarde">Tarde</MenuItem>
          </Select>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDelete} color="error">
            Apagar
          </Button>
          <Button onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handleSave} variant="contained" color="primary">
            Salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}